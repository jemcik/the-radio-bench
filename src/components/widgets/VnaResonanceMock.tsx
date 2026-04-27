import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { svgTokens } from '@/components/diagrams/svgTokens'

/**
 * Chapter 1.7 §7 — simulated NanoVNA screen showing an S11 sweep
 * across a series LC near resonance.
 *
 * Model:
 *   |Γ(f)|² = (Q² u²) / (1 + Q² u²)   where u = f/f₀ − f₀/f
 *   S11(f)  = 20 · log₁₀(|Γ(f)|)
 *
 * Γ goes to 0 at f₀ (the LC near-shorts the port) and to 1 at
 * far frequencies (no LC influence — total reflection); S11
 * therefore dips at resonance and approaches 0 dB on either side.
 *
 * Markers at f_L and f_H sit at the −3 dB-amplitude points
 * (|Γ|² = 1/2) — the standard Q definition: BW = f_H − f_L = f₀/Q.
 */

const Y_MIN_DB = -40
const Y_MAX_DB = 0

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

function dbToY(db: number): number {
  const clamped = Math.max(Y_MIN_DB, Math.min(Y_MAX_DB, db))
  const u = (clamped - Y_MIN_DB) / (Y_MAX_DB - Y_MIN_DB)  // 0 at bottom, 1 at top
  return PLOT_BOTTOM - u * PLOT_H
}

function fToX(f: number, fStart: number, fEnd: number): number {
  const u = (f - fStart) / (fEnd - fStart)
  return PLOT_LEFT + u * PLOT_W
}

function s11Db(f: number, f0: number, Q: number): number {
  if (f <= 0 || f0 <= 0 || Q <= 0) return 0
  const u = f / f0 - f0 / f
  const gammaSq = (Q * Q * u * u) / (1 + Q * Q * u * u)
  if (gammaSq <= 0) return Y_MIN_DB
  return 10 * Math.log10(gammaSq)  // = 20·log10(|Γ|) since gammaSq = |Γ|²
}

