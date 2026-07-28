import React, { useCallback, useEffect, useRef } from 'react'
import { buildV2AssetPath } from '../assetResearchV2Navigation'
import V2AssetSearch from '../components/V2AssetSearch'
import { V2Icon } from '../components/V2Primitives'
import { useV2RouteContext } from './V2RouteContext'

function focusableElements(container) {
  return Array.from(container?.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
  ) || [])
}

export default function V2GlobalSearch({ open, onOpen, onClose }) {
  const { navigate } = useV2RouteContext()
  const dialogRef = useRef(null)
  const triggerRef = useRef(null)
  const closeAndRestoreFocus = useCallback(() => {
    onClose()
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }, [onClose])

  useEffect(() => {
    const handleShortcut = (event) => {
      const target = event.target
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpen()
      } else if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [onOpen])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = focusableElements(dialogRef.current)[0]
    first?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeAndRestoreFocus()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusableElements(dialogRef.current)
      if (!items.length) return
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, closeAndRestoreFocus])

  const selectAsset = (candidate) => {
    const path = buildV2AssetPath(candidate)
    if (!path) return
    onClose()
    navigate(path)
  }

  const selectUniverse = (universe) => {
    onClose()
    navigate(universe.href)
  }

  return (
    <>
      <button ref={triggerRef} type="button" className="v2-global-search-trigger" onClick={onOpen} aria-haspopup="dialog">
        <V2Icon name="search" size={18} />
        <span>Search assets or universes</span>
        <kbd>Ctrl K</kbd>
      </button>
      {open ? (
        <div className="v2-search-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeAndRestoreFocus()
        }}>
          <section ref={dialogRef} className="v2-search-dialog" role="dialog" aria-modal="true" aria-labelledby="v2-global-search-title">
            <header>
              <div><p className="v2-eyebrow">Global research access</p><h2 id="v2-global-search-title">Open an asset or active universe</h2></div>
              <button type="button" className="v2-icon-button" onClick={closeAndRestoreFocus} aria-label="Close global search"><V2Icon name="close" /></button>
            </header>
            <V2AssetSearch
              idPrefix="v2-global-search"
              autoFocus
              autoSearch
              includeUniverses
              onSelect={selectAsset}
              onSelectUniverse={selectUniverse}
              onDismiss={closeAndRestoreFocus}
            />
            <footer><span>Arrow keys to move</span><span>Enter to open</span><span>Esc to close</span></footer>
          </section>
        </div>
      ) : null}
    </>
  )
}
