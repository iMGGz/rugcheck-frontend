const REQUIRED_SECTIONS = [
  'identity',
  'representation',
  'classification',
  'historicalMarketData',
  'market',
  'liquidity',
  'tokenomics',
  'protocolEconomics',
  'fundamentals',
  'currentReality',
  'valueCapture',
  'technicalStructure',
  'valuation',
  'risks',
  'thesis',
  'evidenceSummary',
  'decision',
  'sourceHealth',
  'productAvailability',
]

export const V2_SECTION_LABELS = Object.freeze({
  available: 'Available',
  partial: 'Partial coverage',
  unavailable: 'Data not available yet',
  not_applicable: 'Not applicable to this asset type',
  manual_review_required: 'Manual verification required',
  future_milestone: 'Coming later',
  degraded: 'Limited coverage',
})

export const V2_INTERNAL_LEAKAGE_PATTERNS = Object.freeze([
  /\b2(?:A|B)[A-Z0-9]+\b/i,
  /\b(?:assetResearchResultV2|finalAnalystAnswerComposerContract|primaryAnalysisRoute|canonicalProductRoute)\b/i,
  /\b(?:source_required|live_data_required|legacy_diagnostic_only|future_milestone|not_evaluated)\b/i,
  /\b(?:claimIds?|packIds?|ruleIds?|artifactVersion|scoringActive|sourcePromotionActive)\b/i,
  /\b(?:route parity|scanner diagnostic|internal qa|copy bundle)\b/i,
  /(?:^|[\\/])(?:src|dist|docs)[\\/]/i,
])

export class AssetResearchV2ContractError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'AssetResearchV2ContractError'
    this.code = code
  }
}

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!isRecord(value)) return value
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  )
}

export function areV2ResultsEqual(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right))
}

function validateSection(sectionName, section) {
  if (!isRecord(section) || typeof section.status !== 'string' || !isRecord(section.data)) {
    throw new AssetResearchV2ContractError(
      'malformed_v2_result',
      `AssetResearchResultV2 section ${sectionName} is malformed.`,
    )
  }
}

function validateV2Result(result) {
  if (!isRecord(result) || typeof result.schemaVersion !== 'string' || !result.schemaVersion.startsWith('2.')) {
    throw new AssetResearchV2ContractError('malformed_v2_result', 'AssetResearchResultV2 is malformed.')
  }
  if (typeof result.resultId !== 'string' || typeof result.generatedAt !== 'string') {
    throw new AssetResearchV2ContractError('malformed_v2_result', 'AssetResearchResultV2 identity metadata is malformed.')
  }
  for (const sectionName of REQUIRED_SECTIONS) validateSection(sectionName, result[sectionName])
  return result
}

export function resolveAssetResearchResultV2(payload, options = {}) {
  const root = isRecord(payload) ? payload.assetResearchResultV2 : null
  const nested = isRecord(payload?.analysis) ? payload.analysis.assetResearchResultV2 : null

  if (root && nested && !areV2ResultsEqual(root, nested)) {
    const error = new AssetResearchV2ContractError(
      'root_nested_divergence',
      'The current research result failed its data-integrity check.',
    )
    if (options.throwOnDivergence !== false || import.meta.env?.DEV || import.meta.env?.MODE === 'test') throw error
    return { result: null, source: null, parityStatus: 'divergent', error }
  }

  const selected = root || nested
  if (!selected) {
    throw new AssetResearchV2ContractError('missing_v2_result', 'AssetResearchResultV2 is missing from the analysis response.')
  }

  return Object.freeze({
    result: validateV2Result(selected),
    source: root ? 'root' : 'nested_transitional_fallback',
    parityStatus: root && nested ? 'matched' : root ? 'root_only' : 'nested_fallback',
  })
}

export function normalizeAssetResearchResultV2(payload, options = {}) {
  return resolveAssetResearchResultV2(payload, options)
}

export function sectionPresentation(status) {
  return V2_SECTION_LABELS[status] || 'Status unavailable'
}

export function humanizeV2Value(value, fallback = 'Not available') {
  if (value === null || value === undefined || value === '') return fallback
  const normalized = String(value).trim()
  if (!normalized) return fallback
  return normalized
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function containsInternalV2Leakage(value) {
  if (typeof value !== 'string') return false
  return V2_INTERNAL_LEAKAGE_PATTERNS.some((pattern) => pattern.test(value))
}

export function safeProductText(value, fallback = null) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (!trimmed || containsInternalV2Leakage(trimmed)) return fallback
  return trimmed
}

export function safeProductList(values, limit = Infinity) {
  if (!Array.isArray(values)) return []
  return values
    .map((value) => safeProductText(value))
    .filter(Boolean)
    .slice(0, limit)
}

export function finiteMetricValue(metric) {
  const value = metric?.value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return null
}

export function formatV2Number(value, options = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return options.fallback || 'Not available'
  const maximumFractionDigits = options.maximumFractionDigits ?? (Math.abs(value) < 1 ? 6 : 2)
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: options.minimumFractionDigits || 0,
    notation: options.compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  }).format(value)
}

export function formatV2Usd(value, options = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return options.fallback || 'Not available'
  const absolute = Math.abs(value)
  const maximumFractionDigits = options.maximumFractionDigits ?? (absolute > 0 && absolute < 0.01 ? 8 : absolute < 1 ? 4 : 2)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: options.compact ? 'compact' : 'standard',
    compactDisplay: 'short',
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value)
}

export function formatV2Percent(value, options = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return options.fallback || 'Not available'
  const normalized = options.fraction ? value * 100 : value
  return `${formatV2Number(normalized, { maximumFractionDigits: options.maximumFractionDigits ?? 1 })}%`
}

export function formatV2Ratio(value, options = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return options.fallback || 'Not available'
  return `${formatV2Number(value, { maximumFractionDigits: options.maximumFractionDigits ?? 2 })}x`
}

export function formatV2Date(value, options = {}) {
  if (!value) return options.fallback || 'Time unavailable'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return options.fallback || 'Time unavailable'
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: options.includeTime === false ? 'medium' : undefined,
    day: options.includeTime === false ? undefined : '2-digit',
    month: options.includeTime === false ? undefined : 'short',
    year: options.includeTime === false ? undefined : 'numeric',
    hour: options.includeTime === false ? undefined : '2-digit',
    minute: options.includeTime === false ? undefined : '2-digit',
  }).format(parsed)
}
