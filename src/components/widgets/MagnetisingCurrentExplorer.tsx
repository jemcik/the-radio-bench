import { useEffect, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, Pause } from 'lucide-react'
import Widget from '@/components/ui/widget'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal } from '@/lib/format'
import { svgTokens } from '@/components/diagrams/svgTokens'
import { cn } from '@/lib/utils'

/**
 * Chapter 1.9 — Magnetising-current explorer.
 *
 * Visualises why magnetising current is REACTIVE and dissipates no heat.
 * Two normalised sine curves are plotted against ωt ∈ [0°, 360°]:
 *
 *   • V_p(t) = sin(ωt)         — primary voltage  (blue, "primary" token)
 *   • I_mag(t) = −cos(ωt)      — current / flux, lags V by 90°  (amber)
 *
 * A vertical "now" cursor is driven by a phase slider (and an optional
 * autoplay loop). Below the plot, a status panel reports — for the
 * current phase:
 *
 *   • V_p / V_max  and  I_mag / I_max  (signed, as bars)
 *   • Stored field energy  W(t) ∝ I_mag(t)²  (magnitude bar)
 *   • Power-flow direction  P(t) = V·I       (arrow + colour):
 *       P > 0  →  source pushes energy into the field  (build)
 *       P < 0  →  field returns energy to the source   (release)
 *
 * Quarter labels make the four-step cycle (release / build / release /
 * build) explicit, closing the «net energy per period = 0» argument.
 *
 * This is the visualisation companion to the `lossesMagnetising`
 * paragraph — it turns four lines of dense prose into something the
 * reader can drag.
 */

// ── Plot geometry (mirrors SineExplorer for visual consistency) ──────
const VB_W = 520
const VB_H = 240
const PAD_L = 46
const PAD_R = 18
const PAD_T = 22
const PAD_B = 44

const PLOT_X0 = PAD_L
const PLOT_Y0 = PAD_T
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B

// Phase domain — full cycle in degrees. 5° step on the slider gives
// 72 stops across the cycle: smooth enough to feel continuous, coarse
// enough that keyboard arrow keys advance perceptibly.
const PHASE_MIN = 0
const PHASE_MAX = 360
const PHASE_STEP = 1
const PHASE_DEFAULT = 135 // start in Q2, source → field, both V and I positive

// Y headroom — ±1 normalised, plus 10% slack so peaks don't graze the
// clip rectangle and look flat-topped.
const Y_AXIS_MAX = 1.1

const X_TICKS_DEG = [0, 90, 180, 270, 360]
const Y_TICKS = [-1, -0.5, 0, 0.5, 1]

// Autoplay — one full cycle in PLAY_PERIOD_MS. Slow enough to follow
// the curves move under the cursor; fast enough to feel alive.
const PLAY_PERIOD_MS = 8000

function degToX(deg: number): number {
  return PLOT_X0 + (deg / PHASE_MAX) * PLOT_W
}
function valToY(v: number): number {
  return PLOT_Y0 + PLOT_H / 2 - (v / Y_AXIS_MAX) * (PLOT_H / 2)
}

/** Quarter index 0..3 from a phase angle in degrees. */
function quarterFromPhase(deg: number): 0 | 1 | 2 | 3 {
  const wrapped = ((deg % 360) + 360) % 360
  return Math.min(3, Math.floor(wrapped / 90)) as 0 | 1 | 2 | 3
}

