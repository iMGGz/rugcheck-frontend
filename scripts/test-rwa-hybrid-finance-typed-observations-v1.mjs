import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

const root = process.cwd()
const server = await createServer({
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
})

function contract() {
  return {
    schemaVersion: '1.0.0',
    contractId: 'rwaHybridFinanceTypedObservationBackbone',
    generatedAt: '2026-07-31T00:00:00.000Z',
    constitutionVersion: '1.0.0',
    sourceMapVersion: '1.0.0',
    identityBackboneVersion: '1.0.0',
    activationState: {
      typedObservationContractActive: true,
      diagnosticOnly: true,
      runtimeScoringActive: false,
      runtimeRankingActive: false,
      evidencePromotionActive: false,
      newProviderCallsActive: false,
      runtimeAiActive: false,
    },
    observationCoverage: {
      applicableObservationTypeCount: 84,
      registeredObservationTypeCount: 84,
    },
    diagnosticSummary: {
      version: '1.0.0',
      prerequisiteVersions: {
        rankingConstitution: '1.0.0',
        sourceProviderMap: '1.0.0',
        identityBackbone: '1.0.0',
      },
      applicableObservationTypeCount: 84,
      rawInputCount: 9,
      acceptedObservationCount: 3,
      acceptedWithLimitsCount: 1,
      contextualOnlyCount: 2,
      rejectedCount: 3,
      staleCount: 0,
      conflictingCount: 0,
      unavailableCount: 1,
      blockedIdentityCount: 0,
      blockedAuthorityCount: 0,
      branchCoverage: ['ecosystem_and_infrastructure_exposure'],
      cohortCoverage: ['rwa_governance_token'],
      formulaReadiness: { partially_ready: 2 },
      eligibilityReadiness: { blocked: 1 },
      contaminationFindingCounts: {
        productToken: 0,
        wrapperUnderlying: 0,
        fundShareClass: 0,
        protocolStrategy: 0,
        issuerCustodian: 0,
        prohibitedInheritance: 0,
        generatedText: 0,
        sourceCandidate: 0,
        crossFamily: 0,
      },
    },
    typedObservations: [{
      observationId: 'must-not-leak',
      providerFieldPath: 'must.not.leak',
      immutableHash: 'must-not-leak',
    }],
    rejectedRawInputs: [{ rejectionReasons: ['must-not-leak'] }],
    guardrails: {
      tokenSpecificRuntimeBranchCount: 0,
      providerBehaviorChanged: false,
      scoreChanged: false,
      currentRankingOrderChanged: false,
      anthropicIntegrated: false,
    },
    knownLimitations: ['Diagnostic observations only.'],
    nextResumePointer: 'Stablecoins & Yield Typed Observation Backbone v1',
  }
}

try {
  const normalizer = await server.ssrLoadModule(
    '/src/v2/rwaHybridFinanceTypedObservationsV1.js',
  )
  const researchUtils = await server.ssrLoadModule(
    '/src/components/research/researchUtils.js',
  )
  const variants = [
    contract(),
    { rwaHybridFinanceTypedObservationBackbone: contract() },
    { analysis: { rwaHybridFinanceTypedObservationBackbone: contract() } },
  ]
  for (const value of variants) {
    const normalized = normalizer.normalizeRwaHybridFinanceTypedObservations(value)
    assert.ok(normalized)
    assert.equal(Object.isFrozen(normalized), true)
    assert.equal(Object.isFrozen(normalized.diagnosticSummary), true)
    assert.equal(normalized.diagnosticSummary.rawInputCount, 9)
    assert.equal(normalized.diagnosticSummary.acceptedObservationCount, 3)
    assert.equal(normalized.diagnosticSummary.providerCallsActive, false)
    assert.equal(normalized.diagnosticSummary.scoringActive, false)
    assert.equal(normalized.diagnosticSummary.rankingActive, false)
    assert.equal(normalized.diagnosticSummary.evidencePromotionActive, false)
    assert.equal('typedObservations' in normalized, false)
    assert.equal('rejectedRawInputs' in normalized, false)
  }
  assert.equal(normalizer.normalizeRwaHybridFinanceTypedObservations(null), null)
  assert.equal(normalizer.normalizeRwaHybridFinanceTypedObservations({
    ...contract(),
    activationState: { ...contract().activationState, runtimeScoringActive: true },
  }), null)

  const normalized = normalizer.normalizeRwaHybridFinanceTypedObservations(contract())
  const bundle = researchUtils.buildReviewBundleText({
    asset: { symbol: 'ONDO', name: 'Ondo', coingeckoId: 'ondo-finance' },
    analysis: {
      rwaHybridFinanceTypedObservationBackbone: normalized,
      scores: { overallScore: 50 },
      confidence: { level: 'low', score: 20 },
    },
    data: {
      asset: { symbol: 'ONDO', name: 'Ondo', coingeckoId: 'ondo-finance' },
      analysis: { rwaHybridFinanceTypedObservationBackbone: normalized },
      scores: { overallScore: 50 },
      confidence: { level: 'low', score: 20 },
      meta: {},
      sourceStatus: {},
      warnings: [],
    },
    model: { rwaHybridFinanceTypedObservationBackbone: normalized },
    scores: { overallScore: 50 },
    confidence: { level: 'low', score: 20 },
  })
  const title = 'RWA & Hybrid Finance Typed Observation Backbone v1'
  assert.equal((bundle.match(new RegExp(title, 'g')) || []).length, 1)
  assert.match(bundle, /Backbone attached: yes/)
  assert.match(bundle, /Accepted observation count: 3/)
  assert.match(bundle, /Product-token contamination findings: 0/)
  assert.match(bundle, /Provider calls inactive: yes/)
  assert.match(bundle, /Scoring inactive: yes/)
  assert.match(bundle, /Ranking inactive: yes/)
  const section = bundle.slice(
    bundle.indexOf(`=== ${title} ===`),
    bundle.indexOf('=== Premium V2 Product Shell / Navigation QA ==='),
  )
  assert.doesNotMatch(section, /must-not-leak|providerFieldPath|immutableHash|rejectionReasons/)

  const appSource = readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  const scoringSource = readFileSync(
    path.join(root, 'src/components/research/ScoringTransparencyTab.jsx'),
    'utf8',
  )
  const utilsSource = readFileSync(
    path.join(root, 'src/components/research/researchUtils.js'),
    'utf8',
  )
  assert.match(appSource, /normalizeRwaHybridFinanceTypedObservations\(data\)/)
  assert.match(scoringSource, /RWA Typed Observation Backbone/)
  assert.doesNotMatch(scoringSource, /providerFieldPath|immutableHash|rejectionReasons|typedObservations/)
  const protectedBody = utilsSource.slice(
    utilsSource.indexOf('export function buildProtectedInvestorReportText'),
    utilsSource.indexOf('export function buildAssetLookupQuery'),
  )
  assert.doesNotMatch(protectedBody, /rwaHybridFinanceTypedObservationBackbone|RWA Typed Observation Backbone/)

  console.log('RWA & Hybrid Finance typed observation frontend tests passed.')
} finally {
  await server.close()
}
