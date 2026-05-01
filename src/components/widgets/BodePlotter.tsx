import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { svgTokens } from '@/components/diagrams/svgTokens'
import { withSubscripts, withSubscriptsSvg } from '@/lib/text-with-subscripts'

/**
 * Chapter 1.8 §6 — interactive Bode plotter.
 *
 * Plots the magnitude response of an N-pole Butterworth low-pass or
 * high-pass filter on log-frequency / dB-magnitude axes:
 *
 *   LPF :  |H(f)| = 1 / √(1 + (f/f_c)^(2n))   →  dB = −10·log₁₀(1 + (f/f_c)^(2n))
 *   HPF :  |H(f)| = 1 / √(1 + (f_c/f)^(2n))   →  dB = −10·log₁₀(1 + (f_c/f)^(2n))
 *
 * Both shapes pass through exactly −3 dB at f = f_c regardless of n;
 * the order n controls only how steep the skirt is. The widget
 * teaches «−3 dB at cutoff» and «−20 dB per decade per pole» in
 * one picture.
 */

const Y_MAX_DB = 5
const Y_MIN_DB = -60

// X axis: 4 decades of frequency. Bounds are fixed in log-space so the
// slider's f_c knob slides the curve left/right inside a stationary
// frame — the cleanest way to teach «the −3 dB point sits at f_c».
const F_MIN_HZ = 100
const F_MAX_HZ = 1e6  // → 4 decades on the X axis

const VB_W = 720
const VB_H = 320
const PAD_L = 70
const PAD_R = 32
const PAD_T = 28
const PAD_B = 56
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B
const PLOT_LEFT = PAD_L
const PLOT_RIGHT = PAD_L + PLOT_W
const PLOT_TOP = PAD_T
const PLOT_BOTTOM = PAD_T + PLOT_H

type Shape = 'lpf' | 'hpf'

function fToX(fHz: number): number {
  const t = (Math.log10(fHz) - Math.log10(F_MIN_HZ)) / (Math.log10(F_MAX_HZ) - Math.log10(F_MIN_HZ))
  return PLOT_LEFT + t * PLOT_W
}

function dbToY(db: number): number {
  // No clamping — values below Y_MIN_DB resolve to y > PLOT_BOTTOM,
  // values above Y_MAX_DB to y < PLOT_TOP. The clipPath on the curve
  // hides the off-frame portions; without clamping there is no
  // "false plateau" line glued along the bottom edge when the curve
  // computes to e.g. −150 dB (HPF at f ≪ f_c, 5th order). Spelled
  // out in `.claude/skills/diagram-quality/references/plotted-curves.md`
  // — and shipped wrong in this widget anyway, caught visually.
  //
  // Defensive: non-finite db (e.g. log10(0) at a notch zero — not
  // possible in this widget's LPF/HPF, but kept for consistency with
  // VnaFilterSweepMock) maps to non-finite y, which `.toFixed()`
  // renders as «Infinity» — an invalid SVG path coord that aborts the
  // rest of the trace. Coerce to a finite far-off-frame y instead.
  if (!Number.isFinite(db)) return PLOT_BOTTOM + 10000
  const t = (Y_MAX_DB - db) / (Y_MAX_DB - Y_MIN_DB)
  return PLOT_TOP + t * PLOT_H
}

function magDb(shape: Shape, fHz: number, fcHz: number, n: number): number {
  if (fHz <= 0 || fcHz <= 0) return Y_MIN_DB
  if (shape === 'lpf') {
    const r = fHz / fcHz
    return -10 * Math.log10(1 + Math.pow(r, 2 * n))
  }
  // HPF
  const r = fcHz / fHz
  return -10 * Math.log10(1 + Math.pow(r, 2 * n))
}

function buildPath(shape: Shape, fcHz: number, n: number): string {
  const STEPS = 280
  const parts: string[] = []
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const fHz = Math.pow(10, Math.log10(F_MIN_HZ) + t * (Math.log10(F_MAX_HZ) - Math.log10(F_MIN_HZ)))
    const x = fToX(fHz)
    const y = dbToY(magDb(shape, fHz, fcHz, n))
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return parts.join(' ')
}

