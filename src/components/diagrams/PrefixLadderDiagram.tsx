import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import { SI_PREFIXES, UNITY_PREFIX_INDEX } from '@/features/si/prefixes'

/**
 * Chapter 0.3 — SI Prefixes logarithmic scale
 *
 * The SVG holds the AXIS content only: per-segment ÷1000 / ×1000
 * arrows, the axis line with coloured rainbow segments, ticks, the
 * prefix symbol (p, n, µ, m, …, T) above each tick, and the power-of-
 * ten label (10⁻¹², …, 10¹²) below each tick. None of those strings
 * translate.
 *
 * The TRANSLATABLE example text under each tick («ємність конденсатора»
 * etc.) lives in an HTML row BELOW the SVG, in a 9-column grid whose
 * column centres line up exactly with the tick centres. Auto-wrapping
 * inside HTML replaces the previous `wrapLabel(text, 12)` hack that
 * manually split EN/UA strings at fixed character counts. Same pattern
 * as InductorTypeGallery / MaterialsComparison.
 */

// ── Geometry ────────────────────────────────────────────────────
// Sized to fit 9 ticks comfortably AND keep the labels at a readable
// font size (17/12.5/11 px). The SVG itself is responsive (width="100%").
// Vertical budget (top → bottom):
//   arrowY−6   = 24   arrow labels (×1000 / ÷1000)
//   axisY−14   = 40   prefix symbol (fontSize 17)
//   axisY      = 54   axis line
//   axisY+24   = 78   power label (10ⁿ)
//   axisY+34   = 88   ≈ descender of the power label → SVG ends here.
// Example text used to live at axisY+40..+53; now it's HTML below the
// SVG, freeing this vertical budget down to 90 px.
const W = 820, H = 90
const axisY = 54
const axisStartX = 50
const axisEndX = 770

// HTML columns must align with the SVG ticks at every render width.
// Express padding and gap in percentages of W so the alignment holds
// when the wrapper scales down on narrow viewports.
//   tick 0 sits at viewBox x = axisStartX = 50.
//   Each tick is `step` apart (= 90 at full width).
//   Col 0 should span [tick0 - step/2, tick0 + step/2] = [5, 95]
//     → padding-left = 5; col_w = step; gap = 0; 9 cols of width step.
const STEP = (axisEndX - axisStartX) / 8  // 90
const HTML_PAD_X = axisStartX - STEP / 2   // 5
const paddingPct = `${(HTML_PAD_X / W) * 100}%`  // ≈ 0.609756%

