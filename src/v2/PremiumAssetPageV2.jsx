import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AssetResearchV2ContractError,
  normalizeAssetResearchResultV2,
} from './assetResearchResultV2'
import { normalizeProductResearchResultV2 } from './productResearchResultV2'
import { normalizeOneClickInstitutionalAnalysisV1 } from './oneClickInstitutionalAnalysisV1'
import { analyzeV2Asset, searchV2Assets, V2ApiError } from './assetResearchV2Api'
import {
  buildV2AssetPath,
  createV2RequestCoordinator,
  findExactCandidateForRoute,
  parseV2Location,
  queryForCanonicalRoute,
  v2ResultMatchesRoute,
} from './assetResearchV2Navigation'
import V2AssetSearch from './components/V2AssetSearch'
import V2AssetDecisionCommandCenter from './components/V2AssetDecisionCommandCenter'
import V2MarketLiquiditySupplyExperience from './components/V2MarketLiquiditySupplyExperience'
import V2ResearchRail from './components/V2ResearchRail'
import V2ResearchTabs from './components/V2ResearchTabs'
import V2SourcesPanel from './components/V2SourcesPanel'
import { V2CompactState, V2Icon, V2StatusPill } from './components/V2Primitives'
import { useV2RouteContext } from './shell/V2RouteContext'
import './PremiumAssetPageV2.css'

const EMPTY_RESEARCH_STATE = Object.freeze({
  status: 'idle',
  stage: '',
  result: null,
  contractSource: null,
  parityStatus: null,
  productResearchResultV2: null,
  productResearchParityStatus: 'compatibility_fallback',
  oneClickInstitutionalAnalysisV1: null,
  oneClickParityStatus: 'missing',
  error: null,
})

function deriveSuccessStatus(result) {
  const criticalStatuses = [result.identity.status, result.market.status, result.decision.status]
  if (criticalStatuses.includes('manual_review_required') || criticalStatuses.includes('unavailable')) return 'degraded'
  if (result.sourceHealth.status === 'unavailable' || result.sourceHealth.status === 'partial') return 'degraded'
  return 'success'
}

function LoadingSurface({ stage }) {
  return (
    <section className="v2-loading-surface" role="status" aria-live="polite">
      <div className="v2-loading-orbit" aria-hidden="true"><span /><span /><span /></div>
      <p className="v2-eyebrow">Live full recompute</p>
      <h1>{stage === 'resolving_asset' ? 'Resolving canonical identity' : 'Building the institutional research view'}</h1>
      <p>{stage === 'resolving_asset'
        ? 'Matching provider identity, representation, network, and contract scope.'
        : 'Collecting the canonical research result. Previous asset data is intentionally not displayed.'}</p>
      <div className="v2-loading-lines"><span /><span /><span /></div>
    </section>
  )
}

function V2Entry({ onSelect }) {
  return (
    <div className="v2-entry">
      <div className="v2-entry__ambient" aria-hidden="true" />
      <section className="v2-entry__content">
        <p className="v2-eyebrow">ThesisCore / Asset deep dive</p>
        <h1>Institutional crypto research, distilled to the decision that matters.</h1>
        <p className="v2-entry__lead">Search a canonical asset to inspect current market structure, supply integrity, token economics, thesis evidence, risks, and open diligence in one source-bound view.</p>
        <V2AssetSearch onSelect={onSelect} />
        <div className="v2-entry__principles">
          <span><V2Icon name="shield" /> Canonical identity first</span>
          <span><V2Icon name="source" /> Provenance stays visible</span>
          <span><V2Icon name="compass" /> Decision and uncertainty together</span>
        </div>
      </section>
      <section className="v2-entry__preview" aria-label="Research workflow preview">
        <div><span>01</span><strong>Market position</strong><p>Current price, capitalization, volume, supply, and liquidity context.</p></div>
        <div><span>02</span><strong>Fundamental thesis</strong><p>Direct answers, supporting evidence, missing analysis, and invalidation.</p></div>
        <div><span>03</span><strong>Decision boundary</strong><p>Verdict, confidence, score visibility, and the next diligence step.</p></div>
      </section>
    </div>
  )
}

