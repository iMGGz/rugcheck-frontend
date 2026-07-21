import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'

const root = process.cwd()
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

function source(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8')
}

function breakdown(componentId = 'productAndFundamentalQuality', overrides = {}) {
  return {
    componentId,
    label: 'Product and fundamentals',
    normalizedValue: 82,
    weight: 0.13,
    contribution: 10.66,
    sourceOwnerLabel: 'Thesis & Fundamentals',
    freshness: 'fresh',
    confidence: 84,
    included: true,
    missingInputs: [],
    limitations: [],
    ...overrides,
  }
}

function rankedCandidate(id, name, rank, score, overrides = {}) {
  return {
    canonicalAssetId: `asset:coingecko:${id}`,
    canonicalProductId: null,
    candidateType: 'governance_token',
    displayName: name,
    symbol: id.toUpperCase(),
    logo: null,
    representation: 'evm_contract_asset',
    canonicalFamily: 'rwa_hybrid_governance_or_infrastructure',
    membershipStatus: 'eligible',
    rank,
    displayRank: rank === 2 ? 'T2' : String(rank),
    tieGroupId: rank === 2 ? 'tie:2' : null,
    rankingScore: score,
    rawRankingMetric: 0.3,
    rankingConfidence: 76,
    weightedCoverage: 0.84,
    analysisFreshness: 'ready',
    componentBreakdown: [breakdown()],
    riskBreakdown: [breakdown('legalRightsAndDependencyRisk', { label: 'Legal rights and dependency risk', normalizedValue: 42, weight: 0.125, contribution: 5.25 })],
    strongestDrivers: ['Product and fundamentals'],
    strongestRisks: ['Legal rights and dependency risk'],
    caveats: ['Calibration is provisional.'],
    conciseReason: `Quality score ${score}/100 with 84% weighted input coverage.`,
    openAnalysisTarget: `/terminal-v2/asset/${id}`,
    provenance: ['Thesis & Fundamentals', 'Tokenomics Quality'],
    limitations: ['Rank is universe-specific.'],
    mathematicalUpside: {
      mathematicalUpsideScore: 33,
      baseScenarioMidpointPrice: 1.3,
      baseScenarioMidpointUpside: 0.3,
      baseScenarioLowerBoundUpside: 0.2,
      baseScenarioUpperBoundUpside: 0.4,
      strongBullLowerBoundUpside: 0.6,
      strongBullMidpointUpside: 0.8,
      projectedSupplyStatus: 'available',
      dilutionImpact: 0.08,
      scenarioConfidence: 'medium',
      supplyBasis: 'projected circulating supply',
      outlier: { rawValue: 0.3, transformedValue: 33, capValue: 5, capApplied: false, capReason: null, rankingImpact: 'No cap applied.', limitations: [] },
      whatItSupports: ['Bounded scenario arithmetic.'],
      whatItDoesNotProve: ['No probability or expected return.'],
      limitations: [],
    },
    riskBurden: null,
    technicalSetup: null,
    currentRealityAdjustment: null,
    qualityScore: score,
    riskAdjustedRoiScore: 28,
    qualityFloorStatus: 'passed',
    liquidityGateStatus: 'eligible',
    ...overrides,
  }
}

function withheldCandidate(overrides = {}) {
  return {
    canonicalAssetId: 'asset:coingecko:coverage-limited',
    canonicalProductId: null,
    candidateType: 'governance_token',
    displayName: 'Coverage-Limited Institutional Infrastructure Candidate',
    symbol: 'LIMIT',
    logo: null,
    canonicalFamily: 'rwa_hybrid_governance_or_infrastructure',
    representation: 'evm_contract_asset',
    rankabilityStatus: 'missing_critical_inputs',
    blockingReasons: ['Critical ranking inputs are unavailable.'],
    missingCriticalInputs: ['rightsAndEnforceabilityQuality'],
    coverage: 0.42,
    freshness: 'ready',
    nextRequiredStep: 'Attach canonical legal-rights and token-transfer evidence.',
    limitations: [],
    ...overrides,
  }
}

