import React from 'react'
import { humanizeV2Value, safeProductList, safeProductText } from '../assetResearchResultV2'
import { V2Disclosure, V2InsightList, V2StatusPill } from './V2Primitives'

function displayFactValue(value) {
  if (value === null || value === undefined || value === '') return 'Not available'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'Not available'
  if (typeof value === 'string' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    const visible = value.filter((item) => ['string', 'number', 'boolean'].includes(typeof item)).slice(0, 5)
    return visible.length ? visible.join(', ') : 'Structured value available'
  }
  return 'Structured value available'
}

function ProductQuestion({ question }) {
  return (
    <V2Disclosure
      label={safeProductText(question?.question, 'Institutional product question')}
      summary={safeProductText(question?.answer, 'The required product facts are not available yet.')}
      quiet
    >
      <div className="v2-product-question-grid">
        <div><h4>Support</h4><V2InsightList items={safeProductList(question?.supportSummary, 5)} emptyText="No source-scoped support is attached." /></div>
        <div><h4>Limits</h4><V2InsightList items={safeProductList(question?.limitations, 5)} emptyText="No additional limitation is attached." tone="caution" /></div>
        <div><h4>Missing data</h4><V2InsightList items={safeProductList(question?.missingData, 5)} emptyText="No missing input is attached." /></div>
        <div><h4>Next evidence</h4><V2InsightList items={safeProductList(question?.nextRequiredEvidence, 5)} emptyText="No next evidence requirement is attached." /></div>
      </div>
    </V2Disclosure>
  )
}

export default function V2ProductResearchSummary({ productResearchResultV2, variant = 'questions' }) {
  const presentation = productResearchResultV2?.customerPresentation
  if (!presentation) return null

  if (variant === 'decision') {
    return (
      <section className="v2-product-contract-summary" aria-label="Institutional product analysis scope">
        <div>
          <span>Product analysis</span>
          <strong>{humanizeV2Value(presentation.entityHeader?.universe)} / {humanizeV2Value(presentation.entityHeader?.cohort)}</strong>
        </div>
        <div><span>Data coverage</span><strong>{humanizeV2Value(productResearchResultV2.coverage?.coverageState)}</strong></div>
        <div><span>Data confidence</span><strong>{humanizeV2Value(productResearchResultV2.dataConfidence?.confidenceState)}</strong></div>
        <div><span>Future scoring readiness</span><strong>{humanizeV2Value(presentation.futureScoringReadinessState)}</strong></div>
      </section>
    )
  }

  if (variant === 'market') {
    return (
      <V2Disclosure label="Canonical product facts" summary={`${presentation.currentFacts?.length || 0} source-scoped fact${presentation.currentFacts?.length === 1 ? '' : 's'}`} quiet>
        <div className="v2-product-fact-grid">
          {(presentation.currentFacts || []).slice(0, 10).map((fact, index) => (
            <article key={`${fact.label}-${index}`}>
              <span>{safeProductText(fact.label, 'Product fact')}</span>
              <strong>{displayFactValue(fact.value)}</strong>
              <small>{humanizeV2Value(fact.state)} / {safeProductText(fact.sourceStatus, 'Source status unavailable')}</small>
            </article>
          ))}
        </div>
      </V2Disclosure>
    )
  }

  if (variant === 'sources') {
    return (
      <V2Disclosure label="Product evidence status" summary={presentation.sourceAndFreshnessStatus?.[0] || 'Source status available in details'} quiet>
        <div className="v2-product-question-grid">
          <div><h4>Source and freshness</h4><V2InsightList items={safeProductList(presentation.sourceAndFreshnessStatus, 6)} emptyText="No product source summary is attached." /></div>
          <div><h4>Missing evidence</h4><V2InsightList items={safeProductList(presentation.missingEvidence, 8)} emptyText="No missing product evidence is attached." tone="caution" /></div>
          <div><h4>Contradictions</h4><V2InsightList items={safeProductList(presentation.contradictions, 6)} emptyText="No product contradiction is attached." tone="caution" /></div>
          <div><h4>What would change</h4><V2InsightList items={safeProductList(presentation.whatWouldChange, 8)} emptyText="No upgrade requirement is attached." /></div>
        </div>
      </V2Disclosure>
    )
  }

  if (variant === 'readiness') {
    return (
      <section className="v2-product-readiness">
        <h3>Product analysis readiness</h3>
        <div><V2StatusPill label={humanizeV2Value(productResearchResultV2.coverage?.coverageState)} status={productResearchResultV2.coverage?.coverageState} /><span>Coverage</span></div>
        <div><V2StatusPill label={humanizeV2Value(presentation.futureScoringReadinessState)} status="partial" /><span>Future scoring</span></div>
        <div><V2StatusPill label={humanizeV2Value(presentation.futureRankingReadinessState)} status="partial" /><span>Future ranking</span></div>
      </section>
    )
  }

  return (
    <section className="v2-product-question-surface">
      <header>
        <div><p className="v2-eyebrow">Canonical product analysis</p><h3>Institutional product questions</h3></div>
        <V2StatusPill label={humanizeV2Value(productResearchResultV2.coverage?.coverageState)} status={productResearchResultV2.coverage?.coverageState} />
      </header>
      <p>{safeProductText(presentation.productStructure?.[0], 'Product structure remains bounded by canonical identity and relationship evidence.')}</p>
      <div className="v2-question-stack">
        {(presentation.institutionalQuestions || []).map((question, index) => <ProductQuestion key={`${question.question}-${index}`} question={question} />)}
      </div>
    </section>
  )
}
