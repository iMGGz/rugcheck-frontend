import React, { useEffect, useId, useMemo, useState } from 'react'
import {
  formatV2Date,
  formatV2Number,
  formatV2Percent,
  formatV2Usd,
  humanizeV2Value,
  safeProductList,
  safeProductText,
} from '../assetResearchResultV2'
import { normalizeMarketLiquiditySupplyV2 } from '../marketLiquiditySupplyV2'
import {
  V2CompactState,
  V2Disclosure,
  V2InsightList,
  V2SectionHeading,
  V2StatusPill,
} from './V2Primitives'

const MAX_POLICY_LABELS = Object.freeze({
  finite_cap_reported: 'Finite cap reported',
  dynamic_or_governed: 'Dynamic or governance-controlled',
  elastic_or_rebasing: 'Elastic or rebasing supply',
  not_meaningful_for_family: 'Fixed cap not meaningful for this asset',
  explicitly_uncapped: 'No fixed maximum supply',
  adaptive_issuance: 'Adaptive issuance policy',
  elastic_issuer_supply: 'Issuer-responsive supply',
  unknown: 'Policy not established',
})

function metricValue(metric) {
  return typeof metric?.value === 'number' && Number.isFinite(metric.value) ? metric.value : null
}

function scalarValue(scalar) {
  return typeof scalar?.value === 'number' && Number.isFinite(scalar.value) ? scalar.value : null
}

function displayMetric(metric, kind = 'number', compact = false) {
  const value = metricValue(metric)
  if (kind === 'usd') return formatV2Usd(value, { compact })
  if (kind === 'percent') return formatV2Percent(value)
  return formatV2Number(value, { compact })
}

function displayScalar(scalar, kind = 'number', compact = false) {
  const value = scalarValue(scalar)
  if (kind === 'usd') return formatV2Usd(value, { compact })
  if (kind === 'percent') return formatV2Percent(value)
  return formatV2Number(value, { compact })
}

function metricDetail(metric, fallback) {
  if (metricValue(metric) === null) return metric?.limitations?.[0] || fallback
  const provider = metric.provider ? `Source: ${metric.provider}` : 'Canonical source attached'
  const time = metric.observedAt ? ` / ${formatV2Date(metric.observedAt)}` : ''
  return `${provider}${time}`
}

function MarketMetric({ label, metric, kind = 'number', compact = false, featured = false, detail }) {
  const value = displayMetric(metric, kind, compact)
  const full = displayMetric(metric, kind, false)
  return (
    <div className={`v2-mls-metric${featured ? ' v2-mls-metric--featured' : ''}`}>
      <span>{label}</span>
      <strong title={full}>{value}</strong>
      <small>{detail || metricDetail(metric, 'Current measurement unavailable')}</small>
    </div>
  )
}

function EmptyValue({ label, reason }) {
  return (
    <div className="v2-mls-empty-value">
      <span>{label}</span>
      <strong>Unavailable</strong>
      <small>{reason}</small>
    </div>
  )
}

