import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { svgTokens } from '@/components/diagrams/svgTokens'

/**
 * Chapter 1.7 — universal LC resonance response curve.
 *
 * Plots the normalised response of an LC pair around its resonant
 * frequency f₀ = 1 / (2π√(LC)).
 *
 *   normalised_response(f) = 1 / √(1 + Q² · (f/f₀ − f₀/f)²)
 *
 * This is the same shape for series LC (current vs frequency) and
 * for parallel LC (impedance vs frequency); a toggle changes the
 * label on the y-axis but not the curve shape. Markers at f₀ and
 * the −3 dB (0.707 of peak) points are computed analytically:
 *
 *   f_H, f_L = f₀ · (±1/(2Q) + √(1 + 1/(4Q²)))
 *   BW       = f_H − f_L = f₀ / Q
 *
 * The user controls L, C, and the loss resistance R; Q is computed
 * from Q = √(L/C) / R (the ratio of characteristic impedance to
 * loss).
 */

const L_SCALES: Record<string, { mult: number; unitKey: string }> = {
  nh: { mult: 1e-9, unitKey: 'nh' },
  uh: { mult: 1e-6, unitKey: 'uh' },
  mh: { mult: 1e-3, unitKey: 'mh' },
}

const C_SCALES: Record<string, { mult: number; unitKey: string }> = {
  pf: { mult: 1e-12, unitKey: 'pf' },
  nf: { mult: 1e-9, unitKey: 'nf' },
  uf: { mult: 1e-6, unitKey: 'uf' },
}

const R_SCALES: Record<string, { mult: number; unitKey: string }> = {
  ohm:  { mult: 1, unitKey: 'ohm' },
  kohm: { mult: 1e3, unitKey: 'kohm' },
}

type Mode = 'series' | 'parallel'

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}

function pickFreq(hz: number): { value: number; unitKey: string } {
  if (hz >= 1e9) return { value: hz / 1e9, unitKey: 'ghz' }
  if (hz >= 1e6) return { value: hz / 1e6, unitKey: 'mhz' }
  if (hz >= 1e3) return { value: hz / 1e3, unitKey: 'khz' }
  return { value: hz, unitKey: 'hz' }
}

function formatFreq(hz: number, num: (n: number) => string, tUnit: (k: string) => string): string {
  if (!Number.isFinite(hz) || hz <= 0) return `${num(0)} ${tUnit('hz')}`
  const { value, unitKey } = pickFreq(hz)
  const abs = Math.abs(value)
  const places = abs < 1 ? 3 : abs < 10 ? 2 : abs < 100 ? 1 : 0
  return `${num(Math.round(value * Math.pow(10, places)) / Math.pow(10, places))} ${tUnit(unitKey)}`
}

// ── Plot geometry ──────────────────────────────────────────────────
const VB_W = 540
const VB_H = 240
const PAD_L = 60
const PAD_R = 30
const PAD_T = 26
const PAD_B = 44
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B
const PLOT_LEFT = PAD_L
const PLOT_RIGHT = PAD_L + PLOT_W
const PLOT_TOP = PAD_T
const PLOT_BOTTOM = PAD_T + PLOT_H

// X-axis: log frequency, 1.5 decades on each side of f₀ (so f₀ × 30
// span). That's wide enough to show the full skirt of even Q≈3 curves
// while keeping the central peak readable for high-Q ones.
const LOG_HALF_SPAN = 1.5

function fToX(f: number, f0: number): number {
  if (f <= 0 || f0 <= 0) return PLOT_LEFT
  const u = Math.log10(f / f0) / LOG_HALF_SPAN  // −1 at left edge, +1 at right
  return PLOT_LEFT + (u + 1) / 2 * PLOT_W
}

function xToF(x: number, f0: number): number {
  const u = (x - PLOT_LEFT) / PLOT_W * 2 - 1
  return f0 * Math.pow(10, u * LOG_HALF_SPAN)
}

function rToY(r: number): number {
  const clamped = Math.max(0, Math.min(1, r))
  return PLOT_BOTTOM - clamped * PLOT_H
}