export default function MagnetisingCurrentExplorer() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const clipId = useId()

  const [phaseDeg, setPhaseDeg] = useState<number>(PHASE_DEFAULT)
  const [playing, setPlaying] = useState<boolean>(false)

  // Autoplay loop — advances `phaseDeg` smoothly, wrapping at 360°.
  // The functional setState read inside the rAF tick avoids needing a
  // ref to track the latest phase: each tick computes the next value
  // off the current state without re-running the effect on every drag.
  // The play button is the only entry point — we never auto-start.
  useEffect(() => {
    if (!playing) return
    let rafId = 0
    let prev: number | null = null
    const tick = (now: number) => {
      if (prev === null) prev = now
      const dt = now - prev
      prev = now
      setPhaseDeg((p) => (p + (dt / PLAY_PERIOD_MS) * 360) % 360)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [playing])

  // ── Curves (memoised; static — the cursor is what moves) ─────────
  const pathV = useMemo(() => buildPath((d) => Math.sin(toRad(d))), [])
  const pathI = useMemo(() => buildPath((d) => -Math.cos(toRad(d))), [])

  // ── Live values at the current phase ─────────────────────────────
  const phaseRad = toRad(phaseDeg)
  const vNow = Math.sin(phaseRad)
  const iNow = -Math.cos(phaseRad)
  const energyNow = iNow * iNow            // 0..1 (proportional to I²)
  const powerNow = vNow * iNow             // sign indicates flow direction
  const buildPhase = powerNow > 1e-6       // source → field
  const releasePhase = powerNow < -1e-6    // field → source

  const cursorX = degToX(phaseDeg)
  const vDotY = valToY(vNow)
  const iDotY = valToY(iNow)

  const quarter = quarterFromPhase(phaseDeg)
  const quarterLabel = t(`ch1_9.widget.magCurrent.q${quarter + 1}`)
  const directionLabel = buildPhase
    ? t('ch1_9.widget.magCurrent.directionBuild')
    : releasePhase
      ? t('ch1_9.widget.magCurrent.directionRelease')
      : t('ch1_9.widget.magCurrent.directionBoundary')

  return (
    <Widget
      title={t('ch1_9.widget.magCurrent.title')}
      description={t('ch1_9.widget.magCurrent.description')}
    >
      {/* ── Phase slider + Play/Pause ───────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-2 gap-3">
          <label
            htmlFor="mc-phase"
            className="text-sm font-medium text-foreground"
          >
            {t('ch1_9.widget.magCurrent.phaseLabel')}
          </label>
          <span className="text-sm font-mono text-muted-foreground">
            ωt = {formatDecimal(phaseDeg, 0, locale)}°
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Slider
            id="mc-phase"
            min={PHASE_MIN}
            max={PHASE_MAX}
            step={PHASE_STEP}
            value={[phaseDeg]}
            onValueChange={([v]) => setPhaseDeg(v ?? PHASE_DEFAULT)}
            aria-label={t('ch1_9.widget.magCurrent.phaseLabel')}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPlaying((p) => !p)}
            aria-label={
              playing
                ? t('ch1_9.widget.magCurrent.pauseLabel')
                : t('ch1_9.widget.magCurrent.playLabel')
            }
            className="shrink-0"
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
        </div>
        <div className="flex justify-between mt-1 text-[11px] text-muted-foreground">
          <span>0°</span>
          <span>90°</span>
          <span>180°</span>
          <span>270°</span>
          <span>360°</span>
        </div>
      </div>

      {/* ── Plot ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card/60 p-3">
        <svg
          width={VB_W}
          height={VB_H}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={t('ch1_9.widget.magCurrent.ariaLabel')}
          style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto', fontSize: '1rem' }}
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x={PLOT_X0 - 3}
                y={PLOT_Y0 - 3}
                width={PLOT_W + 6}
                height={PLOT_H + 6}
              />
            </clipPath>
          </defs>

          {/* Quarter shading — alternating tint to make the four
              quarter-period segments visually distinct. Subtle so it
              doesn't compete with the curves. */}
          <g opacity={0.05}>
            {[0, 1, 2, 3].map((q) => (
              <rect
                key={`q${q}`}
                x={degToX(q * 90)}
                y={PLOT_Y0}
                width={PLOT_W / 4}
                height={PLOT_H}
                fill={q % 2 === 0 ? svgTokens.fg : 'transparent'}
              />
            ))}
          </g>

          {/* Gridlines (vertical at 90°/180°/270°, horizontal at ±0.5/±1) */}
          <g stroke={svgTokens.border} strokeWidth={0.5} opacity={0.55}>
            {X_TICKS_DEG.slice(1, -1).map((d) => (
              <line
                key={`gx${d}`}
                x1={degToX(d)}
                y1={PLOT_Y0}
                x2={degToX(d)}
                y2={PLOT_Y0 + PLOT_H}
              />
            ))}
            {Y_TICKS.filter((y) => y !== 0).map((y) => (
              <line
                key={`gy${y}`}
                x1={PLOT_X0}
                y1={valToY(y)}
                x2={PLOT_X0 + PLOT_W}
                y2={valToY(y)}
              />
            ))}
          </g>

          {/* Zero line — slightly emphasised */}
          <line
            x1={PLOT_X0}
            y1={valToY(0)}
            x2={PLOT_X0 + PLOT_W}
            y2={valToY(0)}
            stroke={svgTokens.fg}
            strokeWidth={1}
            opacity={0.6}
          />

          {/* Axes */}
          <g stroke={svgTokens.fg} strokeWidth={1} fill="none">
            <line x1={PLOT_X0} y1={PLOT_Y0} x2={PLOT_X0} y2={PLOT_Y0 + PLOT_H} />
            <line
              x1={PLOT_X0}
              y1={PLOT_Y0 + PLOT_H}
              x2={PLOT_X0 + PLOT_W}
              y2={PLOT_Y0 + PLOT_H}
            />
          </g>

          {/* Tick labels */}
          <g
            fill={svgTokens.mutedFg}
            fontSize={svgTokens.font.axisLabel}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {X_TICKS_DEG.map((d) => (
              <text
                key={`tx${d}`}
                x={degToX(d)}
                y={PLOT_Y0 + PLOT_H + 16}
                textAnchor="middle"
              >
                {d}°
              </text>
            ))}
            {Y_TICKS.map((y) => (
              <text
                key={`ty${y}`}
                x={PLOT_X0 - 8}
                y={valToY(y) + 4}
                textAnchor="end"
              >
                {formatDecimal(y, 1, locale)}
              </text>
            ))}
          </g>

          {/* X-axis title — ωt (фаза) */}
          <text
            x={PLOT_X0 + PLOT_W / 2}
            y={PLOT_Y0 + PLOT_H + 34}
            fontSize={svgTokens.font.axisLabel}
            fill={svgTokens.fg}
            textAnchor="middle"
          >
            <tspan fontStyle="italic">ωt</tspan>
          </text>
          <text
            x={16}
            y={PLOT_Y0 + PLOT_H / 2}
            fontSize={svgTokens.font.axisLabel}
            fill={svgTokens.fg}
            textAnchor="middle"
            transform={`rotate(-90 16 ${PLOT_Y0 + PLOT_H / 2})`}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {t('ch1_9.widget.magCurrent.yAxisTitle')}
          </text>

          {/* Curves — clipped */}
          <g clipPath={`url(#${clipId})`}>
            <path
              d={pathV}
              fill="none"
              stroke={svgTokens.primary}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={pathI}
              fill="none"
              stroke={svgTokens.key}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

          {/* Cursor — vertical dashed line at current phase, with
              tracker dots on each curve. */}
          <g clipPath={`url(#${clipId})`}>
            <line
              x1={cursorX}
              y1={PLOT_Y0}
              x2={cursorX}
              y2={PLOT_Y0 + PLOT_H}
              stroke={svgTokens.mutedFg}
              strokeWidth={1}
              strokeDasharray="2 3"
              opacity={0.7}
            />
            <circle cx={cursorX} cy={vDotY} r={4} fill={svgTokens.primary} />
            <circle cx={cursorX} cy={iDotY} r={4} fill={svgTokens.key} />
          </g>

          {/* Curve legend — tucked top-right inside the plot */}
          <g
            fontSize={svgTokens.font.axisLabel}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            <line
              x1={PLOT_X0 + PLOT_W - 110}
              y1={PLOT_Y0 + 8}
              x2={PLOT_X0 + PLOT_W - 92}
              y2={PLOT_Y0 + 8}
              stroke={svgTokens.primary}
              strokeWidth={2}
            />
            <text
              x={PLOT_X0 + PLOT_W - 87}
              y={PLOT_Y0 + 12}
              fill={svgTokens.fg}
            >
              <tspan fontStyle="italic">V</tspan>
              <tspan fontStyle="italic" baselineShift="sub" fontSize="0.75em">p</tspan>
            </text>
            <line
              x1={PLOT_X0 + PLOT_W - 60}
              y1={PLOT_Y0 + 8}
              x2={PLOT_X0 + PLOT_W - 42}
              y2={PLOT_Y0 + 8}
              stroke={svgTokens.key}
              strokeWidth={2}
            />
            <text
              x={PLOT_X0 + PLOT_W - 37}
              y={PLOT_Y0 + 12}
              fill={svgTokens.fg}
            >
              <tspan fontStyle="italic">I</tspan>
              {/* hardcoded-jsx-text-ok: math subscript «mag» — same convention across locales (cf. sin/cos/max/min). */}
              <tspan fontStyle="italic" baselineShift="sub" fontSize="0.75em">mag</tspan>
            </text>
          </g>
        </svg>
      </div>

      {/* ── Status panel — readouts and direction indicator ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Live values: V_p, I_mag, energy */}
        <div className="rounded-lg border border-border bg-card/60 p-3 space-y-2">
          <SignedBar
            label={
              <>
                <span className="italic">V</span>
                <sub className="italic">p</sub>
                {' / '}
                <span className="italic">V</span>
                <sub className="italic">max</sub>
              </>
            }
            value={vNow}
            colorClass="bg-primary"
            locale={locale}
          />
          <SignedBar
            label={
              <>
                <span className="italic">I</span>
                <sub className="italic">mag</sub>
                {' / '}
                <span className="italic">I</span>
                <sub className="italic">max</sub>
              </>
            }
            value={iNow}
            colorClass="bg-callout-key"
            locale={locale}
          />
          <UnsignedBar
            label={t('ch1_9.widget.magCurrent.energyLabel')}
            value={energyNow}
            colorClass="bg-callout-experiment"
            locale={locale}
          />
        </div>

        {/* Direction indicator */}
        <div
          className={cn(
            'rounded-lg border p-3 flex flex-col justify-center gap-2',
            buildPhase && 'border-callout-experiment/40 bg-callout-experiment/[0.06]',
            releasePhase && 'border-callout-caution/40 bg-callout-caution/[0.06]',
            !buildPhase && !releasePhase && 'border-border bg-card/60',
          )}
        >
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {quarterLabel}
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <DirectionArrow direction={buildPhase ? 'build' : releasePhase ? 'release' : 'boundary'} />
            <span>{directionLabel}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {t('ch1_9.widget.magCurrent.netZero')}
          </div>
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_9.widget.magCurrent.hint')}
      </p>
    </Widget>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Build an SVG path that samples a normalised function `f(deg)` across
 * the full 0..360° plot domain with 360 steps (1 sample per degree —
 * dense enough that the curve looks continuous at the rendered size).
 */
function buildPath(f: (deg: number) => number): string {
  const N = 360
  let d = ''
  for (let i = 0; i <= N; i++) {
    const deg = (i / N) * PHASE_MAX
    const x = degToX(deg)
    const y = valToY(f(deg))
    d += i === 0
      ? `M ${x.toFixed(2)} ${y.toFixed(2)}`
      : ` L ${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

interface BarProps {
  label: React.ReactNode
  value: number
  colorClass: string
  locale: string
}

/** Bidirectional bar: extends left or right of the centre depending on sign. */
function SignedBar({ label, value, colorClass, locale }: BarProps) {
  const pct = Math.min(100, Math.abs(value) * 100)
  const isPos = value >= 0
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">
          {value >= 0 ? '+' : '−'}
          {formatDecimal(Math.abs(value), 2, locale)}
        </span>
      </div>
      <div className="relative mt-1 h-2 rounded bg-muted/60 overflow-hidden">
        {/* Centre line marker */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-foreground/30" />
        <div
          className={cn('absolute top-0 bottom-0', colorClass)}
          style={
            isPos
              ? { left: '50%', width: `${pct / 2}%` }
              : { right: '50%', width: `${pct / 2}%` }
          }
        />
      </div>
    </div>
  )
}

/** Magnitude-only bar: starts from the left, extends right. */
function UnsignedBar({ label, value, colorClass, locale }: BarProps) {
  const pct = Math.min(100, Math.max(0, value) * 100)
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">
          {formatDecimal(value, 2, locale)}
        </span>
      </div>
      <div className="relative mt-1 h-2 rounded bg-muted/60 overflow-hidden">
        <div
          className={cn('absolute top-0 bottom-0 left-0', colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function DirectionArrow({ direction }: { direction: 'build' | 'release' | 'boundary' }) {
  if (direction === 'boundary') {
    return (
      <span aria-hidden className="inline-block w-6 text-center text-muted-foreground">
        =
      </span>
    )
  }
  // Source on the left, field on the right. Arrow direction:
  //   build   → source ▶ field
  //   release → field ◀ source (drawn left-pointing)
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex items-center gap-0.5 font-mono text-base',
        direction === 'build' ? 'text-callout-experiment' : 'text-callout-caution',
      )}
    >
      {direction === 'build' ? '→' : '←'}
    </span>
  )
}
