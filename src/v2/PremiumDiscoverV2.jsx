import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createV2RequestCoordinator } from './assetResearchV2Navigation'
import {
  buildUniverseCandidateAssetPath,
  buildUniverseV2Path,
  discoverUniverseV2,
  fetchUniverseDefinitionV2,
  fetchUniverseListV2,
  parseDiscoverV2Location,
  statusLabel,
  universeScopeLabel,
  universeErrorMessage,
} from './universeDiscoveryV2'
import { formatV2Date, formatV2Usd } from './assetResearchResultV2'
import { fetchInstitutionalRankingsV2, rankingErrorMessage } from './institutionalRankingV2'
import V2InstitutionalRankings from './components/V2InstitutionalRankings'
import './PremiumAssetPageV2.css'
import './PremiumDiscoverV2.css'

function useBrowserLocation() {
  const [location, setLocation] = useState(() => typeof window === 'undefined'
    ? { pathname: '/terminal-v2/discover', search: '' }
    : { pathname: window.location.pathname, search: window.location.search })
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const update = () => setLocation({ pathname: window.location.pathname, search: window.location.search })
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  return location
}

function Shell({ children }) {
  return (
    <div className="v2-app-shell v2-discover-shell">
      <a className="v2-skip-link" href="#discover-main">Skip to Discover</a>
      <header className="v2-topbar v2-discover-topbar">
        <a href="/terminal-v2" className="v2-brand" aria-label="ThesisCore V2 home">
          <span className="v2-brand__mark">TC</span>
          <span><strong>ThesisCore</strong><small>Institutional Research / V2</small></span>
        </a>
        <nav className="v2-topbar__nav" aria-label="Product navigation">
          <a aria-current="page" href="/terminal-v2/discover">Discover</a>
          <a href="/terminal-v2">Asset research</a>
          <a href="/">Legacy terminal</a>
        </nav>
      </header>
      <div id="discover-main" className="v2-page-frame v2-discover-frame">{children}</div>
    </div>
  )
}

function Loading({ detail = false }) {
  return (
    <main className="v2-discover-loading" role="status" aria-live="polite">
      <span className="v2-discover-loading__line" />
      <p className="v2-eyebrow">Live institutional discovery</p>
      <h1>{detail ? 'Resolving candidates and running bounded analysis' : 'Opening the universe registry'}</h1>
      <p>{detail ? 'Canonical identity, representation, relevance, coverage, liquidity, and fresh analysis are evaluated in order.' : 'Loading active and planned research universes.'}</p>
    </main>
  )
}

function ErrorState({ error }) {
  return (
    <main className="v2-discover-state">
      <p className="v2-eyebrow">Discover unavailable</p>
      <h1>We could not complete this research view.</h1>
      <p>{universeErrorMessage(error)}</p>
      <div className="v2-discover-actions"><a className="v2-primary-button" href="/terminal-v2/discover">Return to Discover</a><a href="/terminal-v2">Open asset research</a></div>
    </main>
  )
}

export function UniverseCard({ universe }) {
  const path = buildUniverseV2Path(universe)
  return (
    <article className="v2-universe-card">
      <div className="v2-universe-card__index" aria-hidden="true">0{universe.priority}</div>
      <div>
        <p className="v2-eyebrow">Active universe</p>
        <h2>{universe.displayName}</h2>
        <p>{universe.institutionalObjective}</p>
      </div>
      <div className="v2-universe-card__scope"><span>Core scope</span><strong>{universe.coreSubthemes.slice(0, 3).map(universeScopeLabel).join(' / ')}</strong></div>
      <div className="v2-universe-card__footer"><span>{universe.rankingReadiness || 'Ranking policy remains planned.'}</span>{path ? <a href={path}>Explore universe <span aria-hidden="true">-&gt;</span></a> : null}</div>
    </article>
  )
}

