/**
 * Chapter 1.7 §6 — horizontal log-frequency scale showing example
 * L–C pairs that resonate on each common amateur or commercial band.
 *
 * Layout: a single horizontal axis from 100 kHz to 1 GHz on log
 * scale, with band ribbons at the bottom (MF / HF / VHF / UHF) and
 * markers above showing example component pairs.
 *
 * No animation, no rough.js — this is a reference chart and clarity
 * matters more than texture.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 640
const VB_H = 240

const PAD_L = 50
const PAD_R = 30
const AXIS_Y = 170
const PLOT_W = VB_W - PAD_L - PAD_R

// Frequency range: 100 kHz (10⁵) to 1 GHz (10⁹) → 4 decades
const F_MIN = 1e5
const F_MAX = 1e9
const LOG_F_MIN = Math.log10(F_MIN)
const LOG_F_MAX = Math.log10(F_MAX)

function fToX(hz: number): number {
  const u = (Math.log10(hz) - LOG_F_MIN) / (LOG_F_MAX - LOG_F_MIN)
  return PAD_L + u * PLOT_W
}

const BANDS: { labelKey: string; fLo: number; fHi: number; tone: keyof typeof svgTokens }[] = [
  { labelKey: 'bandsLabelMf',  fLo: 0.3e6, fHi: 3e6,    tone: 'note' },
  { labelKey: 'bandsLabelHf',  fLo: 3e6,   fHi: 30e6,   tone: 'experiment' },
  { labelKey: 'bandsLabelVhf', fLo: 30e6,  fHi: 300e6,  tone: 'key' },
  { labelKey: 'bandsLabelUhf', fLo: 300e6, fHi: 1e9,    tone: 'caution' },
]

interface ExampleMarker {
  /** Resonant frequency in Hz */
  f: number
  /** L value displayed on the marker (with unit suffix) */
  l: string
  /** C value displayed on the marker (with unit suffix) */
  c: string
  /** Translation key for the band-name caption (e.g. "example40m") */
  labelKey: string
  /** Vertical row 0 (top) or 1 (lower) — staggered to prevent label overlap */
  row: 0 | 1
}

const EXAMPLES: ExampleMarker[] = [
  { f: 1.0e6,   l: '250 µH',  c: '100 pF', labelKey: 'exampleAm',   row: 0 },
  { f: 3.5e6,   l: '20 µH',   c: '100 pF', labelKey: 'example80m',  row: 1 },
  { f: 7.0e6,   l: '4 µH',    c: '130 pF', labelKey: 'example40m',  row: 0 },
  { f: 14e6,    l: '2 µH',    c: '65 pF',  labelKey: 'example20m',  row: 1 },
  { f: 28e6,    l: '1 µH',    c: '32 pF',  labelKey: 'example10m',  row: 0 },
  { f: 100e6,   l: '0.5 µH',  c: '5 pF',   labelKey: 'exampleFm',   row: 1 },
  { f: 144e6,   l: '0.25 µH', c: '5 pF',   labelKey: 'example2m',   row: 0 },
  { f: 435e6,   l: '50 nH',   c: '2.7 pF', labelKey: 'example70cm', row: 1 },
]

const ROW_Y: Record<number, number> = { 0: 60, 1: 110 }

export default function LcResonanceScale() {
  const { t } = useTranslation('ui')

  // Decade tick positions: 10^5, 10^6, 10^7, 10^8, 10^9
  const decadeTicks: { f: number; label: string }[] = [
    { f: 1e5, label: '100 kHz' },
    { f: 1e6, label: '1 MHz'   },
    { f: 1e7, label: '10 MHz'  },
    { f: 1e8, label: '100 MHz' },
    { f: 1e9, label: '1 GHz'   },
  ]

  return (
    <figure className="my-6 not-prose">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        role="img"
        aria-label={t('ch1_7.widget.scale.ariaLabel')}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0 auto' }}
      >
        {/* ── Band ribbons (below the axis) ────────────────────── */}
        {BANDS.map(({ labelKey, fLo, fHi, tone }) => {
          const x1 = fToX(fLo)
          const x2 = fToX(fHi)
          const w = x2 - x1
          if (w <= 0) return null
          const colour = svgTokens[tone] as string
          const cx = (x1 + x2) / 2
          return (
            <g key={labelKey}>
              <rect
                x={x1} y={AXIS_Y + 4} width={w} height={20}
                fill={colour} opacity={0.18}
              />
              <rect
                x={x1} y={AXIS_Y + 4} width={w} height={20}
                fill="none" stroke={colour} strokeWidth={0.8} opacity={0.55}
              />
              <text
                x={cx} y={AXIS_Y + 18}
                fontSize="0.812em" textAnchor="middle"
                fill={colour} fontWeight="700" fontFamily="inherit"
              >
                {t(`ch1_7.widget.scale.${labelKey}`)}
              </text>
            </g>
          )
        })}

        {/* ── Frequency axis ───────────────────────────────────── */}
        <line
          x1={PAD_L} x2={PAD_L + PLOT_W}
          y1={AXIS_Y} y2={AXIS_Y}
          stroke={svgTokens.fg} strokeWidth={1.5}
        />
        {decadeTicks.map(({ f, label }) => {
          const x = fToX(f)
          return (
            <g key={label}>
              <line
                x1={x} x2={x}
                y1={AXIS_Y - 4} y2={AXIS_Y + 4}
                stroke={svgTokens.fg} strokeWidth={1.2}
              />
              <text
                x={x} y={AXIS_Y - 9}
                fontSize="0.75em" textAnchor="middle"
                fill={svgTokens.fg}
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* ── Example LC markers ───────────────────────────────── */}
        {EXAMPLES.map(({ f, l, c, labelKey, row }) => {
          const x = fToX(f)
          const y = ROW_Y[row]
          return (
            <g key={labelKey}>
              {/* Drop-line from the marker to the axis */}
              <line
                x1={x} x2={x}
                y1={y + 12} y2={AXIS_Y}
                stroke={svgTokens.mutedFg} strokeWidth={0.8} strokeDasharray="2 3"
              />
              {/* Pair-of-values label, line 1 */}
              <text
                x={x} y={y - 10}
                fontSize="0.812em" textAnchor="middle"
                fontFamily="inherit" fontWeight="700"
                fill={svgTokens.fg}
              >
                {l} × {c}
              </text>
              {/* Band-name caption, line 2 */}
              <text
                x={x} y={y + 6}
                fontSize="0.75em" textAnchor="middle"
                fontFamily="inherit"
                fill={svgTokens.mutedFg}
              >
                {t(`ch1_7.widget.scale.${labelKey}`)}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
