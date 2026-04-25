import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/**
 * Chapter 1.6 — RL Charge/Discharge.
 *
 * Mirror of ch 1.5's RCChargeDischarge — but the energy-storage
 * variable for an inductor is CURRENT, not voltage, so this widget
 * plots I(t) instead of V(t).
 *
 *   Charging:    I(t) = I∞ · (1 − e^(−t/τ))     where I∞ = V_in / R
 *   Discharging: I(t) = I₀ · e^(−t/τ)           where I₀ is the
 *                                                 current at the moment
 *                                                 of switch-open
 *   τ = L / R   (instead of R · C — note R sits in the DENOMINATOR)
 *
 * Reader picks L (mH/µH/nH), R (Ω/kΩ), V_in (V).
 */

const L_UNITS: Record<string, { mult: number; unitKey: string }> = {
  nh: { mult: 1e-9, unitKey: 'nh' },
  uh: { mult: 1e-6, unitKey: 'uh' },
  mh: { mult: 1e-3, unitKey: 'mh' },
}
const R_UNITS: Record<string, { mult: number; unitKey: string }> = {
  ohm:  { mult: 1,    unitKey: 'ohm' },
  kohm: { mult: 1e3,  unitKey: 'kohm' },
}

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}

function formatTau(tauSec: number, num: (n: number) => string, tUnit: (k: string) => string): { value: string; unit: string } {
  if (!isFinite(tauSec) || tauSec <= 0) return { value: num(0), unit: tUnit('s') }
  const EPS = 0.9995
  if (tauSec < 1e-6 * EPS) return { value: num(Number((tauSec * 1e9).toPrecision(3))), unit: tUnit('ns') }
  if (tauSec < 1e-3 * EPS) return { value: num(Number((tauSec * 1e6).toPrecision(3))), unit: tUnit('us') }
  if (tauSec < 1    * EPS) return { value: num(Number((tauSec * 1e3).toPrecision(3))), unit: tUnit('ms') }
  return { value: num(Number(tauSec.toPrecision(3))), unit: tUnit('s') }
}

/** Format a current in amps to mA / A. */
function formatCurrent(amps: number, fmt: (n: number, d: number) => string, tUnit: (k: string) => string): { value: string; unit: string } {
  if (!isFinite(amps) || amps <= 0) return { value: fmt(0, 2), unit: tUnit('ma') }
  const abs = Math.abs(amps)
  if (abs < 1) return { value: fmt(amps * 1e3, 2), unit: tUnit('ma') }
  return { value: fmt(amps, 2), unit: tUnit('a') }
}

/* Plot geometry */
const VB_W = 480
const VB_H = 220
const PAD_L = 44
const PAD_R = 16
const PAD_T = 14
const PAD_B = 28
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B
const T_SPAN = 5
const N_SAMPLES = 200

type Mode = 'idle' | 'charging' | 'discharging'

// Defaults: L = 10 mH, R = 100 Ω → τ = 100 µs. V_in = 5 V → I∞ = 50 mA.
const DEFAULT_L_DISP = '10'
const DEFAULT_L_UNIT = 'mh'
const DEFAULT_R_DISP = '100'
const DEFAULT_R_UNIT = 'ohm'
const DEFAULT_VIN_DISP = '5'

