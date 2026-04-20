/**
 * Chapter 1.3 — Waveform gallery (animated).
 *
 * Three side-by-side waveform tiles — sine, square, triangle — all
 * normalised to peak amplitude 1. Each tile's trace scrolls smoothly
 * to the left at a shared pace, like a long stretch of signal passing
 * across an oscilloscope screen. The tiles share the same phase so
 * the reader can visually correlate features at matching times.
 *
 * Under each tile, three numbers (true RMS, form factor, averaging-DMM
 * reading) reveal the punchline: the averaging-DMM column matches the
 * true RMS only for the sine (green); on square and triangle it reads
 * wrong (orange).
 *
 * Animation respects `prefers-reduced-motion` — if the user has set
 * that preference, the wave freezes at phase 0 (standard static view).
 */
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal } from '@/lib/format'
import { svgTokens } from './svgTokens'

// ── Per-tile geometry (shared by all three tiles) ────────────────
const TILE_W = 160
const TILE_H = 90
const INNER_PAD_X = 8
const INNER_PAD_Y = 10
const PLOT_X0 = INNER_PAD_X
const PLOT_Y0 = INNER_PAD_Y
const PLOT_W = TILE_W - 2 * INNER_PAD_X   // 144
const PLOT_H = TILE_H - 2 * INNER_PAD_Y   // 70
const PLOT_CY = PLOT_Y0 + PLOT_H / 2
const HALF_AMP = (PLOT_H / 2) - 8         // 8 px headroom — at 4 px the
                                          // stroke-width and the square
                                          // wave's peak line both grazed
                                          // the tile's top edge.

// Two full periods visible across the plot width.
const CYCLES = 2

// ── Animation ────────────────────────────────────────────────────
// One period of scroll = one full cycle's worth of horizontal shift.
// Because the waveforms are periodic with period (PLOT_W / CYCLES),
// shifting by exactly that much looks identical → seamless loop.
const PERIOD_MS = 3200

// ── Phase-aware waveform generators ──────────────────────────────
// Each generator returns the SVG path for the waveform sampled across
// the plot width, offset by `phase` radians. Dense sampling (N=280)
// keeps square-wave transitions visually near-vertical at this size.

const N_SAMPLES = 280

function pathFor(fn: (angle: number) => number, phase: number): string {
  let d = ''
  for (let i = 0; i <= N_SAMPLES; i++) {
    const u = i / N_SAMPLES
    const angle = u * CYCLES * 2 * Math.PI + phase
    const yVal = fn(angle)
    const x = PLOT_X0 + u * PLOT_W
    const y = PLOT_CY - yVal * HALF_AMP
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

const sineFn = (a: number) => Math.sin(a)
const squareFn = (a: number) => (Math.sin(a) >= 0 ? 1 : -1)
const triangleFn = (a: number) => {
  const t = ((a / (2 * Math.PI)) % 1 + 1) % 1  // 0 ≤ t < 1
  if (t < 0.25) return 4 * t
  if (t < 0.75) return 2 - 4 * t
  return 4 * t - 4
}

// ── Derived constants (form factors etc) ─────────────────────────
const SINE = {
  rms: 1 / Math.sqrt(2),
  avg: 2 / Math.PI,
  formFactor: Math.PI / (2 * Math.sqrt(2)),
}
const SQUARE = { rms: 1, avg: 1, formFactor: 1 }
const TRIANGLE = {
  rms: 1 / Math.sqrt(3),
  avg: 0.5,
  formFactor: 2 / Math.sqrt(3),
}
const AVG_DMM_SCALE = 1.11

export default function WaveformGallery() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()

  const [phase, setPhase] = useState<number>(0)

  useEffect(() => {
    // Respect prefers-reduced-motion: keep phase at 0, static view.
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    let rafId = 0
    let startTime: number | null = null
    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const elapsed = (now - startTime) % PERIOD_MS
      // Phase advances 0 → 2π per PERIOD_MS. Since each waveform has
      // period 2π in its `angle` argument, the content at x=0 cycles
      // through once every PERIOD_MS → seamless leftward scroll.
      setPhase((elapsed / PERIOD_MS) * 2 * Math.PI)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const tiles: Array<{
    key: 'sine' | 'square' | 'triangle'
    path: string
    rms: number
    formFactor: number
    meterReads: number
    correct: boolean
  }> = [
    {
      key: 'sine',
      path: pathFor(sineFn, phase),
      rms: SINE.rms,
      formFactor: SINE.formFactor,
      meterReads: SINE.avg * AVG_DMM_SCALE,
      correct: true,
    },
    {
      key: 'square',
      path: pathFor(squareFn, phase),
      rms: SQUARE.rms,
      formFactor: SQUARE.formFactor,
      meterReads: SQUARE.avg * AVG_DMM_SCALE,
      correct: false,
    },
    {
      key: 'triangle',
      path: pathFor(triangleFn, phase),
      rms: TRIANGLE.rms,
      formFactor: TRIANGLE.formFactor,
      meterReads: TRIANGLE.avg * AVG_DMM_SCALE,
      correct: false,
    },
  ]

  return (
    <figure className="my-6 not-prose">
      {/* Stacks to a single column below sm — three 176-px tiles side
          by side add up to ~552 px, which overflows any phone. At sm
          and above we flip to a 3-column grid centred in the available
          width. Each tile is capped at its natural width so on mobile
          it doesn't stretch wider than the SVG's designed viewBox. */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 sm:justify-center">
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className="rounded-lg border border-border bg-card/60 p-2 w-full max-w-[176px] mx-auto"
          >
            <h4 className="mb-1 text-center text-sm font-semibold text-foreground">
              {t(`ch1_3.waveformGallery.${tile.key}Title`)}
            </h4>
            <svg
              width={TILE_W}
              height={TILE_H}
              viewBox={`0 0 ${TILE_W} ${TILE_H}`}
              role="img"
              aria-label={t(`ch1_3.waveformGallery.${tile.key}Aria`)}
              style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
            >
              {/* Zero line */}
              <line
                x1={PLOT_X0}
                y1={PLOT_CY}
                x2={PLOT_X0 + PLOT_W}
                y2={PLOT_CY}
                stroke={svgTokens.border}
                strokeWidth={0.8}
                strokeDasharray="2 3"
              />
              {/* Animated trace */}
              <path
                d={tile.path}
                fill="none"
                stroke={svgTokens.primary}
                strokeWidth={1.8}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <dl className="mt-2 space-y-0.5 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t('ch1_3.waveformGallery.trueRmsLabel')}
                </dt>
                <dd className="font-mono text-foreground">
                  {formatDecimal(tile.rms, 3, locale)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t('ch1_3.waveformGallery.formFactorLabel')}
                </dt>
                <dd className="font-mono text-foreground">
                  {formatDecimal(tile.formFactor, 3, locale)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t('ch1_3.waveformGallery.avgDmmLabel')}
                </dt>
                <dd
                  className="font-mono"
                  style={{
                    color: tile.correct
                      ? svgTokens.experiment
                      : svgTokens.caution,
                  }}
                >
                  {formatDecimal(tile.meterReads, 3, locale)}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 px-2 text-center text-[13px] text-muted-foreground">
        {t('ch1_3.waveformGallery.caption')}
      </figcaption>
    </figure>
  )
}
