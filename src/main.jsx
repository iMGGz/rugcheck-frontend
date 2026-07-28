import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isV2Path } from './v2/v2RouteConfig'

const PremiumV2Router = lazy(() => import('./v2/PremiumV2Router.jsx'))

function RootSurface() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  if (isV2Path(pathname)) {
    return (
      <Suspense fallback={<div className="v2-route-loading" role="status">Opening ThesisCore V2...</div>}>
        <PremiumV2Router />
      </Suspense>
    )
  }

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootSurface />
  </StrictMode>,
)
