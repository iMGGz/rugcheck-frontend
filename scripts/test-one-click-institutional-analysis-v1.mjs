import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { buildV2Fixture } from './fixtures/premium-asset-v2-fixtures.mjs'

const root = process.cwd()
const contract = Object.freeze({
  contractId: 'oneClickInstitutionalAnalysisV1', schemaVersion: 'one-click-institutional-analysis-v1', generatedAt: '2026-08-07T00:00:00.000Z',
  identity: { canonicalEntityId: 'cg:ethereum', name: 'Ethereum', symbol: 'ETH' },
  family: { canonicalFamily: 'native_eth_pos_gas_l2_fee_market', displayLabel: 'Native ETH PoS gas and settlement', playbookId: 'playbook_native_eth_pos' },
  investabilityVerdict: 'INSUFFICIENT_DATA', investmentCase: 'Ethereum has a family-specific settlement thesis, but the institutional score and verdict remain withheld pending fresh activation evidence.',
  individualAnalysisActivationDecision: 'WITHHELD', cohortRankingActivationDecision: 'WITHHELD', fundamentalQuality: null, riskSeverity: null, technicalOpportunity: null,
  strengths: [{ itemId: 's1', statement: 'Canonical gas and settlement mechanism observations are attached.' }],
  whatHoldsItBack: [{ itemId: 'h1', statement: 'Fresh fee, validator, and L2 contribution data remain incomplete.' }],
  keyRisks: [{ itemId: 'r1', statement: 'Validator and fee-market durability remain material risks.' }],
  falsifiers: [{ falsifierId: 'f1', condition: 'Sustained fee demand materially deteriorates.', state: 'untestable_with_current_data' }],
  fundamentalQuestions: [], missingData: ['Fresh fee data'], criticalMissingData: ['Fresh fee data'], calculations: [], sources: [],
  technicalAnalysis: { state: 'neutral', metrics: [], limitations: ['Technical state is separate from Fundamental Quality and cannot improve the investability verdict.'] },
  dataConfidence: { score: 58, state: 'medium' }, internalAudit: { providerUtilization: [], directProviderPayloadUsed: false, frontendAnalyticalAuthority: false, missingConvertedToNegative: false, providerFailurePenalized: false, tokenSpecificRuntimeBranchCount: 0, snapshotsEnabled: false, partialRefreshEnabled: false },
})

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
try {
  const normalizer = await server.ssrLoadModule('/src/v2/oneClickInstitutionalAnalysisV1.js')
  const { default: CommandCenter } = await server.ssrLoadModule('/src/v2/components/V2AssetDecisionCommandCenter.jsx')
  const researchUtils = await server.ssrLoadModule('/src/components/research/researchUtils.js')
  const payload = { oneClickInstitutionalAnalysisV1: contract, analysis: { oneClickInstitutionalAnalysisV1: contract } }
  const normalized = normalizer.normalizeOneClickInstitutionalAnalysisV1(payload, { required: true })
  assert.equal(normalized.parityStatus, 'root_analysis_matched')
  assert.equal(Object.isFrozen(normalized.result), true)
  assert.equal(normalizer.normalizeOneClickInstitutionalAnalysisV1({}).result, null)
  assert.throws(() => normalizer.normalizeOneClickInstitutionalAnalysisV1({ oneClickInstitutionalAnalysisV1: contract, analysis: { oneClickInstitutionalAnalysisV1: { ...contract, investabilityVerdict: 'INVESTABLE' } } }), /diverge/)

  const asset = buildV2Fixture('ETH')
  const html = renderToString(React.createElement(CommandCenter, { result: asset, oneClickInstitutionalAnalysisV1: contract, activeSection: 'overview', onSelectSection: () => {} }))
  assert.match(html, /One-click institutional analysis/)
  assert.match(html, /INSUFFICIENT DATA/i)
  assert.match(html, /Fundamental quality/)
  assert.match(html, /Withheld/)
  assert.doesNotMatch(html, /Existing score policy/)
  assert.doesNotMatch(html, />72</)
  assert.doesNotMatch(html, /undefined|NaN|Infinity|\[object Object\]/)
  const missingHtml = renderToString(React.createElement(CommandCenter, { result: asset, oneClickInstitutionalAnalysisV1: null, activeSection: 'overview', onSelectSection: () => {} }))
  assert.match(missingHtml, /Institutional analysis unavailable/)

  const data = { assetResearchResultV2: asset, oneClickInstitutionalAnalysisV1: contract, analysis: { assetResearchResultV2: asset, oneClickInstitutionalAnalysisV1: contract } }
  const bundle = researchUtils.buildReviewBundleText({ asset: { symbol: 'ETH', name: 'Ethereum' }, data, analysis: data.analysis, model: { oneClickInstitutionalAnalysisV1: contract } })
  assert.equal((bundle.match(/One-Click Institutional Analysis Engine v1/g) || []).length, 1)
  assert.match(bundle, /Contract attached: yes/)
  assert.match(bundle, /Individual analysis activation: WITHHELD/)
  const protectedReport = researchUtils.buildProtectedInvestorReportText({ asset: { symbol: 'ETH', name: 'Ethereum' }, data, analysis: data.analysis, model: { oneClickInstitutionalAnalysisV1: contract } })
  assert.match(protectedReport, /One-Click Institutional Analysis/)
  assert.match(protectedReport, /Fundamental Quality: Withheld/)
  assert.doesNotMatch(protectedReport, /internalAudit|providerUtilization|tokenSpecificRuntimeBranchCount|immutableHash/)

  const normalizerSource = readFileSync(join(root, 'src', 'v2', 'oneClickInstitutionalAnalysisV1.js'), 'utf8')
  const componentSource = readFileSync(join(root, 'src', 'v2', 'components', 'V2AssetDecisionCommandCenter.jsx'), 'utf8')
  assert.doesNotMatch(`${normalizerSource}\n${componentSource}`, /Math\.(?:min|max|round|floor|ceil|exp|log|pow)/)
  assert.doesNotMatch(`${normalizerSource}\n${componentSource}`, /(?:symbol|assetSymbol)\s*===?\s*['"][A-Z0-9]+['"]/)
  console.log('PASS one-click institutional analysis frontend normalization, rendering, bundle, and protected-report parity')
} finally {
  await server.close()
}
