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
    contractId: 'stablecoinsYieldTypedObservationBackbone',
    generatedAt: '2026-08-01T00:00:00.000Z',
    constitutionVersion: '1.0.0',
    sourceMapVersion: '1.0.0',
    identityBackboneVersion: '1.0.0',
    sharedObservationPrimitiveVersion: '1.0.0',
    activationState: {
      typedObservationContractActive: true,
      diagnosticOnly: true,
      newProviderCallsActive: false,
      evidencePromotionActive: false,
      stablecoinScoringActive: false,
      yieldScoringActive: false,
      riskAdjustedYieldScoringActive: false,
      runtimeRankingActive: false,
      runtimeAiActive: false,
    },
    observationCoverage: {
      applicableObservationTypeCount: 107,
      registeredObservationTypeCount: 107,
      expiredObservationCount: 1,
      blockedYieldSemanticsCount: 2,
      blockedBenchmarkCount: 1,
    },
    diagnosticSummary: {
      version: '1.0.0',
      prerequisiteVersions: {
        rankingConstitution: '1.0.0',
        sourceProviderMap: '1.0.0',
        identityBackbone: '1.0.0',
        sharedObservationPrimitives: '1.0.0',
      },
      applicableObservationTypeCount: 107,
      rawInputCount: 31,
      acceptedObservationCount: 19,
      acceptedWithLimitsCount: 2,
      contextualOnlyCount: 3,
      rejectedCount: 7,
      staleCount: 1,
      conflictingCount: 2,
      unavailableCount: 4,
      blockedIdentityCount: 1,
      blockedRelationshipCount: 2,
      blockedAuthorityCount: 3,
      branchCoverage: ['stable_value_assets', 'yield_products_and_strategies'],
      cohortCoverage: ['fiat_backed_payment_stablecoin', 'stablecoin_savings_wrapper'],
      formulaReadiness: { inactive: 4 },
      eligibilityReadiness: { inactive: 4 },
      contaminationFindingCounts: {
        baseWrapperContaminationFindings: 0,
        stablecoinPositionContaminationFindings: 0,
        protocolStrategyContaminationFindings: 0,
        vaultShareContaminationFindings: 0,
        poolLpContaminationFindings: 0,
        principalYieldTokenContaminationFindings: 0,
        reserveScopeContaminationFindings: 0,
        yieldSemanticsContaminationFindings: 0,
        generatedTextObservationFindings: 0,
        sourceCandidateObservationFindings: 0,
        crossUniverseDuplicateFindings: 0,
      },
    },
    typedObservations: [{ observationId: 'must-not-leak', providerFieldPath: 'must.not.leak', immutableHash: 'must-not-leak' }],
    rejectedRawInputs: [{ rejectionReasons: ['must-not-leak'] }],
    rawInputInventory: [{ rawValue: 'must-not-leak' }],
    guardrails: {
      tokenSpecificRuntimeBranchCount: 0,
      providerBehaviorChanged: false,
      scoreChanged: false,
      currentRankingOrderChanged: false,
      anthropicIntegrated: false,
    },
    knownLimitations: ['Diagnostic observations only.'],
    nextResumePointer: 'ProductResearchResultV2 — Institutional Product Analysis Contract v1',
  }
}

