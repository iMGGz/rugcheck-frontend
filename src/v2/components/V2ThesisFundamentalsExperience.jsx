import React from 'react'
import {
  formatV2Date,
  humanizeV2Value,
  safeProductText,
} from '../assetResearchResultV2'
import { normalizeThesisFundamentalsV2 } from '../thesisFundamentalsV2'
import {
  V2Disclosure,
  V2InsightList,
  V2StatusPill,
} from './V2Primitives'

function Status({ block }) {
  return <V2StatusPill label={block.stateLabel} status={block.state} />
}

function EvidenceDetail({ block }) {
  return (
    <V2Disclosure
      label="Evidence and open checks"
      summary={`${block.supportingEvidence.length} support / ${block.openChecks.length} open`}
      quiet
    >
      <div className="v2-tf-evidence-grid">
        <div>
          <h4>What supports this view</h4>
          <V2InsightList items={block.supportingEvidence} emptyText="No stronger supporting conclusion is attached." tone="positive" />
        </div>
        <div>
          <h4>What remains open</h4>
          <V2InsightList items={block.openChecks} emptyText={block.state === 'not_applicable' ? 'Not relevant for this asset family.' : 'No additional open check is attached.'} tone="caution" />
        </div>
        <div>
          <h4>Limits</h4>
          <V2InsightList items={block.limitations} emptyText="No additional limitation is attached." />
        </div>
      </div>
    </V2Disclosure>
  )
}

function ResearchPanel({ eyebrow, title, block, children, className = '' }) {
  return (
    <section className={`v2-tf-panel ${className}`.trim()}>
      <header className="v2-tf-panel__header">
        <div>
          <p className="v2-eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        <Status block={block} />
      </header>
      <p className="v2-tf-panel__summary">{safeProductText(block.summary, 'Current evidence does not support a stronger conclusion.')}</p>
      {children}
      <EvidenceDetail block={block} />
    </section>
  )
}

function MetricStrip({ metrics }) {
  const visible = Array.isArray(metrics)
    ? metrics.filter((metric) => metric?.displayValue && metric.displayValue !== 'Unavailable').slice(0, 6)
    : []
  if (!visible.length) return <p className="v2-tf-empty">No canonically scoped usage or economic metric is available.</p>
  return (
    <div className="v2-tf-metrics" role="list" aria-label="Scoped fundamental observations">
      {visible.map((metric) => (
        <article key={`${metric.fieldId}-${metric.period || 'current'}`} role="listitem">
          <span>{safeProductText(metric.label, 'Observation')}</span>
          <strong>{safeProductText(metric.displayValue, 'Unavailable')}</strong>
          <small>{[metric.period, metric.provider].filter(Boolean).join(' / ') || 'Canonical source attached'}</small>
          <p>{safeProductText(metric.scope, 'Scope requires verification.')}</p>
        </article>
      ))}
    </div>
  )
}

function FundamentalsUnavailable({ message }) {
  return (
    <div className="v2-tab-panel__inner v2-tf-experience">
      <section className="v2-tf-unavailable" role="status">
        <p className="v2-eyebrow">Thesis & Fundamentals</p>
        <h2>Fundamental analysis is unavailable</h2>
        <p>{message || 'The canonical presentation did not pass its identity and analytical-boundary checks.'}</p>
        <strong>Run a fresh canonical analysis before interpreting this asset.</strong>
      </section>
    </div>
  )
}

