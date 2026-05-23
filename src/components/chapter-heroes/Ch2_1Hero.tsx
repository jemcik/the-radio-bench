/**
 * Chapter 2.1 hero — a wire that radiates.
 *
 * Left:  a vertical dipole antenna fed at its centre. This is the «source»
 *        — an oscillating current in a wire (the bridge from Part 1's AC).
 * Right: concentric wavefront arcs expanding away from the antenna, with a
 *        sine wave riding along the central axis and one wavelength marked
 *        «λ». The reader sees the chapter's whole thesis at a glance: a
 *        wiggling current in a wire launches a wave that travels outward.
 *
 * Static illustration — the animated E⊥B propagation lives in the §3
 * centrepiece diagram; the hero is a calm conceptual anchor.
 *
 * hardcoded-fontsize-file-ok: hero illustration with hand-tuned label
 * sizes in user-space units. No sibling diagrams in this file.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 540
const VB_H = 220

// Antenna feed point (centre of the dipole) — origin of the wavefronts.
const SRC_X = 70
const AXIS_Y = 110

/** One wavelength of a sine along the axis, sampled to a smooth polyline. */
function sinePath(x0: number, x1: number, midY: number, amp: number, cycles: number): string {
  const N = 120
  const k = (cycles * 2 * Math.PI) / (x1 - x0)
  let d = ''
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N
    const y = midY - amp * Math.sin(k * (x - x0))
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

export default function Ch2_1Hero() {
  const { t } = useTranslation('ui')

  const WAVE_X0 = 120
  const WAVE_X1 = 500
  const CYCLES = 3
  const wavelengthPx = (WAVE_X1 - WAVE_X0) / CYCLES

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      fill="none"
      aria-label={t('ch2_1.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Expanding wavefront arcs (radiation) ─────────────────── */}
      {[55, 105, 155, 205].map((r, i) => (
        <path
          key={r}
          d={`M ${SRC_X + r * 0.5} ${AXIS_Y - r * 0.87} A ${r} ${r} 0 0 1 ${SRC_X + r * 0.5} ${AXIS_Y + r * 0.87}`}
          stroke="currentColor"
          strokeWidth="1.5"
          opacity={0.18 + 0.06 * (3 - i)}
          strokeLinecap="round"
        />
      ))}

      {/* ── Dipole antenna (the radiating wire) ──────────────────── */}
      {/* Upper element */}
      <line x1={SRC_X} y1={AXIS_Y - 6} x2={SRC_X} y2={AXIS_Y - 56}
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Lower element */}
      <line x1={SRC_X} y1={AXIS_Y + 6} x2={SRC_X} y2={AXIS_Y + 56}
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Feed gap dots */}
      <circle cx={SRC_X} cy={AXIS_Y - 6} r="2.5" fill="currentColor" />
      <circle cx={SRC_X} cy={AXIS_Y + 6} r="2.5" fill="currentColor" />

      {/* ── Travelling sine wave along the axis ──────────────────── */}
      <path
        d={sinePath(WAVE_X0, WAVE_X1, AXIS_Y, 28, CYCLES)}
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Wavelength bracket (λ) over the first full cycle ─────── */}
      <line
        x1={WAVE_X0} y1={AXIS_Y - 44} x2={WAVE_X0 + wavelengthPx} y2={AXIS_Y - 44}
        stroke="currentColor" strokeWidth="1.2" opacity={0.6}
      />
      <line x1={WAVE_X0} y1={AXIS_Y - 48} x2={WAVE_X0} y2={AXIS_Y - 40}
        stroke="currentColor" strokeWidth="1.2" opacity={0.6} />
      <line x1={WAVE_X0 + wavelengthPx} y1={AXIS_Y - 48} x2={WAVE_X0 + wavelengthPx} y2={AXIS_Y - 40}
        stroke="currentColor" strokeWidth="1.2" opacity={0.6} />
      <text
        x={WAVE_X0 + wavelengthPx / 2}
        y={AXIS_Y - 52}
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontSize="18"
        textAnchor="middle"
        fill="currentColor"
        opacity={0.8}
      >
        λ
      </text>
    </svg>
  )
}
