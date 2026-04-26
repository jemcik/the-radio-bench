/**
 * Chapter 1.5 — Side-by-side schematic of two capacitors wired in
 * parallel (left) and in series (right). Mirrors the ch 1.4 resistor
 * SeriesParallelSchematic visually, deliberately — the reader should
 * notice that the topology is the same but the formulas are flipped
 * (caps add in parallel, combine reciprocally in series).
 *
 * Capacitor symbols are drawn as two short parallel plates + leads,
 * matching the convention used throughout the book (the `Capacitor`
 * primitive in `@/lib/circuit`). Rendered as clean hand-traced SVG
 * (not Rough.js) because schematic notation must stay precise.
 *
 * Padding budgeted for Ukrainian formula-label length, which runs
 * significantly wider than English on the "series" formula.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 540
const VB_H = 220

const HALF_W = VB_W / 2

const TITLE_Y = 26
const WIRE_Y = 92
const PARALLEL_C2_WIRE_Y = 132
const FORMULA_Y = 196

/* Capacitor symbol geometry — two plates 12 px tall, 6 px apart, with
 * short lead stubs of 6 px on each side (matching CapSymbolUnit below). */
const PLATE_H = 18
const PLATE_GAP = 6

/** Draw a horizontal capacitor symbol centred at (cx, cy): plate-lead-gap-
 *  plate-lead. Returns an SVG fragment. */
function CapSymbolH({ cx, cy }: { cx: number; cy: number }) {
  const plateLx = cx - PLATE_GAP / 2
  const plateRx = cx + PLATE_GAP / 2
  return (
    <>
      {/* Left plate */}
      <line
        x1={plateLx} y1={cy - PLATE_H / 2}
        x2={plateLx} y2={cy + PLATE_H / 2}
        stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
      />
      {/* Right plate */}
      <line
        x1={plateRx} y1={cy - PLATE_H / 2}
        x2={plateRx} y2={cy + PLATE_H / 2}
        stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
      />
    </>
  )
}

