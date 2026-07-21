import { fetchV2Json, V2ApiError } from './assetResearchV2Api'

const RANKING_TYPES = Object.freeze(['quality', 'opportunity', 'mathematical_upside', 'risk_adjusted_roi'])

const STATUS_LABELS = Object.freeze({
  active: 'Active policy',
  provisional: 'Provisional policy',
  blocked: 'Unavailable',
  planned: 'Not requested',
  disabled: 'Unavailable',
  applicable: 'Applicable',
  partially_applicable: 'Partially applicable',
  not_applicable: 'Not applicable',
  blocked_by_missing_product_model: 'Product analysis required',
  blocked_by_missing_canonical_data: 'Canonical data required',
  rankable: 'Rankable',
  rankable_with_caveats: 'Rankable with caveats',
  provisional_rankable: 'Provisionally rankable',
  analysis_pending: 'Fresh analysis pending',
  membership_not_eligible: 'Not currently eligible',
  identity_unresolved: 'Canonical identity unresolved',
  representation_unresolved: 'Representation unresolved',
  insufficient_coverage: 'Evidence coverage below threshold',
  insufficient_freshness: 'Current analysis required',
  missing_critical_inputs: 'Critical inputs unavailable',
  ranking_not_applicable: 'Not applicable',
  product_model_required: 'Product analysis required',
  manual_review_required: 'Manual verification required',
  unrankable: 'Ranking withheld',
  provisionally_calibrated: 'Provisionally calibrated',
  calibrated_v1: 'Calibrated',
  insufficient_benchmark_coverage: 'More calibration coverage required',
})

const ERROR_COPY = Object.freeze({
  universe_not_found: 'This research universe could not be found.',
  universe_inactive: 'This research universe is not active yet.',
  discovery_unavailable: 'Live universe discovery is temporarily unavailable.',
  no_rankable_candidates: 'No candidate currently passes every ranking gate.',
  ranking_policy_unavailable: 'The ranking policy is temporarily unavailable.',
  calibration_unavailable: 'The ranking calibration is temporarily unavailable.',
  analysis_capacity_reached: 'Some candidates remain pending because this request reached the bounded analysis limit.',
  provider_coverage_degraded: 'Some data sources are unavailable.',
  request_cancelled: 'The ranking request was cancelled.',
  internal_data_integrity_error: 'The ranking response failed its data-integrity check.',
})

export class InstitutionalRankingV2ContractError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'InstitutionalRankingV2ContractError'
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

function cleanLabel(value, fallback = 'Not available') {
  if (typeof value !== 'string' || !value.trim()) return fallback
  return STATUS_LABELS[value] || value.trim().replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function requireFinite(value, code) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new InstitutionalRankingV2ContractError(code, 'A ranking value is not finite.')
  return value
}

function normalizeBreakdown(value) {
  return array(value).map((entry) => {
    if (!isRecord(entry) || typeof entry.componentId !== 'string' || typeof entry.label !== 'string') {
      throw new InstitutionalRankingV2ContractError('malformed_component_breakdown', 'A component breakdown is malformed.')
    }
    if (entry.normalizedValue !== null) requireFinite(entry.normalizedValue, 'invalid_component_value')
    if (entry.contribution !== null) requireFinite(entry.contribution, 'invalid_component_contribution')
    requireFinite(entry.weight, 'invalid_component_weight')
    return {
      ...entry,
      missingInputs: array(entry.missingInputs),
      limitations: array(entry.limitations),
      display: { sourceOwner: cleanLabel(entry.sourceOwnerLabel), freshness: cleanLabel(entry.freshness), confidence: cleanLabel(entry.confidence) },
    }
  })
}

function normalizeRankedCandidates(value, rankingType) {
  const identities = new Set()
  let previousRank = 0
  return array(value).map((candidate) => {
    if (!isRecord(candidate) || typeof candidate.canonicalAssetId !== 'string' || !candidate.canonicalAssetId || typeof candidate.displayName !== 'string') {
      throw new InstitutionalRankingV2ContractError('malformed_ranked_candidate', 'A ranked candidate is malformed.')
    }
    if (identities.has(candidate.canonicalAssetId)) throw new InstitutionalRankingV2ContractError('duplicate_canonical_asset', 'A canonical asset appears more than once in one ranking.')
    identities.add(candidate.canonicalAssetId)
    requireFinite(candidate.rank, 'invalid_rank')
    requireFinite(candidate.rankingScore, 'invalid_ranking_score')
    requireFinite(candidate.rankingConfidence, 'invalid_ranking_confidence')
    requireFinite(candidate.weightedCoverage, 'invalid_ranking_coverage')
    if (candidate.rank < previousRank) throw new InstitutionalRankingV2ContractError('invalid_rank_order', 'Backend ranking order is invalid.')
    previousRank = candidate.rank
    if (candidate.openAnalysisTarget && !String(candidate.openAnalysisTarget).startsWith('/terminal-v2/asset/')) {
      throw new InstitutionalRankingV2ContractError('invalid_asset_deep_link', 'A ranked candidate does not use the canonical asset route.')
    }
    return {
      ...candidate,
      componentBreakdown: normalizeBreakdown(candidate.componentBreakdown),
      riskBreakdown: normalizeBreakdown(candidate.riskBreakdown),
      strongestDrivers: array(candidate.strongestDrivers),
      strongestRisks: array(candidate.strongestRisks),
      caveats: array(candidate.caveats),
      provenance: array(candidate.provenance),
      limitations: array(candidate.limitations),
      display: {
        rankingType: cleanLabel(rankingType),
        candidateType: cleanLabel(candidate.candidateType, 'Asset'),
        family: cleanLabel(candidate.canonicalFamily, 'Family pending'),
        representation: cleanLabel(candidate.representation, 'Representation pending'),
        membership: cleanLabel(candidate.membershipStatus),
        freshness: candidate.analysisFreshness === 'ready' ? 'Fresh analysis' : cleanLabel(candidate.analysisFreshness),
      },
    }
  })
}

