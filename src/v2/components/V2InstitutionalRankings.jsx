import React, { useState } from 'react'
import { formatV2Date } from '../assetResearchResultV2'

const TAB_ORDER = ['quality', 'opportunity', 'mathematical_upside', 'risk_adjusted_roi']

function formatScore(value) {
  return typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value) : 'Withheld'
}

function formatCoverage(value) {
  return typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 }).format(value) : 'Unavailable'
}

function formatUpside(value) {
  return typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' }).format(value) : 'Unavailable'
}

function RankingMetric({ candidate, type }) {
  if (type === 'mathematical_upside') return <><span>Base midpoint upside</span><strong>{formatUpside(candidate.mathematicalUpside?.baseScenarioMidpointUpside)}</strong></>
  if (type === 'risk_adjusted_roi') return <><span>Modeled index</span><strong>{formatScore(candidate.riskAdjustedRoiScore)}</strong></>
  return <><span>{type === 'quality' ? 'Quality score' : 'Opportunity score'}</span><strong>{formatScore(candidate.rankingScore)}</strong></>
}

function CandidateRow({ candidate, type, provisional = false }) {
  return (
    <article className="v2-ranking-row">
      <div className="v2-ranking-row__rank"><small>{provisional ? 'Provisional' : 'Rank'}</small><strong>{candidate.displayRank}</strong></div>
      <div className="v2-ranking-row__identity">
        {candidate.logo ? <img src={candidate.logo} alt="" /> : <span aria-hidden="true">{(candidate.symbol || candidate.displayName).slice(0, 2)}</span>}
        <div><p>{candidate.display.candidateType}</p><h3>{candidate.displayName}</h3><small>{candidate.symbol || 'Symbol unavailable'} / {candidate.display.family}</small></div>
      </div>
      <div className="v2-ranking-row__metrics">
        <div><RankingMetric candidate={candidate} type={type} /></div>
        <div><span>Ranking confidence</span><strong>{formatScore(candidate.rankingConfidence)}</strong></div>
        <div><span>Coverage</span><strong>{formatCoverage(candidate.weightedCoverage)}</strong></div>
        <div><span>Freshness</span><strong>{candidate.display.freshness}</strong></div>
      </div>
      <p className="v2-ranking-row__reason">{candidate.conciseReason}</p>
      <div className="v2-ranking-row__signals">
        <div><span>Strongest drivers</span><p>{candidate.strongestDrivers.length ? candidate.strongestDrivers.join(' / ') : 'No supported driver is attached.'}</p></div>
        <div><span>Strongest risks</span><p>{candidate.strongestRisks.length ? candidate.strongestRisks.join(' / ') : 'No supported risk component dominates.'}</p></div>
      </div>
      <details>
        <summary>View score methodology and inputs <span aria-hidden="true">+</span></summary>
        <div className="v2-ranking-breakdown">
          {candidate.componentBreakdown.map((item) => <div key={item.componentId}><span>{item.label}</span><strong>{item.included ? formatScore(item.normalizedValue) : 'Unavailable'}</strong><small>{item.included ? `${formatCoverage(item.weight)} weight / ${formatScore(item.contribution)} contribution` : item.missingInputs[0] || 'Excluded by policy'}</small><em>{item.display.sourceOwner} / {item.display.freshness}</em></div>)}
        </div>
        {candidate.caveats.length ? <ul>{candidate.caveats.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      </details>
      <footer><a href={candidate.openAnalysisTarget}>Open analysis <span aria-hidden="true">-&gt;</span></a><small>Rank is not a recommendation.</small></footer>
    </article>
  )
}

function WithheldRow({ candidate }) {
  return (
    <article className="v2-ranking-withheld">
      <div><span>{candidate.display.rankability}</span><h4>{candidate.displayName}</h4><small>{candidate.symbol || candidate.display.candidateType}</small></div>
      <p>{candidate.blockingReasons[0] || candidate.nextRequiredStep}</p>
      <div><span>Coverage</span><strong>{formatCoverage(candidate.coverage)}</strong></div>
      <details><summary>What is needed next</summary><p>{candidate.nextRequiredStep}</p>{candidate.missingCriticalInputs.length ? <ul>{candidate.missingCriticalInputs.map((item) => <li key={item}>{item.replace(/([A-Z])/g, ' $1').trim()}</li>)}</ul> : null}</details>
    </article>
  )
}

function RankingPanel({ ranking }) {
  const displayed = [...ranking.rankedCandidates, ...ranking.provisionalCandidates]
  const withheld = [...ranking.withheldCandidates, ...ranking.pendingCandidates, ...ranking.notApplicableCandidates]
  const blocked = ranking.status === 'blocked' || ranking.applicability === 'not_applicable' || ranking.applicability === 'blocked_by_missing_product_model'
  return (
    <div className="v2-ranking-panel">
      <div className="v2-ranking-panel__intro"><div><span>{ranking.display.status}</span><strong>{ranking.objective}</strong></div><div><span>Calibration</span><strong>{ranking.display.calibration}</strong></div><div><span>Coverage</span><strong>{ranking.coverageSummary}</strong></div></div>
      {blocked ? <div className="v2-ranking-empty"><p className="v2-eyebrow">{ranking.display.applicability}</p><h3>This ranking is intentionally unavailable.</h3><p>{ranking.objective}</p></div> : null}
      {!blocked && !displayed.length ? <div className="v2-ranking-empty"><p className="v2-eyebrow">Ranking withheld</p><h3>No candidate passes every current gate.</h3><p>{ranking.coverageSummary}</p></div> : null}
      {displayed.length ? <div className="v2-ranking-list">{ranking.rankedCandidates.map((candidate) => <CandidateRow key={candidate.canonicalAssetId} candidate={candidate} type={ranking.rankingType} />)}{ranking.provisionalCandidates.map((candidate) => <CandidateRow key={candidate.canonicalAssetId} candidate={candidate} type={ranking.rankingType} provisional />)}</div> : null}
      {withheld.length ? <details className="v2-ranking-withheld-drawer"><summary>View withheld, pending, and not-applicable candidates <span>{withheld.length}</span></summary><div>{withheld.map((candidate, index) => <WithheldRow key={`${candidate.canonicalAssetId || candidate.canonicalProductId || candidate.displayName}:${index}`} candidate={candidate} />)}</div></details> : null}
    </div>
  )
}

export default function V2InstitutionalRankings({ rankings, errorMessage = null }) {
  const [selected, setSelected] = useState('quality')
  if (!rankings) return <section className="v2-ranking-shell"><header><p className="v2-eyebrow">Institutional rankings</p><h2>Ranking analysis is unavailable.</h2><p>{errorMessage || 'A fresh ranking request is required.'}</p></header></section>
  const ranking = rankings.rankingsByType[selected] || rankings.qualityRanking
  return (
    <section className="v2-ranking-shell" aria-labelledby="institutional-rankings-title">
      <header className="v2-ranking-hero">
        <div><p className="v2-eyebrow">Institutional rankings / {rankings.universeDisplayName}</p><h2 id="institutional-rankings-title">Four lenses. One explicit policy boundary.</h2><p>{ranking.objective}</p></div>
        <aside><span>Fresh request</span><strong>{rankings.rankableCount}</strong><small>distinct rankable assets / {rankings.withheldCount} withheld decisions</small><p>{formatV2Date(rankings.generatedAt)}</p></aside>
      </header>
      <div className="v2-ranking-boundaries"><span>Within this universe only</span><span>{ranking.display.calibration}</span><span>Rank is not a recommendation</span></div>
      <div className="v2-ranking-tabs" role="tablist" aria-label="Institutional ranking type">
        {TAB_ORDER.map((type) => { const item = rankings.rankingsByType[type]; return <button key={type} type="button" role="tab" aria-selected={selected === type} className={selected === type ? 'is-active' : ''} onClick={() => setSelected(type)}><span>{item.display.name}</span><small>{item.display.applicability}</small></button> })}
      </div>
      <RankingPanel ranking={ranking} />
      <details className="v2-ranking-methodology"><summary>How these rankings work <span aria-hidden="true">+</span></summary><div>{rankings.methodologySummary.map((item) => <p key={item}>{item}</p>)}</div></details>
    </section>
  )
}