function chartGeometry(points, width = 860, height = 300) {
  if (!Array.isArray(points) || points.length < 2) return null
  const padding = { top: 22, right: 18, bottom: 28, left: 18 }
  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || Math.max(Math.abs(max), 1)
  const x = (index) => padding.left + (index / (points.length - 1)) * (width - padding.left - padding.right)
  const y = (value) => padding.top + ((max - value) / span) * (height - padding.top - padding.bottom)
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(2)} ${y(point.value).toFixed(2)}`).join(' ')
  return {
    width,
    height,
    path,
    area: `${path} L ${x(points.length - 1).toFixed(2)} ${(height - padding.bottom).toFixed(2)} L ${x(0).toFixed(2)} ${(height - padding.bottom).toFixed(2)} Z`,
  }
}

function formatSeriesValue(value, seriesId) {
  return ['price', 'market_cap', 'volume'].includes(seriesId)
    ? formatV2Usd(value, { compact: seriesId !== 'price' })
    : formatV2Number(value, { compact: true })
}

function HistoricalMarketContext({ model }) {
  const availableSeries = model.historicalContext.series.filter((series) =>
    series.ranges.some((range) => range.availability === 'available' && range.points.length >= 2))
  const [seriesId, setSeriesId] = useState(availableSeries[0]?.seriesId || 'price')
  const [rangeId, setRangeId] = useState('1y')
  const [selectedPointIndex, setSelectedPointIndex] = useState(0)
  const gradientId = useId().replace(/:/g, '')
  const series = availableSeries.find((item) => item.seriesId === seriesId) || availableSeries[0]
  const availableRanges = series?.ranges.filter((range) => range.availability === 'available') || []
  const range = availableRanges.find((item) => item.rangeId === rangeId) || availableRanges[availableRanges.length - 1]
  const points = range?.points || []
  const geometry = useMemo(() => chartGeometry(points), [points])

  useEffect(() => {
    setSelectedPointIndex(Math.max(0, points.length - 1))
  }, [series?.seriesId, range?.rangeId, points.length])

  if (!series || !range || !geometry) {
    return (
      <section className="v2-mls-panel v2-mls-panel--history">
        <header><div><p className="v2-eyebrow">Historical context</p><h3>Direct market history</h3></div><V2StatusPill status="unavailable" /></header>
        <V2CompactState
          icon="pulse"
          title="Historical context is unavailable"
          message={model.historicalContext.limitations[0] || 'A direct canonical series with at least two observations is required.'}
        />
      </section>
    )
  }

  const selectedPoint = points[Math.min(selectedPointIndex, points.length - 1)]
  return (
    <section className="v2-mls-panel v2-mls-panel--history" aria-labelledby="v2-mls-history-title">
      <header className="v2-mls-panel__header">
        <div><p className="v2-eyebrow">Historical context</p><h3 id="v2-mls-history-title">Direct market history</h3><p>No indicators, forecasts, interpolation, or synthetic supply.</p></div>
        <V2StatusPill label={model.labels.historicalFreshness} status={model.historicalContext.freshness} />
      </header>
      <div className="v2-mls-chart-toolbar">
        <div role="group" aria-label="Historical series">
          {availableSeries.map((item) => (
            <button key={item.seriesId} type="button" aria-pressed={series.seriesId === item.seriesId} onClick={() => setSeriesId(item.seriesId)}>
              {item.label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Historical range">
          {series.ranges.map((item) => (
            <button
              key={item.rangeId}
              type="button"
              disabled={item.availability !== 'available'}
              aria-pressed={range.rangeId === item.rangeId}
              onClick={() => setRangeId(item.rangeId)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <figure className="v2-mls-chart">
        <div className="v2-mls-chart__current" aria-live="polite">
          <span>{formatV2Date(selectedPoint.timestamp, { includeTime: false })}</span>
          <strong>{formatSeriesValue(selectedPoint.value, series.seriesId)}</strong>
        </div>
        <svg
          viewBox={`0 0 ${geometry.width} ${geometry.height}`}
          role="img"
          aria-label={`${series.label} history from ${formatV2Date(range.startAt, { includeTime: false })} to ${formatV2Date(range.endAt, { includeTime: false })}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => <line key={ratio} className="v2-mls-chart__grid" x1="18" x2="842" y1={22 + ratio * 250} y2={22 + ratio * 250} />)}
          <path className="v2-mls-chart__area" d={geometry.area} fill={`url(#${gradientId})`} />
          <path className="v2-mls-chart__line" d={geometry.path} />
        </svg>
        <label className="v2-mls-chart__scrubber">
          <span>Inspect observation</span>
          <input
            type="range"
            min="0"
            max={Math.max(0, points.length - 1)}
            value={Math.min(selectedPointIndex, points.length - 1)}
            onChange={(event) => setSelectedPointIndex(Number(event.target.value))}
            aria-label={`Inspect ${series.label} observation`}
          />
        </label>
        <figcaption>
          <span>{formatV2Date(range.startAt, { includeTime: false })}</span>
          <span>{points.length} direct observations / {series.sourceProvider || 'source unavailable'}</span>
          <span>{formatV2Date(range.endAt, { includeTime: false })}</span>
        </figcaption>
      </figure>
    </section>
  )
}

