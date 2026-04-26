import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/**
 * Chapter 1.5 — RC Charge/Discharge.
 *
 * Reader picks R, C, and V_in. Hitting "charge" starts an animated
 * trace of V(t) = V_in · (1 − e^(−t/RC)); "discharge" from the current
 * voltage follows V(t) = V_start · e^(−t/RC). Gridlines at each τ
 * make the 63 / 86 / 95 / 99 / 99.3 % landmarks visible without
 * numeric labels cluttering the plot.
 *
 * The animation is purely a visual aid — the numeric τ and the
 * current V_C readout are always visible, computed in closed form
 * from the equations, and locale-formatted via useLocaleFormatter.
 */

/* Unit tables for R and C inputs */
const R_UNITS: Record<string, { mult: number; unitKey: string }> = {
  ohm:  { mult: 1,    unitKey: 'ohm' },
  kohm: { mult: 1e3,  unitKey: 'kohm' },
  mohm: { mult: 1e6,  unitKey: 'mohm' },
}
const C_UNITS: Record<string, { mult: number; unitKey: string }> = {
  pf: { mult: 1e-12, unitKey: 'pf' },
  nf: { mult: 1e-9,  unitKey: 'nf' },
  uf: { mult: 1e-6,  unitKey: 'uf' },
}

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Format a time in seconds to a human-readable string with appropriate unit
 *  (ns, µs, ms, s). Uses `num()` so trailing zeros are trimmed. The unit
 *  thresholds are multiplied by 0.9995 so that products like
 *  `10e3 * 100e-6` (which floating-point delivers as 0.9999…9, i.e.
 *  barely under 1) land in the expected decade rather than one below. */
function formatTau(tauSec: number, num: (n: number) => string, tUnit: (k: string) => string): { value: string; unit: string } {
  if (!isFinite(tauSec) || tauSec <= 0) return { value: num(0), unit: tUnit('s') }
  const EPS = 0.9995
  if (tauSec < 1e-6 * EPS) return { value: num(Number((tauSec * 1e9).toPrecision(3))), unit: tUnit('ns') }
  if (tauSec < 1e-3 * EPS) return { value: num(Number((tauSec * 1e6).toPrecision(3))), unit: tUnit('us') }
  if (tauSec < 1    * EPS) return { value: num(Number((tauSec * 1e3).toPrecision(3))), unit: tUnit('ms') }
  return { value: num(Number(tauSec.toPrecision(3))), unit: tUnit('s') }
}

/* Plot geometry */
const VB_W = 480
const VB_H = 220
const PAD_L = 44
// PAD_R holds room for both the «5τ» last-tick label (centered on the
// plot's right edge) AND the italic «t» axis label that sits to the
// right of it. With PAD_R=16 the «t» (textAnchor=end on plot's right
// edge) overlapped the «5τ» label at the same y; fix is more right
// padding plus moving the axis label past the last tick — see render.
const PAD_R = 24
const PAD_T = 14
const PAD_B = 28
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B
const T_SPAN = 5 // plot spans 0 … 5τ on x-axis
const N_SAMPLES = 200

type Mode = 'idle' | 'charging' | 'discharging'

// Defaults: R = 10 kΩ, C = 100 µF → τ = 1 s. V_in = 5 V. Kept as
// module-level constants so `onReset` can restore the input fields
// (not just the animation state) to match the "fresh load" look.
const DEFAULT_R_DISP = '10'
const DEFAULT_R_UNIT = 'kohm'
const DEFAULT_C_DISP = '100'
const DEFAULT_C_UNIT = 'uf'
const DEFAULT_VIN_DISP = '5'

