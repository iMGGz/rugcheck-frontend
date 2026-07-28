import React, { Component, useCallback, useEffect, useRef, useState } from 'react'
import { V2Icon } from '../components/V2Primitives'
import {
  buildV2Breadcrumbs,
  isNavigationItemActive,
  V2_NAVIGATION_GROUPS,
  V2_SHELL_VERSION,
} from '../v2RouteConfig'
import V2GlobalSearch from './V2GlobalSearch'
import { useV2RouteContext, V2Link } from './V2RouteContext'
import '../styles/v2-tokens.css'
import '../styles/v2-shell.css'

function focusableElements(container) {
  return Array.from(container?.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
  ) || [])
}

class V2ShellErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidUpdate(previousProps) {
    if (previousProps.routeKey !== this.props.routeKey && this.state.failed) this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section className="v2-shell-state v2-shell-state--error" role="alert">
        <p className="v2-eyebrow">Research view unavailable</p>
        <h1>This page could not be displayed safely.</h1>
        <p>The shell remains available. No partial analysis or raw error details have been substituted.</p>
        <V2Link className="v2-primary-button" href="/terminal-v2">Return to Asset Research</V2Link>
      </section>
    )
  }
}

function NavigationContent({ route, collapsed = false, onNavigate }) {
  return (
    <div className="v2-primary-navigation__content">
      {V2_NAVIGATION_GROUPS.map((group) => (
        <section key={group.id} className={`v2-nav-group${group.secondary ? ' v2-nav-group--secondary' : ''}`}>
          <h2>{collapsed ? <span className="v2-visually-hidden">{group.label}</span> : group.label}</h2>
          <ul>
            {group.items.map((item) => {
              const active = isNavigationItemActive(item, route)
              const content = (
                <>
                  <span className="v2-nav-item__icon"><V2Icon name={item.icon} size={18} /></span>
                  <span className="v2-nav-item__label">{item.label}</span>
                  {active ? <span className="v2-nav-item__active-mark" aria-hidden="true" /> : null}
                </>
              )
              return (
                <li key={item.id}>
                  {item.externalShell ? (
                    <a
                      className="v2-nav-item"
                      href={item.href}
                      aria-label={collapsed ? item.label : undefined}
                      title={collapsed ? item.label : undefined}
                      onClick={onNavigate}
                    >
                      {content}
                    </a>
                  ) : (
                    <V2Link
                      className={`v2-nav-item${active ? ' is-active' : ''}`}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      title={collapsed ? item.label : undefined}
                      onNavigate={onNavigate}
                    >
                      {content}
                    </V2Link>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Breadcrumbs({ route, pageContext }) {
  const items = buildV2Breadcrumbs(route, pageContext)
  return (
    <nav className="v2-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {index ? <span className="v2-breadcrumbs__separator" aria-hidden="true">/</span> : null}
            {item.current ? <span aria-current="page" title={item.label}>{item.label}</span> : <V2Link href={item.href}>{item.label}</V2Link>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function PremiumV2AppShell({ children }) {
  const { route, pageContext } = useV2RouteContext()
  const [navigationCollapsed, setNavigationCollapsed] = useState(false)
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const drawerRef = useRef(null)
  const menuTriggerRef = useRef(null)

  const closeMobileNavigation = useCallback(() => {
    setMobileNavigationOpen(false)
  }, [])

  useEffect(() => {
    closeMobileNavigation()
    setSearchOpen(false)
  }, [route.pathname, closeMobileNavigation])

  useEffect(() => {
    if (!mobileNavigationOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    focusableElements(drawerRef.current)[0]?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMobileNavigation()
        menuTriggerRef.current?.focus()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusableElements(drawerRef.current)
      if (!items.length) return
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault()
        items[items.length - 1].focus()
      } else if (!event.shiftKey && document.activeElement === items[items.length - 1]) {
        event.preventDefault()
        items[0].focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileNavigationOpen, closeMobileNavigation])

  return (
    <div className={`v2-app-shell${navigationCollapsed ? ' v2-app-shell--nav-collapsed' : ''}`} data-shell-version={V2_SHELL_VERSION}>
      <a className="v2-skip-link" href="#v2-main-content">Skip to main content</a>
      <header className="v2-global-header">
        <button
          ref={menuTriggerRef}
          type="button"
          className="v2-icon-button v2-mobile-nav-trigger"
          aria-label="Open product navigation"
          aria-expanded={mobileNavigationOpen}
          aria-controls="v2-mobile-navigation"
          onClick={() => setMobileNavigationOpen(true)}
        >
          <V2Icon name="menu" />
        </button>
        <V2Link href="/terminal-v2" className="v2-brand" aria-label="ThesisCore V2 Asset Research">
          <span className="v2-brand__mark">TC</span>
          <span><strong>ThesisCore</strong><small>Institutional Research</small></span>
        </V2Link>
        <div className="v2-header-context">
          <span>{route.kind === 'discover_universe' ? 'Active universe' : route.kind.startsWith('discover') ? 'Market intelligence' : 'Research terminal'}</span>
          <strong>{pageContext.headerLabel || route.label}</strong>
        </div>
        <V2GlobalSearch open={searchOpen} onOpen={() => setSearchOpen(true)} onClose={() => setSearchOpen(false)} />
        <div className="v2-header-utility">
          <span className="v2-header-boundary">Research support only</span>
          <a href="/" className="v2-header-legacy-link">Legacy</a>
        </div>
      </header>

      <aside className="v2-primary-navigation" aria-label="Primary product navigation">
        <NavigationContent route={route} collapsed={navigationCollapsed} />
        <button
          type="button"
          className="v2-nav-collapse"
          aria-label={navigationCollapsed ? 'Expand primary navigation' : 'Collapse primary navigation'}
          aria-expanded={!navigationCollapsed}
          onClick={() => setNavigationCollapsed((current) => !current)}
        >
          <V2Icon name="collapse" size={17} />
          <span>{navigationCollapsed ? 'Expand' : 'Collapse navigation'}</span>
        </button>
      </aside>

      <div className="v2-workspace">
        <div className="v2-route-context">
          <Breadcrumbs route={route} pageContext={pageContext} />
          <span className="v2-route-context__status">{pageContext.routeStatus || 'Canonical V2 route'}</span>
        </div>
        <main id="v2-main-content" className="v2-page-frame" tabIndex={-1}>
          <V2ShellErrorBoundary routeKey={route.pathname}>{children}</V2ShellErrorBoundary>
        </main>
      </div>

      {mobileNavigationOpen ? (
        <div className="v2-mobile-nav-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeMobileNavigation()
            menuTriggerRef.current?.focus()
          }
        }}>
          <aside ref={drawerRef} id="v2-mobile-navigation" className="v2-mobile-navigation" aria-label="Mobile product navigation">
            <header>
              <div><span className="v2-brand__mark">TC</span><strong>Navigate ThesisCore</strong></div>
              <button type="button" className="v2-icon-button" aria-label="Close product navigation" onClick={() => {
                closeMobileNavigation()
                menuTriggerRef.current?.focus()
              }}><V2Icon name="close" /></button>
            </header>
            <NavigationContent route={route} onNavigate={closeMobileNavigation} />
            <footer>Customer research routes only. Internal QA remains in the authorized legacy workflow.</footer>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
