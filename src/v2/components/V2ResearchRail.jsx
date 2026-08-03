import React from 'react'
import {
  formatV2Date,
  formatV2Number,
  humanizeV2Value,
  safeProductList,
  safeProductText,
} from '../assetResearchResultV2'
import { V2Icon, V2InsightList, V2StatusPill } from './V2Primitives'
import V2ProductResearchSummary from './V2ProductResearchSummary'

function RailModule({ icon, title, children }) {
  return (
    <section className="v2-rail-module">
      <h3><V2Icon name={icon} size={16} /> {title}</h3>
      {children}
    </section>
  )
}

export default function V2ResearchRail({ result, productResearchResultV2 }) {
  const decision = result.decision.data
  const risks = result.risks.data
  const thesis = result.thesis.data
  const fundamentals = result.fundamentals.data
  const evidence = result.evidenceSummary.data
  const sourceHealth = result.sourceHealth.data
  const scoreVisible = typeof decision.displayedScore === 'number' && Number.isFinite(decision.displayedScore)
  const strengths = safeProductList([decision.strongestSupport, fundamentals.strongestSupportedArea, ...result.risks.whatIsSupported], 3)

  return (
    <aside className="v2-research-rail" aria-label="Research summary">
      <section className="v2-rail-decision">
        <span>Decision</span>
        <strong>{decision.verdictLabel || 'Pending'}</strong>
        <div>
          <V2StatusPill label={decision.confidenceLabel ? `${humanizeV2Value(decision.confidenceLabel)} confidence` : 'Confidence unavailable'} status={decision.confidenceLabel} />
          {scoreVisible ? <span className="v2-rail-score">{formatV2Number(decision.displayedScore, { maximumFractionDigits: 0 })}/100</span> : <span className="v2-rail-score v2-rail-score--withheld">Score withheld</span>}
        </div>
      </section>

      <RailModule icon="shield" title="Top strengths">
        <V2InsightList items={strengths} limit={3} emptyText="No primary strength is sufficiently supported yet." tone="positive" />
      </RailModule>
      <RailModule icon="risk" title="Top risks">
        <V2InsightList items={risks.topRisks} limit={3} emptyText="No ranked risk is attached." tone="caution" />
      </RailModule>
      <RailModule icon="source" title="Missing critical evidence">
        <V2InsightList items={risks.missingCriticalEvidence} limit={4} emptyText="No critical evidence gap is attached." />
      </RailModule>
      <RailModule icon="pulse" title="Thesis invalidation">
        <V2InsightList items={thesis.invalidationConditions} limit={3} emptyText="No explicit invalidation condition is attached." tone="caution" />
      </RailModule>
      <RailModule icon="compass" title="Next diligence">
        <V2InsightList items={decision.nextDiligence} limit={4} emptyText="No next diligence step is attached." />
      </RailModule>
      <RailModule icon="clock" title="Source freshness">
        <p className="v2-rail-copy">{sourceHealth.lastSuccessfulObservation ? `Latest usable observation: ${formatV2Date(sourceHealth.lastSuccessfulObservation)}` : 'No provider observation time is available.'}</p>
        <V2StatusPill label={humanizeV2Value(sourceHealth.providerCoverageStatus, 'Coverage unavailable')} status={result.sourceHealth.status} />
      </RailModule>
      <RailModule icon="layers" title="Data coverage">
        <p className="v2-rail-copy">{safeProductText(evidence.evidenceBoundarySummary, 'Evidence coverage is still being assembled.')}</p>
        <div className="v2-coverage-counts">
          <span><strong>{evidence.providerFactCount}</strong> provider facts</span>
          <span><strong>{evidence.derivedMetricCount}</strong> derived metrics</span>
          <span><strong>{evidence.missingCriticalEvidenceCount}</strong> open checks</span>
        </div>
      </RailModule>
      <V2ProductResearchSummary productResearchResultV2={productResearchResultV2} variant="readiness" />
    </aside>
  )
}