function LiquidityQualityPanel({ model }) {
  const liquidity = model.liquidity
  const pair = liquidity.selectedPairIdentity
  return (
    <section className="v2-mls-panel v2-mls-panel--liquidity" aria-labelledby="v2-mls-liquidity-title">
      <header className="v2-mls-panel__header">
        <div><p className="v2-eyebrow">Liquidity quality</p><h3 id="v2-mls-liquidity-title">Measured scope, not inferred depth</h3></div>
        <V2StatusPill label={model.labels.liquidityStatus} status={liquidity.status} />
      </header>
      <div className="v2-mls-liquidity-split">
        <article>
          <span>Global trading volume</span>
          <strong>{displayMetric(liquidity.globalVolume24h, 'usd', true)}</strong>
          <p>Global provider-reported 24-hour activity. Volume is not order-book depth.</p>
        </article>
        <article>
          <span>Selected pool liquidity</span>
          <strong>{liquidity.selectedPairLiquidityUsd ? displayMetric(liquidity.selectedPairLiquidityUsd, 'usd', true) : 'Unavailable'}</strong>
          <p>{pair ? `${pair.baseAsset || 'Base'}/${pair.quoteAsset || 'Quote'} on ${pair.venue || 'selected venue'}` : 'No contract- and network-matched pool is attached.'}</p>
        </article>
        <article>
          <span>Selected pool volume</span>
          <strong>{liquidity.selectedPairVolume24h ? displayMetric(liquidity.selectedPairVolume24h, 'usd', true) : 'Unavailable'}</strong>
          <p>Venue-level activity for the selected pool only.</p>
        </article>
        <article>
          <span>Measured market depth</span>
          <strong>{displayScalar(liquidity.orderBookDepth, 'usd', true)}</strong>
          <p>{liquidity.orderBookDepth.limitations[0] || 'Depth requires venue, quote currency, and order-size scope.'}</p>
        </article>
      </div>
      <div className="v2-mls-scope-note">
        <span aria-hidden="true">i</span>
        <p>{liquidity.pairRepresentationReason}</p>
      </div>
      {pair?.pairAddress ? (
        <V2Disclosure label="Selected pool identity" summary={`${pair.venue || 'DEX'} / ${pair.chain || 'network unavailable'}`} quiet>
          <dl className="v2-mls-detail-list">
            <div><dt>Network</dt><dd>{pair.chain || 'Unavailable'}</dd></div>
            <div><dt>Pair</dt><dd>{pair.baseAsset || 'Base'} / {pair.quoteAsset || 'Quote'}</dd></div>
            <div><dt>Pair address</dt><dd className="v2-mls-long-value" title={pair.pairAddress}>{pair.pairAddress}</dd></div>
            <div><dt>Observed</dt><dd>{liquidity.selectedPairLiquidityUsd?.observedAt ? formatV2Date(liquidity.selectedPairLiquidityUsd.observedAt) : 'Unavailable'}</dd></div>
          </dl>
        </V2Disclosure>
      ) : null}
    </section>
  )
}

function SupplyStructurePanel({ model }) {
  const supply = model.supplyStructure
  const circulatingPercent = metricValue(supply.circulatingShare)
  const width = circulatingPercent === null ? null : `${Math.max(0, Math.min(100, circulatingPercent))}%`
  const secondary = [
    ['Locked', supply.lockedSupply],
    ['Staked', supply.stakedSupply],
    ['Treasury', supply.treasurySupply],
    ['Escrowed', supply.escrowedSupply],
    ['Burned', supply.burnedSupply],
    ['Wrapped / bridged', supply.bridgedOrWrappedSupply],
    ['Free float', supply.freeFloatSupply],
  ]
  return (
    <section className="v2-mls-panel v2-mls-panel--supply" aria-labelledby="v2-mls-supply-title">
      <header className="v2-mls-panel__header">
        <div><p className="v2-eyebrow">Supply structure</p><h3 id="v2-mls-supply-title">Circulating, issued, capped, and controlled</h3></div>
        <V2StatusPill label={model.labels.supplyStatus} status={supply.status} />
      </header>
      <div className="v2-mls-supply-primary">
        <div><span>Circulating</span><strong>{displayMetric(supply.circulatingSupply, 'number', true)}</strong></div>
        <div><span>Total</span><strong>{displayMetric(supply.totalSupply, 'number', true)}</strong></div>
        <div><span>Maximum</span><strong>{displayMetric(supply.maximumSupply, 'number', true)}</strong></div>
      </div>
      <div className="v2-mls-supply-track" aria-label={circulatingPercent === null ? 'Circulating share unavailable' : `${formatV2Percent(circulatingPercent)} of maximum supply is circulating`}>
        {width ? <span style={{ width }} /> : null}
      </div>
      <div className="v2-mls-supply-policy">
        <span>Maximum supply policy</span>
        <strong>{MAX_POLICY_LABELS[supply.maxSupplyPolicy] || humanizeV2Value(supply.maxSupplyPolicy, 'Policy not established')}</strong>
        <p>{safeProductText(supply.maxSupplyPolicyExplanation, 'Maximum supply policy requires verification.')}</p>
      </div>
      <div className="v2-mls-supply-secondary">
        {secondary.map(([label, item]) => scalarValue(item) === null
          ? <EmptyValue key={label} label={label} reason={item.limitations[0] || 'Canonical value not attached'} />
          : <div key={label}><span>{label}</span><strong>{displayScalar(item, 'number', true)}</strong><small>{item.observedAt ? formatV2Date(item.observedAt) : 'Source scope attached'}</small></div>)}
      </div>
      <p className="v2-boundary-copy">Supply categories may overlap. Percentages are shown only when an existing backend formula names a compatible denominator.</p>
    </section>
  )
}

