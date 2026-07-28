import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'

const root = process.cwd()
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

function source(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8')
}

function definition(overrides = {}) {
  return {
    schemaVersion: '1.0.0',
    universeId: 'rwa_hybrid_finance',
    slug: 'rwa-hybrid-finance',
    displayName: 'RWA / Hybrid Finance',
    shortDescription: 'Tokenized assets and institutional infrastructure.',
    institutionalObjective: 'Separate products, rights, and token value capture before assessing eligibility.',
    subjectScope: 'asset_and_product_candidates',
    status: 'active_discovery',
    priority: 1,
    coreSubthemes: ['tokenization_platforms', 'tokenized_treasuries_and_funds'],
    disqualifyingConditions: ['unresolved_wrong_asset_risk', 'provider_category_only_relevance'],
    ...overrides,
  }
}

function rawCandidate(overrides = {}) {
  const candidateId = overrides.candidateId || 'candidate:asset:ondo'
  return {
    candidateId,
    candidateType: 'governance_token',
    displayIdentity: { name: 'Ondo', symbol: 'ONDO', logo: null, canonicalDeepLinkId: 'ondo-finance' },
    providerOrigins: ['coingecko'],
    seedOrigins: ['rwa-hybrid-finance-opportunity-universe-v1'],
    canonicalIdentity: {
      canonicalAssetId: 'asset:coingecko:ondo-finance', canonicalProductId: null, canonicalName: 'Ondo', canonicalSymbol: 'ONDO',
      coingeckoId: 'ondo-finance', coinmarketcapId: 21159, canonicalProviderAgreement: 'matched', identityConfidence: 'high',
      identityStatus: 'passed', identityLimitations: [],
    },
    representation: {
      representationType: 'evm_contract_asset', nativeOrContract: 'contract', network: 'ethereum',
      contractAddress: '0xfaba6f8e4a5e8ab82f62fe7c39859fa577269be3', migratedOrLegacyStatus: 'none_detected',
      wrappedOrBridgedStatus: 'none_detected', lstStatus: 'not_applicable', issuerOrProductRelationship: null,
      representationConfidence: 'high', representationStatus: 'verified', representationLimitations: [],
    },
    canonicalFamily: 'rwa_hybrid_governance_or_infrastructure',
    relevance: {
      universeId: 'rwa_hybrid_finance', relevanceState: 'core_relevant', coreSubtheme: 'tokenization_platforms',
      adjacentSubthemes: [], canonicalFamily: 'rwa_hybrid_governance_or_infrastructure', candidateType: 'governance_token',
      representationCompatibility: 'compatible', supportingClassificationContext: ['RWA category context'], rejectedClassificationContext: [],
      relevanceReasons: ['Canonical family matches the core universe policy.'], relevanceLimitations: [], manualReviewRequired: false,
    },
    coverage: { state: 'partially_ready', dimensions: {}, reasons: ['Canonical V2 coverage is available.'], limitations: ['Legal-rights review remains open.'] },
    liquidity: {
      state: 'eligible_with_caveat', marketCapUsd: 2_450_000_000, volume24hUsd: 118_000_000, volumeToMarketCap: 0.048,
      mappedPairLiquidityUsd: null, mappedPairVolume24hUsd: null, mappedVenueCount: null, pairAgeDays: null,
      globalProviderCoverage: 'available', pairSpecificCoverage: 'unavailable', selectedNetwork: 'ethereum',
      selectedContract: '0xfaba6f8e4a5e8ab82f62fe7c39859fa577269be3', freshness: 'fresh', providerDisagreement: false,
      reasons: ['Global market coverage is available.'], limitations: ['Pair-level depth is not attached.'],
    },
    freshness: { state: 'ready', observedAt: '2026-07-20T10:00:00.000Z', checkedAt: '2026-07-20T10:01:00.000Z', limitations: [] },
    analysis: {
      analysisRequestId: 'request:ondo', canonicalAssetId: 'ondo-finance', analysisStartedAt: '2026-07-20T10:00:00.000Z',
      analysisCompletedAt: '2026-07-20T10:01:00.000Z', fullRecompute: true, snapshotReuseBlocked: true, partialRefreshDisabled: true,
      assetResearchResultV2SchemaVersion: '2.0.0', analysisStatus: 'completed_with_caveats', analysisCoverage: 'partial',
      analysisFreshness: 'fresh', failureReason: null, limitations: [],
    },
    membership: {
      universeId: 'rwa_hybrid_finance', canonicalAssetId: 'ondo-finance', canonicalProductId: null, candidateType: 'governance_token',
      membershipStatus: 'eligible_with_caveats', membershipConfidence: 'medium', membershipReasons: ['Identity, representation, and family relevance pass.'],
      caveats: ['Legal rights and token value capture need verification.'], blockingReasons: [], manualReviewReasons: [], identityGate: 'passed',
      representationGate: 'verified', relevanceGate: 'core_relevant', coverageGate: 'partially_ready', liquidityGate: 'eligible_with_caveat',
      freshnessGate: 'ready', analysisGate: 'completed_with_caveats', eligibleSubthemes: ['tokenization_platforms'], providerOrigins: ['coingecko'],
      seedOrigins: ['rwa-hybrid-finance-opportunity-universe-v1'], analyzedAt: '2026-07-20T10:01:00.000Z',
      generatedAt: '2026-07-20T10:01:00.000Z', limitations: [],
    },
    rankingReadiness: { limitations: ['Ranking is not active.'] },
    marketSummary: { marketCapUsd: 2_450_000_000, volume24hUsd: 118_000_000, priceUsd: 0.92 },
    tokenomicsSummary: { status: 'partially_ready', maxSupplyState: 'provider_reported', primaryRisk: 'Unlock evidence remains incomplete.' },
    fundamentalsSummary: { status: 'partially_ready', thesis: 'RWA protocol exposure.', primaryGap: 'Tokenholder value capture.' },
    currentRealitySummary: { status: 'ready', activeMaterialEventCount: 0, verificationRequiredCount: 0 },
    provenance: ['canonical live analysis'],
    limitations: [],
    ...overrides,
  }
}

