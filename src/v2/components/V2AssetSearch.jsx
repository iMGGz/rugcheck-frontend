import React, { useEffect, useId, useRef, useState } from 'react'
import { humanizeV2Value } from '../assetResearchResultV2'
import { searchV2Assets } from '../assetResearchV2Api'
import { canonicalAssetIdForCandidate } from '../assetResearchV2Navigation'
import { filterActiveUniverseResults } from '../v2RouteConfig'
import { V2Icon } from './V2Primitives'

function candidateLabel(candidate) {
  const parts = [candidate?.symbol, candidate?.chain].filter(Boolean)
  return parts.join(' / ') || 'Canonical metadata available'
}

export function normalizeV2SearchEntries(response, query, includeUniverses = false) {
  const resolution = response?.resolution
  const assets = [resolution?.directMatch, ...(Array.isArray(resolution?.candidates) ? resolution.candidates : [])]
    .filter(Boolean)
    .filter((candidate, index, list) => {
      const id = canonicalAssetIdForCandidate(candidate)
      return id && list.findIndex((entry) => canonicalAssetIdForCandidate(entry) === id) === index
    })
    .map((candidate) => ({ id: `asset-${canonicalAssetIdForCandidate(candidate)}`, type: 'asset', candidate }))
  const universes = includeUniverses
    ? filterActiveUniverseResults(query).map((universe) => ({ id: `universe-${universe.id}`, type: 'universe', universe }))
    : []
  return [...assets, ...universes]
}

