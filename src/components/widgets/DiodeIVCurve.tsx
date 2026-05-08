/**
 * Chapter 1.10 §2 — Diode I–V curve.
 *
 * Three pre-set diode families (silicon signal, Schottky, red LED) each
 * have their canonical Shockley curve plotted to scale. The reader picks
 * a diode, drags the V slider, and watches:
 *
 *   1. Below ~0.5 V (Si) / 0.2 V (Schottky) / 1.6 V (LED) the current
 *      is essentially zero. The diode is not «off» — it is conducting
 *      a few nanoamps; the chart just can't show that on a 25 mA scale.
 *   2. Past the knee, current rises ~10× per ~60 mV (n·Vt). So a tiny
 *      voltage push translates into a huge current jump. THIS is why
 *      diodes are non-linear — the equation isn't a line, it is an
 *      exponential.
 *   3. The three diode families differ ONLY in the position of the knee
 *      — the *shape* is identical because the underlying physics
 *      (carrier diffusion across a junction) is the same in all three.
 *
 * Source: Shockley diode equation I = Is·(exp(V/(n·Vt)) − 1) where
 * Vt = kT/q ≈ 25.85 mV at T = 300 K. Per diode, Is and n are
 * back-calibrated from a typical (V_F, I_F) datasheet point so the
 * curve passes through the values readers are likely to look up:
 *
 *   1N4148  (Si signal)  → V_F ≈ 0.62 V at 1 mA   (n ≈ 1.6)
 *   1N5819  (Schottky)   → V_F ≈ 0.30 V at 1 mA   (n ≈ 1.05)
 *   Red LED (GaAsP)      → V_F ≈ 1.80 V at 5 mA   (n ≈ 2.5)
 *
 * Reference: AoE 3rd ed. §1.6.1 Table 1.1; ARRL Handbook 2023 §2.8.
 */
import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Slider } from '@/components/ui/slider'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal } from '@/lib/format'
import { svgTokens } from '@/components/diagrams/svgTokens'

/* ── Diode family parameters ─────────────────────────────────────── */

interface DiodeKind {
  /** i18n suffix for this diode (label keys live under widget.diodeIv.<id>) */
  id: 'silicon' | 'schottky' | 'ledRed'
  /** Effective n·Vt in volts (controls slope of exponential) */
  vTeff: number
  /** Saturation current in amps */
  isAmps: number
  /** Stroke-colour token: hsl(var(--…)) */
  colorVar: string
}

const DIODES: ReadonlyArray<DiodeKind> = [
  { id: 'silicon',  vTeff: 0.0413, isAmps: 3.06e-10, colorVar: 'hsl(var(--primary))' },
  { id: 'schottky', vTeff: 0.0271, isAmps: 1.55e-8,  colorVar: 'hsl(var(--callout-experiment))' },
  { id: 'ledRed',   vTeff: 0.0645, isAmps: 3.85e-15, colorVar: 'hsl(var(--callout-caution))' },
] as const

function diodeCurrent(d: DiodeKind, v: number): number {
  // Returns I in amps. Below ~0 V, current is ≈ −Is (negligible at our scale).
  if (v < 0) return -d.isAmps
  return d.isAmps * (Math.exp(v / d.vTeff) - 1)
}

/* ── Plot geometry ───────────────────────────────────────────────── */

const VB_W = 520
const VB_H = 240

// Worst-case left padding budget:
//   Y-tick "25" is 2 chars × ~7 px @ fontSize 13 sans ≈ 14 px wide,
//   ending 8 px left of axis (x ≈ 26..40); rotated Y-axis title sits
//   in the 8–22 column → 4 px gutter; 8 px margin from canvas edge.
const PAD_L = 50
// Right padding: just enough to keep the curve's rightmost point
// from grazing the canvas edge.
const PAD_R = 16
const PAD_T = 22
const PAD_B = 40

const PLOT_X0 = PAD_L
const PLOT_Y0 = PAD_T
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B

const V_MIN = 0
const V_MAX = 2.5
const I_MAX_MA = 25

const X_TICKS_V = [0, 0.5, 1.0, 1.5, 2.0, 2.5]
const Y_TICKS_MA = [0, 5, 10, 15, 20, 25]

