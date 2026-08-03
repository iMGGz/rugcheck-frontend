import React, { useId, useState } from 'react'
import {
  formatV2Date,
  formatV2Number,
  formatV2Percent,
  formatV2Ratio,
  formatV2Usd,
  humanizeV2Value,
  safeProductText,
} from '../assetResearchResultV2'
import {
  V2Disclosure,
  V2InsightList,
  V2SectionHeading,
  V2StatusPill,
} from './V2Primitives'
import V2TechnicalScenariosPanel from './V2TechnicalScenariosPanel'
import V2TokenomicsQualityExperience from './V2TokenomicsQualityExperience'
import V2ThesisFundamentalsExperience from './V2ThesisFundamentalsExperience'
import V2ProductResearchSummary from './V2ProductResearchSummary'

export const V2_RESEARCH_TABS = [
  { id: 'tokenomics', label: 'Tokenomics' },
  { id: 'fundamentals', label: 'Thesis & Fundamentals' },
  { id: 'reality', label: 'Current Reality' },
  { id: 'technical', label: 'Technical & Scenarios' },
]

function cleanFormulaDisplay(formula) {
  if (formula?.displayedValue && formula.displayedValue !== 'Unavailable') return formula.displayedValue
  if (formula?.display && formula.display !== 'Unavailable') return formula.display
  if (typeof formula?.result === 'number' && Number.isFinite(formula.result)) return formatV2Number(formula.result)
  return 'Data not available yet'
}

function FormulaCard({ formula, primary = false }) {
  const inputs = Array.isArray(formula.inputs) ? formula.inputs : []
  return (
    <article className={`v2-formula-card${primary ? ' v2-formula-card--primary' : ''}`}>
      <div className="v2-formula-card__header">
        <div><span>{formula.label || 'Derived metric'}</span><strong>{cleanFormulaDisplay(formula)}</strong></div>
        <V2StatusPill label={humanizeV2Value(formula.status, 'Unavailable')} status={formula.status === 'computed' ? 'available' : 'unavailable'} />
      </div>
      {safeProductText(formula.formula) ? <code>{formula.formula}</code> : null}
      <p>{safeProductText(formula.limitations?.[0] || formula.sourceRequirement, 'Calculated only when valid canonical inputs are available.')}</p>
      <V2Disclosure label="Inputs and provenance" summary={inputs.length ? `${inputs.length} backend input${inputs.length === 1 ? '' : 's'}` : 'No valid inputs attached'} quiet>
        {inputs.length ? (
          <div className="v2-formula-inputs">
            {inputs.map((input, index) => (
              <div key={`${input.name}-${index}`}>
                <span>{humanizeV2Value(input.name)}</span>
                <strong>{input.value === null ? 'Not available' : `${input.value}${input.unit ? ` ${input.unit}` : ''}`}</strong>
                <small>{input.provider ? `${input.provider}${input.observedAt ? ` / ${formatV2Date(input.observedAt)}` : ''}` : 'Source unavailable'}</small>
              </div>
            ))}
          </div>
        ) : <p className="v2-empty-copy">{safeProductText(formula.sourceRequirement, 'Additional source data is required.')}</p>}
      </V2Disclosure>
    </article>
  )
}

function TokenomicsQuestion({ question }) {
  return (
    <V2Disclosure
      label={safeProductText(question.question, 'Tokenomics question')}
      summary={safeProductText(question.answer, 'The current evidence does not support a direct answer yet.')}
    >
      <div className="v2-question-detail-grid">
        <div><h4>Data used</h4><V2InsightList items={question.dataUsed} emptyText="No source-bound input is attached." /></div>
        <div><h4>Formula or rule</h4><V2InsightList items={question.formulaOutputsUsed} emptyText="Rule-based answer; no formula is applicable." /></div>
        <div><h4>Missing evidence</h4><V2InsightList items={question.missingEvidence} emptyText="No additional missing evidence is attached." tone="caution" /></div>
        <div><h4>What would change</h4><V2InsightList items={question.whatWouldChange} emptyText="No change condition is attached." /></div>
      </div>
      {safeProductText(question.impact) ? <div className="v2-next-step"><span>Impact</span><p>{question.impact}</p></div> : null}
    </V2Disclosure>
  )
}

function TokenomicsDomainCard({ eyebrow, title, status, summary, rows = [], children = null, tone = 'neutral' }) {
  return (
    <article className={`v2-tokenomics-domain v2-tokenomics-domain--${tone}`}>
      <header>
        <div><span>{eyebrow}</span><h3>{title}</h3></div>
        <V2StatusPill status={status} />
      </header>
      {summary ? <p>{summary}</p> : null}
      {rows.length ? (
        <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      ) : null}
      {children}
    </article>
  )
}