function buildCurvePath(f0: number, Q: number): string {
  if (f0 <= 0 || Q <= 0) return ''
  const STEPS = 220
  const parts: string[] = []
  for (let i = 0; i <= STEPS; i++) {
    const x = PLOT_LEFT + (i / STEPS) * PLOT_W
    const f = xToF(x, f0)
    const u = f / f0 - f0 / f
    const r = 1 / Math.sqrt(1 + Q * Q * u * u)
    const y = rToY(r)
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return parts.join(' ')
}

interface InputRowProps {
  labelKey: string
  disp: string
  setDisp: (s: string) => void
  unit: string
  setUnit: (u: string) => void
  units: readonly string[]
  idSuffix: string
  t: (k: string) => string
  tUnit: (k: string) => string
}

function InputRow({ labelKey, disp, setDisp, unit, setUnit, units, idSuffix, t, tUnit }: InputRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label
        htmlFor={`lcr-val-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-32"
      >
        {t(labelKey)}
      </label>
      <input
        id={`lcr-val-${idSuffix}`}
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        value={disp}
        onChange={e => setDisp(e.target.value)}
        className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
      />
      <select
        value={unit}
        onChange={e => setUnit(e.target.value)}
        className="border border-border rounded px-2 py-1 bg-background text-foreground"
        aria-label={`${t(labelKey)} unit`}
      >
        {units.map(u => (
          <option key={u} value={u}>{tUnit(u)}</option>
        ))}
      </select>
    </div>
  )
}

export default function LcResponseCurve() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const clipId = useId()

  // Defaults: 4 µH × 130 pF × 5 Ω → ~7 MHz, Q ≈ 35 — readable curve.
  const [lDisp, setLDisp] = useState('4')
  const [lUnit, setLUnit] = useState('uh')
  const [cDisp, setCDisp] = useState('130')
  const [cUnit, setCUnit] = useState('pf')
  const [rDisp, setRDisp] = useState('5')
  const [rUnit, setRUnit] = useState('ohm')
  const [mode, setMode] = useState<Mode>('parallel')

  const lH = parseValue(lDisp) * L_SCALES[lUnit].mult
  const cF = parseValue(cDisp) * C_SCALES[cUnit].mult
  const rOhm = parseValue(rDisp) * R_SCALES[rUnit].mult

  const { f0, Q, bw, fL, fH } = useMemo(() => {
    if (lH <= 0 || cF <= 0 || rOhm <= 0) return { f0: 0, Q: 0, bw: 0, fL: 0, fH: 0 }
    const f = 1 / (2 * Math.PI * Math.sqrt(lH * cF))
    const Z0 = Math.sqrt(lH / cF)
    const q = Z0 / rOhm
    const oneOver2Q = 1 / (2 * q)
    const root = Math.sqrt(1 + 1 / (4 * q * q))
    return {
      f0: f,
      Q: q,
      bw: f / q,
      fL: f * (-oneOver2Q + root),
      fH: f * (oneOver2Q + root),
    }
  }, [lH, cF, rOhm])

  const curvePath = buildCurvePath(f0, Q)

  // Marker positions on the plot
  const xF0 = f0 > 0 ? fToX(f0, f0) : PLOT_LEFT + PLOT_W / 2
  const xFL = fL > 0 ? fToX(fL, f0) : PLOT_LEFT
  const xFH = fH > 0 ? fToX(fH, f0) : PLOT_RIGHT
  const yMinus3dB = rToY(1 / Math.sqrt(2))

  return (
    <Widget
      title={t('ch1_7.widget.response.title')}
      description={t('ch1_7.widget.response.description')}
    >
      {/* ── Inputs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3">
        <InputRow
          labelKey="ch1_7.widget.response.lLabel"
          disp={lDisp} setDisp={setLDisp}
          unit={lUnit} setUnit={setLUnit}
          units={['nh', 'uh', 'mh']}
          idSuffix="l" t={t} tUnit={tUnit}
        />
        <InputRow
          labelKey="ch1_7.widget.response.cLabel"
          disp={cDisp} setDisp={setCDisp}
          unit={cUnit} setUnit={setCUnit}
          units={['pf', 'nf', 'uf']}
          idSuffix="c" t={t} tUnit={tUnit}
        />
        <InputRow
          labelKey="ch1_7.widget.response.rLabel"
          disp={rDisp} setDisp={setRDisp}
          unit={rUnit} setUnit={setRUnit}
          units={['ohm', 'kohm']}
          idSuffix="r" t={t} tUnit={tUnit}
        />

        {/* Topology toggle */}
        <fieldset className="flex flex-wrap items-center gap-2 text-sm">
          <legend className="text-foreground font-medium shrink-0 w-32 inline">
            {t('ch1_7.widget.response.modeLabel')}
          </legend>
          {(['series', 'parallel'] as const).map(m => (
            <label
              key={m}
              className={`flex items-center gap-1.5 px-3 py-1 rounded border cursor-pointer ${
                mode === m
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <input
                type="radio"
                name="lcr-mode"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
                className="sr-only"
              />
              {t(`ch1_7.widget.response.mode${m.charAt(0).toUpperCase()}${m.slice(1)}`)}
            </label>
          ))}
        </fieldset>
      </div>

      {/* ── Plot ──────────────────────────────────────────────── */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        role="img"
        aria-label={t('ch1_7.widget.response.title')}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H} />
          </clipPath>
        </defs>

        {/* Plot frame */}
        <rect
          x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H}
          fill="none" stroke={svgTokens.border} strokeWidth={1}
        />

        {/* −3 dB horizontal line */}
        <line
          x1={PLOT_LEFT} x2={PLOT_RIGHT}
          y1={yMinus3dB} y2={yMinus3dB}
          stroke={svgTokens.mutedFg} strokeWidth={1} strokeDasharray="4 4" opacity={0.55}
        />
        <text
          x={PLOT_RIGHT - 4} y={yMinus3dB - 4}
          fontSize="0.75em" textAnchor="end" fill={svgTokens.mutedFg}
        >
          {t('ch1_7.widget.response.minus3db')}
        </text>

        {/* Decade gridlines at f₀/10, f₀, f₀×10 */}
        {[-1, 0, 1].map(decade => {
          const x = PLOT_LEFT + (decade / LOG_HALF_SPAN + 1) / 2 * PLOT_W
          if (x < PLOT_LEFT || x > PLOT_RIGHT) return null
          return (
            <line
              key={decade}
              x1={x} x2={x}
              y1={PLOT_TOP} y2={PLOT_BOTTOM}
              stroke={svgTokens.border} strokeWidth={0.6} strokeDasharray="2 4"
            />
          )
        })}

        {/* Response curve */}
        {curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke={svgTokens.primary}
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
            clipPath={`url(#${clipId})`}
          />
        )}

        {/* Markers: f_L, f₀, f_H */}
        {f0 > 0 && Q > 0 && (
          <g>
            <line x1={xF0} x2={xF0} y1={PLOT_TOP} y2={PLOT_BOTTOM}
                  stroke={svgTokens.primary} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.7} />
            <line x1={xFL} x2={xFL} y1={PLOT_TOP} y2={PLOT_BOTTOM}
                  stroke={svgTokens.note} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
            <line x1={xFH} x2={xFH} y1={PLOT_TOP} y2={PLOT_BOTTOM}
                  stroke={svgTokens.note} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />

            <text x={xF0} y={PLOT_TOP - 6} fontSize="0.812em" textAnchor="middle"
                  fill={svgTokens.primary} fontStyle="italic" fontWeight="700">
              {t('ch1_7.widget.response.markerF0')}
            </text>
            <text x={xFL} y={PLOT_BOTTOM + 14} fontSize="0.75em" textAnchor="middle"
                  fill={svgTokens.note} fontStyle="italic">
              {t('ch1_7.widget.response.markerFL')}
            </text>
            <text x={xFH} y={PLOT_BOTTOM + 14} fontSize="0.75em" textAnchor="middle"
                  fill={svgTokens.note} fontStyle="italic">
              {t('ch1_7.widget.response.markerFH')}
            </text>
          </g>
        )}

        {/* Y-axis label */}
        <text
          x={PAD_L - 8} y={(PLOT_TOP + PLOT_BOTTOM) / 2}
          fontSize="0.812em" textAnchor="middle"
          transform={`rotate(-90 ${PAD_L - 8} ${(PLOT_TOP + PLOT_BOTTOM) / 2})`}
          fill={svgTokens.fg} fontStyle="italic"
        >
          {t(mode === 'series' ? 'ch1_7.widget.response.yAxisSeries' : 'ch1_7.widget.response.yAxisParallel')}
        </text>

        {/* Y-axis tick labels */}
        <text x={PLOT_LEFT - 6} y={PLOT_TOP + 4} fontSize="0.75em" textAnchor="end" fill={svgTokens.mutedFg}>
          1
        </text>
        <text x={PLOT_LEFT - 6} y={PLOT_BOTTOM + 4} fontSize="0.75em" textAnchor="end" fill={svgTokens.mutedFg}>
          0
        </text>

        {/* X-axis label */}
        <text
          x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 32}
          fontSize="0.812em" textAnchor="middle"
          fill={svgTokens.fg} fontStyle="italic"
        >
          {t('ch1_7.widget.response.xAxisLabel')}
        </text>
      </svg>

      {/* ── Readouts ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="info" label={t('ch1_7.widget.response.f0Readout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {formatFreq(f0, num, tUnit)}
          </p>
        </ResultBox>
        <ResultBox tone="success" label={t('ch1_7.widget.response.qReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {Q > 0 ? num(Math.round(Q * 10) / 10) : num(0)}
          </p>
        </ResultBox>
        <ResultBox tone="warn" label={t('ch1_7.widget.response.bwReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {formatFreq(bw, num, tUnit)}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_7.widget.response.hint')}
      </p>
    </Widget>
  )
}