function buildCurvePath(f0: number, Q: number, fStart: number, fEnd: number): string {
  if (f0 <= 0 || Q <= 0 || fEnd <= fStart) return ''
  const STEPS = 240
  const parts: string[] = []
  for (let i = 0; i <= STEPS; i++) {
    const f = fStart + (i / STEPS) * (fEnd - fStart)
    const x = fToX(f, fStart, fEnd)
    const y = dbToY(s11Db(f, f0, Q))
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return parts.join(' ')
}

interface SliderRowProps {
  labelKey: string
  value: number
  setValue: (n: number) => void
  min: number
  max: number
  step: number
  display: string
  idSuffix: string
  t: (k: string) => string
}

function SliderRow({ labelKey, value, setValue, min, max, step, display, idSuffix, t }: SliderRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label
        htmlFor={`vna-mock-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-32"
      >
        {t(labelKey)}
      </label>
      <input
        id={`vna-mock-${idSuffix}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        className="flex-1 max-w-[260px]"
      />
      <span className="font-mono text-foreground tabular-nums w-20 text-right">
        {display}
      </span>
    </div>
  )
}

export default function VnaResonanceMock() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const clipId = useId()

  // Defaults: 7.0 MHz centre (40-m amateur band), Q=50, ±50 % span.
  const [f0Mhz, setF0Mhz] = useState(7.0)
  const [Q, setQ] = useState(50)
  const [spanFrac, setSpanFrac] = useState(0.5)  // ±50 % of f₀

  const f0Hz = f0Mhz * 1e6
  const fStart = f0Hz * (1 - spanFrac)
  const fEnd = f0Hz * (1 + spanFrac)

  const { fL, fH, bw } = useMemo(() => {
    if (Q <= 0 || f0Hz <= 0) return { fL: 0, fH: 0, bw: 0 }
    // |Γ|² = 1/2 → Q²u² = 1 → u = 1/Q
    // u = f/f₀ - f₀/f = 1/Q  (positive root, f > f₀)
    // f² - (f₀/Q)·f - f₀² = 0 → f = (f₀/(2Q))(1 + √(1 + 4Q²))
    const root = Math.sqrt(1 + 4 * Q * Q)
    const fHigh = f0Hz * (1 + root) / (2 * Q)
    const fLow = f0Hz * (-1 + root) / (2 * Q)
    return { fL: fLow, fH: fHigh, bw: fHigh - fLow }
  }, [f0Hz, Q])

  const curvePath = buildCurvePath(f0Hz, Q, fStart, fEnd)

  // Build x-tick labels: 5 evenly-spaced ticks in MHz
  const xTicks = useMemo(() => {
    const arr: { f: number; label: string }[] = []
    for (let i = 0; i <= 4; i++) {
      const f = fStart + (i / 4) * (fEnd - fStart)
      const fMhz = f / 1e6
      const places = fMhz < 1 ? 3 : fMhz < 10 ? 2 : 1
      arr.push({ f, label: num(Math.round(fMhz * Math.pow(10, places)) / Math.pow(10, places)) })
    }
    return arr
  }, [fStart, fEnd, num])

  // Marker positions
  const xF0 = fToX(f0Hz, fStart, fEnd)
  const xFL = fL > 0 ? fToX(fL, fStart, fEnd) : PLOT_LEFT
  const xFH = fH > 0 ? fToX(fH, fStart, fEnd) : PLOT_RIGHT
  const yMinus3dB = dbToY(s11Db(fH, f0Hz, Q))

  // Format f₀, BW, Q for readouts
  const f0Display = `${num(Math.round(f0Mhz * 1000) / 1000)} ${tUnit('mhz')}`
  const bwKhz = bw / 1e3
  const bwDisplay = bwKhz >= 1
    ? `${num(Math.round(bwKhz * 10) / 10)} ${tUnit('khz')}`
    : `${num(Math.round(bw))} ${tUnit('hz')}`

  return (
    <Widget
      title={t('ch1_7.widget.vna.title')}
      description={t('ch1_7.widget.vna.description')}
    >
      {/* ── Controls ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3">
        <SliderRow
          labelKey="ch1_7.widget.vna.f0Label"
          value={f0Mhz} setValue={setF0Mhz}
          min={1} max={50} step={0.1}
          display={`${num(Math.round(f0Mhz * 10) / 10)} ${tUnit('mhz')}`}
          idSuffix="f0" t={t}
        />
        <SliderRow
          labelKey="ch1_7.widget.vna.qLabel"
          value={Q} setValue={setQ}
          min={5} max={500} step={1}
          display={num(Math.round(Q))}
          idSuffix="q" t={t}
        />
        <SliderRow
          labelKey="ch1_7.widget.vna.spanLabel"
          value={spanFrac} setValue={setSpanFrac}
          min={0.05} max={0.8} step={0.01}
          display={`±${num(Math.round(spanFrac * 100))} %`}
          idSuffix="span" t={t}
        />
      </div>

      {/* ── VNA-screen plot ────────────────────────────────────── */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        role="img"
        aria-label={t('ch1_7.widget.vna.title')}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H} />
          </clipPath>
        </defs>

        {/* «Screen» background tint */}
        <rect
          x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H}
          fill={svgTokens.fg} opacity={0.04}
        />
        {/* Plot frame */}
        <rect
          x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H}
          fill="none" stroke={svgTokens.border} strokeWidth={1}
        />

        {/* Y-axis gridlines and tick labels at 0, -10, -20, -30, -40 dB */}
        {[0, -10, -20, -30, -40].map(db => {
          const y = dbToY(db)
          return (
            <g key={db}>
              <line
                x1={PLOT_LEFT} x2={PLOT_RIGHT}
                y1={y} y2={y}
                stroke={svgTokens.border} strokeWidth={0.6} strokeDasharray="2 4"
              />
              <text
                x={PLOT_LEFT - 6} y={y + 4}
                fontSize="0.75em" textAnchor="end"
                fill={svgTokens.mutedFg}
              >
                {db}
              </text>
            </g>
          )
        })}

        {/* X-axis tick marks + labels */}
        {xTicks.map(({ f, label }, i) => {
          const x = fToX(f, fStart, fEnd)
          return (
            <g key={i}>
              <line
                x1={x} x2={x}
                y1={PLOT_BOTTOM} y2={PLOT_BOTTOM + 4}
                stroke={svgTokens.fg} strokeWidth={0.8}
              />
              <text
                x={x} y={PLOT_BOTTOM + 16}
                fontSize="0.75em" textAnchor="middle"
                fill={svgTokens.mutedFg}
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* S11 trace */}
        {curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke={svgTokens.primary}
            strokeWidth={2.4}
            strokeLinejoin="round"
            strokeLinecap="round"
            clipPath={`url(#${clipId})`}
          />
        )}

        {/* Markers: f₀, f_L, f_H */}
        {Q > 0 && (
          <g>
            <line x1={xF0} x2={xF0} y1={PLOT_TOP} y2={PLOT_BOTTOM}
                  stroke={svgTokens.primary} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.7} />
            {fL >= fStart && fL <= fEnd && (
              <line x1={xFL} x2={xFL} y1={PLOT_TOP} y2={PLOT_BOTTOM}
                    stroke={svgTokens.note} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
            )}
            {fH >= fStart && fH <= fEnd && (
              <line x1={xFH} x2={xFH} y1={PLOT_TOP} y2={PLOT_BOTTOM}
                    stroke={svgTokens.note} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
            )}
            {/* −3 dB horizontal at the marker level */}
            <line
              x1={Math.max(PLOT_LEFT, xFL)} x2={Math.min(PLOT_RIGHT, xFH)}
              y1={yMinus3dB} y2={yMinus3dB}
              stroke={svgTokens.note} strokeWidth={1} strokeDasharray="4 3" opacity={0.55}
            />

            <text x={xF0} y={PLOT_TOP - 6} fontSize="0.812em" textAnchor="middle"
                  fill={svgTokens.primary} fontStyle="italic" fontWeight="700">
              {t('ch1_7.widget.vna.markerF0')}
            </text>
            {fL >= fStart && fL <= fEnd && (
              <text x={xFL} y={PLOT_TOP - 6} fontSize="0.75em" textAnchor="middle"
                    fill={svgTokens.note} fontStyle="italic">
                {t('ch1_7.widget.vna.markerFL')}
              </text>
            )}
            {fH >= fStart && fH <= fEnd && (
              <text x={xFH} y={PLOT_TOP - 6} fontSize="0.75em" textAnchor="middle"
                    fill={svgTokens.note} fontStyle="italic">
                {t('ch1_7.widget.vna.markerFH')}
              </text>
            )}
          </g>
        )}

        {/* Y-axis label */}
        <text
          x={PAD_L - 38} y={(PLOT_TOP + PLOT_BOTTOM) / 2}
          fontSize="0.812em" textAnchor="middle"
          transform={`rotate(-90 ${PAD_L - 38} ${(PLOT_TOP + PLOT_BOTTOM) / 2})`}
          fill={svgTokens.fg}
        >
          {t('ch1_7.widget.vna.yLabel')}
        </text>

        {/* X-axis label */}
        <text
          x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 32}
          fontSize="0.812em" textAnchor="middle"
          fill={svgTokens.fg}
        >
          {t('ch1_7.widget.vna.xLabel')}
        </text>
      </svg>

      {/* ── Readouts ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="info" label={t('ch1_7.widget.vna.markerF0')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {f0Display}
          </p>
        </ResultBox>
        <ResultBox tone="success" label={t('ch1_7.widget.vna.readoutQ')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {num(Math.round(Q))}
          </p>
        </ResultBox>
        <ResultBox tone="warn" label={t('ch1_7.widget.vna.readoutBw')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {bwDisplay}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_7.widget.vna.hint')}
      </p>
    </Widget>
  )
}
