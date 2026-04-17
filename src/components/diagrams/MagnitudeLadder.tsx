import { useMemo } from 'react'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import { RoughPaths, roughLine, roughLinearPath, roughRect } from '@/lib/rough'

/**
 * MagnitudeLadder — vertical "orders-of-magnitude" ladder for a handful
 * of landmark values (10 mA, 15 A, lightning-bolt peak, etc.).
 *
 * LAYOUT
 * ──────
 * Each item is a coloured BOX containing the value label, with a dashed
 * connector out to a prose description on the right. Between consecutive
 * boxes, an UP-arrow is drawn with the ratio ("× N") placed next to it.
 * That arrow is the teaching device: the reader's eye tracks the jump
 * and reads how much bigger the next landmark is.
 *
 * Rungs are evenly spaced (NOT log-scaled) so every landmark gets equal
 * breathing room for its description; the ratio labels carry the
 * orders-of-magnitude message instead of the eye having to estimate
 * from pixel distance.
 *
 * TONE
 * ────
 * The `tone` prop selects a CSS token (`primary` / `note` / `caution`)
 * for the box fill + stroke and the arrow colour. This ties each
 * ladder visually to its chapter quantity — blue for current, amber
 * for voltage, orange for resistance.
 *
 * USAGE
 * ─────
 *   <MagnitudeLadder
 *     title="…"
 *     ariaLabel="…"
 *     caption="…"
 *     tone="note"
 *     items={[
 *       { value: 0.01, label: '10 mA', description: 'LED' },
 *       { value: 0.02, label: '20 mA', description: 'Arduino pin' },
 *       …
 *     ]}
 *   />
 *
 * Sizing (per feedback_svg_font_minimum_on_screen): viewBox width 600,
 * rendered at maxWidth 560 → ~0.93× scale. Box value at fontSize 16 →
 * ~15 px on screen; description at 14 → ~13 px; ratio label at 13
 * italic → ~12 px. All well above the 11 px floor.
 */

export interface LadderItem {
  value: number
  label: string
  description: string
  /** Override the auto-computed ratio label shown BELOW this item. */
  ratioBelowLabel?: string
}

export type LadderTone = 'primary' | 'note' | 'caution'

interface MagnitudeLadderProps {
  title: string
  ariaLabel: string
  caption?: string
  items: LadderItem[]
  tone?: LadderTone
}

const TONE_COLOURS: Record<LadderTone, { stroke: string; fill: string; accent: string }> = {
  primary: {
    stroke: 'hsl(var(--primary))',
    fill:   'hsl(var(--primary) / 0.12)',
    accent: 'hsl(var(--primary))',
  },
  note: {
    stroke: 'hsl(var(--callout-note))',
    fill:   'hsl(var(--callout-note) / 0.12)',
    accent: 'hsl(var(--callout-note))',
  },
  caution: {
    stroke: 'hsl(var(--callout-caution))',
    fill:   'hsl(var(--callout-caution) / 0.12)',
    accent: 'hsl(var(--callout-caution))',
  },
}

/**
 * Humanise a numeric ratio into a compact display string.
 * Uses a non-breaking space for thousands grouping.
 */
function formatRatio(r: number): string {
  if (r < 5) {
    const n = r.toFixed(r < 2 ? 1 : 0)
    return `× ${n.replace(/\.0$/, '')}`
  }
  if (r < 100) return `× ${Math.round(r)}`
  if (r < 1_000) return `× ${Math.round(r / 10) * 10}`
  if (r < 1_000_000) {
    const k = Math.round(r / 100) * 100
    return `× ${k.toString().replace(/(\d)(\d{3})$/, '$1\u00a0$2')}`
  }
  return `× ${Math.round(r).toString().replace(/(\d)(\d{3})(\d{3})$/, '$1\u00a0$2\u00a0$3')}`
}

