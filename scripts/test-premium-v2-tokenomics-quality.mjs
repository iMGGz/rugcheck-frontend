import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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

function render(Component, props) {
  return renderToString(React.createElement(Component, props))
}

try {
  const [
    tokenomicsNormalizer,
    resultNormalizer,
    { default: V2TokenomicsQualityExperience },
    { default: V2ResearchTabs },
    researchUtils,
  ] = await Promise.all([
    server.ssrLoadModule('/src/v2/tokenomicsQualityV2.js'),
    server.ssrLoadModule('/src/v2/assetResearchResultV2.js'),
    server.ssrLoadModule('/src/v2/components/V2TokenomicsQualityExperience.jsx'),
    server.ssrLoadModule('/src/v2/components/V2ResearchTabs.jsx'),
    server.ssrLoadModule('/src/components/research/researchUtils.js'),
  ])

  const rendered = new Map()
  for (const symbol of REPRESENTATIVE_V2_ASSETS) {
    const result = buildV2Fixture(symbol)
    const model = tokenomicsNormalizer.normalizeTokenomicsQualityV2(result)
    const html = render(V2TokenomicsQualityExperience, { result })
    rendered.set(symbol, { result, model, html })

    assert.equal(model.schemaVersion, 'premium-v2-tokenomics-quality-experience-v1', `${symbol} schema`)
    assert.equal(model.canonicalAssetId, result.identity.data.canonicalAssetId, `${symbol} identity`)
    assert.equal(model.representation.representationType, result.representation.data.representationType, `${symbol} representation`)
    assert.equal(model.family.familyId, result.classification.data.canonicalFamilyId, `${symbol} family`)
    if (model.tokenomicsQuality.tokenomicsScoreDisplayState === 'displayed') {
      assert.equal(model.tokenomicsQuality.tokenomicsScoreValue, result.tokenomics.data.tokenomicsIntegrityScore, `${symbol} canonical score parity`)
    } else {
      assert.equal(model.tokenomicsQuality.tokenomicsScoreValue, null, `${symbol} withheld score value`)
      assert.equal(result.tokenomics.data.tokenomicsIntegrityScore, 58, `${symbol} underlying score remains unchanged`)
    }
    assert.equal(Object.isFrozen(model), true, `${symbol} normalized root frozen`)
    assert.equal(Object.isFrozen(model.demandMechanisms), true, `${symbol} normalized mechanisms frozen`)
    assert.equal(model.guardrails.frontendCalculationsAllowed, false)
    assert.equal(model.guardrails.protocolUsageEqualsTokenDemand, false)
    assert.equal(model.guardrails.tokenDemandEqualsHolderValue, false)
    assert.equal(model.guardrails.governanceEqualsCashFlowRights, false)
    assert.equal(model.guardrails.productAumEqualsTokenValue, false)
    assert.equal(model.guardrails.missingEvidenceIsRiskFinding, false)
    assert.equal(model.guardrails.nativeTokenomicsInheritedByWrappedAsset, false)
    assert.equal(model.guardrails.nativeTokenomicsInheritedByLst, false)
    assert.equal(model.guardrails.stablecoinYieldInferred, false)

    assert.match(html, /What creates demand for this asset\?/)
    assert.match(html, /What does ownership actually provide\?/)
    assert.match(html, /Does activity accrue to holders\?/)
    assert.match(html, /Who can change the system\?/)
    assert.match(html, /Who received supply, and what can still change\?/)
    assert.match(html, /What funds the system, and who bears dilution\?/)
    assert.match(html, /Strength, risk, and critical unknown/)
    assert.match(html, /What remains unresolved\?/)
    assert.match(html, /Open detailed schedules in Market &amp; Supply/)
    assert.doesNotMatch(html, /undefined|NaN|Infinity|\[object Object\]/)
    assert.doesNotMatch(
      html,
      /\b(?:source_required|manual_low_coverage|not_scoring_active|future_milestone|access_demand|fee_gas_demand|staking_security_demand|governance_demand|resource_market_demand|speculative_social_demand)\b/i,
      `${symbol} customer enum leakage`,
    )
    assert.doesNotMatch(html, /claimIds?|packIds?|ruleIds?|artifactVersion|live_current_qa/i)
  }

  const btc = rendered.get('BTC').html
  const eth = rendered.get('ETH').html
  const xrp = rendered.get('XRP').html
  const usdc = rendered.get('USDC').html
  const wbtc = rendered.get('WBTC').html
  const steth = rendered.get('stETH').html
  const uni = rendered.get('UNI').html
  const aave = rendered.get('AAVE').html
  const link = rendered.get('LINK').html
  const ondo = rendered.get('ONDO').html
  const paxg = rendered.get('PAXG').html
  const renderToken = rendered.get('RENDER').html
  const pepe = rendered.get('PEPE').html
  const rss3 = rendered.get('RSS3').html

  assert.match(btc, /Monetary and settlement asset/)
  assert.doesNotMatch(btc, /Liquid staking exposure|stablecoin yield/i)
  assert.match(eth, /Settlement, gas, and security asset/)
  assert.match(eth, /Network fees|Security staking/)
  assert.match(xrp, /Payments, settlement, and liquidity asset/)
  assert.doesNotMatch(xrp, /Mining issuance|stablecoin reserve/i)
  assert.match(usdc, /Stable-value settlement and redemption instrument/)
  assert.match(usdc, /Issuer mint and redemption/)
  assert.doesNotMatch(usdc, /speculative scarcity|stablecoin yield is available/i)
  assert.match(wbtc, /Representation, transfer, and redemption asset/)
  assert.match(wbtc, /Representation mint and burn/)
  assert.doesNotMatch(wbtc, /Mining issuance and fees compensate/i)
  assert.match(steth, /Liquid claim on staked assets/)
  assert.match(steth, /Withdrawals, operators, slashing/)
  assert.match(uni, /Protocol governance and conditional economic-link token/)
  assert.match(aave, /Protocol governance and conditional economic-link token/)
  assert.match(`${uni} ${aave}`, /No verified direct tokenholder accrual/)
  assert.match(link, /Data-service payment and network-security token/)
  assert.match(ondo, /Product AUM and yield do not transfer to tokenholders/)
  assert.match(paxg, /Tokenized commodity claim/)
  assert.match(renderToken, /Resource-market payment and provider-incentive token/)
  assert.match(pepe, /Social and speculative market asset/)
  assert.doesNotMatch(pepe, /verified fundamental utility/i)
  assert.match(rss3, /Token-economic role not established/)
  assert.match(rss3, /Score withheld/)

  for (const symbol of ['SOL', 'AVAX', 'ADA']) {
    const html = rendered.get(symbol).html
    assert.match(html, /Gas, settlement, and network-security asset/)
    assert.doesNotMatch(html, /blob-settlement resource/)
  }
  assert.match(rendered.get('RIO').html, /RWA infrastructure, access, or governance token/)

  const missing = buildV2Fixture('BTC')
  delete missing.tokenomicsQualityPresentation
  assert.throws(
    () => tokenomicsNormalizer.normalizeTokenomicsQualityV2(missing),
    (error) => error.code === 'missing_tokenomics_quality_presentation',
  )
  assert.match(render(V2TokenomicsQualityExperience, { result: missing }), /Token-economic analysis is unavailable/)

  const wrongIdentity = structuredClone(buildV2Fixture('ETH'))
  wrongIdentity.tokenomicsQualityPresentation.canonicalAssetId = 'bitcoin'
  assert.throws(
    () => tokenomicsNormalizer.normalizeTokenomicsQualityV2(wrongIdentity),
    (error) => error.code === 'tokenomics_quality_identity_mismatch',
  )

  const invalidScore = structuredClone(buildV2Fixture('ETH'))
  invalidScore.tokenomicsQualityPresentation.tokenomicsQuality.tokenomicsScoreValue = Number.NaN
  assert.throws(
    () => tokenomicsNormalizer.normalizeTokenomicsQualityV2(invalidScore),
    (error) => error.code === 'malformed_tokenomics_quality_presentation',
  )

  const unsafe = structuredClone(buildV2Fixture('USDC'))
  unsafe.tokenomicsQualityPresentation.guardrails.stablecoinYieldInferred = true
  assert.throws(
    () => tokenomicsNormalizer.normalizeTokenomicsQualityV2(unsafe),
    (error) => error.code === 'tokenomics_quality_guardrail_failure',
  )

  const resultWithoutPresentation = buildV2Fixture('BTC')
  delete resultWithoutPresentation.tokenomicsQualityPresentation
  assert.throws(
    () => resultNormalizer.normalizeAssetResearchResultV2({ assetResearchResultV2: resultWithoutPresentation }),
    (error) => error.code === 'missing_tokenomics_quality_presentation',
  )

  const first = buildV2Fixture('WBTC')
  const second = buildV2Fixture('BTC')
  const third = buildV2Fixture('WBTC')
  assert.notEqual(first.tokenomicsQualityPresentation, third.tokenomicsQualityPresentation)
  assert.deepEqual(first.tokenomicsQualityPresentation, third.tokenomicsQualityPresentation)
  assert.notEqual(first.tokenomicsQualityPresentation.canonicalAssetId, second.tokenomicsQualityPresentation.canonicalAssetId)
  assert.notEqual(first.tokenomicsQualityPresentation.family.familyId, second.tokenomicsQualityPresentation.family.familyId)

  const tabsHtml = render(V2ResearchTabs, { result: buildV2Fixture('ETH') })
  assert.equal((tabsHtml.match(/What creates demand for this asset\?/g) || []).length, 1, 'Primary Tokenomics tab must render exactly once')
  const tabsSource = source('src/v2/components/V2ResearchTabs.jsx')
  assert.match(tabsSource, /V2TokenomicsQualityExperience/)
  assert.match(tabsSource, /activeTab === 'tokenomics'/)
  assert.doesNotMatch(tabsSource, /activeTab === 'tokenomics'[\s\S]{0,180}<LegacyTokenomicsPanel/)

  const bundle = researchUtils.buildReviewBundleText({
    asset: { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
    data: { assetResearchResultV2: buildV2Fixture('WBTC') },
    premiumV2TokenomicsQualityQa: tokenomicsNormalizer.PREMIUM_V2_TOKENOMICS_QUALITY_QA,
  })
  assert.equal((bundle.match(/Premium V2 Tokenomics Quality Experience QA/g) || []).length, 1)
  assert.match(bundle, /Experience attached: yes/)
  assert.match(bundle, /Old V2 Tokenomics surface primary: no/)
  assert.match(bundle, /Duplicate tokenomics-score count: 0/)
  assert.match(bundle, /Protocol-to-token value leakage count: 0/)
  assert.match(bundle, /Governance-to-cashflow leakage count: 0/)
  assert.match(bundle, /Product-AUM-to-token-value leakage count: 0/)
  assert.match(bundle, /Frontend analytical calculation count: 0/)
  assert.match(bundle, /Browser visual QA status: PENDING/)
  assert.match(bundle, /tokenomics score changed=no/)
  assert.match(bundle, /provider behavior changed=no/)

  const componentSource = source('src/v2/components/V2TokenomicsQualityExperience.jsx')
  const normalizerSource = source('src/v2/tokenomicsQualityV2.js')
  const css = source('src/v2/PremiumAssetPageV2.css')
  assert.doesNotMatch(componentSource, /symbol\s*===|assetSymbol\s*===/)
  assert.doesNotMatch(normalizerSource, /symbol\s*===|assetSymbol\s*===/)
  assert.doesNotMatch(componentSource, /tokenomicsIntegrityScore\s*[+\-*/]|overallScore\s*[+\-*/]|remainingDilution\s*=/)
  assert.doesNotMatch(normalizerSource, /tokenomicsIntegrityScore\s*[+\-*/]|overallScore\s*[+\-*/]|remainingDilution\s*=/)
  assert.equal((`${componentSource}\n${normalizerSource}`.match(/function normalizeTokenomicsQualityV2\s*\(/g) || []).length, 1)
  assert.match(componentSource, /role="list"/)
  assert.match(componentSource, /aria-label="Holder rights and evidence states"/)
  assert.match(componentSource, /href=\{unlocks\.marketSupplyDetailAnchor\}/)
  assert.match(css, /\.v2-tq-experience/)
  assert.match(css, /@media \(max-width: 1024px\)/)
  assert.match(css, /@media \(max-width: 700px\)/)
  assert.match(css, /@media \(max-width: 390px\)/)
  assert.match(css, /overflow-wrap:\s*anywhere/)
  assert.match(css, /min-height:\s*44px/)
  assert.match(css, /:focus-visible/)

  console.log(`PASS Premium V2 Tokenomics Quality normalization, family semantics, render, bundle, and responsive regressions (${REPRESENTATIVE_V2_ASSETS.length} assets)`)
} finally {
  await server.close()
}
