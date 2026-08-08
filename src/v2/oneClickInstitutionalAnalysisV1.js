export class OneClickInstitutionalAnalysisV1ContractError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'OneClickInstitutionalAnalysisV1ContractError'
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

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

function validate(value) {
  if (!isRecord(value) || value.contractId !== 'oneClickInstitutionalAnalysisV1' || value.schemaVersion !== 'one-click-institutional-analysis-v1') {
    throw new OneClickInstitutionalAnalysisV1ContractError('malformed_one_click_analysis', 'The One-Click Institutional Analysis contract is malformed.')
  }
  const requiredArrays = ['strengths', 'whatHoldsItBack', 'keyRisks', 'falsifiers', 'fundamentalQuestions', 'missingData', 'calculations', 'sources']
  if (requiredArrays.some((field) => !Array.isArray(value[field])) || !isRecord(value.identity) || !isRecord(value.family) || !isRecord(value.technicalAnalysis)) {
    throw new OneClickInstitutionalAnalysisV1ContractError('incomplete_one_click_analysis', 'The One-Click Institutional Analysis contract is incomplete.')
  }
  return deepFreeze(value)
}

export function normalizeOneClickInstitutionalAnalysisV1(payload, options = {}) {
  const root = isRecord(payload) ? payload.oneClickInstitutionalAnalysisV1 : null
  const nested = isRecord(payload?.analysis) ? payload.analysis.oneClickInstitutionalAnalysisV1 : null
  if (root && nested && JSON.stringify(canonicalize(root)) !== JSON.stringify(canonicalize(nested))) {
    throw new OneClickInstitutionalAnalysisV1ContractError('root_analysis_divergence', 'The One-Click Institutional Analysis root and analysis mirrors diverge.')
  }
  const selected = root || nested
  if (!selected && options.required) {
    throw new OneClickInstitutionalAnalysisV1ContractError('missing_one_click_analysis', 'One-Click Institutional Analysis is unavailable.')
  }
  return Object.freeze({
    result: selected ? validate(selected) : null,
    parityStatus: root && nested ? 'root_analysis_matched' : root ? 'root_only' : nested ? 'analysis_fallback' : 'missing',
  })
}

