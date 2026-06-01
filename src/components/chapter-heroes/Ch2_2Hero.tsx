/**
 * Chapter 2.2 hero — a voice riding a carrier.
 *
 * Left:  a slow «message» sine (the audio from a microphone).
 * Middle: a fast carrier whose amplitude swells and shrinks to trace that
 *         message — an amplitude-modulated wave. The dashed outline is the
 *         envelope (a copy of the audio); the solid primary trace is the RF.
 * Right: a vertical antenna launching the modulated wave as wavefront arcs.
 *
 * The reader sees the chapter's whole thesis at a glance: a slow voice is
 * loaded onto a fast carrier and flung off an antenna.
 *
 * Static illustration — the interactive modulation explorers live in the
 * §4/§6 widgets; the hero is a calm conceptual anchor.
 *
 * hardcoded-fontsize-file-ok: hero illustration with hand-tuned label
 * sizes in user-space units. No sibling diagrams in this file.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 540
const VB_H = 220

const AXIS_Y = 110

/** Sample a sine into a smooth polyline path. */
function sinePath(
  x0: number,
  x1: number,
  midY: number,
  amp: (x: number) => number,
  cycles: number,
): string {
  const N = 240
  const k = (cycles * 2 * Math.PI) / (x1 - x0)
  let d = ''
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N
    const y = midY - amp(x) * Math.sin(k * (x - x0))
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

export default function Ch2_2Hero() {
  const { t } = useTranslation('ui')

  // ── Message (slow audio) on the far left ───────────────────────────
  const MSG_X0 = 24
  const MSG_X1 = 110
  const MSG_AMP = 22

  // ── Modulated carrier across the middle ────────────────────────────
  const CAR_X0 = 150
  const CAR_X1 = 430
  const CAR_BASE = 14 // unmodulated half-height
  const CAR_DEPTH = 24 // how far the envelope swells
  const ENV_CYCLES = 2 // slow envelope cycles across the carrier span
  const CAR_CYCLES = 22 // fast carrier cycles

  // Envelope as a function of x: a slow sine riding on the base height.
  const envAt = (x: number) => {
    const frac = (x - CAR_X0) / (CAR_X1 - CAR_X0)
    return CAR_BASE + CAR_DEPTH * 0.5 * (1 + Math.sin(2 * Math.PI * ENV_CYCLES * frac - Math.PI / 2))
  }

  const modulated = sinePath(CAR_X0, CAR_X1, AXIS_Y, envAt, CAR_CYCLES)
  // Upper / lower envelope outlines (dashed).
  const envUpper = (() => {
    let d = ''
    const N = 200
    for (let i = 0; i <= N; i++) {
      const x = CAR_X0 + ((CAR_X1 - CAR_X0) * i) / N
      d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(AXIS_Y - envAt(x)).toFixed(1)} `
    }
    return d.trim()
  })()
  const envLower = (() => {
    let d = ''
    const N = 200
    for (let i = 0; i <= N; i++) {
      const x = CAR_X0 + ((CAR_X1 - CAR_X0) * i) / N
      d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(AXIS_Y + envAt(x)).toFixed(1)} `
    }
    return d.trim()
  })()

  // ── Antenna + radiation on the right ───────────────────────────────
  const ANT_X = 480

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      fill="none"
      aria-label={t('ch2_2.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Message (slow audio) ────────────────────────────────────── */}
      <path
        d={sinePath(MSG_X0, MSG_X1, AXIS_Y, () => MSG_AMP, 1.5)}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.55}
      />
      {/* Arrow message → carrier */}
      <line x1={MSG_X1 + 8} y1={AXIS_Y} x2={CAR_X0 - 12} y2={AXIS_Y}
        stroke="currentColor" strokeWidth="1.4" opacity={0.5} />
      <path d={`M ${CAR_X0 - 12} ${AXIS_Y} l -7 -4 v 8 z`} fill="currentColor" opacity={0.5} />

      {/* ── Envelope outlines (the audio copy) ──────────────────────── */}
      <path d={envUpper} stroke="currentColor" strokeWidth="1.3" strokeDasharray="4 3" opacity={0.5} />
      <path d={envLower} stroke="currentColor" strokeWidth="1.3" strokeDasharray="4 3" opacity={0.5} />

      {/* ── Modulated carrier (the RF) ──────────────────────────────── */}
      <path
        d={modulated}
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arrow carrier → antenna */}
      <line x1={CAR_X1 + 6} y1={AXIS_Y} x2={ANT_X - 12} y2={AXIS_Y}
        stroke="currentColor" strokeWidth="1.4" opacity={0.5} />
      <path d={`M ${ANT_X - 12} ${AXIS_Y} l -7 -4 v 8 z`} fill="currentColor" opacity={0.5} />

      {/* ── Radiation arcs ──────────────────────────────────────────── */}
      {[40, 70, 100].map((r, i) => (
        <path
          key={r}
          d={`M ${ANT_X + r * 0.45} ${AXIS_Y - r * 0.85} A ${r} ${r} 0 0 1 ${ANT_X + r * 0.45} ${AXIS_Y + r * 0.85}`}
          stroke="currentColor"
          strokeWidth="1.5"
          opacity={0.22 + 0.07 * (2 - i)}
          strokeLinecap="round"
        />
      ))}

      {/* ── Antenna (dipole) ────────────────────────────────────────── */}
      <line x1={ANT_X} y1={AXIS_Y - 6} x2={ANT_X} y2={AXIS_Y - 50}
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1={ANT_X} y1={AXIS_Y + 6} x2={ANT_X} y2={AXIS_Y + 50}
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx={ANT_X} cy={AXIS_Y - 6} r="2.5" fill="currentColor" />
      <circle cx={ANT_X} cy={AXIS_Y + 6} r="2.5" fill="currentColor" />
    </svg>
  )
}
