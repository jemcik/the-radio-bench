import { useState, useRef, type ReactNode } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import type { GlossaryEntry } from '@/data/glossary'

/**
 * Glossary term with two interaction modes:
 *
 *   Hover  → lightweight tooltip (tip only) via shadcn Tooltip
 *   Click  → pinned reference card with detail, unit, formula, related terms via shadcn Popover
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

  const [pinned, setPinned] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const isTouch = useRef(false)
  const suppressTooltip = useRef(false)

  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <Popover open={pinned} onOpenChange={(open) => {
        setPinned(open)
        if (!open) {
          // Suppress tooltip briefly after popover closes so it doesn't flash
          setTooltipOpen(false)
          suppressTooltip.current = true
          setTimeout(() => { suppressTooltip.current = false }, 400)
        }
      }}>
        <Tooltip
          open={tooltipOpen && !pinned}
          onOpenChange={(open) => {
            // Don't show tooltip on touch, when popover is open, or right after popover closes
            if (!isTouch.current && !pinned && !suppressTooltip.current) setTooltipOpen(open)
          }}
        >
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <span
                className={`relative inline-block border-b border-dashed border-current/40 ${pinned ? 'cursor-default' : 'cursor-help'} ${className}`}
                style={{ lineHeight: 'inherit' }}
                onTouchStart={() => { isTouch.current = true }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setPinned(v => !v)
                  setTooltipOpen(false)
                  setTimeout(() => { isTouch.current = false }, 300)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setPinned(v => !v)
                  }
                }}
              >
                {children}
              </span>
            </TooltipTrigger>
          </PopoverTrigger>

          {/* ── Hover tooltip (lightweight, tip only) ──── */}
          <TooltipContent
            className="max-w-[240px] px-3 py-2 bg-popover/95 border border-border/60 shadow-md text-[11px] leading-relaxed text-popover-foreground/80 font-normal not-prose"
            sideOffset={6}
          >
            {entry.tip}
          </TooltipContent>
        </Tooltip>

        {/* ── Pinned popover (full reference card) ──── */}
        <PopoverContent
          className="w-80 px-4 py-3.5 text-xs leading-relaxed font-normal not-prose"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-1.5 not-prose">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${className}`}>
              Reference
            </span>
            <button
              className="text-muted-foreground hover:text-foreground cursor-pointer text-base leading-none px-0.5"
              onClick={(e) => {
                e.stopPropagation()
                setPinned(false)
                setTooltipOpen(false)
                suppressTooltip.current = true
                setTimeout(() => { suppressTooltip.current = false }, 400)
              }}
              aria-label="Close"
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
                  <span className="font-semibold text-foreground/70">Unit:</span>{' '}
                  {entry.unit}
                </p>
              )}
              {entry.formula && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  <span className="font-semibold text-foreground/70">Formula:</span>{' '}
                  <span className="font-mono">{entry.formula}</span>
                </p>
              )}
            </div>
          )}

          {/* Related terms */}
          {entry.see && entry.see.length > 0 && (
            <p className="mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground/70">See also:</span>{' '}
              {entry.see.join(', ')}
            </p>
          )}
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}
