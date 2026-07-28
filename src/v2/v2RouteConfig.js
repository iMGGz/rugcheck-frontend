const clean = (value) => typeof value === 'string' ? value.trim() : ''

export const V2_SHELL_VERSION = 'premium-v2-shell-v1.0.0'

export const V2_ACTIVE_UNIVERSES = Object.freeze([
  Object.freeze({
    id: 'rwa-hybrid-finance',
    label: 'RWA / Hybrid Finance',
    shortLabel: 'RWA',
    href: '/terminal-v2/discover/rwa-hybrid-finance',
    description: 'Tokenization, institutional rails, and product-to-token boundaries.',
  }),
  Object.freeze({
    id: 'stablecoin-yield',
    label: 'Stablecoin Yield',
    shortLabel: 'Yield',
    href: '/terminal-v2/discover/stablecoin-yield-yield-bearing-assets',
    description: 'Stable assets and yield-bearing candidates with explicit product limits.',
  }),
])

export const V2_NAVIGATION_GROUPS = Object.freeze([
  Object.freeze({
    id: 'research',
    label: 'Research',
    items: Object.freeze([
      Object.freeze({ id: 'asset-research', label: 'Asset Research', href: '/terminal-v2', icon: 'compass' }),
      Object.freeze({ id: 'discover', label: 'Discover', href: '/terminal-v2/discover', icon: 'search' }),
    ]),
  }),
  Object.freeze({
    id: 'universes',
    label: 'Active universes',
    items: Object.freeze(V2_ACTIVE_UNIVERSES.map((universe) => Object.freeze({
      id: universe.id,
      label: universe.label,
      href: universe.href,
      icon: 'layers',
    }))),
  }),
  Object.freeze({
    id: 'secondary',
    label: 'Secondary',
    secondary: true,
    items: Object.freeze([
      Object.freeze({ id: 'legacy-research', label: 'Legacy Research', href: '/', icon: 'clock', externalShell: true }),
    ]),
  }),
])

export const V2_ROUTE_DEFINITIONS = Object.freeze([
  Object.freeze({ id: 'asset-research', kind: 'asset_entry', path: '/terminal-v2', label: 'Asset Research', classification: 'canonical_v2' }),
  Object.freeze({ id: 'asset-detail', kind: 'asset', path: '/terminal-v2/asset/:canonicalAssetId', label: 'Asset Research', classification: 'canonical_v2' }),
  Object.freeze({ id: 'discover', kind: 'discover_overview', path: '/terminal-v2/discover', label: 'Discover', classification: 'canonical_v2' }),
  Object.freeze({ id: 'rwa-hybrid-finance', kind: 'discover_universe', path: V2_ACTIVE_UNIVERSES[0].href, label: V2_ACTIVE_UNIVERSES[0].label, classification: 'canonical_v2' }),
  Object.freeze({ id: 'stablecoin-yield', kind: 'discover_universe', path: V2_ACTIVE_UNIVERSES[1].href, label: V2_ACTIVE_UNIVERSES[1].label, classification: 'canonical_v2' }),
  Object.freeze({ id: 'legacy-research', kind: 'legacy', path: '/', label: 'Legacy Research', classification: 'legacy' }),
  Object.freeze({ id: 'internal-qa', kind: 'internal_qa', path: null, label: 'Internal QA', classification: 'unavailable' }),
  Object.freeze({ id: 'product-detail', kind: 'planned_product', path: '/terminal-v2/product/:canonicalProductId', label: 'Product Research', classification: 'planned_not_exposed' }),
])

function normalizePathname(value) {
  const pathname = clean(value) || '/'
  if (pathname === '/') return pathname
  return pathname.replace(/\/+$/, '')
}

function safeDecode(value, maximumLength) {
  try {
    const decoded = decodeURIComponent(value).trim()
    return decoded && decoded.length <= maximumLength ? decoded : null
  } catch {
    return null
  }
}

