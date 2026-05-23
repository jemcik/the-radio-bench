/**
 * Chapter 2.1 — wave polarisation.
 *
 * Three head-on views (the wave is coming straight at you, out of the
 * page). The dashed circle is the «end-on» wavefront; the orange arrow is
 * the electric field. Its orientation IS the polarisation:
 *   • vertical   — E up/down (a vertical whip antenna)
 *   • horizontal — E left/right (a horizontal dipole / Yagi)
 *   • circular   — E rotates around the path (helical antenna; satellites)
 *
 * Static snapshot — orientation, not motion (per diagram-quality §8).
 *
 * hardcoded-fontsize-file-ok: none — all <text> uses em tokens.
 */
import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const W = 600
const H = 200
const CY = 78
const R = 46
const A = 34 // arrow half-length
const HEAD_LEN = 9 // arrowhead length; shafts are recessed by this so they end
                   // at the head's base (never poke through the pointed tip)

const PANELS = ['vertical', 'horizontal', 'circular'] as const
const CXS = [110, 300, 490]

function head(x: number, y: number, dx: number, dy: number, color: string) {
  // Solid triangular arrowhead with tip at (x,y) pointing along unit (dx,dy).
  // Filled (not an open «V») so that on a curved shaft the shaft passes UNDER
  // the head — the eye reads one solid pointer instead of measuring the angle
  // between two thin barbs and the curve.
  const ux = dx, uy = dy
  const px = -uy, py = ux // perpendicular
  const back = HEAD_LEN, wide = 5
  const bx = x - ux * back, by = y - uy * back
  return (
    <polygon
      points={`${x},${y} ${bx + px * wide},${by + py * wide} ${bx - px * wide},${by - py * wide}`}
      fill={color} stroke={color} strokeWidth={1} strokeLinejoin="round"
    />
  )
}

export default function PolarisationDiagram() {
  const { t } = useTranslation('ui')
  const E = svgTokens.primary

  return (
    <DiagramFigure caption={t('ch2_1.polar.caption')}>
      <SVGDiagram
        width={W}
        height={H}
        style={{ maxWidth: W, margin: '0 auto' }}
        fontFamily="inherit"
        aria-label={t('ch2_1.polar.ariaLabel')}
      >
        {PANELS.map((kind, i) => {
          const cx = CXS[i]
          return (
            <g key={kind}>
              {/* end-on wavefront */}
              <circle cx={cx} cy={CY} r={R} fill="none" stroke={svgTokens.border} strokeWidth={1.2} strokeDasharray="3 3" />

              {/* E-field orientation */}
              {kind === 'vertical' && (
                <>
                  <line x1={cx} y1={CY - A + HEAD_LEN} x2={cx} y2={CY + A - HEAD_LEN} stroke={E} strokeWidth={2.6} strokeLinecap="round" />
                  {head(cx, CY - A, 0, -1, E)}
                  {head(cx, CY + A, 0, 1, E)}
                </>
              )}
              {kind === 'horizontal' && (
                <>
                  <line x1={cx - A + HEAD_LEN} y1={CY} x2={cx + A - HEAD_LEN} y2={CY} stroke={E} strokeWidth={2.6} strokeLinecap="round" />
                  {head(cx - A, CY, -1, 0, E)}
                  {head(cx + A, CY, 1, 0, E)}
                </>
              )}
              {kind === 'circular' && (() => {
                // Clockwise arc for the rotating E-field, head at the end.
                // Curvature gotcha: on a tight arc the tangent at the very tip
                // is NOT the direction the line runs over the arrowhead's
                // length, so a tangent-built head looks lopsided (one barb
                // merges into the curve). Build the head on the CHORD across the
                // arrowhead's span instead — then both barbs make equal angles
                // with the line. Screen coords (y down): point = (cos a, sin a).
                // Align the head's axis to the chord across HALF the head's
                // length: that splits the irreducible curvature error evenly
                // between the tip and the base, minimising the worst-case angle
                // mismatch (vs aligning to the tip tangent or the full chord).
                const HALF = 5 // ≈ half the head length, for the axis chord
                const end = (292 * Math.PI) / 180 // head a little past 12 o'clock
                const a0 = end - HALF / A
                const ex = cx + A * Math.cos(end) // triangle tip (true end angle)
                const ey = CY + A * Math.sin(end)
                const bx = cx + A * Math.cos(a0)
                const by = CY + A * Math.sin(a0)
                const m = Math.hypot(ex - bx, ey - by)
                // Stop the drawn arc at the head's base so the shaft never poked
                // through the pointed tip; the triangle covers the join.
                const arcEnd = end - HEAD_LEN / A
                const rx = cx + A * Math.cos(arcEnd)
                const ry = CY + A * Math.sin(arcEnd)
                return (
                  <>
                    <path
                      d={`M ${cx + A} ${CY} A ${A} ${A} 0 1 1 ${rx.toFixed(2)} ${ry.toFixed(2)}`}
                      fill="none" stroke={E} strokeWidth={2.6} strokeLinecap="round"
                    />
                    {head(ex, ey, (ex - bx) / m, (ey - by) / m, E)}
                  </>
                )
              })()}

              {/* labels */}
              <text x={cx} y={CY + R + 26} textAnchor="middle" fontSize="0.875em" fontWeight={600} fill={svgTokens.fg}>
                {t(`ch2_1.polar.${kind}`)}
              </text>
              <text x={cx} y={CY + R + 44} textAnchor="middle" fontSize="0.75em" fill={svgTokens.mutedFg}>
                {t(`ch2_1.polar.${kind}Ant`)}
              </text>
            </g>
          )
        })}
      </SVGDiagram>
    </DiagramFigure>
  )
}
