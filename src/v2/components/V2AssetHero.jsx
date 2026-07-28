import React from 'react'
import {
  formatV2Date,
  formatV2Number,
  humanizeV2Value,
  safeProductText,
} from '../assetResearchResultV2'
import { V2Icon, V2StatusPill } from './V2Primitives'

export default function V2AssetHero({ result }) {
  const decision = result.decision.data
  const sourceHealth = result.sourceHealth.data
  const scoreVisible = typeof decision.displayedScore === 'number' && Number.isFinite(decision.displayedScore)
  const risk = safeProductText(decision.weakestArea) || result.risks.data.primaryBlocker
  const support = safeProductText(decision.strongestSupport) || result.fundamentals.data.strongestSupportedArea

  return (
    <section className="v2-hero" aria-labelledby="v2-decision-title">
      <div className="v2-hero__ambient" aria-hidden="true" />
      <div className="v2-hero__decision-grid">
        <div className="v2-decision-panel">
          <div className="v2-decision-panel__top">
            <span><V2Icon name="compass" size={17} /> ThesisCore decision</span>
            <V2StatusPill label={decision.confidenceLabel ? `${humanizeV2Value(decision.confidenceLabel)} confidence` : 'Confidence unavailable'} status={decision.confidenceLabel} />
          </div>
          <div className="v2-decision-panel__headline">
            <h2 id="v2-decision-title">{decision.verdictLabel || 'Decision pending'}</h2>
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