function ErrorSurface({ status, error, onRetry, onSelect }) {
  const copy = {
    not_found: ['Asset not found', 'No exact canonical match could be established for this deep link.'],
    invalid_identity: ['Identity could not be verified', 'The provider, network, or contract scope does not match the requested asset.'],
    backend_error: ['Research service unavailable', 'The live analysis could not be completed. No stale result has been substituted.'],
    data_integrity_error: ['Data integrity check failed', 'The canonical research result was inconsistent, so this page failed closed.'],
  }[status] || ['Research unavailable', 'The current asset view could not be completed.']
  return (
    <div className="v2-error-layout">
      <V2CompactState icon={status === 'data_integrity_error' ? 'shield' : 'compass'} title={copy[0]} message={error?.message || copy[1]}>
        <div className="v2-error-actions">
          {onRetry ? <button type="button" className="v2-primary-button" onClick={onRetry}>Try live analysis again</button> : null}
          <a className="v2-secondary-link" href="/terminal-v2">Choose another asset</a>
        </div>
      </V2CompactState>
      <section className="v2-error-search"><h2>Resolve a different canonical asset</h2><V2AssetSearch onSelect={onSelect} /></section>
    </div>
  )
}

export default function PremiumAssetPageV2() {
  const { location, navigate, setPageContext } = useV2RouteContext()
  const route = useMemo(() => parseV2Location(location), [location.pathname, location.search])
  const coordinatorRef = useRef(null)
  if (!coordinatorRef.current) coordinatorRef.current = createV2RequestCoordinator()
  const [researchState, setResearchState] = useState(EMPTY_RESEARCH_STATE)
  const [retryKey, setRetryKey] = useState(0)
  const [activeSection, setActiveSection] = useState('overview')

  const selectCandidate = useCallback((candidate) => {
    const path = buildV2AssetPath(candidate)
    if (!path) {
      setResearchState({ ...EMPTY_RESEARCH_STATE, status: 'invalid_identity', error: new Error('This result has no canonical provider or contract identity.') })
      return
    }
    navigate(path)
  }, [navigate])

  useEffect(() => {
    if (route.kind !== 'asset') {
      coordinatorRef.current.cancel()
      if (route.kind === 'entry') setResearchState(EMPTY_RESEARCH_STATE)
      else setResearchState({ ...EMPTY_RESEARCH_STATE, status: route.kind === 'invalid' ? 'invalid_identity' : 'not_found' })
      return undefined
    }

    const coordinator = coordinatorRef.current
    const { requestId, signal } = coordinator.begin()
    setResearchState({ ...EMPTY_RESEARCH_STATE, status: 'resolving_asset', stage: 'resolving_asset' })

    const load = async () => {
      try {
        const query = queryForCanonicalRoute(route)
        const searchResponse = await searchV2Assets(query, signal)
        if (!coordinator.isCurrent(requestId)) return
        const candidate = findExactCandidateForRoute(searchResponse?.resolution, route)
        if (!candidate) {
          setResearchState({ ...EMPTY_RESEARCH_STATE, status: 'invalid_identity', error: new Error('No exact provider, network, and contract match was found for this route.') })
          return
        }
        setResearchState({ ...EMPTY_RESEARCH_STATE, status: 'analyzing', stage: 'analyzing' })
        const response = await analyzeV2Asset(query, candidate, signal)
        if (!coordinator.isCurrent(requestId)) return
        const normalized = normalizeAssetResearchResultV2(response)
        const productResearch = normalizeProductResearchResultV2(response)
        const oneClick = normalizeOneClickInstitutionalAnalysisV1(response)
        if (!v2ResultMatchesRoute(normalized.result, route)) {
          throw new AssetResearchV2ContractError('identity_mismatch', 'The completed analysis did not match the requested canonical asset scope.')
        }
        setResearchState({
          status: deriveSuccessStatus(normalized.result),
          stage: '',
          result: normalized.result,
          contractSource: normalized.source,
          parityStatus: normalized.parityStatus,
          productResearchResultV2: productResearch.result,
          productResearchParityStatus: productResearch.parityStatus,
          oneClickInstitutionalAnalysisV1: oneClick.result,
          oneClickParityStatus: oneClick.parityStatus,
          error: null,
        })
      } catch (error) {
        if (error?.name === 'AbortError' || !coordinator.isCurrent(requestId)) return
        const status = error instanceof AssetResearchV2ContractError
          ? 'data_integrity_error'
          : error instanceof V2ApiError ? error.code : 'backend_error'
        setResearchState({ ...EMPTY_RESEARCH_STATE, status, error })
      }
    }
    void load()
    return () => coordinator.cancel()
  }, [route, retryKey])

  useEffect(() => {
    const assetName = researchState.result?.identity?.data?.name
    document.title = assetName ? `${assetName} Research / ThesisCore` : 'ThesisCore / Institutional Asset Research'
  }, [researchState.result])

  useEffect(() => {
    const identity = researchState.result?.identity?.data
    setPageContext({
      assetName: identity?.name || route.identityScope?.name || null,
      assetSymbol: identity?.symbol || route.identityScope?.symbol || null,
      sourceUniverseSlug: route.identityScope?.sourceUniverseSlug || null,
      analysisStatus: researchState.status,
    })
  }, [researchState.result, researchState.status, route.identityScope, setPageContext])

  const selectSection = useCallback((section) => {
    setActiveSection(section.id)
    const targetId = section.kind === 'tab' ? 'research-sections' : section.id
    if (section.kind === 'tab') {
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}#${section.id}`)
    }
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const showResult = researchState.result && ['success', 'degraded'].includes(researchState.status)
  return (
    <>
      {route.kind === 'entry' ? <V2Entry onSelect={selectCandidate} /> : null}
      {['resolving_asset', 'analyzing'].includes(researchState.status) ? <LoadingSurface stage={researchState.stage} /> : null}
      {['not_found', 'invalid_identity', 'backend_error', 'data_integrity_error'].includes(researchState.status) ? (
        <ErrorSurface
          status={researchState.status}
          error={researchState.error}
          onRetry={route.kind === 'asset' ? () => setRetryKey((current) => current + 1) : null}
          onSelect={selectCandidate}
        />
      ) : null}
      {showResult ? (
        <div className="v2-asset-page">
          {researchState.status === 'degraded' ? (
            <div className="v2-degraded-banner">
              <V2StatusPill status="degraded" />
              <p>Some source-backed sections have limited coverage. Available facts remain visible without filling gaps with assumptions.</p>
            </div>
          ) : null}
          <div id="overview">
            <V2AssetDecisionCommandCenter
              result={researchState.result}
              productResearchResultV2={researchState.productResearchResultV2}
              oneClickInstitutionalAnalysisV1={researchState.oneClickInstitutionalAnalysisV1}
              activeSection={activeSection}
              onSelectSection={selectSection}
            />
          </div>
          <div className="v2-research-layout">
            <div className="v2-research-main">
              <div id="market-supply"><V2MarketLiquiditySupplyExperience result={researchState.result} productResearchResultV2={researchState.productResearchResultV2} /></div>
              <div id="research-sections">
                <V2ResearchTabs
                  result={researchState.result}
                  productResearchResultV2={researchState.productResearchResultV2}
                  activeTab={['tokenomics', 'fundamentals', 'reality', 'technical'].includes(activeSection) ? activeSection : 'tokenomics'}
                  onActiveTabChange={setActiveSection}
                />
              </div>
              <V2SourcesPanel result={researchState.result} productResearchResultV2={researchState.productResearchResultV2} />
            </div>
            <V2ResearchRail result={researchState.result} productResearchResultV2={researchState.productResearchResultV2} />
          </div>
          <footer className="v2-page-footer">
            <p>Research support only. ThesisCore separates current provider facts, deterministic calculations, bounded judgments, and missing evidence.</p>
            <span>Generated {researchState.result.generatedAt ? new Date(researchState.result.generatedAt).toLocaleString() : 'time unavailable'}</span>
          </footer>
        </div>
      ) : null}
    </>
  )
}
