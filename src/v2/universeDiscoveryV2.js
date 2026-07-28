import { fetchV2Json, V2ApiError } from './assetResearchV2Api'
import { buildV2AssetPath } from './assetResearchV2Navigation'
import { matchV2DiscoverRoute } from './v2RouteConfig'

const STATUS_LABELS = Object.freeze({
  active_discovery: 'Active discovery',
  planned: 'Planned',
  eligible: 'Eligible',
  eligible_with_caveats: 'Eligible with caveats',
  analysis_pending: 'Fresh analysis pending',
  identity_pending: 'Canonical identity pending',
  representation_pending: 'Representation verification pending',
  relevance_pending: 'Universe fit pending',
  coverage_pending: 'Coverage review pending',
  liquidity_pending: 'Liquidity review pending',
  manual_review_required: 'Manual verification required',
  ineligible: "Does not currently meet this universe's criteria",
  available: 'Available',
  degraded: 'Limited coverage',
  unavailable: 'Not available yet',
  ready: 'Ready',
  partially_ready: 'Partially ready',
  pending: 'Pending',
  completed: 'Analysis complete',
  completed_with_caveats: 'Analysis complete with caveats',
  failed: 'Analysis unavailable',
  timed_out: 'Analysis timed out',
  queued: 'Queued for analysis',
  not_started: 'Not started',
  core_relevant: 'Core relevance',
  adjacent_relevant: 'Adjacent relevance',
  context_only: 'Context only',
  insufficient_relevance: 'Insufficient relevance',
  incompatible: 'Outside scope',
  verified: 'Verified representation',
  verified_with_caveat: 'Verified with caveats',
  passed: 'Canonical identity resolved',
  passed_with_caveat: 'Identity resolved with caveats',
  eligible_with_caveat: 'Eligible with caveats',
  insufficient: 'Below current liquidity threshold',
  not_applicable: 'Not applicable',
  future_milestone: 'Planned',
  blocked: 'Not ready',
})

const FAMILY_LABELS = Object.freeze({
  rwa_hybrid_governance_or_infrastructure: 'RWA governance or infrastructure',
  rwa_infrastructure_utility: 'RWA infrastructure utility',
  tokenized_gold_commodity_rwa: 'Tokenized commodity',
  oracle_network: 'Oracle and interoperability network',
  defi_governance_value_capture: 'DeFi governance and value capture',
  stablecoin_fiat_backed: 'Fiat-backed stablecoin',
  stablecoin_crypto_backed: 'Crypto-backed stablecoin',
  stablecoin_algorithmic_or_synthetic: 'Synthetic or algorithmic stablecoin',
  liquid_staking_derivative: 'Liquid staking asset',
  native_btc_pow_monetary: 'Native proof-of-work monetary asset',
  native_eth_pos_gas_l2_fee_market: 'Native proof-of-stake settlement asset',
  non_eth_l1_smart_contract_platform: 'Native smart-contract network',
  wrapped_bridged_asset: 'Wrapped or bridged asset',
  payments_settlement_network: 'Payments and settlement network',
  depin_resource_network: 'DePIN resource network',
  meme_market_structure: 'Meme and market-structure asset',
  manual_low_coverage: 'Coverage-limited asset',
})

const CANDIDATE_TYPE_LABELS = Object.freeze({
  canonical_asset: 'Digital asset',
  protocol_token: 'Protocol token',
  native_asset: 'Native asset',
  stable_asset: 'Base stable asset',
  yield_bearing_asset: 'Yield-bearing asset',
  wrapped_asset: 'Wrapped asset',
  liquid_staking_asset: 'Liquid staking asset',
  tokenized_claim: 'Tokenized claim',
  tokenized_commodity: 'Tokenized commodity',
  governance_token: 'Governance token',
  protocol_product: 'Protocol product',
  pool_or_vault: 'Pool or vault',
  other_product_candidate: 'Product candidate',
})

const UNIVERSE_SCOPE_LABELS = Object.freeze({
  tokenization_platforms: 'Tokenization platforms',
  tokenized_treasuries_and_funds: 'Tokenized treasuries and funds',
  tokenized_credit: 'Tokenized credit',
  tokenized_commodities: 'Tokenized commodities',
  rwa_lending_and_credit: 'RWA lending and credit',
  institutional_infrastructure: 'Institutional infrastructure',
  oracle_and_interoperability: 'Oracle and interoperability',
  custody_and_settlement: 'Custody and settlement',
  compliant_stable_assets: 'Compliant stable assets',
  asset_servicing: 'Asset servicing',
  stablecoin_issuers: 'Stablecoin issuers',
  yield_bearing_stable_assets: 'Yield-bearing stable assets',
  savings_wrappers: 'Savings wrappers',
  tokenized_treasury_yield: 'Tokenized treasury yield',
  lending_based_stable_yield: 'Lending-based stable yield',
  yield_market_exposure: 'Yield-market exposure',
  adjacent_protocols: 'Adjacent yield protocols',
  unresolved_wrong_asset_risk: 'Canonical identity remains unresolved',
  incompatible_family: 'Outside the universe family scope',
  product_forced_into_asset_identity: 'Product lacks canonical asset identity',
  provider_category_only_relevance: 'Provider category lacks canonical support',
})

