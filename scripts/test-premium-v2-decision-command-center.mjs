import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import {
  REPRESENTATIVE_V2_ASSETS,
  buildV2Fixture,
} from './fixtures/premium-asset-v2-fixtures.mjs'

const root = process.cwd()
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

function source(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8')
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1
}

const FAMILY_EXPECTATIONS = Object.freeze({
  BTC: [/Proof-of-work monetary security/i, /Fee-market durability and mining concentration/i],
  ETH: [/Gas demand, fee burn, staking/i, /Validator diversity and L2 fee contribution/i],
  XRP: [/Settlement usage and liquid market access/i, /Economic role and regulatory context/i],
  USDC: [/Reserve quality, redemption access/i, /Banking, custody, freeze controls/i],
  WBTC: [/Tokenized BTC exposure/i, /Custodian, reserves, redemption/i],
  stETH: [/Liquid staking exposure/i, /Operator concentration, slashing, withdrawal/i],
  UNI: [/Protocol usage is visible/i, /Fee routing and durable UNI value capture/i],
  LINK: [/Oracle adoption and security services/i, /does not automatically establish LINK token accrual/i],
  ONDO: [/RWA product adoption/i, /tokenholder legal or economic rights remain distinct/i],
  PAXG: [/Physical backing, custody, and redemption/i, /Legal claim, bar custody, redemption/i],
  RENDER: [/Resource-network demand and provider incentives/i, /Migration scope and payer-to-token demand/i],
  SOL: [/Native network usage, fee demand, issuance/i, /validator concentration.*liveness/i],
  AVAX: [/Native network usage, validator security/i, /Demand durability and validator economics/i],
  ADA: [/Native-chain usage, staking security/i, /Current usage, security, and liveness/i],
  RSS3: [/preliminary risk screen/i, /too limited for a complete institutional conclusion/i],
})

