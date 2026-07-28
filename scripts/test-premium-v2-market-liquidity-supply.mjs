import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import {
  buildV2Fixture,
} from './fixtures/premium-asset-v2-fixtures.mjs'

const root = process.cwd()
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

function source(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8')
}

function render(Component, props) {
  return renderToString(React.createElement(Component, props))
}

const controlAssets = ['ETH', 'BTC', 'USDC', 'WBTC', 'stETH', 'ONDO', 'PAXG', 'RENDER', 'RSS3', 'UNI']

try {
  const [
    marketNormalizer,
    resultNormalizer,
    { default: V2MarketLiquiditySupplyExperience },
    researchUtils,
  ] = await Promise.all([
    server.ssrLoadModule('/src/v2/marketLiquiditySupplyV2.js'),
    server.ssrLoadModule('/src/v2/assetResearchResultV2.js'),
    server.ssrLoadModule('/src/v2/components/V2MarketLiquiditySupplyExperience.jsx'),
    server.ssrLoadModule('/src/components/research/researchUtils.js'),
  ])

  const rendered = []
  for (const symbol of controlAssets) {
    const result = buildV2Fixture(symbol)
    const model = marketNormalizer.normalizeMarketLiquiditySupplyV2(result)
    const html = render(V2MarketLiquiditySupplyExperience, { result })
    assert.equal(model.canonicalAssetId, result.identity.data.canonicalAssetId, `${symbol} identity parity`)
    assert.equal(model.representation.representationType, result.representation.data.representationType, `${symbol} representation parity`)
    assert.equal(model.representation.assetFamily, result.classification.data.canonicalFamilyId, `${symbol} family parity`)
    assert.match(html, /Market structure with the measurement boundary intact/)
    assert.match(html, /Global trading volume/)
    assert.match(html, /Selected pool liquidity/)
    assert.match(html, /Measured market depth/)
    assert.match(html, /Supply structure/)
    assert.match(html, /Dilution, issuance, burn, and unlocks/)
    assert.match(html, /Direct market history/)
    assert.match(html, /What is missing, why it matters, and what to inspect next/)
    assert.doesNotMatch(html, /undefined|NaN|Infinity|\[object Object\]/)
    assert.doesNotMatch(html, /\b(?:source_required|diagnostic_only|legacy_diagnostic_only|scoringActive|claimId|ruleId)\b/i)
    assert.equal(model.liquidity.globalLiquidityAvailability, 'unavailable')
    assert.equal(model.liquidity.pairIsRepresentativeOfGlobalLiquidity, result.identity.data.analyzedContract ? false : null)
    assert.equal(model.historicalContext.technicalIndicatorsIncluded, false)
    assert.equal(model.historicalContext.syntheticHistoryCreated, false)
    assert.equal(model.historicalContext.gapsPreserved, true)
    assert.equal(model.guardrails.frontendCalculationsAllowed, false)
    assert.equal(model.guardrails.missingDataRenderedAsZero, false)
    assert.equal(model.guardrails.missingUnlockMeansNoRisk, false)
    rendered.push({ symbol, canonicalAssetId: model.canonicalAssetId, html })
  }

  const ethHtml = rendered.find((entry) => entry.symbol === 'ETH').html
  const btcHtml = rendered.find((entry) => entry.symbol === 'BTC').html
  const usdcHtml = rendered.find((entry) => entry.symbol === 'USDC').html
  const wbtcHtml = rendered.find((entry) => entry.symbol === 'WBTC').html
  const stethHtml = rendered.find((entry) => entry.symbol === 'stETH').html
  const ondoHtml = rendered.find((entry) => entry.symbol === 'ONDO').html
  const rss3Html = rendered.find((entry) => entry.symbol === 'RSS3').html
  assert.match(ethHtml, /A fixed maximum is not the primary supply policy/)
  assert.match(btcHtml, /No selected pair is attached; global liquidity is not inferred/)
  assert.match(usdcHtml, /Issuer-responsive supply/)
  assert.match(usdcHtml, /Remaining dilution<\/span><strong>Not available/)
  assert.match(wbtcHtml, /Displayed supply applies only to the wrapped representation/)
  assert.match(wbtcHtml, /one venue-level observation and may not represent total market liquidity/)
  assert.match(stethHtml, /Displayed supply applies only to the liquid staking representation/)
  assert.match(ondoHtml, /Missing unlock coverage is not interpreted as no unlock risk/)
  assert.match(rss3Html, /Current market size, provider-reported activity/)

  const missingContract = buildV2Fixture('BTC')
  delete missingContract.marketLiquiditySupply
  assert.throws(
    () => resultNormalizer.normalizeAssetResearchResultV2({ assetResearchResultV2: missingContract }),
    (error) => error.code === 'missing_market_supply_result',
  )
  const mismatchedIdentity = structuredClone(buildV2Fixture('BTC'))
  mismatchedIdentity.marketLiquiditySupply.canonicalAssetId = 'ethereum'
  assert.throws(
    () => marketNormalizer.normalizeMarketLiquiditySupplyV2(mismatchedIdentity),
    (error) => error.code === 'market_supply_identity_mismatch',
  )
  const invalidNumber = structuredClone(buildV2Fixture('ETH'))
  invalidNumber.marketLiquiditySupply.marketOverview.currentPrice.value = Number.NaN
  assert.throws(
    () => marketNormalizer.normalizeMarketLiquiditySupplyV2(invalidNumber),
    (error) => error.code === 'malformed_market_supply_result',
  )
  const unsafeGuardrail = structuredClone(buildV2Fixture('USDC'))
  unsafeGuardrail.marketLiquiditySupply.guardrails.selectedPairIsGlobalLiquidity = true
  assert.throws(
    () => marketNormalizer.normalizeMarketLiquiditySupplyV2(unsafeGuardrail),
    (error) => error.code === 'market_supply_guardrail_failure',
  )

  const original = buildV2Fixture('RENDER')
  const repeated = buildV2Fixture('RENDER')
  const intervening = buildV2Fixture('RSS3')
  assert.notEqual(original.marketLiquiditySupply, repeated.marketLiquiditySupply)
  assert.deepEqual(original.marketLiquiditySupply, repeated.marketLiquiditySupply)
  assert.notEqual(original.marketLiquiditySupply.canonicalAssetId, intervening.marketLiquiditySupply.canonicalAssetId)
  assert.notEqual(original.marketLiquiditySupply.representation.assetFamily, intervening.marketLiquiditySupply.representation.assetFamily)

  const bundle = researchUtils.buildReviewBundleText({
    asset: { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
    data: { assetResearchResultV2: buildV2Fixture('WBTC') },
    premiumV2MarketLiquiditySupplyQa: marketNormalizer.PREMIUM_V2_MARKET_LIQUIDITY_SUPPLY_QA,
  })
  assert.equal((bundle.match(/Premium V2 Market, Liquidity & Supply QA/g) || []).length, 1)
  assert.match(bundle, /Experience attached: yes/)
  assert.match(bundle, /Old V2 market surface primary: no/)
  assert.match(bundle, /Pair-as-global leakage count: 0/)
  assert.match(bundle, /Frontend analytical calculation count: 0/)
  assert.match(bundle, /Browser visual QA status: PENDING/)
  assert.match(bundle, /scoring changed=no/i)
  assert.match(bundle, /provider behavior changed=no/i)

  const componentSource = source('src/v2/components/V2MarketLiquiditySupplyExperience.jsx')
  const normalizerSource = source('src/v2/marketLiquiditySupplyV2.js')
  const pageSource = source('src/v2/PremiumAssetPageV2.jsx')
  const css = source('src/v2/PremiumAssetPageV2.css')
  assert.match(pageSource, /V2MarketLiquiditySupplyExperience/)
  assert.doesNotMatch(pageSource, /V2MarketSupplyDashboard/)
  assert.doesNotMatch(componentSource, /fdv\s*\/\s*market|market\s*cap\s*[*/+-]\s*supply|volume\s*\/\s*market|remaining\s*dilution\s*=/i)
  assert.doesNotMatch(componentSource, /CoinGecko.*CoinMarketCap|CoinMarketCap.*CoinGecko/)
  assert.doesNotMatch(normalizerSource, /reduce\s*\([^)]*(?:price|marketCap|supply)|relativeDifference|dispersion\s*=/i)
  assert.equal((`${componentSource}\n${normalizerSource}`.match(/function normalizeMarketLiquiditySupplyV2\s*\(/g) || []).length, 1)
  assert.match(componentSource, /role="img"/)
  assert.match(componentSource, /aria-label="Historical series"/)
  assert.match(componentSource, /aria-label="Historical range"/)
  assert.match(componentSource, /type="range"/)
  assert.match(css, /\.v2-mls-experience/)
  assert.match(css, /@media \(max-width: 1180px\)/)
  assert.match(css, /@media \(max-width: 900px\)/)
  assert.match(css, /@media \(max-width: 640px\)/)
  assert.match(css, /@media \(max-width: 390px\)/)
  assert.match(css, /overflow-wrap:\s*anywhere/)
  assert.match(css, /min-height:\s*42px/)

  console.log(`PASS Premium V2 Market, Liquidity & Supply normalization, scope, family, render, bundle, and responsive regressions (${rendered.length} assets)`)
} finally {
  await server.close()
}
