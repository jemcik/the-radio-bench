import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import { SI_PREFIXES, UNITY_PREFIX_INDEX } from '@/features/si/prefixes'
import { useSiLabels } from '@/features/si/useSiLabels'

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
//
// Vertical budget (top → bottom), as measured client rects, not intentions:
//   arrowLabelY = 14   arrow labels (×1000 / ÷1000), fontSize 10 → ink ~4…16
//   arrowY      = 26   arrow line + chevrons (±3.5)      → ink ~22…30
//   axisY−14    = 54   prefix symbol, fontSize 17        → box ~36…58
//   axisY       = 68   axis line (ticks span ±7)
//   axisY+24    = 92   power label (10ⁿ)                 → box ~79…95
//   H           = 100  ≈ descender of the power label.
//
// The arrow row and the symbol row USED to share a band (arrow line at 30,
// symbol box 22.5…44) and the arrow ran from tick+6, i.e. straight through
// the symbol. It only looked clean while each symbol was one narrow glyph;
// the moment they became «p (п)» — ~41 px wide — the line crossed the text.
// Hence two rules now: the bands above never touch, and the arrow is clipped
// to the clear span between two symbol boxes (see ARROW_HALF_SPAN).
const W = 820, H = 100
const axisY = 68
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
// Half-width of the arrow between two ticks. The widest symbol, «µ (мк)», is
// ~46 px, so a symbol box reaches ~23 px either side of its tick and the clear
// span between two of them is 90 − 46 = 44 px. 18 keeps 4 px of air at each end.
const ARROW_HALF_SPAN = 18
const HTML_PAD_X = axisStartX - STEP / 2   // 5
const paddingPct = `${(HTML_PAD_X / W) * 100}%`  // ≈ 0.609756%

export default function PrefixLadderDiagram() {
  const { t } = useTranslation('ui')
  const { symBoth, nameOnly } = useSiLabels()
  // Ladder shows the full 9-prefix range that radio actually uses: pico → tera.
  // (Picofarads for capacitance up to terahertz for thermal radiation.)
  //
  // Each tick carries BOTH spellings — `k (к)` — in either locale, because the
  // paragraph that points at this figure is about exactly that pair and is shown
  // to English readers too. This is
  // the reader's first meeting with prefixes, and the example printed under each
  // tick uses the Cyrillic form («530 кГц»). A tick reading only `k` above it
  // leaves them no way to know it is the same prefix, and a reader scanning the
  // figure never reaches the paragraph that could have told them.
  const prefixes = SI_PREFIXES.map(p => ({
    symbol: p.symbol
      ? symBoth(p)
      : '—',  // '—' marker for unity so the axis is visibly centered
    power: p.powerLabel,
    nameKey: p.nameKey,
    exampleKey: p.exampleKey,
    isUnity: !p.symbol,
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

  const arrowY = axisY - 42
  const arrowLabelY = arrowY - 12
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
            // The arrow lives only in the clear span between the two symbol
            // boxes either side of it — never under a symbol.
            const arrowTipX  = isLeftOfCenter ? midX - ARROW_HALF_SPAN : midX + ARROW_HALF_SPAN
            const arrowTailX = isLeftOfCenter ? midX + ARROW_HALF_SPAN : midX - ARROW_HALF_SPAN
            const label      = isLeftOfCenter ? '÷1000'    : '×1000'
            const dir        = isLeftOfCenter ? 'left'     : 'right'

            return (
              <g key={`arr-${i}`}>
                <line x1={arrowTailX} y1={arrowY} x2={arrowTipX} y2={arrowY}
                  stroke={arrowC} strokeWidth="0.8" />
                <polyline points={chevron(arrowTipX, dir)}
                  fill="none" stroke={arrowC} strokeWidth="0.8" />
                <text x={midX} y={arrowLabelY}
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

        {/* Translatable text — one column per tick, column centres aligned with
            tick positions via percentage padding.

            The NAME row is the reason this figure exists. Reader-flagged: the
            ladder carried only the symbols («p (п)», «k (к)») and the powers, so
            a reader who does not yet know what «к» stands for learned nothing
            from the one figure whose whole job is to teach the prefixes. The
            names live here rather than in the SVG because they translate, and
            this grid is where the chapter already keeps its translatable ladder
            text.

            `break-words` is load-bearing, not decorative: a single long word
            («випромінювання», «capacitance») is wider than the ~90 px column and
            would otherwise bleed over the neighbouring example. */}
        <div
          className="grid grid-cols-9 mt-1 text-center leading-snug font-semibold"
          style={{
            paddingLeft: paddingPct,
            paddingRight: paddingPct,
            fontSize: 12,
            color: 'hsl(var(--foreground))',
          }}
        >
          {prefixes.map((p, i) => (
            <span key={i} className="px-0.5 break-words">
              {p.isUnity ? '' : nameOnly(p)}
            </span>
          ))}
        </div>

        <div
          className="grid grid-cols-9 mt-0.5 text-center italic leading-snug"
          style={{
            paddingLeft: paddingPct,
            paddingRight: paddingPct,
            fontSize: 11,
            color: svgTokens.mutedFg,
          }}
        >
          {prefixes.map((p, i) => (
            <span key={i} className="px-0.5 break-words">
              {t(`ch0_3.${p.exampleKey}`)}
            </span>
          ))}
        </div>
      </div>
    </DiagramFigure>
  )
}