export default function V2ThesisFundamentalsExperience({ result }) {
  let model
  try {
    model = normalizeThesisFundamentalsV2(result)
  } catch (error) {
    return <FundamentalsUnavailable message={error instanceof Error ? error.message : null} />
  }

  const thesis = model.institutionalThesis
  const assetModel = model.assetOrBusinessModel
  const adoption = model.adoptionAndUsage
  const economics = model.economicActivity
  const competition = model.competitionAndPositioning
  const moat = model.moatAndDurability
  const execution = model.executionAndOrganization
  const governance = model.governanceAndOperationalControl
  const legal = model.regulatoryLegalAndJurisdictionalStructure
  const treasury = model.treasuryAndFinancialResilience
  const dependencies = model.dependenciesAndConcentration
  const catalysts = model.catalysts
  const counter = model.counterThesis
  const falsification = model.falsificationConditions
  const economicMetrics = [
    ...adoption.metrics,
    ...economics.fees,
    ...economics.revenue,
    ...economics.protocolVolume,
    ...economics.tvl,
    ...economics.borrowing,
    ...economics.activeLoans,
  ]

  return (
    <div className="v2-tab-panel__inner v2-tf-experience">
      <section className="v2-tf-hero" aria-labelledby="v2-tf-title">
        <div className="v2-tf-hero__main">
          <p className="v2-eyebrow">Institutional thesis</p>
          <h2 id="v2-tf-title">{safeProductText(thesis.thesisSummary, 'A durable thesis is not supported yet.')}</h2>
          <p className="v2-tf-hero__mechanism">{safeProductText(thesis.thesisMechanism, model.assetRole.primaryUseCase)}</p>
          <div className="v2-tf-hero__badges">
            <V2StatusPill label={model.labels.status} status={model.status} />
            <V2StatusPill label={model.labels.confidence} status={model.confidence.label} />
            <V2StatusPill label={model.family.familyLabel} status="partial" />
          </div>
        </div>
        <aside className="v2-tf-hero__role">
          <span>What this asset is</span>
          <strong>{model.assetRole.roleLabel}</strong>
          <p>{model.assetRole.roleDescription}</p>
        </aside>
        <div className="v2-tf-hero__signals">
          <article className="is-positive">
            <span>Strongest supported view</span>
            <p>{safeProductText(thesis.strongestSupportingInterpretation, 'No strongest support is attached.')}</p>
          </article>
          <article className="is-caution">
            <span>Primary limitation</span>
            <p>{safeProductText(thesis.primaryLimitation, 'No primary limitation is attached.')}</p>
          </article>
          <article>
            <span>What changes the view</span>
            <p>{safeProductText(model.whatWouldChangeTheView.improve[0], 'No additional strengthening condition is attached.')}</p>
          </article>
        </div>
        <p className="v2-tf-hero__boundary">{thesis.confidenceBoundary}</p>
      </section>

      <ResearchPanel eyebrow="Operating model" title="What does the asset, network, issuer, or claim actually do?" block={assetModel} className="v2-tf-panel--model">
        <div className="v2-tf-model">
          <article><span>Value delivered</span><strong>{assetModel.valueDelivered}</strong></article>
          <article><span>Operating model</span><strong>{assetModel.operatingModel}</strong></article>
          <article><span>Revenue or fee model</span><strong>{assetModel.revenueOrFeeModel}</strong></article>
          <article><span>Security model</span><strong>{assetModel.securityModel}</strong></article>
        </div>
        <div className="v2-tf-model__participants">
          <div><h4>Primary users</h4><V2InsightList items={assetModel.primaryUsers} emptyText="Primary users are not established." /></div>
          <div><h4>Economic participants</h4><V2InsightList items={assetModel.customerOrParticipantTypes} emptyText="Economic participants are not established." /></div>
        </div>
      </ResearchPanel>

      <div className="v2-tf-split">
        <ResearchPanel eyebrow="Demand evidence" title="Is adoption measurable and durable?" block={adoption}>
          <dl className="v2-tf-state-grid">
            <div><dt>Adoption</dt><dd>{humanizeV2Value(adoption.adoptionClassification)}</dd></div>
            <div><dt>Recurring use</dt><dd>{adoption.recurringUsageSupported ? 'Supported' : 'Not established'}</dd></div>
            <div><dt>Incentive dependence</dt><dd>{adoption.incentiveDependenceKnown ? 'Measured' : 'Not established'}</dd></div>
            <div><dt>Trend</dt><dd>{adoption.trendSupported ? 'Supported' : 'Not established'}</dd></div>
          </dl>
          <p className="v2-tf-callout">{adoption.organicUsageConclusion}</p>
        </ResearchPanel>
        <ResearchPanel eyebrow="Economic engine" title="What creates measurable economic activity?" block={economics}>
          <dl className="v2-tf-state-grid">
            <div><dt>Mapping</dt><dd>{humanizeV2Value(economics.mappingStatus)}</dd></div>
            <div><dt>Revenue quality</dt><dd>{humanizeV2Value(economics.revenueQualityState)}</dd></div>
            <div><dt>Sustainability</dt><dd>{humanizeV2Value(economics.economicSustainability)}</dd></div>
            <div><dt>Period quality</dt><dd>{humanizeV2Value(economics.periodConsistency)}</dd></div>
          </dl>
          <p className="v2-tf-callout">{economics.protocolSuccessTokenSuccessBoundary}</p>
        </ResearchPanel>
      </div>

      <V2Disclosure
        label="Measured usage and economic observations"
        summary={`${economicMetrics.length} scoped observation${economicMetrics.length === 1 ? '' : 's'}`}
      >
        <MetricStrip metrics={economicMetrics} />
        <p className="v2-tf-boundary">Volume is not revenue. Revenue is not profit. Protocol success is not automatically tokenholder value.</p>
      </V2Disclosure>

      <section className="v2-tf-positioning">
        <header>
          <div><p className="v2-eyebrow">Position and durability</p><h3>Is the differentiation defensible?</h3></div>
          <Status block={moat} />
        </header>
        <div className="v2-tf-positioning__lead">
          <div><span>Competitive position</span><p>{competition.summary}</p></div>
          <div><span>Moat conclusion</span><p>{moat.summary}</p></div>
        </div>
        <div className="v2-tf-positioning__grid">
          <div><h4>Differentiation</h4><V2InsightList items={competition.differentiation} emptyText="No evidence-backed differentiation is attached." /></div>
          <div><h4>Defensible mechanisms</h4><V2InsightList items={[...moat.networkEffects, ...moat.switchingCosts, ...moat.dataMoat, ...moat.distributionMoat]} emptyText="No specific defensible mechanism is supported." tone="positive" /></div>
          <div><h4>Competitors and substitutes</h4><V2InsightList items={[...competition.directCompetitors, ...competition.indirectCompetitors, ...competition.substituteProducts]} emptyText="A source-backed competitive set is unavailable." /></div>
          <div><h4>Durability checks</h4><V2InsightList items={moat.openChecks} emptyText="No additional durability check is attached." tone="caution" /></div>
        </div>
        <p className="v2-tf-boundary">Market capitalization, price performance, category labels, integrations, and social visibility are not treated as a moat.</p>
      </section>

      <div className="v2-tf-split">
        <ResearchPanel eyebrow="Delivery" title="Can the organization execute?" block={execution}>
          <div className="v2-tf-execution">
            <div><h4>Delivered</h4><V2InsightList items={execution.deliveredMilestones} emptyText="No source-backed delivered milestone is attached." tone="positive" /></div>
            <div><h4>Proposed or unverified</h4><V2InsightList items={[...execution.proposedMilestones, ...execution.unverifiableMilestones]} emptyText="No proposed milestone is attached." tone="caution" /></div>
          </div>
        </ResearchPanel>
        <ResearchPanel eyebrow="Control" title="Who can change or interrupt the system?" block={governance}>
          <dl className="v2-tf-control">
            <div><dt>Governance model</dt><dd>{governance.governanceType}</dd></div>
            <div><dt>Voting role</dt><dd>{governance.tokenVotingRole}</dd></div>
            <div><dt>Security model</dt><dd>{governance.securityModel}</dd></div>
          </dl>
          <V2InsightList items={[...governance.adminAndUpgradeControls, ...governance.emergencyControls, ...governance.issuerControls]} emptyText="Control authority requires verification." tone="caution" />
        </ResearchPanel>
      </div>

      <div className="v2-tf-split">
        <ResearchPanel eyebrow="Legal structure" title="What rights and dependencies are enforceable?" block={legal}>
          <dl className="v2-tf-state-grid">
            <div><dt>Rights status</dt><dd>{humanizeV2Value(legal.rightsStatus)}</dd></div>
            <div><dt>Rights directness</dt><dd>{humanizeV2Value(legal.rightsDirectness)}</dd></div>
            <div><dt>Jurisdiction</dt><dd>{safeProductText(legal.jurisdiction[0], 'Not established')}</dd></div>
            <div><dt>Responsible entity</dt><dd>{safeProductText(legal.responsibleEntity[0], 'Not established')}</dd></div>
          </dl>
          <V2InsightList items={legal.rightsNotProven} emptyText="No additional legal boundary is attached." tone="caution" />
        </ResearchPanel>
        <ResearchPanel eyebrow="Financial resilience" title="What supports treasury and operating durability?" block={treasury}>
          <dl className="v2-tf-state-grid">
            <div><dt>Runway evidence</dt><dd>{treasury.runwayEvidenceAvailable ? 'Available' : 'Not available'}</dd></div>
            <div><dt>Spend evidence</dt><dd>{treasury.spendEvidenceAvailable ? 'Available' : 'Not available'}</dd></div>
          </dl>
          <V2InsightList items={treasury.treasuryControl} emptyText="Treasury control is not established." />
          <p className="v2-tf-callout">Treasury assets are not tokenholder assets, and token-denominated treasury value requires circularity context.</p>
        </ResearchPanel>
      </div>

      <ResearchPanel eyebrow="Concentration map" title="Which dependencies can weaken the thesis?" block={dependencies}>
        <div className="v2-tf-positioning__grid">
          <div><h4>Critical dependencies</h4><V2InsightList items={dependencies.criticalDependencies} emptyText="No additional dependency is attached." /></div>
          <div><h4>Upstream</h4><V2InsightList items={dependencies.upstreamDependencies} emptyText="Upstream dependencies require verification." /></div>
          <div><h4>Downstream</h4><V2InsightList items={dependencies.downstreamDependencies} emptyText="Downstream dependencies require verification." /></div>
          <div><h4>Concentration</h4><V2InsightList items={[...dependencies.concentrationRisks, ...dependencies.operatorOrValidatorConcentration]} emptyText="Concentration evidence is unavailable." tone="caution" /></div>
        </div>
      </ResearchPanel>

      <section className="v2-tf-falsification">
        <header>
          <div><p className="v2-eyebrow">Thesis discipline</p><h3>What could change or falsify the view?</h3></div>
          <Status block={falsification} />
        </header>
        <div className="v2-tf-falsification__lead">
          <article><span>Current thesis</span><p>{thesis.thesisSummary}</p></article>
          <article className="is-caution"><span>Strongest counter-thesis</span><p>{counter.counterThesisSummary}</p></article>
        </div>
        <div className="v2-tf-falsification__grid">
          <div><h4>What must remain true</h4><V2InsightList items={falsification.thesisConditions} emptyText="No supporting condition is attached." /></div>
          <div><h4>Observable falsification</h4><V2InsightList items={falsification.falsificationSignals} emptyText="No observable falsification condition is attached." tone="caution" /></div>
          <div><h4>Evidence-backed catalysts</h4><V2InsightList items={catalysts.verifiedCatalysts} emptyText="No catalyst is verified as realized." tone="positive" /></div>
          <div><h4>Announced or conditional</h4><V2InsightList items={catalysts.announcedOrConditionalCatalysts} emptyText="No conditional catalyst is attached." tone="caution" /></div>
        </div>
        <p className="v2-tf-boundary">Price movement alone is not a fundamental falsification condition. Announcements remain conditional until execution or measurable impact is evidenced.</p>
      </section>

      <section className="v2-tf-synthesis">
        <header><div><p className="v2-eyebrow">Analyst synthesis</p><h3>Supported strengths, risks, and open questions</h3></div></header>
        <div className="v2-tf-synthesis__grid">
          <article className="is-positive"><span>Strengths</span><V2InsightList items={model.strengths} emptyText="No source-bounded fundamental strength is attached." tone="positive" /></article>
          <article className="is-risk"><span>Fundamental risks</span><V2InsightList items={model.risks} emptyText="No supported fundamental risk is attached." tone="caution" /></article>
          <article className="is-unknown"><span>Critical unknowns</span><V2InsightList items={model.criticalUnknowns} emptyText="No additional critical unknown is attached." /></article>
        </div>
        <div className="v2-tf-change-grid">
          <div><h4>Would improve confidence</h4><V2InsightList items={model.whatWouldChangeTheView.improve} emptyText="No additional strengthening condition is attached." /></div>
          <div><h4>Would weaken confidence</h4><V2InsightList items={model.whatWouldChangeTheView.weaken} emptyText="No additional weakening condition is attached." tone="caution" /></div>
        </div>
      </section>

      <section className="v2-tf-evidence">
        <header>
          <div><p className="v2-eyebrow">Evidence quality</p><h3>What should the analyst verify next?</h3></div>
          <V2StatusPill label={humanizeV2Value(model.evidenceCoverage.state)} status={model.evidenceCoverage.state} />
        </header>
        <dl className="v2-tf-evidence__counts">
          <div><dt>Eligible evidence</dt><dd>{model.evidenceCoverage.eligibleEvidenceCount}</dd></div>
          <div><dt>Provider observations</dt><dd>{model.evidenceCoverage.providerFactCount}</dd></div>
          <div><dt>Reviewed evidence</dt><dd>{model.evidenceCoverage.reviewedEvidenceCount}</dd></div>
          <div><dt>Open critical claims</dt><dd>{model.evidenceCoverage.missingCriticalEvidenceCount}</dd></div>
        </dl>
        <div className="v2-tf-change-grid">
          <div><h4>Missing evidence</h4><V2InsightList items={model.missingEvidence} emptyText="No additional missing evidence is attached." tone="caution" /></div>
          <div><h4>Next diligence</h4><V2InsightList items={model.nextDiligence} emptyText="No additional diligence step is attached." /></div>
        </div>
        <V2Disclosure label="Provenance and section boundaries" summary={`${model.provenance.length} canonical owner${model.provenance.length === 1 ? '' : 's'}`}>
          <div className="v2-tf-provenance">
            {model.provenance.map((entry, index) => (
              <article key={`${entry.owner}-${index}`}>
                <strong>{entry.owner}</strong>
                <span>{entry.presentationUse}</span>
                <p>{entry.boundary}</p>
              </article>
            ))}
          </div>
          <V2InsightList items={Object.values(model.sectionBoundaries)} />
        </V2Disclosure>
        <p className="v2-tf-evidence__time">Generated {formatV2Date(model.generatedAt)}. Missing evidence is not treated as a negative finding.</p>
      </section>
    </div>
  )
}