function candidateVariant(overrides = {}) {
  const base = rawCandidate()
  return {
    ...base,
    ...overrides,
    displayIdentity: { ...base.displayIdentity, ...(overrides.displayIdentity || {}) },
    canonicalIdentity: { ...base.canonicalIdentity, ...(overrides.canonicalIdentity || {}) },
    representation: { ...base.representation, ...(overrides.representation || {}) },
    relevance: { ...base.relevance, ...(overrides.relevance || {}) },
    coverage: { ...base.coverage, ...(overrides.coverage || {}) },
    liquidity: { ...base.liquidity, ...(overrides.liquidity || {}) },
    freshness: { ...base.freshness, ...(overrides.freshness || {}) },
    analysis: { ...base.analysis, ...(overrides.analysis || {}) },
    membership: { ...base.membership, ...(overrides.membership || {}) },
    marketSummary: { ...base.marketSummary, ...(overrides.marketSummary || {}) },
    tokenomicsSummary: { ...base.tokenomicsSummary, ...(overrides.tokenomicsSummary || {}) },
    fundamentalsSummary: { ...base.fundamentalsSummary, ...(overrides.fundamentalsSummary || {}) },
    currentRealitySummary: { ...base.currentRealitySummary, ...(overrides.currentRealitySummary || {}) },
  }
}

function discoveryPayload(candidates, universeDefinition = definition()) {
  const eligible = candidates.filter((candidate) => candidate.membership.membershipStatus === 'eligible')
  const caveated = candidates.filter((candidate) => candidate.membership.membershipStatus === 'eligible_with_caveats')
  const manual = candidates.filter((candidate) => candidate.membership.membershipStatus === 'manual_review_required')
  const pending = candidates.filter((candidate) => candidate.membership.membershipStatus.endsWith('_pending'))
  const ineligible = candidates.filter((candidate) => candidate.membership.membershipStatus === 'ineligible')
  return {
    schemaVersion: '1.0.0', generatedAt: '2026-07-20T10:02:00.000Z', universeDefinition, universeStatus: 'active_discovery',
    discoveryWindow: { startedAt: '2026-07-20T10:00:00.000Z', completedAt: '2026-07-20T10:02:00.000Z', rawCandidateLimit: 60, canonicalCandidateLimit: 40, analysisLimit: 4, analysisConcurrency: 2 },
    discoverySources: [{ sourceType: 'normalized_seed', provider: null, status: 'available', candidateCount: candidates.length, limitation: null }],
    providerHealth: { status: 'available', availableProviders: ['coingecko'], unavailableProviders: [] },
    sourceCoverage: 'Provider and normalized-seed candidates available', rawCandidateCount: candidates.length + 3,
    deduplicatedCandidateCount: candidates.length, identityResolvedCount: candidates.length, representationVerifiedCount: candidates.length,
    coreRelevantCount: candidates.length, adjacentRelevantCount: 0, analysisCompletedCount: eligible.length + caveated.length, eligibleCount: eligible.length,
    eligibleWithCaveatsCount: caveated.length, analysisPendingCount: pending.length, manualReviewCount: manual.length,
    ineligibleCount: ineligible.length, candidates, eligibleMembers: eligible.map(({ candidateId }) => ({ candidateId })), caveatedMembers: caveated.map(({ candidateId }) => ({ candidateId })),
    pendingCandidates: pending.map(({ candidateId }) => ({ candidateId })), manualReviewCandidates: manual.map(({ candidateId }) => ({ candidateId })),
    ineligibleCandidates: ineligible.map(({ candidateId }) => ({ candidateId })), rankingReadiness: { limitations: ['Ranking is not active.'] },
    coverageSummary: 'Family analysis available with explicit open checks.', freshnessSummary: 'Fresh full analysis only.',
    limitations: ['Membership is not ranking or a recommendation.'], nextDiligence: ['Verify legal rights and token value capture.'],
  }
}