function DilutionIssuanceUnlockPanel({ model }) {
  const monetary = model.issuanceAndBurn
  const unlocks = model.unlocksAndEmissions
  const dilution = model.supplyStructure.remainingDilutionShare
  const nextUnlockValue = unlocks.nextUnlockAmount ?? unlocks.nextUnlockUsdValue
  const nextUnlockKind = unlocks.nextUnlockAmount !== null ? 'number' : 'usd'
  return (
    <section className="v2-mls-panel v2-mls-panel--dilution" aria-labelledby="v2-mls-dilution-title">
      <header className="v2-mls-panel__header">
        <div><p className="v2-eyebrow">Monetary change</p><h3 id="v2-mls-dilution-title">Dilution, issuance, burn, and unlocks</h3></div>
        <V2StatusPill label={model.labels.unlockStatus} status={unlocks.status} />
      </header>
      <div className="v2-mls-monetary-grid">
        <div><span>Issuance model</span><strong>{humanizeV2Value(monetary.issuanceModel, 'Unavailable')}</strong><small>{monetary.issuancePeriod || 'Measurement period unavailable'}</small></div>
        <div><span>Gross issuance</span><strong>{displayScalar(monetary.grossIssuanceAmount, 'number', true)}</strong><small>{displayScalar(monetary.grossIssuanceRate, 'percent')}</small></div>
        <div><span>Burn</span><strong>{humanizeV2Value(monetary.burnModel, 'Unavailable')}</strong><small>{displayScalar(monetary.burnedAmount, 'number', true)}</small></div>
        <div><span>Net issuance</span><strong>{displayScalar(monetary.netIssuanceAmount, 'number', true)}</strong><small>{displayScalar(monetary.netIssuanceRate, 'percent')}</small></div>
        <div><span>Remaining dilution</span><strong>{dilution ? displayMetric(dilution, 'percent') : 'Unavailable'}</strong><small>{dilution?.formulaStatus === 'computed' ? 'Backend formula' : dilution?.limitations?.[0] || 'No compatible maximum-supply denominator'}</small></div>
        <div><span>Next unlock</span><strong>{nextUnlockValue === null ? 'Unavailable' : nextUnlockKind === 'usd' ? formatV2Usd(nextUnlockValue, { compact: true }) : formatV2Number(nextUnlockValue, { compact: true })}</strong><small>{unlocks.nextUnlockDate ? formatV2Date(unlocks.nextUnlockDate, { includeTime: false }) : humanizeV2Value(unlocks.unlockScheduleCoverage, 'Coverage unavailable')}</small></div>
      </div>
      <div className="v2-mls-interpretation-note">
        <strong>{safeProductText(monetary.economicInterpretation, 'Current monetary-change interpretation is unavailable.')}</strong>
        <p>{safeProductText(unlocks.unlockInterpretation, 'Unlock coverage is unavailable and no risk conclusion is inferred.')}</p>
      </div>
      <V2Disclosure label="Unlock and emission detail" summary={`${unlocks.scheduledUnlocks.length} scheduled observation${unlocks.scheduledUnlocks.length === 1 ? '' : 's'}`}>
        {unlocks.scheduledUnlocks.length ? (
          <div className="v2-mls-unlock-list">
            {unlocks.scheduledUnlocks.slice(0, 8).map((event) => (
              <article key={event.eventId}>
                <span>{event.eventDate ? formatV2Date(event.eventDate, { includeTime: false }) : 'Date unavailable'}</span>
                <strong>{event.label || humanizeV2Value(event.eventType, 'Unlock')}</strong>
                <small>{event.amountTokens === null ? 'Amount unavailable' : formatV2Number(event.amountTokens, { compact: true })} / {event.percentOfCirculatingSupply === null ? 'circulating share unavailable' : `${formatV2Percent(event.percentOfCirculatingSupply)} of circulating`}</small>
              </article>
            ))}
          </div>
        ) : <p className="v2-empty-copy">{unlocks.unlockInterpretation}</p>}
        <p className="v2-boundary-copy">Unlock observations do not predict selling or price impact. Missing coverage does not mean no unlock risk.</p>
      </V2Disclosure>
    </section>
  )
}

