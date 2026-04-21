import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal } from '@/lib/format'
import { svgTokens } from '@/components/diagrams/svgTokens'
import { cn } from '@/lib/utils'

/**
 * Chapter 1.3 — Peak / Peak-to-Peak / Average / RMS selector.
 *
 * A fixed sine wave (A = 10 V peak, f = 100 Hz → T = 10 ms, two cycles
 * visible). The reader picks one of four "levels" in a segmented tab
 * bar and the plot draws that level directly on the trace:
 *
 *   PEAK        — a horizontal dashed line at +V_peak. Label "V_pk".
 *   PEAK-TO-PEAK — a vertical bracket on the right of the plot spanning
 *                  +V_peak to −V_peak. Label "V_pp = 2·V_pk".
 *   AVERAGE     — the half-cycle rectified average (2/π·V_peak). Shown
 *                 as a horizontal dashed line at +0.637·V_peak, in the
 *                 positive half-cycle. Caption notes that the true
 *                 full-cycle average is zero — the half-cycle average
 *                 is what an averaging DMM actually responds to.
 *   RMS         — a horizontal dashed line at +V_peak/√2. Label "V_rms"
 *                 and caption "the DC that would dissipate the same
 *                 average power in a resistor".
 *
 * The readout below the plot shows all four numerical values at once,
 * with the currently-selected one highlighted — so readers see, for a
 * 10 V-peak sine: Vpk = 10, Vpp = 20, Vavg ≈ 6.37, Vrms ≈ 7.07. Those
 * are the numbers they'll apply in the mains-voltage section that
 * follows.
 */

type Mode = 'peak' | 'pp' | 'avg' | 'rms'
const MODES: readonly Mode[] = ['peak', 'pp', 'avg', 'rms'] as const

// Fixed waveform. 10 V peak reads cleanly: peak 10, pp 20, avg 6.366,
// rms 7.071 — all five-digit-friendly.
const V_PEAK = 10
const V_AVG = (2 / Math.PI) * V_PEAK   // ≈ 6.366 (half-cycle)
const V_RMS = V_PEAK / Math.sqrt(2)    // ≈ 7.071
const V_PP = 2 * V_PEAK                // 20

const T_VIEW_MS = 20
const FREQ_HZ = 100

// ── Plot geometry ──────────────────────────────────────────────────
const VB_W = 520
const VB_H = 240
const PAD_L = 46
const PAD_R = 60   // wider than SineExplorer to make room for the
                   // peak-to-peak bracket + its label on the right
const PAD_T = 22
const PAD_B = 44

const PLOT_X0 = PAD_L
const PLOT_Y0 = PAD_T
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B

const X_TICKS_MS = [0, 4, 8, 12, 16, 20]
const Y_TICKS_V = [-10, -5, 0, 5, 10]
const V_MAX = 10
// Headroom beyond the labelled ±10 V so the sine's peaks don't graze
// the clipPath boundary (which would clip half the stroke width and
// make the wave look flat-topped).
const V_AXIS_MAX = V_MAX * 1.1

function tMsToX(tMs: number): number {
  return PLOT_X0 + (tMs / T_VIEW_MS) * PLOT_W
}
function vToY(v: number): number {
  return PLOT_Y0 + PLOT_H / 2 - (v / V_AXIS_MAX) * (PLOT_H / 2)
}

