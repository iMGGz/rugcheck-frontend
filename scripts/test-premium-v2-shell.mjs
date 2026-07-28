import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { buildV2Fixture } from './fixtures/premium-asset-v2-fixtures.mjs'

const root = process.cwd()
const source = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8')
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

try {
  const [
    routes,
    routeContext,
    { default: PremiumV2AppShell },
    { default: V2AssetDecisionCommandCenter },
    { V2_ASSET_SECTIONS },
    search,
    researchUtils,
  ] = await Promise.all([
    server.ssrLoadModule('/src/v2/v2RouteConfig.js'),
    server.ssrLoadModule('/src/v2/shell/V2RouteContext.jsx'),
    server.ssrLoadModule('/src/v2/shell/PremiumV2AppShell.jsx'),
    server.ssrLoadModule('/src/v2/components/V2AssetDecisionCommandCenter.jsx'),
    server.ssrLoadModule('/src/v2/assetDecisionCommandCenterV2.js'),
    server.ssrLoadModule('/src/v2/components/V2AssetSearch.jsx'),
    server.ssrLoadModule('/src/components/research/researchUtils.js'),
  ])

  const routeValidation = routes.validateV2RouteConfiguration()
  assert.equal(routeValidation.shellOwnerCount, 1)
  assert.equal(routeValidation.routeIdCount, routeValidation.uniqueRouteIdCount)
  assert.equal(routeValidation.activePathCount, routeValidation.uniqueActivePathCount)
  assert.equal(routeValidation.internalQaRouteExposed, false)
  assert.equal(routeValidation.plannedProductRouteExposed, false)

  const canonicalRoutes = [
    ['/terminal-v2', 'asset_entry'],
    ['/terminal-v2/asset/ethereum?cg=ethereum&symbol=ETH&name=Ethereum', 'asset'],
    ['/terminal-v2/discover', 'discover_overview'],
    ['/terminal-v2/discover/rwa-hybrid-finance', 'discover_universe'],
    ['/terminal-v2/discover/stablecoin-yield-yield-bearing-assets', 'discover_universe'],
  ]
  for (const [href, expectedKind] of canonicalRoutes) {
    const location = new URL(href, 'https://example.test')
    assert.equal(routes.resolveV2Route(location).kind, expectedKind)
    assert.equal(routes.resolveV2Route(location).kind, expectedKind, 'Direct refresh must resolve deterministically')
  }
  assert.equal(routes.resolveV2Route(new URL('/terminal-v2/no-such-route', 'https://example.test')).kind, 'not_found')
  assert.equal(routes.resolveV2Route(new URL('/terminal-v2/discover/no-such-universe', 'https://example.test')).kind, 'invalid_universe')
  assert.equal(routes.resolveV2Route(new URL('/terminal-v2/asset/%E0%A4%A', 'https://example.test')).kind, 'invalid_asset')
  assert.equal(routes.isV2Path('/terminal-v2/asset/ethereum'), true)
  assert.equal(routes.isV2Path('/'), false)

  const assetRoute = routes.resolveV2Route(new URL('/terminal-v2/asset/ondo-finance?cg=ondo-finance&name=Ondo&from=rwa-hybrid-finance', 'https://example.test'))
  const breadcrumbs = routes.buildV2Breadcrumbs(assetRoute, { assetName: 'Ondo Finance Institutional Token With A Long Canonical Display Name' })
  assert.deepEqual(breadcrumbs.map((item) => item.label), [
    'Discover',
    'RWA / Hybrid Finance',
    'Ondo Finance Institutional Token With A Long Canonical Display Name',
  ])
  assert.equal(breadcrumbs.at(-1).current, true)
  assert.equal(routes.buildV2Breadcrumbs(routes.resolveV2Route(new URL('/terminal-v2/asset/ethereum?name=Ethereum', 'https://example.test')))[1].label, 'Ethereum')
  assert.equal(routes.buildV2Breadcrumbs(routes.resolveV2Route(new URL('/terminal-v2/asset/ethereum', 'https://example.test')))[1].label, 'Loading asset')

  const shellHtml = renderToString(
    React.createElement(
      routeContext.V2RouteProvider,
      null,
      React.createElement(PremiumV2AppShell, null, React.createElement('section', null, React.createElement('h1', null, 'Test route'))),
    ),
  )
  assert.equal((shellHtml.match(/data-shell-version=/g) || []).length, 1, 'Shell must render exactly once')
  assert.equal((shellHtml.match(/<main\b/g) || []).length, 1, 'Shell must own the only main landmark')
  assert.equal((shellHtml.match(/id="v2-main-content"/g) || []).length, 1)
  assert.match(shellHtml, /Skip to main content/)
  assert.match(shellHtml, /Primary product navigation/)
  assert.match(shellHtml, /Search assets or universes/)
  assert.match(shellHtml, /Asset Research/)
  assert.match(shellHtml, /RWA \/ Hybrid Finance/)
  assert.match(shellHtml, /Stablecoin Yield/)
  assert.match(shellHtml, /Legacy Research/)
  assert.doesNotMatch(shellHtml, />Internal QA</)
  assert.doesNotMatch(shellHtml, /undefined|NaN|\[object Object\]/)

  const researchItem = routes.V2_NAVIGATION_GROUPS[0].items[0]
  const discoverItem = routes.V2_NAVIGATION_GROUPS[0].items[1]
  assert.equal(routes.isNavigationItemActive(researchItem, routes.resolveV2Route({ pathname: '/terminal-v2/asset/ethereum' })), true)
  assert.equal(routes.isNavigationItemActive(discoverItem, routes.resolveV2Route({ pathname: '/terminal-v2/discover' })), true)
  assert.equal(routes.isNavigationItemActive(discoverItem, routes.resolveV2Route({ pathname: '/terminal-v2/discover/rwa-hybrid-finance' })), false)

  const contextFixture = buildV2Fixture('ETH')
  contextFixture.identity.data.name = 'Ethereum Canonical Settlement Asset With A Deliberately Long Display Name'
  const contextHtml = renderToString(React.createElement(V2AssetDecisionCommandCenter, {
    result: contextFixture,
    activeSection: 'fundamentals',
    onSelectSection: () => {},
  }))
  assert.match(contextHtml, /Ethereum Canonical Settlement Asset/)
  assert.match(contextHtml, /Current institutional decision/)
  assert.match(contextHtml, /aria-current="page"><span>Fundamentals/)
  assert.equal(V2_ASSET_SECTIONS.length, 6)
  assert.deepEqual(V2_ASSET_SECTIONS.map((item) => item.id), ['overview', 'market-supply', 'tokenomics', 'fundamentals', 'reality', 'technical'])
  assert.doesNotMatch(contextHtml, /undefined|NaN|\[object Object\]/)

  const candidate = {
    name: 'Ethereum',
    symbol: 'ETH',
    coingeckoId: 'ethereum',
    chain: 'ethereum',
    identitySummary: { representationType: 'native_asset' },
  }
  const entries = search.normalizeV2SearchEntries({
    resolution: { directMatch: candidate, candidates: [candidate] },
  }, 'ethereum', true)
  assert.equal(entries.filter((entry) => entry.type === 'asset').length, 1, 'Duplicate provider candidates must collapse by canonical ID')
  assert.equal(entries.filter((entry) => entry.type === 'universe').length, 0)
  assert.equal(search.normalizeV2SearchEntries(null, 'rwa', true)[0].universe.id, 'rwa-hybrid-finance')

  const mainSource = source('src/main.jsx')
  const routerSource = source('src/v2/PremiumV2Router.jsx')
  const shellSource = source('src/v2/shell/PremiumV2AppShell.jsx')
  const routeContextSource = source('src/v2/shell/V2RouteContext.jsx')
  const searchSource = source('src/v2/components/V2AssetSearch.jsx')
  const assetSource = source('src/v2/PremiumAssetPageV2.jsx')
  const discoverSource = source('src/v2/PremiumDiscoverV2.jsx')
  const routeConfigSource = source('src/v2/v2RouteConfig.js')
  const shellCss = source('src/v2/styles/v2-shell.css')
  const tokenCss = source('src/v2/styles/v2-tokens.css')
  const productCorpus = [mainSource, routerSource, shellSource, routeContextSource, searchSource, assetSource, discoverSource, routeConfigSource].join('\n')

  assert.match(mainSource, /PremiumV2Router/)
  assert.doesNotMatch(mainSource, /PremiumAssetPageV2 = lazy|PremiumDiscoverV2 = lazy/)
  assert.match(routerSource, /<PremiumV2AppShell>/)
  assert.match(routerSource, /window\.history\.back\(\)/)
  assert.match(routerSource, />Go back<\/button>/)
  assert.equal((routerSource.match(/<PremiumV2AppShell>/g) || []).length, 1)
  assert.match(routerSource, /lazy\(\(\) => import\('\.\/PremiumAssetPageV2\.jsx'\)\)/)
  assert.match(routerSource, /lazy\(\(\) => import\('\.\/PremiumDiscoverV2\.jsx'\)\)/)
  assert.doesNotMatch(assetSource, /v2-topbar|<main\b|className="v2-app-shell"/)
  assert.doesNotMatch(discoverSource, /v2-topbar|<main\b|function Shell|className="v2-app-shell"/)
  assert.match(shellSource, /aria-expanded=\{mobileNavigationOpen\}/)
  assert.match(shellSource, /event\.key === 'Escape'/)
  assert.match(shellSource, /menuTriggerRef\.current\?\.focus\(\)/)
  assert.match(shellSource, /document\.body\.style\.overflow = 'hidden'/)
  assert.match(routeContextSource, /addEventListener\('popstate'/)
  assert.match(routeContextSource, /addEventListener\('hashchange'/)
  assert.match(searchSource, /event\.metaKey \|\| event\.ctrlKey|requestSequenceRef|controllerRef\.current\?\.abort|280/)
  assert.match(searchSource, /ArrowDown|ArrowUp|Enter|Escape/)
  assert.match(searchSource, /status: 'degraded'/)
  assert.match(shellCss, /@media \(max-width: 1120px\)/)
  assert.match(shellCss, /@media \(max-width: 700px\)/)
  assert.match(shellCss, /@media \(max-width: 390px\)/)
  assert.match(shellCss, /prefers-reduced-motion/)
  assert.match(shellCss, /overflow-x: clip/)
  assert.match(shellCss, /min-height: 44px/)
  assert.match(tokenCss, /--v2-space-1:\s*4px/)
  assert.match(tokenCss, /--v2-focus-ring/)
  assert.equal((routeConfigSource.match(/id: 'internal-qa'/g) || []).length, 1)
  assert.equal((routeConfigSource.match(/label: 'Internal QA'/g) || []).length, 1)
  assert.doesNotMatch(productCorpus, /localStorage|sessionStorage|partialRefresh|hydrateSnapshot/)
  assert.doesNotMatch(productCorpus, /if\s*\(\s*(?:symbol|assetSymbol)\s*===?\s*['"][A-Z0-9]+['"]/)
  assert.doesNotMatch([shellSource, routeContextSource, searchSource].join('\n'), /displayedScore\s*[+\-*/]|confidence\s*[+\-*/]|verdict\s*=|marketCap\s*[+\-*/]|rankingScore/)

  const bundleSource = source('src/components/research/researchUtils.js')
  assert.match(bundleSource, /Premium V2 Product Shell \/ Navigation QA/)
  assert.match(bundleSource, /Frontend analytical calculation count/)
  const shellBundle = researchUtils.buildReviewBundleText({
    premiumV2ShellQa: {
      ...routes.PREMIUM_V2_SHELL_QA,
      activeRoute: '/terminal-v2',
    },
  })
  assert.match(shellBundle, /Premium V2 Product Shell \/ Navigation QA/)
  assert.match(shellBundle, /Hosting configuration detected: yes/)
  assert.match(shellBundle, /SPA fallback configured: yes/)
  assert.match(shellBundle, /API rewrite exclusion status: pass/)
  assert.match(shellBundle, /Technical Open V2 customer copy present: no/)
  assert.match(shellBundle, /Premium product entry label: Research Terminal/)
  assert.match(shellBundle, /Application not-found attached: yes/)
  assert.match(shellBundle, /Deployed route QA status: pending/)
  assert.match(source('src/components/research/ResearchHeader.jsx'), />Research Terminal<\/ProductViewLink>/)
  assert.doesNotMatch(source('src/components/research/ResearchHeader.jsx'), /Open ThesisCore V2|Open V2|V2 Preview/)
  assert.equal((source('src/main.jsx').match(/<PremiumV2Router/g) || []).length, 1)

  console.log(JSON.stringify({
    status: 'PASS',
    shellOwnerCount: 1,
    canonicalRouteCount: canonicalRoutes.length,
    activeUniverseCount: routes.V2_ACTIVE_UNIVERSES.length,
    assetSectionCount: V2_ASSET_SECTIONS.length,
    globalSearchResultTypes: ['asset', 'universe'],
    responsiveWidths: [1440, 1024, 390],
    browserOnlyChecksPending: ['drawer_focus_runtime', 'horizontal_overflow', 'visual_screenshot_matrix'],
    frontendAnalyticalCalculationCount: 0,
  }, null, 2))
} finally {
  await server.close()
}
