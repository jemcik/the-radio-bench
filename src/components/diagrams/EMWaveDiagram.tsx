/**
 * Chapter 2.1 — the electromagnetic wave (centrepiece), drawn as a 3D object.
 *
 * Classic textbook depiction (cf. ARRL Handbook 2023 §3.10, Fig 3.57): the
 * ELECTRIC field oscillates in the vertical plane and the MAGNETIC field in
 * the perpendicular plane that recedes «into the page», both in phase, the
 * whole pattern marching to the right at the speed of light.
 *
 * 3D legibility (so it doesn't read as two flat overlapping sines):
 *   1. A static axis triad at the origin — E (up), B (into the page), and the
 *      propagation/c axis (right) — fixes the projection convention.
 *   2. Two translucent sheets fill each wave to its axis: a vertical sheet for
 *      E, a receding sheet for B. Perpendicular surfaces read as 3D.
 *   3. Perpendicular field-vector arrows at sample points form an «L» (E up,
 *      B receding) showing the two fields are at right angles and in phase.
 *   Occlusion: B is drawn first, E on top, so the vertical E plane reads as
 *   nearer than the receding B plane.
 *
 * Oblique (cabinet-style) projection: a depth-z point shifts up-and-right.
 *   screen = (x + z·ZX, BASE_Y − y − z·ZY)
 *
 * Animated (process in time → animate, per diagram-quality §8). Respects
 * prefers-reduced-motion: initial phase is a readable snapshot; the rAF loop
 * is skipped when reduced motion is requested.
 *
 * hardcoded-fontsize-file-ok: none — all <text> uses em tokens from svgTokens.
 */
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 620
const VB_H = 280

const TX = 74 // triad / origin x
const WX0 = 124 // wave start x (right of the triad)
const X1 = 548 // wave end x
const AXIS_END = 590 // propagation-axis tip — a touch past the wave's deepest B excursion
const BASE_Y = 150 // propagation axis y (z=0, y=0)

const AE = 56 // electric-field amplitude (vertical, +y)
const AB = 56 // magnetic-field amplitude (depth, +z)
const ZX = 0.42 // depth → screen-x (oblique projection)
const ZY = 0.32 // depth → screen-y

const WL_PX = 212
const K = (2 * Math.PI) / WL_PX
const PERIOD_MS = 4600

// Magnetic-field colour: blue callout token, distinct from the brand-primary
// electric field. Inline (one-off teaching colour), documented here.
const B_COLOR = 'hsl(var(--callout-note))'

const sineAt = (x: number, phase: number) => Math.sin(K * (x - WX0) - phase)
// Electric field point (oscillates in y, at z=0).
const eAt = (x: number, phase: number): [number, number] => [x, BASE_Y - AE * sineAt(x, phase)]
// Magnetic field point (oscillates in z = depth, at y=0).
const bAt = (x: number, phase: number): [number, number] => {
  const s = AB * sineAt(x, phase)
  return [x + s * ZX, BASE_Y - s * ZY]
}

function curvePath(at: (x: number, p: number) => [number, number], phase: number): string {
  const N = 140
  let d = ''
  for (let i = 0; i <= N; i++) {
    const x = WX0 + ((X1 - WX0) * i) / N
    const [px, py] = at(x, phase)
    d += `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)} `
  }
  return d.trim()
}

/** Translucent sheet from the curve down to the axis line (z=0,y=0). */
function sheetPath(at: (x: number, p: number) => [number, number], phase: number): string {
  const N = 70
  const top: string[] = []
  const bot: string[] = []
  for (let i = 0; i <= N; i++) {
    const x = WX0 + ((X1 - WX0) * i) / N
    const [px, py] = at(x, phase)
    top.push(`${px.toFixed(1)} ${py.toFixed(1)}`)
    bot.push(`${x.toFixed(1)} ${BASE_Y}`)
  }
  return `M ${top[0]} L ${top.join(' L ')} L ${bot.reverse().join(' L ')} Z`
}

/** Arrow (shaft + head) from (x1,y1) to (x2,y2); skipped if too short. */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, key: string) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len < 7) return null
  const ux = dx / len, uy = dy / len
  const hl = 7, hw = 4
  const bx = x2 - ux * hl, by = y2 - uy * hl
  const px = -uy, py = ux
  return (
    <g key={key}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.6} strokeLinecap="round" opacity={0.75} />
      <polyline points={`${bx + px * hw},${by + py * hw} ${x2},${y2} ${bx - px * hw},${by - py * hw}`}
        fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
    </g>
  )
}

