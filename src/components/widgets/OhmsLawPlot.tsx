import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Slider } from '@/components/ui/slider'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal, formatNumber } from '@/lib/format'
import { svgTokens } from '@/components/diagrams/svgTokens'

/**
 * Chapter 1.2 — Ohm's Law Plot
 *
 * The canonical V–I characteristic of a resistor drawn as a straight line
 * through the origin. The reader drags a log-scaled R slider and watches
 * the line re-slope in real time — making the equation V = I·R concrete
 * in three ways simultaneously:
 *
 *   1. Linearity. The line is always straight. Diodes and transistors
 *      in later chapters won't be; establishing the straight-line mental
 *      model here is what lets "non-ohmic" mean something later.
 *   2. Proportionality. At fixed R, doubling I doubles V. Visible as the
 *      line passing through (2x, 2y) whenever it passes through (x, y).
 *   3. The slope IS R. A steeper line means a bigger resistor. The
 *      slider and the line move together; there is no separate "result"
 *      to read off — the line's tilt *is* the answer.
 *
 * The plot uses **truncate-at-boundary** (per diagram-quality skill): the
 * line is cut where it exits the plot rectangle, not clamped to the edge.
 * That matters because at small R the line exits the right edge (I = 50
 * mA at some V < 12 V) while at large R it exits the top (V = 12 V at
 * some I < 50 mA). The readout shows whichever exit the line hit.
 */

/* ── Slider range ────────────────────────────────────────────────── */

// R is log-scaled so 100 Ω and 10 kΩ are equally easy to reach.
const R_LOG_MIN = 2     // 10^2 = 100 Ω
const R_LOG_MAX = 4     // 10^4 = 10 kΩ
const R_LOG_STEP = 0.01
const R_LOG_DEFAULT = 3 // 10^3 = 1 kΩ

/* ── Plot data ranges ────────────────────────────────────────────── */

const I_MAX_MA = 50
const I_MAX_A = 0.05
const V_MAX_V = 12

/* ── Plot geometry ───────────────────────────────────────────────────
 *
 * Sizing: fixed pixel dimensions equal to the viewBox on wide
 * containers, scales DOWN proportionally on narrow containers via
 * `maxWidth: '100%'` + `height: 'auto'`. No `width="100%"` — that
 * would upscale on wide containers and inflate every fontSize. On
 * desktop the plot renders at exactly VB_W × VB_H, so fontSize
 * values land on screen as written; on mobile the SVG shrinks to
 * the available width, with fonts scaling alongside. Accepting
 * smaller mobile fonts is preferable to the plot clipping off its
 * right edge (the I axis past ~30 mA was hidden without this).
 */
const VB_W = 520
const VB_H = 220
// PAD_L budget: Y-tick labels "12" ≈ 13 px @ fontSize 13 ending 8 px
// left of axis (≈ x 33–46), rotated Y-axis title occupying the
// 10–26 column — 7 px gutter between them, 10 px margin at the edge.
const PAD_L = 54
const PAD_R = 12
const PAD_T = 20
// PAD_B budget: x-tick labels at +16 (baseline y 200, asc 190), x-axis
// title at +30 (baseline y 214, asc 204) → clear of tick descenders.
const PAD_B = 36

const PLOT_X0 = PAD_L
const PLOT_Y0 = PAD_T
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B

const X_TICKS_MA = [0, 10, 20, 30, 40, 50]
const Y_TICKS_V = [0, 3, 6, 9, 12]

function iMaToX(iMa: number) {
  return PLOT_X0 + (iMa / I_MAX_MA) * PLOT_W
}
function vToY(v: number) {
  return PLOT_Y0 + PLOT_H - (v / V_MAX_V) * PLOT_H
}

/* ── Formatting ──────────────────────────────────────────────────── */

function formatResistance(
  ohms: number,
  tUnit: (k: string) => string,
  locale: string,
): string {
  if (ohms < 1000) {
    return `${formatNumber(Math.round(ohms), locale)} ${tUnit('ohm')}`
  }
  const k = ohms / 1000
  const digits = k < 10 ? 2 : k < 100 ? 1 : 0
  return `${formatDecimal(k, digits, locale)} ${tUnit('kohm')}`
}

/* ── Component ───────────────────────────────────────────────────── */

