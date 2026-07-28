import { AssetResearchV2ContractError } from './assetResearchResultV2'

const PRESENTATION_VERSION = 'premium-v2-market-liquidity-supply-experience-v1'

const AGREEMENT_LABELS = Object.freeze({
  providers_aligned: 'Providers aligned',
  minor_provider_variance: 'Minor provider variance',
  material_provider_disagreement: 'Material provider disagreement',
  one_comparable_provider: 'One comparable provider',
  not_comparable: 'Measurements not comparable',
  unavailable: 'Comparison unavailable',
})

const AVAILABILITY_LABELS = Object.freeze({
  available: 'Available',
  partial: 'Partial coverage',
  unavailable: 'Unavailable',
  not_applicable: 'Not relevant for this asset',
  degraded: 'Limited coverage',
  manual_review_required: 'Manual verification required',
})

const FRESHNESS_LABELS = Object.freeze({
  fresh: 'Fresh measurement',
  aging: 'Measurement aging',
  acceptable: 'Current enough for context',
  stale: 'Stale measurement',
  unknown: 'Freshness unavailable',
  unavailable: 'Measurement unavailable',
  not_applicable: 'Not applicable',
})

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function assertFiniteOrNull(value, fieldPath) {
  if (value !== null && (typeof value !== 'number' || !Number.isFinite(value))) {
    throw new AssetResearchV2ContractError(
      'malformed_market_supply_result',
      `${fieldPath} must be a finite number or an explicit unavailable value.`,
    )
  }
}

function validateMetric(metric, fieldPath) {
  if (!isRecord(metric)) {
    throw new AssetResearchV2ContractError('malformed_market_supply_result', `${fieldPath} is malformed.`)
  }
  assertFiniteOrNull(metric.value, `${fieldPath}.value`)
  if (typeof metric.availabilityStatus !== 'string') {
    throw new AssetResearchV2ContractError('malformed_market_supply_result', `${fieldPath} has no availability state.`)
  }
}

function validateScalar(scalar, fieldPath) {
  if (!isRecord(scalar)) {
    throw new AssetResearchV2ContractError('malformed_market_supply_result', `${fieldPath} is malformed.`)
  }
  assertFiniteOrNull(scalar.value, `${fieldPath}.value`)
  if (typeof scalar.availability !== 'string') {
    throw new AssetResearchV2ContractError('malformed_market_supply_result', `${fieldPath} has no availability state.`)
  }
}

function validateFormula(formula, fieldPath) {
  if (!isRecord(formula) || typeof formula.formulaId !== 'string' || typeof formula.formulaStatus !== 'string') {
    throw new AssetResearchV2ContractError('malformed_market_supply_result', `${fieldPath} is malformed.`)
  }
  assertFiniteOrNull(formula.value, `${fieldPath}.value`)
}

function validateHistoricalSeries(series, fieldPath) {
  if (!isRecord(series) || !Array.isArray(series.ranges)) {
    throw new AssetResearchV2ContractError('malformed_market_supply_result', `${fieldPath} is malformed.`)
  }
  series.ranges.forEach((range, rangeIndex) => {
    if (!isRecord(range) || !Array.isArray(range.points)) {
      throw new AssetResearchV2ContractError('malformed_market_supply_result', `${fieldPath}.ranges[${rangeIndex}] is malformed.`)
    }
    range.points.forEach((point, pointIndex) => {
      assertFiniteOrNull(point?.value, `${fieldPath}.ranges[${rangeIndex}].points[${pointIndex}].value`)
      if (!point?.timestamp || Number.isNaN(Date.parse(point.timestamp))) {
        throw new AssetResearchV2ContractError(
          'malformed_market_supply_result',
          `${fieldPath}.ranges[${rangeIndex}].points[${pointIndex}] has an invalid timestamp.`,
        )
      }
    })
  })
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  Object.values(value).forEach(deepFreeze)
  return value
}

