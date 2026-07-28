import React, { lazy, Suspense } from 'react'
import { V2Icon } from './components/V2Primitives'
import PremiumV2AppShell from './shell/PremiumV2AppShell'
import { V2Link, V2RouteProvider, useV2RouteContext } from './shell/V2RouteContext'

const PremiumAssetPageV2 = lazy(() => import('./PremiumAssetPageV2.jsx'))
const PremiumDiscoverV2 = lazy(() => import('./PremiumDiscoverV2.jsx'))

function RouteLoading() {
  return (
    <section className="v2-shell-state v2-shell-state--loading" role="status" aria-live="polite">
      <span className="v2-shell-loader" aria-hidden="true" />
      <p className="v2-eyebrow">Opening research workspace</p>
      <h1>Preparing this ThesisCore view</h1>
      <div className="v2-shell-skeleton"><span /><span /><span /></div>
    </section>
  )
}

const ROUTE_NOT_FOUND_COPY = Object.freeze({
  not_found: {
    eyebrow: 'Research route not found',
    title: 'This Research Terminal page is unavailable.',
    message: 'The address does not match an active customer research route.',
  },
  invalid_asset: {
    eyebrow: 'Invalid asset address',
    title: 'This asset route is incomplete.',
    message: 'Choose a canonical asset from search so its provider identity can be verified.',
  },
  invalid_universe: {
    eyebrow: 'Research universe not found',
    title: 'This research universe is unavailable.',
    message: 'Choose one of the active institutional research universes.',
  },
})

function goBackOrResearch() {
  if (window.history.length > 1) window.history.back()
  else window.location.assign('/terminal-v2')
}

function RouteNotFound({ kind = 'not_found' }) {
  const copy = ROUTE_NOT_FOUND_COPY[kind] || ROUTE_NOT_FOUND_COPY.not_found
  return (
    <section className="v2-shell-state" role="alert" aria-labelledby="v2-route-not-found-heading">
      <span className="v2-shell-state__icon"><V2Icon name="compass" size={26} /></span>
      <p className="v2-eyebrow">{copy.eyebrow}</p>
      <h1 id="v2-route-not-found-heading">{copy.title}</h1>
      <p>{copy.message}</p>
      <div>
        <V2Link className="v2-primary-button" href="/terminal-v2">Research Terminal</V2Link>
        <V2Link href="/terminal-v2/discover">Discover</V2Link>
        <a href="/">Legacy Research</a>
        <button type="button" onClick={goBackOrResearch}>Go back</button>
      </div>
    </section>
  )
}

function V2RouteContent() {
  const { route } = useV2RouteContext()
  if (route.kind === 'asset_entry' || route.kind === 'asset') return <PremiumAssetPageV2 />
  if (route.kind === 'discover_overview' || route.kind === 'discover_universe') return <PremiumDiscoverV2 />
  if (route.kind === 'invalid_asset' || route.kind === 'invalid_universe') return <RouteNotFound kind={route.kind} />
  return <RouteNotFound kind="not_found" />
}

export default function PremiumV2Router() {
  return (
    <V2RouteProvider>
      <PremiumV2AppShell>
        <Suspense fallback={<RouteLoading />}><V2RouteContent /></Suspense>
      </PremiumV2AppShell>
    </V2RouteProvider>
  )
}