try {
  const normalizer = await server.ssrLoadModule('/src/v2/stablecoinsYieldTypedObservationsV1.js')
  const researchUtils = await server.ssrLoadModule('/src/components/research/researchUtils.js')
  const variants = [
    contract(),
    { stablecoinsYieldTypedObservationBackbone: contract() },
    { analysis: { stablecoinsYieldTypedObservationBackbone: contract() } },
  ]
  for (const value of variants) {
    const normalized = normalizer.normalizeStablecoinsYieldTypedObservations(value)
    assert.ok(normalized)
    assert.equal(Object.isFrozen(normalized), true)
    assert.equal(Object.isFrozen(normalized.diagnosticSummary), true)
    assert.equal(normalized.diagnosticSummary.rawInputCount, 31)
    assert.equal(normalized.diagnosticSummary.acceptedObservationCount, 19)
    assert.equal(normalized.diagnosticSummary.expiredCount, 1)
    assert.equal(normalized.diagnosticSummary.blockedYieldSemanticsCount, 2)
    assert.equal(normalized.diagnosticSummary.providerCallsActive, false)
    assert.equal(normalized.diagnosticSummary.stablecoinScoringActive, false)
    assert.equal(normalized.diagnosticSummary.yieldScoringActive, false)
    assert.equal(normalized.diagnosticSummary.rankingActive, false)
    assert.equal(normalized.diagnosticSummary.evidencePromotionActive, false)
    assert.equal('typedObservations' in normalized, false)
    assert.equal('rejectedRawInputs' in normalized, false)
    assert.equal('rawInputInventory' in normalized, false)
  }
  assert.equal(normalizer.normalizeStablecoinsYieldTypedObservations(null), null)
  assert.equal(normalizer.normalizeStablecoinsYieldTypedObservations({
    ...contract(),
    activationState: { ...contract().activationState, yieldScoringActive: true },
  }), null)

  const normalized = normalizer.normalizeStablecoinsYieldTypedObservations(contract())
  const bundle = researchUtils.buildReviewBundleText({
    asset: { symbol: 'USDC', name: 'USD Coin', coingeckoId: 'usd-coin' },
    analysis: {
      stablecoinsYieldTypedObservationBackbone: normalized,
      scores: { overallScore: 50 },
      confidence: { level: 'low', score: 20 },
    },
    data: {
      asset: { symbol: 'USDC', name: 'USD Coin', coingeckoId: 'usd-coin' },
      analysis: { stablecoinsYieldTypedObservationBackbone: normalized },
      scores: { overallScore: 50 },
      confidence: { level: 'low', score: 20 },
      meta: {},
      sourceStatus: {},
      warnings: [],
    },
    model: { stablecoinsYieldTypedObservationBackbone: normalized },
    scores: { overallScore: 50 },
    confidence: { level: 'low', score: 20 },
  })
  const title = 'Stablecoins & Yield Typed Observation Backbone v1'
  assert.equal((bundle.match(new RegExp(title, 'g')) || []).length, 1)
  assert.match(bundle, /Backbone attached: yes/)
  assert.match(bundle, /Accepted observation count: 19/)
  assert.match(bundle, /Contamination findings: 0/)
  assert.match(bundle, /Cross-universe duplicate findings: 0/)
  assert.match(bundle, /Provider calls inactive: yes/)
  assert.match(bundle, /Stablecoin scoring inactive: yes/)
  assert.match(bundle, /Yield scoring inactive: yes/)
  assert.match(bundle, /Ranking inactive: yes/)
  const sectionStart = bundle.indexOf(`=== ${title} ===`)
  assert.notEqual(sectionStart, -1)
  const nextSection = bundle.indexOf('\n=== ', sectionStart + title.length + 8)
  const section = bundle.slice(sectionStart, nextSection === -1 ? bundle.length : nextSection)
  assert.doesNotMatch(section, /must-not-leak|providerFieldPath|immutableHash|rejectionReasons|rawValue/)

  const appSource = readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  const scoringSource = readFileSync(path.join(root, 'src/components/research/ScoringTransparencyTab.jsx'), 'utf8')
  const utilsSource = readFileSync(path.join(root, 'src/components/research/researchUtils.js'), 'utf8')
  assert.match(appSource, /normalizeStablecoinsYieldTypedObservations\(data\)/)
  assert.match(scoringSource, /Stablecoins & Yield Typed Observation Backbone/)
  assert.doesNotMatch(scoringSource, /providerFieldPath|immutableHash|rejectionReasons|typedObservations|rawInputInventory/)
  const protectedBody = utilsSource.slice(
    utilsSource.indexOf('export function buildProtectedInvestorReportText'),
    utilsSource.indexOf('export function buildAssetLookupQuery'),
  )
  assert.doesNotMatch(protectedBody, /stablecoinsYieldTypedObservationBackbone|Stablecoins & Yield Typed Observation Backbone/)

  console.log('Stablecoins & Yield typed observation frontend tests passed.')
} finally {
  await server.close()
}
