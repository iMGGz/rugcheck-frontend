import React from 'react'
import {
  finiteMetricValue,
  formatV2Date,
  formatV2Number,
  formatV2Usd,
  humanizeV2Value,
  safeProductList,
} from '../assetResearchResultV2'
import { V2Disclosure, V2InsightList, V2StatusPill } from './V2Primitives'
import V2ProductResearchSummary from './V2ProductResearchSummary'

function metricObservation(label, metric) {
  if (!metric || finiteMetricValue(metric) === null) return null
  return { label, metric }
}

export default function V2SourcesPanel({ result, productResearchResultV2 }) {
  const market = result.market.data
  const health = result.sourceHealth.data
  const observations = [
    metricObservation('Current price', market.currentPrice),
    metricObservation('Market capitalization', market.marketCap),
    metricObservation('Fully diluted valuation', market.fullyDilutedValuation),
    metricObservation('24-hour volume', market.volume24h),
    metricObservation('Circulating supply', market.circulatingSupply),
    metricObservation('Maximum supply', market.maxSupply),
  ].filter(Boolean)
  return (
    <section className="v2-sources-panel">
      <V2ProductResearchSummary productResearchResultV2={productResearchResultV2} variant="sources" />
      <V2Disclosure
        label="Sources & methodology"
        summary={`${health.availableProviders.length} available provider${health.availableProviders.length === 1 ? '' : 's'} / ${health.fieldDisagreementCount} field disagreement${health.fieldDisagreementCount === 1 ? '' : 's'}`}
      >
        <div className="v2-sources-summary">
          <div>
            <span>Provider coverage</span>
            <V2StatusPill label={humanizeV2Value(health.providerCoverageStatus)} status={result.sourceHealth.status} />
          </div>
          <div><span>Latest observation</span><strong>{formatV2Date(health.lastSuccessfulObservation)}</strong></div>
          <div><span>Oldest used observation</span><strong>{formatV2Date(health.oldestUsedObservation)}</strong></div>
        </div>
        <div className="v2-source-grid">
          {observations.map(({ label, metric }) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{metric.currency === 'USD' || metric.unit?.includes('usd') ? formatV2Usd(metric.value, { compact: metric.unit === 'usd' }) : formatV2Number(metric.value, { compact: true })}</strong>
              <small>{metric.provider || 'Provider unavailable'} / {humanizeV2Value(metric.validationState, 'Validation unavailable')}</small>
              <small>{metric.observedAt ? formatV2Date(metric.observedAt) : 'Observation time unavailable'}</small>
            </article>
          ))}
        </div>
        <div className="v2-source-columns">
          <div><h3>Available sources</h3><V2InsightList items={health.availableProviders} emptyText="No active provider is attached." /></div>
          <div><h3>Coverage limitations</h3><V2InsightList items={safeProductList(health.sourceLimitations, 5)} emptyText="No additional source limitation is attached." tone="caution" /></div>
        </div>
        <p className="v2-boundary-copy">Provider observations, derived metrics, and reviewed evidence retain distinct provenance. Missing provider coverage limits the analysis; it is not negative evidence about the asset.</p>
      </V2Disclosure>
    </section>
  )
}