export default function CapSeriesParallelSchematic() {
  const { t } = useTranslation('ui')

  // ── Parallel half (left) — two caps, vertical-style branches ─────
  // Two terminals connected left-right by an upper wire (with C₁) and
  // a lower wire (with C₂) that meet at two junction nodes.
  const P_LEFT_X = 40
  const P_RIGHT_X = HALF_W - 40
  const P_NODE_L_X = P_LEFT_X + 22
  const P_NODE_R_X = P_RIGHT_X - 22
  const P_C1_CX = (P_NODE_L_X + P_NODE_R_X) / 2
  const P_C2_CX = P_C1_CX

  // ── Series half (right) — two caps in a single row ────────────────
  const S_LEFT_X = HALF_W + 40
  const S_RIGHT_X = VB_W - 40
  const S_C1_CX = S_LEFT_X + (S_RIGHT_X - S_LEFT_X) / 3
  const S_C2_CX = S_LEFT_X + 2 * (S_RIGHT_X - S_LEFT_X) / 3

  return (
    <figure className="my-6 not-prose">
      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_5.combinationsSchematicAria')}
        style={{ display: 'block', maxWidth: 640, margin: '0 auto' }}
      >
        {/* ── Divider hairline ───────────────────────────────────── */}
        <line
          x1={HALF_W} y1={12} x2={HALF_W} y2={VB_H - 30}
          stroke={svgTokens.border}
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />

        {/* ── PARALLEL TITLE ─────────────────────────────────────── */}
        <text
          x={HALF_W / 2} y={TITLE_Y}
          fontFamily="inherit" fontSize="0.875em"
          fontStyle="italic" fontWeight="700"
          fill={svgTokens.fg} textAnchor="middle"
        >
          {t('ch1_5.combinationsParallelTitle')}
        </text>

        {/* ── PARALLEL: two branches between node_L and node_R ─── */}
        {/* Terminal dots */}
        <circle cx={P_LEFT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />
        <circle cx={P_RIGHT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />
        {/* Stubs from terminals to the junction nodes */}
        <line x1={P_LEFT_X} y1={WIRE_Y} x2={P_NODE_L_X} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <line x1={P_NODE_R_X} y1={WIRE_Y} x2={P_RIGHT_X} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        {/* Verticals from upper branch down to lower branch */}
        <line x1={P_NODE_L_X} y1={WIRE_Y} x2={P_NODE_L_X} y2={PARALLEL_C2_WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <line x1={P_NODE_R_X} y1={WIRE_Y} x2={P_NODE_R_X} y2={PARALLEL_C2_WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        {/* Upper branch wire segments on either side of C₁ */}
        <line x1={P_NODE_L_X} y1={WIRE_Y} x2={P_C1_CX - PLATE_GAP / 2} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <CapSymbolH cx={P_C1_CX} cy={WIRE_Y} />
        <line x1={P_C1_CX + PLATE_GAP / 2} y1={WIRE_Y} x2={P_NODE_R_X} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        {/* Lower branch wire segments on either side of C₂ */}
        <line x1={P_NODE_L_X} y1={PARALLEL_C2_WIRE_Y} x2={P_C2_CX - PLATE_GAP / 2} y2={PARALLEL_C2_WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <CapSymbolH cx={P_C2_CX} cy={PARALLEL_C2_WIRE_Y} />
        <line x1={P_C2_CX + PLATE_GAP / 2} y1={PARALLEL_C2_WIRE_Y} x2={P_NODE_R_X} y2={PARALLEL_C2_WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />

        {/* Component labels */}
        <text x={P_C1_CX} y={WIRE_Y - 20}
              fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
              fill={svgTokens.mutedFg} textAnchor="middle">
          C₁
        </text>
        <text x={P_C2_CX} y={PARALLEL_C2_WIRE_Y + 26}
              fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
              fill={svgTokens.mutedFg} textAnchor="middle">
          C₂
        </text>

        {/* Parallel formula */}
        <text x={HALF_W / 2} y={FORMULA_Y}
              fontFamily="inherit" fontSize="0.812em" fontStyle="italic"
              fill={svgTokens.fg} textAnchor="middle">
          C = C₁ + C₂
        </text>

        {/* ── SERIES TITLE ───────────────────────────────────────── */}
        <text
          x={HALF_W + HALF_W / 2} y={TITLE_Y}
          fontFamily="inherit" fontSize="0.875em"
          fontStyle="italic" fontWeight="700"
          fill={svgTokens.fg} textAnchor="middle"
        >
          {t('ch1_5.combinationsSeriesTitle')}
        </text>

        {/* Series: terminal dots + wires + two caps in a row */}
        <circle cx={S_LEFT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />
        <circle cx={S_RIGHT_X} cy={WIRE_Y} r={3} fill={svgTokens.fg} />
        <line x1={S_LEFT_X} y1={WIRE_Y} x2={S_C1_CX - PLATE_GAP / 2} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <CapSymbolH cx={S_C1_CX} cy={WIRE_Y} />
        <line x1={S_C1_CX + PLATE_GAP / 2} y1={WIRE_Y} x2={S_C2_CX - PLATE_GAP / 2} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />
        <CapSymbolH cx={S_C2_CX} cy={WIRE_Y} />
        <line x1={S_C2_CX + PLATE_GAP / 2} y1={WIRE_Y} x2={S_RIGHT_X} y2={WIRE_Y}
              stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round" />

        <text x={S_C1_CX} y={WIRE_Y - 20}
              fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
              fill={svgTokens.mutedFg} textAnchor="middle">
          C₁
        </text>
        <text x={S_C2_CX} y={WIRE_Y - 20}
              fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
              fill={svgTokens.mutedFg} textAnchor="middle">
          C₂
        </text>

        <text x={HALF_W + HALF_W / 2} y={FORMULA_Y}
              fontFamily="inherit" fontSize="0.812em" fontStyle="italic"
              fill={svgTokens.fg} textAnchor="middle">
          C = C₁·C₂ / (C₁ + C₂)
        </text>
      </svg>
    </figure>
  )
}
