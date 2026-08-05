export class InstitutionalProductScoringV1ContractError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'InstitutionalProductScoringV1ContractError'
    this.code = code
  }
}

const CONTRACTS = Object.freeze({
  institutionalScoringConstitutionV1: 'institutionalScoringConstitutionV1',
  institutionalProductScoringResultV1: 'institutionalProductScoringResultV1',
  institutionalCohortRankingResultV1: 'institutionalCohortRankingResultV1',
  institutionalScoringActivationDecisionV1: 'institutionalScoringActivationDecisionV1',
})

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!isRecord(value)) return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]))
}

function equalCanonical(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right))
}

function validateContract(field, value) {
  if (!isRecord(value) || value.contractId !== CONTRACTS[field] || value.schemaVersion !== '1.0.0') {
    throw new InstitutionalProductScoringV1ContractError(
      `malformed_${field}`,
      `The ${field} contract is malformed.`,
    )
  }
  if (field === 'institutionalProductScoringResultV1' && (!isRecord(value.eligibility) || !isRecord(value.institutionalQuality) || !Array.isArray(value.moduleResults))) {
    throw new InstitutionalProductScoringV1ContractError('malformed_scoring_result', 'The institutional shadow-scoring result is incomplete.')
  }
  if (field === 'institutionalCohortRankingResultV1' && !Array.isArray(value.entries)) {
    throw new InstitutionalProductScoringV1ContractError('malformed_ranking_result', 'The institutional cohort-ranking result is incomplete.')
  }
  if (field === 'institutionalScoringActivationDecisionV1' && (!Array.isArray(value.failedGates) || typeof value.runtimeActivationAllowed !== 'boolean')) {
    throw new InstitutionalProductScoringV1ContractError('malformed_activation_decision', 'The institutional scoring activation decision is incomplete.')
  }
  return value
}

function selectContract(payload, field) {
  const root = isRecord(payload) ? payload[field] : null
  const nested = isRecord(payload?.analysis) ? payload.analysis[field] : null
  if (root && nested && !equalCanonical(root, nested)) {
    throw new InstitutionalProductScoringV1ContractError(
      `root_analysis_divergence_${field}`,
      `The ${field} root and analysis mirrors diverge.`,
    )
  }
  const selected = root || nested
  return {
    value: selected ? validateContract(field, selected) : null,
    source: root && nested ? 'root_analysis_matched' : root ? 'root_only' : nested ? 'analysis_fallback' : 'missing',
  }
}

export function normalizeInstitutionalProductScoringV1(payload, options = {}) {
  const selected = Object.fromEntries(Object.keys(CONTRACTS).map((field) => [field, selectContract(payload, field)]))
  const contracts = Object.fromEntries(Object.entries(selected).map(([field, entry]) => [field, entry.value]))
  const missingContracts = Object.entries(contracts).filter(([, value]) => !value).map(([field]) => field)
  if (options.requireComplete && missingContracts.length) {
    throw new InstitutionalProductScoringV1ContractError(
      'missing_institutional_scoring_contracts',
      `Missing institutional scoring contracts: ${missingContracts.join(', ')}.`,
    )
  }

  const activation = contracts.institutionalScoringActivationDecisionV1
  const scoring = contracts.institutionalProductScoringResultV1
  const ranking = contracts.institutionalCohortRankingResultV1
  const activationAllowed = Boolean(
    activation?.runtimeActivationAllowed === true
    && activation?.decision === 'activate_v2_runtime'
    && activation?.activeScoreSource === 'institutionalProductScoringResultV1'
    && activation?.activeRankingSource === 'institutionalCohortRankingResultV1'
    && scoring?.activationState === 'active'
    && ranking?.activationState === 'active',
  )

  const customerPresentation = activationAllowed ? Object.freeze({
    institutionalQuality: scoring.institutionalQuality,
    riskSeverity: scoring.riskSeverity,
    riskGrade: scoring.riskGrade,
    technicalOpportunity: scoring.technicalOpportunity,
    eligibility: scoring.eligibility,
    dataConfidence: scoring.dataConfidence,
    coverage: scoring.coverage,
    moduleResults: scoring.moduleResults,
    capsAndPenalties: scoring.capsAndPenalties,
    cohortRanking: ranking,
    institutionalAnswers: scoring.institutionalAnswers,
    methodologyVersion: scoring.metadata?.methodologyVersion,
    observationCutoff: scoring.metadata?.observationCutoff,
  }) : null

  const shadowDiagnostics = scoring ? Object.freeze({
    activationState: scoring.activationState,
    eligibility: scoring.eligibility,
    institutionalQuality: scoring.institutionalQuality,
    riskSeverity: scoring.riskSeverity,
    riskGrade: scoring.riskGrade,
    technicalOpportunity: scoring.technicalOpportunity,
    dataConfidence: scoring.dataConfidence,
    coverage: scoring.coverage,
    moduleResults: scoring.moduleResults,
    capsAndPenalties: scoring.capsAndPenalties,
    comparability: scoring.comparability,
    cohortRanking: ranking,
    methodologyVersion: scoring.metadata?.methodologyVersion,
    observationCutoff: scoring.metadata?.observationCutoff,
  }) : null

  return Object.freeze({
    ...contracts,
    activationAllowed,
    contractStatus: missingContracts.length ? (missingContracts.length === Object.keys(CONTRACTS).length ? 'unavailable' : 'partial') : 'complete',
    missingContracts: Object.freeze(missingContracts),
    parityStatus: Object.freeze(Object.fromEntries(Object.entries(selected).map(([field, entry]) => [field, entry.source]))),
    customerPresentation,
    shadowDiagnostics,
  })
}

