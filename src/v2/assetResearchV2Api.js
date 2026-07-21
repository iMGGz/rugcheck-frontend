const PRODUCTION_API_BASE = 'https://research-terminal-backend-production.up.railway.app'

export function resolveV2ApiBase() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, '')
  if (typeof window !== 'undefined') {
    const local = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (local) return 'http://localhost:4000'
    if (window.location.protocol === 'https:') return PRODUCTION_API_BASE
  }
  return 'http://localhost:4000'
}

export class V2ApiError extends Error {
  constructor(code, message, status = null) {
    super(message)
    this.name = 'V2ApiError'
    this.code = code
    this.status = status
  }
}

async function parseResponse(response) {
  const raw = await response.text()
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    throw new V2ApiError('malformed_response', 'The research service returned an unreadable response.', response.status)
  }
}

export async function fetchV2Json(path, options = {}, timeoutMs = 45000) {
  const timeoutController = new AbortController()
  const externalSignal = options.signal
  const abortFromExternal = () => timeoutController.abort(externalSignal?.reason)
  if (externalSignal?.aborted) abortFromExternal()
  else externalSignal?.addEventListener('abort', abortFromExternal, { once: true })
  const timeout = window.setTimeout(() => timeoutController.abort('timeout'), timeoutMs)
  try {
    const response = await fetch(`${resolveV2ApiBase()}${path}`, {
      ...options,
      signal: timeoutController.signal,
      headers: { Accept: 'application/json', ...(options.headers || {}) },
    })
    const payload = await parseResponse(response)
    if (!response.ok) {
      const code = payload?.error?.code || (response.status === 404 ? 'not_found' : response.status === 400 ? 'invalid_identity' : 'backend_error')
      throw new V2ApiError(code, payload?.error?.message || 'The research service could not complete this request.', response.status)
    }
    return payload
  } catch (error) {
    if (timeoutController.signal.aborted) {
      if (externalSignal?.aborted) throw new DOMException('Request cancelled', 'AbortError')
      throw new V2ApiError('backend_error', 'The live analysis timed out. Please try again.')
    }
    if (error instanceof V2ApiError) throw error
    throw new V2ApiError('backend_error', 'The research service is temporarily unavailable.')
  } finally {
    window.clearTimeout(timeout)
    externalSignal?.removeEventListener('abort', abortFromExternal)
  }
}

export async function searchV2Assets(query, signal) {
  const cleanQuery = String(query || '').trim()
  if (!cleanQuery) throw new V2ApiError('invalid_identity', 'Enter an asset name, provider ID, or contract address.')
  return fetchV2Json(`/api/search/tokens?q=${encodeURIComponent(cleanQuery)}`, { signal }, 15000)
}

export async function analyzeV2Asset(query, selection, signal) {
  if (!selection?.coingeckoId && !selection?.coinmarketcapId && !selection?.contractAddress) {
    throw new V2ApiError('invalid_identity', 'A canonical provider or contract identity is required before analysis.')
  }
  return fetchV2Json('/api/analyze', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, mode: 'full', selection }),
  }, 90000)
}
