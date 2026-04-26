/**
 * Chapter 1.4 — Side-by-side schematic showing two resistors wired in
 * series (left) versus in parallel (right). Pairs the visual topology
 * with the formula underneath each half so the reader's eye can ping-
 * pong between arrangement and arithmetic.
 *
 * Drawn as clean hand-traced SVG (not Rough.js) because schematic
 * symbols are a formal notation — the zigzag resistor body and the
 * T-junction dots are expected to be precise, not wobbly. Padding
 * budgeted for the worst-case translated formula label below each
 * half (Ukrainian formulas are longer than English ones).
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 540
const VB_H = 220

// Each half (series on left, parallel on right) occupies half the
// viewBox. The divider line between them is a subtle mid-grey hairline.
const HALF_W = VB_W / 2

// Y-coordinates common to both halves
const TITLE_Y = 26
const WIRE_Y = 92             // main horizontal wire
const PARALLEL_R2_WIRE_Y = 132 // lower branch on the parallel side
const FORMULA_Y = 196

// Resistor body geometry (same as used in OhmsCalculator.CircuitFlow
// for visual consistency across the book).
const RES_W = 40
const RES_H = 12

/** Build a zigzag path (4 triangles) for a resistor body centred at
 *  (cx, cy), width RES_W. Two small lead segments extend from the ends. */
function resistorPath(cx: number, cy: number): string {
  const x0 = cx - RES_W / 2
  const x1 = cx + RES_W / 2
  const segs = 6
  const amp = RES_H / 2
  let d = `M ${x0 - 6} ${cy} L ${x0} ${cy}`
  for (let i = 0; i < segs; i++) {
    const xa = x0 + (i / segs) * RES_W
    const xb = x0 + ((i + 0.5) / segs) * RES_W
    const y = cy + (i % 2 === 0 ? -amp : amp)
    d += ` L ${xb} ${y} L ${xa + RES_W / segs} ${cy}`
  }
  d += ` L ${x1 + 6} ${cy}`
  return d
}

