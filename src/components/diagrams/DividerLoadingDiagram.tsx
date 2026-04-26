/**
 * Chapter 1.4 — Side-by-side schematic showing a voltage divider with
 * no load (open output) versus with a load resistor R_L attached across
 * R_2. The two halves share the same divider topology (V_in rail at
 * top, R₁–R₂ column, ground rail at bottom, V_out tap at the R₁/R₂
 * junction); the right half adds an R_L branch from V_out to ground.
 *
 * The point of putting them side by side is to let the reader's eye
 * shuttle between "formula version" and "reality version" — the
 * formula for the open case doesn't care about R_L, and the loaded
 * case introduces the R₂ ∥ R_L parallel combination that ties back to
 * the previous section's algebra.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'
import { renderLabelContent, renderSvgInlineMath } from '@/lib/circuit/SymbolLabel'

const VB_W = 560
const VB_H = 260
const HALF_W = VB_W / 2

const TITLE_Y = 24
const RAIL_TOP_Y = 60
const RAIL_BOTTOM_Y = 200
const FORMULA_Y = 236

const RES_W = 12
const RES_H = 40

/** Vertical-orientation zigzag resistor centred at (cx, cy), height RES_H. */
function vResistorPath(cx: number, cy: number): string {
  const y0 = cy - RES_H / 2
  const y1 = cy + RES_H / 2
  const segs = 6
  const amp = RES_W / 2
  let d = `M ${cx} ${y0 - 6} L ${cx} ${y0}`
  for (let i = 0; i < segs; i++) {
    const ya = y0 + (i / segs) * RES_H
    const yb = y0 + ((i + 0.5) / segs) * RES_H
    const x = cx + (i % 2 === 0 ? -amp : amp)
    d += ` L ${x} ${yb} L ${cx} ${ya + RES_H / segs}`
  }
  d += ` L ${cx} ${y1 + 6}`
  return d
}

interface DividerProps {
  xOffset: number           // horizontal offset for this half
  hasLoad: boolean
}