export default function V2AssetSearch({
  onSelect,
  onSelectUniverse,
  onDismiss,
  compact = false,
  initialValue = '',
  autoSearch = true,
  autoFocus = false,
  includeUniverses = false,
  idPrefix = null,
}) {
  const reactId = useId().replace(/:/g, '')
  const inputId = `${idPrefix || 'v2-asset-search'}-${reactId}`
  const listboxId = `${inputId}-listbox`
  const [query, setQuery] = useState(initialValue)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [state, setState] = useState({ status: 'idle', entries: [], message: '' })
  const controllerRef = useRef(null)
  const timerRef = useRef(null)
  const requestSequenceRef = useRef(0)

  const clearPending = () => {
    window.clearTimeout(timerRef.current)
    controllerRef.current?.abort()
  }

  useEffect(() => () => clearPending(), [])

  const runSearch = async (requestedQuery = query) => {
    const cleanQuery = requestedQuery.trim()
    if (!cleanQuery) {
      setState({ status: 'idle', entries: [], message: '' })
      setActiveIndex(-1)
      return
    }
    clearPending()
    const controller = new AbortController()
    const requestId = requestSequenceRef.current + 1
    requestSequenceRef.current = requestId
    controllerRef.current = controller
    setState({ status: 'loading', entries: [], message: 'Resolving canonical research targets...' })
    try {
      const response = await searchV2Assets(cleanQuery, controller.signal)
      if (controller.signal.aborted || requestId !== requestSequenceRef.current) return
      const entries = normalizeV2SearchEntries(response, cleanQuery, includeUniverses)
      setActiveIndex(entries.length ? 0 : -1)
      setState({
        status: entries.length ? 'success' : 'empty',
        entries,
        message: entries.length
          ? `${entries.length} verified research target${entries.length === 1 ? '' : 's'}`
          : 'No canonical asset or active universe match was found.',
      })
    } catch (error) {
      if (error?.name === 'AbortError' || requestId !== requestSequenceRef.current) return
      const universeEntries = includeUniverses ? normalizeV2SearchEntries(null, cleanQuery, true) : []
      if (universeEntries.length) {
        setActiveIndex(0)
        setState({
          status: 'degraded',
          entries: universeEntries,
          message: 'Asset search is temporarily unavailable. Matching active universes remain accessible.',
        })
        return
      }
      setActiveIndex(-1)
      setState({ status: 'error', entries: [], message: error?.message || 'Search is temporarily unavailable.' })
    }
  }

  useEffect(() => {
    if (!autoSearch) return undefined
    window.clearTimeout(timerRef.current)
    const cleanQuery = query.trim()
    if (cleanQuery.length < 2) {
      controllerRef.current?.abort()
      setState({ status: 'idle', entries: [], message: '' })
      setActiveIndex(-1)
      return undefined
    }
    timerRef.current = window.setTimeout(() => void runSearch(cleanQuery), 280)
    return () => window.clearTimeout(timerRef.current)
  }, [autoSearch, includeUniverses, query])

  const openEntry = (entry) => {
    if (!entry) return
    clearPending()
    setState({ status: 'idle', entries: [], message: '' })
    setActiveIndex(-1)
    if (entry.type === 'universe') {
      setQuery(entry.universe.label)
      onSelectUniverse?.(entry.universe)
      return
    }
    setQuery(entry.candidate?.name || entry.candidate?.symbol || query)
    onSelect?.(entry.candidate)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (activeIndex >= 0 && state.entries[activeIndex]) {
      openEntry(state.entries[activeIndex])
      return
    }
    void runSearch()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (state.entries.length) {
        setState({ status: 'idle', entries: [], message: '' })
        setActiveIndex(-1)
      } else {
        onDismiss?.()
      }
      return
    }
    if (!state.entries.length || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    if (event.key === 'Home') setActiveIndex(0)
    else if (event.key === 'End') setActiveIndex(state.entries.length - 1)
    else if (event.key === 'ArrowDown') setActiveIndex((current) => (current + 1 + state.entries.length) % state.entries.length)
    else setActiveIndex((current) => (current - 1 + state.entries.length) % state.entries.length)
  }

  return (
    <div className={`v2-search${compact ? ' v2-search--compact' : ''}`}>
      <form className="v2-search__form" onSubmit={handleSubmit} role="search">
        <V2Icon name="search" size={19} />
        <label className="v2-visually-hidden" htmlFor={inputId}>Search canonical assets and research universes</label>
        <input
          id={inputId}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={Boolean(state.entries.length)}
          aria-controls={state.entries.length ? listboxId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={includeUniverses ? 'Search assets or active universes' : 'Search asset, provider ID, or contract'}
          autoComplete="off"
          autoFocus={autoFocus}
        />
        <button type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Resolving' : 'Research'}</button>
      </form>
      {state.message ? <p className={`v2-search__message v2-search__message--${state.status}`} aria-live="polite">{state.message}</p> : null}
      {state.entries.length ? (
        <div id={listboxId} className="v2-search__results" role="listbox" aria-label="Research matches">
          {state.entries.map((entry, index) => (
            <button
              id={`${inputId}-option-${index}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              className={`v2-search-result${activeIndex === index ? ' is-active' : ''}`}
              key={entry.id}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => openEntry(entry)}
            >
              {entry.type === 'universe' ? (
                <>
                  <span className="v2-search-result__identity">
                    <span><V2Icon name="layers" size={17} /></span>
                    <span><strong>{entry.universe.label}</strong><small>Active research universe</small></span>
                  </span>
                  <span className="v2-search-result__scope">Universe <V2Icon name="chevron" size={16} /></span>
                </>
              ) : (
                <>
                  <span className="v2-search-result__identity">
                    {entry.candidate?.logo ? <img src={entry.candidate.logo} alt="" /> : <span>{(entry.candidate?.symbol || entry.candidate?.name || '?').slice(0, 1)}</span>}
                    <span><strong>{entry.candidate?.name || 'Unnamed asset'}</strong><small>{candidateLabel(entry.candidate)}</small></span>
                  </span>
                  <span className="v2-search-result__scope">
                    {humanizeV2Value(entry.candidate?.identitySummary?.representationType, entry.candidate?.contractAddress ? 'Contract asset' : 'Canonical asset')}
                    <V2Icon name="chevron" size={16} />
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
