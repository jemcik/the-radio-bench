import { Trans, useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import { mathComponents } from '@/lib/trans-defaults'

/**
 * Chapter 1.9 — Leakage-flux illustration.
 *
 * Pedagogical companion to the `lossesLeakage` paragraph: shows WHY
 * leakage inductance exists by drawing the two flux paths side by
 * side on the same core-and-windings cross-section:
 *
 *   1. The MAIN (mutual) flux Φ_m — bold solid arrow that follows
 *      the rectangular iron loop all the way around, threading both
 *      the primary winding (left limb) and the secondary winding
 *      (right limb). This is the flux that DOES couple the two
 *      windings, and so transfers power from primary to secondary.
 *
 *   2. The LEAKAGE flux Φ_l — small dashed loop in the air window
 *      that takes a shorter path through the air and never reaches
 *      the secondary. It cycles back to the primary itself, so it
 *      stores energy in the air gap each cycle but contributes
 *      nothing to the secondary's induced voltage — precisely what
 *      the prose describes as «a tiny inductor in series with each
 *      winding».
 *
 * Visually echoes the chapter hero (rectangular iron core + helical
 * windings drawn as Bezier sine-paths split into BACK / FRONT passes
 * so the back passes are correctly occluded by the iron).
 *
 *   Layer order (back → front in the SVG):
 *     1. <defs>
 *     2. Winding BACK passes (drawn first, then hidden by iron)
 *     3. Iron core (opaque hatch fill — occludes back-pass middles)
 *     4. Main flux Φ_m loop arrows
 *     5. Leakage flux Φ_l dashed loop
 *     6. Winding FRONT passes (drawn last — visible on top)
 *     7. Labels
 */

const VB_W = 420
const VB_H = 240

// Iron-core rectangle (outer + inner = the "ring" cross-section).
const CORE_OUTER_X = 60
const CORE_OUTER_Y = 30
const CORE_OUTER_W = 300
const CORE_OUTER_H = 180
// Inner window (the air gap between the two limbs).
const CORE_INNER_X = 110
const CORE_INNER_Y = 70
const CORE_INNER_W = 200
const CORE_INNER_H = 100

// Limb x-centerlines (where flux travels through the iron).
const LEFT_LIMB_CX = (CORE_OUTER_X + CORE_INNER_X) / 2
const RIGHT_LIMB_CX = (CORE_INNER_X + CORE_INNER_W + CORE_OUTER_X + CORE_OUTER_W) / 2
const TOP_YOKE_CY = (CORE_OUTER_Y + CORE_INNER_Y) / 2
const BOT_YOKE_CY = (CORE_INNER_Y + CORE_INNER_H + CORE_OUTER_Y + CORE_OUTER_H) / 2

// Helical windings — geometry shared by primary (left limb) and
// secondary (right limb). Both have the same number of turns
// (4) — leakage is independent of turns ratio, so we don't muddy
// the diagram with a step-up/step-down hint that's not the topic.
const WIND_TURNS = 4
const WIND_Y0 = 80                    // top of helix
const WIND_Y1 = 160                   // bottom of helix
const HELIX_OUTER_OVERHANG = 10       // px past the leg's OUTER face
                                       // (small tabs visible after iron occludes back-pass middles)

// Primary helix: outer overhang on the LEFT, inner endpoint at the
// leg's inner face (no inner overhang — keeps the inner window
// clean for the leakage loop).
const PRI_X_OUTER = CORE_OUTER_X - HELIX_OUTER_OVERHANG     // 50
const PRI_X_INNER = CORE_INNER_X                            // 110
// Secondary helix: outer overhang on the RIGHT (mirror of primary).
const SEC_X_OUTER = CORE_OUTER_X + CORE_OUTER_W + HELIX_OUTER_OVERHANG   // 370
const SEC_X_INNER = CORE_INNER_X + CORE_INNER_W                          // 310

// Bezier-tangent strength as a fraction of half-period height.
// 0.4 lifted from Ch1_9Hero — gives smooth vertical-tangent joins
// at every leg-edge contact point without the curve flattening.
const HELIX_TANGENT = 0.4

export default function LeakageFluxDiagram() {
  const { t } = useTranslation('ui')

  // Pre-compute helix paths (back + front) for both windings.
  const primary = helicalPaths({
    xStart: PRI_X_OUTER,
    xEnd: PRI_X_INNER,
    yTop: WIND_Y0,
    yBot: WIND_Y1,
    turns: WIND_TURNS,
  })
  const secondary = helicalPaths({
    xStart: SEC_X_OUTER,
    xEnd: SEC_X_INNER,
    yTop: WIND_Y0,
    yBot: WIND_Y1,
    turns: WIND_TURNS,
  })

  return (
    <DiagramFigure
      caption={
        <Trans
          i18nKey="ch1_9.leakageDiagramCaption"
          ns="ui"
          components={{ ...mathComponents }}
        />
      }
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width={VB_W}
        height={VB_H}
        role="img"
        aria-label={t('ch1_9.leakageDiagramAria')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto', fontSize: '1rem' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Arrow for the main flux loop — bold, filled triangle. */}
          <marker
            id="lf-arrow-main"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill={svgTokens.note} />
          </marker>
          {/* Arrow for the leakage loop — smaller, lighter. */}
          <marker
            id="lf-arrow-leak"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill={svgTokens.caution} />
          </marker>
          {/* Iron-core hatch — gives the «iron» feel. The 6×6 patch
              has an OPAQUE background so the iron path occludes the
              winding back-passes underneath; the diagonal hatch
              line on top adds the laminated-iron texture. */}
          <pattern
            id="lf-iron-hatch"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill="hsl(var(--card))" />
            <line x1="0" y1="0" x2="0" y2="6" stroke={svgTokens.fg} strokeWidth="0.6" opacity="0.35" />
          </pattern>
        </defs>

        {/* ── Layer 2: Winding BACK passes (drawn FIRST so the iron
              core's opaque fill occludes their middles, leaving only
              tabs at the OUTER overhang visible — the «wire goes
              behind the leg here» visual cue). */}
        <g
          stroke={svgTokens.fg}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={primary.back} />
          <path d={secondary.back} />
        </g>

        {/* ── Layer 3: Iron core ring with opaque hatch fill ─── */}
        <path
          d={`
            M ${CORE_OUTER_X} ${CORE_OUTER_Y}
            h ${CORE_OUTER_W} v ${CORE_OUTER_H} h ${-CORE_OUTER_W} Z
            M ${CORE_INNER_X} ${CORE_INNER_Y}
            h ${CORE_INNER_W} v ${CORE_INNER_H} h ${-CORE_INNER_W} Z
          `}
          fill="url(#lf-iron-hatch)"
          fillRule="evenodd"
          stroke={svgTokens.fg}
          strokeWidth="1.5"
        />

        {/* ── Layer 4: Main flux Φ_m loop following iron centerline,
              two segments so each carries its own arrow. */}
        <g
          stroke={svgTokens.note}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        >
          {/* Top half: bottom-left → up the left limb → across top → down right limb to mid-right */}
          <path
            d={`
              M ${LEFT_LIMB_CX} ${BOT_YOKE_CY}
              L ${LEFT_LIMB_CX} ${TOP_YOKE_CY}
              L ${RIGHT_LIMB_CX} ${TOP_YOKE_CY}
              L ${RIGHT_LIMB_CX} ${(TOP_YOKE_CY + BOT_YOKE_CY) / 2}
            `}
            markerEnd="url(#lf-arrow-main)"
          />
          {/* Bottom half: mid-right → continue down → across bottom → back up to start */}
          <path
            d={`
              M ${RIGHT_LIMB_CX} ${(TOP_YOKE_CY + BOT_YOKE_CY) / 2}
              L ${RIGHT_LIMB_CX} ${BOT_YOKE_CY}
              L ${LEFT_LIMB_CX} ${BOT_YOKE_CY}
              L ${LEFT_LIMB_CX} ${(TOP_YOKE_CY + BOT_YOKE_CY) / 2 + 1}
            `}
            markerEnd="url(#lf-arrow-main)"
          />
        </g>

        {/* ── Layer 5: Leakage flux Φ_l — dashed elliptical loop in
              the air window, positioned to clear the iron leg
              entirely. Two arcs to host two arrowheads. */}
        <g
          stroke={svgTokens.caution}
          strokeWidth="1.6"
          fill="none"
          strokeDasharray="4 3"
          strokeLinecap="round"
        >
          {/* Top arc — going right (counterclockwise along upper half) */}
          <path
            d="M 160 120 a 24 28 0 0 0 0 -56"
            markerEnd="url(#lf-arrow-leak)"
          />
          {/* Bottom arc — closing the loop (counterclockwise along lower half) */}
          <path
            d="M 160 64 a 24 28 0 0 0 0 56"
            markerEnd="url(#lf-arrow-leak)"
          />
        </g>

        {/* ── Layer 6: Winding FRONT passes (drawn LAST — visible on
              top of EVERYTHING, including main flux line. Reads as
              «wire wraps around the iron leg, with flux passing
              through the leg behind the wire» — physically correct.) */}
        <g
          stroke={svgTokens.fg}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={primary.front} />
          <path d={secondary.front} />
        </g>

        {/* ── Layer 7: Labels ──────────────────────────────────── */}
        <g
          fontSize={svgTokens.font.componentLabel}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fill={svgTokens.fg}
        >
          {/* Winding labels — placed below each limb */}
          <text x={LEFT_LIMB_CX} y={CORE_OUTER_Y + CORE_OUTER_H + 18} textAnchor="middle">
            {t('ch1_9.leakagePrimaryLabel')}
          </text>
          <text x={RIGHT_LIMB_CX} y={CORE_OUTER_Y + CORE_OUTER_H + 18} textAnchor="middle">
            {t('ch1_9.leakageSecondaryLabel')}
          </text>
        </g>

        {/* Inline flux labels — only the SYMBOLS, in their respective
            tones. Caption below carries full descriptive text. */}
        <g
          fontSize={svgTokens.font.componentLabel}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
        >
          {/* Main flux Φ_m — anchored above the top yoke, blue */}
          <text
            x={(LEFT_LIMB_CX + RIGHT_LIMB_CX) / 2}
            y={CORE_OUTER_Y - 8}
            textAnchor="middle"
            fill={svgTokens.note}
          >
            <tspan fontStyle="italic">Φ</tspan>
            <tspan baselineShift="sub" fontSize="0.75em">m</tspan>
          </text>

          {/* Leakage flux Φ_l — placed inside the dashed loop, orange.
              Loop interior centered around (148, 92) — its leftmost
              extent is at x=136, rightmost at x=160. */}
          <text x={146} y={96} textAnchor="middle" fill={svgTokens.caution}>
            <tspan fontStyle="italic">Φ</tspan>
            <tspan baselineShift="sub" fontSize="0.75em">l</tspan>
          </text>
        </g>
      </svg>
    </DiagramFigure>
  )
}

// ─────────────────────────────────────────────────────────────────
// Helical Bezier-path generator
// ─────────────────────────────────────────────────────────────────

/**
 * Generate a continuous helical winding as TWO concatenated Bezier
 * paths (FRONT half-periods + BACK half-periods).
 *
 *   Front half-periods: visible across the leg face (drawn LAST
 *     in the SVG, on top of the iron).
 *   Back  half-periods: pass behind the leg (drawn FIRST, before
 *     the iron's opaque fill, which occludes their middles —
 *     leaving only small tabs at the OUTER overhang visible).
 *
 * Each half-period is a single cubic Bezier from one side of the
 * leg to the other (x_start ↔ x_end), descending by `h = (yBot −
 * yTop) / (2·turns)`. Bezier control points have vertical tangents
 * at both endpoints (control x = endpoint x), so adjacent halves
 * join with no kinks at every leg-edge contact point — same trick
 * Ch1_9Hero uses.
 *
 *   xStart, xEnd: helix endpoints in x. The wire enters at xStart
 *     and the FIRST front pass goes xStart → xEnd. For primary on
 *     the LEFT limb, xStart=outer (left), xEnd=inner (right). For
 *     secondary on the RIGHT limb, xStart=outer (right), xEnd=inner
 *     (left) — both windings are visually mirrored helices.
 */
function helicalPaths({
  xStart,
  xEnd,
  yTop,
  yBot,
  turns,
}: {
  xStart: number
  xEnd: number
  yTop: number
  yBot: number
  turns: number
}): { front: string; back: string } {
  const totalHP = 2 * turns
  const h = (yBot - yTop) / totalHP
  const dy = h * HELIX_TANGENT
  const frontParts: string[] = []
  const backParts: string[] = []

  for (let i = 0; i < totalHP; i++) {
    const yA = yTop + i * h
    const yB = yA + h
    if (i % 2 === 0) {
      // Front pass: xStart → xEnd
      frontParts.push(
        `M ${xStart} ${yA.toFixed(2)} C ${xStart} ${(yA + dy).toFixed(2)}, ${xEnd} ${(yB - dy).toFixed(2)}, ${xEnd} ${yB.toFixed(2)}`,
      )
    } else {
      // Back pass: xEnd → xStart (descending the back side of the leg)
      backParts.push(
        `M ${xEnd} ${yA.toFixed(2)} C ${xEnd} ${(yA + dy).toFixed(2)}, ${xStart} ${(yB - dy).toFixed(2)}, ${xStart} ${yB.toFixed(2)}`,
      )
    }
  }

  return {
    front: frontParts.join(' '),
    back: backParts.join(' '),
  }
}
