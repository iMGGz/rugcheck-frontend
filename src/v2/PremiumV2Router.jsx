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

function RouteNotFound() {
  return (
    <section className="v2-shell-state" role="alert">
      <span className="v2-shell-state__icon"><V2Icon name="compass" size={26} /></span>
      <p className="v2-eyebrow">Route not found</p>
      <h1>This V2 research route is unavailable.</h1>
      <p>Choose a canonical customer route. Internal QA and planned product pages are not exposed here.</p>
      <div><V2Link className="v2-primary-button" href="/terminal-v2">Asset Research</V2Link><V2Link href="/terminal-v2/discover">Discover</V2Link></div>
    </section>
  )
}

function V2RouteContent() {
  const { route } = useV2RouteContext()
  if (route.kind === 'asset_entry' || route.kind === 'asset' || route.kind === 'invalid_asset') return <PremiumAssetPageV2 />
  if (route.kind === 'discover_overview' || route.kind === 'discover_universe' || route.kind === 'invalid_universe') return <PremiumDiscoverV2 />
  return <RouteNotFound />
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
