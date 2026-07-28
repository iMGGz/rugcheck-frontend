import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { resolveV2Route } from '../v2RouteConfig'

function browserLocation() {
  if (typeof window === 'undefined') return { pathname: '/terminal-v2', search: '', hash: '' }
  return { pathname: window.location.pathname, search: window.location.search, hash: window.location.hash }
}

const DEFAULT_CONTEXT = Object.freeze({
  location: browserLocation(),
  route: resolveV2Route(browserLocation()),
  pageContext: {},
  navigate: () => {},
  publishPageContext: () => {},
  setPageContext: () => {},
})

const V2RouteContext = createContext(DEFAULT_CONTEXT)

export function V2RouteProvider({ children }) {
  const [location, setLocation] = useState(browserLocation)
  const [pageContext, setPageContext] = useState({})
  const route = useMemo(
    () => resolveV2Route(location),
    [location.pathname, location.search],
  )

  useEffect(() => {
    const handlePopState = () => setLocation(browserLocation())
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('hashchange', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('hashchange', handlePopState)
    }
  }, [])

  useEffect(() => {
    setPageContext({})
  }, [route.pathname])

  const navigate = useCallback((path, options = {}) => {
    if (!path || typeof window === 'undefined') return
    const target = new URL(path, window.location.origin)
    const method = options.replace ? 'replaceState' : 'pushState'
    window.history[method]({}, '', `${target.pathname}${target.search}${target.hash}`)
    setLocation(browserLocation())
    if (!options.preserveScroll) {
      window.scrollTo({ top: 0, behavior: options.instant ? 'auto' : 'smooth' })
    }
  }, [])

  const publishPageContext = useCallback((nextContext) => {
    setPageContext((current) => {
      const next = typeof nextContext === 'function' ? nextContext(current) : nextContext
      return next && typeof next === 'object' ? next : {}
    })
  }, [])

  const value = useMemo(
    () => ({ location, route, pageContext, navigate, publishPageContext, setPageContext: publishPageContext }),
    [location, route, pageContext, navigate, publishPageContext],
  )
  return <V2RouteContext.Provider value={value}>{children}</V2RouteContext.Provider>
}

export function useV2RouteContext() {
  return useContext(V2RouteContext)
}

export function V2Link({ href, replace = false, preserveScroll = false, onNavigate, children, ...props }) {
  const { navigate } = useV2RouteContext()
  const handleClick = (event) => {
    props.onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!href?.startsWith('/terminal-v2')) return
    event.preventDefault()
    navigate(href, { replace, preserveScroll })
    onNavigate?.()
  }
  return <a {...props} href={href} onClick={handleClick}>{children}</a>
}