function SupplyTruthDetail({ data }) {
  const observations = data.supplyTruth?.data?.observations || []
  const providerCandidates = data.supplyTruth?.data?.providerCandidates || []
  return (
    <V2Disclosure
      label="Supply definitions and provider provenance"
      summary={`${observations.length} source-bound observation${observations.length === 1 ? '' : 's'}; providers remain separate`}
    >
      <div className="v2-tokenomics-source-grid">
        {providerCandidates.map((candidate, index) => (
          <article key={`${candidate.provider}-${candidate.providerAssetId || index}`}>
            <div><strong>{candidate.provider}</strong><V2StatusPill label={humanizeV2Value(candidate.status)} status={candidate.status === 'available' ? 'available' : 'unavailable'} /></div>
            <p>{safeProductText(candidate.reason, 'Provider context is unavailable.')}</p>
            <small>{candidate.observedAt ? `Observed ${formatV2Date(candidate.observedAt)}` : 'Observation time unavailable'}</small>
          </article>
        ))}
      </div>
      <div className="v2-tokenomics-observations">
        {observations.slice(0, 12).map((observation) => (
          <div key={observation.observationId}>
            <span>{humanizeV2Value(observation.supplyType)}</span>
            <strong>{observation.value === null ? 'Unavailable' : `${formatV2Number(observation.value, { compact: true })} ${observation.unit}`}</strong>
            <small>{observation.provider || 'Provider unavailable'} / {safeProductText(observation.whatItDoesNotMeasure, 'Definition boundary unavailable')}</small>
          </div>
        ))}
      </div>
      <p className="v2-boundary-copy">CoinGecko and CoinMarketCap facts are preserved separately. Missing values are not zero, and no provider values are silently averaged.</p>
    </V2Disclosure>
  )
}