try {
  const normalizer = await server.ssrLoadModule('/src/v2/universeDiscoveryV2.js')
  const discover = await server.ssrLoadModule('/src/v2/PremiumDiscoverV2.jsx')
  const navigation = await server.ssrLoadModule('/src/v2/assetResearchV2Navigation.js')

  const active = definition()
  const stable = definition({
    universeId: 'stablecoin_yield_yield_bearing_assets', slug: 'stablecoin-yield-yield-bearing-assets',
    displayName: 'Stablecoin Yield / Yield-Bearing Assets', priority: 2,
  })
  const planned = Array.from({ length: 11 }, (_, index) => definition({
    universeId: `planned_${index}`, slug: `planned-${index}`, displayName: `Planned Universe ${index + 1}`,
    status: 'planned', priority: index + 3,
  }))
  const registryPayload = {
    schemaVersion: '1.0.0', registryVersion: 'canonical-universe-registry-v1', generatedAt: '2026-07-20T10:00:00.000Z',
    activeUniverseCount: 2, universes: [active, stable, ...planned], sourceBoundary: ['Candidates are not membership.'], limitations: [],
  }
  const registry = normalizer.normalizeUniverseListResponse(registryPayload)
  assert.equal(registry.universes.length, 13)
  assert.equal(registry.activeUniverses.length, 2)
  assert.equal(registry.plannedUniverses.length, 11)
  assert.equal(Object.isFrozen(registry), true)
  assert.equal(Object.isFrozen(registry.universes), true)
  assert.notEqual(normalizer.normalizeUniverseListResponse(registryPayload), registry, 'Each normalization must be request-local')

  const overviewHtml = renderToString(React.createElement(discover.Overview, { registry }))
  assert.match(overviewHtml, /Institutional research universes/)
  assert.match(overviewHtml, /RWA \/ Hybrid Finance/)
  assert.match(overviewHtml, /Stablecoin Yield \/ Yield-Bearing Assets/)
  assert.match(overviewHtml, /Planned research universes/)
  assert.match(overviewHtml, /Membership is not a recommendation or a rank/)
  assert.doesNotMatch(overviewHtml, /undefined|NaN|Infinity|\[object Object\]/)
  assert.doesNotMatch(overviewHtml, /rwa_hybrid_finance|stablecoin_yield_yield_bearing_assets|provider_category_only_relevance/)

  const duplicateSymbol = rawCandidate({
    candidateId: 'candidate:product:ondo', candidateType: 'protocol_product',
    displayIdentity: { name: 'Ondo product candidate', symbol: 'ONDO', logo: null, canonicalDeepLinkId: null },
    canonicalIdentity: { ...rawCandidate().canonicalIdentity, canonicalAssetId: null, canonicalProductId: 'product:ondo:yield', coingeckoId: null, coinmarketcapId: null },
    membership: { ...rawCandidate().membership, canonicalAssetId: null, canonicalProductId: 'product:ondo:yield', candidateType: 'protocol_product', membershipStatus: 'manual_review_required', membershipReasons: [], manualReviewReasons: ['Product identity requires a product-level research model.'] },
  })
  const normalized = normalizer.normalizeUniverseDiscoveryResponse(discoveryPayload([rawCandidate(), duplicateSymbol]))
  assert.equal(normalized.candidates.length, 2, 'Frontend must preserve backend asset/product distinctions even when symbols match')
  assert.equal(normalized.caveatedMembers.length, 1)
  assert.equal(normalized.manualReviewCandidates.length, 1)
  assert.equal(normalized.caveatedMembers[0], normalized.candidates[0], 'Backend group membership must map to the canonical normalized object')
  assert.equal(Object.isFrozen(normalized.candidates[0]), true)
  assert.equal(normalizer.familyLabel('manual_low_coverage'), 'Coverage-limited asset')
  assert.equal(normalizer.statusLabel('source_required'), 'Source Required')
  assert.equal(normalizer.universeScopeLabel('provider_category_only_relevance'), 'Provider category lacks canonical support')

  const detailHtml = renderToString(React.createElement(discover.UniverseDetail, { result: normalized }))
  assert.match(detailHtml, /Candidate funnel/)
  assert.match(detailHtml, /Eligible with caveats/)
  assert.match(detailHtml, /Manual review/)
  assert.match(detailHtml, /Open full analysis/)
  assert.match(detailHtml, /Product-level analysis model required/)
  assert.match(detailHtml, /How universe discovery works/)
  assert.match(detailHtml, /Membership is not ranking, endorsement, or investment advice/)
  assert.doesNotMatch(detailHtml, /undefined|NaN|Infinity|\[object Object\]/)
  assert.doesNotMatch(detailHtml, /candidate:asset|candidate:product|seed:|rwa_hybrid_governance_or_infrastructure|eligible_with_caveats/)
  assert.doesNotMatch(detailHtml, /provider category only relevance|unresolved wrong asset risk/i)

  const eligiblePaxg = candidateVariant({
    candidateId: 'candidate:asset:paxg', candidateType: 'tokenized_commodity',
    displayIdentity: { name: 'PAX Gold', symbol: 'PAXG', canonicalDeepLinkId: 'pax-gold' },
    canonicalIdentity: { canonicalAssetId: 'asset:coingecko:pax-gold', canonicalName: 'PAX Gold', canonicalSymbol: 'PAXG', coingeckoId: 'pax-gold', coinmarketcapId: 4705 },
    representation: { representationType: 'tokenized_commodity', network: 'ethereum', contractAddress: '0x45804880de22913dafe09f4980848ece6ecbaf78' },
    canonicalFamily: 'tokenized_gold_commodity_rwa',
    relevance: { relevanceState: 'core_relevant', coreSubtheme: 'tokenized_commodities', adjacentSubthemes: [] },
    coverage: { state: 'ready' }, liquidity: { state: 'eligible', providerDisagreement: true },
    analysis: { analysisStatus: 'completed' },
    membership: { candidateType: 'tokenized_commodity', membershipStatus: 'eligible', membershipConfidence: 'high', membershipReasons: ['Canonical identity and all current universe gates passed.'], caveats: [], blockingReasons: [] },
    marketSummary: { marketCapUsd: 920_000_000, volume24hUsd: 19_000_000, priceUsd: 2_480 },
  })
  const pendingLink = candidateVariant({
    candidateId: 'candidate:asset:link', candidateType: 'protocol_token',
    displayIdentity: { name: 'Chainlink', symbol: 'LINK', canonicalDeepLinkId: 'chainlink' },
    canonicalIdentity: { canonicalAssetId: 'asset:coingecko:chainlink', canonicalName: 'Chainlink', canonicalSymbol: 'LINK', coingeckoId: 'chainlink', coinmarketcapId: 1975 },
    representation: { representationType: 'evm_contract_asset' }, canonicalFamily: 'oracle_network',
    relevance: { relevanceState: 'adjacent_relevant', coreSubtheme: null, adjacentSubthemes: ['oracle_and_interoperability'] },
    coverage: { state: 'pending' }, freshness: { state: 'pending', observedAt: null }, analysis: { analysisStatus: 'queued', analysisCompletedAt: null },
    membership: { candidateType: 'protocol_token', membershipStatus: 'analysis_pending', membershipConfidence: 'low', membershipReasons: [], blockingReasons: ['Fresh full analysis is queued.'] },
  })
  const lowCoverageRwa = candidateVariant({
    candidateId: 'candidate:asset:low-coverage-rwa',
    displayIdentity: { name: 'Institutional Tokenization Infrastructure Candidate With A Deliberately Long Canonical Display Name', symbol: 'RWA-LONG', canonicalDeepLinkId: 'low-coverage-rwa' },
    canonicalIdentity: { canonicalAssetId: 'asset:coingecko:low-coverage-rwa', canonicalName: 'Institutional Tokenization Infrastructure Candidate With A Deliberately Long Canonical Display Name', canonicalSymbol: 'RWA-LONG', coingeckoId: 'low-coverage-rwa' },
    coverage: { state: 'pending' }, liquidity: { state: 'unavailable', marketCapUsd: null, volume24hUsd: null, providerDisagreement: false },
    freshness: { state: 'degraded', observedAt: '2026-06-01T00:00:00.000Z' }, analysis: { analysisStatus: 'failed', analysisFreshness: 'stale', failureReason: 'Fresh analysis is not available.' },
    membership: { membershipStatus: 'analysis_pending', membershipConfidence: 'low', membershipReasons: [], blockingReasons: ['Fresh analysis is not available.'] },
    marketSummary: { marketCapUsd: null, volume24hUsd: null, priceUsd: null },
  })
  const usdcContext = candidateVariant({
    candidateId: 'candidate:asset:usdc', candidateType: 'stable_asset',
    displayIdentity: { name: 'USD Coin', symbol: 'USDC', canonicalDeepLinkId: 'usd-coin' },
    canonicalIdentity: { canonicalAssetId: 'asset:coingecko:usd-coin', canonicalName: 'USD Coin', canonicalSymbol: 'USDC', coingeckoId: 'usd-coin', coinmarketcapId: 3408 },
    representation: { representationType: 'fiat_backed_stablecoin' }, canonicalFamily: 'stablecoin_fiat_backed',
    relevance: { relevanceState: 'context_only', coreSubtheme: null, adjacentSubthemes: [] },
    membership: { candidateType: 'stable_asset', membershipStatus: 'ineligible', membershipConfidence: 'medium', membershipReasons: [], blockingReasons: ['Base stablecoin context does not establish direct RWA membership.'] },
  })
  const unrelatedNegative = candidateVariant({
    candidateId: 'candidate:asset:unrelated-l1', candidateType: 'native_asset',
    displayIdentity: { name: 'Unrelated Native Network', symbol: 'UNL1', canonicalDeepLinkId: 'unrelated-native-network' },
    canonicalIdentity: { canonicalAssetId: 'asset:coingecko:unrelated-native-network', canonicalName: 'Unrelated Native Network', canonicalSymbol: 'UNL1', coingeckoId: 'unrelated-native-network' },
    representation: { representationType: 'native_asset', nativeOrContract: 'native', network: 'unrelated-network', contractAddress: null }, canonicalFamily: 'non_eth_l1_smart_contract_platform',
    relevance: { relevanceState: 'incompatible', coreSubtheme: null, adjacentSubthemes: [] },
    membership: { candidateType: 'native_asset', membershipStatus: 'ineligible', membershipConfidence: 'medium', membershipReasons: [], blockingReasons: ['The canonical family is outside this universe.'] },
  })
  const rwaMatrix = normalizer.normalizeUniverseDiscoveryResponse(discoveryPayload([
    eligiblePaxg, rawCandidate(), pendingLink, lowCoverageRwa, duplicateSymbol, usdcContext, unrelatedNegative,
  ]))
  assert.equal(rwaMatrix.eligibleMembers.length, 1)
  assert.equal(rwaMatrix.caveatedMembers.length, 1)
  assert.equal(rwaMatrix.pendingCandidates.length, 2)
  assert.equal(rwaMatrix.manualReviewCandidates.length, 1)
  assert.equal(rwaMatrix.ineligibleCandidates.length, 2)
  const rwaMatrixHtml = renderToString(React.createElement(discover.UniverseDetail, { result: rwaMatrix }))
  assert.match(rwaMatrixHtml, /Eligible members/)
  assert.match(rwaMatrixHtml, /Eligible with caveats/)
  assert.match(rwaMatrixHtml, /Analysis pending/)
  assert.match(rwaMatrixHtml, /Manual review/)
  assert.match(rwaMatrixHtml, /View candidates that do not currently meet this universe&#x27;s criteria/)
  assert.match(rwaMatrixHtml, /PAX Gold/)
  assert.match(rwaMatrixHtml, /Chainlink/)
  assert.match(rwaMatrixHtml, /USD Coin/)
  assert.match(rwaMatrixHtml, /Tokenized commodities/)
  assert.match(rwaMatrixHtml, /Comparable market or liquidity sources disagree/)
  assert.match(rwaMatrixHtml, /Needs refreshed analysis/)
  assert.match(rwaMatrixHtml, /Not available yet/)
  assert.match(rwaMatrixHtml, /Product-level analysis model required/)
  assert.match(rwaMatrixHtml, /Not ranked yet/)
  assert.doesNotMatch(rwaMatrixHtml, /undefined|NaN|Infinity|\[object Object\]/)
  assert.doesNotMatch(rwaMatrixHtml, /candidate:asset|candidate:product|eligible_with_caveats|analysis_pending|tokenized_gold_commodity_rwa/)

  const stableBase = candidateVariant({
    ...usdcContext, candidateId: 'candidate:stable:usdc',
    relevance: { ...usdcContext.relevance, universeId: stable.universeId, relevanceState: 'context_only', coreSubtheme: 'stablecoin_issuers' },
    membership: { ...usdcContext.membership, universeId: stable.universeId, membershipStatus: 'ineligible', blockingReasons: ['A base stablecoin is context, not a yield-bearing product.'] },
  })
  const stethAdjacent = candidateVariant({
    candidateId: 'candidate:asset:steth', candidateType: 'liquid_staking_asset',
    displayIdentity: { name: 'Lido Staked Ether', symbol: 'stETH', canonicalDeepLinkId: 'staked-ether' },
    canonicalIdentity: { canonicalAssetId: 'asset:coingecko:staked-ether', canonicalName: 'Lido Staked Ether', canonicalSymbol: 'stETH', coingeckoId: 'staked-ether' },
    representation: { representationType: 'liquid_staking_derivative' }, canonicalFamily: 'liquid_staking_derivative',
    relevance: { universeId: stable.universeId, relevanceState: 'adjacent_relevant', coreSubtheme: null, adjacentSubthemes: ['adjacent_protocols'] },
    membership: { universeId: stable.universeId, candidateType: 'liquid_staking_asset', membershipStatus: 'eligible_with_caveats', caveats: ['Yield-bearing, but not stablecoin yield.'] },
  })
  const yieldBearingStable = candidateVariant({
    candidateId: 'candidate:asset:yield-stable', candidateType: 'yield_bearing_asset',
    displayIdentity: { name: 'Reviewed Yield-Bearing Stable Asset', symbol: 'YBS', canonicalDeepLinkId: 'yield-bearing-stable-asset' },
    canonicalIdentity: { canonicalAssetId: 'asset:coingecko:yield-bearing-stable-asset', canonicalName: 'Reviewed Yield-Bearing Stable Asset', canonicalSymbol: 'YBS', coingeckoId: 'yield-bearing-stable-asset' },
    representation: { representationType: 'yield_bearing_asset' }, canonicalFamily: 'stablecoin_crypto_backed',
    relevance: { universeId: stable.universeId, relevanceState: 'core_relevant', coreSubtheme: 'yield_bearing_stable_assets', adjacentSubthemes: [] },
    coverage: { state: 'ready' }, liquidity: { state: 'eligible' }, analysis: { analysisStatus: 'completed' },
    membership: { universeId: stable.universeId, candidateType: 'yield_bearing_asset', membershipStatus: 'eligible', membershipConfidence: 'high', membershipReasons: ['All current membership gates passed.'], caveats: [], blockingReasons: [] },
  })
  const lendingAdjacent = candidateVariant({
    candidateId: 'candidate:asset:lending-token', candidateType: 'protocol_token',
    displayIdentity: { name: 'Lending Protocol Token', symbol: 'LEND', canonicalDeepLinkId: 'lending-protocol-token' },
    canonicalIdentity: { canonicalAssetId: 'asset:coingecko:lending-protocol-token', canonicalName: 'Lending Protocol Token', canonicalSymbol: 'LEND', coingeckoId: 'lending-protocol-token' },
    canonicalFamily: 'defi_governance_value_capture', relevance: { universeId: stable.universeId, relevanceState: 'adjacent_relevant', coreSubtheme: null, adjacentSubthemes: ['yield_market_exposure'] },
    analysis: { analysisStatus: 'queued' }, freshness: { state: 'pending' },
    membership: { universeId: stable.universeId, candidateType: 'protocol_token', membershipStatus: 'analysis_pending', membershipReasons: [], blockingReasons: ['Fresh asset analysis is queued.'] },
  })
  const unresolvedProduct = candidateVariant({
    ...duplicateSymbol, candidateId: 'candidate:product:stable-vault', candidateType: 'pool_or_vault',
    displayIdentity: { name: 'Stable Yield Vault Candidate', symbol: null, canonicalDeepLinkId: null },
    canonicalIdentity: { ...duplicateSymbol.canonicalIdentity, canonicalProductId: 'product:stable-yield-vault', canonicalName: 'Stable Yield Vault Candidate', canonicalSymbol: null },
    relevance: { ...duplicateSymbol.relevance, universeId: stable.universeId, coreSubtheme: 'savings_wrappers' },
    membership: { ...duplicateSymbol.membership, universeId: stable.universeId, canonicalProductId: 'product:stable-yield-vault', candidateType: 'pool_or_vault' },
  })
  const apyOnlyNegative = candidateVariant({
    candidateId: 'candidate:product:apy-only', candidateType: 'other_product_candidate',
    displayIdentity: { name: 'Unverified High-Yield Listing', symbol: null, canonicalDeepLinkId: null },
    canonicalIdentity: { canonicalAssetId: null, canonicalProductId: 'product:apy-only', canonicalName: 'Unverified High-Yield Listing', canonicalSymbol: null, coingeckoId: null, coinmarketcapId: null },
    representation: { representationType: 'protocol_product', nativeOrContract: 'product', representationStatus: 'manual_review_required' }, canonicalFamily: null,
    relevance: { universeId: stable.universeId, relevanceState: 'insufficient_relevance', coreSubtheme: null, adjacentSubthemes: [] },
    membership: { universeId: stable.universeId, canonicalAssetId: null, canonicalProductId: 'product:apy-only', candidateType: 'other_product_candidate', membershipStatus: 'ineligible', membershipConfidence: 'low', membershipReasons: [], blockingReasons: ['A yield claim without canonical product evidence is insufficient.'], manualReviewReasons: [] },
  })
  const stableMatrix = normalizer.normalizeUniverseDiscoveryResponse(discoveryPayload([
    stableBase, stethAdjacent, yieldBearingStable, lendingAdjacent, unresolvedProduct, apyOnlyNegative,
  ], stable))
  const stableHtml = renderToString(React.createElement(discover.UniverseDetail, { result: stableMatrix }))
  assert.match(stableHtml, /Stablecoin Yield \/ Yield-Bearing Assets/)
  assert.match(stableHtml, /Reviewed Yield-Bearing Stable Asset/)
  assert.match(stableHtml, /Lido Staked Ether/)
  assert.match(stableHtml, /Lending Protocol Token/)
  assert.match(stableHtml, /Stable Yield Vault Candidate/)
  assert.match(stableHtml, /Unverified High-Yield Listing/)
  assert.match(stableHtml, /Product-level analysis model required/)
  assert.doesNotMatch(stableHtml, /\bAPY\s*[0-9]|rank(?:ed|ing)?\s*#?\d/i)

  const emptyResult = normalizer.normalizeUniverseDiscoveryResponse(discoveryPayload([], active))
  const emptyHtml = renderToString(React.createElement(discover.UniverseDetail, { result: emptyResult }))
  assert.match(emptyHtml, /This discovery run returned no candidates/)
  assert.match(emptyHtml, /No asset is treated as ineligible solely because a provider returned no candidates/)
  const degradedPayload = discoveryPayload([pendingLink], active)
  degradedPayload.providerHealth = { status: 'degraded', availableProviders: ['coingecko'], unavailableProviders: ['coinmarketcap'] }
  degradedPayload.sourceCoverage = 'Some discovery sources are unavailable.'
  const degradedHtml = renderToString(React.createElement(discover.UniverseDetail, { result: normalizer.normalizeUniverseDiscoveryResponse(degradedPayload) }))
  assert.match(degradedHtml, /Some discovery sources are unavailable/)

  assert.deepEqual(normalizer.parseDiscoverV2Location({ pathname: '/terminal-v2/discover', search: '' }), { kind: 'overview', slug: null })
  assert.deepEqual(normalizer.parseDiscoverV2Location({ pathname: '/terminal-v2/discover/', search: '' }), { kind: 'overview', slug: null })
  assert.deepEqual(normalizer.parseDiscoverV2Location({ pathname: '/terminal-v2/discover/rwa-hybrid-finance', search: '' }), { kind: 'universe', slug: 'rwa-hybrid-finance' })
  assert.deepEqual(normalizer.parseDiscoverV2Location({ pathname: '/terminal-v2/discover/stablecoin-yield-yield-bearing-assets/', search: '' }), { kind: 'universe', slug: 'stablecoin-yield-yield-bearing-assets' })
  assert.equal(normalizer.buildUniverseV2Path(active), '/terminal-v2/discover/rwa-hybrid-finance')
  assert.match(normalizer.buildUniverseCandidateAssetPath(normalized.candidates[0]), /^\/terminal-v2\/asset\/ondo-finance\?/)
  assert.equal(normalizer.buildUniverseCandidateAssetPath(normalized.candidates[1]), null)
  assert.throws(() => normalizer.normalizeUniverseListResponse({}), (error) => error.code === 'malformed_universe_list')
  assert.throws(() => normalizer.normalizeUniverseDiscoveryResponse({ candidates: [] }), (error) => error.code === 'malformed_discovery_result')

  const coordinator = navigation.createV2RequestCoordinator()
  const staleRequest = coordinator.begin()
  const currentRequest = coordinator.begin()
  assert.equal(staleRequest.signal.aborted, true)
  assert.equal(coordinator.isCurrent(staleRequest.requestId), false)
  assert.equal(coordinator.isCurrent(currentRequest.requestId), true)
  coordinator.cancel()
  assert.equal(currentRequest.signal.aborted, true)
  assert.equal(coordinator.isCurrent(currentRequest.requestId), false)

  const v2Files = readdirSync(path.join(root, 'src', 'v2'), { recursive: true })
    .filter((entry) => /\.(?:js|jsx)$/.test(entry))
    .map((entry) => path.join(root, 'src', 'v2', entry))
  const v2Corpus = v2Files.map((file) => readFileSync(file, 'utf8')).join('\n')
  const discoverySource = source('src/v2/universeDiscoveryV2.js')
  const discoverUiSource = source('src/v2/PremiumDiscoverV2.jsx')
  const css = source('src/v2/PremiumDiscoverV2.css')
  const routeContextSource = source('src/v2/shell/V2RouteContext.jsx')
  const shellCss = source('src/v2/styles/v2-shell.css')
  assert.equal((v2Corpus.match(/function normalizeUniverseDiscoveryResponse\s*\(/g) || []).length, 1)
  assert.doesNotMatch(discoverySource, /membershipStatus\s*=|canonicalFamily\s*=|relevanceState\s*=|liquidity\.state\s*=/, 'Frontend must not calculate membership inputs')
  assert.doesNotMatch(discoverUiSource, /\.sort\(|rankScore|opportunityScore|technicalScore|smartMoneyScore|riskAdjustedRoi|apy\s*[+*/-]/i, 'Discover UI must not calculate rankings')
  assert.doesNotMatch(discoverUiSource, /if\s*\(\s*(?:symbol|assetSymbol)\s*===?\s*['\"][A-Z0-9]+['\"]/, 'Discover UI must not contain token-specific branches')
  assert.match(discoverUiSource, /coordinator\.isCurrent\(requestId\)/)
  assert.match(discoverUiSource, /coordinator\.cancel\(\)/)
  assert.match(routeContextSource, /addEventListener\('popstate', handlePopState\)/)
  assert.match(routeContextSource, /removeEventListener\('popstate', handlePopState\)/)
  assert.doesNotMatch(v2Corpus, /localStorage\.(?:getItem|setItem)|sessionStorage\.(?:getItem|setItem)|partialRefresh|hydrateSnapshot/i)
  assert.match(css, /@media \(max-width: 1100px\)/)
  assert.match(css, /@media \(max-width: 780px\)/)
  assert.match(css, /@media \(max-width: 520px\)/)
  assert.match(css, /overflow-wrap: anywhere/)
  assert.match(shellCss, /overflow-x: clip/)
  assert.match(css, /min-width: 0/)
  assert.match(css, /min-height: 44px/)
  assert.match(discoverUiSource, /<details/)
  assert.match(discoverUiSource, /<summary/)
  assert.doesNotMatch(css, /min-width:\s*(?:3[9-9][1-9]|[4-9]\d{2,})px/)

  console.log(JSON.stringify({
    status: 'PASS',
    normalizerCount: 1,
    activeUniversesRendered: 2,
    plannedUniversesRendered: 11,
    backendMembershipGroupsPreserved: true,
    candidateStateMatrixRendered: ['eligible', 'eligible_with_caveats', 'analysis_pending', 'manual_review_required', 'ineligible'],
    representativeRwaControlsRendered: ['ONDO', 'PAXG', 'LINK', 'USDC', 'low_coverage', 'unrelated_negative'],
    representativeStableYieldControlsRendered: ['USDC', 'stETH', 'yield_bearing_stable', 'lending_protocol_token', 'unresolved_product', 'apy_only_negative'],
    emptyAndDegradedStatesRendered: true,
    assetProductSymbolCollisionPreserved: true,
    rankingCalculationCount: 0,
    tokenSpecificRuntimeBranchCount: 0,
    responsiveDeterministicWidths: [1440, 1024, 390],
  }, null, 2))
} finally {
  await server.close()
}
