import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { buildV2Fixture, buildV2Response } from './fixtures/premium-asset-v2-fixtures.mjs'

const root = process.cwd()
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const RATIOS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.272, 1.414, 1.618, 2, 2.618, 3.618, 4.236]
const HORIZONS = ['daily', 'weekly', 'macro']

function historyPoints(count = 920, multiplier = 1) {
  const start = Date.UTC(2023, 0, 1)
  return Array.from({ length: count }, (_, index) => ({
    timestamp: new Date(start + index * 86_400_000).toISOString(),
    value: Number((35 * multiplier * (1 + index / count) * (1 + Math.sin(index / 31) * 0.17)).toFixed(8)),
    unit: multiplier > 1_000 ? 'USD' : 'USD',
    quoteCurrency: 'USD',
    provider: 'coingecko',
    sourceInterval: 'daily',
    interpolationStatus: 'observed',
    validity: 'valid',
    limitations: [],
  }))
}

function resampled(points, interval) {
  if (interval === 'daily') return points.slice(-365)
  if (interval === 'weekly') return points.filter((_point, index) => index % 7 === 6).slice(-260)
  return points.filter((_point, index) => index % 30 === 29).slice(-240)
}

function structure(horizon, seriesType, points) {
  const selectedLowAnchor = { anchorId: `${seriesType}:${horizon}:low`, horizon, seriesType, anchorType: 'structural_low', timestamp: points[12].timestamp, value: points[12].value, sourcePointIndex: 12, sourceProvider: 'coingecko', quoteCurrency: 'USD', detectionMethod: 'backend_fixture', prominence: 0.2, separation: 20, localVolatilityContext: 0.04, surroundingDrawdownOrRally: 0.5, selectionScore: 1, selected: true, rejectedReason: null, confidence: 'medium', limitations: [] }
  const selectedHighAnchor = { ...selectedLowAnchor, anchorId: `${seriesType}:${horizon}:high`, anchorType: 'structural_high', timestamp: points[Math.max(30, points.length - 35)].timestamp, value: points[Math.max(30, points.length - 35)].value * 1.2, sourcePointIndex: Math.max(30, points.length - 35) }
  return { horizonId: horizon, seriesType, currentValue: points.at(-1).value, selectedLowAnchor, selectedHighAnchor, currentRangePosition: 0.72, higherHighState: true, higherLowState: true, lowerHighState: false, lowerLowState: false, distanceFromSelectedLow: 0.9, distanceFromSelectedHigh: -0.1, distanceFromAth: -0.15, drawdownFromAth: -0.15, recoveryFromCycleLow: 0.9, realizedVolatility: 0.04, recentRange: { low: points.at(-12).value, high: points.at(-1).value }, structuralSupportZones: [{ lower: selectedLowAnchor.value * 0.98, upper: selectedLowAnchor.value * 1.02, basis: `${horizon} selected structural low` }], structuralResistanceZones: [{ lower: selectedHighAnchor.value * 0.98, upper: selectedHighAnchor.value * 1.02, basis: `${horizon} selected structural high` }], structureStatus: 'advancing', conciseSummary: `${horizon} ${seriesType.replace('_', '-')} structure is advancing.`, invalidationCondition: `A completed ${horizon} observation below the selected structural low invalidates this range.`, confidence: 'medium', provenance: [`coingecko ${horizon} observations`], limitations: ['Structure is descriptive.'] }
}

function fibonacci(structureValue, seriesType) {
  const low = structureValue.selectedLowAnchor.value
  const high = structureValue.selectedHighAnchor.value
  return { status: 'computed', seriesType, horizon: structureValue.horizonId, lowAnchorId: structureValue.selectedLowAnchor.anchorId, highAnchorId: structureValue.selectedHighAnchor.anchorId, formulaConvention: 'low_plus_range_times_ratio', levels: RATIOS.map((ratio) => ({ ratio, value: low + (high - low) * ratio, quoteCurrency: 'USD', anchorLow: low, anchorHigh: high, horizon: structureValue.horizonId, levelType: ratio > 1 ? 'extension' : 'internal_structure', distanceFromCurrentValue: 0.1, aboveOrBelowCurrent: ratio > 1 ? 'above' : 'below', touchedHistorically: ratio <= 1, touchCount: ratio <= 1 ? 1 : 0, confluenceReferences: [], confidence: 'medium', formula: 'level = lowAnchor + (highAnchor - lowAnchor) * ratio', limitations: ['Reference only.'], ...(seriesType === 'market_cap' ? { marketCap: low + (high - low) * ratio, currency: 'USD', sourceSeries: 'direct historical market-cap series', directOrDerived: 'direct', distanceFromCurrentMarketCap: 0.1, projectedSupplyAvailability: 'available', currentSupplyImpliedPrice: { applicability: 'computed', result: 75 }, projectedSupplyImpliedPrice: { applicability: 'computed', result: 70 }, dilutionImpact: { applicability: 'computed', result: 0.0667 } } : {}) })) }
}