const ERROR_COPY = Object.freeze({
  universe_not_found: 'This research universe could not be found.',
  universe_inactive: 'This research universe is planned but is not active yet.',
  discovery_unavailable: 'Live universe discovery is temporarily unavailable.',
  provider_coverage_degraded: 'Some discovery sources are unavailable.',
  identity_resolution_failed: 'Canonical identity could not be established.',
  analysis_capacity_reached: 'Additional candidates will be analyzed in a later run.',
  request_cancelled: 'The discovery request was cancelled.',
  internal_data_integrity_error: 'The discovery result failed its data-integrity check.',
})

export class UniverseDiscoveryV2ContractError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'UniverseDiscoveryV2ContractError'
    this.code = code
  }
}

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function array(value) {
  return Array.isArray(value) ? value : []
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    Object.values(value).forEach(deepFreeze)
  }
  return value
}

function requireDefinition(definition) {
  if (!isRecord(definition) || typeof definition.universeId !== 'string' || typeof definition.slug !== 'string' || typeof definition.displayName !== 'string') {
    throw new UniverseDiscoveryV2ContractError('malformed_universe_definition', 'The universe definition is malformed.')
  }
  return definition
}

function requireCandidate(candidate) {
  if (!isRecord(candidate) || !isRecord(candidate.membership) || !isRecord(candidate.displayIdentity) || !isRecord(candidate.canonicalIdentity)) {
    throw new UniverseDiscoveryV2ContractError('malformed_discovery_candidate', 'A discovery candidate is malformed.')
  }
  return deepFreeze({
    ...candidate,
    technicalReadiness: isRecord(candidate.technicalReadiness) ? {
      technicalDataReady: Boolean(candidate.technicalReadiness.technicalDataReady),
      priceHistoryReady: Boolean(candidate.technicalReadiness.priceHistoryReady),
      marketCapHistoryReady: Boolean(candidate.technicalReadiness.marketCapHistoryReady),
      projectedSupplyReady: Boolean(candidate.technicalReadiness.projectedSupplyReady),
      scenarioValuationReady: Boolean(candidate.technicalReadiness.scenarioValuationReady),
      technicalRankingReadiness: candidate.technicalReadiness.technicalRankingReadiness || 'not_ready',
    } : {
      technicalDataReady: false,
      priceHistoryReady: false,
      marketCapHistoryReady: false,
      projectedSupplyReady: false,
      scenarioValuationReady: false,
      technicalRankingReadiness: 'not_ready',
    },
    providerOrigins: array(candidate.providerOrigins),
    seedOrigins: array(candidate.seedOrigins),
    limitations: array(candidate.limitations),
    display: {
      membership: statusLabel(candidate.membership.membershipStatus),
      candidateType: candidateTypeLabel(candidate.candidateType),
      family: familyLabel(candidate.canonicalFamily),
      representation: cleanLabel(candidate.representation?.representationType, 'Representation pending'),
      relevance: statusLabel(candidate.relevance?.relevanceState),
      coverage: statusLabel(candidate.coverage?.state),
      liquidity: statusLabel(candidate.liquidity?.state),
      analysis: statusLabel(candidate.analysis?.analysisStatus),
      freshness: candidate.freshness?.state === 'ready'
        ? 'Fresh analysis'
        : candidate.freshness?.state === 'degraded'
          ? 'Needs refreshed analysis'
          : statusLabel(candidate.freshness?.state),
      technicalReadiness: candidate.technicalReadiness?.technicalDataReady
        ? 'Technical data ready'
        : 'Technical data pending',
    },
  })
}

export function statusLabel(value) {
  return STATUS_LABELS[value] || cleanLabel(value, 'Status unavailable')
}

export function familyLabel(value) {
  return FAMILY_LABELS[value] || cleanLabel(value, 'Family pending')
}

export function candidateTypeLabel(value) {
  return CANDIDATE_TYPE_LABELS[value] || cleanLabel(value, 'Candidate')
}

export function universeScopeLabel(value) {
  return UNIVERSE_SCOPE_LABELS[value] || cleanLabel(value, 'Scope not available yet')
}

