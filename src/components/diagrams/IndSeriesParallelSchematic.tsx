/**
 * Chapter 1.6 — Side-by-side schematic of two inductors wired in series
 * (left) and in parallel (right). Mirrors the structure of
 * `CapSeriesParallelSchematic` deliberately so the reader can compare
 * the two — but the formula labels at the bottom are flipped to match
 * inductor arithmetic (series adds, parallel combines reciprocally —
 * same as resistors, opposite of caps).
 *
 * Inductor symbols are drawn inline as a row of half-circle "bumps"
 * along the wire — the IEC convention used throughout the book.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 540
const VB_H = 220

const HALF_W = VB_W / 2

const TITLE_Y = 26
const WIRE_Y = 92
const PARALLEL_L2_WIRE_Y = 132
const FORMULA_Y = 196

/* Inductor symbol geometry — row of 4 half-circle bumps along a wire,
 * each bump 6 px wide and 5 px tall. Total symbol width: 4×6 = 24 px. */
const BUMP_W = 6
const BUMP_H = 5
const N_BUMPS = 4
const SYMBOL_W = BUMP_W * N_BUMPS

/** Draw a horizontal inductor symbol centred at (cx, cy): four small
 *  half-circle bumps stacked end-to-end along the wire. */
function IndSymbolH({ cx, cy }: { cx: number; cy: number }) {
  const startX = cx - SYMBOL_W / 2
  // Build path: M startX cy, then for each bump: a (rx, ry, 0, 0, 1, +BUMP_W, 0)
  const arcs: string[] = []
  for (let i = 0; i < N_BUMPS; i++) {
    arcs.push(`a ${BUMP_W / 2} ${BUMP_H} 0 0 1 ${BUMP_W} 0`)
  }
  const d = `M ${startX} ${cy} ${arcs.join(' ')}`
  return (
    <path
      d={d}
      fill="none"
      stroke={svgTokens.fg}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

export default function IndSeriesParallelSchematic() {
  const { t } = useTranslation('ui')

  // ── Series half (left) — two inductors in a single row ─────────
  const S_LEFT_X = 40
  const S_RIGHT_X = HALF_W - 40
  const S_L1_CX = S_LEFT_X + (S_RIGHT_X - S_LEFT_X) / 3
  const S_L2_CX = S_LEFT_X + 2 * (S_RIGHT_X - S_LEFT_X) / 3

  // ── Parallel half (right) — two inductors, two branches ────────
  const P_LEFT_X = HALF_W + 40
  const P_RIGHT_X = VB_W - 40
  const P_NODE_L_X = P_LEFT_X + 22
  const P_NODE_R_X = P_RIGHT_X - 22
  const P_L1_CX = (P_NODE_L_X + P_NODE_R_X) / 2
  const P_L2_CX = P_L1_CX

  return (
    <figure className="my-6 not-prose">
      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_6.combinationsSchematicAria')}
        style={{ display: 'block', maxWidth: 640, margin: '0 auto' }}
      >
        {/* Divider hairline */}
        <line
          x1={HALF_W} y1={12} x2={HALF_W} y2={VB_H - 30}
          stroke={svgTokens.border}
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />

        {/* ── SERIES TITLE ──────────────────────────────────────── */}
        <text
          x={HALF_W / 2} y={TITLE_Y}
          fontFamily="inherit" fontSize="0.875em"
          fontStyle="italic" fontWeight="700"
          fill={svgTokens.fg} textAnchor="middle"
        >
          {t('ch1_6.combinationsSeriesTitle')}
        </text>

        {/* Series: terminal dots + wires + two inductors in a row */}
        <circle cx={S_LEFT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />
        <circle cx={S_RIGHT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />
        <line x1={S_LEFT_X} y1={WIRE_Y} x2={S_L1_CX - SYMBOL_W / 2} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <IndSymbolH cx={S_L1_CX} cy={WIRE_Y} />
        <line x1={S_L1_CX + SYMBOL_W / 2} y1={WIRE_Y} x2={S_L2_CX - SYMBOL_W / 2} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <IndSymbolH cx={S_L2_CX} cy={WIRE_Y} />
        <line x1={S_L2_CX + SYMBOL_W / 2} y1={WIRE_Y} x2={S_RIGHT_X} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />

        <text x={S_L1_CX} y={WIRE_Y - 16}
              fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
              fill={svgTokens.mutedFg} textAnchor="middle">
          L₁
        </text>
        <text x={S_L2_CX} y={WIRE_Y - 16}
              fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
              fill={svgTokens.mutedFg} textAnchor="middle">
          L₂
        </text>

        <text x={HALF_W / 2} y={FORMULA_Y}
              fontFamily="inherit" fontSize="0.812em" fontStyle="italic"
              fill={svgTokens.fg} textAnchor="middle">
          L = L₁ + L₂
        </text>

        {/* ── PARALLEL TITLE ────────────────────────────────────── */}
        <text
          x={HALF_W + HALF_W / 2} y={TITLE_Y}
          fontFamily="inherit" fontSize="0.875em"
          fontStyle="italic" fontWeight="700"
          fill={svgTokens.fg} textAnchor="middle"
        >
          {t('ch1_6.combinationsParallelTitle')}
        </text>

        {/* Parallel: terminal dots */}
        <circle cx={P_LEFT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />
        <circle cx={P_RIGHT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />
        {/* Stubs from terminals to junction nodes */}
        <line x1={P_LEFT_X} y1={WIRE_Y} x2={P_NODE_L_X} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <line x1={P_NODE_R_X} y1={WIRE_Y} x2={P_RIGHT_X} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        {/* Verticals from upper to lower branch */}
        <line x1={P_NODE_L_X} y1={WIRE_Y} x2={P_NODE_L_X} y2={PARALLEL_L2_WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <line x1={P_NODE_R_X} y1={WIRE_Y} x2={P_NODE_R_X} y2={PARALLEL_L2_WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        {/* Upper branch wire segments on either side of L₁ */}
        <line x1={P_NODE_L_X} y1={WIRE_Y} x2={P_L1_CX - SYMBOL_W / 2} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <IndSymbolH cx={P_L1_CX} cy={WIRE_Y} />
        <line x1={P_L1_CX + SYMBOL_W / 2} y1={WIRE_Y} x2={P_NODE_R_X} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        {/* Lower branch wire segments on either side of L₂ */}
        <line x1={P_NODE_L_X} y1={PARALLEL_L2_WIRE_Y} x2={P_L2_CX - SYMBOL_W / 2} y2={PARALLEL_L2_WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <IndSymbolH cx={P_L2_CX} cy={PARALLEL_L2_WIRE_Y} />
        <line x1={P_L2_CX + SYMBOL_W / 2} y1={PARALLEL_L2_WIRE_Y} x2={P_NODE_R_X} y2={PARALLEL_L2_WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />

        <text x={P_L1_CX} y={WIRE_Y - 16}
              fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
              fill={svgTokens.mutedFg} textAnchor="middle">
          L₁
        </text>
        <text x={P_L2_CX} y={PARALLEL_L2_WIRE_Y + 22}
              fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
              fill={svgTokens.mutedFg} textAnchor="middle">
          L₂
        </text>

        <text x={HALF_W + HALF_W / 2} y={FORMULA_Y}
              fontFamily="inherit" fontSize="0.812em" fontStyle="italic"
              fill={svgTokens.fg} textAnchor="middle">
          L = L₁·L₂ / (L₁ + L₂)
        </text>
      </svg>
    </figure>
  )
}
