import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const PremiumAssetPageV2 = lazy(() => import('./v2/PremiumAssetPageV2.jsx'))
const PremiumDiscoverV2 = lazy(() => import('./v2/PremiumDiscoverV2.jsx'))

function RootSurface() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  const isV2Path = pathname === '/terminal-v2' || pathname.startsWith('/terminal-v2/')

  if (pathname === '/terminal-v2/discover' || pathname.startsWith('/terminal-v2/discover/')) {
    return (
      <Suspense fallback={<div className="v2-route-loading" role="status">Opening ThesisCore Discover...</div>}>
        <PremiumDiscoverV2 />
      </Suspense>
    )
  }

  if (isV2Path) {
    return (
      <Suspense fallback={<div className="v2-route-loading" role="status">Opening ThesisCore V2...</div>}>
        <PremiumAssetPageV2 />
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
