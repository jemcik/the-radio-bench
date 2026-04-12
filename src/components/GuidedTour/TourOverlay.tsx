import { useState, useEffect, useCallback } from 'react'
import type { TourStepDef } from './tourSteps'
import TourBuddy from './TourBuddy'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

interface TourOverlayProps {
  step: TourStepDef
  current: number
  total: number
  onNext: () => void
  onSkip: () => void
  /** Called when user clicks the backdrop — saves progress for later */
  onDismiss: () => void
}

/**
 * Full-screen overlay with SVG spotlight cutout and a themed tour card.
 *
 * The card positions itself relative to the spotlight target,
 * using the step's `placement` hint but adapting to viewport bounds.
 */
export default function TourOverlay({ step, current, total, onNext, onSkip, onDismiss }: TourOverlayProps) {
  const [rect, setRect] = useState<Rect | null>(null)
  const isLast = current === total - 1

  // Measure target element
  const measure = useCallback(() => {
    const el = document.querySelector(step.target)
    if (!el) return
    const r = el.getBoundingClientRect()
    const pad = step.padding ?? 4
    setRect({
      top: r.top - pad,
      left: r.left - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    })
  }, [step.target, step.padding])

  // Reset rect when step changes so the card doesn't animate from the old position.
  // Defer clearing to avoid synchronous setState in the effect body (react-hooks/set-state-in-effect).
  useEffect(() => {
    queueMicrotask(() => setRect(null))
    const t = setTimeout(measure, 250)
    return () => clearTimeout(t)
  }, [step, measure])

  // Re-measure on resize/scroll
  useEffect(() => {
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [measure])

  // Card position relative to spotlight
  const cardStyle = computeCardStyle(rect, step.placement)

  return (
    <div className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog">
      {/* SVG overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left}
                y={rect.top}
                width={rect.width}
                height={rect.height}
                rx={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.65)"
          mask="url(#tour-mask)"
          style={{ pointerEvents: 'auto' }}
          onClick={onDismiss}
        />
      </svg>

      {/* Spotlight border glow */}
      {rect && (
        <div
          className="absolute rounded-lg border-2 border-primary/50 pointer-events-none"
          style={{
            top: rect.top - 1,
            left: rect.left - 1,
            width: rect.width + 2,
            height: rect.height + 2,
            boxShadow: '0 0 20px hsl(var(--primary) / 0.3), inset 0 0 20px hsl(var(--primary) / 0.1)',
          }}
        />
      )}

      {/* Tour card */}
      <div
        className="absolute z-[10000] w-80 max-w-[calc(100vw-2rem)]"
        style={cardStyle}
      >
        <div className="rounded-xl border-2 border-primary/40 border-t-[3px] border-t-primary bg-card shadow-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Pip-boy buddy */}
              <TourBuddy size={44} className="text-primary shrink-0 mt-0.5" />

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground leading-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {step.body}
                </p>
              </div>
            </div>

            {/* Footer: dots + actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
              {/* Step dots */}
              <div className="flex gap-1.5">
                {Array.from({ length: total }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === current ? 'bg-primary' : i < current ? 'bg-primary/40' : 'bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onSkip}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isLast ? '' : 'Skip tour'}
                </button>
                <button
                  onClick={onNext}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  {isLast ? 'Start reading' : 'Next'}
                  {!isLast && (
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06L7.28 12.78a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Card positioning hook ────────────────────────────────────────────────── */

/** Pure function — no refs, safe to call during render. */
function computeCardStyle(
  rect: Rect | null,
  placement: TourStepDef['placement'],
): React.CSSProperties {
  if (!rect) return { opacity: 0 }

  // Fixed estimates — the card has `w-80` (320px) and content ~180-220px tall
  const cw = 320
  const ch = 210
  const gap = 16
  const vw = window.innerWidth
  const vh = window.innerHeight

  let top = 0
  let left = 0

  switch (placement) {
    case 'right':
      top = rect.top
      left = rect.left + rect.width + gap
      break
    case 'left':
      top = rect.top
      left = rect.left - cw - gap
      break
    case 'bottom':
      top = rect.top + rect.height + gap
      left = rect.left + rect.width / 2 - cw / 2
      break
    case 'top':
      top = rect.top - ch - gap
      left = rect.left + rect.width / 2 - cw / 2
      break
  }

  // Clamp to viewport
  if (left + cw > vw - 16) left = vw - cw - 16
  if (left < 16) left = 16
  if (top + ch > vh - 16) top = vh - ch - 16
  if (top < 16) top = 16

  return { top, left, opacity: 1, transition: 'top 0.3s ease, left 0.3s ease, opacity 0.3s ease' }
}