function LegacyTokenomicsPanel({ result }) {
  const section = result.tokenomics
  const data = section.data
  const formulas = data.formulaOutputs || []
  const deduped = formulas.filter((formula, index, list) => list.findIndex((entry) => entry.formulaId === formula.formulaId) === index)
  const primaryPattern = /fdv.*market|market.*discount|remaining.*dilution|potential.*float|circulating.*(?:max|total)|supply.?gap|unlock.*volume|unlock.*market|net.?issuance/i
  const primary = deduped.filter((formula) => primaryPattern.test(`${formula.formulaId} ${formula.label}`) && formula.status === 'computed').slice(0, 7)
  const secondary = deduped.filter((formula) => !primary.includes(formula))
  const supply = data.supplyStructure?.data || {}
  const dilution = data.dilution?.data || {}
  const issuance = data.issuance?.data || {}
  const burns = data.burns?.data || data.burn || {}
  const netSupply = data.netSupplyChange?.data || {}
  const unlocks = data.unlocks?.data || { events: [] }
  const vesting = data.vesting?.data || {}
  const allocations = data.allocations?.data || { categories: [] }
  const insider = data.insiderExposure?.data || {}
  const treasury = data.treasury?.data || {}
  const concentration = data.holderConcentration?.data || {}
  const utility = data.utilityMechanisms?.data || { mechanisms: [] }
  const demand = data.demandMechanisms?.data || { mechanisms: [] }
  const protocol = data.protocolSuccess?.data || {}
  const token = data.tokenSuccess?.data || {}
  const capture = data.valueCapture?.data || {}
  const circulatingWidth = typeof dilution.circulatingPercentOfMax === 'number' && Number.isFinite(dilution.circulatingPercentOfMax)
    ? `${Math.max(0, Math.min(100, dilution.circulatingPercentOfMax))}%`
    : null
  const availableUnlockEvents = Array.isArray(unlocks.events) ? unlocks.events : []
  const allocationCategories = Array.isArray(allocations.categories) ? allocations.categories : []
  const utilityMechanisms = Array.isArray(utility.mechanisms) ? utility.mechanisms : []
  return (
    <div className="v2-tab-panel__inner">
      <V2SectionHeading
        eyebrow="Tokenomics quality"
        title="Supply, dilution, ownership, and token economics"
        description="Canonical supply facts, backend-owned formulas, and explicit boundaries between protocol success and tokenholder value."
        action={<V2StatusPill status={section.status} />}
      />
      <div className="v2-tokenomics-command">
        <article><span>Supply truth</span><strong>{humanizeV2Value(data.supplyTruth?.status || data.supplyTruthStatus)}</strong></article>
        <article><span>Evidence confidence</span><strong>{humanizeV2Value(data.confidence?.label || data.tokenomicsEvidenceConfidence)}</strong></article>
        <article><span>Remaining dilution</span><strong>{formatV2Percent(dilution.remainingDilutionPercent ?? data.remainingDilution)}</strong></article>
        <article><span>Unlock coverage</span><strong>{humanizeV2Value(data.unlocks?.status || data.unlockCoverage)}</strong></article>
      </div>
      <div className="v2-signal-pair">
        <article className="is-positive"><span>Primary strength</span><p>{safeProductText(data.primaryTokenomicsStrength, 'No primary tokenomics strength is sufficiently supported.')}</p></article>
        <article className="is-caution"><span>Primary risk</span><p>{safeProductText(data.primaryTokenomicsRisk, 'No ranked tokenomics risk is attached.')}</p></article>
      </div>

      <section className="v2-tokenomics-supply" aria-labelledby="v2-tokenomics-supply-title">
        <div className="v2-tokenomics-section-title"><div><p className="v2-eyebrow">Supply and dilution</p><h3 id="v2-tokenomics-supply-title">How much exists, and what can still reach the market?</h3></div><V2StatusPill status={data.dilution?.status || section.status} /></div>
        <div className="v2-tokenomics-supply-grid">
          <article className="v2-supply-composition">
            <div className="v2-supply-composition__metrics">
              <div><span>Circulating</span><strong>{formatV2Number(supply.circulatingSupply, { compact: true })}</strong></div>
              <div><span>Total</span><strong>{formatV2Number(supply.totalSupply, { compact: true })}</strong></div>
              <div><span>Maximum</span><strong>{formatV2Number(supply.maximumSupply, { compact: true })}</strong></div>
            </div>
            <div className="v2-supply-bar" aria-label={circulatingWidth ? `${formatV2Percent(dilution.circulatingPercentOfMax)} of maximum supply is circulating` : 'Circulating share of maximum supply unavailable'}>
              {circulatingWidth ? <span style={{ width: circulatingWidth }} /> : null}
            </div>
            <div className="v2-supply-composition__footer"><span>Circulating / max {formatV2Percent(dilution.circulatingPercentOfMax)}</span><span>Remaining {formatV2Percent(dilution.remainingDilutionPercent)}</span></div>
            <p>{safeProductText(data.maxSupplySemantics?.reasoning?.[0], 'Maximum-supply semantics require source review; a missing maximum is not treated as infinite supply.')}</p>
          </article>
          <article className="v2-dilution-valuation">
            <span>Market value versus fully diluted value</span>
            <strong>{formatV2Ratio(dilution.fdvToMarketCap)}</strong>
            <p>FDV / market cap</p>
            <dl>
              <div><dt>Total minus circulating</dt><dd>{formatV2Number(dilution.supplyGapTotalMinusCirculating, { compact: true })}</dd></div>
              <div><dt>Max minus circulating</dt><dd>{formatV2Number(dilution.supplyGapMaxMinusCirculating, { compact: true })}</dd></div>
            </dl>
          </article>
        </div>
      </section>

      <section className="v2-protocol-token-separation">
        <header><div><p className="v2-eyebrow">Protocol versus token</p><h3>Protocol success does not automatically become token success</h3></div><V2StatusPill status={data.valueCapture?.status || 'unavailable'} /></header>
        <div className="v2-protocol-token-grid">
          <article><span>Protocol activity</span><strong>{humanizeV2Value(protocol.availability, 'Unavailable')}</strong><p>{safeProductText(protocol.summary, 'Mapped protocol activity is not available.')}</p></article>
          <article><span>Token necessity</span><strong>{humanizeV2Value(token.tokenNecessityStatus, 'Unverified')}</strong><p>Usage and governance do not prove mandatory token demand.</p></article>
          <article><span>Protocol-to-token transfer</span><strong>{humanizeV2Value(token.transferFromProtocolToTokenStatus, 'Unverified')}</strong><p>{safeProductText(token.conciseSummary, 'No direct transfer from protocol activity to tokenholder value is established.')}</p></article>
          <article><span>Value capture</span><strong>{humanizeV2Value(capture.status, 'Unverified')}</strong><p>{capture.mechanismConfirmed ? 'An existing owner marks a mechanism as supported within its evidence boundary.' : 'No direct tokenholder accrual mechanism is established by protocol metrics alone.'}</p></article>
        </div>
        {(token.realizedValueCaptureMechanisms?.length || token.hypotheticalValueCaptureMechanisms?.length) ? <V2Disclosure label="Value-capture mechanisms" summary="Realized and hypothetical mechanisms remain separate" quiet><div className="v2-question-detail-grid"><div><h4>Realized</h4><V2InsightList items={token.realizedValueCaptureMechanisms} emptyText="No realized mechanism is supported." tone="positive" /></div><div><h4>Hypothetical or incomplete</h4><V2InsightList items={token.hypotheticalValueCaptureMechanisms} emptyText="No hypothetical mechanism is attached." tone="caution" /></div></div></V2Disclosure> : null}
      </section>

      <div className="v2-tokenomics-domain-grid">
        <TokenomicsDomainCard
          eyebrow="Supply flow"
          title="Issuance, burn, and net change"
          status={data.issuance?.status || 'unavailable'}
          summary="Protocol issuance, burns, and observed circulating change remain distinct."
          rows={[
            ['Issuance policy', humanizeV2Value(issuance.policyStatus)],
            ['Annual inflation', formatV2Percent(issuance.annualInflationEstimate)],
            ['Burn mechanism', humanizeV2Value(burns.mechanismStatus)],
            ['Net supply change', formatV2Number(netSupply.netIssuanceAfterBurn, { compact: true })],
          ]}
        />
        <TokenomicsDomainCard
          eyebrow="Future supply"
          title="Unlocks and vesting"
          status={data.unlocks?.status || 'unavailable'}
          summary={data.unlocks?.status === 'not_applicable' ? 'Generic investor vesting is not the primary schedule for this asset family.' : data.unlocks?.status === 'unavailable' ? 'Unlock schedule data is not available.' : 'No schedule is treated as proof of a sale.'}
          rows={[
            ['Next event', unlocks.nextUnlock?.date ? formatV2Date(unlocks.nextUnlock.date, { includeTime: false }) : 'Unavailable'],
            ['Next event value', formatV2Usd(unlocks.nextUnlock?.usdValue, { compact: true })],
            ['Schedule type', humanizeV2Value(vesting.scheduleType)],
            ['90-day events', formatV2Number(unlocks.eventCount90d)],
          ]}
        >
          {availableUnlockEvents.length ? <V2Disclosure label="Scheduled events" summary={`${availableUnlockEvents.length} provider event${availableUnlockEvents.length === 1 ? '' : 's'}`} quiet><div className="v2-unlock-list">{availableUnlockEvents.slice(0, 8).map((event) => <div key={event.eventId}><strong>{event.label || humanizeV2Value(event.eventType)}</strong><span>{event.eventDate ? formatV2Date(event.eventDate, { includeTime: false }) : 'Date unavailable'}</span><small>{formatV2Usd(event.valueUsd, { compact: true })} / {formatV2Percent(event.percent)} / {humanizeV2Value(event.sourceStatus, 'Source unavailable')} / {humanizeV2Value(event.confidence, 'Confidence unavailable')}</small></div>)}</div></V2Disclosure> : null}
        </TokenomicsDomainCard>
        <TokenomicsDomainCard
          eyebrow="Ownership"
          title="Allocations and insider exposure"
          status={data.allocations?.status || 'unavailable'}
          summary="Provider allocation labels are preserved; treasury and ecosystem buckets are not automatically classified as insider supply."
          rows={[
            ['Reported categories', formatV2Number(allocations.reportedCategoryCount)],
            ['Insider allocation', formatV2Percent(insider.reportedInsiderAllocationPercent)],
            ['Insider risk', humanizeV2Value(insider.risk)],
            ['Total reconciled', allocations.allocationTotalReconciled === true ? 'Yes' : allocations.allocationTotalReconciled === false ? 'No' : 'Not available'],
          ]}
        >
          {allocationCategories.length ? <V2Disclosure label="Allocation detail" summary={`${allocationCategories.length} source label${allocationCategories.length === 1 ? '' : 's'}`} quiet><div className="v2-allocation-list">{allocationCategories.slice(0, 8).map((entry, index) => <div key={`${entry.category}-${index}`}><span>{entry.sourceLabel || entry.category}</span><strong>{formatV2Percent(entry.percentage ?? entry.percent)}</strong><small>{entry.source} / {humanizeV2Value(entry.insiderClassification, 'Classification unavailable')} / {humanizeV2Value(entry.confidence, 'Confidence unavailable')}</small></div>)}</div></V2Disclosure> : null}
        </TokenomicsDomainCard>
        <TokenomicsDomainCard
          eyebrow="Control"
          title="Treasury and holder concentration"
          status={data.holderConcentration?.status || 'unavailable'}
          summary="Wallet concentration is shown raw and is not presented as beneficial-owner-adjusted."
          rows={[
            ['Treasury concentration', formatV2Percent(treasury.supplyConcentrationPercent)],
            ['Top wallet', formatV2Percent(concentration.topWalletConcentrationPercent)],
            ['Top 10 holders', formatV2Percent(concentration.top10HolderRatePercent)],
            ['Concentration risk', humanizeV2Value(concentration.concentrationRisk)],
          ]}
        />
      </div>

      <section className="v2-token-demand-section">
        <div className="v2-tokenomics-section-title"><div><p className="v2-eyebrow">Utility and demand</p><h3>What creates token demand, and is use mandatory?</h3></div><V2StatusPill status={data.utilityMechanisms?.status || 'unavailable'} /></div>
        {utilityMechanisms.length ? <div className="v2-mechanism-grid">{utilityMechanisms.map((mechanism, index) => <article key={`${mechanism.mechanism}-${index}`}><strong>{humanizeV2Value(mechanism.mechanism)}</strong><p>{safeProductText(mechanism.description, 'Mechanism description unavailable.')}</p><div><V2StatusPill label={humanizeV2Value(mechanism.mandatoryOrOptional, 'Use unverified')} status="partial" /><V2StatusPill label={humanizeV2Value(mechanism.realizedOrProposed, 'Realization unverified')} status="partial" /><V2StatusPill label={humanizeV2Value(mechanism.directOrIndirect, 'Transfer unverified')} status="partial" /></div><V2Disclosure label="Mechanism boundary" summary={mechanism.tokenDemandProven ? 'Demand supported' : 'Demand remains unproven'} quiet><V2InsightList items={mechanism.whatIsSupported} emptyText="No bounded support is attached." tone="positive" /><V2InsightList items={mechanism.whatIsNotProven} emptyText="No additional boundary is attached." tone="caution" /></V2Disclosure></article>)}</div> : <p className="v2-empty-panel">No source-bound utility mechanism is available. Protocol activity is not used as a substitute.</p>}
        <p className="v2-boundary-copy">Mandatory and optional token use remain distinct. {demand.mandatoryUseProven ? 'Mandatory use is supported within the attached evidence boundary.' : 'Mandatory token use is not established.'}</p>
      </section>

      {data.tokenomicsQuestions?.length ? (
        <section className="v2-question-stack"><h3>Institutional tokenomics questions</h3>{data.tokenomicsQuestions.map((question) => <TokenomicsQuestion key={question.questionId} question={question} />)}</section>
      ) : null}

      <section className="v2-formula-section v2-formula-section--quality"><h3>Deterministic formulas</h3><p>Results come from the backend Formula Engine. The browser displays them without recalculation.</p>{primary.length ? <div className="v2-formula-grid">{primary.map((formula) => <FormulaCard key={formula.formulaId} formula={formula} primary />)}</div> : <p className="v2-empty-panel">No primary formula has all valid inputs.</p>}</section>
      <V2Disclosure label="Advanced and unavailable formulas" summary={`${secondary.length} additional diagnostic${secondary.length === 1 ? '' : 's'}`}>
        <div className="v2-formula-grid">{secondary.map((formula) => <FormulaCard key={formula.formulaId} formula={formula} />)}</div>
      </V2Disclosure>
      <SupplyTruthDetail data={data} />
      <section className="v2-open-checks"><h3>Next diligence</h3><V2InsightList items={data.nextDiligence || data.whatWouldImproveConfidence} emptyText="No additional diligence requirement is attached." /></section>
    </div>
  )
}

