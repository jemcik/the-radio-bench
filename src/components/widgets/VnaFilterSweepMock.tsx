import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { svgTokens } from '@/components/diagrams/svgTokens'
import { withSubscripts, withSubscriptsSvg } from '@/lib/text-with-subscripts'

/**
 * Chapter 1.8 §9 — simulated VNA showing the S21 sweep of each of the
 * four canonical filter shapes. The reader picks a shape from a tab
 * row and tunes the cutoff (or centre, for band shapes), the order
 * (LPF/HPF), and the Q (BPF/BSF). The trace updates in real time.
 *
 * Models:
 *   LPF: |H| = 1 / √(1 + (f/f_c)^(2n))
 *   HPF: |H| = 1 / √(1 + (f_c/f)^(2n))
 *   BPF: |H| = 1 / √(1 + Q²(f/f_0 − f_0/f)²)
 *   BSF: |H| = (f/f_0 − f_0/f) / √((f/f_0 − f_0/f)² + 1/Q²)
 *
 * X axis: 4 decades of frequency (100 Hz – 1 MHz). Y axis: dB
 * magnitude clipped to [-60, +5]. The visual hugs the look of a
 * NanoVNA's S21 trace: pale screen tint, dashed gridlines, primary-
 * coloured trace, −3 dB hairline, vertical f_c / f_0 marker.
 */

type Shape = 'lpf' | 'hpf' | 'bpf' | 'bsf'

const Y_MAX_DB = 5
const Y_MIN_DB = -60

const F_MIN_HZ = 100
const F_MAX_HZ = 1e6

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

function fToX(fHz: number): number {
  const t = (Math.log10(fHz) - Math.log10(F_MIN_HZ)) / (Math.log10(F_MAX_HZ) - Math.log10(F_MIN_HZ))
  return PLOT_LEFT + t * PLOT_W
}

function dbToY(db: number): number {
  // No clamping — clipPath on the curve hides off-frame portions.
  // Clamping creates a false-plateau horizontal line along the
  // Y_MIN_DB edge when the curve dives way below (e.g. HPF at f ≪ f_c
  // with high order). See plotted-curves.md.
  //
  // BUT: non-finite db (e.g. log10(0) at the exact notch centre) maps
  // to non-finite y, which `.toFixed()` renders as «Infinity» — an
  // invalid SVG path coord that aborts the rest of the trace.
  // Coerce non-finite values to a finite y far below the plot; clipPath
  // hides it the same as any other off-frame point.
  if (!Number.isFinite(db)) return PLOT_BOTTOM + 10000
  const t = (Y_MAX_DB - db) / (Y_MAX_DB - Y_MIN_DB)
  return PLOT_TOP + t * PLOT_H
}

function magDb(shape: Shape, fHz: number, fcHz: number, n: number, q: number): number {
  if (fHz <= 0 || fcHz <= 0) return Y_MIN_DB
  switch (shape) {
    case 'lpf': {
      const r = fHz / fcHz
      return -10 * Math.log10(1 + Math.pow(r, 2 * n))
    }
    case 'hpf': {
      const r = fcHz / fHz
      return -10 * Math.log10(1 + Math.pow(r, 2 * n))
    }
    case 'bpf': {
      const u = fHz / fcHz - fcHz / fHz
      return -10 * Math.log10(1 + q * q * u * u)
    }
    case 'bsf': {
      const u = fHz / fcHz - fcHz / fHz
      const num = u * u
      const denom = num + 1 / (q * q)
      return 10 * Math.log10(num / denom)
    }
  }
}