function normalizeWithheld(value, rankingType) {
  return array(value).map((candidate) => {
    if (!isRecord(candidate) || typeof candidate.displayName !== 'string' || typeof candidate.rankabilityStatus !== 'string') {
      throw new InstitutionalRankingV2ContractError('malformed_withheld_candidate', 'A withheld candidate is malformed.')
    }
    if (candidate.coverage !== null && candidate.coverage !== undefined) requireFinite(candidate.coverage, 'invalid_withheld_coverage')
    return {
      ...candidate,
      blockingReasons: array(candidate.blockingReasons),
      missingCriticalInputs: array(candidate.missingCriticalInputs),
      limitations: array(candidate.limitations),
      display: {
        rankingType: cleanLabel(rankingType),
        rankability: cleanLabel(candidate.rankabilityStatus, 'Ranking withheld'),
        candidateType: cleanLabel(candidate.candidateType, 'Candidate'),
        family: cleanLabel(candidate.canonicalFamily, 'Family pending'),
        representation: cleanLabel(candidate.representation, 'Representation pending'),
        freshness: cleanLabel(candidate.freshness),
      },
    }
  })
}

function normalizeRanking(value, expectedType) {
  if (!isRecord(value) || value.rankingType !== expectedType || typeof value.objective !== 'string') {
    throw new InstitutionalRankingV2ContractError('malformed_ranking_result', 'A ranking result is malformed.')
  }
  return {
    ...value,
    rankedCandidates: normalizeRankedCandidates(value.rankedCandidates, expectedType),
    provisionalCandidates: normalizeRankedCandidates(value.provisionalCandidates, expectedType),
    withheldCandidates: normalizeWithheld(value.withheldCandidates, expectedType),
    notApplicableCandidates: normalizeWithheld(value.notApplicableCandidates, expectedType),
    pendingCandidates: normalizeWithheld(value.pendingCandidates, expectedType),
    methodology: array(value.methodology),
    limitations: array(value.limitations),
    display: {
      name: cleanLabel(value.displayName || expectedType),
      status: cleanLabel(value.status),
      applicability: cleanLabel(value.applicability),
      calibration: cleanLabel(value.calibrationStatus),
    },
  }
}

export function normalizeInstitutionalRankingResponse(payload) {
  if (!isRecord(payload) || typeof payload.schemaVersion !== 'string' || typeof payload.universeId !== 'string' || typeof payload.universeDisplayName !== 'string') {
    throw new InstitutionalRankingV2ContractError('malformed_ranking_response', 'The institutional ranking response is malformed.')
  }
  const qualityRanking = normalizeRanking(payload.qualityRanking, 'quality')
  const opportunityRanking = normalizeRanking(payload.opportunityRanking, 'opportunity')
  const mathematicalUpsideRanking = normalizeRanking(payload.mathematicalUpsideRanking, 'mathematical_upside')
  const riskAdjustedRoiRanking = normalizeRanking(payload.riskAdjustedRoiRanking, 'risk_adjusted_roi')
  return deepFreeze({
    ...payload,
    rankingTypes: array(payload.rankingTypes),
    qualityRanking,
    opportunityRanking,
    mathematicalUpsideRanking,
    riskAdjustedRoiRanking,
    rankingsByType: Object.freeze({ quality: qualityRanking, opportunity: opportunityRanking, mathematical_upside: mathematicalUpsideRanking, risk_adjusted_roi: riskAdjustedRoiRanking }),
    limitations: array(payload.limitations),
    nextDiligence: array(payload.nextDiligence),
    methodologySummary: array(payload.methodologySummary),
  })
}

export function rankingErrorMessage(error) {
  const code = error?.code || 'discovery_unavailable'
  return ERROR_COPY[code] || error?.message || ERROR_COPY.discovery_unavailable
}

export async function fetchInstitutionalRankingsV2(slug, signal, options = {}) {
  try {
    const payload = await fetchV2Json(`/api/v2/universes/${encodeURIComponent(slug)}/rankings`, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    }, 180_000)
    return normalizeInstitutionalRankingResponse(payload)
  } catch (error) {
    if (error instanceof V2ApiError && ERROR_COPY[error.code]) throw error
    throw error
  }
}

export { RANKING_TYPES }
