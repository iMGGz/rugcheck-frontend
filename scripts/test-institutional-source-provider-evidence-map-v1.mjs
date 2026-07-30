import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

const root = process.cwd()
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

function contract() {
  return {
    schemaVersion: '1.0.0',
    contractId: 'institutionalSourceProviderEvidenceMap',
    generatedAt: 'deterministic',
    constitutionVersion: '1.0.0',
    activationState: {
      diagnosticOnly: true,
      reportOnly: true,
      providerCallsActive: false,
      scoringActive: false,
      rankingActive: false,
      evidencePromotionActive: false,
      runtimeAiActive: false,
    },
    observationMappings: [
      { observationType: 'legal_claim', currentAvailability: 'manual_document_only' },
      { observationType: 'market_price', currentAvailability: 'available_currently' },
    ],
    formulaInputCoverage: [
      { formulaId: 'coverage_ratio', computableCurrentState: 'computable_with_current_limits' },
      { formulaId: 'legal_claim_gate', computableCurrentState: 'blocked_by_legal_evidence' },
    ],
    eligibilityGateMappings: [{ gateId: 'canonical_identity_confirmed' }],
    sourceClasses: [{ sourceClassId: 'legal_regulatory_prospectus' }],
    providers: [{ providerId: 'official_issuer_docs' }, { providerId: 'coingecko' }],
    freshnessPolicies: [{ freshnessPolicyId: 'freshness_price' }],
    contradictionPolicies: [{ contradictionPolicyId: 'contradiction_legal_rights' }],
    fallbackPolicies: [{ fallbackPolicyId: 'fallback_official_api_to_document' }],
    blockedObservations: [
      { blockerType: 'legal_document_missing', blockerDescription: 'Legal terms required.' },
      { blockerType: 'licensing_unknown', blockerDescription: 'Licensing review required.' },
      { blockerType: 'identity_unresolved', blockerDescription: 'Share-class identity required.' },
      { blockerType: 'yield_source_missing', blockerDescription: 'Yield mechanism required.' },
    ],
    integrationPriorities: [
      { providerId: 'official_issuer_docs', sourceCapability: 'legal claim and redemption terms', priority: 'priority_0_foundational' },
    ],
    implementationReadinessSummary: {
      observationTypeCount: 2,
      mappedObservationTypeCount: 2,
      formulaCount: 2,
      mappedFormulaCount: 2,
      eligibilityGateCount: 1,
      mappedEligibilityGateCount: 1,
      cohortCount: 1,
      mappedCohortCount: 1,
      currentIntegratedProviderCount: 1,
      futureProviderCandidateCount: 1,
    },
    guardrails: {
      overallScoreChanged: false,
      currentRankingOrderChanged: false,
      providerBehaviorChanged: false,
      anthropicIntegrated: false,
      snapshotsEnabled: false,
      partialRefreshEnabled: false,
    },
    protectedReportChanges: [],
    knownLimitations: ['Diagnostic source map only.'],
  }
}

try {
  const normalizer = await server.ssrLoadModule('/src/v2/institutionalSourceProviderEvidenceMapV1.js')
  const researchUtils = await server.ssrLoadModule('/src/components/research/researchUtils.js')

  const rootNormalized = normalizer.normalizeInstitutionalSourceProviderEvidenceMap({
    institutionalSourceProviderEvidenceMap: contract(),
  })
  const analysisNormalized = normalizer.normalizeInstitutionalSourceProviderEvidenceMap({
    analysis: { institutionalSourceProviderEvidenceMap: contract() },
  })
  const directNormalized = normalizer.normalizeInstitutionalSourceProviderEvidenceMap(contract())

  for (const normalized of [rootNormalized, analysisNormalized, directNormalized]) {
    assert.ok(normalized)
    assert.equal(Object.isFrozen(normalized), true)
    assert.equal(Object.isFrozen(normalized.observationMappings), true)
    assert.equal(normalized.diagnosticSummary.mappedObservationCount, 2)
    assert.equal(normalized.diagnosticSummary.mappedFormulaCount, 2)
    assert.equal(normalized.diagnosticSummary.mappedEligibilityGateCount, 1)
    assert.equal(normalized.diagnosticSummary.currentlyComputableFormulaCount, 1)
    assert.equal(normalized.diagnosticSummary.blockedFormulaCount, 1)
    assert.equal(normalized.diagnosticSummary.officialDocumentRequirementCount, 1)
    assert.equal(normalized.diagnosticSummary.providerBehaviorChanged, false)
    assert.equal(normalized.diagnosticSummary.evidencePromotionActive, false)
    assert.equal(normalized.diagnosticSummary.scoringActive, false)
    assert.equal(normalized.diagnosticSummary.rankingActive, false)
    assert.equal(normalized.diagnosticSummary.runtimeAiActive, false)
  }

  assert.equal(normalizer.normalizeInstitutionalSourceProviderEvidenceMap(null), null)
  assert.equal(normalizer.normalizeInstitutionalSourceProviderEvidenceMap({
    ...contract(),
    activationState: { ...contract().activationState, providerCallsActive: true },
  }), null)

  const bundle = researchUtils.buildReviewBundleText({
    asset: { symbol: 'TEST', name: 'Test Asset', coingeckoId: 'test-asset' },
    analysis: {
      institutionalSourceProviderEvidenceMap: rootNormalized,
      scores: { overallScore: 50 },
      confidence: { level: 'low', score: 20 },
    },
    data: {
      asset: { symbol: 'TEST', name: 'Test Asset', coingeckoId: 'test-asset' },
      analysis: { institutionalSourceProviderEvidenceMap: rootNormalized },
      scores: { overallScore: 50 },
      confidence: { level: 'low', score: 20 },
      meta: {},
      sourceStatus: {},
      warnings: [],
    },
    model: {},
    scores: { overallScore: 50 },
    confidence: { level: 'low', score: 20 },
  })
  const sectionTitle = 'Institutional Source & Provider Evidence Map v1 — RWA & Hybrid Finance plus Stablecoins & Yield'
  assert.equal((bundle.match(new RegExp(sectionTitle, 'g')) || []).length, 1)
  assert.match(bundle, /Observation mapping coverage: 2\/2/)
  assert.match(bundle, /Formula-input coverage: 2\/2/)
  assert.match(bundle, /Provider calls inactive: yes/)
  assert.match(bundle, /Scoring inactive: yes/)
  assert.match(bundle, /Ranking inactive: yes/)

  const researchUtilsSource = readFileSync(path.join(root, 'src/components/research/researchUtils.js'), 'utf8')
  const protectedReportBody = researchUtilsSource.slice(
    researchUtilsSource.indexOf('export function buildProtectedInvestorReportText'),
    researchUtilsSource.indexOf('export function buildAssetLookupQuery'),
  )
  assert.doesNotMatch(protectedReportBody, /institutionalSourceProviderEvidenceMap/)
  assert.doesNotMatch(protectedReportBody, /Provider integration priorities/)

  const appSource = readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  const scoringSource = readFileSync(path.join(root, 'src/components/research/ScoringTransparencyTab.jsx'), 'utf8')
  assert.match(appSource, /normalizeInstitutionalSourceProviderEvidenceMap\(data\)/)
  assert.match(scoringSource, /Institutional Source Coverage Map/)
  assert.doesNotMatch(scoringSource, /providerEndpoints|providerCredentials|officialDomain/)

  console.log('Institutional Source & Provider Evidence Map frontend diagnostic tests passed.')
} finally {
  await server.close()
}
