/**
 * Chapter 2.1 — the electromagnetic spectrum on a logarithmic frequency axis.
 *
 * Radio is just one slice of a vast continuum. Region boundaries follow the
 * ARRL Handbook 2023 §3.10 Table 3.5: radio ≈ 3 kHz–300 GHz, then infrared,
 * a hair-thin band of visible light, ultraviolet, X-rays, gamma rays. A
 * bracket marks where amateur radio mostly operates (HF–UHF).
 *
 * hardcoded-fontsize-file-ok: none — all <text> uses em tokens.
 */
import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const W = 820
const H = 150
const AX0 = 48
const AX1 = 788
const EXP_LO = 3
const EXP_HI = 21
const AXIS_Y = 86
const BAND_Y = 48
const BAND_H = 22

const x = (exp: number) => AX0 + ((exp - EXP_LO) / (EXP_HI - EXP_LO)) * (AX1 - AX0)

// DECORATIVE EXCEPTION (per CLAUDE.md): each EM region gets a representative
// hue so the reader sees radio as one band among many. Not theme-driven — the
// palette stays fixed across light/dark so prose can refer to «the radio band».
const REGIONS = [
  { lo: 3.48, hi: 11.48, key: 'radio', color: 'hsl(210 60% 52%)' },
  { lo: 11.48, hi: 14.63, key: 'infrared', color: 'hsl(12 70% 52%)' },
  { lo: 14.63, hi: 14.88, key: 'visible', color: 'hsl(140 55% 45%)' },
  { lo: 14.88, hi: 16.78, key: 'ultraviolet', color: 'hsl(275 50% 56%)' },
  { lo: 16.78, hi: 19.48, key: 'xray', color: 'hsl(195 60% 46%)' },
  { lo: 19.48, hi: 21, key: 'gamma', color: 'hsl(320 55% 52%)' },
] as const

// Decade ticks (powers of ten, in Hz).
const TICKS: { exp: number; label: string }[] = [
  { exp: 3, label: '10³' },
  { exp: 6, label: '10⁶' },
  { exp: 9, label: '10⁹' },
  { exp: 12, label: '10¹²' },
  { exp: 15, label: '10¹⁵' },
  { exp: 18, label: '10¹⁸' },
  { exp: 21, label: '10²¹' },
]

export default function EmSpectrumLadder() {
  const { t } = useTranslation('ui')

  return (
    <DiagramFigure caption={t('ch2_1.spectrum.caption')}>
      <SVGDiagram
        width={W}
        height={H}
        style={{ maxWidth: W, margin: '0 auto' }}
        fontFamily="inherit"
        aria-label={t('ch2_1.spectrum.ariaLabel')}
      >
        {/* ── Region bands (background tint) ───────────────────────── */}
        {REGIONS.map(r => (
          <rect key={r.key} x={x(r.lo)} y={BAND_Y} width={x(r.hi) - x(r.lo)} height={BAND_H} fill={r.color} opacity={0.32} />
        ))}

        {/* ── Region labels (staggered two rows so neighbours don't collide) ── */}
        {REGIONS.map((r, i) => {
          const cx = (x(r.lo) + x(r.hi)) / 2
          const ly = i % 2 === 0 ? 36 : 22
          return (
            <text key={r.key} x={cx} y={ly} textAnchor="middle"
              fontSize="0.75em" fontWeight={r.key === 'radio' ? 700 : 400}
              fill={r.key === 'radio' ? svgTokens.fg : svgTokens.mutedFg}>
              {t(`ch2_1.spectrum.${r.key}`)}
            </text>
          )
        })}

        {/* ── Axis + decade ticks ──────────────────────────────────── */}
        <line x1={AX0} y1={AXIS_Y} x2={AX1} y2={AXIS_Y} stroke={svgTokens.border} strokeWidth={1.4} />
        {TICKS.map(tk => (
          <g key={tk.exp}>
            <line x1={x(tk.exp)} y1={AXIS_Y - 5} x2={x(tk.exp)} y2={AXIS_Y + 5} stroke={svgTokens.mutedFg} strokeWidth={1.1} />
            <text x={x(tk.exp)} y={AXIS_Y + 20} textAnchor="middle" fontSize="0.75em" fill={svgTokens.mutedFg}>{tk.label}</text>
          </g>
        ))}
        <text x={AX1} y={AXIS_Y - 10} textAnchor="end" fontSize="0.75em" fill={svgTokens.mutedFg}>{t('units.hz')}</text>

        {/* ── Amateur-radio bracket (HF–UHF core ≈ 3 MHz–3 GHz) ────── */}
        <line x1={x(6.48)} y1={AXIS_Y + 30} x2={x(9.48)} y2={AXIS_Y + 30} stroke={svgTokens.primary} strokeWidth={1.6} />
        <line x1={x(6.48)} y1={AXIS_Y + 26} x2={x(6.48)} y2={AXIS_Y + 30} stroke={svgTokens.primary} strokeWidth={1.6} />
        <line x1={x(9.48)} y1={AXIS_Y + 26} x2={x(9.48)} y2={AXIS_Y + 30} stroke={svgTokens.primary} strokeWidth={1.6} />
        <text x={(x(6.48) + x(9.48)) / 2} y={AXIS_Y + 44} textAnchor="middle" fontSize="0.75em" fontWeight={600} fill={svgTokens.primary}>
          {t('ch2_1.spectrum.hamBands')}
        </text>
      </SVGDiagram>
    </DiagramFigure>
  )
}
