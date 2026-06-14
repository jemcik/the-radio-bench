/**
 * Chapter 3.1 hero — what a receiver does, at a glance.
 *
 * Left:  several incoming waves of different wavelengths (many stations at
 *        once) converging on a receiving antenna — one drawn in the primary
 *        accent, the station we want.
 * Middle: the receiver itself, a box with a tuning dial and a hint of stacked
 *        stages inside.
 * Right: a single clean wave leaving for a loudspeaker — the one voice picked
 *        out, amplified and detected.
 *
 * Static pen-and-ink illustration (currentColor so it tracks the theme); the
 * interactive superhet block diagram does the moving parts.
 *
 * hardcoded-fontsize-file-ok: hero illustration with hand-tuned label sizes in
 * user-space units. No sibling diagrams in this file.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 560
const VB_H = 216
const AXIS_Y = 108

const ANT_X = 150
const BOX = { x: 208, y: 70, w: 152, h: 76 }
const DIAL = { cx: 250, cy: AXIS_Y, r: 22 }
const SPK_X = 498

const SANS = 'ui-sans-serif, system-ui, sans-serif'

/** A sine path from x0 to x1 about baseY, `periods` full cycles, amplitude amp. */
function wave(x0: number, x1: number, baseY: number, amp: number, periods: number): string {
  const N = 64
  let d = ''
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = x0 + (x1 - x0) * t
    const y = baseY - amp * Math.sin(t * periods * 2 * Math.PI)
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

export default function Ch3_1Hero() {
  const { t } = useTranslation('ui')

  const incoming: Array<[number, number, number, string, number]> = [
    // [baseY, amplitude, periods, colour, opacity]
    [72, 8, 6, 'currentColor', 0.4],
    [AXIS_Y, 11, 4, 'hsl(var(--primary))', 0.9],
    [144, 8, 2.5, 'currentColor', 0.4],
  ]

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      fill="none"
      aria-label={t('ch3_1.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Incoming signals: several waves converging on the antenna ── */}
      {incoming.map(([baseY, amp, periods, colour, op], i) => (
        <g key={i}>
          <path d={wave(22, 128, baseY, amp, periods)} stroke={colour} strokeWidth={i === 1 ? 2.2 : 1.6} opacity={op} strokeLinecap="round" />
          <line x1={128} y1={baseY} x2={ANT_X - 4} y2={AXIS_Y} stroke={colour} strokeWidth={1.2} opacity={op * 0.7} />
        </g>
      ))}
      {/* left-aligned near the SVG edge: the UA label «багато сигналів на вході» is
          ~70 % wider than EN and clips the viewBox if centered. start-anchored grows
          inward, so it never clips in either locale. */}
      <text x={10} y={196} fontSize="13" textAnchor="start" fill="currentColor" opacity={0.7} fontFamily={SANS}>
        {t('ch3_1.hero.manyIn')}
      </text>

      {/* ── Receiving antenna (dipole) ───────────────────────────────── */}
      <line x1={ANT_X} y1={AXIS_Y - 6} x2={ANT_X} y2={AXIS_Y - 44} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <line x1={ANT_X} y1={AXIS_Y + 6} x2={ANT_X} y2={AXIS_Y + 44} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <circle cx={ANT_X} cy={AXIS_Y - 6} r={2.5} fill="currentColor" />
      <circle cx={ANT_X} cy={AXIS_Y + 6} r={2.5} fill="currentColor" />
      {/* feed into the receiver */}
      <line x1={ANT_X} y1={AXIS_Y} x2={BOX.x} y2={AXIS_Y} stroke="currentColor" strokeWidth={1.8} opacity={0.8} />

      {/* ── Receiver box ─────────────────────────────────────────────── */}
      <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={8} stroke="currentColor" strokeWidth={2} fill="hsl(var(--muted))" opacity={0.97} />
      {/* tuning dial */}
      <circle cx={DIAL.cx} cy={DIAL.cy} r={DIAL.r} stroke="currentColor" strokeWidth={1.8} fill="none" opacity={0.85} />
      <line x1={DIAL.cx} y1={DIAL.cy} x2={DIAL.cx + DIAL.r * 0.75} y2={DIAL.cy - DIAL.r * 0.55} stroke="hsl(var(--primary))" strokeWidth={2.2} strokeLinecap="round" />
      {[-1, -0.5, 0, 0.5, 1].map(f => (
        <line key={f} x1={DIAL.cx + Math.cos(-1.2 + f) * (DIAL.r + 3)} y1={DIAL.cy + Math.sin(-1.2 + f) * (DIAL.r + 3)}
          x2={DIAL.cx + Math.cos(-1.2 + f) * (DIAL.r + 7)} y2={DIAL.cy + Math.sin(-1.2 + f) * (DIAL.r + 7)}
          stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
      ))}
      {/* a hint of stacked stages inside */}
      {[0, 1, 2].map(i => (
        <line key={i} x1={300 + i * 14} y1={AXIS_Y + 20} x2={300 + i * 14} y2={AXIS_Y - 20 + i * 6}
          stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" opacity={0.55} />
      ))}

      {/* ── One clean wave out to the speaker ────────────────────────── */}
      <path d={wave(BOX.x + BOX.w, 466, AXIS_Y, 10, 3)} stroke="hsl(var(--primary))" strokeWidth={2.4} strokeLinecap="round" />
      <path d={`M 480 ${AXIS_Y} L 466 ${AXIS_Y - 5} L 466 ${AXIS_Y + 5} Z`} fill="hsl(var(--primary))" />

      {/* ── Speaker ──────────────────────────────────────────────────── */}
      <path d={`M ${SPK_X - 4} ${AXIS_Y - 9} h -12 v 18 h 12 z M ${SPK_X - 4} ${AXIS_Y - 9} L ${SPK_X + 12} ${AXIS_Y - 20} v 40 L ${SPK_X - 4} ${AXIS_Y + 9} z`}
        stroke="currentColor" strokeWidth={2} fill="hsl(var(--muted))" strokeLinejoin="round" />
      {[10, 18].map(r => (
        <path key={r} d={`M ${SPK_X + 18} ${AXIS_Y - r * 0.7} A ${r} ${r} 0 0 1 ${SPK_X + 18} ${AXIS_Y + r * 0.7}`}
          stroke="hsl(var(--primary))" strokeWidth={1.4} opacity={0.55} fill="none" />
      ))}
      <text x={430} y={196} fontSize="13" textAnchor="middle" fill="hsl(var(--primary))" fontFamily={SANS}>
        {t('ch3_1.hero.oneOut')}
      </text>
    </svg>
  )
}