function formatFreq(hz: number, num: (n: number) => string, tUnit: (k: string) => string): string {
  if (!Number.isFinite(hz) || hz <= 0) return `${num(0)} ${tUnit('hz')}`
  if (hz >= 1e6) return `${num(Math.round((hz / 1e6) * 100) / 100)} ${tUnit('mhz')}`
  if (hz >= 1e3) return `${num(Math.round((hz / 1e3) * 100) / 100)} ${tUnit('khz')}`
  return `${num(Math.round(hz))} ${tUnit('hz')}`
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
        htmlFor={`bode-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-32"
      >
        {withSubscripts(t(labelKey))}
      </label>
      <input
        id={`bode-${idSuffix}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        className="flex-1 max-w-[260px]"
      />
      <span className="font-mono text-foreground tabular-nums w-24 text-right">
        {display}
      </span>
    </div>
  )
}

export default function BodePlotter() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const clipId = useId()

  // Default: 1st-order LPF at 10 kHz — sits in the middle of the visible
  // axis range so the corner is centred and the user has decade headroom
  // on either side to drag the cutoff before bumping into the frame.
  const [shape, setShape] = useState<Shape>('lpf')
  // log10(f_c) in Hz, sliding from log10(F_MIN) + 0.5 to log10(F_MAX) − 0.5
  const [fcLog10, setFcLog10] = useState(4) // 10 kHz
  const [order, setOrder] = useState(1)

  const fcHz = Math.pow(10, fcLog10)

  const path = buildPath(shape, fcHz, order)
  const xFc = fToX(fcHz)
  const yMinus3 = dbToY(-3)

  // Decade tick positions on the X axis: 100, 1k, 10k, 100k, 1M
  const xTicks = useMemo(() => {
    const arr: { hz: number; label: string }[] = []
    for (let p = Math.log10(F_MIN_HZ); p <= Math.log10(F_MAX_HZ) + 0.001; p++) {
      const hz = Math.pow(10, p)
      let label: string
      if (hz >= 1e6) label = `${num(Math.round(hz / 1e6))} ${tUnit('mhz')}`
      else if (hz >= 1e3) label = `${num(Math.round(hz / 1e3))} ${tUnit('khz')}`
      else label = `${num(Math.round(hz))} ${tUnit('hz')}`
      arr.push({ hz, label })
    }
    return arr
  }, [num, tUnit])

  // dB ticks at 0, -20, -40, -60
  const dbTicks = [0, -20, -40, -60]

  // Slope readout: −20 dB per decade per pole. (For 1st order, we say
  // «−20»; for 2nd-order, «−40»; etc.)
  const slopeDbPerDecade = -20 * order

  return (
    <Widget
      title={withSubscripts(t('ch1_8.widget.bode.title'))}
      description={withSubscripts(t('ch1_8.widget.bode.description'))}
    >
      {/* ── Controls ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3">
        {/* Shape toggle (LPF / HPF) */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-foreground font-medium shrink-0 w-32">
            {t('ch1_8.widget.bode.shapeLabel')}
          </span>
          {(['lpf', 'hpf'] as const).map(s => (
            <button
              key={s}
              type="button"
              aria-pressed={shape === s}
              onClick={() => setShape(s)}
              className={`px-3 py-1 rounded border cursor-pointer transition-colors ${
                shape === s
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(`ch1_8.widget.bode.shape${s.charAt(0).toUpperCase()}${s.slice(1)}`)}
            </button>
          ))}
        </div>

        <SliderRow
          labelKey="ch1_8.widget.bode.fcLabel"
          value={fcLog10}
          setValue={setFcLog10}
          min={Math.log10(F_MIN_HZ) + 0.5}
          max={Math.log10(F_MAX_HZ) - 0.5}
          step={0.05}
          display={formatFreq(fcHz, num, tUnit)}
          idSuffix="fc"
          t={t}
        />
        <SliderRow
          labelKey="ch1_8.widget.bode.orderLabel"
          value={order}
          setValue={setOrder}
          min={1}
          max={5}
          step={1}
          display={`${num(order)}`}
          idSuffix="order"
          t={t}
        />
      </div>

      {/* ── Plot ──────────────────────────────────────────────── */}
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_8.widget.bode.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto', fontSize: '1rem' }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H} />
          </clipPath>
        </defs>

        {/* Plot frame */}
        <rect
          x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H}
          fill={svgTokens.fg} opacity={0.03}
        />
        <rect
          x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H}
          fill="none" stroke={svgTokens.border} strokeWidth={1}
        />

        {/* Major decade gridlines (X) */}
        {xTicks.map(({ hz, label }, i) => {
          const x = fToX(hz)
          return (
            <g key={i}>
              <line
                x1={x} x2={x}
                y1={PLOT_TOP} y2={PLOT_BOTTOM}
                stroke={svgTokens.border} strokeWidth={0.6} strokeDasharray="2 4"
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

        {/* dB tick gridlines (Y) */}
        {dbTicks.map(db => {
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

        {/* −3 dB horizontal guide */}
        <line
          x1={PLOT_LEFT} x2={PLOT_RIGHT}
          y1={yMinus3} y2={yMinus3}
          stroke={svgTokens.note} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.55}
        />
        {/* −3 dB label sits BELOW the dashed line. Above-the-line was
            colliding with the curve in HPF mode, where the passband
            sits at 0 dB on the right side and the curve passes through
            the upper part of the text at full PLOT_RIGHT. Below works
            for all four shapes — the curve is never below the −3 dB
            line in the right-edge column for any of them (LPF / HPF
            asymptote there is well below −3 dB in stopband, well
            above in passband). */}
        <text
          x={PLOT_RIGHT - 6} y={yMinus3 + 14}
          fontSize="0.75em" textAnchor="end"
          fill={svgTokens.note} fontStyle="italic"
        >
          {t('ch1_8.widget.bode.minus3db')}
        </text>

        {/* f_c vertical hairline */}
        {xFc >= PLOT_LEFT && xFc <= PLOT_RIGHT && (
          <>
            <line
              x1={xFc} x2={xFc}
              y1={PLOT_TOP} y2={PLOT_BOTTOM}
              stroke={svgTokens.primary} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.7}
            />
            <text
              x={xFc} y={PLOT_TOP - 12}
              fontSize="0.812em" textAnchor="middle"
              fill={svgTokens.primary} fontStyle="italic" fontWeight="700"
            >
              {withSubscriptsSvg(t('ch1_8.widget.bode.markerFc'))}
            </text>
          </>
        )}

        {/* Magnitude trace */}
        <path
          d={path}
          fill="none"
          stroke={svgTokens.primary}
          strokeWidth={2.2}
          strokeLinejoin="round"
          strokeLinecap="round"
          clipPath={`url(#${clipId})`}
        />

        {/* Y-axis label */}
        <text
          x={PAD_L - 44} y={(PLOT_TOP + PLOT_BOTTOM) / 2}
          fontSize="0.812em" textAnchor="middle"
          transform={`rotate(-90 ${PAD_L - 44} ${(PLOT_TOP + PLOT_BOTTOM) / 2})`}
          fill={svgTokens.fg}
        >
          {t('ch1_8.widget.bode.yLabel')}
        </text>

        {/* X-axis label */}
        <text
          x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 36}
          fontSize="0.812em" textAnchor="middle"
          fill={svgTokens.fg}
        >
          {t('ch1_8.widget.bode.xLabel')}
        </text>
      </svg>

      {/* ── Readouts ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="info" label={withSubscripts(t('ch1_8.widget.bode.fcReadout'))}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {formatFreq(fcHz, num, tUnit)}
          </p>
        </ResultBox>
        <ResultBox tone="success" label={t('ch1_8.widget.bode.orderLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {num(order)}
          </p>
        </ResultBox>
        <ResultBox tone="warn" label={t('ch1_8.widget.bode.slopeReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {`${num(slopeDbPerDecade)} ${t('ch1_8.widget.bode.slopeUnit')}`}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {withSubscripts(t('ch1_8.widget.bode.hint'))}
      </p>
    </Widget>
  )
}
