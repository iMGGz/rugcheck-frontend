import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

const root = process.cwd()
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

function contract() {
  return {
    artifactVersion: 'institutional-discovery-ranking-constitution-v1',
    constitutionVersion: '1.0.0',
    contractId: 'institutionalDiscoveryDeterministicRankingConstitution',
    activationState: {
      reportOnly: true,
      diagnosticOnly: true,
      runtimeScoringActive: false,
      runtimeRankingActive: false,
      formulaActivationState: 'diagnostic_only_not_runtime_active',
    },
    doctrine: { runtimeAiAuthority: 'forbidden' },
    universes: [
      {
        universeId: 'rwa_hybrid_finance',
        branches: [{ branchId: 'ecosystem_and_infrastructure_exposure', cohorts: ['rwa_governance_token'] }],
        methodologyBoundary: ['Product traction is not token value.'],
      },
      {
        universeId: 'stablecoins_yield',
        branches: [{ branchId: 'stable_value_assets', cohorts: ['fiat_backed_payment_stablecoin'] }],
        methodologyBoundary: ['APY is not quality.'],
      },
    ],
    formulaRegistry: [{ formulaId: 'coverage_ratio', activationState: 'diagnostic_only_not_runtime_active' }],
    eligibilityPolicy: { states: ['eligible', 'score_withheld'] },
    comparabilityMatrix: [{ ruleId: 'base_vs_wrapper', outcome: 'not_comparable' }],
    frontendBoundary: {
      normalizedField: 'model.institutionalDiscoveryDeterministicRankingConstitution',
      visibility: 'internal_qa_or_scoring_transparency_only',
      customerScoreAdded: false,
      customerRankAdded: false,
    },
    guardrails: {
      overallScoreChanged: false,
      currentRankingOrderChanged: false,
      runtimeAiAuthorityAdded: false,
      anthropicIntegrated: false,
      providerBehaviorChanged: false,
      snapshotsEnabled: false,
      partialRefreshEnabled: false,
    },
    protectedReportChanges: [],
    nextResumePointer: 'Institutional Source & Provider Evidence Map v1 - RWA & Hybrid Finance plus Stablecoins & Yield',
  }
}

try {
  const normalizer = await server.ssrLoadModule('/src/v2/institutionalDiscoveryRankingConstitutionV1.js')
  const researchUtils = await server.ssrLoadModule('/src/components/research/researchUtils.js')

  const rootNormalized = normalizer.normalizeInstitutionalDiscoveryRankingConstitution({
    institutionalDiscoveryDeterministicRankingConstitution: contract(),
  })
  const analysisNormalized = normalizer.normalizeInstitutionalDiscoveryRankingConstitution({
    analysis: { institutionalDiscoveryDeterministicRankingConstitution: contract() },
  })
  const directNormalized = normalizer.normalizeInstitutionalDiscoveryRankingConstitution(contract())

  for (const normalized of [rootNormalized, analysisNormalized, directNormalized]) {
    assert.ok(normalized)
    assert.equal(Object.isFrozen(normalized), true)
    assert.equal(Object.isFrozen(normalized.universes), true)
    assert.deepEqual(normalized.diagnosticSummary.universeIds, ['rwa_hybrid_finance', 'stablecoins_yield'])
    assert.equal(normalized.diagnosticSummary.cohortCount, 2)
    assert.equal(normalized.diagnosticSummary.formulaCount, 1)
    assert.equal(normalized.diagnosticSummary.runtimeScoreChanged, false)
    assert.equal(normalized.diagnosticSummary.runtimeRankChanged, false)
    assert.equal(normalized.diagnosticSummary.runtimeAiAuthority, 'forbidden')
  }

  assert.equal(normalizer.normalizeInstitutionalDiscoveryRankingConstitution(null), null)
  assert.equal(normalizer.normalizeInstitutionalDiscoveryRankingConstitution({
    ...contract(),
    activationState: { runtimeScoringActive: true, runtimeRankingActive: false },
  }), null)

  const bundle = researchUtils.buildReviewBundleText({
    asset: { symbol: 'TEST', name: 'Test Asset', coingeckoId: 'test-asset' },
    analysis: {
      institutionalDiscoveryDeterministicRankingConstitution: rootNormalized,
      scores: { overallScore: 50 },
      confidence: { level: 'low', score: 20 },
    },
    data: {
      asset: { symbol: 'TEST', name: 'Test Asset', coingeckoId: 'test-asset' },
      analysis: { institutionalDiscoveryDeterministicRankingConstitution: rootNormalized },
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
  assert.equal((bundle.match(/Institutional Discovery Two-Universe Deterministic Ranking Constitution v1/g) || []).length, 1)
  assert.match(bundle, /Constitution version: 1\.0\.0/)
  assert.match(bundle, /rwa_hybrid_finance, stablecoins_yield/)
  assert.match(bundle, /Runtime score changed: no/)
  assert.match(bundle, /Runtime rank changed: no/)
  assert.match(bundle, /AI runtime authority: forbidden/)

  const protectedReportSource = readFileSync(path.join(root, 'src/components/research/researchUtils.js'), 'utf8')
  const protectedReportBody = protectedReportSource.slice(
    protectedReportSource.indexOf('export function buildProtectedInvestorReportText'),
    protectedReportSource.indexOf('export function buildAssetLookupQuery'),
  )
  assert.doesNotMatch(protectedReportBody, /institutionalDiscoveryDeterministicRankingConstitution/)

  const appSource = readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  assert.match(appSource, /normalizeInstitutionalDiscoveryRankingConstitution\(data\)/)
  assert.doesNotMatch(appSource, /institutionalDiscovery.*(?:score|rank)\s*[+\-*/=]/i)

  console.log('Institutional Discovery ranking constitution frontend diagnostic tests passed.')
} finally {
  await server.close()
}