export default function MagnitudeLadder({
  title,
  ariaLabel,
  caption,
  items,
  tone = 'primary',
}: MagnitudeLadderProps) {
  const colour = TONE_COLOURS[tone]

  // Sort descending so the biggest value sits at the TOP of the ladder.
  const sorted = useMemo(() => [...items].sort((a, b) => b.value - a.value), [items])

  // ── Geometry ────────────────────────────────────────────────────
  // viewBox is sized to the actual content (box + connector +
  // generous room for the widest description) with SYMMETRIC left/
  // right padding. A too-wide viewBox leaves an unbalanced empty
  // stripe on the right that reads as "content biased to the left"
  // once the SVG is centred in the card. 1:1 CSS scaling (maxWidth
  // === W) keeps fonts at their viewBox values on screen.
  const W = 500
  const BOX_W = 108
  const BOX_H = 36
  const BOX_X = 60            // ≈ right padding too, so content is centred
  const GAP_H = 42            // vertical gap between consecutive boxes
  const TOP_MARGIN = 54       // room for title above first box
  const BOTTOM_MARGIN = 22

  const H = TOP_MARGIN + sorted.length * BOX_H + (sorted.length - 1) * GAP_H + BOTTOM_MARGIN

  const yForBox = (idx: number) =>
    TOP_MARGIN + idx * (BOX_H + GAP_H)

  const boxCentreX = BOX_X + BOX_W / 2
  const connectorX = BOX_X + BOX_W + 8
  const descriptionX = BOX_X + BOX_W + 28

  // ── Rough.js geometry ──────────────────────────────────────────
  const sketch = useMemo(() => ({
    boxes: sorted.map((_, i) =>
      roughRect(BOX_X, yForBox(i), BOX_W, BOX_H, {
        seed: 10 + i, strokeWidth: 1.6, roughness: 0.35,
      }),
    ),
    // Dashed connector between each box and its description.
    connectors: sorted.map((_, i) => {
      const y = yForBox(i) + BOX_H / 2
      return roughLine(connectorX, y, descriptionX - 4, y, {
        seed: 40 + i, strokeWidth: 0.8, roughness: 0.25,
      })
    }),
    // Up-arrow between each pair of consecutive boxes.
    arrows: sorted.slice(0, -1).map((_, i) => {
      const yBotOfBoxAbove = yForBox(i) + BOX_H
      const yTopOfBoxBelow = yForBox(i + 1)
      const shaftTop = yBotOfBoxAbove + 6
      const shaftBot = yTopOfBoxBelow - 6
      return {
        shaft: roughLine(boxCentreX, shaftBot, boxCentreX, shaftTop, {
          seed: 70 + i, strokeWidth: 1.6, roughness: 0.25,
        }),
        head: roughLinearPath([
          [boxCentreX - 5, shaftTop + 6],
          [boxCentreX, shaftTop],
          [boxCentreX + 5, shaftTop + 6],
        ], { seed: 85 + i, strokeWidth: 1.6, roughness: 0.2 }),
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [sorted.length])

  return (
    <DiagramFigure caption={caption}>
      <SVGDiagram
        width={W}
        height={H}
        aria-label={ariaLabel}
        style={{ maxWidth: 500, margin: '0 auto' }}
      >
        {/* Title */}
        <text
          x={W / 2} y={28}
          textAnchor="middle"
          fontSize={16}
          fontWeight={700}
          fill={svgTokens.fg}
        >
          {title}
        </text>

        {/* Boxes */}
        {sorted.map((item, i) => {
          const y = yForBox(i)
          return (
            <g key={`rung-${i}`}>
              {/* Box fill — plain rect for a clean colour backing the
                  Rough.js outline */}
              <rect
                x={BOX_X} y={y}
                width={BOX_W} height={BOX_H}
                rx={6}
                fill={colour.fill}
              />
              {/* Rough.js outline */}
              <g style={{ color: colour.stroke }}>
                <RoughPaths paths={sketch.boxes[i]} />
              </g>
              {/* Value label inside box */}
              <text
                x={boxCentreX} y={y + BOX_H / 2 + 6}
                textAnchor="middle"
                fontSize={16}
                fontWeight={700}
                fill={colour.stroke}
              >
                {item.label}
              </text>
              {/* Dashed connector to description */}
              <g style={{ color: svgTokens.mutedFg }} opacity={0.6}>
                <RoughPaths paths={sketch.connectors[i]} />
              </g>
              {/* Description */}
              <text
                x={descriptionX} y={y + BOX_H / 2 + 5}
                fontSize={14}
                fill={svgTokens.fg}
              >
                {item.description}
              </text>
            </g>
          )
        })}

        {/* Between-box arrows + ratios */}
        {sorted.slice(0, -1).map((item, i) => {
          const nextItem = sorted[i + 1]
          const ratioText =
            item.ratioBelowLabel ?? formatRatio(item.value / nextItem.value)
          const midY = yForBox(i) + BOX_H + GAP_H / 2
          return (
            <g key={`arrow-${i}`}>
              <g style={{ color: colour.accent }}>
                <RoughPaths paths={sketch.arrows[i].shaft} />
                <RoughPaths paths={sketch.arrows[i].head} />
              </g>
              <text
                x={boxCentreX + 14}
                y={midY + 4}
                fontSize={13}
                fontStyle="italic"
                fontWeight={600}
                fill={colour.accent}
              >
                {ratioText}
              </text>
            </g>
          )
        })}
      </SVGDiagram>
    </DiagramFigure>
  )
}
