import { useState, useRef, useEffect, useLayoutEffect, useCallback, type ReactNode } from 'react'
import type { GlossaryEntry } from '@/data/glossary'

/**
 * Glossary term with two interaction modes:
 *
 *   Hover  → lightweight tooltip (tip only)
 *   Click  → pinned reference card with detail, unit, formula, related terms
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

export function Term({ def, children, className = 'text-[hsl(var(--term-accent))]' }: TermProps) {
  // Normalize: support plain string (legacy) or full GlossaryEntry
  const entry: GlossaryEntry =
    typeof def === 'string' ? { tip: def, detail: def } : def

  // Two separate states: hover (ephemeral) vs pinned (persistent click)
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [pos, setPos] = useState<'above' | 'below'>('above')
  const [align, setAlign] = useState<'center' | 'left' | 'right'>('center')
  const wrapRef = useRef<HTMLSpanElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  const isTouch = useRef(false)

  const visible = hover || pinned

  // Reposition after the tooltip/popup has rendered so we can measure it
  const reposition = useCallback(() => {
    if (!wrapRef.current) return
    const wrapRect = wrapRef.current.getBoundingClientRect()

    // ── Vertical: prefer above, fall back to below ──
    // If we have a rendered tip, use its actual height; otherwise estimate
    const tipH = tipRef.current?.getBoundingClientRect().height ?? 200
    const spaceAbove = wrapRect.top
    const spaceBelow = window.innerHeight - wrapRect.bottom
    const margin = 12

    if (spaceAbove >= tipH + margin) {
      setPos('above')
    } else if (spaceBelow >= tipH + margin) {
      setPos('below')
    } else {
      // Neither side has enough room — pick whichever has more
      setPos(spaceAbove >= spaceBelow ? 'above' : 'below')
    }

    // ── Horizontal: center, then nudge if clipped ──
    const tipW = tipRef.current?.getBoundingClientRect().width ?? 320
    const halfTip = tipW / 2
    const centerX = wrapRect.left + wrapRect.width / 2
    if (centerX - halfTip < 8) setAlign('left')
    else if (centerX + halfTip > window.innerWidth - 8) setAlign('right')
    else setAlign('center')
  }, [])

  // Measure and position synchronously before paint to avoid flicker.
  // setState inside useLayoutEffect is intentional here — we need the DOM
  // measurements before the browser paints to prevent visual flicker.
  useLayoutEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      reposition()
      // Second pass after the popup is fully in the DOM
      requestAnimationFrame(reposition)
    }
  }, [visible, pinned, reposition])

  // Close pinned popup on outside click/tap or Escape
  useEffect(() => {
    if (!pinned) return
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (
        wrapRef.current && !wrapRef.current.contains(e.target as Node) &&
        tipRef.current && !tipRef.current.contains(e.target as Node)
      ) {
        setPinned(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPinned(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [pinned])

  const alignClass =
    align === 'left'  ? 'left-0' :
    align === 'right' ? 'right-0' :
    'left-1/2 -translate-x-1/2'

  return (
    <span
      ref={wrapRef}
      className={`relative inline-block border-b border-dashed border-current/40 ${pinned ? 'cursor-default' : 'cursor-help'} ${className}`}
      style={{ lineHeight: 'inherit' }}
      onTouchStart={() => { isTouch.current = true }}
      onMouseEnter={() => { if (!isTouch.current && !pinned) setHover(true) }}
      onMouseLeave={() => { if (!isTouch.current) setHover(false) }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setPinned((v) => !v)
        setHover(false)
        setTimeout(() => { isTouch.current = false }, 300)
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setPinned((v) => !v)
        }
      }}
    >
      {children}

      {/* ── Hover tooltip (small, ephemeral) ─────────────────────── */}
      {hover && !pinned && (
        <span
          role="tooltip"
          className={`
            absolute z-50 block pointer-events-none
            w-[240px] px-3 py-2 rounded-md
            bg-popover/95 border border-border/60 shadow-md
            text-[11px] leading-relaxed text-popover-foreground/80 font-normal
            not-prose
            ${pos === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'}
            ${alignClass}
          `}
        >
          <span
            className={`
              absolute left-1/2 -translate-x-1/2
              w-2 h-2 rotate-45 bg-popover/95 border-border/60
              ${pos === 'above' ? 'bottom-[-5px] border-r border-b' : 'top-[-5px] border-l border-t'}
            `}
          />
          {entry.tip}
        </span>
      )}

      {/* ── Pinned popup (rich reference card, persistent) ────── */}
      {pinned && (
        <span
          ref={tipRef}
          role="dialog"
          aria-label="Term reference"
          className={`
            absolute z-50 block
            w-[320px] px-4 py-3.5 rounded-lg
            bg-popover border border-border shadow-2xl
            text-xs leading-relaxed text-popover-foreground font-normal
            not-prose
            ${pos === 'above' ? 'bottom-full mb-2.5' : 'top-full mt-2.5'}
            ${alignClass}
          `}
        >
          {/* Arrow */}
          <span
            className={`
              absolute left-1/2 -translate-x-1/2
              w-2.5 h-2.5 rotate-45 bg-popover border-border
              ${pos === 'above' ? 'bottom-[-6px] border-r border-b' : 'top-[-6px] border-l border-t'}
            `}
          />

          {/* Header */}
          <span className="flex items-center justify-between mb-1.5 not-prose">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${className}`}>
              Reference
            </span>
            <span
              role="button"
              tabIndex={0}
              className="text-muted-foreground hover:text-foreground cursor-pointer text-base leading-none px-0.5"
              onClick={(e) => { e.stopPropagation(); setPinned(false) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setPinned(false) } }}
              aria-label="Close"
            >
              ×
            </span>
          </span>

          {/* Detail body */}
          <span className="block text-[13px] leading-[1.6]">
            {entry.detail}
          </span>

          {/* Unit & Formula row */}
          {(entry.unit || entry.formula) && (
            <span className="block mt-2.5 pt-2 border-t border-border/50">
              {entry.unit && (
                <span className="block text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground/70">Unit:</span>{' '}
                  {entry.unit}
                </span>
              )}
              {entry.formula && (
                <span className="block text-[11px] text-muted-foreground mt-0.5">
                  <span className="font-semibold text-foreground/70">Formula:</span>{' '}
                  <span className="font-mono">{entry.formula}</span>
                </span>
              )}
            </span>
          )}

          {/* Related terms */}
          {entry.see && entry.see.length > 0 && (
            <span className="block mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground/70">See also:</span>{' '}
              {entry.see.join(', ')}
            </span>
          )}
        </span>
      )}
    </span>
  )
}
