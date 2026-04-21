import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

/**
 * Chapter 0.3 — Ohm's Law Triangle
 *
 * Classic triangle shape:
 *
 *          /\
 *         / V \
 *        /─────\
 *       / I │ R \
 *      /____│____\
 *
 * Cover V → I × R (side by side = multiply)
 * Cover I → V / R (top over bottom = divide)
 * Cover R → V / I (top over bottom = divide)
 *
 * Shown three times, each with one variable highlighted.
 */

export default function FormulaTriangleDiagram() {
  const { t } = useTranslation('ui')

  const W = 620, H = 210

  const cases = [
    { covered: 'V', formula: 'V = I × R', label: t('ch0_3.findV') },
    { covered: 'I', formula: 'I = V ÷ R', label: t('ch0_3.findI') },
    { covered: 'R', formula: 'R = V ÷ I', label: t('ch0_3.findR') },
  ]

  // Triangle geometry
  const triW = 140       // base width
  const triH = 115       // height from apex to base
  const gap = 45         // horizontal gap between triangles
  const totalW = cases.length * triW + (cases.length - 1) * gap
  const offsetX = (W - totalW) / 2
  const topY = 8         // apex Y
  const baseY = topY + triH
  const dividerY = topY + triH * 0.52  // horizontal line at ~52% — gives V more room

  const { primary, fg, border, mutedFg: muted } = svgTokens

  // For a given triangle at center cx, compute the left/right x at a given y
  const edgeX = (cx: number, y: number) => {
    // Triangle: apex at (cx, topY), base from (cx - triW/2, baseY) to (cx + triW/2, baseY)
    const ratio = (y - topY) / triH  // 0 at apex, 1 at base
    const halfW = (triW / 2) * ratio
    return { left: cx - halfW, right: cx + halfW }
  }

  return (
    <DiagramFigure caption={t('ch0_3.formulaTriangleCaption')}>
      <SVGDiagram
        width={W} height={H}
        style={{ maxWidth: W, margin: '0 auto' }}
        fontFamily="inherit"
        aria-label={t('ch0_3.formulaTriangleAria')}
      >
          {cases.map((c, i) => {
            const cx = offsetX + triW / 2 + i * (triW + gap)
            const apex = { x: cx, y: topY }
            const bl = { x: cx - triW / 2, y: baseY }
            const br = { x: cx + triW / 2, y: baseY }
            const div = edgeX(cx, dividerY)

            // Centers of the three sections
            const topCenterY = topY + (dividerY - topY) * 0.6 + 6
            const botCenterY = (dividerY + baseY) / 2 + 6
            const botLeftCx = (div.left + cx) / 2
            const botRightCx = (cx + div.right) / 2

            return (
              <g key={i}>
                {/* ── Highlight backgrounds ── */}
                {c.covered === 'V' && (
                  <path
                    d={`M ${apex.x} ${apex.y} L ${div.left} ${dividerY} L ${div.right} ${dividerY} Z`}
                    fill={primary} fillOpacity="0.85" rx="4"
                  />
                )}
                {c.covered === 'I' && (
                  <path
                    d={`M ${div.left} ${dividerY} L ${bl.x} ${baseY} L ${cx} ${baseY} L ${cx} ${dividerY} Z`}
                    fill={primary} fillOpacity="0.85"
                  />
                )}
                {c.covered === 'R' && (
                  <path
                    d={`M ${cx} ${dividerY} L ${cx} ${baseY} L ${br.x} ${baseY} L ${div.right} ${dividerY} Z`}
                    fill={primary} fillOpacity="0.85"
                  />
                )}

                {/* ── Triangle outline ── */}
                <path
                  d={`M ${apex.x} ${apex.y} L ${bl.x} ${baseY} L ${br.x} ${baseY} Z`}
                  fill="none" stroke={border} strokeWidth="1.5"
                />

                {/* ── Horizontal divider ── */}
                <line x1={div.left} y1={dividerY} x2={div.right} y2={dividerY}
                  stroke={border} strokeWidth="1" />

                {/* ── Vertical divider (bottom half) ── */}
                <line x1={cx} y1={dividerY} x2={cx} y2={baseY}
                  stroke={border} strokeWidth="1" />

                {/* ── V (top section) ── */}
                <text x={cx} y={topCenterY}
                  textAnchor="middle" fontSize="1.375em" fontWeight="700"
                  fill={c.covered === 'V' ? 'white' : fg}>
                  V
                </text>

                {/* ── I (bottom-left) ── */}
                <text x={botLeftCx} y={botCenterY}
                  textAnchor="middle" fontSize="1.25em" fontWeight="700"
                  fill={c.covered === 'I' ? 'white' : fg}>
                  I
                </text>

                {/* ── R (bottom-right) ── */}
                <text x={botRightCx} y={botCenterY}
                  textAnchor="middle" fontSize="1.25em" fontWeight="700"
                  fill={c.covered === 'R' ? 'white' : fg}>
                  R
                </text>

                {/* ── Label + formula below ── */}
                <text x={cx} y={baseY + 18}
                  textAnchor="middle" fontSize="0.687em" fontWeight="600" fill={muted}>
                  {c.label}
                </text>
                <text x={cx} y={baseY + 34}
                  textAnchor="middle" fontSize="0.812em" fontWeight="700"
                  fontFamily="monospace" fill={fg}>
                  {c.formula}
                </text>
              </g>
            )
          })}
      </SVGDiagram>
    </DiagramFigure>
  )
}