function technicalFixture(symbol = 'BTC', options = {}) {
  const base = buildV2Fixture(symbol)
  const pricePoints = options.sparse ? historyPoints(24) : historyPoints()
  const marketCapPoints = options.noMarketCap ? [] : historyPoints(options.sparse ? 24 : 920, 25_000_000)
  const priceHorizons = Object.fromEntries(HORIZONS.map((horizon) => [horizon, resampled(pricePoints, horizon)]))
  const capHorizons = Object.fromEntries(HORIZONS.map((horizon) => [horizon, resampled(marketCapPoints, horizon)]))
  const priceStructures = Object.fromEntries(HORIZONS.map((horizon) => [horizon, priceHorizons[horizon].length > 30 ? structure(horizon, 'price', priceHorizons[horizon]) : { horizonId: horizon, seriesType: 'price', structureStatus: 'insufficient_history', conciseSummary: 'Insufficient history.', selectedLowAnchor: null, selectedHighAnchor: null, invalidationCondition: 'Unavailable.', confidence: 'unavailable' }]))
  const marketCapStructures = Object.fromEntries(HORIZONS.map((horizon) => [horizon, capHorizons[horizon].length > 30 ? structure(horizon, 'market_cap', capHorizons[horizon]) : { horizonId: horizon, seriesType: 'market_cap', structureStatus: 'insufficient_history', conciseSummary: 'Insufficient direct market-cap history.', selectedLowAnchor: null, selectedHighAnchor: null, invalidationCondition: 'Unavailable.', confidence: 'unavailable' }]))
  const priceFibonacci = HORIZONS.map((horizon) => priceStructures[horizon].selectedLowAnchor ? fibonacci(priceStructures[horizon], 'price') : { status: 'unavailable', seriesType: 'price', horizon, levels: [], limitations: ['Valid anchors required.'] })
  const marketCapFibonacci = HORIZONS.map((horizon) => marketCapStructures[horizon].selectedLowAnchor ? fibonacci(marketCapStructures[horizon], 'market_cap') : { status: 'unavailable', seriesType: 'market_cap', horizon, levels: [], limitations: ['Direct historical market-cap series required.'] })
  const stablecoin = symbol === 'USDC'
  const scenarios = ['base_conservative', 'strong_bull', 'extreme_bull', 'mania_tail'].map((scenarioId, index) => ({ scenarioId, displayName: ['Base / Conservative', 'Strong Bull', 'Extreme Bull', 'Mania / Tail'][index], status: stablecoin ? 'not_applicable' : options.noScenarios ? 'unavailable' : index < 2 ? 'supported' : 'speculative', lowerBoundPrice: stablecoin || options.noScenarios ? null : 120 + index * 65, upperBoundPrice: stablecoin || options.noScenarios ? null : 145 + index * 80, lowerBoundMarketCap: null, upperBoundMarketCap: null, scenarioDate: '2027-07-20', supplyBasis: stablecoin ? 'Stablecoin supply is mint/redemption driven.' : options.noProjectedSupply ? 'current circulating supply diagnostic; future dilution not modeled' : 'projected circulating supply', currentSupplyComparison: [], projectedSupplyComparison: [], impliedUpsideRange: stablecoin || options.noScenarios ? { lower: null, upper: null } : { lower: 0.2 + index * 0.65, upper: 0.45 + index * 0.8 }, priceFibInputs: [], marketCapFibInputs: [], priorHistoricalLevels: [], confluenceSources: [], confluenceCount: stablecoin || options.noScenarios ? 0 : index + 2, scenarioConfidence: stablecoin || options.noScenarios ? 'unavailable' : 'medium', evidenceBoundary: stablecoin ? 'Directional bull-price scenarios are not applicable to a fiat-backed stablecoin.' : 'Modeled scenario zone; not a forecast, probability, target, recommendation, or maximum.', invalidationConditions: ['A completed-period break below the selected structural low invalidates this range.'], limitations: [] }))
  const projectedSupply = ['6_months', '12_months', '24_months', '36_months'].map((horizon, index) => ({ horizon, scenarioDate: `202${7 + index}-01-20`, status: stablecoin ? 'not_applicable' : options.noProjectedSupply ? 'unavailable' : 'available', projectedCirculatingSupply: stablecoin || options.noProjectedSupply ? null : 10_000_000 + (index + 1) * 300_000, currentCirculatingSupply: 10_000_000, projectionMethod: stablecoin ? 'Future supply is mint/redemption driven.' : options.noProjectedSupply ? 'Projection withheld because canonical issuance inputs are incomplete.' : 'Linear fixed-schedule projection from canonical annualized protocol issuance; unlocks are excluded.' }))
  const historical = { ...base.historicalMarketData.data, sourceProvider: 'coingecko', sourceMethod: 'getMarketChart', quoteConfidence: 'high', coverage: options.sparse ? 'sparse' : options.noMarketCap ? 'partial' : 'sufficient', validationStatus: options.sparse || options.noMarketCap ? 'partial' : 'valid', freshness: options.stale ? 'stale' : 'fresh', priceSeries: { points: pricePoints, directOrDerived: 'direct', coverage: options.sparse ? 'sparse' : 'sufficient', validationStatus: options.sparse ? 'partial' : 'valid', limitations: ['Point observations are not OHLC.'] }, marketCapSeries: { points: marketCapPoints, directOrDerived: options.noMarketCap ? 'unavailable' : 'direct', coverage: options.noMarketCap ? 'unavailable' : options.sparse ? 'sparse' : 'sufficient', validationStatus: options.noMarketCap ? 'unavailable' : options.sparse ? 'partial' : 'valid', limitations: options.noMarketCap ? ['Direct market-cap history unavailable.'] : [] }, volumeSeries: { points: pricePoints, directOrDerived: 'direct', coverage: 'sufficient', validationStatus: 'valid', limitations: [] } }
  const horizonSeries = { price: Object.fromEntries(HORIZONS.map((horizon) => [horizon, { horizonId: horizon, interval: horizon === 'macro' ? 'monthly' : horizon, structureStatus: priceStructures[horizon].structureStatus, points: priceHorizons[horizon] }])), marketCap: Object.fromEntries(HORIZONS.map((horizon) => [horizon, { horizonId: horizon, interval: horizon === 'macro' ? 'monthly' : horizon, structureStatus: marketCapStructures[horizon].structureStatus, points: capHorizons[horizon] }])) }
  const confluenceZones = stablecoin || options.noScenarios ? [] : [{ zoneId: 'confluence:1', lowerBound: 120, upperBound: 145, independentSourceCount: 3, strength: 'moderate' }]
  const engine = { schemaVersion: 'technical-structure-bull-potential-v1', generatedAt: '2026-07-20T12:00:00.000Z', canonicalAssetId: `asset:coingecko:${base.identity.data.canonicalAssetId}`, assetFamily: base.classification.data.canonicalFamilyId, representationScope: base.historicalMarketData.data.representationScope, status: options.sparse ? 'insufficient_history' : options.noMarketCap ? 'partial' : 'available', structureSummary: stablecoin ? 'Price history is evaluated as peg stability; directional bull-price scenarios are not applicable.' : options.sparse ? 'Historical coverage is insufficient for deterministic structure.' : 'Canonical price and market-cap history support deterministic multi-horizon structure and bounded scenario zones.', historicalMarketData: historical, horizonSeries, priceStructureByHorizon: priceStructures, marketCapStructureByHorizon: marketCapStructures, anchorCandidates: [], selectedAnchors: Object.values(priceStructures).flatMap((item) => item.selectedLowAnchor ? [item.selectedLowAnchor, item.selectedHighAnchor] : []), reviewedAnchorOverride: options.reviewed ? { validationResult: 'valid' } : null, priceFibonacci, marketCapFibonacci, confluenceZones, projectedSupplyReadiness: stablecoin ? 'not_applicable' : options.noProjectedSupply ? 'unavailable' : 'available', projectedSupplyScenarios: projectedSupply, scenarioValuations: scenarios, primaryTechnicalRisk: options.noMarketCap ? 'Sufficient direct historical market-cap history' : 'A break below the structural low.', invalidationConditions: ['A completed-period break below the selected structural low invalidates this range.'], missingCriticalData: options.noMarketCap ? ['Sufficient direct historical market-cap history'] : options.noProjectedSupply ? ['Canonical projected circulating supply'] : [], nextDiligence: options.noMarketCap ? ['Attach direct historical market-cap data; do not reconstruct it with current supply.'] : [], confidence: { label: options.sparse ? 'low' : 'medium' }, provenance: ['coingecko canonical historical series', 'deterministic technical owner'], limitations: ['Scenario zones are modeled ranges, not predictions, probabilities, recommendations, or exact maximums.'] }
  const technical = { ...base.technicalStructure, status: engine.status, data: { ...base.technicalStructure.data, availability: engine.status, canonicalPair: { baseAssetId: engine.canonicalAssetId, quoteCurrency: 'USD', provider: 'coingecko' }, availableTimeframes: HORIZONS, technicalState: { summary: engine.structureSummary, status: engine.status }, priceStructure: priceStructures, marketCapStructure: marketCapStructures, swingAnchors: engine.selectedAnchors, priceFibonacci, marketCapFibonacci, supportZones: [], resistanceZones: [], confluenceZones, invalidationLevels: engine.invalidationConditions, historicalMarketData: historical, bullPotential: engine, scenarioValuation: scenarios } }
  return { ...base, historicalMarketData: { ...base.historicalMarketData, status: historical.validationStatus === 'valid' ? 'available' : historical.validationStatus === 'partial' ? 'partial' : 'unavailable', data: historical }, technicalStructure: technical, valuation: { ...base.valuation, data: { ...base.valuation.data, projectedSupply: { status: engine.projectedSupplyReadiness, reason: '', data: projectedSupply, requiredInputs: [] }, scenarios: { status: stablecoin ? 'not_applicable' : engine.status, reason: '', data: scenarios, requiredInputs: [] } } }, productAvailability: { ...base.productAvailability, data: { ...base.productAvailability.data, technicalStructure: engine.status, priceFibonacci: stablecoin ? 'not_applicable' : engine.status, marketCapFibonacci: options.noMarketCap ? 'unavailable' : engine.status, projectedSupply: engine.projectedSupplyReadiness, valuationScenarios: stablecoin ? 'not_applicable' : engine.status } } }
}

