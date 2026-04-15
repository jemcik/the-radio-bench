import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Slider } from '@/components/ui/slider'
import { ResultBox } from '@/components/ui/result-box'
import SVGDiagram from '@/components/diagrams/SVGDiagram'
import { M } from '@/components/ui/math'
import { cn } from '@/lib/utils'
import { formatDecimal } from '@/lib/format'

/**
 * Chapter 0.4 — Log axis vs Linear axis demo
 *
 * Plots the magnitude response of a first-order RC low-pass filter:
 *   |H(f)| = 1 / √(1 + (f/fc)²)
 *   Gain(dB) = 20·log₁₀|H| = −10·log₁₀(1 + (f/fc)²)
 *
 * The user toggles between a linear and a logarithmic frequency axis.
 * On the linear axis the entire interesting roll-off is squashed against
 * the left edge; on the log axis it spreads out into the textbook
 * "−20 dB per decade" straight line. A draggable cutoff slider drives
 * home that the *shape* is invariant — only its position shifts.
 */

type Axis = 'linear' | 'log'

const F_MIN = 1            // Hz — leftmost tick
const F_MAX = 1_000_000    // Hz — rightmost tick (six decades)
const DB_MIN = -60          // bottom of plot
const DB_MAX = 5           // a hair above 0 so the flat passband shows

// Cutoff slider lives on a log scale: log10(fc) from 2 (100 Hz) to 5 (100 kHz).
const FC_LOG_MIN = 2
const FC_LOG_MAX = 5
const FC_LOG_STEP = 0.05

/** RC low-pass gain at frequency f, with cutoff fc, in dB. */
function gainDb(f: number, fc: number): number {
  if (f <= 0) return 0
  return -10 * Math.log10(1 + (f / fc) ** 2)
}

/**
 * Format a frequency with a sensible SI suffix.
 * Unit symbols come from i18n so a Ukrainian reader sees Гц / кГц / МГц
 * instead of Hz / kHz / MHz. `locale` controls the decimal separator —
 * Ukrainian uses a comma ("1,0 кГц"), English a period ("1.0 kHz").
 */
function formatHz(f: number, tUnit: (k: string) => string, locale: string): string {
  if (f >= 1_000_000) return `${formatDecimal(f / 1_000_000, f >= 10_000_000 ? 0 : 2, locale)} ${tUnit('mhz')}`
  if (f >= 1_000)     return `${formatDecimal(f / 1_000,     f >= 10_000    ? 0 : 1, locale)} ${tUnit('khz')}`
  return `${formatDecimal(f, 0, locale)} ${tUnit('hz')}`
}