try {
  const [
    normalizer,
    { default: V2AssetDecisionCommandCenter },
    researchUtils,
  ] = await Promise.all([
    server.ssrLoadModule('/src/v2/assetDecisionCommandCenterV2.js'),
    server.ssrLoadModule('/src/v2/components/V2AssetDecisionCommandCenter.jsx'),
    server.ssrLoadModule('/src/components/research/researchUtils.js'),
  ])

  assert.equal(normalizer.ASSET_DECISION_COMMAND_CENTER_V2_VERSION, 'premium-v2-asset-decision-command-center-v1.0.0')
  assert.equal(normalizer.V2_ASSET_SECTIONS.length, 6)
  assert.deepEqual(normalizer.V2_ASSET_SECTIONS.map((section) => section.label), [
    'Overview', 'Market & Supply', 'Tokenomics', 'Fundamentals', 'Current Reality', 'Technical & Scenarios',
  ])

  const results = []
  for (const symbol of REPRESENTATIVE_V2_ASSETS) {
    const result = buildV2Fixture(symbol)
    const model = normalizer.normalizeAssetDecisionCommandCenterV2(result)
    const html = renderToString(React.createElement(V2AssetDecisionCommandCenter, {
      result,
      activeSection: 'overview',
      onSelectSection: () => {},
    }))

    assert.equal(Object.isFrozen(model), true, `${symbol} model frozen`)
    assert.equal(Object.isFrozen(model.identity), true, `${symbol} identity frozen`)
    assert.equal(model.identity.canonicalAssetId, result.identity.data.canonicalAssetId, `${symbol} canonical identity`)
    assert.equal(model.identity.canonicalFamily, result.classification.data.canonicalFamilyId, `${symbol} canonical family`)
    assert.equal(model.identity.representationType, result.representation.data.representationType, `${symbol} representation`)
    assert.equal(model.decision.verdictLabel, result.decision.data.verdictLabel, `${symbol} verdict parity`)
    assert.equal(model.decision.scoreValue, result.decision.data.displayedScore, `${symbol} score parity`)
    assert.equal(model.confidence.value, result.decision.data.confidence, `${symbol} confidence parity`)
    assert.equal(model.currentMarket.providerAgreement.state, result.market.data.providerAgreementState, `${symbol} provider agreement parity`)
    assert.equal(model.currentMarket.providerAgreement.providerCount, result.market.data.providerCount, `${symbol} provider count parity`)
    assert.equal(model.synthesis.institutionalThesis, result.decision.data.institutionalThesis, `${symbol} thesis parity`)
    assert.equal(model.synthesis.primarySupportedRisk, result.decision.data.primarySupportedRisk, `${symbol} risk parity`)
    assert.equal(model.synthesis.criticalUnknown, result.decision.data.criticalUnknown, `${symbol} unknown parity`)
    assert.equal(model.synthesis.whatWouldChangeTheView, result.decision.data.whatWouldChangeTheView, `${symbol} change parity`)
    assert.match(html, /Institutional asset decision/)
    assert.match(html, /Current institutional decision/)
    assert.match(html, /Institutional thesis/)
    assert.match(html, /Strongest supported conclusion/)
    assert.match(html, /Primary supported risk/)
    assert.match(html, /Critical unknown/)
    assert.match(html, /What would change the view/)
    assert.match(html, /Confidence reflects support for the analysis, not probability of price performance/)
    assert.match(html, /Coverage reflects available evidence, not asset quality/)
    assert.match(html, /aria-label="Asset research sections"/)
    assert.equal(count(html, '<h1'), 1, `${symbol} one asset identity heading`)
    assert.equal(count(html, result.decision.data.verdictLabel), 1, `${symbol} one primary verdict`)
    assert.doesNotMatch(html, /undefined|NaN|Infinity|\[object Object\]/)
    assert.doesNotMatch(html, /\b(?:source_required|live_data_required|manual_low_coverage|not_scoring_active|future_milestone|live_current_qa|live_full_recompute)\b/i)
    assert.doesNotMatch(html, /\b(?:BUY|SELL|ACCUMULATE|STRONG BUY|TAKE PROFIT|STOP LOSS)\b/i)
    assert.doesNotMatch(html, /\b2(?:A|B)[A-Z0-9]+\b|claimIds?|packIds?|ruleIds?|artifactVersion|scoringActive/i)

    for (const expectation of FAMILY_EXPECTATIONS[symbol] || []) assert.match(html, expectation, `${symbol} family semantics`)

    if (symbol === 'BTC') assert.doesNotMatch(html, /\bvalidators?|slashing|stablecoin reserves|tokenholder revenue rights\b/i)
    if (symbol === 'XRP') assert.doesNotMatch(html, /\bhashrate|mining pools?|staking rewards?\b/i)
    if (symbol === 'USDC') assert.doesNotMatch(html, /\bbull case|upside target|price appreciation\b/i)
    if (symbol === 'WBTC') assert.doesNotMatch(html, /Proof-of-work monetary security|native Bitcoin security thesis/i)
    if (symbol === 'stETH') assert.doesNotMatch(html, /Ethereum settlement and gas asset|native ETH identity/i)
    if (symbol === 'RSS3') {
      assert.match(html, /Withheld/)
      assert.doesNotMatch(html, />42<|42\/100/)
    }
    results.push({ symbol, model, html })
  }

  const withheld = buildV2Fixture('RSS3')
  const withheldModel = normalizer.normalizeAssetDecisionCommandCenterV2(withheld)
  assert.equal(withheldModel.decision.scoreValue, null)
  assert.match(withheldModel.decision.scoreWithheldReason, /critical/i)

  const partial = buildV2Fixture('ETH')
  partial.market.data.currentPrice = null
  partial.market.data.marketCap = null
  partial.decision.data.institutionalThesis = null
  partial.decision.data.primarySupportedRisk = null
  partial.decision.data.criticalUnknown = null
  partial.decision.data.whatWouldChangeTheView = null
  const partialModel = normalizer.normalizeAssetDecisionCommandCenterV2(partial)
  const partialHtml = renderToString(React.createElement(V2AssetDecisionCommandCenter, {
    result: partial,
    activeSection: 'overview',
    onSelectSection: () => {},
  }))
  assert.equal(partialModel.currentMarket.currentPrice.value, null)
  assert.match(partialHtml, /Not available/)
  assert.match(partialHtml, /bounded institutional thesis is not available/i)
  assert.doesNotMatch(partialHtml, /undefined|NaN|Infinity|\[object Object\]/)

  assert.throws(() => normalizer.normalizeAssetDecisionCommandCenterV2(null), /canonical AssetResearchResultV2/)
  assert.throws(() => normalizer.normalizeAssetDecisionCommandCenterV2({ identity: {} }), /malformed/)

  const pairs = [
    ['BTC', 'ETH'], ['USDC', 'XRP'], ['BTC', 'WBTC'], ['ETH', 'stETH'],
    ['ONDO', 'PAXG'], ['LINK', 'RENDER'], ['SOL', 'AVAX'], ['ETH', 'RSS3'],
  ]
  for (const [left, right] of pairs) {
    const leftModel = normalizer.normalizeAssetDecisionCommandCenterV2(buildV2Fixture(left))
    const rightModel = normalizer.normalizeAssetDecisionCommandCenterV2(buildV2Fixture(right))
    assert.notStrictEqual(leftModel, rightModel)
    assert.notStrictEqual(leftModel.identity, rightModel.identity)
    assert.notStrictEqual(leftModel.currentMarket, rightModel.currentMarket)
    assert.notStrictEqual(leftModel.synthesis, rightModel.synthesis)
    assert.notEqual(leftModel.identity.canonicalAssetId, rightModel.identity.canonicalAssetId)
  }

  const deterministicLeft = normalizer.normalizeAssetDecisionCommandCenterV2(buildV2Fixture('ETH'))
  const deterministicRight = normalizer.normalizeAssetDecisionCommandCenterV2(buildV2Fixture('ETH'))
  assert.deepEqual(deterministicLeft, deterministicRight)
  assert.notStrictEqual(deterministicLeft, deterministicRight)

  const bundleFixture = buildV2Fixture('ETH')
  const bundle = researchUtils.buildReviewBundleText({
    asset: { symbol: 'ETH', name: 'Ethereum' },
    data: { assetResearchResultV2: bundleFixture },
    analysis: { assetResearchResultV2: bundleFixture },
    premiumV2DecisionCommandCenterQa: normalizer.PREMIUM_V2_DECISION_COMMAND_CENTER_QA,
  })
  assert.match(bundle, /Premium V2 Asset Decision Command Center QA/)
  assert.match(bundle, /Command center attached: yes/)
  assert.match(bundle, new RegExp(`thesis=${bundleFixture.decision.data.institutionalThesis.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
  assert.match(bundle, new RegExp(`risk=${bundleFixture.decision.data.primarySupportedRisk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
  assert.match(bundle, /Old V2 header primary: no/)
  assert.match(bundle, /Frontend analytical calculation count: 0/)

  const protectedReport = researchUtils.buildProtectedInvestorReportText({
    asset: { symbol: 'ETH', name: 'Ethereum' },
    data: { assetResearchResultV2: bundleFixture },
    analysis: { assetResearchResultV2: bundleFixture },
  })
  assert.doesNotMatch(protectedReport, /Premium V2 Asset Decision Command Center QA/)
  assert.doesNotMatch(protectedReport, /assetDecisionCommandCenterV2|V2AssetDecisionCommandCenter/)

  const componentSource = source('src/v2/components/V2AssetDecisionCommandCenter.jsx')
  const normalizerSource = source('src/v2/assetDecisionCommandCenterV2.js')
  const pageSource = source('src/v2/PremiumAssetPageV2.jsx')
  const cssSource = source('src/v2/PremiumAssetPageV2.css')
  const componentFiles = readdirSync(path.join(root, 'src', 'v2', 'components'))
  assert.match(pageSource, /V2AssetDecisionCommandCenter/)
  assert.doesNotMatch(pageSource, /V2AssetHero|V2AssetContextBar/)
  assert.equal(componentFiles.includes('V2AssetHero.jsx'), false)
  assert.equal(componentFiles.includes('V2AssetContextBar.jsx'), false)
  assert.equal((`${componentSource}\n${normalizerSource}`.match(/function normalizeAssetDecisionCommandCenterV2\s*\(/g) || []).length, 1)
  assert.doesNotMatch(componentSource, /finalAnalystAnswerComposerContract|decisionLayer|coverageScoreEligibilityContract|primaryAnalysisRoute/)
  assert.doesNotMatch(componentSource, /(?:score|confidence|coverage|verdict)\s*[+\-*/]\s*(?:score|confidence|coverage|verdict)/i)
  assert.doesNotMatch(normalizerSource, /if\s*\(\s*(?:symbol|assetSymbol)\s*===?\s*['"][A-Z0-9]+['"]/)
  assert.doesNotMatch(`${componentSource}\n${normalizerSource}`, /\b(?:BTC|ETH|XRP|USDC|WBTC|stETH|ONDO|PAXG|RENDER|RSS3)\b/)
  assert.match(cssSource, /@media \(max-width: 900px\)/)
  assert.match(cssSource, /@media \(max-width: 640px\)/)
  assert.match(cssSource, /@media \(max-width: 390px\)/)
  assert.match(cssSource, /\.v2-command-nav button:focus-visible/)
  assert.match(cssSource, /min-height:\s*44px/)
  assert.doesNotMatch(cssSource, /\.v2-asset-context|\.v2-hero(?:\s|\{|_)/)

  console.log(JSON.stringify({
    status: 'PASS',
    commandCenterOwnerCount: 1,
    frontendNormalizerCount: 1,
    representativeAssets: results.length,
    oldV2HeroPrimary: false,
    oldDecisionHeaderPrimary: false,
    duplicateIdentityFindingCount: 0,
    duplicateVerdictFindingCount: 0,
    duplicateConfidenceFindingCount: 0,
    frontendAnalyticalCalculationCount: 0,
    browserVisualQaStatus: 'PENDING',
  }, null, 2))
} finally {
  await server.close()
}
