/**
 * Chapter 1.10 §4 — Smoothing capacitor + ripple.
 *
 * After a full-wave bridge, the rectified output is a sequence of
 * positive bumps. Putting a smoothing capacitor across the load keeps
 * the output near the peak between bumps: the cap charges fast on
 * each rising edge (diodes conduct) and discharges slowly through the
 * load between peaks (diodes blocked). The discharge is exponential
 * with time constant τ = R·C; for τ much longer than the ripple
 * period the output stays close to V_peak with a small saw-tooth
 * residue called the ripple voltage:
 *
 *     ΔV ≈ I_load · t_period / C
 *        = (V_peak / R_load) · (1 / (2 · f_mains)) / C
 *
 * Reader picks C with the slider; widget shows:
 *   – the rectified bumps (always),
 *   – the smoothed output overlaid (charges along the rising edge,
 *     discharges as exp(−Δt/RC) between peaks),
 *   – ΔV (peak-to-peak ripple) and V_avg (average DC) as read-outs.
 *
 * Source: AoE 3rd ed. §1.6.3 «Power-supply ﬁltering».
 */
import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Slider } from '@/components/ui/slider'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal } from '@/lib/format'
import { svgTokens } from '@/components/diagrams/svgTokens'

/* ── Fixed circuit constants ─────────────────────────────────────── */

const V_PEAK = 12       // V — chosen so a 12 V wall-wart lab makes sense
const R_LOAD = 100      // Ω — modest hobby load (~120 mA at 12 V)
const F_MAINS = 50      // Hz — UA / EU mains
const F_RIPPLE = 2 * F_MAINS // 100 Hz after a full-wave bridge
const T_PERIOD = 1 / F_RIPPLE // 10 ms between adjacent peaks

/* ── Slider: log-scaled C from 1 µF to 10 000 µF ─────────────────── */

const C_LOG_MIN = 0   // log10(1)     = 0   → 1 µF
const C_LOG_MAX = 4   // log10(10000) = 4   → 10 000 µF
const C_LOG_DEFAULT = Math.log10(470) // ≈ 2.67 — a 470 µF default reads naturally
const C_LOG_STEP = 0.05

/* ── Plot geometry ───────────────────────────────────────────────── */

const VB_W = 520
const VB_H = 240
const PAD_L = 60
const PAD_R = 16
const PAD_T = 16
const PAD_B = 38

const PLOT_X0 = PAD_L
const PLOT_Y0 = PAD_T
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B

// Y-axis: 0 to V_peak * 1.1 so the trace doesn't graze the top.
const Y_MAX = V_PEAK * 1.1
const Y_TICKS_V = [0, 3, 6, 9, 12]

// X-axis: 4 ripple periods (40 ms at 50 Hz mains, 100 Hz ripple).
const N_PERIODS_DISPLAYED = 4
const T_TOTAL = N_PERIODS_DISPLAYED * T_PERIOD // 40 ms
const X_TICKS_MS = [0, 10, 20, 30, 40]

function vToY(v: number): number {
  return PLOT_Y0 + PLOT_H - (v / Y_MAX) * PLOT_H
}
function tMsToX(tMs: number): number {
  return PLOT_X0 + (tMs / (T_TOTAL * 1000)) * PLOT_W
}

/* ── Waveform builders ──────────────────────────────────────────── */

/**
 * Rectified bumps — |sin(2πft)| at f = 2·f_mains. Always drawn, in light
 * stroke. y values are in V.
 */
