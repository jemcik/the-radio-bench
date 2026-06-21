/**
 * Chapter 3.2 hero — what a transmitter does, at a glance.
 *
 * Left:   a microphone and a Morse key — the message going in (voice or CW).
 * Middle: a row of blocks that grow taller left→right; a carrier wave runs
 *         through them, its amplitude swelling stage by stage — the signal
 *         being generated, modulated and amplified.
 * Right:  a transmitting antenna launching the amplified wave on the air, drawn
 *         as bold radiating arcs in the primary accent.
 *
 * The mirror of the 3.1 receiver hero (many waves in → one voice out); here it
 * is one message in → one strong wave out to the world. Static pen-and-ink
 * illustration (currentColor so it tracks the theme); the interactive block
 * diagram does the moving parts.
 *
 * hardcoded-fontsize-file-ok: hero illustration with hand-tuned label sizes in
 * user-space units. No sibling diagrams in this file.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 560
const VB_H = 216
const MID_Y = 122

// Amplifier chain: four blocks, centre-aligned on MID_Y, growing taller so the
// swelling carrier fits inside each one. Bottom block (PA) is the tallest.
const BLOCK_W = 44
const BLOCKS = [
  { x: 152, h: 32 },
  { x: 214, h: 46 },
  { x: 276, h: 64 },
  { x: 338, h: 88 },
]
const PA = BLOCKS[3]
const ANT_X = PA.x + BLOCK_W / 2 // 360 — whip rises from the PA block top
const TIP = { x: ANT_X, y: 50 }

const SANS = 'ui-sans-serif, system-ui, sans-serif'

/** A sine path whose amplitude ramps linearly from ampStart to ampEnd. */
function growingWave(
  x0: number, x1: number, baseY: number,
  ampStart: number, ampEnd: number, periods: number,
): string {
  const N = 96
  let d = ''
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = x0 + (x1 - x0) * t
    const amp = ampStart + (ampEnd - ampStart) * t
    const y = baseY - amp * Math.sin(t * periods * 2 * Math.PI)
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

/** A circular arc segment between two angles (degrees, screen coords). */
function arcPath(cx: number, cy: number, r: number, a0deg: number, a1deg: number): string {
  const a0 = (a0deg * Math.PI) / 180
  const a1 = (a1deg * Math.PI) / 180
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy + r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy + r * Math.sin(a1)
  const large = Math.abs(a1deg - a0deg) > 180 ? 1 : 0
  const sweep = a1deg > a0deg ? 1 : 0
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} ${sweep} ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

export default function Ch3_2Hero() {
  const { t } = useTranslation('ui')

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      fill="none"
      aria-label={t('ch3_2.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Microphone (voice in) ─────────────────────────────────────── */}
      <rect x={34} y={72} width={24} height={30} rx={11} stroke="currentColor" strokeWidth={2} fill="hsl(var(--muted))" />
      {[80, 87, 94].map(y => (
        <line key={y} x1={39} y1={y} x2={53} y2={y} stroke="currentColor" strokeWidth={1.2} opacity={0.6} />
      ))}
      <line x1={46} y1={102} x2={46} y2={114} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={46} cy={116} rx={10} ry={3} stroke="currentColor" strokeWidth={2} fill="none" />

      {/* ── Morse key (CW in) ─────────────────────────────────────────── */}
      <line x1={28} y1={150} x2={80} y2={150} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <line x1={40} y1={150} x2={40} y2={142} stroke="currentColor" strokeWidth={1.8} />
      <line x1={40} y1={142} x2={70} y2={134} stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={72} cy={134} r={5} stroke="currentColor" strokeWidth={1.8} fill="hsl(var(--muted))" />

      {/* leads from both sources converging into the first block */}
      <line x1={46} y1={114} x2={130} y2={MID_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.7} />
      <line x1={80} y1={150} x2={130} y2={MID_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.7} />
      <circle cx={130} cy={MID_Y} r={2.6} fill="currentColor" />
      <line x1={130} y1={MID_Y} x2={BLOCKS[0].x} y2={MID_Y} stroke="currentColor" strokeWidth={1.8} opacity={0.8} />
      <text x={12} y={202} fontSize="13" textAnchor="start" fill="currentColor" opacity={0.7} fontFamily={SANS}>
        {t('ch3_2.hero.messageIn')}
      </text>

      {/* ── The amplifier chain: blocks growing taller ────────────────── */}
      {BLOCKS.map(({ x, h }, i) => (
        <rect key={i} x={x} y={MID_Y - h / 2} width={BLOCK_W} height={h} rx={6}
          stroke="currentColor" strokeWidth={2} fill="hsl(var(--muted))" opacity={0.97} />
      ))}
      {/* short links between blocks */}
      {BLOCKS.slice(0, -1).map(({ x }, i) => (
        <line key={i} x1={x + BLOCK_W} y1={MID_Y} x2={BLOCKS[i + 1].x} y2={MID_Y} stroke="currentColor" strokeWidth={1.8} opacity={0.8} />
      ))}

      {/* ── The carrier wave swelling through the chain (the signal) ───── */}
      <path d={growingWave(BLOCKS[0].x, PA.x + BLOCK_W, MID_Y, 5, 26, 5)}
        stroke="hsl(var(--primary))" strokeWidth={2.2} strokeLinecap="round" />
      {/* caption: names the blocks as amplifier stages — the signal grows through them */}
      <text x={(BLOCKS[0].x + PA.x + BLOCK_W) / 2} y={192} fontSize="13" textAnchor="middle" fill="currentColor" opacity={0.7} fontFamily={SANS}>
        {t('ch3_2.hero.amplify')}
      </text>

      {/* ── Transmitting antenna + radiating arcs (on the air) ─────────── */}
      <line x1={ANT_X} y1={MID_Y - PA.h / 2} x2={TIP.x} y2={TIP.y} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <circle cx={TIP.x} cy={TIP.y} r={2.6} fill="currentColor" />
      {[[14, 0.95, 2.6], [27, 0.6, 2.2], [40, 0.38, 1.9]].map(([r, op, sw], i) => (
        <path key={i} d={arcPath(TIP.x, TIP.y, r, -78, 10)} stroke="hsl(var(--primary))" strokeWidth={sw} opacity={op} strokeLinecap="round" />
      ))}
      <text x={410} y={46} fontSize="13" textAnchor="start" fill="hsl(var(--primary))" fontFamily={SANS}>
        {t('ch3_2.hero.onAir')}
      </text>
    </svg>
  )
}