export default function RmsSelector() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const clipId = useId()

  const [mode, setMode] = useState<Mode>('rms')

  // ── Waveform path (fixed) ────────────────────────────────────────
  const path = useMemo(() => {
    const N = 600
    let d = ''
    for (let i = 0; i <= N; i++) {
      const tMs = (i / N) * T_VIEW_MS
      const v = V_PEAK * Math.sin(2 * Math.PI * FREQ_HZ * (tMs / 1000))
      const x = tMsToX(tMs)
      const y = vToY(v)
      d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`
    }
    return d
  }, [])

  // Right-edge X for labels that hang off the trace.
  const labelX = PLOT_X0 + PLOT_W + 6

  return (
    <Widget
      title={t('ch1_3.widget.rmsSelector.title')}
      description={t('ch1_3.widget.rmsSelector.description')}
    >
      {/* ── Mode selector ────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          {t('ch1_3.widget.rmsSelector.modeLabel')}
        </p>
        <div
          role="tablist"
          aria-label={t('ch1_3.widget.rmsSelector.modeLabel')}
          className="inline-flex flex-wrap gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5"
        >
          {MODES.map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                mode === m
                  ? 'bg-background text-foreground shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`ch1_3.widget.rmsSelector.mode_${m}`)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Plot ──────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card/60 p-3">
        <svg
          width={VB_W}
          height={VB_H}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={t('ch1_3.widget.rmsSelector.ariaLabel')}
          style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        >
          <defs>
            {/* Clip extends 3 px beyond the data rect on all sides so
                the stroke half-width never grazes the boundary. */}
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
            {X_TICKS_MS.slice(1).map((x) => (
              <line
                key={`gx${x}`}
                x1={tMsToX(x)}
                y1={PLOT_Y0}
                x2={tMsToX(x)}
                y2={PLOT_Y0 + PLOT_H}
              />
            ))}
            {Y_TICKS_V.filter((y) => y !== 0).map((y) => (
              <line
                key={`gy${y}`}
                x1={PLOT_X0}
                y1={vToY(y)}
                x2={PLOT_X0 + PLOT_W}
                y2={vToY(y)}
              />
            ))}
          </g>

          {/* Zero line */}
          <line
            x1={PLOT_X0}
            y1={vToY(0)}
            x2={PLOT_X0 + PLOT_W}
            y2={vToY(0)}
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
          <g fill={svgTokens.mutedFg} fontSize="0.812em" fontFamily="ui-sans-serif, system-ui, sans-serif">
            {X_TICKS_MS.map((x) => (
              <text
                key={`tx${x}`}
                x={tMsToX(x)}
                y={PLOT_Y0 + PLOT_H + 16}
                textAnchor="middle"
              >
                {x}
              </text>
            ))}
            {Y_TICKS_V.map((y) => (
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

          {/* Axis titles */}
          <text
            x={PLOT_X0 + PLOT_W / 2}
            y={PLOT_Y0 + PLOT_H + 34}
            fontSize="0.875em"
            fill={svgTokens.fg}
            textAnchor="middle"
          >
            <tspan fontStyle="italic" fontFamily="Georgia, serif">t</tspan>
            <tspan fontFamily="ui-sans-serif, system-ui, sans-serif">
              {'\u00a0('}{tUnit('ms')}{')'}
            </tspan>
          </text>
          <text
            x={16}
            y={PLOT_Y0 + PLOT_H / 2}
            fontSize="0.875em"
            fill={svgTokens.fg}
            textAnchor="middle"
            transform={`rotate(-90 16 ${PLOT_Y0 + PLOT_H / 2})`}
          >
            <tspan fontStyle="italic" fontFamily="Georgia, serif">V</tspan>
            <tspan fontFamily="ui-sans-serif, system-ui, sans-serif">
              {'\u00a0('}{tUnit('v')}{')'}
            </tspan>
          </text>

          {/* Waveform */}
          <g clipPath={`url(#${clipId})`}>
            <path
              d={path}
              fill="none"
              stroke={svgTokens.primary}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.85}
            />
          </g>

          {/* ── Mode-specific overlay ─────────────────────────────── */}
          {mode === 'peak' && (
            <g clipPath={`url(#${clipId})`}>
              <line
                x1={PLOT_X0}
                y1={vToY(V_PEAK)}
                x2={PLOT_X0 + PLOT_W}
                y2={vToY(V_PEAK)}
                stroke={svgTokens.key}
                strokeWidth={2}
                strokeDasharray="6 3"
              />
              <text
                x={labelX}
                y={vToY(V_PEAK) + 4}
                fontSize="0.875em"
                fill={svgTokens.key}
                fontFamily="Georgia, serif"
              >
                <tspan fontStyle="italic" fontWeight="700">V</tspan>
                <tspan dy="4" fontSize="0.625em">pk</tspan>
              </text>
            </g>
          )}

          {mode === 'pp' && (
            <g stroke={svgTokens.key} fill={svgTokens.key}>
              {/* Top and bottom dashed reference lines */}
              <line
                x1={PLOT_X0}
                y1={vToY(V_PEAK)}
                x2={PLOT_X0 + PLOT_W}
                y2={vToY(V_PEAK)}
                strokeWidth={1.2}
                strokeDasharray="6 3"
                opacity={0.8}
              />
              <line
                x1={PLOT_X0}
                y1={vToY(-V_PEAK)}
                x2={PLOT_X0 + PLOT_W}
                y2={vToY(-V_PEAK)}
                strokeWidth={1.2}
                strokeDasharray="6 3"
                opacity={0.8}
              />
              {/* Vertical double-arrow bracket on the right */}
              <line
                x1={PLOT_X0 + PLOT_W + 2}
                y1={vToY(V_PEAK)}
                x2={PLOT_X0 + PLOT_W + 2}
                y2={vToY(-V_PEAK)}
                strokeWidth={1.8}
              />
              <polygon
                points={`${PLOT_X0 + PLOT_W - 1},${vToY(V_PEAK) + 5} ${PLOT_X0 + PLOT_W + 5},${vToY(V_PEAK) + 5} ${PLOT_X0 + PLOT_W + 2},${vToY(V_PEAK)}`}
              />
              <polygon
                points={`${PLOT_X0 + PLOT_W - 1},${vToY(-V_PEAK) - 5} ${PLOT_X0 + PLOT_W + 5},${vToY(-V_PEAK) - 5} ${PLOT_X0 + PLOT_W + 2},${vToY(-V_PEAK)}`}
              />
              <text
                x={PLOT_X0 + PLOT_W + 8}
                y={vToY(0) + 4}
                fontSize="0.875em"
                fill={svgTokens.key}
                fontFamily="Georgia, serif"
              >
                <tspan fontStyle="italic" fontWeight="700">V</tspan>
                <tspan dy="4" fontSize="0.625em">pp</tspan>
              </text>
            </g>
          )}

          {mode === 'avg' && (
            <g clipPath={`url(#${clipId})`}>
              <line
                x1={PLOT_X0}
                y1={vToY(V_AVG)}
                x2={PLOT_X0 + PLOT_W}
                y2={vToY(V_AVG)}
                stroke={svgTokens.key}
                strokeWidth={2}
                strokeDasharray="6 3"
              />
              <text
                x={labelX}
                y={vToY(V_AVG) + 4}
                fontSize="0.875em"
                fill={svgTokens.key}
                fontFamily="Georgia, serif"
              >
                <tspan fontStyle="italic" fontWeight="700">V</tspan>
                <tspan dy="4" fontSize="0.625em">avg</tspan>
              </text>
            </g>
          )}

          {mode === 'rms' && (
            <g clipPath={`url(#${clipId})`}>
              <line
                x1={PLOT_X0}
                y1={vToY(V_RMS)}
                x2={PLOT_X0 + PLOT_W}
                y2={vToY(V_RMS)}
                stroke={svgTokens.key}
                strokeWidth={2}
                strokeDasharray="6 3"
              />
              <text
                x={labelX}
                y={vToY(V_RMS) + 4}
                fontSize="0.875em"
                fill={svgTokens.key}
                fontFamily="Georgia, serif"
              >
                <tspan fontStyle="italic" fontWeight="700">V</tspan>
                <tspan dy="4" fontSize="0.625em">rms</tspan>
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* ── Readout — all four values with the current one highlighted.
           Stacks to one column on mobile so each cell has room for the
           label + parenthesised symbol + value on a single line. The
           value/unit span is `whitespace-nowrap` so "7,07 В" never
           breaks apart mid-number — previously the narrow mobile cell
           wrapped the unit onto its own line, which read as broken. */}
      <ResultBox tone="success">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {(
            [
              ['peak', V_PEAK, 'v_pk'],
              ['pp', V_PP, 'v_pp'],
              ['avg', V_AVG, 'v_avg'],
              ['rms', V_RMS, 'v_rms'],
            ] as const
          ).map(([m, val, sym]) => (
            <div
              key={m}
              className={cn(
                'flex items-baseline justify-between gap-3',
                mode === m ? 'text-foreground font-medium' : 'text-muted-foreground',
              )}
            >
              <span>
                {t(`ch1_3.widget.rmsSelector.mode_${m}`)}
                <span className="ml-1 font-mono text-xs opacity-70">({t(`ch1_3.widget.rmsSelector.${sym}`)})</span>
              </span>
              <span className="font-mono whitespace-nowrap shrink-0">
                {formatDecimal(val, 2, locale)}&nbsp;{tUnit('v')}
              </span>
            </div>
          ))}
        </div>
      </ResultBox>

      <p className="text-[13px] text-muted-foreground">
        {t(`ch1_3.widget.rmsSelector.hint_${mode}`)}
      </p>
    </Widget>
  )
}