export default function OhmsLawPlot() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const clipId = useId()

  const [rLog, setRLog] = useState<number>(R_LOG_DEFAULT)
  const resistance = Math.pow(10, rLog) // ohms

  // Truncate V = I·R at whichever plot boundary it hits first.
  const endpoint = useMemo(() => {
    const vAtImax = I_MAX_A * resistance
    if (vAtImax <= V_MAX_V) {
      // Line exits right edge: (I_MAX, I_MAX·R)
      return { iMa: I_MAX_MA, v: vAtImax, exitsRight: true as const }
    }
    // Line exits top edge: (V_MAX/R, V_MAX)
    const iAtVmax = V_MAX_V / resistance
    return { iMa: iAtVmax * 1000, v: V_MAX_V, exitsRight: false as const }
  }, [resistance])

  const readout = endpoint.exitsRight
    ? `${t('ch1_2.widget.ohmPlot.readoutAxisI')} = ${formatNumber(endpoint.iMa, locale)} ${tUnit('ma')} → ${t('ch1_2.widget.ohmPlot.readoutAxisV')} = ${formatDecimal(endpoint.v, 1, locale)} ${tUnit('v')}`
    : `${t('ch1_2.widget.ohmPlot.readoutAxisV')} = ${formatNumber(endpoint.v, locale)} ${tUnit('v')} → ${t('ch1_2.widget.ohmPlot.readoutAxisI')} = ${formatDecimal(endpoint.iMa, 1, locale)} ${tUnit('ma')}`

  return (
    <Widget
      title={t('ch1_2.widget.ohmPlot.title')}
      description={t('ch1_2.widget.ohmPlot.description')}
    >
      {/* ── R slider ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="olp-r" className="text-sm font-medium text-foreground">
            {t('ch1_2.widget.ohmPlot.resistanceLabel')}
          </label>
          <span className="text-sm font-mono text-muted-foreground">
            {formatResistance(resistance, tUnit, locale)}
          </span>
        </div>
        <Slider
          id="olp-r"
          min={R_LOG_MIN}
          max={R_LOG_MAX}
          step={R_LOG_STEP}
          value={[rLog]}
          onValueChange={([v]) => setRLog(v ?? R_LOG_DEFAULT)}
          aria-label={t('ch1_2.widget.ohmPlot.resistanceLabel')}
        />
        <div className="flex justify-between mt-1 text-[11px] text-muted-foreground">
          <span>100 {tUnit('ohm')}</span>
          <span>10 {tUnit('kohm')}</span>
        </div>
      </div>

      {/* ── Plot ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card/60 p-3">
        <svg
          width={VB_W}
          height={VB_H}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={t('ch1_2.widget.ohmPlot.ariaLabel')}
          style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        >
          <defs>
            {/* Clip extends 3 px outside the data rect in every
                direction so the stroke half-width (max 1.25 px at
                strokeWidth 2.5) never hits the boundary — otherwise
                the V=I·R line looks «flat-topped» the moment it
                exits the top axis. */}
            <clipPath id={clipId}>
              <rect
                x={PLOT_X0 - 3}
                y={PLOT_Y0 - 3}
                width={PLOT_W + 6}
                height={PLOT_H + 6}
              />
            </clipPath>
          </defs>

          {/* Gridlines (skip the 0 ticks — those coincide with the axes) */}
          <g stroke={svgTokens.border} strokeWidth={0.5} opacity={0.55}>
            {X_TICKS_MA.slice(1).map(x => (
              <line
                key={`gx${x}`}
                x1={iMaToX(x)}
                y1={PLOT_Y0}
                x2={iMaToX(x)}
                y2={PLOT_Y0 + PLOT_H}
              />
            ))}
            {Y_TICKS_V.slice(1).map(y => (
              <line
                key={`gy${y}`}
                x1={PLOT_X0}
                y1={vToY(y)}
                x2={PLOT_X0 + PLOT_W}
                y2={vToY(y)}
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
          <g fill={svgTokens.mutedFg} fontSize="0.812em" fontFamily="ui-sans-serif, system-ui, sans-serif">
            {X_TICKS_MA.map(x => (
              <text
                key={`tx${x}`}
                x={iMaToX(x)}
                y={PLOT_Y0 + PLOT_H + 16}
                textAnchor="middle"
              >
                {x}
              </text>
            ))}
            {Y_TICKS_V.map(y => (
              <text
                key={`ty${y}`}
                x={PLOT_X0 - 8}
                y={vToY(y) + 4}
                textAnchor="end"
              >
                {y}
              </text>
            ))}
          </g>

          {/* Axis titles — math variables in italic Georgia, unit in sans.
              X-title centred well below the tick row; Y-title rotated
              vertically on the left so neither can collide with a tick. */}
          <text
            x={PLOT_X0 + PLOT_W / 2}
            y={PLOT_Y0 + PLOT_H + 30}
            fontSize="0.812em"
            fill={svgTokens.fg}
            textAnchor="middle"
          >
            <tspan fontStyle="italic" fontFamily="inherit">I</tspan>
            <tspan fontFamily="ui-sans-serif, system-ui, sans-serif">
              {'\u00a0('}{tUnit('ma')}{')'}
            </tspan>
          </text>
          <text
            x={18}
            y={PLOT_Y0 + PLOT_H / 2}
            fontSize="0.812em"
            fill={svgTokens.fg}
            textAnchor="middle"
            transform={`rotate(-90 18 ${PLOT_Y0 + PLOT_H / 2})`}
          >
            <tspan fontStyle="italic" fontFamily="inherit">V</tspan>
            <tspan fontFamily="ui-sans-serif, system-ui, sans-serif">
              {'\u00a0('}{tUnit('v')}{')'}
            </tspan>
          </text>

          {/* V = I·R line — truncated at whichever plot edge the parabola
              hits first. `endpoint` is the data-space coordinate of that
              edge hit and is also what the numeric readout below the plot
              displays, so no separate endpoint marker is needed. */}
          <g clipPath={`url(#${clipId})`}>
            <line
              x1={iMaToX(0)}
              y1={vToY(0)}
              x2={iMaToX(endpoint.iMa)}
              y2={vToY(endpoint.v)}
              stroke={svgTokens.primary}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* ── Readout ──────────────────────────────────────────────── */}
      <ResultBox tone="success">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-foreground">{readout}</p>
          <p className="text-xs font-mono text-muted-foreground">
            V = I · R = {formatResistance(resistance, tUnit, locale)} ·{' '}
            {formatDecimal(endpoint.iMa, 1, locale)} {tUnit('ma')} ={' '}
            {formatDecimal(endpoint.v, 2, locale)} {tUnit('v')}
          </p>
        </div>
      </ResultBox>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_2.widget.ohmPlot.hint')}
      </p>
    </Widget>
  )
}
