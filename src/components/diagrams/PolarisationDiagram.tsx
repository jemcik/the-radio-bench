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

const PANELS = ['vertical', 'horizontal', 'circular'] as const
const CXS = [110, 300, 490]

function head(x: number, y: number, dx: number, dy: number, color: string) {
  // small arrowhead pointing along (dx,dy) (unit-ish), at tip (x,y)
  const ux = dx, uy = dy
  const px = -uy, py = ux // perpendicular
  const back = 9, wide = 5
  const bx = x - ux * back, by = y - uy * back
  return (
    <polyline
      points={`${bx + px * wide},${by + py * wide} ${x},${y} ${bx - px * wide},${by - py * wide}`}
      fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
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
                  <line x1={cx} y1={CY - A} x2={cx} y2={CY + A} stroke={E} strokeWidth={2.6} strokeLinecap="round" />
                  {head(cx, CY - A, 0, -1, E)}
                  {head(cx, CY + A, 0, 1, E)}
                </>
              )}
              {kind === 'horizontal' && (
                <>
                  <line x1={cx - A} y1={CY} x2={cx + A} y2={CY} stroke={E} strokeWidth={2.6} strokeLinecap="round" />
                  {head(cx - A, CY, -1, 0, E)}
                  {head(cx + A, CY, 1, 0, E)}
                </>
              )}
              {kind === 'circular' && (
                <>
                  {/* ~300° arc to suggest rotation */}
                  <path
                    d={`M ${cx + A} ${CY} A ${A} ${A} 0 1 1 ${cx} ${CY - A}`}
                    fill="none" stroke={E} strokeWidth={2.6} strokeLinecap="round"
                  />
                  {head(cx, CY - A, -1, 0, E)}
                </>
              )}

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
