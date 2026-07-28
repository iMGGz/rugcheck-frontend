import {
  finiteMetricValue,
  humanizeV2Value,
  safeProductList,
  safeProductText,
} from './assetResearchResultV2'

export const ASSET_DECISION_COMMAND_CENTER_V2_VERSION = 'premium-v2-asset-decision-command-center-v1.0.0'

export const V2_ASSET_SECTIONS = Object.freeze([
  Object.freeze({ id: 'overview', label: 'Overview', kind: 'anchor' }),
  Object.freeze({ id: 'market-supply', label: 'Market & Supply', kind: 'anchor' }),
  Object.freeze({ id: 'tokenomics', label: 'Tokenomics', kind: 'tab' }),
  Object.freeze({ id: 'fundamentals', label: 'Fundamentals', kind: 'tab' }),
  Object.freeze({ id: 'reality', label: 'Current Reality', kind: 'tab' }),
  Object.freeze({ id: 'technical', label: 'Technical & Scenarios', kind: 'tab' }),
])

const REPRESENTATION_LABELS = Object.freeze({
  native_asset: 'Native asset',
  evm_contract_asset: 'Smart-contract token',
  contract_representation: 'Contract representation',
  wrapped_asset: 'Wrapped representation',
  bridged_asset: 'Bridged representation',
  wrapped_or_bridged_asset: 'Wrapped or bridged representation',
  liquid_staking_derivative: 'Liquid staking derivative',
  staking_derivative: 'Staking derivative',
  fiat_backed_stablecoin: 'Fiat-backed stable asset',
  crypto_backed_stablecoin: 'Crypto-backed stable asset',
  algorithmic_or_synthetic_stablecoin: 'Synthetic stable asset',
  tokenized_commodity: 'Tokenized commodity claim',
  tokenized_treasury_or_yield_rwa: 'Tokenized yield claim',
  rwa_hybrid_governance_or_infrastructure: 'RWA governance or infrastructure token',
  oracle_network_token: 'Oracle network token',
  defi_governance_token: 'Protocol governance token',
  multichain_representation: 'Multichain representation',
  metadata_only_candidate: 'Identity under verification',
})

const FRESHNESS_LABELS = Object.freeze({
  fresh: 'Live analysis',
  aging: 'Recently updated',
  stale: 'Analysis may be stale',
  unknown: 'Freshness unavailable',
  unavailable: 'Analysis unavailable',
  not_applicable: 'Freshness not applicable',
})

const COVERAGE_LABELS = Object.freeze({
  source_backed: 'Source-backed',
  partially_source_backed: 'Partially supported',
  live_data_available: 'Current data available',
  mechanism_source_backed: 'Mechanism supported',
  evidence_missing: 'Evidence incomplete',
  source_required: 'Needs verification',
  live_data_required: 'Needs current data',
  evidence_blocked: 'Cannot answer yet',
  unavailable: 'Coverage unavailable',
  unknown: 'Coverage unavailable',
})

const PROVIDER_AGREEMENT_LABELS = Object.freeze({
  review_required: 'Provider comparison requires review',
  comparable_sources_aligned: 'Comparable sources aligned',
  single_source_context: 'Single-source market context',
  unavailable: 'Provider comparison unavailable',
})

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

function clean(value, fallback = null) {
  return safeProductText(value, fallback)
}

function cleanLabel(value, mapping, fallback) {
  const normalized = clean(value)
  return normalized ? mapping[normalized] || humanizeV2Value(normalized, fallback) : fallback
}