function ranking(type, overrides = {}) {
  const names = {
    quality: 'Quality',
    opportunity: 'Opportunity',
    mathematical_upside: 'Mathematical Upside',
    risk_adjusted_roi: 'Risk-Adjusted ROI',
  }
  return {
    rankingType: type,
    displayName: names[type],
    status: 'active',
    applicability: 'applicable',
    policyVersion: 'institutional-ranking-policy-v1.0.0',
    calibrationStatus: 'provisionally_calibrated',
    objective: `Compare ${names[type]} inside this canonical universe.`,
    rankedCandidates: [
      rankedCandidate('alpha', 'Alpha Institutional Asset', 1, 82),
      rankedCandidate('beta', 'Beta Tokenized Claim', 2, 74),
      rankedCandidate('gamma', 'Gamma RWA Infrastructure', 2, 74),
    ],
    provisionalCandidates: [rankedCandidate('provisional', 'Provisional Asset', 1, 68, { displayRank: 'P1', membershipStatus: 'eligible_with_caveats' })],
    withheldCandidates: [withheldCandidate()],
    notApplicableCandidates: [],
    pendingCandidates: [withheldCandidate({ canonicalAssetId: 'asset:coingecko:pending', displayName: 'Fresh Analysis Pending', rankabilityStatus: 'analysis_pending', blockingReasons: ['Fresh canonical analysis is pending.'], coverage: 0 })],
    methodology: ['Missing evidence reduces coverage or withholds ranking.'],
    coverageSummary: 'Average weighted coverage among displayed candidates is 80%.',
    freshnessSummary: 'Displayed candidates use fresh request-local analyses.',
    limitations: ['Rank is not a recommendation.'],
    ...overrides,
  }
}

function payload(overrides = {}) {
  return {
    schemaVersion: 'institutional-ranking-v1.0.0',
    generatedAt: '2026-07-21T12:00:00.000Z',
    universeId: 'rwa_hybrid_finance',
    universeSlug: 'rwa-hybrid-finance',
    universeDisplayName: 'RWA / Hybrid Finance',
    policyVersion: 'institutional-ranking-policy-v1.0.0',
    calibrationVersion: 'institutional-ranking-calibration-v1.0.0',
    rankingWindow: { startedAt: '2026-07-21T11:59:00.000Z', completedAt: '2026-07-21T12:00:00.000Z', maximumRankedCandidates: 20 },
    sourceDiscoveryGeneratedAt: '2026-07-21T11:59:30.000Z',
    rankingTypes: ['quality', 'opportunity', 'mathematical_upside', 'risk_adjusted_roi'],
    qualityRanking: ranking('quality'),
    opportunityRanking: ranking('opportunity'),
    mathematicalUpsideRanking: ranking('mathematical_upside'),
    riskAdjustedRoiRanking: ranking('risk_adjusted_roi'),
    rankingCoverage: 'Four distinct fresh eligible assets pass at least one gate.',
    rankingFreshness: 'Fresh request-local analysis.',
    providerHealth: { status: 'available', availableProviders: ['coingecko'], unavailableProviders: [] },
    candidateFunnel: { discovered: 8, eligible: 3, eligibleWithCaveats: 1, analyzed: 6, rankable: 4, provisional: 4, withheld: 4, notApplicable: 0, pending: 4, manualReview: 0 },
    rankableCount: 4,
    provisionalCount: 4,
    withheldCount: 4,
    notApplicableCount: 0,
    pendingCount: 4,
    manualReviewCount: 0,
    limitations: ['Rankings compare candidates only within this universe.'],
    nextDiligence: ['Attach canonical legal-rights evidence.'],
    methodologySummary: [
      'Quality is separate from Opportunity.',
      'Mathematical Upside is scenario math, not probability.',
      'Risk-Adjusted ROI is a modeled upside-to-risk index, not expected return.',
      'Missing evidence can withhold ranking but is never scored as zero.',
    ],
    deterministicHash: 'fixture-deterministic-hash',
    ...overrides,
  }
}

