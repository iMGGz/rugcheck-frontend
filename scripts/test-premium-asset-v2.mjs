import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import {
  REPRESENTATIVE_V2_ASSETS,
  buildV2Fixture,
  buildV2Response,
} from './fixtures/premium-asset-v2-fixtures.mjs'

const root = process.cwd()
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const FUNDAMENTALS_DIMENSIONS = [
  'productReality', 'useCase', 'architecture', 'adoption', 'usageQuality', 'protocolEconomics',
  'revenueQuality', 'competitivePosition', 'moatAndDefensibility', 'dependencies', 'governance',
  'decentralization', 'security', 'operationalRisk', 'execution', 'developmentActivity', 'roadmap',
  'legalAndEconomicRights', 'protocolSuccess', 'tokenSuccess', 'protocolToTokenTransfer', 'thesis',
  'antiThesis', 'falsification', 'evidenceCoverage',
]

function source(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8')
}

function render(Component, props) {
  return renderToString(React.createElement(Component, props))
}

try {
  const [
    normalizer,
    commandCenterNormalizer,
    navigation,
    { default: PremiumAssetPageV2 },
    { default: V2AssetDecisionCommandCenter },
    { default: V2MarketLiquiditySupplyExperience },
    tabs,
    { default: V2ResearchRail },
    { default: V2SourcesPanel },
  ] = await Promise.all([
    server.ssrLoadModule('/src/v2/assetResearchResultV2.js'),
    server.ssrLoadModule('/src/v2/assetDecisionCommandCenterV2.js'),
    server.ssrLoadModule('/src/v2/assetResearchV2Navigation.js'),
    server.ssrLoadModule('/src/v2/PremiumAssetPageV2.jsx'),
    server.ssrLoadModule('/src/v2/components/V2AssetDecisionCommandCenter.jsx'),
    server.ssrLoadModule('/src/v2/components/V2MarketLiquiditySupplyExperience.jsx'),
    server.ssrLoadModule('/src/v2/components/V2ResearchTabs.jsx'),
    server.ssrLoadModule('/src/v2/components/V2ResearchRail.jsx'),
    server.ssrLoadModule('/src/v2/components/V2SourcesPanel.jsx'),
  ])

  const btcResponse = buildV2Response('BTC')
  const rootResolved = normalizer.normalizeAssetResearchResultV2(btcResponse)
  assert.equal(rootResolved.source, 'root')
  assert.equal(rootResolved.parityStatus, 'matched')
  assert.equal(rootResolved.result.identity.data.canonicalAssetId, 'bitcoin')

  const nestedResolved = normalizer.normalizeAssetResearchResultV2(buildV2Response('BTC', { omitRoot: true }))
  assert.equal(nestedResolved.source, 'nested_transitional_fallback')
  assert.equal(nestedResolved.parityStatus, 'nested_fallback')

  const divergent = buildV2Response('BTC', { nestedResult: buildV2Fixture('ETH') })
  assert.throws(
    () => normalizer.normalizeAssetResearchResultV2(divergent),
    (error) => error.code === 'root_nested_divergence',
  )
  assert.throws(() => normalizer.normalizeAssetResearchResultV2({}), (error) => error.code === 'missing_v2_result')
  assert.throws(
    () => normalizer.normalizeAssetResearchResultV2({ assetResearchResultV2: { schemaVersion: '2.0.0' } }),
    (error) => error.code === 'malformed_v2_result',
  )
  assert.equal(normalizer.sectionPresentation('unavailable'), 'Data not available yet')
  assert.equal(normalizer.sectionPresentation('not_applicable'), 'Not applicable to this asset type')
  assert.equal(normalizer.sectionPresentation('manual_review_required'), 'Manual verification required')
  assert.equal(normalizer.formatV2Usd(0), '$0')
  assert.equal(normalizer.finiteMetricValue({ value: 0 }), 0)

  const candidate = {
    name: 'Wrapped Bitcoin', symbol: 'WBTC', coingeckoId: 'wrapped-bitcoin', coinmarketcapId: 3717,
    chain: 'ethereum', contractAddress: '0x1111111111111111111111111111111111111111',
    identitySummary: { representationType: 'wrapped_asset' },
  }
  const routePath = navigation.buildV2AssetPath(candidate)
  assert.match(routePath, /^\/terminal-v2\/asset\/wrapped-bitcoin\?/)
  const parsedRoute = navigation.parseV2Location(new URL(`https://example.test${routePath}`))
  assert.equal(parsedRoute.kind, 'asset')
  assert.equal(parsedRoute.canonicalAssetId, 'wrapped-bitcoin')
  assert.equal(parsedRoute.identityScope.coingeckoId, 'wrapped-bitcoin')
  assert.equal(parsedRoute.identityScope.network, 'ethereum')
  assert.equal(parsedRoute.identityScope.contractAddress, candidate.contractAddress)
  assert.equal(parsedRoute.identityScope.symbol, 'WBTC')
  assert.equal(parsedRoute.identityScope.name, 'Wrapped Bitcoin')
  assert.equal(navigation.queryForCanonicalRoute(parsedRoute), 'WBTC')
  assert.equal(navigation.findExactCandidateForRoute({ directMatch: candidate, candidates: [candidate] }, parsedRoute), candidate)
  assert.equal(navigation.v2ResultMatchesRoute(buildV2Fixture('WBTC'), parsedRoute), true)
  const wrongRoute = navigation.parseV2Location(new URL('https://example.test/terminal-v2/asset/bitcoin'))
  assert.equal(navigation.v2ResultMatchesRoute(buildV2Fixture('WBTC'), wrongRoute), false)
  assert.equal(navigation.parseV2Location(new URL('https://example.test/terminal-v2')).kind, 'entry')
  assert.equal(navigation.parseV2Location(new URL('https://example.test/terminal-v2/asset/%E0%A4%A')).kind, 'invalid')

  const coordinator = navigation.createV2RequestCoordinator()
  const requestA = coordinator.begin()
  const requestB = coordinator.begin()
  assert.equal(requestA.signal.aborted, true)
  assert.equal(coordinator.isCurrent(requestA.requestId), false)
  assert.equal(coordinator.isCurrent(requestB.requestId), true)
  coordinator.cancel()
  assert.equal(requestB.signal.aborted, true)
  assert.equal(coordinator.isCurrent(requestB.requestId), false)

  const expectedVisibleCopy = {
    BTC: /Proof-of-work monetary security/,
    ETH: /Gas demand, fee burn, staking/,
    XRP: /Settlement usage and liquid market access/,
    USDC: /Reserve quality, redemption access/,
    WBTC: /Tokenized BTC exposure/,
    stETH: /Liquid staking exposure/,
    UNI: /Protocol usage is visible/,
    LINK: /Oracle adoption and security services/,
    ONDO: /RWA product adoption/,
    PAXG: /Physical backing, custody, and redemption/,
    RENDER: /Resource-network demand and provider incentives/,
    RSS3: /preliminary risk screen/,
    ADA: /Native-chain usage, staking security/,
    AVAX: /Native network usage, validator security/,
    SOL: /Native network usage, fee demand, issuance/,
    AAVE: /Protocol usage and safety-module mechanics/,
    PEPE: /Supply certainty, concentration, liquidity/,
    RIO: /RWA infrastructure usage/,
  }
  const renderedAssetResults = []
  for (const symbol of REPRESENTATIVE_V2_ASSETS) {
    const result = buildV2Fixture(symbol)
    const parts = [
      render(V2AssetDecisionCommandCenter, { result, activeSection: 'overview', onSelectSection: () => {} }),
      render(V2MarketLiquiditySupplyExperience, { result }),
      render(tabs.TokenomicsPanel, { result }),
      render(tabs.FundamentalsPanel, { result }),
      render(tabs.CurrentRealityPanel, { result }),
      render(V2ResearchRail, { result }),
      render(V2SourcesPanel, { result }),
    ]
    const html = parts.join('\n')
    assert.match(html, new RegExp(result.identity.data.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `${symbol} identity must render`)
    assert.match(html, new RegExp(result.classification.data.canonicalFamilyLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `${symbol} family label must render`)
    assert.match(html, expectedVisibleCopy[symbol], `${symbol} must retain family-correct primary framing`)
    assert.doesNotMatch(html, /undefined|NaN|Infinity|\[object Object\]/, `${symbol} must render safely`)
    assert.doesNotMatch(html, /\b(?:source_required|live_data_required|legacy_diagnostic_only|future_milestone|not_evaluated)\b/i, `${symbol} must not leak raw enums`)
    assert.doesNotMatch(html, /\b2(?:A|B)[A-Z0-9]+\b|claimIds?|packIds?|ruleIds?|artifactVersion|scoringActive/i, `${symbol} must not leak internal identifiers`)
    assert.doesNotMatch(html, /Technical Analysis|Fibonacci|Smart Money|Price Target|Buy now|Sell now/i, `${symbol} must not expose future or gambling surfaces`)
    assert.match(html, /What creates demand for this asset\?/, `${symbol} must render premium tokenomics demand hierarchy`)
    assert.match(html, /What does ownership actually provide\?/, `${symbol} must render holder-rights hierarchy`)
    assert.match(html, /Does activity accrue to holders\?/, `${symbol} must preserve protocol-token separation`)
    assert.match(html, /Open detailed schedules in Market &amp; Supply/, `${symbol} must preserve Market & Supply measurement ownership`)
    assert.equal(result.currentReality.data.schemaVersion, 'current-reality-engine-v1.0.0')
    assert.match(html, /What has materially changed\?/, `${symbol} must render the Current Reality executive question`)
    assert.match(html, /Material event timeline/, `${symbol} must render the canonical event timeline`)
    assert.match(html, /Thesis impact/, `${symbol} must render bounded thesis-impact context`)
    assert.match(html, /Coverage and methodology limits/, `${symbol} must preserve progressive source-boundary disclosure`)
    assert.equal(result.currentReality.data.audit.scoreMutationAttempted, false)
    assert.equal(result.currentReality.data.audit.confidenceMutationAttempted, false)
    assert.equal(result.currentReality.data.audit.verdictMutationAttempted, false)
    assert.equal(result.fundamentals.data.schemaVersion, 'thesis-fundamentals-engine-v1')
    assert.equal(result.thesis.data.sourceSchemaVersion, 'thesis-fundamentals-engine-v1')
    assert.equal(result.fundamentals.data.assetFamily, result.classification.data.canonicalFamilyId)
    assert.equal(result.fundamentals.data.representationType, result.representation.data.representationType)
    FUNDAMENTALS_DIMENSIONS.forEach((dimension) => {
      assert.equal(result.fundamentals.data[dimension].dimension, dimension, `${symbol} ${dimension} identity`)
      assert.ok(result.fundamentals.data[dimension].conciseAnswer, `${symbol} ${dimension} concise answer`)
    })
    assert.match(html, /Product reality first\. Evidence boundaries always\./, `${symbol} must render the fundamentals executive hierarchy`)
    assert.match(html, /What this asset represents/, `${symbol} must render product reality`)
    assert.match(html, /Is the product used, and are the economics durable\?/, `${symbol} must render adoption and economics`)
    assert.match(html, /Does protocol success transfer to tokenholders\?/, `${symbol} must render protocol-token comparison`)
    assert.match(html, /Canonical questions behind the thesis/, `${symbol} must render question-level research`)
    assert.match(html, /Thesis, anti-thesis, and falsification/, `${symbol} must render falsification discipline`)
    assert.match(html, /Confidence/, `${symbol} must render confidence`)
    assert.match(html, /Evidence coverage/, `${symbol} must render evidence coverage`)
    assert.doesNotMatch(html, /Fundamentals Score|\bBUY\b|\bSELL\b|ACCUMULATE|AVOID/i, `${symbol} must not invent a fundamentals score or recommendation`)
    assert.equal(result.tokenomics.data.schemaVersion, 'tokenomics-quality-engine-v1')
    assert.equal(result.tokenomics.data.supplyTruth.data.noSilentAveraging, true)
    assert.equal(result.tokenomics.data.supplyHistory.data.syntheticHistoryCreated, false)
    assert.equal(result.tokenomics.data.unlocks.data.unlockIsNotSale, true)
    assert.equal(result.tokenomics.data.vesting.data.claimsSeparatedFromUnlocks, true)
    assert.equal(result.tokenomics.data.holderConcentration.data.beneficialOwnerAdjusted, false)
    assert.equal(result.tokenomics.data.tokenSuccess.data.protocolSuccessDoesNotProveTokenSuccess, true)
    assert.doesNotMatch(html, />No unlock risk<|No unlock risk detected/i, `${symbol} cannot convert missing unlock coverage into a clean bill of health`)
    if (symbol === 'RSS3') {
      assert.match(html, /Score withheld/)
      assert.equal(result.fundamentals.data.status, 'manual_review_required')
      assert.doesNotMatch(JSON.stringify(result.fundamentals.data.strengths), /durable moat|recurring revenue|tokenholder accrual/i)
      assert.doesNotMatch(html, />42<|42\/100/, 'Audit score must not render as customer score')
    }
    if (symbol === 'RENDER') {
      assert.equal(result.classification.data.canonicalFamilyId, 'depin_resource_network')
      assert.equal(result.representation.data.representationType, 'multichain_representation')
    }
    renderedAssetResults.push({ symbol, canonicalAssetId: result.identity.data.canonicalAssetId, familyLabel: result.classification.data.canonicalFamilyLabel, rendered: true })
  }

  const partialFundamentals = buildV2Fixture('ETH')
  partialFundamentals.fundamentals.data.adoptionDetails.metrics = []
  partialFundamentals.fundamentals.data.protocolEconomicsDetails.fees = []
  partialFundamentals.fundamentals.data.protocolEconomicsDetails.revenue = []
  partialFundamentals.fundamentals.data.directAnswers = []
  partialFundamentals.fundamentals.data.canonicalQuestions = []
  const partialFundamentalsHtml = render(tabs.FundamentalsPanel, { result: partialFundamentals })
  assert.match(partialFundamentalsHtml, /0 scoped observations/)
  assert.match(partialFundamentalsHtml, /Canonical question answers are not available/)
  assert.doesNotMatch(partialFundamentalsHtml, /undefined|NaN|Infinity|\[object Object\]/)

  const renderThenLink = [buildV2Fixture('RENDER'), buildV2Fixture('LINK')]
  assert.equal(renderThenLink[0].classification.data.canonicalFamilyId, 'depin_resource_network')
  assert.notEqual(renderThenLink[1].classification.data.canonicalFamilyId, 'depin_resource_network')
  assert.match(render(V2AssetDecisionCommandCenter, { result: renderThenLink[0], activeSection: 'overview', onSelectSection: () => {} }), /DePIN resource network/)
  assert.match(render(V2AssetDecisionCommandCenter, { result: renderThenLink[1], activeSection: 'overview', onSelectSection: () => {} }), /Oracle and interoperability network/)

  const disagreementHtml = render(V2MarketLiquiditySupplyExperience, { result: buildV2Fixture('BTC') })
  assert.match(disagreementHtml, /Material provider disagreement/)
  assert.match(disagreementHtml, /Provider agreement and measurement quality/)
  assert.deepEqual(buildV2Fixture('BTC').marketLiquiditySupply.providerAgreement.providersCompared, ['CoinGecko', 'CoinMarketCap'])

  const ethTokenomics = buildV2Fixture('ETH').tokenomics.data
  const usdcTokenomics = buildV2Fixture('USDC').tokenomics.data
  assert.equal(ethTokenomics.maxSupplySemantics.semanticClassification, 'adaptive_issuance')
  assert.notEqual(ethTokenomics.maxSupplySemantics.semanticClassification, 'uncapped')
  assert.equal(usdcTokenomics.maxSupplySemantics.semanticClassification, 'elastic_issuer_supply')
  assert.equal(buildV2Fixture('WBTC').tokenomics.data.unlocks.status, 'not_applicable')
  assert.equal(buildV2Fixture('stETH').tokenomics.data.unlocks.status, 'not_applicable')
  assert.equal(buildV2Fixture('UNI').tokenomics.data.unlocks.status, 'available')
  assert.equal(buildV2Fixture('RSS3').tokenomics.data.status, 'degraded')
  assert.equal(buildV2Fixture('UNI').tokenomics.data.allocations.data.allocationTotalReconciled, null)
  assert.equal(buildV2Fixture('LINK').tokenomics.data.valueCapture.data.mechanismConfirmed, false)

  const btcReality = buildV2Fixture('BTC').currentReality.data
  const ethReality = buildV2Fixture('ETH').currentReality.data
  const xrpReality = buildV2Fixture('XRP').currentReality.data
  const usdcReality = buildV2Fixture('USDC').currentReality.data
  const wbtcReality = buildV2Fixture('WBTC').currentReality.data
  const stethReality = buildV2Fixture('stETH').currentReality.data
  const linkReality = buildV2Fixture('LINK').currentReality.data
  assert.equal(btcReality.activeMaterialEvents.length, 1)
  assert.equal(btcReality.activeMaterialEvents[0].primaryImpact, 'strengthens_thesis')
  assert.equal(ethReality.events[0].lifecycleStatus, 'announced')
  assert.equal(ethReality.events[0].primaryImpact, 'informational')
  assert.match(ethReality.events[0].whatItDoesNotProve.join(' '), /does not establish implementation/i)
  assert.equal(xrpReality.conflictingEvents.length, 1)
  assert.equal(xrpReality.conflictingEvents[0].primaryImpact, 'requires_verification')
  assert.equal(usdcReality.events.length, 0)
  assert.match(usdcReality.limitations.join(' '), /source health, not negative asset evidence/i)
  assert.equal(wbtcReality.verificationRequiredEvents.length, 1)
  assert.equal(wbtcReality.activeMaterialEvents.length, 0)
  assert.equal(stethReality.staleEvents.length, 1)
  assert.equal(stethReality.activeMaterialEvents.length, 0)
  assert.equal(linkReality.events.length, 0)
  assert.match(render(tabs.CurrentRealityPanel, { result: buildV2Fixture('WBTC') }), /Relevant leads, not thesis evidence/)
  assert.match(render(tabs.CurrentRealityPanel, { result: buildV2Fixture('XRP') }), /Resolve before changing the thesis/)
  assert.match(render(tabs.CurrentRealityPanel, { result: buildV2Fixture('LINK') }), /No verified material events in the current window/)
  assert.doesNotMatch(render(tabs.CurrentRealityPanel, { result: buildV2Fixture('stETH') }), /Current 30-day source window/)

  const currentRealitySwitch = [buildV2Fixture('RENDER'), buildV2Fixture('RSS3'), buildV2Fixture('RENDER')]
  assert.equal(currentRealitySwitch[0].currentReality.data.canonicalAssetId, 'render-token')
  assert.equal(currentRealitySwitch[1].currentReality.data.canonicalAssetId, 'rss3')
  assert.equal(currentRealitySwitch[2].currentReality.data.canonicalAssetId, 'render-token')
  assert.notEqual(currentRealitySwitch[0].currentReality.data, currentRealitySwitch[2].currentReality.data)
  assert.deepEqual(currentRealitySwitch[0].currentReality.data, currentRealitySwitch[2].currentReality.data)

  const longLabelFixture = buildV2Fixture('RIO')
  longLabelFixture.tokenomicsQualityPresentation.demandMechanisms[0].label = 'Extremely long provider-defined utility mechanism label that must wrap without horizontal overflow'
  const longLabelHtml = render(tabs.TokenomicsPanel, { result: longLabelFixture })
  assert.match(longLabelHtml, /Extremely long provider-defined utility mechanism label/i)
  assert.doesNotMatch(longLabelHtml, /undefined|NaN|Infinity|\[object Object\]/)

  const entryHtml = render(PremiumAssetPageV2, {})
  assert.match(entryHtml, /Institutional crypto research/)
  assert.match(entryHtml, /role="search"/)
  const tabsHtml = render(tabs.default, { result: buildV2Fixture('ETH') })
  assert.match(tabsHtml, /role="tablist"/)
  assert.match(tabsHtml, /aria-selected="true"/)
  assert.match(tabsHtml, /aria-controls=/)
  assert.match(tabsHtml, /View details/)

  const v2SourceFiles = readdirSync(path.join(root, 'src', 'v2'), { recursive: true })
    .filter((entry) => /\.(?:js|jsx)$/.test(entry))
    .map((entry) => path.join(root, 'src', 'v2', entry))
  const v2SourceCorpus = v2SourceFiles.map((file) => readFileSync(file, 'utf8')).join('\n')
  const normalizerDefinitionCount = (v2SourceCorpus.match(/function normalizeAssetResearchResultV2\s*\(/g) || []).length
  assert.equal(normalizerDefinitionCount, 1, 'Exactly one V2 normalizer must exist')
  assert.equal((v2SourceCorpus.match(/function normalizeAssetDecisionCommandCenterV2\s*\(/g) || []).length, 1, 'Exactly one Decision Command Center normalizer must exist')
  assert.equal(commandCenterNormalizer.normalizeAssetDecisionCommandCenterV2(buildV2Fixture('ETH')).identity.canonicalAssetId, 'ethereum')
  assert.doesNotMatch(source('src/v2/PremiumAssetPageV2.jsx'), /V2AssetHero|V2AssetContextBar/, 'Retired V2 headers must not remain in the primary render path')
  assert.equal(readdirSync(path.join(root, 'src', 'v2', 'components')).includes('V2AssetHero.jsx'), false)
  assert.equal(readdirSync(path.join(root, 'src', 'v2', 'components')).includes('V2AssetContextBar.jsx'), false)
  assert.doesNotMatch(v2SourceCorpus, /\b(?:RENDER|RNDR)\b/, 'V2 production code must not contain asset-specific RENDER family overrides')
  assert.doesNotMatch(v2SourceCorpus, /components\/research|researchUtils|buildDecisionTerminalModel|primaryAnalysisRoute\?\.|finalAnalystAnswerComposerContract\?\./, 'V2 must not import or fall back to legacy analytical contracts')
  assert.doesNotMatch(v2SourceCorpus, /localStorage\.(?:getItem|setItem)|sessionStorage\.(?:getItem|setItem)/, 'V2 must not persist analysis snapshots')
  assert.doesNotMatch(v2SourceCorpus, /partialRefresh|snapshotId|hydrateSnapshot/i, 'V2 must not add snapshot or partial-refresh behavior')
  assert.doesNotMatch(v2SourceCorpus, /if\s*\(\s*(?:symbol|assetSymbol)\s*===?\s*['"][A-Z0-9]+['"]/, 'V2 runtime must not contain token-specific branches')
  assert.doesNotMatch(source('src/v2/components/V2ResearchTabs.jsx'), /(?:marketCap|fdv|supply|unlock|issuance|burn)\s*[+*/-]\s*(?:marketCap|fdv|supply|unlock|issuance|burn)/i, 'Tokenomics UI must not own analytical formulas')
  const fundamentalsSource = source('src/v2/components/V2ResearchTabs.jsx')
  assert.match(fundamentalsSource, /fundamentals\.productReality/)
  assert.match(fundamentalsSource, /fundamentals\.protocolToTokenTransfer/)
  assert.match(fundamentalsSource, /fundamentals\.falsification/)
  assert.doesNotMatch(fundamentalsSource, /finalAnalystAnswerComposerContract|institutionalAnswerSurfaceContract|typedObservation|reviewedEvidencePacket|research-seeds/i, 'Fundamentals UI must consume only canonical V2 projections')
  assert.doesNotMatch(fundamentalsSource, /protocolSuccessStatus\s*=|tokenSuccessStatus\s*=|transferStatus\s*=/, 'Frontend must not infer protocol-to-token transfer')
  const currentRealitySource = fundamentalsSource.slice(
    fundamentalsSource.indexOf('const CURRENT_REALITY_IMPACT_FILTERS'),
    fundamentalsSource.indexOf('export default function V2ResearchTabs'),
  )
  assert.doesNotMatch(currentRealitySource, /eventTone|signalStrength|\.classification\b/, 'Current Reality frontend must not retain the old event classifier')
  assert.doesNotMatch(currentRealitySource, /headline.*(?:bullish|bearish)|(?:bullish|bearish).*headline/i, 'Headline sentiment cannot drive the Current Reality UI')
  assert.match(currentRealitySource, /event\.primaryImpact/, 'Frontend must consume canonical primaryImpact')
  assert.match(currentRealitySource, /event\.verificationState/, 'Frontend must consume canonical verification state')
  assert.match(currentRealitySource, /event\.materiality\?\.state/, 'Frontend must consume canonical materiality')
  assert.doesNotMatch(currentRealitySource, /(?:marketCap|price|volume)\s*[><=]/, 'Frontend must not infer event materiality from market metrics')
  const reportMirrorSource = source('src/components/research/researchUtils.js')
  assert.match(reportMirrorSource, /const thesisFundamentals = safeObject\(assetResearchResultV2\?\.fundamentals\?\.data\)/)
  assert.match(reportMirrorSource, /Thesis & Fundamentals synthesis/)
  assert.match(reportMirrorSource, /AssetResearchResultV2 Thesis & Fundamentals attached/)
  assert.equal((reportMirrorSource.match(/const currentReality = safeObject\(assetResearchResultV2\?\.currentReality\?\.data\)/g) || []).length, 2)
  assert.match(reportMirrorSource, /Most material current development/)
  assert.match(reportMirrorSource, /AssetResearchResultV2 Current Reality attached/)
  assert.match(reportMirrorSource, /Current Reality canonical event diagnostics \(Audit \/ Raw only\)/)
  assert.match(reportMirrorSource, /event\.eventFingerprint/)
  assert.doesNotMatch(v2SourceCorpus, /displayedScore\s*\?\?\s*auditScore|auditScore\s*\?\?\s*displayedScore/, 'Audit score cannot fill customer score')
  assert.match(source('src/v2/assetResearchV2Api.js'), /mode:\s*'full'/)
  assert.doesNotMatch(source('src/v2/assetResearchV2Api.js'), /mode:\s*'quick'|partial/i)
  assert.match(source('src/main.jsx'), /lazy\(\(\) => import\('\.\/v2\/PremiumV2Router\.jsx'\)\)/)
  assert.match(source('src/main.jsx'), /isV2Path\(pathname\)/)
  assert.match(source('src/v2/PremiumV2Router.jsx'), /lazy\(\(\) => import\('\.\/PremiumAssetPageV2\.jsx'\)\)/)

  const css = source('src/v2/PremiumAssetPageV2.css')
  const shellCss = source('src/v2/styles/v2-shell.css')
  assert.match(css, /@media \(max-width: 1180px\)/)
  assert.match(css, /@media \(max-width: 900px\)/)
  assert.match(css, /@media \(max-width: 390px\)/)
  assert.match(css, /\.v2-command-center/)
  assert.match(css, /\.v2-command-center__body/)
  assert.match(css, /\.v2-command-nav/)
  assert.doesNotMatch(css, /\.v2-asset-context|\.v2-hero(?:\s|\{|_)/, 'Retired V2 header styles must be removed')
  assert.match(shellCss, /prefers-reduced-motion/)
  assert.match(shellCss, /overflow-x: clip/)
  assert.match(shellCss, /:focus-visible/)
  assert.match(css, /\.v2-fundamentals-command/)
  assert.match(css, /\.v2-product-reality-hero/)
  assert.match(css, /\.v2-protocol-transfer-grid/)
  assert.match(css, /\.v2-falsification-cockpit/)
  assert.match(css, /\.v2-current-reality-command/)
  assert.match(css, /\.v2-current-reality-timeline/)
  assert.match(css, /\.v2-current-event__detail-grid/)
  assert.match(css, /\.v2-current-reality-filters/)
  assert.match(css, /min-height:\s*44px/)
  assert.doesNotMatch(css, /height:\s*(?:[2-9]\d{2}|\d{4,})px[^;]*;\s*\/\*\s*core/i)

  assert.equal(REPRESENTATIVE_V2_ASSETS.length, 18)
  assert.deepEqual(renderedAssetResults.map((entry) => entry.symbol), REPRESENTATIVE_V2_ASSETS)
  console.log(`PASS Premium Asset Page V2 normalization, routing, render, switching, leakage, responsive, and accessibility regressions (${renderedAssetResults.length} assets)`)
} finally {
  await server.close()
}
