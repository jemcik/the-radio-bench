import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import type { GlossaryEntry } from './glossary'

/**
 * Glossary term with two interaction modes:
 *
 *   Hover  → lightweight tip floating just below the line under the cursor
 *   Click  → pinned reference card (Radix Popover) anchored to the same line
 *
 * Why the cursor-aware positioning. An inline term that wraps across two
 * lines has a single bounding box that spans BOTH lines (the union rect).
 * Anchoring a tooltip / popover to that union rect drops it in the middle
 * of the gap between lines — visually disconnected from where the user
 * actually pointed. The fix: `span.getClientRects()` returns one rect per
 * line; we pick the rect under the cursor (or focus) and use it as a
 * virtual anchor. Both the hover tip (a plain portal'd div) and the
 * Radix Popover read from that anchor.
 *
 * On touch devices only the click/tap mode is used.
 */

interface TermProps {
  /** Full glossary entry (or just a string for backward compat). */
  def: GlossaryEntry | string
  /** The inline text — usually the term itself. */
  children: ReactNode
  /** Optional accent color class. Defaults to text-[hsl(var(--term-accent))]. */
  className?: string
}

const TIP_DELAY_MS = 300

export function Term({ def, children, className = 'text-[hsl(var(--term-accent))]' }: TermProps) {
  const { t } = useTranslation('ui')
  const entry: GlossaryEntry =
    typeof def === 'string' ? { tip: def, detail: def } : def

  const spanRef = useRef<HTMLSpanElement | null>(null)
  // Which line of the span the cursor (or click) was on. Stored as an
  // index into span.getClientRects() so it stays valid through scroll.
  const lineIndex = useRef<number | null>(null)

  const [pinned, setPinned] = useState(false)
  const [tipOpen, setTipOpen] = useState(false)
  const [tipPos, setTipPos] = useState<{ top: number; left: number } | null>(null)
  const isTouch = useRef(false)
  const tipTimer = useRef<number | null>(null)
  const suppressTip = useRef(false)

  // Virtual anchor for the Radix Popover. Always returns the CURRENT rect
  // of the chosen line (re-queried per call), so the pinned popover stays
  // attached to the right place even after scroll / resize.
  //
  // `contextElement` points back at the real span. Floating-ui (used by
  // Radix Popper under the hood) calls `unwrapElement(virtualRef)` and
  // falls back to `virtualRef.contextElement` for a virtual reference —
  // it's what tells `autoUpdate` which scroll / resize ancestors to
  // observe. Without it the popover's position never recomputes on
  // scroll because no scroll listeners are wired up to the page.
  const virtualRef = useRef<{
    getBoundingClientRect(): DOMRect
    contextElement?: Element
  }>({
    getBoundingClientRect: () => {
      const span = spanRef.current
      if (!span || lineIndex.current === null) return new DOMRect()
      const rects = span.getClientRects()
      return (rects[lineIndex.current] ?? rects[0] ?? new DOMRect()) as DOMRect
    },
  })
  // Keep contextElement in sync with the span ref (set once on mount).
  useEffect(() => {
    virtualRef.current.contextElement = spanRef.current ?? undefined
  }, [])

  const findLineUnderCursor = (clientX: number, clientY: number): number => {
    const span = spanRef.current
    if (!span) return 0
    const rects = span.getClientRects()
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i]
      if (
        clientY >= r.top && clientY <= r.bottom &&
        clientX >= r.left && clientX <= r.right
      ) {
        return i
      }
    }
    // Cursor likely just outside; pick the rect with the closest vertical centre.
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i]
      const dist = Math.abs(clientY - (r.top + r.bottom) / 2)
      if (dist < bestDist) { bestDist = dist; best = i }
    }
    return best
  }

  const computeTipPos = () => {
    const span = spanRef.current
    if (!span || lineIndex.current === null) {
      setTipPos(null)
      return
    }
    const rects = span.getClientRects()
    const r = rects[lineIndex.current] ?? rects[0]
    if (!r) { setTipPos(null); return }
    setTipPos({ top: r.bottom + 6, left: r.left + r.width / 2 })
  }

  // Reposition the hover tip on scroll / resize while it's visible.
  useEffect(() => {
    if (!tipOpen) return
    const handler = () => computeTipPos()
    window.addEventListener('scroll', handler, true)
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler, true)
      window.removeEventListener('resize', handler)
    }
  }, [tipOpen])

  // Wheel-event forwarding for the pinned popover. Without this, hovering
  // over the popup eats wheel events that the user expects to scroll the
  // page underneath — and on long entries (balun/unun, ~280 words) the
  // popup's internal scrollbar never chains to the page at its boundary.
  //
  // Three constraints shape the implementation:
  //
  //   1. The page's scroll container is `<main className="overflow-y-auto">`
  //      in Layout.tsx, NOT the window. `window.scrollBy()` is a no-op
  //      here — we have to walk up from the term span at event time and
  //      find the nearest ancestor with `overflow-y: auto | scroll`.
  //
  //   2. React 18+ registers `onWheel` as a PASSIVE listener, so a React
  //      prop can't `preventDefault()` the browser's default wheel
  //      handling. The listener has to be attached natively with
  //      `{ passive: false }`.
  //
  //   3. A ref on PopoverContent can be null on the first useEffect tick
  //      (Radix's Presence/Portal mount race). Attaching the listener to
  //      `window` in CAPTURE phase sidesteps that — it fires before any
  //      element-level handler and doesn't depend on any ref. We locate
  //      the popup at event time via `closest('[data-radix-popper-content-wrapper]')`.
  //
  // Logic: forward wheel to the page when the popup has no scrollable
  // overflow (short entries) OR is at its top / bottom scroll boundary
  // in the wheel direction (long entries that exceed 70vh). Otherwise —
  // popup scrolls internally as default browser behaviour.
  useEffect(() => {
    if (!pinned) return
    const findScrollableAncestor = (start: Element | null): HTMLElement | null => {
      let node: Element | null = start?.parentElement ?? null
      while (node) {
        const style = getComputedStyle(node)
        if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
          return node as HTMLElement
        }
        node = node.parentElement
      }
      return null
    }
    const handler = (e: WheelEvent) => {
      const target = e.target as Element | null
      if (!target?.closest) return
      const wrapper = target.closest('[data-radix-popper-content-wrapper]')
      if (!wrapper) return
      const panel = wrapper.firstElementChild as HTMLElement | null
      if (!panel) return
      const { scrollTop, scrollHeight, clientHeight } = panel
      const canScroll = scrollHeight > clientHeight
      const atTop = scrollTop <= 0
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1
      const scrollingUp = e.deltaY < 0
      const scrollingDown = e.deltaY > 0
      if (
        !canScroll ||
        (atTop && scrollingUp) ||
        (atBottom && scrollingDown)
      ) {
        e.preventDefault()
        const scroller = findScrollableAncestor(spanRef.current)
        ;(scroller ?? window).scrollBy({ top: e.deltaY })
      }
    }
    window.addEventListener('wheel', handler, { passive: false, capture: true })
    return () => window.removeEventListener('wheel', handler, { capture: true })
  }, [pinned])

  const closePinned = () => {
    setPinned(false)
    setTipOpen(false)
    suppressTip.current = true
    setTimeout(() => { suppressTip.current = false }, 400)
  }

  return (
    <Popover
      open={pinned}
      onOpenChange={(open) => {
        if (!open) closePinned()
        else setPinned(true)
      }}
    >
      {/* Virtual anchor — positions PopoverContent against the line of
          the span under the user's pointer (or click). Renders no DOM
          element of its own. */}
      <PopoverAnchor virtualRef={virtualRef} />

      {/* `inline` (not inline-block) so the browser's line-break
          algorithm can keep adjacent punctuation attached to the term
          and the term itself can wrap mid-phrase. */}
      <span
        ref={spanRef}
        className={`relative inline border-b border-dashed border-current/40 ${pinned ? 'cursor-default' : 'cursor-help'} ${className}`}
        style={{ lineHeight: 'inherit' }}
        onTouchStart={() => { isTouch.current = true }}
        onPointerEnter={(e) => {
          if (isTouch.current || pinned || suppressTip.current) return
          lineIndex.current = findLineUnderCursor(e.clientX, e.clientY)
          if (tipTimer.current) clearTimeout(tipTimer.current)
          tipTimer.current = window.setTimeout(() => {
            computeTipPos()
            setTipOpen(true)
          }, TIP_DELAY_MS)
        }}
        onPointerMove={(e) => {
          if (isTouch.current || pinned) return
          const newLine = findLineUnderCursor(e.clientX, e.clientY)
          if (newLine !== lineIndex.current) {
            lineIndex.current = newLine
            if (tipOpen) computeTipPos()
          }
        }}
        onPointerLeave={() => {
          if (tipTimer.current) {
            clearTimeout(tipTimer.current)
            tipTimer.current = null
          }
          setTipOpen(false)
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          lineIndex.current = findLineUnderCursor(e.clientX, e.clientY)
          setPinned(v => !v)
          setTipOpen(false)
          setTimeout(() => { isTouch.current = false }, 300)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            // Keyboard activation: anchor to the first line of the span.
            lineIndex.current = 0
            setPinned(v => !v)
          }
        }}
      >
        {children}
      </span>

      {/* ── Hover tip (lightweight, plain portal'd div) ───────────────
          Anchored to the line of the span under the cursor — not the
          span's full bounding box, which would span multiple lines when
          the term wraps. The tip never shows while the popover is
          pinned. */}
      {tipOpen && !pinned && tipPos && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          className="fixed z-50 max-w-[240px] -translate-x-1/2 px-3 py-2 bg-popover/95 border border-border/60 shadow-md rounded-md text-[11px] leading-relaxed text-popover-foreground/80 font-normal not-prose pointer-events-none"
          style={{ top: tipPos.top, left: tipPos.left }}
        >
          {entry.tip}
        </div>,
        document.body,
      )}

      {/* ── Pinned popover (full reference card) ──────────────────── */}
      {/* `max-h-[70vh] overflow-y-auto` caps long entries; the
          window-level wheel handler in the `useEffect` above forwards
          wheel events to the page when the popup itself can't take them
          (no overflow, or already at its scroll boundary). */}
      <PopoverContent
        className="w-80 max-h-[70vh] overflow-y-auto px-4 py-3.5 text-xs leading-relaxed font-normal not-prose"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5 not-prose">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${className}`}>
            {t('glossary._ui.reference')}
          </span>
          <button
            className="text-muted-foreground hover:text-foreground cursor-pointer text-base leading-none px-0.5"
            onClick={(e) => {
              e.stopPropagation()
              closePinned()
            }}
            aria-label={t('glossary._ui.close')}
          >
            ×
          </button>
        </div>

        {/* Detail body */}
        <p className="text-[13px] leading-[1.6]">
          {entry.detail}
        </p>

        {/* Unit & Formula row */}
        {(entry.unit || entry.formula) && (
          <div className="mt-2.5 pt-2 border-t border-border/50">
            {entry.unit && (
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground/70">{t('glossary._ui.unit')}</span>{' '}
                {entry.unit}
              </p>
            )}
            {entry.formula && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                <span className="font-semibold text-foreground/70">{t('glossary._ui.formula')}</span>{' '}
                <span className="font-mono">{entry.formula}</span>
              </p>
            )}
          </div>
        )}

        {/* Related terms */}
        {entry.see && entry.see.length > 0 && (
          <p className="mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground/70">{t('glossary._ui.seeAlso')}</span>{' '}
            {entry.see.map(key => t(`glossary._names.${key}`, { defaultValue: key })).join(', ')}
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
