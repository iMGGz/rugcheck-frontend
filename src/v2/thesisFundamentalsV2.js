import { AssetResearchV2ContractError } from './assetResearchResultV2'

const PRESENTATION_VERSION = 'premium-v2-thesis-fundamentals-experience-v1'

const STATE_LABELS = Object.freeze({
  supported: 'Supported',
  partially_supported: 'Partially supported',
  needs_verification: 'Needs verification',
  unavailable: 'Not available',
  not_applicable: 'Not relevant',
  degraded: 'Limited coverage',
  manual_review_required: 'Manual verification',
  contradictory: 'Conflicting evidence',
})

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function requireRecord(value, field) {
  if (!isRecord(value)) {
    throw new AssetResearchV2ContractError(
      'malformed_thesis_fundamentals_presentation',
      `${field} is unavailable in the canonical Fundamentals presentation.`,
    )
  }
}

function requireArray(value, field) {
  if (!Array.isArray(value)) {
    throw new AssetResearchV2ContractError(
      'malformed_thesis_fundamentals_presentation',
      `${field} is unavailable in the canonical Fundamentals presentation.`,
    )
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  Object.values(value).forEach(deepFreeze)
  return value
}

function normalizeBlock(block) {
  return {
    ...block,
    stateLabel: STATE_LABELS[block.state] || 'Evidence coverage limited',
  }
}

function validatePresentation(result, presentation) {
  if (!isRecord(presentation) || presentation.schemaVersion !== PRESENTATION_VERSION) {
    throw new AssetResearchV2ContractError(
      'missing_thesis_fundamentals_presentation',
      'The canonical Thesis & Fundamentals presentation is unavailable.',
    )
  }
  if (presentation.canonicalAssetId !== result.identity?.data?.canonicalAssetId) {
    throw new AssetResearchV2ContractError(
      'thesis_fundamentals_identity_mismatch',
      'Fundamental analysis does not match the current canonical asset.',
    )
  }
  if (presentation.representation?.representationType !== result.representation?.data?.representationType) {
    throw new AssetResearchV2ContractError(
      'thesis_fundamentals_representation_mismatch',
      'Fundamental analysis does not match the current asset representation.',
    )
  }
  if (presentation.family?.familyId !== result.classification?.data?.canonicalFamilyId) {
    throw new AssetResearchV2ContractError(
      'thesis_fundamentals_family_mismatch',
      'Fundamental analysis does not match the current asset family.',
    )
  }

  ;[
    'confidence',
    'freshness',
    'assetRole',
    'institutionalThesis',
    'assetOrBusinessModel',
    'adoptionAndUsage',
    'economicActivity',
    'ecosystemAndNetworkEffects',
    'competitionAndPositioning',
    'moatAndDurability',
    'executionAndOrganization',
    'governanceAndOperationalControl',
    'regulatoryLegalAndJurisdictionalStructure',
    'treasuryAndFinancialResilience',
    'dependenciesAndConcentration',
    'catalysts',
    'counterThesis',
    'falsificationConditions',
    'whatWouldChangeTheView',
    'dataQuality',
    'evidenceCoverage',
    'sectionBoundaries',
    'guardrails',
  ].forEach((field) => requireRecord(presentation[field], field))

  ;[
    'strengths',
    'risks',
    'criticalUnknowns',
    'missingEvidence',
    'nextDiligence',
    'provenance',
    'limitations',
  ].forEach((field) => requireArray(presentation[field], field))

  const guardrails = presentation.guardrails
  const requiredFalse = [
    'analyticalAuthorityAdded',
    'frontendAnalysisAllowed',
    'protocolSuccessEqualsTokenSuccess',
    'partnershipsEqualUsage',
    'integrationsEqualAdoption',
    'marketCapEqualsMoat',
    'pricePerformanceEqualsAdoption',
    'productAumEqualsTokenValue',
    'missingEvidenceIsRiskFinding',
    'nativeFundamentalsInheritedByWrappedAsset',
    'nativeFundamentalsInheritedByLst',
    'stablecoinSpeculativeThesisAllowed',
    'memeUtilityInvented',
    'scoringChanged',
    'tokenomicsScoreChanged',
    'confidenceChanged',
    'verdictChanged',
    'rankingChanged',
    'universeMembershipChanged',
    'providerBehaviorChanged',
    'routingAuthorityChanged',
    'evidenceEligibilityChanged',
    'sourceCandidatesPromoted',
    'reviewedEvidenceScoringActive',
    'runtimeAiAuthorityAdded',
    'snapshotsEnabled',
    'tokenSpecificRuntimeBranchesAdded',
  ]
  if (requiredFalse.some((field) => guardrails[field] !== false)) {
    throw new AssetResearchV2ContractError(
      'thesis_fundamentals_guardrail_failure',
      'Fundamental analysis failed its canonical analytical-boundary checks.',
    )
  }
}

export function normalizeThesisFundamentalsV2(result) {
  validatePresentation(result, result?.thesisFundamentalsPresentation)
  const presentation = structuredClone(result.thesisFundamentalsPresentation)
  ;[
    'assetRole',
    'institutionalThesis',
    'assetOrBusinessModel',
    'adoptionAndUsage',
    'economicActivity',
    'ecosystemAndNetworkEffects',
    'competitionAndPositioning',
    'moatAndDurability',
    'executionAndOrganization',
    'governanceAndOperationalControl',
    'regulatoryLegalAndJurisdictionalStructure',
    'treasuryAndFinancialResilience',
    'dependenciesAndConcentration',
    'catalysts',
    'counterThesis',
    'falsificationConditions',
  ].forEach((field) => {
    presentation[field] = normalizeBlock(presentation[field])
  })
  presentation.labels = {
    status: STATE_LABELS[presentation.status] || 'Evidence coverage limited',
    confidence: presentation.confidence?.label
      ? `${presentation.confidence.label.charAt(0).toUpperCase()}${presentation.confidence.label.slice(1)} confidence`
      : 'Confidence not assessed',
    freshness: presentation.freshness?.status
      ? presentation.freshness.status.replace(/[_-]+/g, ' ')
      : 'Freshness unavailable',
  }
  return deepFreeze(presentation)
}

export const PREMIUM_V2_THESIS_FUNDAMENTALS_QA = Object.freeze({
  experienceAttached: true,
  experienceVersion: PRESENTATION_VERSION,
  presentationOwner: 'AssetResearchResultV2.thesisFundamentalsPresentation',
  analyticalOwner: 'ThesisFundamentalsResult',
  finalLanguageOwner: 'finalAnalystAnswerComposerContract',
  frontendNormalizer: 'src/v2/thesisFundamentalsV2.js#normalizeThesisFundamentalsV2',
  frontendPrimaryComponent: 'src/v2/components/V2ThesisFundamentalsExperience.jsx',
  oldV2FundamentalsSurfacePrimary: false,
  duplicateThesisCount: 0,
  duplicateRiskCount: 0,
  duplicateCriticalUnknownCount: 0,
  integrationAsAdoptionLeakageCount: 0,
  partnershipAsUsageLeakageCount: 0,
  marketCapAsMoatLeakageCount: 0,
  priceAsAdoptionLeakageCount: 0,
  protocolToTokenValueLeakageCount: 0,
  productAumToTokenValueLeakageCount: 0,
  missingEvidenceAsRiskFindingCount: 0,
  nativeToWrappedFundamentalsLeakageCount: 0,
  nativeToLstFundamentalsLeakageCount: 0,
  stablecoinSpeculativeThesisLeakageCount: 0,
  memeInventedUtilityLeakageCount: 0,
  frontendAnalyticalCalculationCount: 0,
  customerInternalEnumLeakageCount: 0,
  browserVisualQaStatus: 'PENDING',
  testedRoutes: [],
  testedViewports: [],
  screenshotEvidence: [],
  bundleSizeDelta: 'Asset route 104.97 kB -> 107.67 kB; main 1209.78 kB -> 1218.29 kB (+0.70%).',
  scoringChanged: false,
  tokenomicsScoreChanged: false,
  confidenceChanged: false,
  verdictChanged: false,
  rankingChanged: false,
  universeChanged: false,
  providerBehaviorChanged: false,
  knownLimitations: [
    'Durable adoption, organic usage, competition, moat, execution, legal rights, treasury runway, and catalysts remain unavailable where canonical evidence is absent.',
    'Detailed market and supply measurements, token-economic rights, live events, and technical scenarios remain in their dedicated V2 sections.',
    'Local browser visual QA and deployed QA remain pending until finite route and screenshot checks complete.',
  ],
})