try {
  const normalizer = await server.ssrLoadModule('/src/v2/institutionalRankingV2.js')
  const componentModule = await server.ssrLoadModule('/src/v2/components/V2InstitutionalRankings.jsx')
  const discoverModule = await server.ssrLoadModule('/src/v2/PremiumDiscoverV2.jsx')
  const RankingComponent = componentModule.default

  const normalized = normalizer.normalizeInstitutionalRankingResponse(payload())
  assert.equal(Object.isFrozen(normalized), true)
  assert.equal(Object.isFrozen(normalized.qualityRanking.rankedCandidates), true)
  assert.deepEqual(normalized.qualityRanking.rankedCandidates.map((entry) => entry.displayName), [
    'Alpha Institutional Asset', 'Beta Tokenized Claim', 'Gamma RWA Infrastructure',
  ], 'Frontend must preserve backend order')
  assert.deepEqual(normalized.qualityRanking.rankedCandidates.map((entry) => entry.rank), [1, 2, 2])
  assert.equal(normalized.qualityRanking.rankedCandidates[1].displayRank, 'T2')
  assert.equal(normalized.qualityRanking.provisionalCandidates.length, 1)
  assert.equal(normalized.qualityRanking.withheldCandidates.length, 1)
  assert.equal(normalized.qualityRanking.pendingCandidates.length, 1)
  assert.equal(normalized.rankingsByType.mathematical_upside.display.name, 'Mathematical Upside')
  assert.equal(normalized.rankingsByType.risk_adjusted_roi.display.name, 'Risk Adjusted ROI')
  assert.equal(normalized.qualityRanking.rankedCandidates[0].openAnalysisTarget, '/terminal-v2/asset/alpha')

  assert.throws(() => normalizer.normalizeInstitutionalRankingResponse(null), /malformed/i)
  assert.throws(() => normalizer.normalizeInstitutionalRankingResponse({ schemaVersion: 'x' }), /malformed/i)
  assert.throws(() => normalizer.normalizeInstitutionalRankingResponse(payload({
    qualityRanking: ranking('quality', { rankedCandidates: [rankedCandidate('bad', 'Bad', 1, Number.NaN)] }),
  })), /finite/i)
  assert.throws(() => normalizer.normalizeInstitutionalRankingResponse(payload({
    qualityRanking: ranking('quality', { rankedCandidates: [rankedCandidate('second', 'Second', 2, 70), rankedCandidate('first', 'First', 1, 80)] }),
  })), /order/i)
  assert.throws(() => normalizer.normalizeInstitutionalRankingResponse(payload({
    qualityRanking: ranking('quality', { rankedCandidates: [rankedCandidate('bad-link', 'Bad Link', 1, 80, { openAnalysisTarget: '/legacy/bad-link' })] }),
  })), /canonical asset route/i)

  const html = renderToString(React.createElement(RankingComponent, { rankings: normalized }))
  assert.match(html, /Institutional rankings/)
  assert.match(html, /Four lenses\. One explicit policy boundary/)
  assert.match(html, /Quality/)
  assert.match(html, /Opportunity/)
  assert.match(html, /Mathematical Upside/)
  assert.match(html, /Risk Adjusted ROI/)
  assert.match(html, /T2/)
  assert.match(html, /Provisional/)
  assert.match(html, /View withheld, pending, and not-applicable candidates/)
  assert.match(html, /How these rankings work/)
  assert.match(html, /Rank is not a recommendation/)
  assert.match(html, /Open analysis/)
  assert.match(html, /\/terminal-v2\/asset\/alpha/)
  assert.doesNotMatch(html, /undefined|NaN|Infinity|\[object Object\]/)
  assert.doesNotMatch(html, /institutional-ranking-policy-v1|asset:coingecko:|sourceFieldPath|seedOrigins|candidateId/)
  assert.doesNotMatch(html, /best asset to buy|expected ROI|guaranteed|probability of|portfolio allocation/i)

  const missingHtml = renderToString(React.createElement(RankingComponent, { rankings: null, errorMessage: 'Live ranking request is unavailable.' }))
  assert.match(missingHtml, /Ranking analysis is unavailable/)
  assert.match(missingHtml, /Live ranking request is unavailable/)
  assert.doesNotMatch(missingHtml, /undefined|NaN|Infinity|\[object Object\]/)

  const stablePayload = payload({
    universeId: 'stablecoin_yield_yield_bearing_assets',
    universeSlug: 'stablecoin-yield-yield-bearing-assets',
    universeDisplayName: 'Stablecoin Yield / Yield-Bearing Assets',
    qualityRanking: ranking('quality', { status: 'provisional', applicability: 'partially_applicable', rankedCandidates: [], provisionalCandidates: [rankedCandidate('usdc', 'USD Coin', 1, 78, { canonicalFamily: 'stablecoin_fiat_backed', representation: 'fiat_backed_stablecoin', symbol: 'USDC', openAnalysisTarget: '/terminal-v2/asset/usd-coin' })] }),
    opportunityRanking: ranking('opportunity', { status: 'blocked', applicability: 'blocked_by_missing_product_model', rankedCandidates: [], provisionalCandidates: [], withheldCandidates: [withheldCandidate({ canonicalProductId: 'product:fixture:vault', canonicalAssetId: null, candidateType: 'pool_or_vault', displayName: 'Yield Vault Candidate', rankabilityStatus: 'product_model_required' })] }),
    mathematicalUpsideRanking: ranking('mathematical_upside', { status: 'blocked', applicability: 'not_applicable', rankedCandidates: [], provisionalCandidates: [], withheldCandidates: [], notApplicableCandidates: [withheldCandidate({ canonicalFamily: 'stablecoin_fiat_backed', displayName: 'USD Coin', rankabilityStatus: 'ranking_not_applicable' })] }),
    riskAdjustedRoiRanking: ranking('risk_adjusted_roi', { status: 'blocked', applicability: 'blocked_by_missing_product_model', rankedCandidates: [], provisionalCandidates: [] }),
  })
  const stable = normalizer.normalizeInstitutionalRankingResponse(stablePayload)
  assert.equal(stable.qualityRanking.display.status, 'Provisional policy')
  assert.equal(stable.opportunityRanking.display.applicability, 'Product analysis required')
  assert.equal(stable.mathematicalUpsideRanking.display.applicability, 'Not applicable')
  assert.equal(stable.riskAdjustedRoiRanking.rankedCandidates.length, 0)
  assert.equal(stable.opportunityRanking.withheldCandidates[0].display.candidateType, 'Pool Or Vault')
  const stableHtml = renderToString(React.createElement(RankingComponent, { rankings: stable }))
  assert.match(stableHtml, /USD Coin/)
  assert.match(stableHtml, /Provisional policy/)
  assert.match(stableHtml, /Product analysis required/)
  assert.match(stableHtml, /Not applicable/)
  assert.doesNotMatch(stableHtml, /APY|yield ranking|price target|speculative upside/i)

  const detailHtml = renderToString(React.createElement(discoverModule.UniverseDetail, {
    result: {
      universeDefinition: { displayName: 'RWA / Hybrid Finance', institutionalObjective: 'Separate product, rights, and token value capture.', coreSubthemes: ['tokenized_assets'], adjacentSubthemes: [], disqualifyingConditions: ['unresolved_identity'], rankingCalibrationStatus: 'provisionally_calibrated' },
      sourceCoverage: 'Canonical discovery coverage.', generatedAt: '2026-07-21T12:00:00.000Z', candidates: [],
      identityResolvedCount: 0, representationVerifiedCount: 0, coreRelevantCount: 0, adjacentRelevantCount: 0,
      analysisCompletedCount: 0, eligibleCount: 0, eligibleWithCaveatsCount: 0, analysisPendingCount: 0, manualReviewCount: 0, ineligibleCount: 0,
      eligibleMembers: [], caveatedMembers: [], pendingCandidates: [], manualReviewCandidates: [], ineligibleCandidates: [],
      coverageSummary: 'No candidates.', freshnessSummary: 'Fresh request.', providerHealth: { status: 'available' },
      limitations: [], nextDiligence: [],
    },
    rankings: normalized,
  }))
  assert.match(detailHtml, /Institutional rankings/)
  assert.match(detailHtml, /Candidate funnel/)
  assert.doesNotMatch(detailHtml, /undefined|NaN|Infinity|\[object Object\]/)

  const normalizerSource = source('src/v2/institutionalRankingV2.js')
  const componentSource = source('src/v2/components/V2InstitutionalRankings.jsx')
  const discoverSource = source('src/v2/PremiumDiscoverV2.jsx')
  const cssSource = source('src/v2/PremiumDiscoverV2.css')
  const packageSource = source('package.json')
  const combinedRankingSource = `${normalizerSource}\n${componentSource}\n${discoverSource}`
  assert.doesNotMatch(combinedRankingSource, /\.sort\s*\(/)
  assert.doesNotMatch(componentSource, /Math\.log|Math\.log1p|riskBurdenScore\s*=|rankingScore\s*=|rankingConfidence\s*=|tieGroupId\s*=/)
  assert.doesNotMatch(normalizerSource, /rankingScore\s*\/|rankingConfidence\s*\/|weightedCoverage\s*\/|riskBurdenScore\s*[+*\/-]/)
  assert.match(normalizerSource, /candidate\.rank < previousRank/)
  assert.match(normalizerSource, /duplicate_canonical_asset/)
  assert.match(normalizerSource, /startsWith\('\/terminal-v2\/asset\/'\)/)
  assert.match(discoverSource, /fetchInstitutionalRankingsV2/)
  assert.match(discoverSource, /coordinator\.isCurrent\(requestId\)/)
  assert.match(discoverSource, /AbortError/)
  assert.match(discoverSource, /includeProvisional: true, includeWithheld: true/)
  assert.match(componentSource, /role="tablist"/)
  assert.match(componentSource, /role="tab"/)
  assert.match(componentSource, /type="button"/)
  assert.match(componentSource, /<details className="v2-ranking-methodology">/)
  assert.match(cssSource, /\.v2-ranking-tabs button:focus-visible/)
  assert.match(cssSource, /min-height:\s*44px/)
  assert.match(cssSource, /overflow-wrap:\s*anywhere/)
  assert.match(cssSource, /@media \(max-width: 1100px\)/)
  assert.match(cssSource, /@media \(max-width: 780px\)/)
  assert.match(cssSource, /@media \(max-width: 520px\)/)
  assert.match(cssSource, /overflow-x:\s*hidden/)
  assert.match(packageSource, /test:institutional-ranking-v2/)

  console.log('PASS V2 institutional ranking renderer-only regressions')
} finally {
  await server.close()
}