// Compatibility export now points to the sole Premium V2 Tokenomics owner.
export const TokenomicsPanel = V2TokenomicsQualityExperience

// Compatibility export now points to the sole Premium V2 Fundamentals owner.
export const FundamentalsPanel = V2ThesisFundamentalsExperience

const CURRENT_REALITY_IMPACT_FILTERS = [
  ['all', 'All material'],
  ['strengthens_thesis', 'Strengthens thesis'],
  ['weakens_thesis', 'Weakens thesis'],
  ['changes_risk', 'Changes risk'],
  ['informational', 'Informational'],
  ['requires_verification', 'Needs verification'],
]

function impactPresentation(impact) {
  if (impact === 'strengthens_thesis') return { label: 'Strengthens thesis', tone: 'positive' }
  if (impact === 'weakens_thesis') return { label: 'Weakens thesis', tone: 'negative' }
  if (impact === 'changes_risk') return { label: 'Changes risk', tone: 'caution' }
  if (impact === 'requires_verification') return { label: 'Needs verification', tone: 'info' }
  return { label: 'Informational', tone: 'neutral' }
}

function verificationPresentation(state) {
  if (state === 'verified_primary_source') return { label: 'Primary source verified', tone: 'positive' }
  if (state === 'verified_multiple_sources') return { label: 'Multiple sources verified', tone: 'positive' }
  if (state === 'verified_provider_measurement') return { label: 'Provider measurement', tone: 'info' }
  if (state === 'partially_verified') return { label: 'Partially verified', tone: 'caution' }
  if (state === 'conflicting_sources') return { label: 'Sources conflict', tone: 'negative' }
  if (state === 'stale_source') return { label: 'Source is stale', tone: 'caution' }
  return { label: 'Needs verification', tone: 'info' }
}