export default function EMWaveDiagram() {
  const { t } = useTranslation('ui')
  const [phase, setPhase] = useState<number>(0.6)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    let rafId = 0
    let start: number | null = null
    const tick = (now: number) => {
      if (start === null) start = now
      const elapsed = (now - start) % PERIOD_MS
      setPhase((elapsed / PERIOD_MS) * 2 * Math.PI)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Field-vector sample points (fixed x; the vectors pulse as the wave passes).
  const NARROWS = 6
  const arrowXs = Array.from({ length: NARROWS }, (_, i) => WX0 + ((X1 - WX0) * (i + 0.5)) / NARROWS)

  // Static triad axis tips.
  const eTip: [number, number] = [TX, BASE_Y - (AE + 6)]
  const bTipLen = AB + 6
  const bTip: [number, number] = [TX + bTipLen * ZX, BASE_Y - bTipLen * ZY]

  const bracketY = BASE_Y - AE - 18

  return (
    <figure className="my-6 not-prose">
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch2_1.emWave.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
      >
        {/* ── Propagation (x) axis ─────────────────────────────────── */}
        <line x1={TX} y1={BASE_Y} x2={AXIS_END} y2={BASE_Y} stroke={svgTokens.border} strokeWidth={1.2} strokeDasharray="2 3" />
        <path d={`M ${AXIS_END} ${BASE_Y} L ${AXIS_END - 9} ${BASE_Y - 4.5} L ${AXIS_END - 9} ${BASE_Y + 4.5} Z`} fill={svgTokens.mutedFg} />
        <text x={AXIS_END + 6} y={BASE_Y + 4} textAnchor="start" fontFamily="Georgia, serif" fontStyle="italic" fontSize={svgTokens.font.tickLabel} fill={svgTokens.mutedFg}>c</text>

        {/* ── Magnetic field (receding plane) — drawn first (behind) ── */}
        <path d={sheetPath(bAt, phase)} fill={B_COLOR} opacity={0.1} />
        {arrowXs.map((x, i) => { const [bx, by] = bAt(x, phase); return arrow(x, BASE_Y, bx, by, B_COLOR, `b${i}`) })}
        <path d={curvePath(bAt, phase)} fill="none" stroke={B_COLOR} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />

        {/* ── Electric field (vertical plane) — drawn on top (front) ── */}
        <path d={sheetPath(eAt, phase)} fill={svgTokens.primary} opacity={0.1} />
        {arrowXs.map((x, i) => { const [ex, ey] = eAt(x, phase); return arrow(x, BASE_Y, ex, ey, svgTokens.primary, `e${i}`) })}
        <path d={curvePath(eAt, phase)} fill="none" stroke={svgTokens.primary} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />

        {/* ── Static axis triad at the origin ──────────────────────── */}
        {arrow(TX, BASE_Y, eTip[0], eTip[1], svgTokens.primary, 'triadE')}
        {arrow(TX, BASE_Y, bTip[0], bTip[1], B_COLOR, 'triadB')}
        <circle cx={TX} cy={BASE_Y} r={2.5} fill={svgTokens.fg} />
        <text x={eTip[0] - 6} y={eTip[1] - 2} textAnchor="end" fontFamily="Georgia, serif" fontStyle="italic" fontSize="1em" fill={svgTokens.primary}>E</text>
        <text x={bTip[0] + 6} y={bTip[1] - 2} textAnchor="start" fontFamily="Georgia, serif" fontStyle="italic" fontSize="1em" fill={B_COLOR}>B</text>

        {/* ── Wavelength bracket over one cycle ────────────────────── */}
        <line x1={WX0} y1={bracketY} x2={WX0 + WL_PX} y2={bracketY} stroke={svgTokens.mutedFg} strokeWidth={1} opacity={0.7} />
        <line x1={WX0} y1={bracketY - 4} x2={WX0} y2={bracketY + 4} stroke={svgTokens.mutedFg} strokeWidth={1} opacity={0.7} />
        <line x1={WX0 + WL_PX} y1={bracketY - 4} x2={WX0 + WL_PX} y2={bracketY + 4} stroke={svgTokens.mutedFg} strokeWidth={1} opacity={0.7} />
        <text x={WX0 + WL_PX / 2} y={bracketY - 6} fontFamily="Georgia, serif" fontStyle="italic" fontSize={svgTokens.font.axisLabel} textAnchor="middle" fill={svgTokens.fg}>λ</text>

        {/* ── Legend ───────────────────────────────────────────────── */}
        <g transform={`translate(${WX0}, ${VB_H - 14})`}>
          <line x1={0} y1={0} x2={22} y2={0} stroke={svgTokens.primary} strokeWidth={2.6} strokeLinecap="round" />
          <text x={28} y={4} fontSize={svgTokens.font.tickLabel} fill={svgTokens.fg}>{t('ch2_1.emWave.legendElectric')}</text>
          <line x1={210} y1={0} x2={232} y2={0} stroke={B_COLOR} strokeWidth={2.6} strokeLinecap="round" />
          <text x={238} y={4} fontSize={svgTokens.font.tickLabel} fill={svgTokens.fg}>{t('ch2_1.emWave.legendMagnetic')}</text>
        </g>
      </svg>
    </figure>
  )
}
