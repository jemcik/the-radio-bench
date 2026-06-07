/**
 * Chapter 1.11 §oscillator — how an amplifier becomes an oscillator.
 *
 *   ┌──────────▷ Amplifier ──────┬──▶ [ output: builds from noise to a
 *   │ (+)                        │      steady sine at the resonant freq ]
 *   │                           │
 *   └── LC tank (in-phase fb) ◀──┘
 *
 * A signal-flow BLOCK diagram (not a circuit schematic — same genre as
 * PowerFlowBlocks): a triangular gain block, a labelled LC-tank feedback
 * box, and the loop that ties output back to input. The forward-path
 * amplifier is the transistor stage taught earlier in the chapter; the
 * only new ingredient is the feedback path.
 *
 * The output panel ANIMATES the start-up: amplifier noise (jitter) grows,
 * the tank filters it, and it settles into a steady sine — the visual
 * statement of «loop gain ≥ 1, in phase → self-sustaining». Respects
 * prefers-reduced-motion (static steady-sine snapshot).
 *
 * Bare <svg>, fixed px = viewBox, numeric fontSize, per diagram-quality.
 */
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 560
const VB_H = 205

const SANS = 'ui-sans-serif, system-ui, sans-serif'

const FLOW_Y = 62 // forward-path centre line
const FB_Y = 152 // feedback-path centre line

// Forward path nodes (single source of truth for each x/y).
const SUM = { x: 66, y: FLOW_Y, r: 13 } // summing junction (⊕)
const TRI = { x0: 150, tip: 244, top: 30, bot: 94 } // amplifier gain block
const TAP = { x: 332, y: FLOW_Y } // output tap (feedback branches here)
const OUT = { x: 352, y: 28, w: 182, h: 68 } // output waveform panel

// Feedback LC-tank box. Wider than its label so the feedback wires meet the
// box edges OUTSIDE the centred text's bbox (else the overlap gate flags the
// wire crossing the «selects the frequency» line — PowerFlowBlocks pattern).
const TANK = { x: 126, y: 130, w: 188, h: 44 }

// Output waveform plot region (inside OUT panel).
const PLOT_X0 = OUT.x + 12
const PLOT_W = OUT.w - 24
const MID_Y = OUT.y + OUT.h / 2
const AMP = 24
const CYCLES = 3
const N = 96
const CYCLE_MS = 4200

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)