function materialityPresentation(state) {
  if (state === 'critical' || state === 'high') return { label: humanizeV2Value(state), tone: 'negative' }
  if (state === 'medium') return { label: 'Medium materiality', tone: 'caution' }
  if (state === 'low') return { label: 'Low materiality', tone: 'neutral' }
  if (state === 'informational') return { label: 'Context only', tone: 'neutral' }
  return { label: 'Materiality unresolved', tone: 'info' }
}

function eventDisplayDate(event) {
  const value = event.effectiveAt || event.occurredAt || event.publishedAt || event.observedAt
  return value ? formatV2Date(value, { includeTime: false }) : 'Date not established'
}

function CurrentRealityEventCard({ event, verificationOnly = false }) {
  const impact = impactPresentation(event.primaryImpact)
  const verification = verificationPresentation(event.verificationState)
  const materiality = materialityPresentation(event.materiality?.state)
  const source = event.sourceSummary?.primarySource || {}
  return (
    <article className={`v2-current-event v2-current-event--${impact.tone}`}>
      <div className="v2-current-event__rail" aria-hidden="true" />
      <div className="v2-current-event__body">
        <header className="v2-current-event__header">
          <div className="v2-current-event__date"><span>{eventDisplayDate(event)}</span><small>{humanizeV2Value(event.lifecycleStatus, 'Lifecycle not established')}</small></div>
          <div className="v2-current-event__badges">
            <V2StatusPill label={impact.label} tone={impact.tone} />
            <V2StatusPill label={verification.label} tone={verification.tone} />
            <V2StatusPill label={materiality.label} tone={materiality.tone} />
          </div>
        </header>
        <div className="v2-current-event__identity">
          <span>{safeProductText(event.subject?.subjectName, 'Affected entity not established')}</span>
          <span>{humanizeV2Value(event.primaryCategory, 'Material development')}</span>
        </div>
        <h3>{safeProductText(event.title, 'Current development')}</h3>
        <p className="v2-current-event__summary">{safeProductText(event.conciseSummary, 'The current source does not provide a concise event summary.')}</p>
        <div className="v2-current-event__impact">
          <span>{verificationOnly ? 'Current treatment' : 'What changes'}</span>
          <p>{safeProductText(event.impactSummary, 'No bounded thesis or risk change is established.')}</p>
        </div>
        <div className="v2-current-event__source">
          <span>{safeProductText(source.sourceName, 'Source not attached')}</span>
          <span>{source.publishedAt ? `Published ${formatV2Date(source.publishedAt, { includeTime: false })}` : 'Publication date not attached'}</span>
          <span>{humanizeV2Value(event.freshness, 'Freshness not established')}</span>
        </div>
        <V2Disclosure label="Evidence, limits, and next check" summary="Inspect scope, provenance, and what remains unproven." quiet>
          <div className="v2-current-event__detail-grid">
            <div><h4>What it supports</h4><V2InsightList items={event.whatItSupports} emptyText="No supported conclusion is attached." tone="positive" /></div>
            <div><h4>What it does not prove</h4><V2InsightList items={event.whatItDoesNotProve} emptyText="No additional evidence boundary is attached." tone="caution" /></div>
            <div><h4>Affected thesis or risks</h4><V2InsightList items={[...(event.affectedThesisConditions || []), ...(event.affectedRisks || []), ...(event.affectedInvalidationConditions || [])]} emptyText="No canonical thesis condition or risk is affected." /></div>
            <div><h4>Missing evidence</h4><V2InsightList items={event.missingEvidence} emptyText="No additional missing evidence is attached." tone="caution" /></div>
          </div>
          {event.contradictions?.length ? <div className="v2-current-event__contradiction"><strong>Contradictions</strong><V2InsightList items={event.contradictions} tone="caution" /></div> : null}
          <div className="v2-current-event__detail-meta">
            <span>Lifecycle: <strong>{humanizeV2Value(event.lifecycleStatus, 'Not established')}</strong></span>
            <span>Risk direction: <strong>{humanizeV2Value(event.riskDirection, 'Not established')}</strong></span>
            <span>Source type: <strong>{humanizeV2Value(source.sourceType, 'Not established')}</strong></span>
            <span>Effective date: <strong>{event.effectiveAt ? formatV2Date(event.effectiveAt, { includeTime: false }) : 'Not established'}</strong></span>
          </div>
          <div className="v2-next-step"><span>Analyst next step</span><p>{safeProductText(event.nextDiligence?.[0], 'Verify the affected entity, lifecycle, source scope, and measurable impact.')}</p></div>
          <p className="v2-boundary-copy">{safeProductText(source.limitations?.[0] || event.limitations?.[0], 'Event conclusions remain limited to the attached source and affected-entity scope.')}</p>
        </V2Disclosure>
      </div>
    </article>
  )
}