function validatePresentation(result, presentation) {
  if (!isRecord(presentation) || presentation.schemaVersion !== PRESENTATION_VERSION) {
    throw new AssetResearchV2ContractError(
      'missing_market_supply_result',
      'The canonical Market, Liquidity & Supply presentation is unavailable.',
    )
  }
  if (presentation.canonicalAssetId !== result.identity?.data?.canonicalAssetId) {
    throw new AssetResearchV2ContractError(
      'market_supply_identity_mismatch',
      'Market and supply data does not match the current canonical asset.',
    )
  }
  if (presentation.representation?.representationType !== result.representation?.data?.representationType) {
    throw new AssetResearchV2ContractError(
      'market_supply_representation_mismatch',
      'Market and supply data does not match the current asset representation.',
    )
  }
  if (presentation.representation?.assetFamily !== result.classification?.data?.canonicalFamilyId) {
    throw new AssetResearchV2ContractError(
      'market_supply_family_mismatch',
      'Market and supply data does not match the current asset family.',
    )
  }
  const overviewMetrics = [
    'currentPrice',
    'marketCap',
    'marketCapRank',
    'fullyDilutedValuation',
    'volume24h',
    'priceChange24h',
    'circulatingSupply',
    'totalSupply',
    'maximumSupply',
  ]
  overviewMetrics.forEach((field) => validateMetric(presentation.marketOverview?.[field], `marketOverview.${field}`))
  ;['circulatingSupply', 'totalSupply', 'maximumSupply'].forEach((field) => {
    validateMetric(presentation.supplyStructure?.[field], `supplyStructure.${field}`)
  })
  ;[
    'burnedSupply',
    'lockedSupply',
    'stakedSupply',
    'treasurySupply',
    'escrowedSupply',
    'bridgedOrWrappedSupply',
    'freeFloatSupply',
  ].forEach((field) => validateScalar(presentation.supplyStructure?.[field], `supplyStructure.${field}`))
  ;[
    'grossIssuanceRate',
    'grossIssuanceAmount',
    'burnedAmount',
    'burnRate',
    'netIssuanceRate',
    'netIssuanceAmount',
  ].forEach((field) => validateScalar(presentation.issuanceAndBurn?.[field], `issuanceAndBurn.${field}`))
  ;[
    ...(presentation.marketOverview?.derivedMetrics || []),
    ...(presentation.issuanceAndBurn?.formulaOutputs || []),
  ].forEach((formula, index) => validateFormula(formula, `formulaOutputs[${index}]`))
  ;(presentation.historicalContext?.series || []).forEach((series, index) => {
    validateHistoricalSeries(series, `historicalContext.series[${index}]`)
  })
  if (presentation.guardrails?.frontendCalculationsAllowed !== false
    || presentation.guardrails?.selectedPairIsGlobalLiquidity !== false
    || presentation.guardrails?.missingDataRenderedAsZero !== false
    || presentation.guardrails?.missingUnlockMeansNoRisk !== false) {
    throw new AssetResearchV2ContractError(
      'market_supply_guardrail_failure',
      'Market and supply data failed its display-boundary checks.',
    )
  }
}

export function normalizeMarketLiquiditySupplyV2(result) {
  validatePresentation(result, result?.marketLiquiditySupply)
  const presentation = result.marketLiquiditySupply
  return deepFreeze({
    ...presentation,
    labels: {
      status: AVAILABILITY_LABELS[presentation.status] || 'Status unavailable',
      providerAgreement: AGREEMENT_LABELS[presentation.providerAgreement.overallState] || 'Comparison unavailable',
      priceAgreement: AGREEMENT_LABELS[presentation.providerAgreement.priceAgreementState] || 'Comparison unavailable',
      marketCapAgreement: AGREEMENT_LABELS[presentation.providerAgreement.marketCapAgreementState] || 'Comparison unavailable',
      supplyAgreement: AGREEMENT_LABELS[presentation.providerAgreement.supplyAgreementState] || 'Comparison unavailable',
      fdvAgreement: AGREEMENT_LABELS[presentation.providerAgreement.fdvAgreementState] || 'Comparison unavailable',
      freshness: FRESHNESS_LABELS[presentation.marketOverview.freshnessState] || 'Freshness unavailable',
      historicalFreshness: FRESHNESS_LABELS[presentation.historicalContext.freshness] || 'Freshness unavailable',
      liquidityStatus: AVAILABILITY_LABELS[presentation.liquidity.status] || 'Status unavailable',
      supplyStatus: AVAILABILITY_LABELS[presentation.supplyStructure.status] || 'Status unavailable',
      unlockStatus: AVAILABILITY_LABELS[presentation.unlocksAndEmissions.status] || 'Status unavailable',
    },
  })
}

export const PREMIUM_V2_MARKET_LIQUIDITY_SUPPLY_QA = Object.freeze({
  experienceAttached: true,
  experienceVersion: PRESENTATION_VERSION,
  presentationOwner: 'AssetResearchResultV2.marketLiquiditySupply',
  frontendNormalizer: 'src/v2/marketLiquiditySupplyV2.js#normalizeMarketLiquiditySupplyV2',
  frontendPrimaryComponent: 'src/v2/components/V2MarketLiquiditySupplyExperience.jsx',
  oldV2MarketSurfacePrimary: false,
  duplicateMarketFieldCount: 0,
  pairAsGlobalLeakageCount: 0,
  nativeToWrappedInheritanceCount: 0,
  nativeToLstInheritanceCount: 0,
  missingAsZeroFindingCount: 0,
  missingUnlockAsNoRiskCount: 0,
  customerInternalEnumLeakageCount: 0,
  frontendAnalyticalCalculationCount: 0,
  browserVisualQaStatus: 'PENDING',
  testedRoutes: [],
  testedViewports: [],
  screenshotEvidence: [],
  bundleSizeDelta: 'Asset route chunk 88.80 kB -> 104.27 kB (+15.47 kB); main chunk 1,191.28 kB -> 1,200.74 kB (+0.79%).',
  scoringChanged: false,
  tokenomicsScoreChanged: false,
  confidenceChanged: false,
  verdictChanged: false,
  rankingChanged: false,
  universeChanged: false,
  providerBehaviorChanged: false,
  knownLimitations: [
    'Order-book depth, global executable liquidity, historical supply, unlocks, allocations, free float, and holder labels remain unavailable when canonical inputs are absent.',
    'Local browser visual QA and deployed QA remain pending until finite route and screenshot checks complete.',
  ],
})