function render(Component, props) {
  return renderToString(React.createElement(Component, props))
}

try {
  const [{ default: TechnicalPanel }, normalizer, universe] = await Promise.all([
    server.ssrLoadModule('/src/v2/components/V2TechnicalScenariosPanel.jsx'),
    server.ssrLoadModule('/src/v2/assetResearchResultV2.js'),
    server.ssrLoadModule('/src/v2/universeDiscoveryV2.js'),
  ])

  const complete = technicalFixture('BTC')
  const normalized = normalizer.normalizeAssetResearchResultV2({ assetResearchResultV2: complete, analysis: { assetResearchResultV2: complete } })
  assert.equal(normalized.result.technicalStructure.data.bullPotential.schemaVersion, 'technical-structure-bull-potential-v1')
  assert.equal(normalized.result.historicalMarketData.data.noCurrentSupplyMarketCapReconstruction, true)

  for (const horizon of HORIZONS) {
    for (const series of ['price', 'marketCap']) {
      const html = render(TechnicalPanel, { result: complete, initialHorizon: horizon, initialSeries: series })
      assert.match(html, /Historical structure before upside arithmetic/)
      assert.match(html, new RegExp(`${horizon}`, 'i'))
      assert.match(html, /Four bounded scenario tiers/)
      assert.match(html, /Base \/ Conservative/)
      assert.match(html, /Mania \/ Tail/)
      assert.match(html, /Fibonacci levels/)
      assert.match(html, /backend-owned close-only observations/i)
      assert.doesNotMatch(html, /undefined|NaN|Infinity|\[object Object\]/)
      assert.doesNotMatch(html, /\bBUY\b|\bSELL\b|guaranteed target|exact maximum|100% probability/i)
      assert.doesNotMatch(html, /source_required|future_milestone|artifactVersion|claimIds?|ruleIds?/i)
    }
  }

  const missingMarketCap = render(TechnicalPanel, { result: technicalFixture('ETH', { noMarketCap: true }), initialSeries: 'marketCap' })
  assert.match(missingMarketCap, /Historical structure is not available/)
  assert.match(missingMarketCap, /direct historical market-cap/i)
  assert.doesNotMatch(missingMarketCap, /NaN|Infinity|\[object Object\]/)
  const noProjected = render(TechnicalPanel, { result: technicalFixture('XRP', { noProjectedSupply: true }) })
  assert.match(noProjected, /Canonical Projected Circulating Supply|Canonical projected circulating supply|Unavailable/i)
  assert.match(noProjected, /current circulating supply diagnostic; future dilution not modeled/i)
  const sparse = render(TechnicalPanel, { result: technicalFixture('RSS3', { sparse: true }) })
  assert.match(sparse, /Historical structure is not available|insufficient/i)
  assert.doesNotMatch(sparse, /moonshot|maximum upside/i)
  const stablecoin = render(TechnicalPanel, { result: technicalFixture('USDC') })
  assert.match(stablecoin, /not applicable to peg-underwriting|not applicable to a fiat-backed stablecoin/i)
  assert.doesNotMatch(stablecoin, /\$120.*\$145/i)
  const reviewed = render(TechnicalPanel, { result: technicalFixture('BTC', { reviewed: true }) })
  assert.match(reviewed, /Reviewed anchors/i)

  const unavailable = buildV2Fixture('LINK')
  const unavailableHtml = render(TechnicalPanel, { result: unavailable })
  assert.match(unavailableHtml, /Historical structure is not available/)
  assert.doesNotMatch(unavailableHtml, /undefined|NaN|Infinity|\[object Object\]/)

  const candidate = {
    candidateId: 'candidate:btc', providerOrigins: [], seedOrigins: [], limitations: [],
    membership: { membershipStatus: 'eligible' }, displayIdentity: { name: 'Bitcoin', symbol: 'BTC' }, canonicalIdentity: { canonicalName: 'Bitcoin', canonicalSymbol: 'BTC' },
    candidateType: 'crypto_asset', representation: { representationType: 'native_asset' }, relevance: { relevanceState: 'core_relevant' }, coverage: { state: 'sufficient' }, liquidity: { state: 'eligible' }, analysis: { analysisStatus: 'completed' }, freshness: { state: 'ready' },
    technicalReadiness: { technicalDataReady: true, priceHistoryReady: true, marketCapHistoryReady: true, projectedSupplyReady: true, scenarioValuationReady: true, technicalRankingReadiness: 'readiness_only_not_ranked' },
  }
  const definition = { universeId: 'u1', slug: 'u1', displayName: 'Universe', status: 'active_discovery' }
  const discovery = universe.normalizeUniverseDiscoveryResponse({ schemaVersion: '1', universeDefinition: definition, candidates: [candidate], eligibleMembers: [candidate], caveatedMembers: [], pendingCandidates: [], manualReviewCandidates: [], ineligibleCandidates: [] })
  assert.equal(discovery.candidates[0].technicalReadiness.technicalDataReady, true)
  assert.equal(discovery.candidates[0].display.technicalReadiness, 'Technical data ready')
  assert.equal(discovery.candidates[0].technicalReadiness.technicalRankingReadiness, 'readiness_only_not_ranked')

  const componentSource = readFileSync(path.join(root, 'src/v2/components/V2TechnicalScenariosPanel.jsx'), 'utf8')
  const tabsSource = readFileSync(path.join(root, 'src/v2/components/V2ResearchTabs.jsx'), 'utf8')
  const cssSource = readFileSync(path.join(root, 'src/v2/PremiumAssetPageV2.css'), 'utf8')
  assert.match(tabsSource, /Technical & Scenarios/)
  assert.doesNotMatch(componentSource, /detectAnchors|TECHNICAL_FIBONACCI_RATIOS|projectedSupplyScenarios\s*\(|scenarioValuations\s*\(|confluenceZones\s*\(/)
  assert.doesNotMatch(componentSource, /currentPrice\s*\*\s*currentSupply|historicalPrice\s*\*\s*currentSupply/)
  assert.match(componentSource, /coordinate transformation only/i)
  assert.match(cssSource, /@media \(max-width: 900px\)/)
  assert.match(cssSource, /@media \(max-width: 640px\)/)
  assert.match(cssSource, /@media \(max-width: 390px\)/)
  assert.match(cssSource, /\.v2-technical-toolbar button/)
  assert.match(cssSource, /min-height: 42px/)

  const rootResponse = buildV2Response('BTC', { resultOverrides: { historicalMarketData: complete.historicalMarketData, technicalStructure: complete.technicalStructure, valuation: complete.valuation } })
  assert.deepEqual(rootResponse.assetResearchResultV2.technicalStructure, rootResponse.analysis.assetResearchResultV2.technicalStructure)
  assert.deepEqual(rootResponse.assetResearchResultV2.valuation.data.scenarios, rootResponse.analysis.assetResearchResultV2.valuation.data.scenarios)
  console.log('PASS V2 Technical & Scenarios renderer-only regressions')
} finally {
  await server.close()
}
