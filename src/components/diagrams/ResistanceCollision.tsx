import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import { RoughPaths, roughLine, roughLinearPath } from '@/lib/rough'

/**
 * Chapter 1.1 — Resistance mechanism sketch (Section 5)
 *
 * Visual companion to the prose paragraph about resistance being
 * "friction at the atomic scale". One electron approaches from the
 * upper-left, bounces off a fixed ion core, and leaves toward the
 * lower-right — slower, because it just donated a fraction of its
 * kinetic energy to the ion. The ion is shown with small vibration
 * arcs and a radiating heat glyph to convey "that energy is now
 * heat".
 *
 * Every stroke uses Rough.js for the chapter's hand-sketched style;
 * ion core and electrons stay as clean SVG circles so the symbols
 * read cleanly at small sizes.
 *
 * Sizing: viewBox 500 × 240 rendered at maxWidth 500 (1:1) so fonts
 * at fontSize 13–14 land at 13–14 on screen (well above the 11 px
 * floor).
 */

type Pt = [number, number]

/**
 * Compute arrowhead wing points for a line ending at (x2, y2).
 * Returns the three points forming the V-shaped head:
 *   side1  →  tip  →  side2
 * which roughLinearPath draws as a single path.
 */
function arrowHead(x1: number, y1: number, x2: number, y2: number, len = 10, width = 5): [Pt, Pt, Pt] {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / length
  const ny = dy / length
  // back-direction + perpendicular
  const bx = -nx, by = -ny
  const px = ny, py = -nx
  const side1: Pt = [x2 + len * bx + width * px, y2 + len * by + width * py]
  const side2: Pt = [x2 + len * bx - width * px, y2 + len * by - width * py]
  return [side1, [x2, y2], side2]
}

/**
 * Move the `to` endpoint back along the from→to line by `dist`, so an
 * arrow pointing at a circular target stops just before the circle
 * instead of burying its tip inside it.
 */
function shortened(from: Pt, to: Pt, dist: number): Pt {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  return [to[0] - dist * (dx / len), to[1] - dist * (dy / len)]
}