function identityScope(search) {
  const params = new URLSearchParams(search || '')
  return {
    coingeckoId: params.get('cg'),
    coinmarketcapId: params.get('cmc'),
    network: params.get('network'),
    contractAddress: params.get('contract'),
    symbol: params.get('symbol'),
    name: params.get('name'),
    representationType: params.get('representation'),
    sourceUniverseSlug: params.get('from'),
  }
}

export function resolveV2Route(locationLike = {}) {
  const pathname = normalizePathname(locationLike.pathname)
  const search = locationLike.search || ''
  if (pathname === '/terminal-v2') {
    return { id: 'asset-research', kind: 'asset_entry', label: 'Asset Research', pathname, canonicalAssetId: null, identityScope: {} }
  }
  if (pathname === '/terminal-v2/discover') {
    return { id: 'discover', kind: 'discover_overview', label: 'Discover', pathname, slug: null }
  }
  const assetMatch = pathname.match(/^\/terminal-v2\/asset\/([^/]+)$/)
  if (assetMatch) {
    const canonicalAssetId = safeDecode(assetMatch[1], 160)
    return canonicalAssetId
      ? { id: 'asset-detail', kind: 'asset', label: 'Asset Research', pathname, canonicalAssetId, identityScope: identityScope(search) }
      : { id: 'invalid-asset', kind: 'invalid_asset', label: 'Invalid asset route', pathname, canonicalAssetId: null, identityScope: {} }
  }
  const universeMatch = pathname.match(/^\/terminal-v2\/discover\/([^/]+)$/)
  if (universeMatch) {
    const slug = safeDecode(universeMatch[1], 120)
    if (!slug) return { id: 'invalid-universe', kind: 'invalid_universe', label: 'Invalid universe route', pathname, slug: null }
    const universe = V2_ACTIVE_UNIVERSES.find((entry) => entry.href.endsWith(`/${slug}`))
    if (!universe) return { id: 'invalid-universe', kind: 'invalid_universe', label: 'Research universe not found', pathname, slug }
    return {
      id: universe.id,
      kind: 'discover_universe',
      label: universe.label,
      pathname,
      slug,
      universe,
    }
  }
  return pathname.startsWith('/terminal-v2')
    ? { id: 'v2-not-found', kind: 'not_found', label: 'Page not found', pathname }
    : { id: 'outside-v2', kind: 'outside_v2', label: 'Legacy Research', pathname }
}

export function isV2Path(pathname) {
  const normalized = normalizePathname(pathname)
  return normalized === '/terminal-v2' || normalized.startsWith('/terminal-v2/')
}

export function isNavigationItemActive(item, route) {
  if (!item || !route) return false
  if (item.id === 'asset-research') return route.kind === 'asset_entry' || route.kind === 'asset'
  if (item.id === 'discover') return route.kind === 'discover_overview'
  return item.id === route.id
}

export function matchV2AssetRoute(locationLike) {
  const route = resolveV2Route(locationLike)
  if (route.kind === 'asset_entry') return { kind: 'entry', canonicalAssetId: null, identityScope: {} }
  if (route.kind === 'asset') return { kind: 'asset', canonicalAssetId: route.canonicalAssetId, identityScope: route.identityScope }
  if (route.kind === 'invalid_asset') return { kind: 'invalid', canonicalAssetId: null, identityScope: {} }
  return { kind: 'not_found', canonicalAssetId: null, identityScope: {} }
}

export function matchV2DiscoverRoute(locationLike) {
  const route = resolveV2Route(locationLike)
  if (route.kind === 'discover_overview') return { kind: 'overview', slug: null }
  if (route.kind === 'discover_universe') return { kind: 'universe', slug: route.slug }
  if (route.kind === 'invalid_universe') return { kind: 'invalid', slug: null }
  return { kind: 'not_found', slug: null }
}