export function Overview({ registry }) {
  return (
    <main className="v2-discover-overview">
      <section className="v2-discover-hero">
        <div>
          <p className="v2-eyebrow">ThesisCore Discover</p>
          <h1>Institutional research universes with transparent ranking boundaries.</h1>
          <p>Discovery establishes membership first. Separate, versioned ranking policies then compare only fresh eligible assets without changing identity, score, confidence, verdict, or membership.</p>
        </div>
        <aside className="v2-discover-hero__status">
          <span>Active now</span><strong>{registry.activeUniverseCount}</strong>
          <p>Freshness checked {formatV2Date(registry.generatedAt)}</p>
          <small>Membership is not a recommendation or a rank.</small>
        </aside>
      </section>

      <section className="v2-discover-section" aria-labelledby="active-universes">
        <header><p className="v2-eyebrow">Live research scopes</p><h2 id="active-universes">Active universes</h2><p>Each universe applies a distinct institutional eligibility policy.</p></header>
        <div className="v2-universe-grid">{registry.activeUniverses.map((universe) => <UniverseCard key={universe.universeId} universe={universe} />)}</div>
      </section>

      <section className="v2-planned-universes" aria-labelledby="planned-universes">
        <header><p className="v2-eyebrow">Registry roadmap</p><h2 id="planned-universes">Planned research universes</h2></header>
        <div>{registry.plannedUniverses.map((universe) => <article key={universe.universeId}><span>Planned</span><h3>{universe.displayName}</h3><p>{universe.shortDescription}</p></article>)}</div>
      </section>
    </main>
  )
}

const FUNNEL_ITEMS = [
  ['Discovered', 'rawCandidateCount'],
  ['Canonical candidates', 'deduplicatedCandidateCount'],
  ['Identity resolved', 'identityResolvedCount'],
  ['Representation verified', 'representationVerifiedCount'],
  ['Core relevant', 'coreRelevantCount'],
  ['Analyzed', 'analysisCompletedCount'],
  ['Eligible', 'eligibleCount'],
  ['Pending', 'analysisPendingCount'],
  ['Manual review', 'manualReviewCount'],
]

export function CandidateCard({ candidate, compact = false }) {
  const deepLink = buildUniverseCandidateAssetPath(candidate)
  const reasons = candidate.membership.membershipReasons?.length ? candidate.membership.membershipReasons : candidate.membership.blockingReasons
  const relevantSubtheme = candidate.relevance.coreSubtheme || candidate.relevance.adjacentSubthemes?.[0]
  return (
    <article className={`v2-candidate-card${compact ? ' v2-candidate-card--compact' : ''}`}>
      <div className="v2-candidate-card__identity">
        {candidate.displayIdentity.logo ? <img src={candidate.displayIdentity.logo} alt="" /> : <span aria-hidden="true">{(candidate.displayIdentity.symbol || candidate.displayIdentity.name || '?').slice(0, 2)}</span>}
        <div><p>{candidate.display.candidateType}</p><h3>{candidate.displayIdentity.name}</h3><strong>{candidate.displayIdentity.symbol || 'Symbol unavailable'}</strong></div>
        <em>{candidate.display.membership}</em>
      </div>
      <div className="v2-candidate-card__facts">
        <div><span>Family</span><strong>{candidate.display.family}</strong></div>
        <div><span>Representation</span><strong>{candidate.display.representation}</strong></div>
        <div><span>Subtheme</span><strong>{relevantSubtheme ? universeScopeLabel(relevantSubtheme) : 'Further classification required'}</strong></div>
        <div><span>Coverage</span><strong>{candidate.display.coverage}</strong></div>
        <div><span>Liquidity</span><strong>{candidate.display.liquidity}</strong></div>
        <div><span>Analysis freshness</span><strong>{candidate.display.freshness}</strong></div>
        <div><span>Technical readiness</span><strong>{candidate.display.technicalReadiness}</strong></div>
      </div>
      {!compact ? <div className="v2-candidate-card__metrics"><span>Market cap<strong>{formatV2Usd(candidate.marketSummary.marketCapUsd, { compact: true })}</strong></span><span>24h volume<strong>{formatV2Usd(candidate.marketSummary.volume24hUsd, { compact: true })}</strong></span></div> : null}
      <p className="v2-candidate-card__reason">{reasons?.[0] || candidate.relevance.relevanceReasons?.[0] || 'Further canonical review is required.'}</p>
      {candidate.liquidity.providerDisagreement ? <p className="v2-candidate-card__warning">Comparable market or liquidity sources disagree. Review the provider detail before relying on this candidate.</p> : null}
      {candidate.membership.caveats?.length ? <details><summary>View caveats</summary><ul>{candidate.membership.caveats.map((item) => <li key={item}>{item}</li>)}</ul></details> : null}
      <footer>{deepLink ? <a href={deepLink}>Open full analysis <span aria-hidden="true">-&gt;</span></a> : <span>Product-level analysis model required</span>}<small>{candidate.display.analysis}</small></footer>
    </article>
  )
}