export function CurrentRealityPanel({ result }) {
  const section = result.currentReality
  const data = section?.data || {}
  const [activeImpact, setActiveImpact] = useState('all')
  const verifiedTimeline = data.activeMaterialEvents?.length
    ? data.activeMaterialEvents
    : (data.resolvedEvents || []).filter((event) => event.freshness !== 'stale')
  const filteredTimeline = activeImpact === 'all'
    ? verifiedTimeline
    : verifiedTimeline.filter((event) => event.primaryImpact === activeImpact)
  const conflictingEvents = data.conflictingEvents || []
  const conflictIds = new Set(conflictingEvents.map((event) => event.eventId))
  const verificationEvents = (data.unverifiedEvents || []).filter((event) => !conflictIds.has(event.eventId))
  const impactCounts = Object.fromEntries(CURRENT_REALITY_IMPACT_FILTERS.slice(1).map(([id]) => [id, (data.events || []).filter((event) => event.primaryImpact === id).length]))
  const mostMaterial = data.mostMaterialEvent
  const riskChange = data.mostImportantRiskChange || data.mostImportantNegativeDevelopment
  const hasCanonicalData = String(data.schemaVersion || '').startsWith('current-reality-engine-v1')
  return (
    <div className="v2-tab-panel__inner v2-current-reality-shell">
      <V2SectionHeading
        eyebrow="Current reality"
        title="What has materially changed?"
        description="Verified developments are mapped to the existing thesis and risk framework. Headlines, price movement, and attention alone are not treated as fundamental change."
        action={<V2StatusPill status={section?.status || 'unavailable'} />}
      />

      <section className="v2-current-reality-command">
        <div className="v2-current-reality-command__lead">
          <p className="v2-eyebrow">Executive read</p>
          <h3>{safeProductText(data.coverage?.summary, hasCanonicalData ? 'No verified material event is available in the current source window.' : 'Current Reality is not available for this analysis yet.')}</h3>
          <p>{mostMaterial ? safeProductText(mostMaterial.impactSummary) : 'The current analysis remains useful without inventing a material-event narrative.'}</p>
        </div>
        <dl className="v2-current-reality-command__metrics">
          <div><dt>Analysis window</dt><dd>{safeProductText(data.eventWindow?.label, 'No dated window')}</dd></div>
          <div><dt>Verified coverage</dt><dd>{typeof data.confidence?.verifiedCoveragePercent === 'number' ? `${data.confidence.verifiedCoveragePercent}%` : 'Not established'}</dd></div>
          <div><dt>Confidence</dt><dd>{humanizeV2Value(data.confidence?.level, 'Not assessed')}</dd></div>
          <div><dt>Last verified</dt><dd>{data.freshness?.lastVerifiedAt ? formatV2Date(data.freshness.lastVerifiedAt, { includeTime: false }) : humanizeV2Value(data.freshness?.status, 'Not available')}</dd></div>
        </dl>
        <div className="v2-current-reality-command__signals">
          <article><span>Most material event</span><strong>{safeProductText(mostMaterial?.title, 'No verified material event')}</strong></article>
          <article className="is-caution"><span>Most important risk change</span><strong>{safeProductText(riskChange?.title, 'No verified risk change')}</strong></article>
          <article><span>Most important open evidence</span><strong>{safeProductText(data.missingCriticalData?.[0], 'No additional event-specific gap is attached.')}</strong></article>
        </div>
      </section>

      <section className="v2-current-reality-impact">
        <div className="v2-tokenomics-section-title"><div><p className="v2-eyebrow">Impact view</p><h3>Material event timeline</h3></div><span>{verifiedTimeline.length} verified or source-bounded event{verifiedTimeline.length === 1 ? '' : 's'}</span></div>
        <div className="v2-current-reality-filters" role="group" aria-label="Filter current events by impact">
          {CURRENT_REALITY_IMPACT_FILTERS.map(([id, label]) => {
            const count = id === 'all' ? verifiedTimeline.length : impactCounts[id]
            return <button key={id} type="button" aria-pressed={activeImpact === id} onClick={() => setActiveImpact(id)}>{label}<span>{count}</span></button>
          })}
        </div>
        {filteredTimeline.length ? (
          <div className="v2-current-reality-timeline">
            {filteredTimeline.map((event) => <CurrentRealityEventCard key={event.eventId} event={event} />)}
          </div>
        ) : (
          <div className="v2-empty-panel v2-current-reality-empty">
            <h3>{verifiedTimeline.length ? 'No event matches this impact filter' : 'No verified material events in the current window'}</h3>
            <p>{verifiedTimeline.length ? 'Choose another impact group to inspect the canonical timeline.' : safeProductText(data.nextDiligence?.[0], 'Attach a primary or provider-measured event source with clear entity, lifecycle, and event-time scope.')}</p>
            <div><span>Window: {safeProductText(data.eventWindow?.label, 'Not established')}</span><span>Coverage: {safeProductText(data.coverage?.summary, 'No source coverage attached')}</span></div>
          </div>
        )}
      </section>

      <section className="v2-current-reality-thesis">
        <div className="v2-tokenomics-section-title"><div><p className="v2-eyebrow">Thesis impact</p><h3>What the verified event set affects</h3></div><V2StatusPill label={humanizeV2Value(data.reassessmentStatus, 'No reassessment needed')} tone={data.reassessmentStatus === 'full_reassessment_recommended' ? 'negative' : data.reassessmentStatus === 'targeted_reassessment_needed' ? 'caution' : 'neutral'} /></div>
        <div className="v2-current-reality-thesis__grid">
          <div><h4>Thesis conditions affected</h4><V2InsightList items={data.affectedThesisConditions} emptyText="No canonical thesis condition is currently affected." tone="positive" /></div>
          <div><h4>Invalidation conditions approaching</h4><V2InsightList items={data.affectedInvalidationConditions} emptyText="No existing invalidation condition is currently approached." tone="caution" /></div>
          <div><h4>Fundamental dimensions</h4><V2InsightList items={(data.affectedFundamentalsDimensions || []).map((item) => humanizeV2Value(item))} emptyText="No fundamental dimension has a verified material change." /></div>
          <div><h4>Tokenomics dimensions</h4><V2InsightList items={(data.affectedTokenomicsDimensions || []).map((item) => humanizeV2Value(item))} emptyText="No tokenomics dimension has a verified material change." /></div>
        </div>
      </section>

      {conflictingEvents.length ? (
        <section className="v2-current-reality-review v2-current-reality-review--conflict">
          <div className="v2-tokenomics-section-title"><div><p className="v2-eyebrow">Conflicting sources</p><h3>Resolve before changing the thesis</h3></div><V2StatusPill label={`${conflictingEvents.length} conflict${conflictingEvents.length === 1 ? '' : 's'}`} tone="negative" /></div>
          <div className="v2-current-reality-review__list">{conflictingEvents.map((event) => <CurrentRealityEventCard key={event.eventId} event={event} verificationOnly />)}</div>
        </section>
      ) : null}

      {verificationEvents.length ? (
        <section className="v2-current-reality-review">
          <div className="v2-tokenomics-section-title"><div><p className="v2-eyebrow">Requires verification</p><h3>Relevant leads, not thesis evidence</h3></div><V2StatusPill label={`${verificationEvents.length} open item${verificationEvents.length === 1 ? '' : 's'}`} tone="info" /></div>
          <p className="v2-current-reality-review__boundary">These items remain separate from the verified material-event timeline until the affected entity, lifecycle, source, and economic scope are confirmed.</p>
          <div className="v2-current-reality-review__list">{verificationEvents.map((event) => <CurrentRealityEventCard key={event.eventId} event={event} verificationOnly />)}</div>
        </section>
      ) : null}

      <V2Disclosure label="Coverage and methodology limits" summary={`${data.coverage?.availableInputCount ?? 0} available input${data.coverage?.availableInputCount === 1 ? '' : 's'}; ${data.coverage?.excludedUnrelatedCount ?? 0} excluded`}>
        <div className="v2-current-reality-methodology">
          <div><h4>What remains open</h4><V2InsightList items={data.missingCriticalData} emptyText="No additional event-specific gap is attached." tone="caution" /></div>
          <div><h4>Next diligence</h4><V2InsightList items={data.nextDiligence} emptyText="No additional event-specific step is attached." /></div>
          <div><h4>Coverage limits</h4><V2InsightList items={data.limitations} emptyText="No additional coverage limitation is attached." tone="caution" /></div>
          <div><h4>Source mix</h4><V2InsightList items={(data.coverage?.sourceTypes || []).map((item) => humanizeV2Value(item))} emptyText="No source type is attached." /></div>
        </div>
      </V2Disclosure>
    </div>
  )
}