function ProviderQualityDisclosure({ model }) {
  const agreement = model.providerAgreement
  return (
    <V2Disclosure
      label="Provider agreement and measurement quality"
      summary={`${model.labels.providerAgreement} / ${agreement.comparableProviderCount} comparable source${agreement.comparableProviderCount === 1 ? '' : 's'}`}
    >
      <div className="v2-mls-provider-grid">
        {agreement.observations
          .filter((observation) => observation.scope === 'global_asset_market' && observation.acceptedForPrimaryDisplay)
          .map((observation) => (
            <article key={`${observation.provider}-${observation.providerAssetId || 'asset'}`}>
              <header><strong>{observation.provider}</strong><span>{observation.observedAt ? formatV2Date(observation.observedAt) : 'Time unavailable'}</span></header>
              <dl>
                <div><dt>Price</dt><dd>{displayMetric(observation.fields.currentPrice, 'usd')}</dd></div>
                <div><dt>Market cap</dt><dd>{displayMetric(observation.fields.marketCap, 'usd', true)}</dd></div>
                <div><dt>FDV</dt><dd>{displayMetric(observation.fields.fullyDilutedValuation, 'usd', true)}</dd></div>
                <div><dt>Supply</dt><dd>{displayMetric(observation.fields.circulatingSupply, 'number', true)}</dd></div>
              </dl>
            </article>
          ))}
      </div>
      <V2InsightList items={agreement.disagreementReasons} emptyText="No material like-for-like provider disagreement is attached." tone="caution" />
      <p className="v2-boundary-copy">Comparable provider values remain separate. Pair-level DEX data is excluded from global market agreement and no values are silently averaged.</p>
    </V2Disclosure>
  )
}

function MarketSupplyInterpretation({ model }) {
  const view = model.boundedInterpretation
  return (
    <section className="v2-mls-interpretation" aria-labelledby="v2-mls-interpretation-title">
      <div className="v2-mls-interpretation__lead">
        <p className="v2-eyebrow">Institutional interpretation</p>
        <h3 id="v2-mls-interpretation-title">{safeProductText(view.strongestSupportedMarketConclusion, 'Current coverage supports only a bounded market and supply view.')}</h3>
        <p>{safeProductText(view.marketStructureView, 'Market structure interpretation is unavailable.')}</p>
      </div>
      <div className="v2-mls-interpretation__grid">
        <article><span>Liquidity view</span><strong>{safeProductText(view.liquidityView, 'Unavailable')}</strong></article>
        <article><span>Supply view</span><strong>{safeProductText(view.supplyView, 'Unavailable')}</strong></article>
        <article className="v2-mls-interpretation__risk"><span>Primary supported risk</span><strong>{safeProductText(view.primaryMarketOrSupplyRisk, 'No source-backed risk conclusion is available.')}</strong></article>
        <article className="v2-mls-interpretation__unknown"><span>Critical unknown</span><strong>{safeProductText(view.criticalMarketOrSupplyUnknown, 'No additional critical unknown is attached.')}</strong></article>
      </div>
      <V2Disclosure label="What this data does not prove" summary={`${view.whatTheDataDoesNotProve.length} analytical boundaries`} quiet>
        <V2InsightList items={safeProductList(view.whatTheDataDoesNotProve)} emptyText="No additional analytical boundary is attached." />
      </V2Disclosure>
    </section>
  )
}

