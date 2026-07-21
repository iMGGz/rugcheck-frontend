import React from 'react'
import {
  finiteMetricValue,
  formatV2Date,
  formatV2Number,
  formatV2Percent,
  formatV2Ratio,
  formatV2Usd,
  humanizeV2Value,
  safeProductText,
} from '../assetResearchResultV2'
import { V2Disclosure, V2MetricCard, V2SectionHeading, V2StatusPill } from './V2Primitives'

function displayMetric(metric, kind = 'number', compact = false) {
  const value = finiteMetricValue(metric)
  if (kind === 'usd') return formatV2Usd(value, { compact })
  if (kind === 'percent') return formatV2Percent(value)
  return formatV2Number(value, { compact })
}

function visualWidth(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return `${Math.max(2, Math.min(100, value))}%`
}

function FormulaPreview({ formula }) {
  if (!formula) return <span>Diagnostic not available</span>
  return <span>{formula.displayedValue || formula.display || 'Result unavailable'}</span>
}

export function V2ProtocolEconomicsSummary({ result }) {
  const section = result.protocolEconomics
  const data = section.data
  const metrics = [
    ['TVL', data.tvl],
    ['Fees / 24h', data.fees24h],
    ['Revenue / 30d', data.revenue30d],
    ['Protocol volume / 24h', data.volume24h],
    ['Active loans', data.activeLoans],
  ].filter(([, metric]) => finiteMetricValue(metric) !== null)
  const hasNarrative = safeProductText(data.protocolUsage?.summary) || safeProductText(data.economicActivity?.summary)
  if (section.status === 'not_applicable' || (!metrics.length && !hasNarrative)) return null
  return (
    <section className="v2-protocol-summary">
      <div className="v2-protocol-summary__header">
        <div><p className="v2-eyebrow">Protocol economics</p><h2>Activity is not the same as token accrual</h2></div>
        <V2StatusPill status={section.status} />
      </div>
      {metrics.length ? (
        <div className="v2-protocol-summary__metrics">
          {metrics.map(([label, metric]) => <div key={label}><span>{label}</span><strong>{displayMetric(metric, 'usd', true)}</strong></div>)}
        </div>
      ) : null}
      {hasNarrative ? <p>{hasNarrative}</p> : null}
      <p className="v2-boundary-copy">Protocol activity describes the mapped protocol. It does not, by itself, establish tokenholder revenue or economic rights.</p>
    </section>
  )
}

