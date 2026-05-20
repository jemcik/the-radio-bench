/**
 * Chapter 2.1 — the electromagnetic wave (centrepiece).
 *
 * The classic textbook depiction (cf. ARRL Handbook 2023 §3.10, Fig 3.57):
 * a propagation axis running left→right, the ELECTRIC field oscillating in
 * the vertical plane and the MAGNETIC field oscillating in the perpendicular
 * (into-the-page) plane, drawn in light perspective. The two fields are in
 * phase — they peak together — and the whole pattern marches to the right at
 * the speed of light. A dot rides one electric-field crest so the eye can
 * follow the propagation.
 *
 * Animated (process in time → animate, per diagram-quality §8). Respects
 * prefers-reduced-motion: the initial phase is a readable snapshot and the
 * rAF loop is skipped entirely when the user asks for reduced motion.
 *
 * hardcoded-fontsize-file-ok: none — all <text> uses em tokens from svgTokens.
 */
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 600
const VB_H = 320

const X0 = 96 // axis start (room for the «E»/«B» plane on the left)
const X1 = 548 // axis end
const MY = 138 // propagation axis y

const AE = 60 // electric-field amplitude (vertical)
const AB = 56 // magnetic-field amplitude (perspective depth)
// Perspective projection for the «into the page» magnetic plane: +B draws
// up-and-to-the-right, −B down-and-to-the-left, on a ~45° diagonal so it
// reads clearly as a plane perpendicular to the vertical electric field.
const PX = 0.46
const PY = 0.46

const WL_PX = 224 // one wavelength on screen → ~2 wavelengths across the axis
const K = (2 * Math.PI) / WL_PX
const PERIOD_MS = 4600

// Magnetic-field colour: blue callout token, distinct from the brand-primary
// electric field. Inline (not in svgTokens) because it's a one-off teaching
// colour, documented here.
const B_COLOR = 'hsl(var(--callout-note))'

function wavePath(amp: number, phase: number, perspective: boolean): string {
  const N = 150
  let d = ''
  for (let i = 0; i <= N; i++) {
    const x = X0 + ((X1 - X0) * i) / N
    const s = amp * Math.sin(K * (x - X0) - phase)
    const px = perspective ? x + s * PX : x
    const py = perspective ? MY - s * PY : MY - s
    d += `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)} `
  }
  return d.trim()
}

/** Field «lines of force» — short stems from the axis to the curve. */
function stems(amp: number, phase: number, perspective: boolean) {
  const out: { x1: number; y1: number; x2: number; y2: number }[] = []
  const STEP = (X1 - X0) / 18
  for (let x = X0 + STEP / 2; x < X1; x += STEP) {
    const s = amp * Math.sin(K * (x - X0) - phase)
    const x2 = perspective ? x + s * PX : x
    const y2 = perspective ? MY - s * PY : MY - s
    out.push({ x1: x, y1: MY, x2, y2 })
  }
  return out
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

  const eStems = stems(AE, phase, false)
  const bStems = stems(AB, phase, true)

  // Rider dot on the nearest electric-field crest (phase velocity = wave speed).
  const crestX = X0 + (Math.PI / 2 + phase) / K
  const crestY = MY - AE

  const bracketY = MY - AE - 20

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
        {/* ── Propagation axis with arrowhead ──────────────────────── */}
        <line x1={X0} y1={MY} x2={X1} y2={MY} stroke={svgTokens.border} strokeWidth={1.2} strokeDasharray="2 3" />

        {/* ── Magnetic field (perspective, blue) ───────────────────── */}
        {bStems.map((s, i) => (
          <line key={`b${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke={B_COLOR} strokeWidth={1} opacity={0.4} />
        ))}
        <path d={wavePath(AB, phase, true)} fill="none" stroke={B_COLOR} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />

        {/* ── Electric field (vertical, primary) ───────────────────── */}
        {eStems.map((s, i) => (
          <line key={`e${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke={svgTokens.primary} strokeWidth={1} opacity={0.45} />
        ))}
        <path d={wavePath(AE, phase, false)} fill="none" stroke={svgTokens.primary} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />

        {/* ── Rider dot on an E crest ──────────────────────────────── */}
        <circle cx={crestX} cy={crestY} r={4.5} fill={svgTokens.primary} />

        {/* ── Wavelength bracket over one cycle ────────────────────── */}
        <line x1={X0} y1={bracketY} x2={X0 + WL_PX} y2={bracketY} stroke={svgTokens.mutedFg} strokeWidth={1} opacity={0.7} />
        <line x1={X0} y1={bracketY - 4} x2={X0} y2={bracketY + 4} stroke={svgTokens.mutedFg} strokeWidth={1} opacity={0.7} />
        <line x1={X0 + WL_PX} y1={bracketY - 4} x2={X0 + WL_PX} y2={bracketY + 4} stroke={svgTokens.mutedFg} strokeWidth={1} opacity={0.7} />
        <text x={X0 + WL_PX / 2} y={bracketY - 6} fontFamily="Georgia, serif" fontStyle="italic"
          fontSize={svgTokens.font.axisLabel} textAnchor="middle" fill={svgTokens.fg}>λ</text>

        {/* E and B are identified by the legend below — no inline curve
            letters (they would sit on the moving curve and overlap it). */}

        {/* ── Propagation arrow (clear zone below the wave) ────────── */}
        <text x={(X0 + X1) / 2} y={MY + AE + 30} fontSize={svgTokens.font.tickLabel} textAnchor="middle" fill={svgTokens.mutedFg}>
          {t('ch2_1.emWave.propagation')}
        </text>
        <line x1={(X0 + X1) / 2 - 80} y1={MY + AE + 44} x2={(X0 + X1) / 2 + 80} y2={MY + AE + 44} stroke={svgTokens.mutedFg} strokeWidth={1.4} />
        <path d={`M ${(X0 + X1) / 2 + 80} ${MY + AE + 44} L ${(X0 + X1) / 2 + 70} ${MY + AE + 39} L ${(X0 + X1) / 2 + 70} ${MY + AE + 49} Z`} fill={svgTokens.mutedFg} />

        {/* ── Legend ───────────────────────────────────────────────── */}
        <g transform={`translate(${X0}, ${VB_H - 16})`}>
          <line x1={0} y1={0} x2={22} y2={0} stroke={svgTokens.primary} strokeWidth={2.6} strokeLinecap="round" />
          <text x={28} y={4} fontSize={svgTokens.font.tickLabel} fill={svgTokens.fg}>{t('ch2_1.emWave.legendElectric')}</text>
          <line x1={210} y1={0} x2={232} y2={0} stroke={B_COLOR} strokeWidth={2.6} strokeLinecap="round" />
          <text x={238} y={4} fontSize={svgTokens.font.tickLabel} fill={svgTokens.fg}>{t('ch2_1.emWave.legendMagnetic')}</text>
        </g>
      </svg>
    </figure>
  )
}
