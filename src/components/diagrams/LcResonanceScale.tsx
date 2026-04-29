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
 *
 * Marker layout: each marker has THREE lines — L value, C value
 * (prefixed with «×»), and a band caption. Splitting L and C onto
 * separate lines is what keeps the chart readable in the dense
 * 3.5–28 MHz region: a single «4 µH × 130 pF» line is ~90 ux wide,
 * but adjacent same-row markers (e.g. 7 MHz and 28 MHz) sit only
 * ~84 ux apart on the log axis. Two-line markers cap each line at
 * ~50 ux, which fits with margin.
 *
 * All unit symbols flow through `t('units.X')` so UA renders «мкГн»,
 * «пФ», «нГн», «кГц», «МГц», «ГГц» instead of the English suffixes.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

const VB_W = 640
const VB_H = 280

const PAD_L = 50
const PAD_R = 30
const AXIS_Y = 210
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
  /** Inductance value (numeric, units handled via t()) */
  lValue: number
  lUnitKey: string
  /** Capacitance value (numeric, units handled via t()) */
  cValue: number
  cUnitKey: string
  /** Translation key for the band-name caption (e.g. "example40m") */
  labelKey: string
  /** Vertical row 0 (top) or 1 (lower) — staggered to prevent label overlap */
  row: 0 | 1
}

const EXAMPLES: ExampleMarker[] = [
  { f: 1.0e6,  lValue: 250,  lUnitKey: 'uh', cValue: 100, cUnitKey: 'pf', labelKey: 'exampleAm',   row: 0 },
  { f: 3.5e6,  lValue: 20,   lUnitKey: 'uh', cValue: 100, cUnitKey: 'pf', labelKey: 'example80m',  row: 1 },
  { f: 7.0e6,  lValue: 4,    lUnitKey: 'uh', cValue: 130, cUnitKey: 'pf', labelKey: 'example40m',  row: 0 },
  { f: 14e6,   lValue: 2,    lUnitKey: 'uh', cValue: 65,  cUnitKey: 'pf', labelKey: 'example20m',  row: 1 },
  { f: 28e6,   lValue: 1,    lUnitKey: 'uh', cValue: 32,  cUnitKey: 'pf', labelKey: 'example10m',  row: 0 },
  { f: 100e6,  lValue: 0.5,  lUnitKey: 'uh', cValue: 5,   cUnitKey: 'pf', labelKey: 'exampleFm',   row: 1 },
  { f: 144e6,  lValue: 0.25, lUnitKey: 'uh', cValue: 5,   cUnitKey: 'pf', labelKey: 'example2m',   row: 0 },
  { f: 435e6,  lValue: 50,   lUnitKey: 'nh', cValue: 2.7, cUnitKey: 'pf', labelKey: 'example70cm', row: 1 },
]

const ROW_Y: Record<number, number> = { 0: 50, 1: 130 }

interface DecadeTick {
  f: number
  value: number
  unitKey: string
}

const DECADE_TICKS: DecadeTick[] = [
  { f: 1e5, value: 100, unitKey: 'khz' },
  { f: 1e6, value: 1,   unitKey: 'mhz' },
  { f: 1e7, value: 10,  unitKey: 'mhz' },
  { f: 1e8, value: 100, unitKey: 'mhz' },
  { f: 1e9, value: 1,   unitKey: 'ghz' },
]

export default function LcResonanceScale() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  return (
    <figure className="my-6 not-prose">
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_7.widget.scale.ariaLabel')}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0 auto', fontSize: '1rem' }}
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
        {DECADE_TICKS.map(({ f, value, unitKey }) => {
          const x = fToX(f)
          return (
            <g key={f}>
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
                {num(value)} {tUnit(unitKey)}
              </text>
            </g>
          )
        })}

        {/* ── Example LC markers ───────────────────────────────── */}
        {/* Each marker: 3 lines stacked above the axis. The L value
            and C value live on separate lines (rather than «L × C»
            in one line) to keep each line narrow enough that adjacent
            same-row markers in the dense HF region don't collide.
            Line 1: L value. Line 2: «× <C value>». Line 3: band
            caption. The drop-line connects the bottom of line 3 to
            the axis. */}
        {EXAMPLES.map(({ f, lValue, lUnitKey, cValue, cUnitKey, labelKey, row }) => {
          const x = fToX(f)
          const y = ROW_Y[row]
          return (
            <g key={labelKey}>
              {/* Drop-line from below the caption to the axis */}
              <line
                x1={x} x2={x}
                y1={y + 22} y2={AXIS_Y}
                stroke={svgTokens.mutedFg} strokeWidth={0.8} strokeDasharray="2 3"
              />
              {/* Line 1: L value */}
              <text
                x={x} y={y - 18}
                fontSize="0.812em" textAnchor="middle"
                fontFamily="inherit" fontWeight="700"
                fill={svgTokens.fg}
              >
                {num(lValue)} {tUnit(lUnitKey)}
              </text>
              {/* Line 2: × C value */}
              <text
                x={x} y={y - 2}
                fontSize="0.812em" textAnchor="middle"
                fontFamily="inherit" fontWeight="700"
                fill={svgTokens.fg}
              >
                × {num(cValue)} {tUnit(cUnitKey)}
              </text>
              {/* Line 3: band caption */}
              <text
                x={x} y={y + 14}
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