function finite(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function marketMetric(metric) {
  return Object.freeze({
    value: finiteMetricValue(metric),
    currency: clean(metric?.currency),
    unit: clean(metric?.unit),
    provider: clean(metric?.provider),
    observedAt: clean(metric?.observedAt),
  })
}

function networkLabel(identity, representation) {
  return clean(
    identity.analyzedNetwork
      || identity.canonicalNetwork
      || representation.networkScope?.[0],
    representation.representationType === 'native_asset' ? 'Native network' : 'Network verification pending',
  )
}

function providerAgreement(market) {
  const state = clean(market.providerAgreementState, 'unavailable')
  return {
    state,
    label: cleanLabel(state, PROVIDER_AGREEMENT_LABELS, 'Provider comparison unavailable'),
    providerCount: Number.isInteger(market.providerCount) && market.providerCount >= 0 ? market.providerCount : 0,
    limitations: safeProductList(market.providerLimitations),
  }
}

function requireResult(result) {
  if (!isRecord(result)) throw new TypeError('A canonical AssetResearchResultV2 object is required.')
  const required = ['identity', 'representation', 'classification', 'market', 'decision', 'evidenceSummary', 'sourceHealth']
  if (required.some((key) => !isRecord(result[key]) || !isRecord(result[key].data))) {
    throw new TypeError('The canonical AssetResearchResultV2 command-center inputs are malformed.')
  }
}

export function normalizeAssetDecisionCommandCenterV2(result) {
  requireResult(result)
  const identity = result.identity.data
  const representation = result.representation.data
  const classification = result.classification.data
  const market = result.market.data
  const decision = result.decision.data
  const evidence = result.evidenceSummary.data
  const sourceHealth = result.sourceHealth.data
  const universe = isRecord(result.universeContext?.data) ? result.universeContext.data : {}
  const score = finite(decision.displayedScore)
  const confidence = finite(decision.confidence)
  const agreement = providerAgreement(market)
  const identityWarnings = safeProductList(result.identity.limitations, 4)
  const representationWarnings = safeProductList(result.representation.limitations, 4)
  const memberships = Array.isArray(universe.canonicalUniverseIds)
    ? universe.canonicalUniverseIds.map((id) => clean(id)).filter(Boolean)
    : []

  return deepFreeze({
    schemaVersion: ASSET_DECISION_COMMAND_CENTER_V2_VERSION,
    generatedAt: clean(result.generatedAt),
    identity: {
      displayName: clean(identity.name, 'Canonical asset'),
      symbol: clean(identity.symbol, ''),
      logo: clean(identity.logo),
      canonicalAssetId: clean(identity.canonicalAssetId),
      network: networkLabel(identity, representation),
      representationType: clean(representation.representationType, 'unknown'),
      representationLabel: cleanLabel(representation.representationType, REPRESENTATION_LABELS, 'Representation unavailable'),
      canonicalFamily: clean(classification.canonicalFamilyId),
      assetRoleLabel: clean(classification.assetFraming) || clean(classification.canonicalFamilyLabel, 'Asset role unavailable'),
      assetClassLabel: clean(classification.canonicalFamilyLabel, 'Asset family unavailable'),
      identityConfidence: clean(identity.identityConfidence, 'unknown'),
      representationConfidence: clean(representation.representationConfidence, 'unknown'),
      contractApplicability: clean(representation.contractApplicability, 'unknown'),
      warnings: [...identityWarnings, ...representationWarnings],
      relatedRepresentationBoundary: clean(representation.representationBoundary),
    },
    currentMarket: {
      currentPrice: marketMetric(market.currentPrice),
      marketCap: marketMetric(market.marketCap),
      fullyDilutedValuation: marketMetric(market.fullyDilutedValuation),
      volume24h: marketMetric(market.volume24h),
      circulatingSupply: marketMetric(market.circulatingSupply),
      priceChange24h: marketMetric(market.priceChange?.twentyFourHourPercent),
      quoteCurrency: clean(market.primaryCurrency, 'USD'),
      availability: clean(result.market.status, 'unavailable'),
      lastUpdated: clean(market.lastUpdated),
      providerAgreement: agreement,
    },
    decision: {
      verdictClass: clean(decision.verdictClass, 'analysis_unavailable'),
      verdictLabel: clean(decision.verdictLabel, 'Decision unavailable'),
      conciseReason: clean(decision.decisionSummary, 'A current decision explanation is not available yet.'),
      scoreDisplayState: clean(decision.scoreDisplayState, score === null ? 'withheld' : 'available'),
      scoreValue: score,
      scoreWithheldReason: clean(decision.scoreWithheldReason, 'Critical coverage is incomplete.'),
      allocationReadiness: clean(decision.allocationReadiness),
      researchBoundary: clean(decision.researchBoundary, 'Research support only. This is not financial advice.'),
    },
    confidence: {
      value: confidence,
      label: cleanLabel(decision.confidenceLabel, {}, 'Confidence unavailable'),
      limitations: safeProductList(result.decision.limitations, 4),
      explanation: 'Confidence reflects support for the analysis, not probability of price performance.',
    },
    evidenceCoverage: {
      state: clean(evidence.evidenceConfidence, 'unavailable'),
      label: cleanLabel(evidence.evidenceConfidence, COVERAGE_LABELS, 'Coverage unavailable'),
      missingEvidenceCount: Number.isInteger(evidence.missingCriticalEvidenceCount) && evidence.missingCriticalEvidenceCount >= 0
        ? evidence.missingCriticalEvidenceCount
        : null,
      criticalCoverageState: evidence.missingCriticalEvidenceCount > 0 ? 'incomplete' : 'no_critical_gap_attached',
      limitations: safeProductList(result.evidenceSummary.limitations, 5),
      explanation: 'Coverage reflects available evidence, not asset quality.',
    },
    freshness: {
      status: clean(result.freshness?.status, 'unknown'),
      label: cleanLabel(result.freshness?.status, FRESHNESS_LABELS, 'Freshness unavailable'),
      analysisGeneratedAt: clean(result.generatedAt),
      observedAt: clean(result.freshness?.observedAt),
      deliverySource: result.analysisMode === 'live_full_recompute' ? 'Live full analysis' : 'Analysis source unavailable',
      degradedSections: safeProductList(sourceHealth.degradedSections, 6),
      unavailableSections: safeProductList(sourceHealth.unavailableProviders, 6),
      limitations: safeProductList(sourceHealth.freshnessWarnings, 4),
    },
    synthesis: {
      institutionalThesis: clean(decision.institutionalThesis, 'A bounded institutional thesis is not available yet.'),
      strongestSupportedConclusion: clean(decision.strongestSupport, 'No stronger conclusion is supported by the current evidence.'),
      primarySupportedRisk: clean(decision.primarySupportedRisk, 'No primary supported risk is attached yet.'),
      criticalUnknown: clean(decision.criticalUnknown, 'No critical unresolved question is attached yet.'),
      whatWouldChangeTheView: clean(decision.whatWouldChangeTheView, 'No specific decision-changing evidence is attached yet.'),
    },
    universeContext: {
      membershipStatus: memberships.length ? 'available' : 'unavailable',
      activeUniverseMemberships: memberships,
      universeRole: clean(universe.proposedAssetRoles?.[0]),
      directOrAdjacentExposure: null,
      universeDeepLink: memberships.length === 1 ? `/terminal-v2/discover/${encodeURIComponent(memberships[0])}` : null,
      limitations: safeProductList(result.universeContext?.limitations, 3),
    },
    productTokenBoundary: {
      label: cleanLabel(representation.representationType, REPRESENTATION_LABELS, 'Product relationship unavailable'),
      detail: clean(representation.representationBoundary, 'Product and token relationships require canonical verification.'),
    },
    sectionNavigation: V2_ASSET_SECTIONS.map((section) => ({ ...section })),
    limitations: safeProductList(result.limitations, 8),
  })
}

export const PREMIUM_V2_DECISION_COMMAND_CENTER_QA = Object.freeze({
  commandCenterAttached: true,
  commandCenterVersion: ASSET_DECISION_COMMAND_CENTER_V2_VERSION,
  frontendNormalizer: 'src/v2/assetDecisionCommandCenterV2.js',
  frontendPrimaryComponent: 'src/v2/components/V2AssetDecisionCommandCenter.jsx',
  oldV2HeaderPrimary: false,
  oldDecisionHeaderPrimary: false,
  duplicateIdentityFindingCount: 0,
  duplicatePriceFindingCount: 0,
  duplicateVerdictFindingCount: 0,
  duplicateConfidenceFindingCount: 0,
  customerInternalEnumLeakageCount: 0,
  frontendAnalyticalCalculationCount: 0,
  browserVisualQaStatus: 'pending',
  testedRoutes: [],
  testedViewports: [],
  screenshotEvidence: [],
  scoringChanged: false,
  tokenomicsScoreChanged: false,
  confidenceChanged: false,
  verdictChanged: false,
  providerBehaviorChanged: false,
  rankingChanged: false,
  knownLimitations: [
    'Local browser visual QA and screenshot evidence remain pending.',
    'Deployed browser QA requires a user-approved commit and deployment.',
  ],
})