function CandidateSection({ eyebrow, title, description, candidates, compact = false }) {
  if (!candidates.length) return null
  return (
    <section className="v2-discover-section v2-candidate-section">
      <header><p className="v2-eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></header>
      <div className="v2-candidate-grid">{candidates.map((candidate) => <CandidateCard key={candidate.candidateId} candidate={candidate} compact={compact} />)}</div>
    </section>
  )
}

export function UniverseDetail({ result, rankings = null, rankingError = null }) {
  const universe = result.universeDefinition
  return (
    <main className="v2-universe-detail">
      <nav className="v2-discover-breadcrumb" aria-label="Breadcrumb"><a href="/terminal-v2/discover">Discover</a><span>/</span><strong>{universe.displayName}</strong></nav>
      <section className="v2-universe-hero">
        <div>
          <p className="v2-eyebrow">Institutional universe</p>
          <h1>{universe.displayName}</h1>
          <p>{universe.institutionalObjective}</p>
          <div className="v2-universe-hero__qualifiers"><span><small>What qualifies</small>{universe.coreSubthemes.slice(0, 4).map(universeScopeLabel).join(' / ')}</span><span><small>What does not</small>{universe.disqualifyingConditions.slice(0, 3).map(universeScopeLabel).join(' / ')}</span></div>
        </div>
        <aside>
          <span className="v2-not-ranked">{!rankings ? 'Not ranked yet' : universe.rankingCalibrationStatus === 'provisionally_calibrated' ? 'Provisional calibration' : 'Ranking policy'}</span>
          <strong>{result.sourceCoverage}</strong>
          <p>Last full discovery {formatV2Date(result.generatedAt)}</p>
          <small>{result.freshnessSummary}</small>
        </aside>
      </section>

      <section className="v2-funnel" aria-label="Candidate funnel">
        {FUNNEL_ITEMS.map(([label, field]) => <div key={field}><strong>{result[field]}</strong><span>{label}</span></div>)}
      </section>

      <V2InstitutionalRankings rankings={rankings} errorMessage={rankingError ? rankingErrorMessage(rankingError) : null} />

      {!result.candidates.length ? <section className="v2-discover-empty" role="status"><p className="v2-eyebrow">No canonical candidates yet</p><h2>This discovery run returned no candidates.</h2><p>Source coverage may be incomplete. No asset is treated as ineligible solely because a provider returned no candidates.</p></section> : null}

      <CandidateSection eyebrow="Passed all current gates" title="Eligible members" description="Freshly analyzed assets that meet the current universe policy." candidates={result.eligibleMembers} />
      <CandidateSection eyebrow="Qualified with boundaries" title="Eligible with caveats" description="Relevant candidates with explicit coverage, liquidity, or adjacent-scope caveats." candidates={result.caveatedMembers} />
      <CandidateSection eyebrow="Pipeline in progress" title="Analysis pending" description="Canonical candidates awaiting identity, representation, coverage, liquidity, or bounded analysis capacity." candidates={result.pendingCandidates} compact />
      <CandidateSection eyebrow="Human verification" title="Manual review" description="Products or ambiguous representations that cannot safely pass automated asset eligibility." candidates={result.manualReviewCandidates} compact />

      {result.ineligibleCandidates.length ? <details className="v2-ineligible-drawer"><summary>View candidates that do not currently meet this universe's criteria <span>{result.ineligibleCount}</span></summary><div className="v2-candidate-grid">{result.ineligibleCandidates.map((candidate) => <CandidateCard key={candidate.candidateId} candidate={candidate} compact />)}</div></details> : null}

      <details className="v2-methodology-drawer">
        <summary>How universe discovery works</summary>
        <div><p>Candidates come from curated research seeds and existing provider discovery methods. Neither source is evidence or membership by itself, and source coverage may be incomplete.</p><p>Eligible asset membership requires canonical identity, compatible representation, family relevance, current coverage, liquidity eligibility, and a fresh full AssetResearchResultV2 analysis.</p><p>Membership is not ranking, endorsement, or investment advice. Ranking is a separate request-local comparison among eligible members and does not alter membership, the canonical asset score, confidence, verdict, or full analysis.</p></div>
      </details>
    </main>
  )
}

export default function PremiumDiscoverV2() {
  const location = useBrowserLocation()
  const route = useMemo(() => parseDiscoverV2Location(location), [location.pathname, location.search])
  const coordinatorRef = useRef(null)
  if (!coordinatorRef.current) coordinatorRef.current = createV2RequestCoordinator()
  const [state, setState] = useState({ status: 'loading', registry: null, definition: null, result: null, rankings: null, rankingError: null, error: null })

  useEffect(() => {
    const coordinator = coordinatorRef.current
    const { requestId, signal } = coordinator.begin()
    setState({ status: 'loading', registry: null, definition: null, result: null, rankings: null, rankingError: null, error: null })
    const load = async () => {
      try {
        if (route.kind === 'overview') {
          const registry = await fetchUniverseListV2(signal)
          if (coordinator.isCurrent(requestId)) setState({ status: 'ready', registry, definition: null, result: null, rankings: null, rankingError: null, error: null })
          return
        }
        if (route.kind !== 'universe') throw Object.assign(new Error('Universe route not found.'), { code: 'universe_not_found' })
        const definition = await fetchUniverseDefinitionV2(route.slug, signal)
        if (!coordinator.isCurrent(requestId)) return
        setState({ status: 'discovering', registry: null, definition, result: null, rankings: null, rankingError: null, error: null })
        const result = await discoverUniverseV2(route.slug, signal)
        if (!coordinator.isCurrent(requestId)) return
        let rankings = null
        let rankingError = null
        try {
          rankings = await fetchInstitutionalRankingsV2(route.slug, signal, { includeProvisional: true, includeWithheld: true })
        } catch (error) {
          if (error?.name === 'AbortError' || !coordinator.isCurrent(requestId)) return
          rankingError = error
        }
        if (coordinator.isCurrent(requestId)) setState({ status: 'ready', registry: null, definition, result, rankings, rankingError, error: null })
      } catch (error) {
        if (error?.name === 'AbortError' || !coordinator.isCurrent(requestId)) return
        setState({ status: 'error', registry: null, definition: null, result: null, rankings: null, rankingError: null, error })
      }
    }
    void load()
    return () => coordinator.cancel()
  }, [route.kind, route.slug])

  useEffect(() => {
    document.title = state.result ? `${state.result.universeDefinition.displayName} / ThesisCore Discover` : 'ThesisCore Discover / V2'
  }, [state.result])

  return <Shell>{state.status === 'loading' || state.status === 'discovering' ? <Loading detail={route.kind === 'universe'} /> : null}{state.status === 'error' ? <ErrorState error={state.error} /> : null}{state.status === 'ready' && state.registry ? <Overview registry={state.registry} /> : null}{state.status === 'ready' && state.result ? <UniverseDetail result={state.result} rankings={state.rankings} rankingError={state.rankingError} /> : null}</Shell>
}