function buildPath(shape: Shape, fcHz: number, n: number, q: number): string {
  const STEPS = 280
  const samples: number[] = []

  // Base log-spaced grid spans 4 decades. Step ≈ 0.014 decades per
  // sample — fine enough for LPF/HPF, but too coarse for high-Q
  // resonances/notches whose 3-dB bandwidth is f_0 / Q (e.g. Q = 50,
  // f_0 = 1 kHz → BW = 20 Hz ≈ 0.009 decades). Without enrichment the
  // adjacent samples skim across the notch and only register a few
  // dB of dip. So for BPF/BSF we additionally sample on a fine log
  // grid centred on f_0, plus the exact f_0 itself.
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const fHz = Math.pow(10, Math.log10(F_MIN_HZ) + t * (Math.log10(F_MAX_HZ) - Math.log10(F_MIN_HZ)))
    samples.push(fHz)
  }

  if (shape === 'bpf' || shape === 'bsf') {
    // ±1 octave around f_0, 200 log-spaced extras → ≈ 0.01 oct/step
    // so the closest neighbour to f_0 is ≈ 0.7 % away. At Q = 50
    // that lands around −10 dB on the BSF skirt — close enough to
    // make the V look genuinely deep when paired with the f_0 sample.
    const FINE_STEPS = 200
    const OCTAVE_HALF_RANGE = 1
    for (let i = 0; i <= FINE_STEPS; i++) {
      const t = i / FINE_STEPS
      const octaveOffset = (t - 0.5) * 2 * OCTAVE_HALF_RANGE
      const fHz = fcHz * Math.pow(2, octaveOffset)
      if (fHz > F_MIN_HZ && fHz < F_MAX_HZ) samples.push(fHz)
    }
    // Guaranteed sample exactly at f_0. For BSF this hits log10(0) =
    // −Infinity, the dbToY guard maps it to a far-below-plot y, and
    // clipPath renders the resulting line segments as a sharp
    // vertical drop into the bottom of the plot — visually a clean
    // deep notch. For BPF the sample lands at 0 dB (the peak),
    // harmless.
    if (fcHz > F_MIN_HZ && fcHz < F_MAX_HZ) samples.push(fcHz)
  }

  samples.sort((a, b) => a - b)

  const parts: string[] = []
  for (let i = 0; i < samples.length; i++) {
    const x = fToX(samples[i])
    const y = dbToY(magDb(shape, samples[i], fcHz, n, q))
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
        htmlFor={`vna-sweep-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-32"
      >
        {withSubscripts(t(labelKey))}
      </label>
      <input
        id={`vna-sweep-${idSuffix}`}
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

export default function VnaFilterSweepMock() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const clipId = useId()

  const [shape, setShape] = useState<Shape>('lpf')
  // f_c / f_0 expressed as log10 in Hz
  const [fcLog10, setFcLog10] = useState(4) // 10 kHz
  const [order, setOrder] = useState(2) // for LPF / HPF (2nd-order is the canonical LC)
  const [q, setQ] = useState(8) // for BPF / BSF

  const fcHz = Math.pow(10, fcLog10)
  const path = buildPath(shape, fcHz, order, q)

  const xFc = fToX(fcHz)

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

  const dbTicks = [0, -20, -40, -60]
  const yMinus3 = dbToY(-3)

  const isBand = shape === 'bpf' || shape === 'bsf'

  return (
    <Widget
      title={withSubscripts(t('ch1_8.widget.vnaSweep.title'))}
      description={withSubscripts(t('ch1_8.widget.vnaSweep.description'))}
    >
      {/* ── Shape tabs ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-foreground font-medium shrink-0 w-32">
          {t('ch1_8.widget.vnaSweep.shapeLabel')}
        </span>
        {(['lpf', 'hpf', 'bpf', 'bsf'] as const).map(s => (
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
            {t(`ch1_8.widget.vnaSweep.shape${s.charAt(0).toUpperCase()}${s.slice(1)}`)}
          </button>
        ))}
      </div>

      {/* ── Sliders (cutoff/centre + order or Q) ───────────────── */}
      <div className="grid grid-cols-1 gap-3">
        <SliderRow
          labelKey="ch1_8.widget.vnaSweep.fcLabel"
          value={fcLog10}
          setValue={setFcLog10}
          min={Math.log10(F_MIN_HZ) + 0.5}
          max={Math.log10(F_MAX_HZ) - 0.5}
          step={0.05}
          display={formatFreq(fcHz, num, tUnit)}
          idSuffix="fc"
          t={t}
        />
        {isBand ? (
          <SliderRow
            labelKey="ch1_8.widget.vnaSweep.qLabel"
            value={q}
            setValue={setQ}
            min={1}
            max={50}
            step={0.5}
            display={num(Math.round(q * 10) / 10)}
            idSuffix="q"
            t={t}
          />
        ) : (
          <SliderRow
            labelKey="ch1_8.widget.vnaSweep.orderLabel"
            value={order}
            setValue={setOrder}
            min={1}
            max={5}
            step={1}
            display={num(order)}
            idSuffix="order"
            t={t}
          />
        )}
      </div>

      {/* ── Plot ──────────────────────────────────────────────── */}
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_8.widget.vnaSweep.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto', fontSize: '1rem' }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H} />
          </clipPath>
        </defs>

        {/* «Screen» tint and frame */}
        <rect
          x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H}
          fill={svgTokens.fg} opacity={0.04}
        />
        <rect
          x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H}
          fill="none" stroke={svgTokens.border} strokeWidth={1}
        />

        {/* Decade gridlines (X) */}
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

        {/* f_c / f_0 vertical hairline */}
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
              {withSubscriptsSvg(t('ch1_8.widget.vnaSweep.markerFc'))}
            </text>
          </>
        )}

        {/* S21 trace */}
        <path
          d={path}
          fill="none"
          stroke={svgTokens.primary}
          strokeWidth={2.0}
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
          {t('ch1_8.widget.vnaSweep.yLabel')}
        </text>

        {/* X-axis label */}
        <text
          x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 36}
          fontSize="0.812em" textAnchor="middle"
          fill={svgTokens.fg}
        >
          {t('ch1_8.widget.vnaSweep.xLabel')}
        </text>
      </svg>

      {/* ── Readouts ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="info" label={withSubscripts(t('ch1_8.widget.vnaSweep.markerFc'))}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {formatFreq(fcHz, num, tUnit)}
          </p>
        </ResultBox>
        {isBand ? (
          <ResultBox tone="success" label={t('ch1_8.widget.vnaSweep.qLabel')}>
            <p className="text-xl font-mono font-semibold text-foreground">
              {num(Math.round(q * 10) / 10)}
            </p>
          </ResultBox>
        ) : (
          <ResultBox tone="success" label={t('ch1_8.widget.vnaSweep.orderLabel')}>
            <p className="text-xl font-mono font-semibold text-foreground">
              {num(order)}
            </p>
          </ResultBox>
        )}
        <ResultBox tone="warn" label={t('ch1_8.widget.vnaSweep.shapeLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {t(`ch1_8.widget.vnaSweep.shape${shape.charAt(0).toUpperCase()}${shape.slice(1)}`)}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_8.widget.vnaSweep.hint')}
      </p>
    </Widget>
  )
}