export default function V2MarketSupplyDashboard({ result }) {
  const market = result.market.data
  const tokenomics = result.tokenomics.data
  const liquidity = result.liquidity.data
  const fdvRatio = tokenomics.fdvToMarketCap
  const circulatingPercent = tokenomics.circulatingPercentOfMax
  const formulas = tokenomics.formulaOutputs || []
  const volumeRatio = formulas.find((formula) => /volume.*market.?cap/i.test(`${formula.formulaId} ${formula.label}`) && formula.status === 'computed')
  const fdvBarWidth = typeof fdvRatio === 'number' && fdvRatio > 0 ? visualWidth(100 / fdvRatio) : null
  const supplyBarWidth = visualWidth(circulatingPercent)

  return (
    <section className="v2-market-dashboard" aria-labelledby="v2-market-title">
      <V2SectionHeading
        eyebrow="Market and supply"
        title="Current position, without synthetic history"
        description="Canonical provider facts and backend-derived supply diagnostics. Pair-level liquidity remains separate from global market data."
      />
      <div className="v2-metric-grid">
        <V2MetricCard label="Current price" value={displayMetric(market.currentPrice, 'usd')} detail={market.currentPrice?.provider ? `Reported by ${market.currentPrice.provider}` : 'Provider unavailable'} accent />
        <V2MetricCard label="Market capitalization" value={displayMetric(market.marketCap, 'usd', true)} detail="Current provider-reported market value" />
        <V2MetricCard label="Fully diluted value" value={displayMetric(market.fullyDilutedValuation, 'usd', true)} detail={fdvRatio !== null ? `${formatV2Ratio(fdvRatio)} market cap` : 'Ratio unavailable'} />
        <V2MetricCard label="24-hour volume" value={displayMetric(market.volume24h, 'usd', true)} detail={<FormulaPreview formula={volumeRatio} />} />
        <V2MetricCard label="Market rank" value={displayMetric(market.marketRank)} detail="Provider-specific global rank" />
        <V2MetricCard label="Circulating supply" value={displayMetric(market.circulatingSupply, 'number', true)} detail={result.identity.data.symbol || 'tokens'} />
        <V2MetricCard label="Total supply" value={displayMetric(market.totalSupply, 'number', true)} detail={result.identity.data.symbol || 'tokens'} />
        <V2MetricCard label="Maximum supply" value={displayMetric(market.maxSupply, 'number', true)} detail={tokenomics.maxSupplySemantics ? humanizeV2Value(tokenomics.maxSupplySemantics.semanticClassification) : 'Semantics unavailable'} />
      </div>

      <div className="v2-ratio-grid">
        <article className="v2-ratio-card">
          <div className="v2-ratio-card__header"><span>Market cap versus FDV</span><strong>{formatV2Ratio(fdvRatio)}</strong></div>
          <div className="v2-ratio-track" aria-label={fdvRatio === null ? 'FDV ratio unavailable' : `Market cap is represented against an FDV ratio of ${formatV2Ratio(fdvRatio)}`}>
            {fdvBarWidth ? <span style={{ width: fdvBarWidth }} /> : null}
          </div>
          <p>{fdvRatio === null ? 'The backend could not calculate this relationship from valid current inputs.' : 'Current market capitalization shown as a share of fully diluted valuation.'}</p>
        </article>
        <article className="v2-ratio-card">
          <div className="v2-ratio-card__header"><span>Circulating supply</span><strong>{formatV2Percent(circulatingPercent)}</strong></div>
          <div className="v2-ratio-track v2-ratio-track--supply" aria-label={circulatingPercent === null ? 'Circulating percentage unavailable' : `${formatV2Percent(circulatingPercent)} of maximum supply is circulating`}>
            {supplyBarWidth ? <span style={{ width: supplyBarWidth }} /> : null}
          </div>
          <p>Remaining dilution: {formatV2Percent(tokenomics.remainingDilution)}</p>
        </article>
        <article className="v2-ratio-card v2-ratio-card--liquidity">
          <div className="v2-ratio-card__header"><span>Liquidity context</span><V2StatusPill label={humanizeV2Value(liquidity.liquidityCoverage)} status={result.liquidity.status} /></div>
          <strong>{liquidity.pairLiquidity ? displayMetric(liquidity.pairLiquidity, 'usd', true) : 'No validated pair depth'}</strong>
          <p>{liquidity.mappedVenueCount ? `${liquidity.mappedVenueCount} mapped venue${liquidity.mappedVenueCount === 1 ? '' : 's'}` : 'Venue coverage unavailable'}; pair context is not global depth.</p>
        </article>
      </div>

      {(market.providerDisagreements?.length || market.comparisonDiagnostics?.some((entry) => entry.comparisonStatus === 'material_disagreement')) ? (
        <V2Disclosure label="Data sources disagree" summary="Comparable values differ; sources remain separate with no averaging.">
          <div className="v2-provider-comparison">
            {market.providerComparison.filter((row) => row.scope === 'global_asset' || !row.scope).map((row) => (
              <div key={`${row.provider}-${row.providerAssetId || 'asset'}`}>
                <strong>{row.provider}</strong>
                <span>Price {formatV2Usd(row.currentPrice)}</span>
                <span>Market cap {formatV2Usd(row.marketCap, { compact: true })}</span>
                <span>FDV {formatV2Usd(row.fullyDilutedValuation, { compact: true })}</span>
                <small>{row.observedAt ? `Observed ${formatV2Date(row.observedAt)}` : 'Observation time unavailable'}</small>
              </div>
            ))}
          </div>
          <p className="v2-boundary-copy">Values remain separate. The backend selects a canonical display value and does not silently average providers.</p>
        </V2Disclosure>
      ) : null}
      <V2ProtocolEconomicsSummary result={result} />
    </section>
  )
}
