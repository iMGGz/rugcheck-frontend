import { AssetResearchV2ContractError } from './assetResearchResultV2'

const PRESENTATION_VERSION = 'premium-v2-tokenomics-quality-experience-v1'

const STATE_LABELS = Object.freeze({
  supported: 'Supported',
  partially_supported: 'Partially supported',
  needs_verification: 'Needs verification',
  unavailable: 'Evidence unavailable',
  not_applicable: 'Not relevant for this asset',
  degraded: 'Limited coverage',
  direct: 'Direct',
  indirect: 'Indirect',
  conditional: 'Conditional',
  technical_only: 'Technical only',
  governance_only: 'Governance only',
  no_verified_link: 'No verified link',
  evidence_unavailable: 'Evidence unavailable',
})

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function requireRecord(value, fieldPath) {
  if (!isRecord(value)) {
    throw new AssetResearchV2ContractError(
      'malformed_tokenomics_quality_presentation',
      `${fieldPath} is unavailable or malformed.`,
    )
  }
}

function requireArray(value, fieldPath) {
  if (!Array.isArray(value)) {
    throw new AssetResearchV2ContractError(
      'malformed_tokenomics_quality_presentation',
      `${fieldPath} must be an explicit list.`,
    )
  }
}

function assertFiniteOrNull(value, fieldPath) {
  if (value !== null && (typeof value !== 'number' || !Number.isFinite(value))) {
    throw new AssetResearchV2ContractError(
      'malformed_tokenomics_quality_presentation',
      `${fieldPath} must be a finite number or an explicit unavailable value.`,
    )
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  Object.values(value).forEach(deepFreeze)
  return value
}

function normalizeItem(item) {
  return {
    ...item,
    stateLabel: STATE_LABELS[item.state] || 'Status unavailable',
  }
}

function validatePresentation(result, presentation) {
  if (!isRecord(presentation) || presentation.schemaVersion !== PRESENTATION_VERSION) {
    throw new AssetResearchV2ContractError(
      'missing_tokenomics_quality_presentation',
      'The canonical Tokenomics Quality presentation is unavailable.',
    )
  }
  if (presentation.canonicalAssetId !== result.identity?.data?.canonicalAssetId) {
    throw new AssetResearchV2ContractError(
      'tokenomics_quality_identity_mismatch',
      'Tokenomics data does not match the current canonical asset.',
    )
  }
  if (presentation.representation?.representationType !== result.representation?.data?.representationType) {
    throw new AssetResearchV2ContractError(
      'tokenomics_quality_representation_mismatch',
      'Tokenomics data does not match the current asset representation.',
    )
  }
  if (presentation.family?.familyId !== result.classification?.data?.canonicalFamilyId) {
    throw new AssetResearchV2ContractError(
      'tokenomics_quality_family_mismatch',
      'Tokenomics data does not match the current asset family.',
    )
  }

  ;[
    'tokenomicsQuality',
    'economicRole',
    'utilityAndNecessity',
    'holderRights',
    'valueCapture',
    'governanceAndControl',
    'distribution',
    'unlocksAndDilution',
    'issuanceAndBurn',
    'treasuryAndIncentives',
    'stakingAndYieldBoundary',
    'productTokenBoundary',
    'dataQuality',
    'evidenceCoverage',
    'whatWouldChangeTheView',
    'guardrails',
  ].forEach((field) => requireRecord(presentation[field], field))

  ;[
    'demandMechanisms',
    'strengths',
    'risks',
    'criticalUnknowns',
    'missingEvidence',
    'nextDiligence',
    'provenance',
    'limitations',
  ].forEach((field) => requireArray(presentation[field], field))

  assertFiniteOrNull(
    presentation.tokenomicsQuality.tokenomicsScoreValue,
    'tokenomicsQuality.tokenomicsScoreValue',
  )

  const guardrails = presentation.guardrails
  if (guardrails.analyticalAuthorityAdded !== false
    || guardrails.frontendCalculationsAllowed !== false
    || guardrails.protocolUsageEqualsTokenDemand !== false
    || guardrails.tokenDemandEqualsHolderValue !== false
    || guardrails.governanceEqualsCashFlowRights !== false
    || guardrails.productAumEqualsTokenValue !== false
    || guardrails.missingEvidenceIsRiskFinding !== false
    || guardrails.nativeTokenomicsInheritedByWrappedAsset !== false
    || guardrails.nativeTokenomicsInheritedByLst !== false
    || guardrails.stablecoinYieldInferred !== false) {
    throw new AssetResearchV2ContractError(
      'tokenomics_quality_guardrail_failure',
      'Tokenomics data failed its analytical-boundary checks.',
    )
  }
}

export function normalizeTokenomicsQualityV2(result) {
  validatePresentation(result, result?.tokenomicsQualityPresentation)
  const presentation = structuredClone(result.tokenomicsQualityPresentation)
  presentation.demandMechanisms = presentation.demandMechanisms.map(normalizeItem)
  presentation.utilityAndNecessity.utilityClaims =
    presentation.utilityAndNecessity.utilityClaims.map(normalizeItem)
  presentation.valueCapture.valueCaptureMechanisms =
    presentation.valueCapture.valueCaptureMechanisms.map(normalizeItem)
  presentation.distribution.categories = presentation.distribution.categories.map(normalizeItem)
  Object.keys(presentation.holderRights).forEach((key) => {
    if (isRecord(presentation.holderRights[key]) && presentation.holderRights[key].itemId) {
      presentation.holderRights[key] = normalizeItem(presentation.holderRights[key])
    }
  })
  presentation.labels = {
    status: STATE_LABELS[presentation.status] || 'Evidence coverage limited',
    roleAvailability: STATE_LABELS[presentation.economicRole.roleAvailabilityState] || 'Evidence coverage limited',
    scoreState: presentation.tokenomicsQuality.tokenomicsScoreDisplayState === 'displayed'
      ? 'Canonical score available'
      : 'Score withheld',
  }
  return deepFreeze(presentation)
}

export const PREMIUM_V2_TOKENOMICS_QUALITY_QA = Object.freeze({
  experienceAttached: true,
  experienceVersion: PRESENTATION_VERSION,
  presentationOwner: 'AssetResearchResultV2.tokenomicsQualityPresentation',
  tokenomicsQualityScoreOwner: 'TokenomicsQualityResult.tokenomicsIntegrityScore',
  frontendNormalizer: 'src/v2/tokenomicsQualityV2.js#normalizeTokenomicsQualityV2',
  frontendPrimaryComponent: 'src/v2/components/V2TokenomicsQualityExperience.jsx',
  oldV2TokenomicsSurfacePrimary: false,
  duplicateTokenomicsScoreCount: 0,
  duplicateAllocationSurfaceCount: 0,
  duplicateUnlockSurfaceCount: 0,
  protocolToTokenValueLeakageCount: 0,
  governanceToCashflowLeakageCount: 0,
  productAumToTokenValueLeakageCount: 0,
  missingEvidenceAsRiskFindingCount: 0,
  nativeToWrappedTokenomicsLeakageCount: 0,
  nativeToLstTokenomicsLeakageCount: 0,
  customerInternalEnumLeakageCount: 0,
  frontendAnalyticalCalculationCount: 0,
  browserVisualQaStatus: 'PENDING',
  testedRoutes: [],
  testedViewports: [],
  screenshotEvidence: [],
  bundleSizeDelta: 'Pending post-build measurement.',
  tokenomicsScoreChanged: false,
  overallScoreChanged: false,
  confidenceChanged: false,
  verdictChanged: false,
  rankingChanged: false,
  universeChanged: false,
  providerBehaviorChanged: false,
  knownLimitations: [
    'Legal rights, holder-benefit relationships, governance participation, allocation coverage, and real yield remain unavailable when claim-specific evidence is absent.',
    'Detailed supply, allocation, issuance, burn, and unlock measurements remain owned by Market & Supply.',
    'Local browser visual QA and deployed QA remain pending until finite route and screenshot checks complete.',
  ],
})