function buildBumpsPath(): string {
  const N = 600
  let d = ''
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T_TOTAL
    const v = V_PEAK * Math.abs(Math.sin(2 * Math.PI * F_MAINS * t))
    const x = tMsToX(t * 1000)
    const y = vToY(v)
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

/**
 * Smoothed output — between peaks, V(t) = V_peak · exp(−Δt / (R·C)).
 * On each rising edge (sine ascending toward next peak), V follows the
 * sine if the sine is above the discharge curve. Returns the path AND
 * the min/max voltages in steady state for the read-out.
 */
function buildSmoothedPath(capUf: number): { path: string; vMin: number; vMax: number } {
  const RC = R_LOAD * (capUf * 1e-6) // seconds
  const N = 600
  let d = ''
  let vMin = V_PEAK
  let vMax = 0
  // After 2-3 ripple periods the output is in steady state. Sample a few
  // periods of warm-up first so the displayed window starts in steady state.
  let v = V_PEAK
  let lastPeakT = 0
  // Warm-up: simulate 4 ripple periods before t=0.
  for (let warm = -4 * T_PERIOD; warm <= 0; warm += T_PERIOD / 200) {
    const sineV = V_PEAK * Math.abs(Math.sin(2 * Math.PI * F_MAINS * warm))
    const sinceLast = warm - lastPeakT
    const dischargeV = V_PEAK * Math.exp(-sinceLast / RC)
    if (sineV >= dischargeV) {
      v = sineV
      lastPeakT = warm
    } else {
      v = dischargeV
    }
  }
  // Now plot the displayed window.
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T_TOTAL
    const sineV = V_PEAK * Math.abs(Math.sin(2 * Math.PI * F_MAINS * t))
    const sinceLast = t - lastPeakT
    const dischargeV = V_PEAK * Math.exp(-sinceLast / RC)
    if (sineV >= dischargeV) {
      v = sineV
      lastPeakT = t
    } else {
      v = dischargeV
    }
    if (v > vMax) vMax = v
    if (v < vMin) vMin = v
    const x = tMsToX(t * 1000)
    const y = vToY(v)
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return { path: d, vMin, vMax }
}

/* ── Component ──────────────────────────────────────────────────── */

export default function RippleSmoothingWidget() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const clipId = useId()

  const [cLog, setCLog] = useState<number>(C_LOG_DEFAULT)
  const capUf = Math.pow(10, cLog)

  const bumpsPath = useMemo(() => buildBumpsPath(), [])
  const smoothed = useMemo(() => buildSmoothedPath(capUf), [capUf])

  const ripple = smoothed.vMax - smoothed.vMin
  const vAvg = (smoothed.vMax + smoothed.vMin) / 2

  const fmtCap = (uf: number): string => {
    if (uf < 100) return `${formatDecimal(uf, 1, locale)} ${tUnit('uf')}`
    if (uf < 1000) return `${formatDecimal(uf, 0, locale)} ${tUnit('uf')}`
    return `${formatDecimal(uf / 1000, 1, locale)} ${tUnit('mf')}`
  }

  return (
    <Widget
      title={t('ch1_10.widget.ripple.title')}
      description={t('ch1_10.widget.ripple.description')}
    >
      {/* ── C slider ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="rsw-c" className="text-sm font-medium text-foreground">
            {t('ch1_10.widget.ripple.capLabel')}
          </label>
          <span className="text-sm font-mono text-muted-foreground">
            {fmtCap(capUf)}
          </span>
        </div>
        <Slider
          id="rsw-c"
          min={C_LOG_MIN}
          max={C_LOG_MAX}
          step={C_LOG_STEP}
          value={[cLog]}
          onValueChange={([v]) => setCLog(v ?? C_LOG_DEFAULT)}
          aria-label={t('ch1_10.widget.ripple.capLabel')}
        />
        <div className="flex justify-between mt-1 text-[11px] text-muted-foreground font-mono">
          <span>1 {tUnit('uf')}</span>
          <span>10 {tUnit('mf')}</span>
        </div>
      </div>

      {/* ── Plot ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card/60 p-3 overflow-x-auto">
        <svg
          width={VB_W}
          height={VB_H}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={t('ch1_10.widget.ripple.ariaLabel')}
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
            {X_TICKS_MS.slice(1).map(x => (
              <line key={`gx${x}`} x1={tMsToX(x)} y1={PLOT_Y0} x2={tMsToX(x)} y2={PLOT_Y0 + PLOT_H} />
            ))}
            {Y_TICKS_V.slice(1).map(y => (
              <line key={`gy${y}`} x1={PLOT_X0} y1={vToY(y)} x2={PLOT_X0 + PLOT_W} y2={vToY(y)} />
            ))}
          </g>

          {/* Axes */}
          <g stroke={svgTokens.fg} strokeWidth={1} fill="none">
            <line x1={PLOT_X0} y1={PLOT_Y0} x2={PLOT_X0} y2={PLOT_Y0 + PLOT_H} />
            <line x1={PLOT_X0} y1={PLOT_Y0 + PLOT_H} x2={PLOT_X0 + PLOT_W} y2={PLOT_Y0 + PLOT_H} />
          </g>

          {/* Tick labels */}
          <g
            fill={svgTokens.mutedFg}
            fontSize="13"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {X_TICKS_MS.map(x => (
              <text key={`tx${x}`} x={tMsToX(x)} y={PLOT_Y0 + PLOT_H + 18} textAnchor="middle">
                {x}
              </text>
            ))}
            {Y_TICKS_V.map(y => (
              <text key={`ty${y}`} x={PLOT_X0 - 8} y={vToY(y) + 4} textAnchor="end">
                {y}
              </text>
            ))}
          </g>

          {/* Axis titles */}
          <text
            x={PLOT_X0 + PLOT_W / 2}
            y={PLOT_Y0 + PLOT_H + 32}
            fontSize="13"
            fill={svgTokens.fg}
            textAnchor="middle"
          >
            {t('ch1_10.widget.ripple.timeAxis')}
          </text>
          <text
            x={16}
            y={PLOT_Y0 + PLOT_H / 2}
            fontSize="13"
            fill={svgTokens.fg}
            textAnchor="middle"
            transform={`rotate(-90 16 ${PLOT_Y0 + PLOT_H / 2})`}
          >
            {t('ch1_10.widget.ripple.voltageAxis')}
          </text>

          {/* Rectified bumps — light stroke under the smoothed trace */}
          <g clipPath={`url(#${clipId})`}>
            <path
              d={bumpsPath}
              fill="none"
              stroke={svgTokens.border}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
            {/* Smoothed output */}
            <path
              d={smoothed.path}
              fill="none"
              stroke={svgTokens.primary}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      {/* ── Readout ──────────────────────────────────────────────── */}
      <ResultBox tone="success">
        <p className="text-sm text-foreground">
          {t('ch1_10.widget.ripple.readoutLead', {
            cap: fmtCap(capUf),
            ripple: `${formatDecimal(ripple, 2, locale)} ${tUnit('v')}`,
            avg: `${formatDecimal(vAvg, 2, locale)} ${tUnit('v')}`,
          })}
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          ΔV ≈ I_load · t_period / C = (V_peak / R_load) · (1 / (2·f_mains)) / C
        </p>
      </ResultBox>
    </Widget>
  )
}