export function cleanLabel(value, fallback = 'Not available yet') {
  if (typeof value !== 'string' || !value.trim()) return fallback
  return value.trim().replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function normalizeUniverseListResponse(payload) {
  if (!isRecord(payload) || !Array.isArray(payload.universes) || typeof payload.activeUniverseCount !== 'number') {
    throw new UniverseDiscoveryV2ContractError('malformed_universe_list', 'The universe list is malformed.')
  }
  const universes = payload.universes.map(requireDefinition)
  return deepFreeze({
    schemaVersion: payload.schemaVersion,
    registryVersion: payload.registryVersion,
    generatedAt: payload.generatedAt,
    activeUniverseCount: payload.activeUniverseCount,
    universes,
    activeUniverses: universes.filter((entry) => entry.status === 'active_discovery'),
    plannedUniverses: universes.filter((entry) => entry.status === 'planned'),
    sourceBoundary: array(payload.sourceBoundary),
    limitations: array(payload.limitations),
  })
}

export function normalizeUniverseDefinitionResponse(payload) {
  if (!isRecord(payload)) throw new UniverseDiscoveryV2ContractError('malformed_universe_definition', 'The universe response is malformed.')
  return deepFreeze({ schemaVersion: payload.schemaVersion, generatedAt: payload.generatedAt, universeDefinition: requireDefinition(payload.universeDefinition) })
}

export function normalizeUniverseDiscoveryResponse(payload) {
  if (!isRecord(payload) || typeof payload.schemaVersion !== 'string' || !Array.isArray(payload.candidates)) {
    throw new UniverseDiscoveryV2ContractError('malformed_discovery_result', 'The universe discovery result is malformed.')
  }
  const definition = requireDefinition(payload.universeDefinition)
  const candidates = payload.candidates.map(requireCandidate)
  const byId = new Map(candidates.map((candidate) => [candidate.candidateId, candidate]))
  const mapGroup = (items) => array(items).map((item) => byId.get(item?.candidateId)).filter(Boolean)
  return deepFreeze({
    ...payload,
    universeDefinition: definition,
    candidates,
    eligibleMembers: mapGroup(payload.eligibleMembers),
    caveatedMembers: mapGroup(payload.caveatedMembers),
    pendingCandidates: mapGroup(payload.pendingCandidates),
    manualReviewCandidates: mapGroup(payload.manualReviewCandidates),
    ineligibleCandidates: mapGroup(payload.ineligibleCandidates),
    discoverySources: array(payload.discoverySources),
    limitations: array(payload.limitations),
    nextDiligence: array(payload.nextDiligence),
  })
}

export function parseDiscoverV2Location(locationLike) {
  return matchV2DiscoverRoute(locationLike)
}

export function buildUniverseV2Path(definition) {
  return definition?.slug ? `/terminal-v2/discover/${encodeURIComponent(definition.slug)}` : null
}

export function buildUniverseCandidateAssetPath(candidate, sourceUniverseSlug = null) {
  if (!candidate?.displayIdentity?.canonicalDeepLinkId || candidate?.canonicalIdentity?.canonicalProductId) return null
  const path = buildV2AssetPath({
    coingeckoId: candidate.canonicalIdentity.coingeckoId,
    coinmarketcapId: candidate.canonicalIdentity.coinmarketcapId,
    chain: candidate.representation?.network,
    contractAddress: candidate.representation?.contractAddress,
    symbol: candidate.canonicalIdentity.canonicalSymbol,
    name: candidate.canonicalIdentity.canonicalName,
    identitySummary: { representationType: candidate.representation?.representationType },
  })
  if (!path || !sourceUniverseSlug) return path
  return `${path}${path.includes('?') ? '&' : '?'}from=${encodeURIComponent(sourceUniverseSlug)}`
}

export function universeErrorMessage(error) {
  const code = error?.code || 'discovery_unavailable'
  return ERROR_COPY[code] || error?.message || ERROR_COPY.discovery_unavailable
}

export async function fetchUniverseListV2(signal) {
  return normalizeUniverseListResponse(await fetchV2Json('/api/v2/universes', { signal }, 20_000))
}

export async function fetchUniverseDefinitionV2(slug, signal) {
  return normalizeUniverseDefinitionResponse(await fetchV2Json(`/api/v2/universes/${encodeURIComponent(slug)}`, { signal }, 20_000))
}

export async function discoverUniverseV2(slug, signal, limits = {}) {
  try {
    const payload = await fetchV2Json(`/api/v2/universes/${encodeURIComponent(slug)}/discover`, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(limits),
    }, 180_000)
    return normalizeUniverseDiscoveryResponse(payload)
  } catch (error) {
    if (error instanceof V2ApiError && ERROR_COPY[error.code]) throw error
    throw error
  }
}
