/**
 * Chapter 2.3 hero — where the watts go.
 *
 * Left:  a thick DC-power arrow flowing into the transmitter (the big input).
 * Middle: the transmitter block with a finned heatsink and a wide fan of heat
 *         waves rising off it — the dominant stream, drawn broad because most
 *         of the DC power leaves as heat. Inside sits the universal amplifier
 *         symbol (a right-pointing triangle), the final stage doing the work.
 * Right: a single thin primary beam reaches the antenna and radiates — the
 *        small slice of power that actually becomes signal.
 *
 * The proportions carry the chapter's whole thesis at a glance: a lot goes in,
 * a little comes out as RF, and the rest is heat.
 *
 * Static illustration — the interactive efficiency / class / PEP widgets do
 * the moving parts; the hero is a calm conceptual anchor.
 *
 * Geometry note: the main flow axis (AXIS_Y) is the vertical centre of the
 * transmitter box, so the DC arrow, the amplifier triangle and the RF beam
 * all line up. The DC arrow tip lands exactly on the box's left edge (no
 * overlap → no clipped sliver); the RF line uses a butt cap and stops at the
 * arrowhead base (no rounded-cap overhang past the triangle).
 *
 * hardcoded-fontsize-file-ok: hero illustration with hand-tuned label sizes
 * in user-space units. No sibling diagrams in this file.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 560
const VB_H = 220

// ── Transmitter / final-amplifier block (axis = its vertical centre) ──
const BOX_X = 198
const BOX_W = 130
const BOX_H = 66
const BOX_Y = 83
const AXIS_Y = BOX_Y + BOX_H / 2 // 116 — main flow line through the box centre
const BOX_R = BOX_X + BOX_W // 328, right edge

const CX = BOX_X + BOX_W / 2 // 263, box centre x

const ANT_X = 488

/** A gentle vertical squiggle rising from (x, y0) up to y1 — a heat wave. */
function heatWave(x: number, y0: number, y1: number, sway: number): string {
  const N = 18
  let d = ''
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const y = y0 - (y0 - y1) * t
    const dx = sway * Math.sin(t * Math.PI * 3)
    d += `${i === 0 ? 'M' : 'L'} ${(x + dx).toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

export default function Ch2_3Hero() {
  const { t } = useTranslation('ui')

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      fill="none"
      aria-label={t('ch2_3.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── DC power in — a thick tapered arrow, tip on the box edge ──── */}
      <path
        d={`M 24 ${AXIS_Y - 22} L 168 ${AXIS_Y - 22} L 168 ${AXIS_Y - 34}
            L ${BOX_X} ${AXIS_Y} L 168 ${AXIS_Y + 34}
            L 168 ${AXIS_Y + 22} L 24 ${AXIS_Y + 22} Z`}
        fill="currentColor"
        opacity={0.45}
      />
      <text x={96} y={AXIS_Y + 56} fontSize="13" textAnchor="middle"
        fill="currentColor" opacity={0.75}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        {t('ch2_3.hero.dcIn')}
      </text>

      {/* ── Heatsink fins on top of the amplifier block ──────────────── */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const fx = BOX_X + 15 + i * ((BOX_W - 30) / 5)
        return (
          <line key={`fin-${i}`} x1={fx} y1={BOX_Y} x2={fx} y2={BOX_Y - 14}
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity={0.7} />
        )
      })}

      {/* ── Heat — a wide fan of waves rising off the heatsink (dominant) */}
      {[-1, -0.5, 0, 0.5, 1].map((f, i) => (
        <path
          key={`heat-${i}`}
          d={heatWave(CX + f * 46, BOX_Y - 16, 30 - Math.abs(f) * 8, 3)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.32}
        />
      ))}
      <text x={CX} y={26} fontSize="13" textAnchor="middle"
        fill="currentColor" opacity={0.6}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        {t('ch2_3.hero.heat')}
      </text>

      {/* ── Amplifier block body ─────────────────────────────────────── */}
      <rect x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H} rx={7}
        stroke="currentColor" strokeWidth="2" fill="hsl(var(--muted))" opacity={0.95} />

      {/* ── Amplifier symbol inside: a right-pointing triangle + leads ── */}
      <line x1={BOX_X + 18} y1={AXIS_Y} x2={CX - 20} y2={AXIS_Y}
        stroke="currentColor" strokeWidth="1.6" opacity={0.75} />
      <path d={`M ${CX - 20} ${AXIS_Y - 18} L ${CX - 20} ${AXIS_Y + 18} L ${CX + 22} ${AXIS_Y} Z`}
        fill="currentColor" fillOpacity={0.08} stroke="currentColor" strokeWidth="1.8"
        strokeLinejoin="round" opacity={0.85} />
      <line x1={CX + 22} y1={AXIS_Y} x2={BOX_R - 16} y2={AXIS_Y}
        stroke="currentColor" strokeWidth="1.6" opacity={0.75} />

      {/* ── RF out — a single thin primary beam (the small slice) ─────── */}
      <line x1={BOX_R} y1={AXIS_Y} x2={458} y2={AXIS_Y}
        stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="butt" />
      <path d={`M 472 ${AXIS_Y} L 458 ${AXIS_Y - 5} L 458 ${AXIS_Y + 5} Z`}
        fill="hsl(var(--primary))" />
      <text x={392} y={AXIS_Y + 26} fontSize="13" textAnchor="middle"
        fill="hsl(var(--primary))"
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        {t('ch2_3.hero.rfOut')}
      </text>

      {/* ── Radiation arcs + antenna on the right ────────────────────── */}
      {[26, 46, 66].map((r, i) => (
        <path
          key={`arc-${r}`}
          d={`M ${ANT_X + r * 0.4} ${AXIS_Y - r * 0.8} A ${r} ${r} 0 0 1 ${ANT_X + r * 0.4} ${AXIS_Y + r * 0.8}`}
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          opacity={0.28 + 0.08 * (2 - i)}
          strokeLinecap="round"
        />
      ))}
      <line x1={ANT_X} y1={AXIS_Y - 6} x2={ANT_X} y2={AXIS_Y - 46}
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1={ANT_X} y1={AXIS_Y + 6} x2={ANT_X} y2={AXIS_Y + 46}
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx={ANT_X} cy={AXIS_Y - 6} r="2.5" fill="currentColor" />
      <circle cx={ANT_X} cy={AXIS_Y + 6} r="2.5" fill="currentColor" />
    </svg>
  )
}
