import React, { useEffect, useRef, useState } from 'react'
import { humanizeV2Value } from '../assetResearchResultV2'
import { searchV2Assets } from '../assetResearchV2Api'
import { canonicalAssetIdForCandidate } from '../assetResearchV2Navigation'
import { V2Icon } from './V2Primitives'

function candidateLabel(candidate) {
  const parts = [candidate?.symbol, candidate?.chain].filter(Boolean)
  return parts.join(' / ') || 'Canonical metadata available'
}

export default function V2AssetSearch({ onSelect, compact = false, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue)
  const [state, setState] = useState({ status: 'idle', candidates: [], message: '' })
  const controllerRef = useRef(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  const runSearch = async (event) => {
    event?.preventDefault()
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setState({ status: 'error', candidates: [], message: 'Enter an asset name, provider ID, or contract address.' })
      return
    }
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setState({ status: 'loading', candidates: [], message: 'Resolving canonical assets...' })
    try {
      const response = await searchV2Assets(cleanQuery, controller.signal)
      const resolution = response?.resolution
      const candidates = [resolution?.directMatch, ...(Array.isArray(resolution?.candidates) ? resolution.candidates : [])]
        .filter(Boolean)
        .filter((candidate, index, list) => {
          const id = canonicalAssetIdForCandidate(candidate)
          return id && list.findIndex((entry) => canonicalAssetIdForCandidate(entry) === id) === index
        })
      if (!candidates.length) {
        setState({ status: 'empty', candidates: [], message: 'No canonical asset match was found.' })
        return
      }
      setState({ status: 'success', candidates, message: `${candidates.length} canonical match${candidates.length === 1 ? '' : 'es'}` })
    } catch (error) {
      if (error?.name === 'AbortError') return
      setState({ status: 'error', candidates: [], message: error?.message || 'Search is temporarily unavailable.' })
    }
  }

  const selectCandidate = (candidate) => {
    setQuery(candidate?.name || candidate?.symbol || query)
    setState({ status: 'idle', candidates: [], message: '' })
    onSelect(candidate)
  }

  return (
    <div className={`v2-search${compact ? ' v2-search--compact' : ''}`}>
      <form className="v2-search__form" onSubmit={runSearch} role="search">
        <V2Icon name="search" size={19} />
        <label className="v2-visually-hidden" htmlFor={compact ? 'v2-asset-search-compact' : 'v2-asset-search'}>Search canonical assets</label>
        <input
          id={compact ? 'v2-asset-search-compact' : 'v2-asset-search'}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search asset, provider ID, or contract"
          autoComplete="off"
        />
        <button type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Resolving' : 'Research'}</button>
      </form>
      {state.message ? <p className={`v2-search__message v2-search__message--${state.status}`} aria-live="polite">{state.message}</p> : null}
      {state.candidates.length ? (
        <div className="v2-search__results" role="listbox" aria-label="Canonical asset matches">
          {state.candidates.map((candidate) => (
            <button
              type="button"
              role="option"
              aria-selected="false"
              className="v2-search-result"
              key={canonicalAssetIdForCandidate(candidate)}
              onClick={() => selectCandidate(candidate)}
            >
              <span className="v2-search-result__identity">
                {candidate?.logo ? <img src={candidate.logo} alt="" /> : <span>{(candidate?.symbol || candidate?.name || '?').slice(0, 1)}</span>}
                <span><strong>{candidate?.name || 'Unnamed asset'}</strong><small>{candidateLabel(candidate)}</small></span>
              </span>
              <span className="v2-search-result__scope">
                {humanizeV2Value(candidate?.identitySummary?.representationType, candidate?.contractAddress ? 'Contract asset' : 'Canonical asset')}
                <V2Icon name="chevron" size={16} />
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