function vToX(v: number) {
  return PLOT_X0 + ((v - V_MIN) / (V_MAX - V_MIN)) * PLOT_W
}
function iMaToY(iMa: number) {
  return PLOT_Y0 + PLOT_H - (iMa / I_MAX_MA) * PLOT_H
}

/* ── Slider ──────────────────────────────────────────────────────── */

const V_STEP = 0.01
const V_DEFAULT = 0.6

/* ── Curve sampling: dense + truncate-at-top ──────────────────────── */

function buildCurvePath(d: DiodeKind): string {
  const samples: Array<{ x: number; y: number }> = []
  const N = 320
  let prevAboveTop = false
  for (let i = 0; i <= N; i++) {
    const v = V_MIN + ((V_MAX - V_MIN) * i) / N
    const iMa = diodeCurrent(d, v) * 1000
    if (iMa > I_MAX_MA) {
      // Linearly interpolate the crossing of I_MAX between this and previous sample
      if (!prevAboveTop && samples.length > 0) {
        const prevV = V_MIN + ((V_MAX - V_MIN) * (i - 1)) / N
        const prevIMa = diodeCurrent(d, prevV) * 1000
        const t = (I_MAX_MA - prevIMa) / (iMa - prevIMa)
        const vCross = prevV + t * (v - prevV)
        samples.push({ x: vToX(vCross), y: iMaToY(I_MAX_MA) })
      }
      prevAboveTop = true
      continue
    }
    prevAboveTop = false
    samples.push({ x: vToX(v), y: iMaToY(Math.max(iMa, 0)) })
  }
  if (samples.length === 0) return ''
  return samples.map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`)).join(' ')
}

/* ── Component ───────────────────────────────────────────────────── */

export default function DiodeIVCurve() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const clipId = useId()

  const [activeId, setActiveId] = useState<DiodeKind['id']>('silicon')
  const [v, setV] = useState<number>(V_DEFAULT)

  const active = DIODES.find(d => d.id === activeId) ?? DIODES[0]

  const paths = useMemo(
    () => DIODES.map(d => ({ id: d.id, path: buildCurvePath(d), color: d.colorVar })),
    [],
  )

  // Current at the slider position for the active diode (mA)
  const iMa = diodeCurrent(active, v) * 1000

  // Cursor position on the active curve (clamped to plot bounds)
  const cursorX = vToX(v)
  const cursorY = iMaToY(Math.min(Math.max(iMa, 0), I_MAX_MA))
  const cursorOffChart = iMa > I_MAX_MA

  // Readout — format current with appropriate precision for its magnitude
  const formatCurrent = (mA: number): string => {
    if (mA > I_MAX_MA) return `> ${formatDecimal(I_MAX_MA, 0, locale)} ${tUnit('ma')}`
    if (mA >= 1)   return `${formatDecimal(mA, 1, locale)} ${tUnit('ma')}`
    if (mA >= 0.001) return `${formatDecimal(mA * 1000, 0, locale)} ${tUnit('ua')}`
    return `≈ 0 ${tUnit('ma')}`
  }

  return (
    <Widget
      title={t('ch1_10.widget.diodeIv.title')}
      description={t('ch1_10.widget.diodeIv.description')}
    >
      {/* ── Diode picker ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {DIODES.map(d => {
          const isActive = d.id === activeId
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveId(d.id)}
              aria-pressed={isActive}
              className={[
                'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors',
                isActive
                  ? 'border-foreground bg-card font-medium text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className="inline-block h-[10px] w-[18px] rounded-sm"
                style={{ backgroundColor: d.colorVar }}
              />
              {t(`ch1_10.widget.diodeIv.${d.id}.name`)}
            </button>
          )
        })}
      </div>

      {/* ── V slider ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="div-v" className="text-sm font-medium text-foreground">
            {t('ch1_10.widget.diodeIv.voltageLabel')}
          </label>
          <span className="text-sm font-mono text-muted-foreground">
            {formatDecimal(v, 2, locale)} {tUnit('v')}
          </span>
        </div>
        <Slider
          id="div-v"
          min={V_MIN}
          max={V_MAX}
          step={V_STEP}
          value={[v]}
          onValueChange={([newV]) => setV(newV ?? V_DEFAULT)}
          aria-label={t('ch1_10.widget.diodeIv.voltageLabel')}
        />
        <div className="flex justify-between mt-1 text-[11px] text-muted-foreground font-mono">
          <span>0 {tUnit('v')}</span>
          <span>{formatDecimal(V_MAX, 1, locale)} {tUnit('v')}</span>
        </div>
      </div>

      {/* ── Plot ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card/60 p-3 overflow-x-auto">
        <svg
          width={VB_W}
          height={VB_H}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={t('ch1_10.widget.diodeIv.ariaLabel')}
          style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
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

          {/* Gridlines */}
          <g stroke={svgTokens.border} strokeWidth={0.5} opacity={0.55}>
            {X_TICKS_V.slice(1).map(x => (
              <line
                key={`gx${x}`}
                x1={vToX(x)}
                y1={PLOT_Y0}
                x2={vToX(x)}
                y2={PLOT_Y0 + PLOT_H}
              />
            ))}
            {Y_TICKS_MA.slice(1).map(y => (
              <line
                key={`gy${y}`}
                x1={PLOT_X0}
                y1={iMaToY(y)}
                x2={PLOT_X0 + PLOT_W}
                y2={iMaToY(y)}
              />
            ))}
          </g>

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
            fontSize="13"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {X_TICKS_V.map(x => (
              <text
                key={`tx${x}`}
                x={vToX(x)}
                y={PLOT_Y0 + PLOT_H + 18}
                textAnchor="middle"
              >
                {formatDecimal(x, 1, locale)}
              </text>
            ))}
            {Y_TICKS_MA.map(y => (
              <text
                key={`ty${y}`}
                x={PLOT_X0 - 8}
                y={iMaToY(y) + 4}
                textAnchor="end"
              >
                {y}
              </text>
            ))}
          </g>

          {/* Axis titles */}
          <text
            x={PLOT_X0 + PLOT_W / 2}
            y={PLOT_Y0 + PLOT_H + 34}
            fontSize="14"
            fill={svgTokens.fg}
            textAnchor="middle"
          >
            <tspan fontStyle="italic" fontFamily="Georgia, serif">V</tspan>
            <tspan>{' ('}{tUnit('v')}{')'}</tspan>
          </text>
          <text
            x={14}
            y={PLOT_Y0 + PLOT_H / 2}
            fontSize="14"
            fill={svgTokens.fg}
            textAnchor="middle"
            transform={`rotate(-90 14 ${PLOT_Y0 + PLOT_H / 2})`}
          >
            <tspan fontStyle="italic" fontFamily="Georgia, serif">I</tspan>
            <tspan>{' ('}{tUnit('ma')}{')'}</tspan>
          </text>

          {/* Curves: ghost the inactive ones, highlight the active one */}
          <g clipPath={`url(#${clipId})`} fill="none">
            {paths.map(p => {
              const isActive = p.id === activeId
              return (
                <path
                  key={p.id}
                  d={p.path}
                  stroke={p.color}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isActive ? 1 : 0.32}
                />
              )
            })}
          </g>

          {/* V cursor — vertical line at the slider's V */}
          <g clipPath={`url(#${clipId})`}>
            <line
              x1={cursorX}
              y1={PLOT_Y0}
              x2={cursorX}
              y2={PLOT_Y0 + PLOT_H}
              stroke={svgTokens.fg}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.6}
            />
            {!cursorOffChart && (
              <circle
                cx={cursorX}
                cy={cursorY}
                r={5}
                fill="hsl(var(--background))"
                stroke={active.colorVar}
                strokeWidth={2.5}
              />
            )}
          </g>
        </svg>
      </div>

      {/* ── Readout ──────────────────────────────────────────────── */}
      <ResultBox tone="success">
        <p className="text-sm text-foreground">
          {t('ch1_10.widget.diodeIv.readoutLead', {
            voltage: `${formatDecimal(v, 2, locale)} ${tUnit('v')}`,
            current: formatCurrent(iMa),
          })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t(`ch1_10.widget.diodeIv.${active.id}.note`)}
        </p>
      </ResultBox>
    </Widget>
  )
}