export default function RCChargeDischarge() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [rDisp, setRDisp] = useState(DEFAULT_R_DISP)
  const [rUnit, setRUnit] = useState(DEFAULT_R_UNIT)
  const [cDisp, setCDisp] = useState(DEFAULT_C_DISP)
  const [cUnit, setCUnit] = useState(DEFAULT_C_UNIT)
  const [vinDisp, setVinDisp] = useState(DEFAULT_VIN_DISP)

  const R = parseValue(rDisp) * R_UNITS[rUnit].mult
  const C = parseValue(cDisp) * C_UNITS[cUnit].mult
  const Vin = parseValue(vinDisp)
  const tau = R * C
  const tauFmt = formatTau(tau, num, tUnit)

  /* Animation state.
   *
   * Two voltages are tracked because they answer different questions:
   *
   *   - `vAnchor` — voltage at t=0 of the last animation (or the Reset
   *     state). Used to RENDER the 5τ curve: during animation it's the
   *     left endpoint; in idle it's the left endpoint of the «ghost»
   *     reference curve shown on the plot. Sticky: does NOT update
   *     when the animation ends — otherwise an end-of-charge would
   *     collapse the displayed curve into a flat line near V_in
   *     (vAnchor ≈ V_in → formula stays ≈ V_in for the whole 5τ).
   *
   *   - `vCurrent` — the «where the cap is right now» voltage. Drives
   *     the V-readout box and is the starting point for the NEXT
   *     Charge/Discharge press. Updated whenever an animation
   *     completes so subsequent presses build on the true state.
   *
   * `lastAction` tells the idle-mode renderer which formula the ghost
   * curve should use — without it, a just-completed discharge would
   * show a rising charge curve and vice versa.
   */
  const [mode, setMode] = useState<Mode>('idle')
  const [elapsed, setElapsed] = useState(0)          // in taus
  const [vAnchor, setVAnchor] = useState(0)
  const [vCurrent, setVCurrent] = useState(0)
  const [lastAction, setLastAction] = useState<Exclude<Mode, 'idle'> | null>(null)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Current V on the capacitor given the animation state.
  // During animation: compute from the active formula with vAnchor + elapsed.
  // In idle: just read vCurrent (set when the last animation finished).
  const vNow = useMemo(() => {
    if (mode === 'charging') {
      return vAnchor + (Vin - vAnchor) * (1 - Math.exp(-elapsed))
    }
    if (mode === 'discharging') {
      return vAnchor * Math.exp(-elapsed)
    }
    return vCurrent
  }, [mode, vAnchor, vCurrent, Vin, elapsed])

  // Animation loop — advances `elapsed` until it reaches T_SPAN (5τ).
  // Wall-clock duration follows τ LITERALLY over most of the usable
  // range, with generous clamps only at the human-perception
  // boundaries: below 300 ms the curve blurs past, above 30 s the
  // user loses patience. Between 60 ms < τ < 6 s the animation
  // timescale tracks τ 1:1 (5τ of simulated time = 5τ of wall clock),
  // which is what makes doubling C visibly double the animation
  // length — the pedagogical link the reader is looking for.
  //
  // Examples (with T_SPAN = 5):
  //   τ = 10 ms  →  5τ =  50 ms  →  durationMs = 300 ms (clamp)
  //   τ = 100 ms →  5τ = 500 ms  →  durationMs = 500 ms
  //   τ = 1 s    →  5τ =   5 s   →  durationMs =   5 s
  //   τ = 4 s    →  5τ =  20 s   →  durationMs =  20 s
  //   τ = 10 s   →  5τ =  50 s   →  durationMs =  30 s (clamp)
  useEffect(() => {
    if (mode === 'idle') return
    const target5tauMs = (Number.isFinite(tau) && tau > 0 ? tau : 1) * 5 * 1000
    const durationMs = Math.max(300, Math.min(30000, target5tauMs))
    const tick = (nowMs: number) => {
      if (startTimeRef.current == null) {
        startTimeRef.current = nowMs
      }
      const dt = (nowMs - startTimeRef.current) / durationMs
      const e = Math.min(dt * T_SPAN, T_SPAN)
      setElapsed(e)
      if (e < T_SPAN) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Animation finished. Freeze the final voltage as `vCurrent`
        // (for the readout and for the next Charge/Discharge press),
        // but DON'T touch `vAnchor` — the idle ghost curve needs
        // vAnchor to stay at the start-of-animation voltage so the
        // plot keeps showing the full 5τ arc the user just watched,
        // instead of collapsing to a flat line near the endpoint.
        const finalV = mode === 'charging'
          ? vAnchor + (Vin - vAnchor) * (1 - Math.exp(-T_SPAN))
          : vAnchor * Math.exp(-T_SPAN)
        setVCurrent(finalV)
        setElapsed(T_SPAN)
        setMode('idle')
        startTimeRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      startTimeRef.current = null
    }
  }, [mode, vAnchor, Vin, tau])

  // «Already at extreme» detection — used to decide whether a button
  // press should resume from the current voltage (partial state) or
  // restart from the opposite extreme. Buttons are NEVER disabled
  // based on state: if the user presses Charge on an already-charged
  // cap, obviously what they want is to see the curve again — so we
  // snap to 0 and animate 0 → V_in. Same idea for Discharge.
  const isFullyCharged = Vin > 0 && vCurrent >= 0.99 * Vin
  const isFullyDischarged = vCurrent <= 0.01 * Math.max(Vin, 1e-9)

  function onCharge() {
    if (mode !== 'idle') return
    // If the cap is already charged, restart from 0 V so the user
    // sees the full 0 → V_in arc instead of a flat line near V_in.
    const startV = isFullyCharged ? 0 : vCurrent
    setVAnchor(startV)
    setVCurrent(startV)
    setElapsed(0)
    setLastAction('charging')
    setMode('charging')
  }
  function onDischarge() {
    if (mode !== 'idle') return
    // Symmetric to onCharge: if cap is already (nearly) empty,
    // snap to V_in so the user sees the full V_in → 0 decay.
    const startV = isFullyDischarged ? Vin : vCurrent
    setVAnchor(startV)
    setVCurrent(startV)
    setElapsed(0)
    setLastAction('discharging')
    setMode('discharging')
  }
  function onReset() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    startTimeRef.current = null
    // Reset animation state
    setMode('idle')
    setElapsed(0)
    setVAnchor(0)
    setVCurrent(0)
    setLastAction(null)
    // Also restore input fields to their initial values — the user's
    // expectation from a «Reset» button is «bring the widget back to
    // how it looked when I loaded the page», not just «rewind the
    // animation while keeping my edits to R/C/V_in».
    setRDisp(DEFAULT_R_DISP)
    setRUnit(DEFAULT_R_UNIT)
    setCDisp(DEFAULT_C_DISP)
    setCUnit(DEFAULT_C_UNIT)
    setVinDisp(DEFAULT_VIN_DISP)
  }

  /* Build the polyline path.
   *
   * While animating: draw the partial 0 … elapsed curve from vAnchor
   * using the active mode's formula.
   *
   * When idle: draw the FULL 5τ arc the last animation traced (using
   * the preserved vAnchor + lastAction formula). This keeps the curve
   * on screen after an animation ends, instead of collapsing to a
   * flat line near the endpoint (which was the «graph disappears»
   * bug). On the initial load / after Reset (lastAction === null),
   * show the reference charge curve so the reader has a preview of
   * what Charge will do.
   */
  const pathD = useMemo(() => {
    const endT = mode === 'idle' ? T_SPAN : Math.max(0, Math.min(elapsed, T_SPAN))
    const fullCurve = mode === 'idle'
    const activeMode: 'charging' | 'discharging' =
      mode !== 'idle' ? mode : (lastAction ?? 'charging')
    const toY = (v: number) => PAD_T + (1 - v / Math.max(Vin, 1e-9)) * PLOT_H
    const toX = (tNorm: number) => PAD_L + (tNorm / T_SPAN) * PLOT_W

    const samples: string[] = []
    const N = fullCurve ? N_SAMPLES : Math.max(2, Math.round(N_SAMPLES * (endT / T_SPAN)))
    for (let i = 0; i <= N; i++) {
      const tNorm = (i / N) * (fullCurve ? T_SPAN : endT)
      let v: number
      if (activeMode === 'discharging') {
        v = vAnchor * Math.exp(-tNorm)
      } else {
        v = vAnchor + (Vin - vAnchor) * (1 - Math.exp(-tNorm))
      }
      const x = toX(tNorm)
      const y = toY(v)
      samples.push(i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : `L ${x.toFixed(2)} ${y.toFixed(2)}`)
    }
    return samples.join(' ')
  }, [mode, lastAction, elapsed, vAnchor, Vin])

  return (
    <Widget
      title={t('ch1_5.widget.rc.title')}
      description={t('ch1_5.widget.rc.description')}
    >
      {/* ── Inputs ─────────────────────────────────────────────────── */}
      {/* Stacked layout (label on top, input + unit selector below) so
          long UA labels like «Напруга живлення» get the full column
          width instead of being clipped at w-20 = 80 px. Same fix as
          RLChargeDischarge. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* R */}
        <div className="flex flex-col gap-1 text-sm">
          <label htmlFor="rc-r" className="text-foreground font-medium">
            {t('ch1_5.widget.rc.rLabel')}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="rc-r"
              type="number" inputMode="decimal" step="any" min="0"
              value={rDisp}
              onChange={e => setRDisp(e.target.value)}
              className="border border-border rounded px-2 py-1 bg-background text-foreground w-20 font-mono"
            />
            <select
              value={rUnit}
              onChange={e => setRUnit(e.target.value)}
              className="border border-border rounded px-2 py-1 bg-background text-foreground"
              aria-label={`${t('ch1_5.widget.rc.rLabel')} unit`}
            >
              {(['ohm', 'kohm', 'mohm'] as const).map(u => (
                <option key={u} value={u}>{tUnit(u)}</option>
              ))}
            </select>
          </div>
        </div>
        {/* C */}
        <div className="flex flex-col gap-1 text-sm">
          <label htmlFor="rc-c" className="text-foreground font-medium">
            {t('ch1_5.widget.rc.cLabel')}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="rc-c"
              type="number" inputMode="decimal" step="any" min="0"
              value={cDisp}
              onChange={e => setCDisp(e.target.value)}
              className="border border-border rounded px-2 py-1 bg-background text-foreground w-20 font-mono"
            />
            <select
              value={cUnit}
              onChange={e => setCUnit(e.target.value)}
              className="border border-border rounded px-2 py-1 bg-background text-foreground"
              aria-label={`${t('ch1_5.widget.rc.cLabel')} unit`}
            >
              {(['pf', 'nf', 'uf'] as const).map(u => (
                <option key={u} value={u}>{tUnit(u)}</option>
              ))}
            </select>
          </div>
        </div>
        {/* V_in */}
        <div className="flex flex-col gap-1 text-sm">
          <label htmlFor="rc-vin" className="text-foreground font-medium">
            {t('ch1_5.widget.rc.vinLabel')}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="rc-vin"
              type="number" inputMode="decimal" step="any" min="0"
              value={vinDisp}
              onChange={e => setVinDisp(e.target.value)}
              className="border border-border rounded px-2 py-1 bg-background text-foreground w-20 font-mono"
            />
            <span className="font-mono text-foreground">{tUnit('v')}</span>
          </div>
        </div>
      </div>

      {/* ── Plot ───────────────────────────────────────────────────── */}
      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label="RC charge / discharge plot"
        style={{ display: 'block', maxWidth: 560, margin: '0 auto' }}
      >
        {/* Axes */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H}
              stroke="currentColor" strokeWidth={1} opacity={0.6} />
        <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H}
              stroke="currentColor" strokeWidth={1} opacity={0.6} />

        {/* τ gridlines at 1τ … 5τ */}
        {[1, 2, 3, 4, 5].map(k => {
          const x = PAD_L + (k / T_SPAN) * PLOT_W
          return (
            <g key={k}>
              <line
                x1={x} y1={PAD_T}
                x2={x} y2={PAD_T + PLOT_H}
                stroke="currentColor"
                strokeWidth={0.6}
                strokeDasharray="2 3"
                opacity={0.35}
              />
              <text
                x={x} y={PAD_T + PLOT_H + 14}
                fontFamily="Menlo, Consolas, monospace"
                fontSize="10" fill="currentColor"
                textAnchor="middle" opacity={0.7}
              >
                {k}τ
              </text>
            </g>
          )
        })}

        {/* Horizontal V_in reference line */}
        <line
          x1={PAD_L} y1={PAD_T}
          x2={PAD_L + PLOT_W} y2={PAD_T}
          stroke="currentColor" strokeDasharray="2 3"
          opacity={0.35}
        />
        <text
          x={PAD_L - 6} y={PAD_T + 4}
          fontFamily="Menlo, Consolas, monospace" fontSize="10"
          fill="currentColor" textAnchor="end" opacity={0.7}
        >
          {t('ch1_5.widget.rc.voltageAxisLabel')}
        </text>

        {/* x-axis label — sits PAST the «5τ» tick label (textAnchor=start)
            instead of overlapping it. Both share the same y row but
            different x. */}
        <text
          x={PAD_L + PLOT_W + 8} y={PAD_T + PLOT_H + 14}
          fontFamily="inherit" fontStyle="italic" fontSize="11"
          fill="currentColor" textAnchor="start" opacity={0.7}
        >
          {t('ch1_5.widget.rc.timeAxisLabel')}
        </text>

        {/* Curve */}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          opacity={mode === 'idle' ? 0.45 : 1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Moving dot at the current value (only while animating) */}
        {mode !== 'idle' && (() => {
          const tNorm = Math.min(elapsed, T_SPAN)
          const x = PAD_L + (tNorm / T_SPAN) * PLOT_W
          const y = PAD_T + (1 - vNow / Math.max(Vin, 1e-9)) * PLOT_H
          return <circle cx={x} cy={y} r={4} fill="currentColor" />
        })()}
      </svg>

      {/* ── Readouts ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="info" label={t('ch1_5.widget.rc.tauLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {tauFmt.value} {tauFmt.unit}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            τ = R · C
          </p>
        </ResultBox>
        <ResultBox tone="success" label={t('ch1_5.widget.rc.voltageAxisLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {fmt(vNow, 2)} {tUnit('v')}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {mode === 'charging' ? t('ch1_5.widget.rc.chargingLabel')
              : mode === 'discharging' ? t('ch1_5.widget.rc.dischargingLabel')
              : t('ch1_5.widget.rc.idleLabel')}
          </p>
        </ResultBox>
      </div>

      {/* ── Controls ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCharge}
          disabled={mode !== 'idle'}
          className="px-3 py-1.5 rounded-md border border-border bg-callout-experiment/10 text-callout-experiment font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-callout-experiment/20 transition-colors"
        >
          {t('ch1_5.widget.rc.chargeButton')}
        </button>
        <button
          type="button"
          onClick={onDischarge}
          disabled={mode !== 'idle'}
          className="px-3 py-1.5 rounded-md border border-border bg-callout-note/10 text-callout-note font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-callout-note/20 transition-colors"
        >
          {t('ch1_5.widget.rc.dischargeButton')}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground hover:bg-muted/40 transition-colors"
        >
          {t('ch1_5.widget.rc.resetButton')}
        </button>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_5.widget.rc.hint')}
      </p>
    </Widget>
  )
}
