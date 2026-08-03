import React, { useMemo } from 'react'
import {
  formatV2Date,
  formatV2Number,
  formatV2Percent,
  formatV2Usd,
  humanizeV2Value,
} from '../assetResearchResultV2'
import {
  normalizeAssetDecisionCommandCenterV2,
} from '../assetDecisionCommandCenterV2'
import { V2Icon, V2StatusPill } from './V2Primitives'
import V2ProductResearchSummary from './V2ProductResearchSummary'

function Metric({ label, value, type = 'usd' }) {
  const display = type === 'percent'
    ? formatV2Percent(value, { maximumFractionDigits: 2 })
    : type === 'number'
      ? formatV2Number(value, { compact: true, maximumFractionDigits: 2 })
      : formatV2Usd(value, { compact: type === 'compact-usd' })
  return (
    <div className="v2-command-metric">
      <dt>{label}</dt>
      <dd>{display}</dd>
    </div>
  )
}

function SynthesisRow({ icon, label, value, tone }) {
  return (
    <div className={`v2-command-synthesis__row${tone ? ` is-${tone}` : ''}`}>
      <span className="v2-command-synthesis__icon"><V2Icon name={icon} size={16} /></span>
      <div>
        <h3>{label}</h3>
        <p>{value}</p>
      </div>
    </div>
  )
}

export default function V2AssetDecisionCommandCenter({
  result,
  productResearchResultV2,
  activeSection,
  onSelectSection,
}) {
  const model = useMemo(() => normalizeAssetDecisionCommandCenterV2(result), [result])
  const { identity, currentMarket, decision, confidence, evidenceCoverage, freshness, synthesis } = model
  const scoreVisible = decision.scoreValue !== null
  const priceChange = currentMarket.priceChange24h.value

  return (
    <section className="v2-command-center" aria-labelledby="v2-asset-command-title">
      <div className="v2-command-center__ambient" aria-hidden="true" />
      <header className="v2-command-identity">
        <div className="v2-command-identity__main">
          <div className="v2-command-identity__mark" aria-hidden="true">
            {identity.logo ? <img src={identity.logo} alt="" /> : <span>{(identity.symbol || identity.displayName).slice(0, 1)}</span>}
          </div>
          <div>
            <p className="v2-eyebrow">Institutional asset decision</p>
            <h1 id="v2-asset-command-title">{identity.displayName} <span>{identity.symbol}</span></h1>
            <div className="v2-command-identity__labels">
              <strong>{identity.assetRoleLabel}</strong>
              <span>{identity.representationLabel}</span>
              <span>{identity.network}</span>
            </div>
          </div>
        </div>
        <div className="v2-command-status">
          <V2StatusPill label={freshness.label} status={freshness.status} />
          <V2StatusPill label={evidenceCoverage.label} status={evidenceCoverage.state} />
          <small>{model.generatedAt ? `Updated ${formatV2Date(model.generatedAt)}` : 'Update time unavailable'}</small>
        </div>
      </header>

      <dl className="v2-command-market" aria-label="Current market snapshot">
        <Metric label="Price" value={currentMarket.currentPrice.value} />
        <Metric label="Market cap" value={currentMarket.marketCap.value} type="compact-usd" />
        <Metric label="FDV" value={currentMarket.fullyDilutedValuation.value} type="compact-usd" />
        <Metric label="24h volume" value={currentMarket.volume24h.value} type="compact-usd" />
        <div className="v2-command-metric">
          <dt>24h change</dt>
          <dd className={priceChange > 0 ? 'is-positive' : priceChange < 0 ? 'is-negative' : ''}>
            {formatV2Percent(priceChange, { maximumFractionDigits: 2 })}
          </dd>
        </div>
        <div className="v2-command-metric v2-command-metric--source">
          <dt>Market sources</dt>
          <dd>{currentMarket.providerAgreement.label}</dd>
        </div>
      </dl>

      <div className="v2-command-center__body">
        <article className="v2-command-decision">
          <div className="v2-command-section-label"><V2Icon name="compass" size={16} /> Current institutional decision</div>
          <div className="v2-command-decision__headline">
            <div>
              <h2>{decision.verdictLabel}</h2>
              <p>{decision.conciseReason}</p>
            </div>
            <div className="v2-command-score">
              <span>Score state</span>
              {scoreVisible ? (
                <strong>{formatV2Number(decision.scoreValue, { maximumFractionDigits: 0 })}<small>/100</small></strong>
              ) : (
                <strong className="is-withheld">Withheld</strong>
              )}
              <small>{scoreVisible ? 'Existing score policy' : decision.scoreWithheldReason}</small>
            </div>
          </div>

          <div className="v2-command-assurance">
            <div>
              <span>Analysis confidence</span>
              <strong>{confidence.label}{confidence.value === null ? '' : ` / ${formatV2Number(confidence.value, { maximumFractionDigits: 0 })}`}</strong>
              <small>{confidence.explanation}</small>
            </div>
            <div>
              <span>Evidence coverage</span>
              <strong>{evidenceCoverage.label}</strong>
              <small>{evidenceCoverage.missingEvidenceCount === null
                ? evidenceCoverage.explanation
                : `${evidenceCoverage.missingEvidenceCount} critical evidence gap${evidenceCoverage.missingEvidenceCount === 1 ? '' : 's'} / ${evidenceCoverage.explanation}`}</small>
            </div>
          </div>

          <p className="v2-command-boundary"><V2Icon name="shield" size={14} /> {decision.researchBoundary}</p>
        </article>

        <article className="v2-command-synthesis">
          <div className="v2-command-section-label"><V2Icon name="source" size={16} /> Thesis, risk, and decision boundary</div>
          <div className="v2-command-synthesis__thesis">
            <span>Institutional thesis</span>
            <p>{synthesis.institutionalThesis}</p>
          </div>
          <SynthesisRow icon="shield" label="Strongest supported conclusion" value={synthesis.strongestSupportedConclusion} tone="support" />
          <SynthesisRow icon="risk" label="Primary supported risk" value={synthesis.primarySupportedRisk} tone="risk" />
          <SynthesisRow icon="search" label="Critical unknown" value={synthesis.criticalUnknown} tone="unknown" />
          <SynthesisRow icon="compass" label="What would change the view" value={synthesis.whatWouldChangeTheView} />
        </article>
      </div>

      <footer className="v2-command-footer">
        <div>
          <span>{identity.assetClassLabel}</span>
          <span>{identity.representationLabel}</span>
          <span>{humanizeV2Value(identity.identityConfidence, 'Identity confidence unavailable')} identity confidence</span>
        </div>
        <p>{model.productTokenBoundary.detail}</p>
      </footer>

      <V2ProductResearchSummary productResearchResultV2={productResearchResultV2} variant="decision" />

      <nav className="v2-command-nav" aria-label="Asset research sections">
        {model.sectionNavigation.map((section) => (
          <button
            key={section.id}
            type="button"
            aria-current={activeSection === section.id ? 'page' : undefined}
            onClick={() => onSelectSection(section)}
          >
            <span>{section.label}</span>
            {activeSection === section.id ? <small>Current section</small> : null}
          </button>
        ))}
      </nav>
    </section>
  )
}
