/**
 * Chapter 2.3 §4 — an SSB voice envelope, with PEP and average power marked.
 *
 * The filled shape is the RF envelope of a few seconds of speech: syllable
 * bumps separated by gaps that fall to zero (SSB has no carrier). PEP is the
 * height of the single tallest bump; the dashed line is the average power,
 * far lower because speech is mostly gaps and quiet sounds.
 *
 * All labels live in the clear bands above (y < envelope top) and below
 * (y > envelope bottom) the plot, with short leaders into the figure — so no
 * text crosses the envelope path (diagram-text-overlap gate).
 *
 * Static snapshot. Bare <svg>, fixed px = viewBox, per the diagram-quality skill.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 560
const VB_H = 222

const SANS = 'ui-sans-serif, system-ui, sans-serif'

const PLOT_X0 = 40
const PLOT_X1 = 520
const CY = 100 // centreline of the RF envelope
const AMP = 58 // peak half-height (PEP)
const AVG_FRAC = 0.2 // average ≈ 1/5 of PEP

// Speech syllables: [centre fraction, height fraction], with clear gaps at
// ~0.48 and ~0.72 used as label columns.
const BUMPS: [number, number][] = [
  [0.06, 0.5],
  [0.15, 0.72],
  [0.32, 1.0], // ← PEP, the loudest peak
  [0.4, 0.58],
  [0.57, 0.8],
  [0.65, 0.5],
  [0.82, 0.68],
  [0.9, 0.6],
]
const BW = 0.035 // bump width fraction

function envelope(frac: number): number {
  let e = 0
  for (const [c, h] of BUMPS) {
    e = Math.max(e, h * Math.exp(-(((frac - c) / BW) ** 2)))
  }
  return e
}

const fracToX = (f: number) => PLOT_X0 + (PLOT_X1 - PLOT_X0) * f

/** Filled mirrored envelope path. */
function envelopePath(): string {
  const N = 240
  let top = ''
  let bot = ''
  for (let i = 0; i <= N; i++) {
    const f = i / N
    const x = fracToX(f)
    const e = envelope(f)
    top += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(CY - AMP * e).toFixed(1)} `
  }
  for (let i = N; i >= 0; i--) {
    const f = i / N
    const x = fracToX(f)
    const e = envelope(f)
    bot += `L ${x.toFixed(1)} ${(CY + AMP * e).toFixed(1)} `
  }
  return `${top}${bot} Z`
}

export default function SsbEnvelopePep() {
  const { t } = useTranslation('ui')

  const pepX = fracToX(0.32)
  const pepTopY = CY - AMP * 1.0
  const avgUpper = CY - AMP * AVG_FRAC
  const avgLower = CY + AMP * AVG_FRAC
  const avgLeaderX = fracToX(0.72) // a gap column
  const gapX = fracToX(0.485) // a gap column

  return (
    <DiagramFigure caption={t('ch2_3.pepEnvelope.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch2_3.pepEnvelope.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── RF envelope ──────────────────────────────────────────── */}
        <path d={envelopePath()} fill={svgTokens.primary} fillOpacity={0.22}
          stroke={svgTokens.primary} strokeWidth={1.6} strokeLinejoin="round" />

        {/* ── Average-power band (dashed) ──────────────────────────── */}
        <line x1={PLOT_X0} y1={avgUpper} x2={PLOT_X1} y2={avgUpper}
          stroke={svgTokens.fg} strokeWidth={1.2} strokeDasharray="5 4" opacity={0.75} />
        <line x1={PLOT_X0} y1={avgLower} x2={PLOT_X1} y2={avgLower}
          stroke={svgTokens.fg} strokeWidth={1.2} strokeDasharray="5 4" opacity={0.5} />

        {/* ── PEP marker + label (clear band above) ────────────────── */}
        <line x1={pepX} y1={pepTopY - 2} x2={pepX} y2={26} stroke={svgTokens.primary}
          strokeWidth={1.2} />
        <text x={pepX} y={18} fontSize="13.5" fontWeight={600} textAnchor="middle"
          fill={svgTokens.primary} fontFamily={SANS}>
          {t('ch2_3.pepEnvelope.pepLabel')}
        </text>

        {/* ── Average label (clear band above, leader into a gap) ──── */}
        <line x1={avgLeaderX} y1={avgUpper} x2={avgLeaderX} y2={26} stroke={svgTokens.fg}
          strokeWidth={1.1} opacity={0.6} />
        <text x={avgLeaderX} y={18} fontSize="13.5" fontWeight={600} textAnchor="middle"
          fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch2_3.pepEnvelope.avgLabel')}
        </text>

        {/* ── Gap label (clear band below) ─────────────────────────── */}
        <line x1={gapX} y1={CY + 6} x2={gapX} y2={188} stroke={svgTokens.mutedFg}
          strokeWidth={1.1} opacity={0.6} strokeDasharray="3 3" />
        <text x={gapX} y={202} fontSize="13" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch2_3.pepEnvelope.gapLabel')}
        </text>

        {/* ── Time axis ────────────────────────────────────────────── */}
        <text x={PLOT_X1} y={202} fontSize="13" textAnchor="end"
          fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch2_3.pepEnvelope.timeAxis')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
