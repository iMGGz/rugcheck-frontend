import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isV2Path } from './v2/v2RouteConfig'

const PremiumV2Router = lazy(() => import('./v2/PremiumV2Router.jsx'))

function goBackOrHome() {
  if (window.history.length > 1) window.history.back()
  else window.location.assign('/')
}

function GlobalRouteNotFound() {
  return (
    <main className="global-route-state">
      <section aria-labelledby="global-route-heading">
        <p>Page not found</p>
        <h1 id="global-route-heading">This ThesisCore page is unavailable.</h1>
        <p>The address may be incomplete or no longer active. Continue in the Research Terminal or return to the legacy research workspace.</p>
        <nav aria-label="Page recovery">
          <a href="/terminal-v2">Research Terminal</a>
          <a href="/terminal-v2/discover">Discover</a>
          <a href="/">Legacy Research</a>
          <button type="button" onClick={goBackOrHome}>Go back</button>
        </nav>
      </section>
    </main>
  )
}

function RootSurface() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  if (isV2Path(pathname)) {
    return (
      <Suspense fallback={<div className="v2-route-loading" role="status">Opening Research Terminal...</div>}>
        <PremiumV2Router />
      </Suspense>
    )
  }

  return pathname === '/' ? <App /> : <GlobalRouteNotFound />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootSurface />
  </StrictMode>,
)