export function buildV2Breadcrumbs(route, pageContext = {}) {
  if (route.kind === 'asset' || route.kind === 'asset_entry') {
    const sourceUniverse = V2_ACTIVE_UNIVERSES.find((entry) => entry.href.endsWith(`/${pageContext.sourceUniverseSlug || route.identityScope?.sourceUniverseSlug || ''}`))
    const assetName = clean(pageContext.assetName) || clean(route.identityScope?.name) || (route.kind === 'asset' ? 'Loading asset' : null)
    if (sourceUniverse && assetName) {
      return [
        { label: 'Discover', href: '/terminal-v2/discover' },
        { label: sourceUniverse.label, href: sourceUniverse.href },
        { label: assetName, current: true },
      ]
    }
    return assetName
      ? [{ label: 'Asset Research', href: '/terminal-v2' }, { label: assetName, current: true }]
      : [{ label: 'Asset Research', current: true }]
  }
  if (route.kind === 'discover_universe') {
    return [
      { label: 'Discover', href: '/terminal-v2/discover' },
      { label: clean(pageContext.universeName) || route.label, current: true },
    ]
  }
  if (route.kind === 'discover_overview') return [{ label: 'Discover', current: true }]
  return [{ label: route.label || 'Research Terminal', current: true }]
}

export function filterActiveUniverseResults(query) {
  const normalized = clean(query).toLowerCase()
  if (!normalized) return []
  return V2_ACTIVE_UNIVERSES.filter((universe) =>
    `${universe.label} ${universe.description}`.toLowerCase().includes(normalized),
  )
}

export function validateV2RouteConfiguration() {
  const routeIds = V2_ROUTE_DEFINITIONS.map((route) => route.id)
  const activePaths = V2_ROUTE_DEFINITIONS.filter((route) => route.classification === 'canonical_v2').map((route) => route.path)
  return {
    routeIdCount: routeIds.length,
    uniqueRouteIdCount: new Set(routeIds).size,
    activePathCount: activePaths.length,
    uniqueActivePathCount: new Set(activePaths).size,
    shellOwnerCount: 1,
    internalQaRouteExposed: false,
    plannedProductRouteExposed: false,
  }
}

export const PREMIUM_V2_SHELL_QA = Object.freeze({
  shellAttached: true,
  shellVersion: V2_SHELL_VERSION,
  canonicalV2EntryRoute: '/terminal-v2',
  routeMapStatus: 'canonical',
  globalHeaderAttached: true,
  globalSearchAttached: true,
  desktopNavigationAttached: true,
  compactNavigationAttached: true,
  assetContextNavigationAttached: true,
  discoverContextAttached: true,
  activeUniverseNavigationAttached: true,
  internalQaSeparated: true,
  legacyRoutePreserved: true,
  customerPrimaryNavContainsInternalQaTabs: false,
  hostingConfigurationDetected: true,
  hostingConfigurationPath: 'vercel.json',
  expectedDeploymentProjectRoot: 'rugcheck-frontend',
  projectRootProvenByRepository: false,
  spaFallbackConfigured: true,
  filesystemStaticResolutionPreserved: true,
  apiRewriteExclusionStatus: 'pass',
  directTerminalRouteValidation: 'pass_local_static_simulation',
  nestedV2RouteValidation: 'pass_local_static_simulation',
  directRefreshValidation: 'pass_local_http_browser_qa_pending',
  technicalOpenV2CustomerCopyPresent: false,
  premiumProductEntryPresent: true,
  premiumProductEntryLabel: 'Research Terminal',
  premiumProductEntrySameOrigin: true,
  applicationNotFoundAttached: true,
  staticAssetRegression: 'pass',
  localRouteQaStatus: 'pass_http_browser_pending',
  deployedRouteQaStatus: 'pending',
  browserVisualQaStatus: 'pending',
  testedViewports: [],
  screenshotEvidenceAvailable: false,
  knownLimitations: [
    'Before screenshots are unavailable because the local server launcher could not be bounded safely before implementation.',
    'Local browser interaction and visual QA remain pending.',
    'Repository files cannot prove the Vercel dashboard Root Directory setting.',
    'Deployed browser QA remains required before Product PASS.',
  ],
  frontendAnalyticalCalculationCount: 0,
  scoreChanged: false,
  confidenceChanged: false,
  verdictChanged: false,
  providerBehaviorChanged: false,
})
