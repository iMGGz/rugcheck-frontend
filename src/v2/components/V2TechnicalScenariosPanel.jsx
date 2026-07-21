import React, { useMemo, useState } from 'react'
import {
  formatV2Date,
  formatV2Number,
  formatV2Percent,
  formatV2Usd,
  humanizeV2Value,
  safeProductText,
} from '../assetResearchResultV2'
import { V2CompactState, V2Disclosure, V2InsightList, V2SectionHeading, V2StatusPill } from './V2Primitives'

const HORIZONS = [
  ['daily', 'Daily'],
  ['weekly', 'Weekly'],
  ['macro', 'Macro'],
]
const SERIES = [
  ['price', 'Price'],
  ['marketCap', 'Market cap'],
]

function finite(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function usablePoints(points) {
  return Array.isArray(points)
    ? points.filter((point) => finite(point?.value) !== null && point?.timestamp && !Number.isNaN(Date.parse(point.timestamp)))
    : []
}

// This is coordinate transformation only; all analytical levels come from the backend contract.
function chartGeometry(points, width = 920, height = 330) {
  const safePoints = usablePoints(points)
  if (safePoints.length < 2) return null
  const padding = { top: 22, right: 20, bottom: 34, left: 20 }
  const values = safePoints.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || Math.max(Math.abs(max), 1)
  const x = (index) => padding.left + (index / (safePoints.length - 1)) * (width - padding.left - padding.right)
  const y = (value) => padding.top + ((max - value) / span) * (height - padding.top - padding.bottom)
  return {
    width,
    height,
    min,
    max,
    y,
    path: safePoints.map((point, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(2)} ${y(point.value).toFixed(2)}`).join(' '),
    area: `${safePoints.map((point, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(2)} ${y(point.value).toFixed(2)}`).join(' ')} L ${x(safePoints.length - 1).toFixed(2)} ${(height - padding.bottom).toFixed(2)} L ${x(0).toFixed(2)} ${(height - padding.bottom).toFixed(2)} Z`,
    first: safePoints[0],
    last: safePoints[safePoints.length - 1],
  }
}

function formatSeriesValue(value, mode) {
  return mode === 'marketCap' ? formatV2Usd(value, { compact: true }) : formatV2Usd(value)
}

function TechnicalChart({ points, levels, mode, horizon, status }) {
  const geometry = useMemo(() => chartGeometry(points), [points])
  if (!geometry) {
    return (
      <div className="v2-technical-chart-empty" role="status">
        <span>Historical series unavailable</span>
        <strong>No chart is drawn without at least two valid backend observations.</strong>
      </div>
    )
  }
  const visibleLevels = (Array.isArray(levels) ? levels : [])
    .filter((level) => finite(level?.value) !== null && level.value >= geometry.min && level.value <= geometry.max)
    .slice(0, 8)
  return (
    <figure className="v2-technical-chart">
      <div className="v2-technical-chart__heading">
        <div><span>{horizon} / {mode === 'marketCap' ? 'market-cap history' : 'price history'}</span><strong>{formatSeriesValue(geometry.last.value, mode)}</strong></div>
        <V2StatusPill label={humanizeV2Value(status, 'Unavailable')} status={status} />
      </div>
      <div className="v2-technical-chart__canvas">
        <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} role="img" aria-label={`${humanizeV2Value(horizon)} ${mode === 'marketCap' ? 'market capitalization' : 'price'} structure chart`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`v2-technical-area-${mode}-${horizon}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => <line key={ratio} className="v2-technical-chart__grid" x1="20" x2="900" y1={22 + ratio * 274} y2={22 + ratio * 274} />)}
          {visibleLevels.map((level) => (
            <g key={`${level.ratio}-${level.value}`}>
              <line className="v2-technical-chart__level" x1="20" x2="900" y1={geometry.y(level.value)} y2={geometry.y(level.value)} />
              <text className="v2-technical-chart__level-label" x="895" y={Math.max(13, geometry.y(level.value) - 4)} textAnchor="end">{level.ratio} / {formatSeriesValue(level.value, mode)}</text>
            </g>
          ))}
          <path className="v2-technical-chart__area" d={geometry.area} fill={`url(#v2-technical-area-${mode}-${horizon})`} />
          <path className="v2-technical-chart__line" d={geometry.path} />
        </svg>
      </div>
      <figcaption><span>{formatV2Date(geometry.first.timestamp, { includeTime: false })}</span><span>Backend-owned close-only observations; no OHLC candles are synthesized.</span><span>{formatV2Date(geometry.last.timestamp, { includeTime: false })}</span></figcaption>
    </figure>
  )
}

function StructureCard({ structure, mode, horizon }) {
  const low = structure?.selectedLowAnchor
  const high = structure?.selectedHighAnchor
  return (
    <article className="v2-technical-structure-card">
      <header><div><span>{humanizeV2Value(horizon)} structure</span><h3>{safeProductText(structure?.conciseSummary, 'Structure is not available for this horizon.')}</h3></div><V2StatusPill label={humanizeV2Value(structure?.structureStatus, 'Unavailable')} status={structure?.confidence} /></header>
      <dl>
        <div><dt>Selected low</dt><dd>{formatSeriesValue(low?.value, mode)}</dd><small>{low?.timestamp ? formatV2Date(low.timestamp, { includeTime: false }) : 'No audited anchor'}</small></div>
        <div><dt>Selected high</dt><dd>{formatSeriesValue(high?.value, mode)}</dd><small>{high?.timestamp ? formatV2Date(high.timestamp, { includeTime: false }) : 'No audited anchor'}</small></div>
        <div><dt>Range position</dt><dd>{formatV2Percent(structure?.currentRangePosition, { fraction: true })}</dd><small>Selected structural range</small></div>
        <div><dt>ATH drawdown</dt><dd>{formatV2Percent(structure?.drawdownFromAth, { fraction: true })}</dd><small>Close-only history</small></div>
      </dl>
      <p>{safeProductText(structure?.invalidationCondition, 'No deterministic invalidation level is available.')}</p>
    </article>
  )
}

function FibonacciTable({ set, mode }) {
  const levels = Array.isArray(set?.levels) ? set.levels : []
  return (
    <V2Disclosure
      label={`${mode === 'marketCap' ? 'Market-cap' : 'Price'} Fibonacci levels`}
      summary={set?.status === 'computed' ? `${levels.length} backend-calculated references` : 'Valid ordered anchors are required'}
      quiet
    >
      {levels.length ? (
        <div className="v2-fibonacci-table" role="table" aria-label={`${mode} Fibonacci levels`}>
          <div className="v2-fibonacci-table__head" role="row"><span>Ratio</span><span>Level</span><span>Position</span><span>Confidence</span></div>
          {levels.map((level) => (
            <div key={`${level.horizon}-${level.ratio}`} role="row">
              <strong>{formatV2Number(level.ratio, { maximumFractionDigits: 3 })}</strong>
              <span>{formatSeriesValue(level.value, mode)}</span>
              <span>{humanizeV2Value(level.aboveOrBelowCurrent)}</span>
              <span>{humanizeV2Value(level.confidence)}</span>
            </div>
          ))}
        </div>
      ) : <p className="v2-empty-copy">{safeProductText(set?.limitations?.[0], 'No valid Fibonacci set is attached.')}</p>}
      <p className="v2-boundary-copy">Formula convention: level = low anchor + (high anchor - low anchor) x ratio. Levels are references, not guaranteed support, targets, or forecasts.</p>
    </V2Disclosure>
  )
}

function ScenarioCard({ scenario }) {
  const available = finite(scenario?.lowerBoundPrice) !== null && finite(scenario?.upperBoundPrice) !== null
  return (
    <article className="v2-scenario-card">
      <header><div><span>Modeled range</span><h3>{safeProductText(scenario?.displayName, 'Scenario')}</h3></div><V2StatusPill label={humanizeV2Value(scenario?.status)} status={scenario?.status} /></header>
      <div className="v2-scenario-card__range"><strong>{available ? `${formatV2Usd(scenario.lowerBoundPrice)} - ${formatV2Usd(scenario.upperBoundPrice)}` : 'Range unavailable'}</strong><span>{available ? `${formatV2Percent(scenario.impliedUpsideRange?.lower, { fraction: true })} to ${formatV2Percent(scenario.impliedUpsideRange?.upper, { fraction: true })}` : 'Insufficient deterministic confluence'}</span></div>
      <dl><div><dt>Supply basis</dt><dd>{safeProductText(scenario?.supplyBasis, 'Unavailable')}</dd></div><div><dt>Confluence</dt><dd>{formatV2Number(scenario?.confluenceCount, { fallback: 'Unavailable' })}</dd></div></dl>
      <p>{safeProductText(scenario?.evidenceBoundary, 'Modeled scenario range; not a prediction or recommendation.')}</p>
    </article>
  )
}

export default function V2TechnicalScenariosPanel({ result, initialHorizon = 'daily', initialSeries = 'price' }) {
  const section = result?.technicalStructure || { status: 'unavailable', data: {} }
  const data = section.data || {}
  const engine = data.bullPotential || null
  const history = result?.historicalMarketData?.data || data.historicalMarketData || engine?.historicalMarketData || null
  const [horizon, setHorizon] = useState(HORIZONS.some(([id]) => id === initialHorizon) ? initialHorizon : 'daily')
  const [seriesMode, setSeriesMode] = useState(SERIES.some(([id]) => id === initialSeries) ? initialSeries : 'price')
  const seriesKey = seriesMode === 'marketCap' ? 'marketCap' : 'price'
  const structure = seriesMode === 'marketCap' ? data.marketCapStructure?.[horizon] : data.priceStructure?.[horizon]
  const horizonSeries = engine?.horizonSeries?.[seriesKey]?.[horizon]
  const fibonacciSets = seriesMode === 'marketCap' ? data.marketCapFibonacci : data.priceFibonacci
  const fibonacciSet = Array.isArray(fibonacciSets) ? fibonacciSets.find((entry) => entry.horizon === horizon) : null
  const scenarios = Array.isArray(data.scenarioValuation) ? data.scenarioValuation : engine?.scenarioValuations || []
  const projectedSupply = engine?.projectedSupplyScenarios || result?.valuation?.data?.projectedSupply?.data || []
  const confluence = Array.isArray(data.confluenceZones) ? data.confluenceZones : []
  const availableHistory = usablePoints(horizonSeries?.points).length >= 2
  const stablecoinNotApplicable = scenarios.length > 0 && scenarios.every((scenario) => scenario.status === 'not_applicable')

  return (
    <div className="v2-tab-panel__inner v2-technical-shell">
      <V2SectionHeading
        eyebrow="Technical structure & bounded scenarios"
        title="Historical structure before upside arithmetic"
        description="Canonical provider history, auditable anchors, backend-owned Fibonacci references, supply-aware implied prices, and bounded scenario ranges."
        action={<V2StatusPill status={section.status} />}
      />

      <section className="v2-technical-command" aria-label="Technical summary">
        <div className="v2-technical-command__lead"><span>Current read</span><h3>{safeProductText(engine?.structureSummary || data.technicalState?.summary, 'Canonical historical coverage is not sufficient for a technical structure yet.')}</h3><p>{safeProductText(engine?.primaryTechnicalRisk, 'Historical coverage and scenario inputs remain the primary constraints.')}</p></div>
        <dl>
          <div><dt>History</dt><dd>{humanizeV2Value(history?.coverage, 'Unavailable')}</dd></div>
          <div><dt>Quote</dt><dd>{history?.quoteCurrency || 'Unavailable'}</dd></div>
          <div><dt>Projected supply</dt><dd>{humanizeV2Value(engine?.projectedSupplyReadiness, 'Unavailable')}</dd></div>
          <div><dt>Confidence</dt><dd>{humanizeV2Value(engine?.confidence?.label, 'Unavailable')}</dd></div>
        </dl>
      </section>

      <div className="v2-technical-toolbar" aria-label="Technical chart controls">
        <div role="group" aria-label="Series"><span>Series</span>{SERIES.map(([id, label]) => <button key={id} type="button" aria-pressed={seriesMode === id} onClick={() => setSeriesMode(id)}>{label}</button>)}</div>
        <div role="group" aria-label="Horizon"><span>Horizon</span>{HORIZONS.map(([id, label]) => <button key={id} type="button" aria-pressed={horizon === id} onClick={() => setHorizon(id)}>{label}</button>)}</div>
      </div>
      {engine?.reviewedAnchorOverride ? <p className="v2-technical-reviewed-note"><V2StatusPill label="Reviewed anchors" status="available" /> Approved reviewed anchors are active; automatic candidates remain available in audit.</p> : null}

      {availableHistory ? (
        <>
          <TechnicalChart points={horizonSeries.points} levels={fibonacciSet?.levels} mode={seriesMode} horizon={horizon} status={horizonSeries.structureStatus} />
          <StructureCard structure={structure} mode={seriesMode} horizon={horizon} />
          <FibonacciTable set={fibonacciSet} mode={seriesMode} />
        </>
      ) : (
        <V2CompactState icon="pulse" title="Historical structure is not available" message={safeProductText(history?.providerFailure?.reason || history?.limitations?.[0], 'A canonically identified provider history with enough valid observations is required.')} />
      )}

      <section className="v2-technical-scenarios" aria-labelledby="v2-scenario-heading">
        <header><div><p className="v2-eyebrow">Bull-potential synthesis</p><h2 id="v2-scenario-heading">Four bounded scenario tiers</h2><p>{stablecoinNotApplicable ? 'Directional bull-price scenarios are not applicable to peg-underwriting.' : 'Ranges appear only when backend-owned confluence supports them; no tier carries a probability.'}</p></div><V2StatusPill label={stablecoinNotApplicable ? 'Not applicable' : `${scenarios.filter((item) => item.status !== 'unavailable').length} ranges`} status={stablecoinNotApplicable ? 'not_applicable' : section.status} /></header>
        <div className="v2-scenario-grid">{scenarios.length ? scenarios.map((scenario) => <ScenarioCard key={scenario.scenarioId} scenario={scenario} />) : <V2CompactState icon="layers" title="Scenario ranges unavailable" message="No deterministic scenario object is attached. The frontend does not create one." />}</div>
      </section>

      <div className="v2-technical-detail-grid">
        <V2Disclosure label="Projected supply and dilution basis" summary={`${Array.isArray(projectedSupply) ? projectedSupply.length : 0} canonical horizon state${projectedSupply?.length === 1 ? '' : 's'}`}>
          {Array.isArray(projectedSupply) && projectedSupply.length ? <div className="v2-supply-scenario-table">{projectedSupply.map((item) => <div key={item.horizon}><strong>{humanizeV2Value(item.horizon)}</strong><span>{item.projectedCirculatingSupply === null ? humanizeV2Value(item.status) : formatV2Number(item.projectedCirculatingSupply, { compact: true })}</span><small>{safeProductText(item.projectionMethod, 'Projection method unavailable')}</small></div>)}</div> : <p className="v2-empty-copy">Canonical projected circulating supply is unavailable.</p>}
          <p className="v2-boundary-copy">Unlock events are not automatically added to projected circulating supply. Current-supply implied prices are not dilution-adjusted.</p>
        </V2Disclosure>
        <V2Disclosure label="Confluence and invalidation" summary={`${confluence.length} deterministic zone${confluence.length === 1 ? '' : 's'}`}>
          <div className="v2-confluence-list">{confluence.slice(0, 8).map((zone) => <article key={zone.zoneId}><strong>{formatV2Usd(zone.lowerBound)} - {formatV2Usd(zone.upperBound)}</strong><span>{humanizeV2Value(zone.strength)} / {zone.independentSourceCount} independent references</span></article>)}</div>
          <V2InsightList items={engine?.invalidationConditions} emptyText="No deterministic invalidation condition is attached." tone="caution" />
        </V2Disclosure>
      </div>

      <V2Disclosure label="Methodology, provenance, and limitations" summary="Inspect source scope without exposing engine internals in the main view." quiet>
        <div className="v2-question-detail-grid">
          <div><h4>Provenance</h4><V2InsightList items={engine?.provenance} emptyText="Historical provenance is unavailable." /></div>
          <div><h4>Missing critical data</h4><V2InsightList items={engine?.missingCriticalData} emptyText="No additional critical gap is attached." tone="caution" /></div>
          <div><h4>Next diligence</h4><V2InsightList items={engine?.nextDiligence} emptyText="No additional diligence step is attached." /></div>
          <div><h4>Limits</h4><V2InsightList items={engine?.limitations || history?.limitations} emptyText="No additional limitation is attached." tone="caution" /></div>
        </div>
        {engine?.reviewedAnchorOverride ? <p className="v2-boundary-copy">Reviewed anchor override: {humanizeV2Value(engine.reviewedAnchorOverride.validationResult)}. Automatic anchor candidates remain preserved for audit.</p> : null}
      </V2Disclosure>
    </div>
  )
}
