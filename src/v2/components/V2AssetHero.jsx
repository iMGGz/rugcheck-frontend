import React from 'react'
import {
  finiteMetricValue,
  formatV2Date,
  formatV2Number,
  formatV2Percent,
  formatV2Usd,
  humanizeV2Value,
  safeProductText,
} from '../assetResearchResultV2'
import { V2Icon, V2StatusPill } from './V2Primitives'

export default function V2AssetHero({ result }) {
  const identity = result.identity.data
  const representation = result.representation.data
  const classification = result.classification.data
  const market = result.market.data
  const decision = result.decision.data
  const sourceHealth = result.sourceHealth.data
  const price = finiteMetricValue(market.currentPrice)
  const change24h = finiteMetricValue(market.priceChange?.twentyFourHourPercent)
  const scoreVisible = typeof decision.displayedScore === 'number' && Number.isFinite(decision.displayedScore)
  const risk = safeProductText(decision.weakestArea) || result.risks.data.primaryBlocker
  const support = safeProductText(decision.strongestSupport) || result.fundamentals.data.strongestSupportedArea

  return (
    <section className="v2-hero" aria-labelledby="v2-asset-title">
      <div className="v2-hero__ambient" aria-hidden="true" />
      <div className="v2-hero__identity-row">
        <div className="v2-asset-mark">
          {identity.logo ? <img src={identity.logo} alt="" /> : <span>{(identity.symbol || identity.name || '?').slice(0, 1)}</span>}
        </div>
        <div className="v2-hero__identity-copy">
          <div className="v2-hero__labels">
            <V2StatusPill label={classification.canonicalFamilyLabel || 'Family classification pending'} status={result.classification.status} tone="info" />
            {representation.representationType && representation.representationType !== 'native_asset' ? (
              <V2StatusPill label={humanizeV2Value(representation.representationType)} status={result.representation.status} tone="neutral" />
            ) : null}
          </div>
          <h1 id="v2-asset-title">{identity.name || 'Canonical asset'} <span>{identity.symbol || ''}</span></h1>
          <p>{safeProductText(classification.assetFraming, 'Canonical asset framing is still being verified.')}</p>
        </div>
        <div className="v2-hero__price">
          <span>Live market reference</span>
          <strong>{formatV2Usd(price)}</strong>
          {change24h !== null ? (
            <small className={change24h > 0 ? 'is-positive' : change24h < 0 ? 'is-negative' : ''}>
              {change24h > 0 ? '+' : ''}{formatV2Percent(change24h)} / 24h
            </small>
          ) : <small>24h change unavailable</small>}
        </div>
      </div>

      <div className="v2-hero__decision-grid">
        <div className="v2-decision-panel">
          <div className="v2-decision-panel__top">
            <span><V2Icon name="compass" size={17} /> ThesisCore decision</span>
            <V2StatusPill label={decision.confidenceLabel ? `${humanizeV2Value(decision.confidenceLabel)} confidence` : 'Confidence unavailable'} status={decision.confidenceLabel} />
          </div>
          <div className="v2-decision-panel__headline">
            <h2>{decision.verdictLabel || 'Decision pending'}</h2>
            {scoreVisible ? <div><strong>{formatV2Number(decision.displayedScore, { maximumFractionDigits: 0 })}</strong><span>/100</span></div> : <span className="v2-score-withheld">Score withheld</span>}
          </div>
          <p>{safeProductText(decision.decisionSummary, 'The current evidence does not support a complete decision summary yet.')}</p>
          <div className="v2-decision-panel__meta">
            <span><V2Icon name="clock" size={15} /> Updated {formatV2Date(result.generatedAt)}</span>
            <span><V2Icon name="source" size={15} /> {humanizeV2Value(sourceHealth.providerCoverageStatus, 'Coverage unavailable')}</span>
          </div>
        </div>

        <div className="v2-hero-insight v2-hero-insight--support">
          <span><V2Icon name="shield" size={17} /> Strongest supported point</span>
          <p>{safeProductText(support, 'No strongest supported point is attached yet.')}</p>
        </div>
        <div className="v2-hero-insight v2-hero-insight--risk">
          <span><V2Icon name="risk" size={17} /> Most important risk</span>
          <p>{safeProductText(risk, 'The primary risk requires further evidence.')}</p>
        </div>
      </div>
    </section>
  )
}
