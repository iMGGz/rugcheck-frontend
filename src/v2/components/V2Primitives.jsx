import React, { useId, useState } from 'react'
import {
  humanizeV2Value,
  safeProductList,
  safeProductText,
  sectionPresentation,
} from '../assetResearchResultV2'

export function V2Icon({ name, size = 18, label = null }) {
  const paths = {
    arrow: <path d="m5 12 5 5L20 7" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.4-3.4" /></>,
    shield: <><path d="M12 3 5 6v5c0 4.8 2.9 8.2 7 10 4.1-1.8 7-5.2 7-10V6l-7-3Z" /><path d="m9.5 12 1.7 1.7 3.6-4" /></>,
    pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
    source: <><circle cx="7" cy="12" r="3" /><circle cx="17" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="m9.7 10.7 4.6-2.4M9.7 13.3l4.6 2.4" /></>,
    risk: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
  }
  return (
    <svg
      aria-hidden={label ? undefined : 'true'}
      aria-label={label || undefined}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.layers}
    </svg>
  )
}

export function V2StatusPill({ status, label, tone }) {
  const resolvedLabel = label || sectionPresentation(status)
  const resolvedTone = tone || (
    status === 'available' || status === 'fresh' || status === 'high' ? 'positive'
      : status === 'manual_review_required' || status === 'contradicted' ? 'negative'
        : status === 'partial' || status === 'degraded' || status === 'medium' ? 'caution'
          : status === 'not_applicable' ? 'neutral'
            : 'info'
  )
  return <span className={`v2-status-pill v2-status-pill--${resolvedTone}`}>{resolvedLabel}</span>
}

export function V2SectionHeading({ eyebrow, title, description, action = null }) {
  return (
    <header className="v2-section-heading">
      <div>
        {eyebrow ? <p className="v2-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </header>
  )
}

export function V2MetricCard({ label, value, detail, eyebrow, status, accent = false, children = null }) {
  return (
    <article className={`v2-metric-card${accent ? ' v2-metric-card--accent' : ''}`}>
      <div className="v2-metric-card__top">
        <span>{eyebrow || label}</span>
        {status ? <V2StatusPill status={status} /> : null}
      </div>
      <div className="v2-metric-card__value" title={typeof value === 'string' ? value : undefined}>{value}</div>
      {detail ? <p className="v2-metric-card__detail">{detail}</p> : null}
      {children}
    </article>
  )
}

export function V2InsightList({ items, emptyText = 'No additional detail is available.', limit = 5, tone = 'neutral' }) {
  const safeItems = safeProductList(items, limit)
  if (!safeItems.length) return <p className="v2-empty-copy">{emptyText}</p>
  return (
    <ul className={`v2-insight-list v2-insight-list--${tone}`}>
      {safeItems.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
    </ul>
  )
}

export function V2Disclosure({ label, summary, children, defaultOpen = false, quiet = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const contentId = useId()
  return (
    <div className={`v2-disclosure${quiet ? ' v2-disclosure--quiet' : ''}`}>
      <button
        type="button"
        className="v2-disclosure__trigger"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>
          <strong>{label}</strong>
          {summary ? <small>{summary}</small> : null}
        </span>
        <span className="v2-disclosure__action">
          {open ? 'Hide details' : 'View details'}
          <span className={`v2-disclosure__chevron${open ? ' is-open' : ''}`}><V2Icon name="chevron" size={16} /></span>
        </span>
      </button>
      {open ? <div className="v2-disclosure__content" id={contentId}>{children}</div> : null}
    </div>
  )
}

export function V2AnswerCard({ answer }) {
  const directAnswer = safeProductText(answer?.directAnswer || answer?.answer, 'The current evidence does not support a direct answer yet.')
  const support = safeProductList(answer?.whatTheDataSupports || answer?.evidenceBehindIt, 5)
  const limits = safeProductList(answer?.whatTheDataDoesNotProve, 5)
  const missing = safeProductList(answer?.missingData, 5)
  const next = safeProductText(answer?.whatWouldChangeTheView)
  return (
    <article className="v2-answer-card">
      <div className="v2-answer-card__header">
        <div>
          <p className="v2-eyebrow">Institutional question</p>
          <h3>{safeProductText(answer?.question, 'Research question')}</h3>
        </div>
        <V2StatusPill label={humanizeV2Value(answer?.answerState, 'Evidence limited')} status={answer?.answerState} />
      </div>
      <p className="v2-answer-card__answer">{directAnswer}</p>
      <V2Disclosure label="Evidence and limits" summary="Inspect what supports the answer and what remains open." quiet>
        <div className="v2-answer-grid">
          <div><h4>Data used</h4><V2InsightList items={answer?.evidenceBehindIt} emptyText="No eligible observation is attached." /></div>
          <div><h4>What it supports</h4><V2InsightList items={support} emptyText="No supported conclusion is attached." tone="positive" /></div>
          <div><h4>What it does not prove</h4><V2InsightList items={limits} emptyText="No additional boundary is attached." tone="caution" /></div>
          <div><h4>Missing analysis</h4><V2InsightList items={missing} emptyText="No additional missing input is attached." tone="caution" /></div>
        </div>
        {next ? <div className="v2-next-step"><span>What would change the view</span><p>{next}</p></div> : null}
      </V2Disclosure>
    </article>
  )
}

export function V2CompactState({ icon = 'compass', title, message, children = null }) {
  return (
    <section className="v2-compact-state" role="status">
      <span className="v2-compact-state__icon"><V2Icon name={icon} size={24} /></span>
      <div><h2>{title}</h2><p>{message}</p>{children}</div>
    </section>
  )
}
