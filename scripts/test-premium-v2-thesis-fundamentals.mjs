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
    fundamentalsNormalizer,
    resultNormalizer,
    { default: V2ThesisFundamentalsExperience },
    { default: V2ResearchTabs },
    researchUtils,
  ] = await Promise.all([
    server.ssrLoadModule('/src/v2/thesisFundamentalsV2.js'),
    server.ssrLoadModule('/src/v2/assetResearchResultV2.js'),
    server.ssrLoadModule('/src/v2/components/V2ThesisFundamentalsExperience.jsx'),
    server.ssrLoadModule('/src/v2/components/V2ResearchTabs.jsx'),
    server.ssrLoadModule('/src/components/research/researchUtils.js'),
  ])

  const rendered = new Map()
  for (const symbol of REPRESENTATIVE_V2_ASSETS) {
    const result = buildV2Fixture(symbol)
    const model = fundamentalsNormalizer.normalizeThesisFundamentalsV2(result)
    const html = render(V2ThesisFundamentalsExperience, { result })
    rendered.set(symbol, { result, model, html })

    assert.equal(model.schemaVersion, 'premium-v2-thesis-fundamentals-experience-v1', `${symbol} schema`)
    assert.equal(model.canonicalAssetId, result.identity.data.canonicalAssetId, `${symbol} identity`)
    assert.equal(model.representation.representationType, result.representation.data.representationType, `${symbol} representation`)
    assert.equal(model.family.familyId, result.classification.data.canonicalFamilyId, `${symbol} family`)
    assert.equal(Object.isFrozen(model), true, `${symbol} normalized root frozen`)
    assert.equal(Object.isFrozen(model.strengths), true, `${symbol} normalized strengths frozen`)
    assert.equal(model.guardrails.analyticalAuthorityAdded, false)
    assert.equal(model.guardrails.frontendAnalysisAllowed, false)
    assert.equal(model.guardrails.protocolSuccessEqualsTokenSuccess, false)
    assert.equal(model.guardrails.partnershipsEqualUsage, false)
    assert.equal(model.guardrails.integrationsEqualAdoption, false)
    assert.equal(model.guardrails.marketCapEqualsMoat, false)
    assert.equal(model.guardrails.pricePerformanceEqualsAdoption, false)
    assert.equal(model.guardrails.productAumEqualsTokenValue, false)
    assert.equal(model.guardrails.missingEvidenceIsRiskFinding, false)
    assert.equal(model.guardrails.nativeFundamentalsInheritedByWrappedAsset, false)
    assert.equal(model.guardrails.nativeFundamentalsInheritedByLst, false)
    assert.equal(model.guardrails.stablecoinSpeculativeThesisAllowed, false)
    assert.equal(model.guardrails.memeUtilityInvented, false)

    assert.match(html, /Institutional thesis/)
    assert.match(html, /What does the asset, network, issuer, or claim actually do\?/)
    assert.match(html, /Is adoption measurable and durable\?/)
    assert.match(html, /What creates measurable economic activity\?/)
    assert.match(html, /Is the differentiation defensible\?/)
    assert.match(html, /Can the organization execute\?/)
    assert.match(html, /What rights and dependencies are enforceable\?/)
    assert.match(html, /What could change or falsify the view\?/)
    assert.match(html, /Supported strengths, risks, and open questions/)
    assert.match(html, /What should the analyst verify next\?/)
    assert.doesNotMatch(html, /undefined|NaN|Infinity|\[object Object\]/)
    assert.doesNotMatch(
      html,
      /\b(?:source_required|manual_low_coverage|not_scoring_active|future_milestone|claimIds?|packIds?|ruleIds?|artifactVersion|live_current_qa)\b/i,
      `${symbol} customer enum leakage`,
    )
  }

  assert.match(rendered.get('BTC').html, /Proof-of-work monetary security/)
  assert.doesNotMatch(rendered.get('BTC').html, /liquid staking exposure|stablecoin reserve/i)
  assert.match(rendered.get('ETH').html, /Gas demand, fee burn, staking/)
  assert.match(rendered.get('XRP').html, /Settlement usage and liquid market access/)
  assert.doesNotMatch(rendered.get('XRP').html, /hashrate|mining pool|reserve attestation/i)
  assert.match(rendered.get('USDC').html, /Reserve quality, redemption access/)
  assert.doesNotMatch(rendered.get('USDC').html, /speculative appreciation|growth token/i)
  assert.match(rendered.get('WBTC').html, /Tokenized BTC exposure/)
  assert.match(rendered.get('stETH').html, /Liquid staking exposure/)
  assert.match(rendered.get('UNI').html, /tokenholder accrual remains a separate question/i)
  assert.match(rendered.get('AAVE').html, /Direct tokenholder accrual/)
  assert.match(rendered.get('LINK').html, /Oracle adoption and security services/)
  assert.match(rendered.get('ONDO').html, /Product assets and tokenholder legal or economic rights remain distinct/)
  assert.match(rendered.get('PAXG').html, /Physical backing, custody, and redemption/)
  assert.match(rendered.get('RENDER').html, /Resource-network demand and provider incentives/)
  assert.match(rendered.get('PEPE').html, /Supply certainty, concentration, liquidity/)
  assert.doesNotMatch(rendered.get('PEPE').html, /productive utility|protocol revenue (?:supports|creates|accrues|proves)/i)
  assert.match(rendered.get('RSS3').html, /preliminary risk screen/i)

  for (const symbol of ['SOL', 'AVAX', 'ADA']) {
    assert.match(rendered.get(symbol).html, /Native.*usage|network usage|fee demand|staking security/i)
    assert.doesNotMatch(rendered.get(symbol).html, /L2\/blob|wrapped BTC|stablecoin redemption/i)
  }

  const missing = buildV2Fixture('BTC')
  delete missing.thesisFundamentalsPresentation
  assert.throws(
    () => fundamentalsNormalizer.normalizeThesisFundamentalsV2(missing),
    (error) => error.code === 'missing_thesis_fundamentals_presentation',
  )
  assert.match(render(V2ThesisFundamentalsExperience, { result: missing }), /Fundamental analysis is unavailable/)

  const wrongIdentity = structuredClone(buildV2Fixture('ETH'))
  wrongIdentity.thesisFundamentalsPresentation.canonicalAssetId = 'bitcoin'
  assert.throws(
    () => fundamentalsNormalizer.normalizeThesisFundamentalsV2(wrongIdentity),
    (error) => error.code === 'thesis_fundamentals_identity_mismatch',
  )

  const unsafe = structuredClone(buildV2Fixture('USDC'))
  unsafe.thesisFundamentalsPresentation.guardrails.stablecoinSpeculativeThesisAllowed = true
  assert.throws(
    () => fundamentalsNormalizer.normalizeThesisFundamentalsV2(unsafe),
    (error) => error.code === 'thesis_fundamentals_guardrail_failure',
  )

  const resultWithoutPresentation = buildV2Fixture('BTC')
  delete resultWithoutPresentation.thesisFundamentalsPresentation
  assert.throws(
    () => resultNormalizer.normalizeAssetResearchResultV2({ assetResearchResultV2: resultWithoutPresentation }),
    (error) => error.code === 'missing_thesis_fundamentals_presentation',
  )

  const first = buildV2Fixture('WBTC')
  const second = buildV2Fixture('BTC')
  const third = buildV2Fixture('WBTC')
  assert.notEqual(first.thesisFundamentalsPresentation, third.thesisFundamentalsPresentation)
  assert.deepEqual(first.thesisFundamentalsPresentation, third.thesisFundamentalsPresentation)
  assert.notEqual(first.thesisFundamentalsPresentation.canonicalAssetId, second.thesisFundamentalsPresentation.canonicalAssetId)

  const tabsHtml = render(V2ResearchTabs, { result: buildV2Fixture('ETH') })
  assert.equal((tabsHtml.match(/Institutional thesis/g) || []).length, 0, 'Fundamentals is not the default selected tab')
  const tabsSource = source('src/v2/components/V2ResearchTabs.jsx')
  assert.match(tabsSource, /V2ThesisFundamentalsExperience/)
  assert.match(tabsSource, /activeTab === 'fundamentals'/)
  assert.match(tabsSource, /export const FundamentalsPanel = V2ThesisFundamentalsExperience/)
  assert.doesNotMatch(tabsSource, /activeTab === 'fundamentals'[\s\S]{0,180}<LegacyFundamentalsPanel/)

  const bundle = researchUtils.buildReviewBundleText({
    asset: { symbol: 'ONDO', name: 'Ondo' },
    data: { assetResearchResultV2: buildV2Fixture('ONDO') },
    premiumV2ThesisFundamentalsQa: fundamentalsNormalizer.PREMIUM_V2_THESIS_FUNDAMENTALS_QA,
  })
  assert.equal((bundle.match(/Premium V2 Thesis & Fundamentals Experience QA/g) || []).length, 1)
  assert.match(bundle, /Experience attached: yes/)
  assert.match(bundle, /Old V2 Fundamentals surface primary: no/)
  assert.match(bundle, /Duplicate thesis count: 0/)
  assert.match(bundle, /Protocol-to-token value leakage count: 0/)
  assert.match(bundle, /Frontend analytical calculation count: 0/)
  assert.match(bundle, /Browser visual QA status: PENDING/)
  assert.match(bundle, /provider behavior changed=no/)

  const componentSource = source('src/v2/components/V2ThesisFundamentalsExperience.jsx')
  const normalizerSource = source('src/v2/thesisFundamentalsV2.js')
  const css = source('src/v2/PremiumAssetPageV2.css')
  assert.doesNotMatch(componentSource, /symbol\s*===|assetSymbol\s*===/)
  assert.doesNotMatch(normalizerSource, /symbol\s*===|assetSymbol\s*===/)
  assert.doesNotMatch(componentSource, /marketCap\s*[+\-*/]|overallScore\s*[+\-*/]|tokenomicsIntegrityScore\s*[+\-*/]/)
  assert.doesNotMatch(normalizerSource, /marketCap\s*[+\-*/]|overallScore\s*[+\-*/]|tokenomicsIntegrityScore\s*[+\-*/]/)
  assert.equal((`${componentSource}\n${normalizerSource}`.match(/function normalizeThesisFundamentalsV2\s*\(/g) || []).length, 1)
  assert.match(css, /\.v2-tf-experience/)
  assert.match(css, /@media \(max-width: 1024px\)/)
  assert.match(css, /@media \(max-width: 700px\)/)
  assert.match(css, /@media \(max-width: 390px\)/)
  assert.match(css, /overflow-wrap:\s*anywhere/)

  console.log(`PASS Premium V2 Thesis & Fundamentals normalization, family semantics, render, bundle, and responsive regressions (${REPRESENTATIVE_V2_ASSETS.length} assets)`)
} finally {
  await server.close()
}