export default function LogAxisToggle() {
  const { t, i18n } = useTranslation('ui')
  const locale = i18n.language
  const tUnit = (k: string) => t(`units.${k}`)
  const [axis, setAxis] = useState<Axis>('log')
  // Slider value is log10(fc). Default 1 kHz → 3.0
  const [fcLog, setFcLog] = useState<number>(3)
  const fc = useMemo(() => Math.pow(10, fcLog), [fcLog])

  // Unique id per widget instance so the <clipPath> doesn't collide if
  // the page mounts multiple LogAxisToggle widgets.
  const uid = useId().replace(/:/g, '')
  const clipId = `logaxis-plot-${uid}`

  // ── Plot geometry ──────────────────────────────────────────────────
  // PAD_R must clear the half-width of the rightmost tick label, which
  // is "1.00 MHz" centred on x = PAD_L + plotW. At fontSize 10 sans
  // that text is ≈ 38 px wide → 19 px half-width. PAD_R = 32 leaves
  // ~13 px between the label's right edge and the canvas edge — past
  // the SVGDiagram viewport-clip threshold so the label can't be sliced.
  // PAD_L must clear the Y-tick labels ("−60" ≈ 18 px @ fontSize 10,
  // anchored at PAD_L − 6) plus the rotated "Gain (dB)" axis title at
  // x ≈ 14. PAD_L = 50 covers both with room to spare.
  const W = 560, H = 280
  const PAD_L = 50, PAD_R = 32, PAD_T = 18, PAD_B = 42
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  /** X-coord for a frequency, given the current axis mode. */
  const xFor = (f: number): number => {
    if (axis === 'log') {
      const u = (Math.log10(f) - Math.log10(F_MIN)) / (Math.log10(F_MAX) - Math.log10(F_MIN))
      return PAD_L + u * plotW
    }
    const u = f / F_MAX
    return PAD_L + u * plotW
  }

  /** Y-coord for a dB value. */
  const yFor = (db: number): number => {
    const u = (db - DB_MIN) / (DB_MAX - DB_MIN)
    return PAD_T + (1 - u) * plotH
  }

  // ── Curve sampling ─────────────────────────────────────────────────
  // For log axis: uniform in log10(f). For linear axis: uniform in f.
  // The linear axis needs many samples near zero where the curve bends
  // sharply, hence the higher count.
  //
  // OUT-OF-RANGE HANDLING: the RC roll-off can dive far below DB_MIN at
  // high frequencies (e.g. −80 dB at 1 MHz with fc = 316 Hz). We do NOT
  // clamp the y to the floor — that produces a fake horizontal plateau
  // that reads as "the filter has a flat −60 dB response here" when
  // really the response is continuing to drop. Instead we TRUNCATE: the
  // moment a sample falls below the plot floor, we linearly interpolate
  // the exact crossing point on the boundary, draw the path to it, and
  // stop. Visually the curve exits through the bottom edge — the honest
  // "off the chart" indicator. Because the response is monotonic we can
  // safely break out of the loop after the first crossing.
  const yMax = PAD_T + plotH
  const path = useMemo(() => {
    const N = axis === 'log' ? 240 : 1200
    const pts: string[] = []
    let prevX: number | null = null
    let prevY: number | null = null
    for (let i = 0; i <= N; i++) {
      let f: number
      if (axis === 'log') {
        const lo = Math.log10(F_MIN), hi = Math.log10(F_MAX)
        f = Math.pow(10, lo + (i / N) * (hi - lo))
      } else {
        f = (i / N) * F_MAX
      }
      const x = xFor(f)
      const y = yFor(gainDb(Math.max(f, F_MIN), fc))
      if (y > yMax) {
        // Crossed below the plot floor between the previous sample and
        // this one. Interpolate the exact crossing and emit one final
        // segment to it. (prevX/prevY are guaranteed non-null here
        // because the curve starts at gain ≈ 0 dB, well above floor.)
        if (prevX !== null && prevY !== null) {
          const t = (yMax - prevY) / (y - prevY)
          const xc = prevX + t * (x - prevX)
          pts.push(`L${xc.toFixed(2)},${yMax.toFixed(2)}`)
        }
        break
      }
      pts.push(`${pts.length === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
      prevX = x
      prevY = y
    }
    return pts.join(' ')
  // xFor / yFor close over `axis` and the static padding constants; safe.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axis, fc])

  // ── X-axis tick definitions ───────────────────────────────────────
  const logTicks = [1, 10, 100, 1_000, 10_000, 100_000, 1_000_000]
  const linearTicks = [0, 200_000, 400_000, 600_000, 800_000, 1_000_000]
  const xTicks = axis === 'log' ? logTicks : linearTicks

  // ── Y-axis tick definitions (every 10 dB) ─────────────────────────
  const yTicks = [0, -10, -20, -30, -40, -50, -60]

  const cutoffX = xFor(fc)
  const cutoffY = yFor(-3)
  // Hide the cutoff marker if it falls outside the visible plot area
  // (can happen on the linear axis when fc < ~1 % of F_MAX).
  const cutoffVisible = cutoffX >= PAD_L && cutoffX <= PAD_L + plotW

  return (
    <Widget
      title={t('ch0_4.logAxisToggleTitle')}
      description={t('ch0_4.logAxisToggleDescription')}
    >
      {/* ── Plain-language explainer ─────────────────────────────────
          Without this, a reader who doesn't already know what an RC
          filter or a cutoff frequency is can't make sense of the plot.
          Three short paragraphs: what the circuit is, what fc means,
          how to read the chart. Bold terms double as visual anchors so
          a returning reader can scan past once they've internalised
          the vocabulary. */}
      <div className="rounded-lg border border-callout-note/30 bg-callout-note/5 p-3 space-y-2 text-sm text-foreground">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('ch0_4.logAxisToggleAboutTitle')}
        </p>
        <p>
          <strong>{t('ch0_4.logAxisToggleAboutFilterTitle')}</strong>
          {' — '}
          {t('ch0_4.logAxisToggleAboutFilterBody')}
        </p>
        <p>
          <strong>{t('ch0_4.logAxisToggleAboutCutoffTitle')}</strong>
          {' ('}<M tex="f_c" />{') — '}
          {t('ch0_4.logAxisToggleAboutCutoffBody')}
        </p>
        <p>
          <strong>{t('ch0_4.logAxisToggleAboutReadingTitle')}</strong>
          {' — '}
          {t('ch0_4.logAxisToggleAboutReadingBody')}
        </p>
      </div>

      {/* ── Axis toggle ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          {t('ch0_4.logAxisToggleAxisLabel')}
        </p>
        <div
          role="tablist"
          aria-label={t('ch0_4.logAxisToggleAxisLabel')}
          className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
        >
          {(['linear', 'log'] as const).map((mode) => (
            <button
              key={mode}
              role="tab"
              aria-selected={axis === mode}
              onClick={() => setAxis(mode)}
              className={cn(
                'px-4 py-1.5 text-sm rounded-md transition-colors',
                axis === mode
                  ? 'bg-background text-foreground shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {mode === 'linear'
                ? t('ch0_4.logAxisToggleLinear')
                : t('ch0_4.logAxisToggleLog')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cutoff slider ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="logaxis-fc"
            className="text-sm font-medium text-foreground inline-flex items-baseline gap-1.5"
          >
            {t('ch0_4.logAxisToggleCutoffLabel')}
            <M tex="f_c" />
          </label>
          <span className="font-mono text-sm text-foreground">
            {formatHz(fc, tUnit, locale)}
            <span className="ml-2 text-xs text-muted-foreground">
              {t('ch0_4.logAxisToggleCutoffHint')}
            </span>
          </span>
        </div>
        <Slider
          id="logaxis-fc"
          min={FC_LOG_MIN}
          max={FC_LOG_MAX}
          step={FC_LOG_STEP}
          value={[fcLog]}
          onValueChange={(v) => setFcLog(v[0])}
          aria-label={t('ch0_4.logAxisToggleCutoffLabel')}
        />
      </div>

      {/* ── Plot ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-muted/30 p-2 overflow-x-auto">
        <SVGDiagram
          width={W}
          height={H}
          aria-label={t('ch0_4.logAxisToggleAria')}
          fontFamily="inherit"
          style={{ maxWidth: W, margin: '0 auto' }}
        >
          {/* Clip path so the response curve can never escape the plot
              rectangle. Without this, on the linear axis the curve
              continues drawing below DB_MIN and runs straight through
              the X-axis tick labels. */}
          <defs>
            <clipPath id={clipId}>
              <rect x={PAD_L} y={PAD_T} width={plotW} height={plotH} />
            </clipPath>
          </defs>

          {/* Plot background */}
          <rect
            x={PAD_L} y={PAD_T} width={plotW} height={plotH}
            fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1"
          />

          {/* Y grid + tick labels */}
          {yTicks.map((db) => {
            const y = yFor(db)
            return (
              <g key={`y-${db}`}>
                <line
                  x1={PAD_L} y1={y} x2={PAD_L + plotW} y2={y}
                  stroke="hsl(var(--border))" strokeWidth="0.6"
                  strokeDasharray={db === 0 ? '' : '2 3'}
                  opacity={db === 0 ? 0.7 : 0.4}
                />
                <text
                  x={PAD_L - 6} y={y + 3}
                  textAnchor="end" fontSize="10"
                  fill="hsl(var(--muted-foreground))"
                >
                  {db}
                </text>
              </g>
            )
          })}

          {/* X grid + tick labels */}
          {xTicks.map((f) => {
            const x = xFor(f)
            if (x < PAD_L - 0.5 || x > PAD_L + plotW + 0.5) return null
            return (
              <g key={`x-${f}`}>
                <line
                  x1={x} y1={PAD_T} x2={x} y2={PAD_T + plotH}
                  stroke="hsl(var(--border))" strokeWidth="0.6"
                  strokeDasharray="2 3" opacity={0.4}
                />
                <text
                  x={x} y={PAD_T + plotH + 14}
                  textAnchor="middle" fontSize="10"
                  fill="hsl(var(--muted-foreground))"
                >
                  {formatHz(f, tUnit, locale)}
                </text>
              </g>
            )
          })}

          {/* Axis titles */}
          <text
            x={PAD_L + plotW / 2} y={H - 6}
            textAnchor="middle" fontSize="10.5"
            fill="hsl(var(--foreground))"
          >
            {t('ch0_4.logAxisToggleAxisXLabel')}
          </text>
          <text
            transform={`translate(14 ${PAD_T + plotH / 2}) rotate(-90)`}
            textAnchor="middle" fontSize="10.5"
            fill="hsl(var(--foreground))"
          >
            {t('ch0_4.logAxisToggleAxisYLabel')}
          </text>

          {/* Cutoff marker (vertical line + −3 dB dot) */}
          {cutoffVisible && (
            <g>
              <line
                x1={cutoffX} y1={PAD_T} x2={cutoffX} y2={PAD_T + plotH}
                stroke="hsl(var(--callout-key))" strokeWidth="1.2"
                strokeDasharray="4 3" opacity={0.85}
              />
              <circle
                cx={cutoffX} cy={cutoffY} r={3.5}
                fill="hsl(var(--callout-key))"
              />
              {/* "f_c · −3 dB" — KaTeX can't render inside SVG, so we
                  fake the subscript with a smaller, slightly-lowered
                  <tspan>. Italic `f` matches typographic convention for
                  variable names. */}
              <text
                x={cutoffX + 6} y={cutoffY - 6}
                fontSize="11" fill="hsl(var(--callout-key))"
                fontWeight="600"
              >
                <tspan fontStyle="italic">f</tspan>
                <tspan dy="3" fontSize="8">c</tspan>
                <tspan dy="-3" fontStyle="normal"> · −3 {tUnit('db')}</tspan>
              </text>
            </g>
          )}

          {/* The response curve itself — clipped to the plot rect. */}
          <path
            d={path}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            clipPath={`url(#${clipId})`}
          />
        </SVGDiagram>
      </div>

      {/* ── Hint / takeaway ───────────────────────────────────────── */}
      <ResultBox tone="info" className="p-3">
        <p className="text-sm text-foreground">
          {t('ch0_4.logAxisToggleHint')}
        </p>
      </ResultBox>
    </Widget>
  )
}