export default function RLChargeDischarge() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [lDisp, setLDisp] = useState(DEFAULT_L_DISP)
  const [lUnit, setLUnit] = useState(DEFAULT_L_UNIT)
  const [rDisp, setRDisp] = useState(DEFAULT_R_DISP)
  const [rUnit, setRUnit] = useState(DEFAULT_R_UNIT)
  const [vinDisp, setVinDisp] = useState(DEFAULT_VIN_DISP)

  const L = parseValue(lDisp) * L_UNITS[lUnit].mult
  const R = parseValue(rDisp) * R_UNITS[rUnit].mult
  const Vin = parseValue(vinDisp)
  const tau = R > 0 ? L / R : 0
  const iSteady = R > 0 ? Vin / R : 0
  const tauFmt = formatTau(tau, num, tUnit)
  const iSteadyFmt = formatCurrent(iSteady, fmt, tUnit)

  const [mode, setMode] = useState<Mode>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [iAnchor, setIAnchor] = useState(0)
  const [iCurrent, setICurrent] = useState(0)
  const [lastAction, setLastAction] = useState<Exclude<Mode, 'idle'> | null>(null)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const iNow = useMemo(() => {
    if (mode === 'charging') {
      return iAnchor + (iSteady - iAnchor) * (1 - Math.exp(-elapsed))
    }
    if (mode === 'discharging') {
      return iAnchor * Math.exp(-elapsed)
    }
    return iCurrent
  }, [mode, iAnchor, iCurrent, iSteady, elapsed])

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
        const finalI = mode === 'charging'
          ? iAnchor + (iSteady - iAnchor) * (1 - Math.exp(-T_SPAN))
          : iAnchor * Math.exp(-T_SPAN)
        setICurrent(finalI)
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
  }, [mode, iAnchor, iSteady, tau])

  const isFullyCharged = iSteady > 0 && iCurrent >= 0.99 * iSteady
  const isFullyDischarged = iCurrent <= 0.01 * Math.max(iSteady, 1e-12)

  function onCharge() {
    if (mode !== 'idle') return
    const startI = isFullyCharged ? 0 : iCurrent
    setIAnchor(startI)
    setICurrent(startI)
    setElapsed(0)
    setLastAction('charging')
    setMode('charging')
  }
  function onDischarge() {
    if (mode !== 'idle') return
    const startI = isFullyDischarged ? iSteady : iCurrent
    setIAnchor(startI)
    setICurrent(startI)
    setElapsed(0)
    setLastAction('discharging')
    setMode('discharging')
  }
  function onReset() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    startTimeRef.current = null
    setMode('idle')
    setElapsed(0)
    setIAnchor(0)
    setICurrent(0)
    setLastAction(null)
    setLDisp(DEFAULT_L_DISP)
    setLUnit(DEFAULT_L_UNIT)
    setRDisp(DEFAULT_R_DISP)
    setRUnit(DEFAULT_R_UNIT)
    setVinDisp(DEFAULT_VIN_DISP)
  }

  const pathD = useMemo(() => {
    const endT = mode === 'idle' ? T_SPAN : Math.max(0, Math.min(elapsed, T_SPAN))
    const fullCurve = mode === 'idle'
    const activeMode: 'charging' | 'discharging' =
      mode !== 'idle' ? mode : (lastAction ?? 'charging')
    const toY = (i: number) => PAD_T + (1 - i / Math.max(iSteady, 1e-12)) * PLOT_H
    const toX = (tNorm: number) => PAD_L + (tNorm / T_SPAN) * PLOT_W

    const samples: string[] = []
    const N = fullCurve ? N_SAMPLES : Math.max(2, Math.round(N_SAMPLES * (endT / T_SPAN)))
    for (let i = 0; i <= N; i++) {
      const tNorm = (i / N) * (fullCurve ? T_SPAN : endT)
      let v: number
      if (activeMode === 'discharging') {
        v = iAnchor * Math.exp(-tNorm)
      } else {
        v = iAnchor + (iSteady - iAnchor) * (1 - Math.exp(-tNorm))
      }
      const x = toX(tNorm)
      const y = toY(v)
      samples.push(i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : `L ${x.toFixed(2)} ${y.toFixed(2)}`)
    }
    return samples.join(' ')
  }, [mode, lastAction, elapsed, iAnchor, iSteady])

  return (
    <Widget
      title={t('ch1_6.widget.rl.title')}
      description={t('ch1_6.widget.rl.description')}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* L */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="rl-l" className="text-foreground font-medium shrink-0 w-20">
            {t('ch1_6.widget.rl.lLabel')}
          </label>
          <input
            id="rl-l"
            type="number" inputMode="decimal" step="any" min="0"
            value={lDisp}
            onChange={e => setLDisp(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-20 font-mono"
          />
          <select
            value={lUnit}
            onChange={e => setLUnit(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground"
            aria-label={`${t('ch1_6.widget.rl.lLabel')} unit`}
          >
            {(['nh', 'uh', 'mh'] as const).map(u => (
              <option key={u} value={u}>{tUnit(u)}</option>
            ))}
          </select>
        </div>
        {/* R */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="rl-r" className="text-foreground font-medium shrink-0 w-20">
            {t('ch1_6.widget.rl.rLabel')}
          </label>
          <input
            id="rl-r"
            type="number" inputMode="decimal" step="any" min="0"
            value={rDisp}
            onChange={e => setRDisp(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-20 font-mono"
          />
          <select
            value={rUnit}
            onChange={e => setRUnit(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground"
            aria-label={`${t('ch1_6.widget.rl.rLabel')} unit`}
          >
            {(['ohm', 'kohm'] as const).map(u => (
              <option key={u} value={u}>{tUnit(u)}</option>
            ))}
          </select>
        </div>
        {/* V_in */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="rl-vin" className="text-foreground font-medium shrink-0 w-20">
            {t('ch1_6.widget.rl.vLabel')}
          </label>
          <input
            id="rl-vin"
            type="number" inputMode="decimal" step="any" min="0"
            value={vinDisp}
            onChange={e => setVinDisp(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-20 font-mono"
          />
          <span className="font-mono text-foreground">{tUnit('v')}</span>
        </div>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label="RL charge / discharge plot"
        style={{ display: 'block', maxWidth: 560, margin: '0 auto' }}
      >
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H}
              stroke="currentColor" strokeWidth={1} opacity={0.6} />
        <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H}
              stroke="currentColor" strokeWidth={1} opacity={0.6} />

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
          {t('ch1_6.widget.rl.currentAxisLabel')}
        </text>

        <text
          x={PAD_L + PLOT_W} y={PAD_T + PLOT_H + 14}
          fontFamily="Georgia, serif" fontStyle="italic" fontSize="11"
          fill="currentColor" textAnchor="end" opacity={0.7}
        >
          {t('ch1_6.widget.rl.timeAxisLabel')}
        </text>

        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          opacity={mode === 'idle' ? 0.45 : 1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {mode !== 'idle' && (() => {
          const tNorm = Math.min(elapsed, T_SPAN)
          const x = PAD_L + (tNorm / T_SPAN) * PLOT_W
          const y = PAD_T + (1 - iNow / Math.max(iSteady, 1e-12)) * PLOT_H
          return <circle cx={x} cy={y} r={4} fill="currentColor" />
        })()}
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="info" label={t('ch1_6.widget.rl.tauLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {tauFmt.value} {tauFmt.unit}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            τ = L / R
          </p>
        </ResultBox>
        <ResultBox tone="success" label={t('ch1_6.widget.rl.iSteadyLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {iSteadyFmt.value} {iSteadyFmt.unit}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {mode === 'charging' ? '↗ charging'
              : mode === 'discharging' ? '↘ discharging'
              : '— idle'}
          </p>
        </ResultBox>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCharge}
          disabled={mode !== 'idle'}
          className="px-3 py-1.5 rounded-md border border-border bg-callout-experiment/10 text-callout-experiment font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-callout-experiment/20 transition-colors"
        >
          {t('ch1_6.widget.rl.chargeButton')}
        </button>
        <button
          type="button"
          onClick={onDischarge}
          disabled={mode !== 'idle'}
          className="px-3 py-1.5 rounded-md border border-border bg-callout-note/10 text-callout-note font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-callout-note/20 transition-colors"
        >
          {t('ch1_6.widget.rl.dischargeButton')}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground hover:bg-muted/40 transition-colors"
        >
          {t('ch1_6.widget.rl.resetButton')}
        </button>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_6.widget.rl.hint')}
      </p>
    </Widget>
  )
}