export default function V2ResearchTabs({ result, productResearchResultV2, activeTab: controlledActiveTab, onActiveTabChange }) {
  const [localActiveTab, setLocalActiveTab] = useState('tokenomics')
  const activeTab = controlledActiveTab || localActiveTab
  const setActiveTab = (nextTab) => {
    setLocalActiveTab(nextTab)
    onActiveTabChange?.(nextTab)
  }
  const tabsetId = useId()
  const handleKeyDown = (event) => {
    const currentIndex = V2_RESEARCH_TABS.findIndex((tab) => tab.id === activeTab)
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? V2_RESEARCH_TABS.length - 1
        : event.key === 'ArrowRight' ? (currentIndex + 1) % V2_RESEARCH_TABS.length
          : (currentIndex - 1 + V2_RESEARCH_TABS.length) % V2_RESEARCH_TABS.length
    setActiveTab(V2_RESEARCH_TABS[nextIndex].id)
    document.getElementById(`${tabsetId}-${V2_RESEARCH_TABS[nextIndex].id}-tab`)?.focus()
  }
  return (
    <section className="v2-research-tabs">
      <div className="v2-tab-list" role="tablist" aria-label="Asset research sections" onKeyDown={handleKeyDown}>
        {V2_RESEARCH_TABS.map((tab) => (
          <button
            key={tab.id}
            id={`${tabsetId}-${tab.id}-tab`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tabsetId}-${tab.id}-panel`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="v2-tab-panel" id={`${tabsetId}-${activeTab}-panel`} role="tabpanel" aria-labelledby={`${tabsetId}-${activeTab}-tab`} tabIndex={0}>
        <V2ProductResearchSummary productResearchResultV2={productResearchResultV2} />
        {activeTab === 'tokenomics' ? <V2TokenomicsQualityExperience result={result} /> : null}
        {activeTab === 'fundamentals' ? <V2ThesisFundamentalsExperience result={result} /> : null}
        {activeTab === 'reality' ? <CurrentRealityPanel result={result} /> : null}
        {activeTab === 'technical' ? <V2TechnicalScenariosPanel result={result} /> : null}
      </div>
    </section>
  )
}