function MissingDataAndDiligence({ model }) {
  return (
    <section className="v2-mls-missing" aria-labelledby="v2-mls-missing-title">
      <header>
        <div><p className="v2-eyebrow">Open diligence</p><h3 id="v2-mls-missing-title">What is missing, why it matters, and what to inspect next</h3></div>
        <V2StatusPill label={`${model.missingData.length} open field${model.missingData.length === 1 ? '' : 's'}`} status={model.missingData.length ? 'partial' : 'available'} />
      </header>
      {model.missingData.length ? (
        <div className="v2-mls-missing-grid">
          {model.missingData.slice(0, 8).map((item) => (
            <article key={item.fieldId}>
              <span>{item.label}</span>
              <strong>{safeProductText(item.reasonUnavailable, 'Current measurement unavailable.')}</strong>
              <p>{safeProductText(item.analyticalImpact, 'The current conclusion remains bounded.')}</p>
              <small>Next: {safeProductText(item.nextRequiredSourceOrMeasurement, 'Attach a canonical measurement.')}</small>
            </article>
          ))}
        </div>
      ) : <V2CompactState icon="check" title="No critical field gap is attached" message="Current canonical coverage supports this bounded presentation. Source and interpretation limits still apply." />}
      <V2Disclosure label="Full next-diligence queue" summary={`${model.nextDiligence.length} prioritized check${model.nextDiligence.length === 1 ? '' : 's'}`} quiet>
        <V2InsightList items={model.nextDiligence} emptyText="No additional market or supply diligence item is attached." />
      </V2Disclosure>
    </section>
  )
}

export default function V2MarketLiquiditySupplyExperience({ result }) {
  const model = useMemo(() => normalizeMarketLiquiditySupplyV2(result), [result])
  return (
    <section className="v2-mls-experience" aria-labelledby="v2-mls-title">
      <V2SectionHeading
        eyebrow="Market, liquidity & supply"
        title="Market structure with the measurement boundary intact"
        description="Current global facts, direct history, venue-level liquidity, supply structure, monetary change, and open diligence in one canonical workspace."
        action={<div className="v2-mls-heading-status"><V2StatusPill label={model.labels.providerAgreement} status={model.providerAgreement.overallState} /><V2StatusPill label={model.labels.freshness} status={model.marketOverview.freshnessState} /></div>}
      />

      <section className="v2-mls-overview" aria-label="Current market overview">
        <MarketMetric label="Price" metric={model.marketOverview.currentPrice} kind="usd" featured />
        <MarketMetric label="Market cap" metric={model.marketOverview.marketCap} kind="usd" compact />
        <MarketMetric label="FDV" metric={model.marketOverview.fullyDilutedValuation} kind="usd" compact />
        <MarketMetric label="24h volume" metric={model.marketOverview.volume24h} kind="usd" compact />
        <MarketMetric label="Circulating" metric={model.marketOverview.circulatingSupply} compact />
        <MarketMetric label="24h move" metric={model.marketOverview.priceChange24h} kind="percent" detail="Provider-reported global price window" />
        <div className="v2-mls-overview__quality">
          <span>Data quality</span>
          <strong>{model.labels.providerAgreement}</strong>
          <small>{model.providerAgreement.comparableProviderCount} comparable source{model.providerAgreement.comparableProviderCount === 1 ? '' : 's'} / {model.labels.freshness}</small>
        </div>
      </section>

      <div className="v2-mls-workspace">
        <HistoricalMarketContext model={model} />
        <LiquidityQualityPanel model={model} />
        <SupplyStructurePanel model={model} />
        <DilutionIssuanceUnlockPanel model={model} />
      </div>

      <MarketSupplyInterpretation model={model} />
      <MissingDataAndDiligence model={model} />

      <div className="v2-mls-audit-layer">
        <ProviderQualityDisclosure model={model} />
        <V2Disclosure label="Provenance and methodology limits" summary="Canonical owners, measurement scope, and unavailable states" quiet>
          <div className="v2-mls-provenance-grid">
            {model.provenance.map((item) => (
              <article key={item.sourcePath}>
                <strong>{item.measurementScope}</strong>
                <p>{item.boundary}</p>
              </article>
            ))}
          </div>
          <V2InsightList items={model.limitations} emptyText="No additional limitation is attached." tone="caution" />
        </V2Disclosure>
      </div>
    </section>
  )
}