export default function ResistanceCollision() {
  const { t } = useTranslation('ui')

  // ── Geometry ────────────────────────────────────────────────────
  const W = 500
  const H = 240

  // Ion core — central, fixed position
  const ionCx = 250
  const ionCy = 132
  const ionR = 18

  // Electron trajectories — incoming upper-left → ion, outgoing
  // ion → lower-right. End/start points sit just outside the ion
  // surface (r = 18) at roughly 225° and 45°.
  const inStart: Pt = [60, 58]
  const inEnd: Pt = [232, 118]
  const outStart: Pt = [272, 150]
  const outEnd: Pt = [440, 210]

  // ── Rough.js sketch ────────────────────────────────────────────
  const sketch = useMemo(() => {
    // Outgoing arrow stops 7 px short of the slower-electron dot
    // (dot r = 4.5, plus ~2.5 px breathing gap) so the tip doesn't
    // bury itself inside the electron.
    const outTip = shortened(outStart, outEnd, 7)
    const inHead = arrowHead(inStart[0], inStart[1], inEnd[0], inEnd[1])
    const outHead = arrowHead(outStart[0], outStart[1], outTip[0], outTip[1])
    return {
      incoming: roughLine(inStart[0], inStart[1], inEnd[0], inEnd[1], {
        seed: 1, strokeWidth: 1.4, roughness: 0.35,
      }),
      incomingHead: roughLinearPath(inHead, {
        seed: 2, strokeWidth: 1.4, roughness: 0.25,
      }),
      outgoing: roughLine(outStart[0], outStart[1], outTip[0], outTip[1], {
        seed: 3, strokeWidth: 1.3, roughness: 0.35,
      }),
      outgoingHead: roughLinearPath(outHead, {
        seed: 4, strokeWidth: 1.3, roughness: 0.25,
      }),
      // Vibration arcs — 4 short curves around the ion at the
      // "empty" compass points (the two electron-path diagonals are
      // already full).
      vibrations: [
        // Top: arc above the ion
        roughLinearPath([[ionCx - 10, ionCy - ionR - 8], [ionCx, ionCy - ionR - 12], [ionCx + 10, ionCy - ionR - 8]],
          { seed: 10, strokeWidth: 1, roughness: 0.5 }),
        // Bottom
        roughLinearPath([[ionCx - 10, ionCy + ionR + 8], [ionCx, ionCy + ionR + 12], [ionCx + 10, ionCy + ionR + 8]],
          { seed: 11, strokeWidth: 1, roughness: 0.5 }),
        // Upper-right (between ion and "Heat" label region)
        roughLinearPath([[ionCx + ionR + 6, ionCy - 8], [ionCx + ionR + 10, ionCy], [ionCx + ionR + 6, ionCy + 8]],
          { seed: 12, strokeWidth: 1, roughness: 0.5 }),
        // Lower-left
        roughLinearPath([[ionCx - ionR - 6, ionCy - 8], [ionCx - ionR - 10, ionCy], [ionCx - ionR - 6, ionCy + 8]],
          { seed: 13, strokeWidth: 1, roughness: 0.5 }),
      ],
      // Heat rays — three short radiating lines from the top of the
      // ion, suggesting thermal emission.
      heatRays: [
        roughLine(ionCx - 14, ionCy - ionR - 16, ionCx - 18, ionCy - ionR - 26, {
          seed: 20, strokeWidth: 0.9, roughness: 0.35,
        }),
        roughLine(ionCx, ionCy - ionR - 16, ionCx, ionCy - ionR - 28, {
          seed: 21, strokeWidth: 0.9, roughness: 0.35,
        }),
        roughLine(ionCx + 14, ionCy - ionR - 16, ionCx + 18, ionCy - ionR - 26, {
          seed: 22, strokeWidth: 0.9, roughness: 0.35,
        }),
      ],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DiagramFigure caption={t('ch1_1.resistanceCollisionCaption')}>
      <SVGDiagram
        width={W}
        height={H}
        aria-label={t('ch1_1.resistanceCollisionAriaLabel')}
        style={{ maxWidth: 500, margin: '0 auto' }}
      >
        {/* Title */}
        <text
          x={W / 2} y={24}
          textAnchor="middle"
          fontSize={16}
          fontWeight={700}
          fill={svgTokens.fg}
        >
          {t('ch1_1.resistanceCollisionTitle')}
        </text>

        {/* Incoming electron trajectory (note-blue) */}
        <g style={{ color: svgTokens.note }}>
          <RoughPaths paths={sketch.incoming} />
          <RoughPaths paths={sketch.incomingHead} />
        </g>
        {/* Incoming electron dot at the start */}
        <circle
          cx={inStart[0]} cy={inStart[1]} r={5}
          fill="hsl(var(--callout-note))"
        />

        {/* Ion core + vibration arcs + heat rays */}
        <g style={{ color: svgTokens.caution }} opacity={0.7}>
          {sketch.vibrations.map((v, i) => (
            <RoughPaths key={`vib-${i}`} paths={v} />
          ))}
        </g>
        <g style={{ color: svgTokens.caution }}>
          {sketch.heatRays.map((r, i) => (
            <RoughPaths key={`ray-${i}`} paths={r} />
          ))}
        </g>
        <circle
          cx={ionCx} cy={ionCy} r={ionR}
          fill="hsl(var(--callout-caution) / 0.85)"
        />
        <text
          x={ionCx} y={ionCy + 6}
          textAnchor="middle"
          fontSize={20}
          fontWeight={700}
          fill="hsl(var(--background))"
        >+</text>

        {/* Outgoing electron trajectory */}
        <g style={{ color: svgTokens.note }}>
          <RoughPaths paths={sketch.outgoing} />
          <RoughPaths paths={sketch.outgoingHead} />
        </g>
        {/* Outgoing electron dot at the end — slightly smaller to
            hint at the lost energy ("slower") */}
        <circle
          cx={outEnd[0]} cy={outEnd[1]} r={4.5}
          fill="hsl(var(--callout-note))"
          opacity={0.85}
        />

        {/* ── Labels ─────────────────────────────────────────── */}
        {/* Incoming electron */}
        <text
          x={inStart[0] + 10} y={inStart[1] - 6}
          fontSize={13}
          fontWeight={600}
          fill={svgTokens.note}
        >
          {t('ch1_1.resistanceCollisionLabelFast')}
        </text>
        {/* Outgoing electron */}
        <text
          x={outEnd[0] - 10} y={outEnd[1] + 16}
          textAnchor="end"
          fontSize={13}
          fontWeight={600}
          fill={svgTokens.note}
        >
          {t('ch1_1.resistanceCollisionLabelSlow')}
        </text>
        {/* Ion core — below the vibration arcs */}
        <text
          x={ionCx} y={ionCy + ionR + 28}
          textAnchor="middle"
          fontSize={13}
          fontWeight={600}
          fill={svgTokens.caution}
        >
          {t('ch1_1.resistanceCollisionLabelIon')}
        </text>
        {/* Heat — above the heat rays */}
        <text
          x={ionCx} y={ionCy - ionR - 36}
          textAnchor="middle"
          fontSize={13}
          fontStyle="italic"
          fill={svgTokens.caution}
        >
          {t('ch1_1.resistanceCollisionLabelHeat')}
        </text>
      </SVGDiagram>
    </DiagramFigure>
  )
}