export default function PrefixLadderDiagram() {
  const { t } = useTranslation('ui')
  // Ladder shows the full 9-prefix range that radio actually uses: pico → tera.
  // (Picofarads for capacitance up to terahertz for thermal radiation.)
  const prefixes = SI_PREFIXES.map(p => ({
    symbol: p.symbol || '—',  // '—' marker for unity so the axis is visibly centered
    power: p.powerLabel,
    exampleKey: p.exampleKey,
  }))
  // SI_PREFIXES[UNITY_PREFIX_INDEX] is the '10⁰' row; that index also holds here
  // because prefixes[] is the same array.
  const centerIndex = UNITY_PREFIX_INDEX

  const positions = prefixes.map((_, i) => axisStartX + STEP * i)

  // 8 colours — one per segment between the 9 ticks.
  // DECORATIVE EXCEPTION (per CLAUDE.md): this is the prefix-segment
  // rainbow — a deliberate visual identity that lets the reader see
  // each magnitude band (kilo / mega / giga …) as a distinct hue.
  // It is intentionally NOT theme-driven; the rainbow stays the same
  // across every theme so the chapter prose can refer to "the blue
  // band" without worrying about light/dark mode.
  const segmentColors = [
    'hsl(210 60% 55%)', 'hsl(250 50% 58%)', 'hsl(280 45% 55%)',
    'hsl(320 50% 55%)', 'hsl(38 70% 50%)',  'hsl(25 70% 50%)',
    'hsl(0 60% 55%)',   'hsl(340 55% 55%)',
  ]

  const arrowY = axisY - 24
  const arrowC = svgTokens.mutedFg
  const axisC = svgTokens.border
  const labelC = svgTokens.mutedFg

  // Draw a small chevron at (x, y) pointing left or right
  const chevron = (x: number, dir: 'left' | 'right') => {
    const dx = dir === 'left' ? 5 : -5
    return `${x + dx},${arrowY - 3.5} ${x},${arrowY} ${x + dx},${arrowY + 3.5}`
  }

  return (
    <DiagramFigure caption={t('ch0_3.prefixesDiagramCaption')}>
      <div className="mx-auto" style={{ maxWidth: W }}>
        <SVGDiagram
          width={W} height={H}
          style={{ maxWidth: W, margin: '0 auto' }}
          fontFamily="inherit"
          aria-label={t('ch0_3.prefixLadderAria')}
        >
          {/* ── Per-segment arrows ── */}
          {positions.slice(0, -1).map((x, i) => {
            const nextX = positions[i + 1]
            const midX = (x + nextX) / 2
            const isLeftOfCenter = i < centerIndex

            // Left of center: ← ÷1000 ; right of center: ×1000 →
            const arrowTipX  = isLeftOfCenter ? x + 10     : nextX - 10
            const arrowTailX = isLeftOfCenter ? nextX - 6  : x + 6
            const label      = isLeftOfCenter ? '÷1000'    : '×1000'
            const dir        = isLeftOfCenter ? 'left'     : 'right'

            return (
              <g key={`arr-${i}`}>
                <line x1={arrowTailX} y1={arrowY} x2={arrowTipX} y2={arrowY}
                  stroke={arrowC} strokeWidth="0.8" />
                <polyline points={chevron(arrowTipX, dir)}
                  fill="none" stroke={arrowC} strokeWidth="0.8" />
                <text x={midX} y={arrowY - 6}
                  textAnchor="middle" fontSize="0.625em" fill={arrowC}>{label}</text>
              </g>
            )
          })}

          {/* ── Axis line ── */}
          <line x1={axisStartX} y1={axisY} x2={axisEndX} y2={axisY}
            stroke={axisC} strokeWidth="1.5" />

          {/* ── Colored segments ── */}
          {positions.slice(0, -1).map((x, i) => (
            <rect key={`seg-${i}`}
              x={x} y={axisY - 2.5}
              width={positions[i + 1] - x} height={5} rx={2}
              fill={segmentColors[i]} opacity={0.3} />
          ))}

          {/* ── Ticks + symbol + power (no translatable text in SVG) ── */}
          {prefixes.map((p, i) => {
            const x = positions[i]
            return (
              <g key={i}>
                <line x1={x} y1={axisY - 7} x2={x} y2={axisY + 7}
                  stroke={labelC} strokeWidth="1.2" />
                <text x={x} y={axisY - 14}
                  textAnchor="middle" fontSize="1.062em" fontWeight="700"
                  fill="hsl(var(--foreground))">{p.symbol}</text>
                <text x={x} y={axisY + 24}
                  textAnchor="middle" fontSize="0.781em"
                  fill={labelC}>{p.power}</text>
              </g>
            )
          })}
        </SVGDiagram>

        {/* Translatable example text — one column per tick, column centres
            aligned with tick positions via percentage padding. Auto-wraps
            inside its column when UA strings exceed the slot width. */}
        <div
          className="grid grid-cols-9 mt-1 text-center italic leading-snug"
          style={{
            paddingLeft: paddingPct,
            paddingRight: paddingPct,
            fontSize: 11,
            color: svgTokens.mutedFg,
          }}
        >
          {prefixes.map((p, i) => (
            <span key={i} className="px-0.5">
              {t(`ch0_3.${p.exampleKey}`)}
            </span>
          ))}
        </div>
      </div>
    </DiagramFigure>
  )
}