/** Build the output sine path for a given build-up envelope + phase. */
function wavePath(env: number, phase: number): string {
  const k = (2 * Math.PI * CYCLES) / PLOT_W
  const noiseAmp = (1 - env) * 0.4
  let d = ''
  for (let i = 0; i <= N; i++) {
    const x = PLOT_X0 + (PLOT_W * i) / N
    const xr = x - PLOT_X0
    const base = Math.sin(k * xr + phase)
    const noise = noiseAmp * Math.sin(7.3 * k * xr + phase * 2.3)
    const y = MID_Y - AMP * (env * base + noise)
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

export default function OscillatorFeedbackDiagram() {
  const { t } = useTranslation('ui')
  const clipId = useId()

  // progress: 0 → 1 sawtooth driving the start-up build-up. Init at 1 so the
  // static snapshot (reduced-motion, tests, SSR) is the steady-state sine.
  const [progress, setProgress] = useState(1)
  const [phase, setPhase] = useState(0)
  const t0 = useRef<number | null>(null)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // keep the steady-state snapshot
    let raf = 0
    const loop = (ts: number) => {
      if (t0.current === null) t0.current = ts
      const elapsed = ts - t0.current
      setProgress(((elapsed % CYCLE_MS) / CYCLE_MS))
      setPhase((elapsed / 1000) * 1.6)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // envelope: grow fast, then hold steady for the last quarter of the cycle.
  const env = easeOutCubic(Math.min(1, progress / 0.75))
  const d = wavePath(env, phase)

  const triPath = `M ${TRI.x0} ${TRI.top} L ${TRI.x0} ${TRI.bot} L ${TRI.tip} ${FLOW_Y} Z`

  return (
    <DiagramFigure caption={t('ch1_11.oscBlock.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_11.oscBlock.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={OUT.x + 2} y={OUT.y + 2} width={OUT.w - 4} height={OUT.h - 4} />
          </clipPath>
        </defs>

        {/* ── Summing junction (⊕) ─────────────────────────────────── */}
        <circle cx={SUM.x} cy={SUM.y} r={SUM.r} fill="hsl(var(--muted))"
          stroke={svgTokens.fg} strokeWidth={1.6} />
        <line x1={SUM.x - 6} y1={SUM.y} x2={SUM.x + 6} y2={SUM.y} stroke={svgTokens.fg} strokeWidth={1.4} />
        <line x1={SUM.x} y1={SUM.y - 6} x2={SUM.x} y2={SUM.y + 6} stroke={svgTokens.fg} strokeWidth={1.4} />

        {/* summing junction → amplifier */}
        <line x1={SUM.x + SUM.r} y1={FLOW_Y} x2={TRI.x0 - 2} y2={FLOW_Y} stroke={svgTokens.fg} strokeWidth={1.6} />
        <path d={`M ${TRI.x0 - 2} ${FLOW_Y} l -8 -4 v 8 z`} fill={svgTokens.fg} />

        {/* ── Amplifier gain block (triangle) ──────────────────────── */}
        <path d={triPath} fill="hsl(var(--muted))" stroke={svgTokens.fg} strokeWidth={1.6} strokeLinejoin="round" />
        <text x={(TRI.x0 + TRI.tip) / 2} y={20} fontSize="14" fontWeight={600}
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch1_11.oscBlock.amplifier')}
        </text>

        {/* amplifier → output tap → output panel */}
        <line x1={TRI.tip} y1={FLOW_Y} x2={OUT.x - 2} y2={FLOW_Y} stroke={svgTokens.fg} strokeWidth={1.6} />
        <path d={`M ${OUT.x - 2} ${FLOW_Y} l -8 -4 v 8 z`} fill={svgTokens.fg} />
        {/* feedback tap — a real T-junction (forward + branch down) */}
        <circle cx={TAP.x} cy={TAP.y} r={3} fill={svgTokens.fg} />

        {/* ── Output waveform panel ────────────────────────────────── */}
        <rect x={OUT.x} y={OUT.y} width={OUT.w} height={OUT.h} rx={6}
          fill="hsl(var(--background))" stroke={svgTokens.border} strokeWidth={1.4} />
        <line x1={PLOT_X0} y1={MID_Y} x2={PLOT_X0 + PLOT_W} y2={MID_Y}
          stroke={svgTokens.border} strokeWidth={1} opacity={0.5} />
        <g clipPath={`url(#${clipId})`}>
          <path d={d} fill="none" stroke={svgTokens.primary} strokeWidth={2.2}
            strokeLinejoin="round" strokeLinecap="round" />
        </g>
        <text x={OUT.x + OUT.w / 2} y={OUT.y + OUT.h + 18} fontSize="13" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch1_11.oscBlock.output')}
        </text>

        {/* ── Feedback path: output tap → down → LC tank → up to ⊕ ──── */}
        <line x1={TAP.x} y1={FLOW_Y} x2={TAP.x} y2={FB_Y} stroke={svgTokens.primary} strokeWidth={1.8} />
        <line x1={TAP.x} y1={FB_Y} x2={TANK.x + TANK.w} y2={FB_Y} stroke={svgTokens.primary} strokeWidth={1.8} />
        <path d={`M ${TANK.x + TANK.w} ${FB_Y} l 8 -4 v 8 z`} fill={svgTokens.primary} />

        {/* LC-tank feedback box */}
        <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx={6}
          fill="hsl(var(--muted))" stroke={svgTokens.primary} strokeWidth={1.6} />
        <text x={TANK.x + TANK.w / 2} y={TANK.y + 17} fontSize="13.5" fontWeight={600}
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch1_11.oscBlock.tank')}
        </text>
        <text x={TANK.x + TANK.w / 2} y={TANK.y + 32} fontSize="13" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch1_11.oscBlock.tankSub')}
        </text>

        {/* LC tank → summing junction (left then up) */}
        <line x1={TANK.x} y1={FB_Y} x2={SUM.x} y2={FB_Y} stroke={svgTokens.primary} strokeWidth={1.8} />
        <line x1={SUM.x} y1={FB_Y} x2={SUM.x} y2={SUM.y + SUM.r + 2} stroke={svgTokens.primary} strokeWidth={1.8} />
        <path d={`M ${SUM.x} ${SUM.y + SUM.r + 2} l -4 8 h 8 z`} fill={svgTokens.primary} />

        {/* feedback-path caption */}
        <text x={TANK.x + TANK.w / 2} y={VB_H - 8} fontSize="13" textAnchor="middle"
          fill={svgTokens.primary} fontFamily={SANS}>
          {t('ch1_11.oscBlock.feedback')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