function DividerGraph({ xOffset, hasLoad }: DividerProps) {
  const { t } = useTranslation('ui')
  // Main column x coord + the junction between R1 and R2
  const R_CX = xOffset + 100
  const JUNCTION_Y = (RAIL_TOP_Y + RAIL_BOTTOM_Y) / 2

  // Resistor centres between rails and junction
  const R1_CENTRE = RAIL_TOP_Y + (JUNCTION_Y - RAIL_TOP_Y) / 2
  const R2_CENTRE = JUNCTION_Y + (RAIL_BOTTOM_Y - JUNCTION_Y) / 2

  // Load branch
  const RL_CX = xOffset + 180
  const RL_CENTRE = JUNCTION_Y + (RAIL_BOTTOM_Y - JUNCTION_Y) / 2

  // Rails span for this half
  const RAIL_L = xOffset + 40
  const RAIL_R = xOffset + HALF_W - 20

  return (
    <g>
      {/* Top rail (V_in) */}
      <line
        x1={RAIL_L} y1={RAIL_TOP_Y} x2={RAIL_R} y2={RAIL_TOP_Y}
        stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
      />
      {/* Bottom rail (ground) */}
      <line
        x1={RAIL_L} y1={RAIL_BOTTOM_Y} x2={RAIL_R} y2={RAIL_BOTTOM_Y}
        stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
      />

      {/* V_in terminal symbol — small "+" dot at left end of top rail */}
      <circle cx={RAIL_L} cy={RAIL_TOP_Y} r={3} fill={svgTokens.fg} />
      <text
        x={RAIL_L - 6} y={RAIL_TOP_Y - 6}
        fontFamily="inherit" fontSize="0.687em" fontStyle="italic"
        fill={svgTokens.fg} textAnchor="end"
      >
        {renderLabelContent(t('ch1_4.loadingVinLabel'))}
      </text>

      {/* Ground terminal label */}
      <text
        x={RAIL_L - 6} y={RAIL_BOTTOM_Y + 4}
        fontFamily="inherit" fontSize="0.687em" fontStyle="italic"
        fill={svgTokens.mutedFg} textAnchor="end"
      >
        {t('ch1_4.loadingGroundLabel')}
      </text>

      {/* R1 vertical path */}
      <path
        d={vResistorPath(R_CX, R1_CENTRE)}
        stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        strokeLinejoin="round" fill="none"
      />
      <text
        x={R_CX + 12} y={R1_CENTRE + 4}
        fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
        fill={svgTokens.mutedFg} textAnchor="start"
      >
        R₁
      </text>

      {/* R2 vertical path */}
      <path
        d={vResistorPath(R_CX, R2_CENTRE)}
        stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
        strokeLinejoin="round" fill="none"
      />
      <text
        x={R_CX + 12} y={R2_CENTRE + 4}
        fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
        fill={svgTokens.mutedFg} textAnchor="start"
      >
        R₂
      </text>

      {/* Junction dot + V_out wire extending right */}
      <circle cx={R_CX} cy={JUNCTION_Y} r={3} fill={svgTokens.fg} />
      <line
        x1={R_CX} y1={JUNCTION_Y}
        x2={hasLoad ? RL_CX : R_CX + 50} y2={JUNCTION_Y}
        stroke={svgTokens.fg} strokeWidth={1.4} strokeLinecap="round"
      />

      {/* V_out terminal */}
      {!hasLoad && (
        <>
          <circle cx={R_CX + 50} cy={JUNCTION_Y} r={3} fill="none" stroke={svgTokens.fg} strokeWidth={1.2} />
          <text
            x={R_CX + 60} y={JUNCTION_Y + 4}
            fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
            fill={svgTokens.fg} textAnchor="start"
          >
            {renderLabelContent(t('ch1_4.loadingVoutLabel'))}
          </text>
        </>
      )}

      {/* Load branch, only in the loaded half */}
      {hasLoad && (
        <>
          {/* Junction at RL top */}
          <circle cx={RL_CX} cy={JUNCTION_Y} r={2.5} fill={svgTokens.fg} />
          <text
            x={RL_CX + 18} y={JUNCTION_Y + 4}
            fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
            fill={svgTokens.fg} textAnchor="start"
          >
            {renderLabelContent(t('ch1_4.loadingVoutLabel'))}
          </text>
          {/* Load vertical resistor down to ground rail */}
          <path
            d={vResistorPath(RL_CX, RL_CENTRE)}
            stroke={svgTokens.caution} strokeWidth={1.4} strokeLinecap="round"
            strokeLinejoin="round" fill="none"
          />
          <text
            x={RL_CX + 12} y={RL_CENTRE + 4}
            fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
            fill={svgTokens.caution} textAnchor="start"
          >
            R_L
          </text>
        </>
      )}
    </g>
  )
}

export default function DividerLoadingDiagram() {
  const { t } = useTranslation('ui')

  return (
    <figure className="my-6 not-prose">
      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_4.loadingAria')}
        style={{ display: 'block', maxWidth: 680, margin: '0 auto' }}
      >
        {/* Divider hairline */}
        <line
          x1={HALF_W} y1={12} x2={HALF_W} y2={VB_H - 10}
          stroke={svgTokens.border}
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />

        {/* Titles */}
        <text
          x={HALF_W / 2} y={TITLE_Y}
          fontFamily="inherit" fontSize="0.875em"
          fontStyle="italic" fontWeight="700"
          fill={svgTokens.fg} textAnchor="middle"
        >
          {t('ch1_4.loadingNoLoadTitle')}
        </text>
        <text
          x={HALF_W + HALF_W / 2} y={TITLE_Y}
          fontFamily="inherit" fontSize="0.875em"
          fontStyle="italic" fontWeight="700"
          fill={svgTokens.fg} textAnchor="middle"
        >
          {t('ch1_4.loadingLoadedTitle')}
        </text>

        <DividerGraph xOffset={0} hasLoad={false} />
        <DividerGraph xOffset={HALF_W} hasLoad={true} />

        {/* Formulas */}
        <text
          x={HALF_W / 2} y={FORMULA_Y}
          fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
          fill={svgTokens.fg} textAnchor="middle"
        >
          {renderSvgInlineMath(t('ch1_4.loadingNoLoadFormula'))}
        </text>
        <text
          x={HALF_W + HALF_W / 2} y={FORMULA_Y}
          fontFamily="inherit" fontSize="0.75em" fontStyle="italic"
          fill={svgTokens.fg} textAnchor="middle"
        >
          {renderSvgInlineMath(t('ch1_4.loadingLoadedFormula'))}
        </text>
      </svg>
    </figure>
  )
}
