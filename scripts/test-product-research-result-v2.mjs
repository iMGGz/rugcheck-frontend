import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/v2/productResearchResultV2.js', import.meta.url), 'utf8')
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const { normalizeProductResearchResultV2, ProductResearchResultV2ContractError } = await import(moduleUrl)

const contract = {
  schemaVersion: '2.0.0',
  artifactVersion: 'product-research-result-v2-v1',
  contractId: 'productResearchResultV2',
  resultId: 'fixture-result',
  analysisJob: {}, identityAndRelationships: {}, lifecycle: {}, coverage: {}, dataConfidence: {},
  futureScoringReadiness: {}, futureRankingReadiness: {}, sourceAndLineageSummary: {},
  customerPresentation: { institutionalQuestions: [] }, internalDiagnostics: {}, guardrails: {},
  observationSelection: [], productFactLedger: [], institutionalQuestionResults: [], moduleReadiness: [],
  formulaInputReadiness: [], eligibilityReadiness: [], contradictions: [], missingEvidence: [], blockedClaims: [], whatWouldChange: [],
}

const matched = normalizeProductResearchResultV2({ productResearchResultV2: contract, analysis: { productResearchResultV2: contract } })
assert.equal(matched.result, contract)
assert.equal(matched.customerPresentation, contract.customerPresentation)
assert.equal(matched.parityStatus, 'matched')
assert.equal(Object.isFrozen(matched.result), true)

const rootOnly = normalizeProductResearchResultV2({ productResearchResultV2: structuredClone(contract) })
assert.equal(rootOnly.parityStatus, 'root_only')

const nestedOnly = normalizeProductResearchResultV2({ analysis: { productResearchResultV2: structuredClone(contract) } })
assert.equal(nestedOnly.parityStatus, 'analysis_fallback')

const missing = normalizeProductResearchResultV2({ analysis: {} })
assert.equal(missing.result, null)
assert.equal(missing.parityStatus, 'compatibility_fallback')

assert.throws(
  () => normalizeProductResearchResultV2({ productResearchResultV2: contract, analysis: { productResearchResultV2: { ...contract, resultId: 'foreign' } } }),
  (error) => error instanceof ProductResearchResultV2ContractError && error.code === 'root_analysis_divergence',
)
assert.throws(
  () => normalizeProductResearchResultV2({ productResearchResultV2: { ...contract, customerPresentation: null } }),
  (error) => error instanceof ProductResearchResultV2ContractError && error.code === 'malformed_product_research_result_v2',
)
assert.throws(
  () => normalizeProductResearchResultV2({}, { requireContract: true }),
  (error) => error instanceof ProductResearchResultV2ContractError && error.code === 'missing_product_research_result_v2',
)

for (const forbidden of ['calculate', 'score =', 'rank =', 'inferQuestion', 'resolveContradiction']) {
  assert.equal(source.includes(forbidden), false, `frontend authority leak: ${forbidden}`)
}

const researchUtils = readFileSync(new URL('../src/components/research/researchUtils.js', import.meta.url), 'utf8')
const premiumPage = readFileSync(new URL('../src/v2/PremiumAssetPageV2.jsx', import.meta.url), 'utf8')
const productSummary = readFileSync(new URL('../src/v2/components/V2ProductResearchSummary.jsx', import.meta.url), 'utf8')
const copySectionTitle = 'ProductResearchResultV2 — Institutional Product Analysis Contract v1'

assert.equal((researchUtils.match(new RegExp(copySectionTitle, 'g')) || []).length, 1)
assert.match(researchUtils, /bundleProductResearchNormalization\.parityStatus/)
assert.match(researchUtils, /buildProtectedInvestorReportText/)
assert.match(researchUtils, /productResearchCustomer/)
assert.match(premiumPage, /normalizeProductResearchResultV2/)
assert.match(premiumPage, /productResearchResultV2=/)
assert.match(productSummary, /customerPresentation/)
assert.doesNotMatch(productSummary, /productFactLedger|internalDiagnostics|immutableHash|supportingObservationIds/)
assert.doesNotMatch(productSummary, /String\(fact\.value\)/)
assert.match(productSummary, /Structured value available/)

console.log('PASS ProductResearchResultV2 frontend normalization, V2 surface, export parity, and fallback safety')
