function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalize(value) {
  return clean(value).toLowerCase()
}

export function canonicalAssetIdForCandidate(candidate) {
  if (clean(candidate?.coingeckoId)) return clean(candidate.coingeckoId)
  if (candidate?.coinmarketcapId !== null && candidate?.coinmarketcapId !== undefined && String(candidate.coinmarketcapId).trim()) {
    return `coinmarketcap:${candidate.coinmarketcapId}`
  }
  if (clean(candidate?.chain) && /^0x[0-9a-f]{40}$/i.test(clean(candidate?.contractAddress))) {
    return `contract:${normalize(candidate.chain)}:${normalize(candidate.contractAddress)}`
  }
  return null
}

export function buildV2AssetPath(candidate) {
  const canonicalAssetId = canonicalAssetIdForCandidate(candidate)
  if (!canonicalAssetId) return null
  const params = new URLSearchParams()
  if (clean(candidate?.coingeckoId)) params.set('cg', clean(candidate.coingeckoId))
  if (candidate?.coinmarketcapId !== null && candidate?.coinmarketcapId !== undefined && String(candidate.coinmarketcapId).trim()) {
    params.set('cmc', String(candidate.coinmarketcapId))
  }
  if (clean(candidate?.chain)) params.set('network', clean(candidate.chain))
  if (clean(candidate?.contractAddress)) params.set('contract', clean(candidate.contractAddress))
  if (clean(candidate?.symbol)) params.set('symbol', clean(candidate.symbol))
  if (clean(candidate?.name)) params.set('name', clean(candidate.name))
  const representation = clean(candidate?.identitySummary?.representationType)
  if (representation) params.set('representation', representation)
  const suffix = params.toString()
  return `/terminal-v2/asset/${encodeURIComponent(canonicalAssetId)}${suffix ? `?${suffix}` : ''}`
}

export function parseV2Location(locationLike) {
  const pathname = locationLike?.pathname || '/'
  const assetMatch = pathname.match(/^\/terminal-v2\/asset\/([^/]+)\/?$/)
  if (!assetMatch) {
    return pathname === '/terminal-v2' || pathname === '/terminal-v2/'
      ? { kind: 'entry', canonicalAssetId: null, identityScope: {} }
      : { kind: 'not_found', canonicalAssetId: null, identityScope: {} }
  }
  let canonicalAssetId = ''
  try {
    canonicalAssetId = decodeURIComponent(assetMatch[1]).trim()
  } catch {
    return { kind: 'invalid', canonicalAssetId: null, identityScope: {} }
  }
  if (!canonicalAssetId || canonicalAssetId.length > 160) return { kind: 'invalid', canonicalAssetId: null, identityScope: {} }
  const params = new URLSearchParams(locationLike?.search || '')
  return {
    kind: 'asset',
    canonicalAssetId,
    identityScope: {
      coingeckoId: params.get('cg'),
      coinmarketcapId: params.get('cmc'),
      network: params.get('network'),
      contractAddress: params.get('contract'),
      symbol: params.get('symbol'),
      name: params.get('name'),
      representationType: params.get('representation'),
    },
  }
}

function candidateMatchesRoute(candidate, route) {
  const routeId = normalize(route.canonicalAssetId)
  const candidateId = normalize(canonicalAssetIdForCandidate(candidate))
  if (!routeId || candidateId !== routeId) return false
  const scope = route.identityScope || {}
  if (scope.coingeckoId && normalize(candidate.coingeckoId) !== normalize(scope.coingeckoId)) return false
  if (scope.coinmarketcapId && String(candidate.coinmarketcapId ?? '') !== String(scope.coinmarketcapId)) return false
  if (scope.network && normalize(candidate.chain) !== normalize(scope.network)) return false
  if (scope.contractAddress && normalize(candidate.contractAddress) !== normalize(scope.contractAddress)) return false
  return true
}

export function findExactCandidateForRoute(resolution, route) {
  const candidates = [resolution?.directMatch, ...(Array.isArray(resolution?.candidates) ? resolution.candidates : [])]
    .filter(Boolean)
  return candidates.find((candidate) => candidateMatchesRoute(candidate, route)) || null
}

export function queryForCanonicalRoute(route) {
  // Display hints discover candidates; exact provider/network/contract matching remains authoritative.
  if (route?.identityScope?.symbol) return route.identityScope.symbol
  if (route?.identityScope?.name) return route.identityScope.name
  if (route?.identityScope?.coingeckoId) return route.identityScope.coingeckoId
  if (route?.identityScope?.contractAddress) return route.identityScope.contractAddress
  if (route?.identityScope?.coinmarketcapId) return route.identityScope.coinmarketcapId
  if (normalize(route?.canonicalAssetId).startsWith('coinmarketcap:')) return route.canonicalAssetId.split(':')[1] || ''
  if (normalize(route?.canonicalAssetId).startsWith('contract:')) return route.canonicalAssetId.split(':').slice(2).join(':')
  return clean(route?.canonicalAssetId)
}

export function v2ResultMatchesRoute(result, route) {
  const identity = result?.identity?.data || {}
  const routeId = normalize(route?.canonicalAssetId)
  if (!routeId) return false
  if (routeId.startsWith('coinmarketcap:')) {
    return routeId === `coinmarketcap:${identity.canonicalProviderIds?.coinmarketcapId}`.toLowerCase()
  }
  if (routeId.startsWith('contract:')) {
    const expectedContract = normalize(route?.identityScope?.contractAddress || route.canonicalAssetId.split(':').slice(2).join(':'))
    return Boolean(expectedContract && normalize(identity.analyzedContract) === expectedContract)
  }
  if (normalize(identity.canonicalProviderIds?.coingeckoId) !== routeId && normalize(identity.canonicalAssetId) !== routeId) return false
  if (route?.identityScope?.network && normalize(identity.analyzedNetwork) !== normalize(route.identityScope.network)) return false
  if (route?.identityScope?.contractAddress && normalize(identity.analyzedContract) !== normalize(route.identityScope.contractAddress)) return false
  return true
}

export function createV2RequestCoordinator() {
  let sequence = 0
  let activeController = null
  return {
    begin() {
      activeController?.abort()
      activeController = new AbortController()
      sequence += 1
      return { requestId: sequence, signal: activeController.signal }
    },
    isCurrent(requestId) {
      return requestId === sequence && !activeController?.signal.aborted
    },
    cancel() {
      activeController?.abort()
      activeController = null
      sequence += 1
    },
    currentRequestId() {
      return sequence
    },
  }
}
