export class ProductResearchResultV2ContractError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ProductResearchResultV2ContractError'
    this.code = code
  }
}

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

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

function validateContract(contract) {
  if (
    !isRecord(contract)
    || contract.contractId !== 'productResearchResultV2'
    || contract.schemaVersion !== '2.0.0'
    || typeof contract.resultId !== 'string'
  ) {
    throw new ProductResearchResultV2ContractError(
      'malformed_product_research_result_v2',
      'The institutional product analysis contract is malformed.',
    )
  }
  const requiredObjects = [
    'analysisJob', 'identityAndRelationships', 'lifecycle', 'coverage', 'dataConfidence',
    'futureScoringReadiness', 'futureRankingReadiness', 'sourceAndLineageSummary',
    'customerPresentation', 'internalDiagnostics', 'guardrails',
  ]
  const requiredArrays = [
    'observationSelection', 'productFactLedger', 'institutionalQuestionResults',
    'moduleReadiness', 'formulaInputReadiness', 'eligibilityReadiness', 'contradictions',
    'missingEvidence', 'blockedClaims', 'whatWouldChange',
  ]
  if (requiredObjects.some((field) => !isRecord(contract[field])) || requiredArrays.some((field) => !Array.isArray(contract[field]))) {
    throw new ProductResearchResultV2ContractError(
      'malformed_product_research_result_v2',
      'The institutional product analysis contract is incomplete.',
    )
  }
  return deepFreeze(contract)
}

export function normalizeProductResearchResultV2(payload, options = {}) {
  const root = isRecord(payload) ? payload.productResearchResultV2 : null
  const nested = isRecord(payload?.analysis) ? payload.analysis.productResearchResultV2 : null
  if (root && nested && !equalCanonical(root, nested)) {
    throw new ProductResearchResultV2ContractError(
      'root_analysis_divergence',
      'The institutional product analysis failed its data-integrity check.',
    )
  }
  const selected = root || nested
  if (!selected) {
    if (options.requireContract) {
      throw new ProductResearchResultV2ContractError(
        'missing_product_research_result_v2',
        'The institutional product analysis is not available in this response.',
      )
    }
    return Object.freeze({
      result: null,
      customerPresentation: null,
      source: null,
      parityStatus: 'compatibility_fallback',
    })
  }
  const result = validateContract(selected)
  return Object.freeze({
    result,
    customerPresentation: result.customerPresentation,
    source: root ? 'root' : 'analysis_transitional_fallback',
    parityStatus: root && nested ? 'matched' : root ? 'root_only' : 'analysis_fallback',
  })
}