export default function SeriesParallelSchematic() {
  const { t } = useTranslation('ui')

  // ── Series half (left) ──────────────────────────────────────────
  const S_LEFT_X = 40
  const S_RIGHT_X = HALF_W - 40
  const S_R1_CX = S_LEFT_X + (S_RIGHT_X - S_LEFT_X) / 3
  const S_R2_CX = S_LEFT_X + 2 * (S_RIGHT_X - S_LEFT_X) / 3

  // ── Parallel half (right) ───────────────────────────────────────
  const P_LEFT_X = HALF_W + 40
  const P_RIGHT_X = VB_W - 40
  const P_R1_CX = (P_LEFT_X + P_RIGHT_X) / 2
  const P_R2_CX = P_R1_CX
  const P_NODE_L_X = P_LEFT_X + 22
  const P_NODE_R_X = P_RIGHT_X - 22

  return (
    <figure className="my-6 not-prose">
      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_4.seriesParallelAria')}
        style={{ display: 'block', maxWidth: 640, margin: '0 auto' }}
      >
        {/* ── Divider hairline ───────────────────────────────────── */}
        <line
          x1={HALF_W} y1={12} x2={HALF_W} y2={VB_H - 30}
          stroke={svgTokens.border}
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />

        {/* ── SERIES TITLE ───────────────────────────────────────── */}
        <text
          x={HALF_W / 2} y={TITLE_Y}
          fontFamily="inherit" fontSize="0.875em"
          fontStyle="italic" fontWeight="700"
          fill={svgTokens.fg}
          textAnchor="middle"
        >
          {t('ch1_4.seriesTitle')}
        </text>

        {/* ── SERIES: terminal dots + wires + zigzag resistors ─── */}
        <circle cx={S_LEFT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />
        <circle cx={S_RIGHT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />

        <line
          x1={S_LEFT_X} y1={WIRE_Y} x2={S_R1_CX - RES_W / 2 - 6} y2={WIRE_Y}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        />
        <path
          d={resistorPath(S_R1_CX, WIRE_Y)}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
          strokeLinejoin="round" fill="none"
        />
        <line
          x1={S_R1_CX + RES_W / 2 + 6} y1={WIRE_Y}
          x2={S_R2_CX - RES_W / 2 - 6} y2={WIRE_Y}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        />
        <path
          d={resistorPath(S_R2_CX, WIRE_Y)}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
          strokeLinejoin="round" fill="none"
        />
        <line
          x1={S_R2_CX + RES_W / 2 + 6} y1={WIRE_Y}
          x2={S_RIGHT_X} y2={WIRE_Y}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        />

        {/* Resistor labels */}
        <text
          x={S_R1_CX} y={WIRE_Y - 16}
          fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
          fill={svgTokens.mutedFg} textAnchor="middle"
        >
          R₁
        </text>
        <text
          x={S_R2_CX} y={WIRE_Y - 16}
          fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
          fill={svgTokens.mutedFg} textAnchor="middle"
        >
          R₂
        </text>

        {/* Formula */}
        <text
          x={HALF_W / 2} y={FORMULA_Y}
          fontFamily="inherit" fontSize="0.812em" fontStyle="italic"
          fill={svgTokens.fg} textAnchor="middle"
        >
          R = R₁ + R₂
        </text>

        {/* ── PARALLEL TITLE ─────────────────────────────────────── */}
        <text
          x={HALF_W + HALF_W / 2} y={TITLE_Y}
          fontFamily="inherit" fontSize="0.875em"
          fontStyle="italic" fontWeight="700"
          fill={svgTokens.fg}
          textAnchor="middle"
        >
          {t('ch1_4.parallelTitle')}
        </text>

        {/* ── PARALLEL: two branches between node_L and node_R ─── */}
        {/* Left stub */}
        <line
          x1={P_LEFT_X} y1={WIRE_Y} x2={P_NODE_L_X} y2={WIRE_Y}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        />
        {/* Right stub */}
        <line
          x1={P_NODE_R_X} y1={WIRE_Y} x2={P_RIGHT_X} y2={WIRE_Y}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        />
        {/* Left vertical down to lower branch */}
        <line
          x1={P_NODE_L_X} y1={WIRE_Y} x2={P_NODE_L_X} y2={PARALLEL_R2_WIRE_Y}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        />
        {/* Right vertical down to lower branch */}
        <line
          x1={P_NODE_R_X} y1={WIRE_Y} x2={P_NODE_R_X} y2={PARALLEL_R2_WIRE_Y}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        />
        {/* Upper branch — R1 */}
        <line
          x1={P_NODE_L_X} y1={WIRE_Y} x2={P_R1_CX - RES_W / 2 - 6} y2={WIRE_Y}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        />
        <path
          d={resistorPath(P_R1_CX, WIRE_Y)}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
          strokeLinejoin="round" fill="none"
        />
        <line
          x1={P_R1_CX + RES_W / 2 + 6} y1={WIRE_Y} x2={P_NODE_R_X} y2={WIRE_Y}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        />
        {/* Lower branch — R2 */}
        <line
          x1={P_NODE_L_X} y1={PARALLEL_R2_WIRE_Y} x2={P_R2_CX - RES_W / 2 - 6} y2={PARALLEL_R2_WIRE_Y}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        />
        <path
          d={resistorPath(P_R2_CX, PARALLEL_R2_WIRE_Y)}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
          strokeLinejoin="round" fill="none"
        />
        <line
          x1={P_R2_CX + RES_W / 2 + 6} y1={PARALLEL_R2_WIRE_Y} x2={P_NODE_R_X} y2={PARALLEL_R2_WIRE_Y}
          stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        />

        {/* Terminal dots */}
        <circle cx={P_LEFT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />
        <circle cx={P_RIGHT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />
        {/* Junction dots at the parallel nodes */}
        <circle cx={P_NODE_L_X} cy={WIRE_Y} r={2.5} fill={svgTokens.fg} />
        <circle cx={P_NODE_R_X} cy={WIRE_Y} r={2.5} fill={svgTokens.fg} />

        {/* Labels */}
        <text
          x={P_R1_CX} y={WIRE_Y - 16}
          fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
          fill={svgTokens.mutedFg} textAnchor="middle"
        >
          R₁
        </text>
        <text
          x={P_R2_CX} y={PARALLEL_R2_WIRE_Y + 22}
          fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
          fill={svgTokens.mutedFg} textAnchor="middle"
        >
          R₂
        </text>

        {/* Formula */}
        <text
          x={HALF_W + HALF_W / 2} y={FORMULA_Y}
          fontFamily="inherit" fontSize="0.812em" fontStyle="italic"
          fill={svgTokens.fg} textAnchor="middle"
        >
          R = R₁·R₂ / (R₁ + R₂)
        </text>
      </svg>
    </figure>
  )
}
