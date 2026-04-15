import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { useTheme } from '@/context/ThemeContext'
import { THEMES } from '@/lib/themes'

/**
 * Chapter 0.2 — Breadboard anatomy
 *
 * Key fact visualised:
 *   Power rails  → connected HORIZONTALLY (full length, + and −)
 *   Tie-point rows → connected VERTICALLY in groups of 5 (a–e for one column,
 *                    f–j for the mirrored column across the gap)
 *
 * A highlighted column group shows exactly which holes share one node.
 *
 * DECORATIVE COLOUR EXCEPTION (per CLAUDE.md): this file paints a
 * recognisable solderless breadboard. Two hand-tuned palettes — a cream
 * "white" breadboard for light themes, a charcoal "black" breadboard for
 * dark themes. Both colour variants are real products sold today; we
 * switch based on the theme's light/dark nature so the object doesn't
 * glow against a page of opposite brightness. The stripe ink (red/blue),
 * the hole pattern, and the amber "col 9" highlight keep the same visual
 * role in both palettes.
 */
export default function BreadboardDiagram() {
  const { t } = useTranslation('ui')
  const { theme } = useTheme()
  const isDark = THEMES.find(th => th.id === theme)?.isDark ?? false

  const c = isDark ? {
    // "Black" breadboard (real product — darker phenolic plastic).
    body:        'hsl(220 8% 25%)',
    bodyStroke:  'hsl(220 10% 38%)',
    rail:        'hsl(220 8% 30%)',
    holeFill:    'hsl(220 12% 12%)',
    holeStroke:  'hsl(220 8% 48%)',
    redInk:      'hsl(0 75% 60%)',     // brighter on dark plastic
    blueInk:     'hsl(221 80% 65%)',
    redLabel:    'hsl(0 75% 65%)',
    blueLabel:   'hsl(221 80% 70%)',
    dipGap:      'hsl(220 8% 65%)',
    rowLabel:    'hsl(220 10% 72%)',
    colNum:      'hsl(220 8% 60%)',
    hlAmber:     'hsl(38 92% 60%)',    // brighter amber on dark
    hlFill:      'hsl(38 92% 50%)',
    hlFillAlpha: 0.22,
  } : {
    // "White/cream" breadboard (the most common retail colour).
    body:        'hsl(40 15% 94%)',
    bodyStroke:  'hsl(40 10% 82%)',
    rail:        'hsl(40 15% 89%)',
    holeFill:    'hsl(220 10% 18%)',
    holeStroke:  'hsl(220 8% 38%)',
    redInk:      'hsl(0 75% 50%)',
    blueInk:     'hsl(221 80% 50%)',
    redLabel:    'hsl(0 75% 45%)',
    blueLabel:   'hsl(221 80% 45%)',
    dipGap:      'hsl(220 8% 45%)',
    rowLabel:    'hsl(220 10% 30%)',
    colNum:      'hsl(220 8% 42%)',
    hlAmber:     'hsl(25 75% 35%)',    // darker amber for cream bg
    hlFill:      'hsl(38 92% 50%)',
    hlFillAlpha: 0.22,
  }
  // The viewBox carries padding on BOTH sides of the board plastic:
  //   top  (y 0…by): room for the "col 9 — one node" callout that
  //         sits ABOVE the board, connected by a short leader line.
  //         Earlier the callout lived inside the hole grid and fought
  //         the dot pattern for legibility — moving it outside was
  //         the only reliable fix.
  //   bottom (y by+bh…H): room for the column-number ticks so they
  //         don't overlap the bottom rail's red/blue stripe dashes.
  const W = 520, H = 256

  // Board body — `by = 40` leaves 40 px above for the callout.
  const bx = 16, by = 40, bw = 488, bh = 188

  // Hole geometry
  const holeR   = 3.2
  const colStep = 14        // spacing between columns
  const rowStep = 12        // spacing between rows (a-e)
  const numCols = 30
  const numRows = 5         // a-e (top half), f-j (bottom half)

  // Layout inside board
  const railH     = 18
  const railGap   = 6       // gap between rail and tie-point area
  const topRailY  = by + 5
  const btmRailY  = by + bh - 5 - railH

  const tieTop    = topRailY + railH + railGap   // first row 'a'
  const midGapH   = 14                            // gap between halves
  const halfH     = numRows * rowStep             // height of one half
  const tieBtm    = tieTop + halfH + midGapH      // first row 'f'

  // Left margin for row labels, then holes start
  const labelX    = bx + 10
  const holeStartX = labelX + 18

  // Row labels
  const topRows = ['a','b','c','d','e']
  const btmRows = ['f','g','h','i','j']

  // Highlighted column for the "these share one node" callout
  const hlCol     = 8                              // 0-indexed
  const hlX       = holeStartX + hlCol * colStep
  const hlColNum  = hlCol + 1                      // human label

  const caption = (
    <>
      {t('ch0_2.breadboardCaption1')}{' '}
      <span style={{ color: c.redLabel }}>{t('ch0_2.breadboardRed')}</span>/
      <span style={{ color: c.blueLabel }}>{t('ch0_2.breadboardBlue')}</span> {t('ch0_2.breadboardCaptionRails')}{' '}
      {t('ch0_2.breadboardCaption5holes')}{' '}
      {t('ch0_2.breadboardCaptionNode')}
    </>
  )

  return (
    <DiagramFigure caption={caption}>
      <SVGDiagram
        width={W} height={H}
        style={{ maxWidth: W, margin: '0 auto' }}
        fontFamily="inherit"
        aria-label={t('ch0_2.breadboardAria')}
        >
          {/* ── Board body (cream plastic) ─────────────────────────── */}
          {/* A subtle stroke keeps the board edge visible against the
              card background behind it (which is itself a light muted tint). */}
          <rect x={bx} y={by} width={bw} height={bh} rx="6"
            fill={c.body}
            stroke={c.bodyStroke} strokeWidth="0.8" />

          {/* ── Power rail backgrounds (slightly darker cream) ───── */}
          {[topRailY, btmRailY].map((ry, i) => (
            <rect key={i} x={bx + 4} y={ry} width={bw - 8} height={railH}
              rx="3" fill={c.rail} />
          ))}

          {/* Rail stripes: red (+) and blue (−) — solid ink on cream */}
          {[topRailY, btmRailY].map((ry, i) => (
            <g key={i}>
              <line
                x1={holeStartX - 4} y1={ry + railH * 0.35}
                x2={holeStartX + (numCols - 1) * colStep + 4} y2={ry + railH * 0.35}
                stroke={c.redInk} strokeWidth="1.5" opacity="0.75" strokeDasharray="7 4" />
              <line
                x1={holeStartX - 4} y1={ry + railH * 0.7}
                x2={holeStartX + (numCols - 1) * colStep + 4} y2={ry + railH * 0.7}
                stroke={c.blueInk} strokeWidth="1.5" opacity="0.75" strokeDasharray="7 4" />
              {/* + / − labels */}
              <text x={labelX + 2} y={ry + railH * 0.35 + 3}
                fontSize="10" fontWeight="700" fill={c.redLabel} textAnchor="middle">+</text>
              <text x={labelX + 2} y={ry + railH * 0.7 + 3}
                fontSize="10" fontWeight="700" fill={c.blueLabel} textAnchor="middle">−</text>
            </g>
          ))}

          {/* Rail holes */}
          {[topRailY, btmRailY].map((ry, ri) =>
            Array.from({ length: numCols }).map((_, ci) =>
              [railH * 0.35, railH * 0.7].map((yo, pi) => (
                <circle key={`rail-${ri}-${ci}-${pi}`}
                  cx={holeStartX + ci * colStep}
                  cy={ry + yo}
                  r={holeR - 0.5}
                  fill={c.holeFill}
                  stroke={c.holeStroke} strokeWidth="0.7" />
              ))
            )
          )}

          {/* ── Middle gap label ─────────────────────────────────── */}
          {/* Baseline sits 3 px ABOVE the geometric mid-gap point so the
              text's visual centre (which sits ~3 px above baseline for
              typical fonts) lands exactly on the mid-gap line between
              row 'e' and row 'f'. */}
          <text
            x={bx + bw / 2}
            y={tieTop + halfH + midGapH / 2 - 3}
            textAnchor="middle" fontSize="10"
            fill={c.dipGap}>
            {t('ch0_2.breadboardDipGap')}
          </text>

          {/* ── Row labels ───────────────────────────────────────── */}
          {topRows.map((label, ri) => (
            <text key={label}
              x={labelX} y={tieTop + ri * rowStep + 4}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill={c.rowLabel}>{label}</text>
          ))}
          {btmRows.map((label, ri) => (
            <text key={label}
              x={labelX} y={tieBtm + ri * rowStep + 4}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill={c.rowLabel}>{label}</text>
          ))}

          {/* ── Tie-point holes ──────────────────────────────────── */}
          {/* Top half (a–e) */}
          {Array.from({ length: numRows }).map((_, ri) =>
            Array.from({ length: numCols }).map((_, ci) => (
              <circle key={`t-${ri}-${ci}`}
                cx={holeStartX + ci * colStep}
                cy={tieTop + ri * rowStep}
                r={holeR}
                fill={c.holeFill}
                stroke={c.holeStroke} strokeWidth="0.7" />
            ))
          )}
          {/* Bottom half (f–j) */}
          {Array.from({ length: numRows }).map((_, ri) =>
            Array.from({ length: numCols }).map((_, ci) => (
              <circle key={`b-${ri}-${ci}`}
                cx={holeStartX + ci * colStep}
                cy={tieBtm + ri * rowStep}
                r={holeR}
                fill={c.holeFill}
                stroke={c.holeStroke} strokeWidth="0.7" />
            ))
          )}

          {/* ── Column number ticks (every 5) ────────────────────── */}
          {/* Sitting below the board at y = by+bh+10 so the glyphs don't
              overlap the bottom-rail's red/blue stripe dashes. fontSize 11
              = the diagram-text floor from CLAUDE.md. */}
          {[1, 5, 10, 15, 20, 25, 30].map(n => (
            <text key={n}
              x={holeStartX + (n - 1) * colStep}
              y={by + bh + 14}
              textAnchor="middle" fontSize="11"
              fill={c.colNum}>{n}</text>
          ))}

          {/* ── Highlighted column group (col hlColNum, rows a–e) ─── */}
          {/* Vertical highlight bar */}
          <rect
            x={hlX - holeR - 2}
            y={tieTop - holeR - 2}
            width={holeR * 2 + 4}
            height={(numRows - 1) * rowStep + holeR * 2 + 4}
            rx="4"
            fill={c.hlFill} fillOpacity={c.hlFillAlpha}
            stroke={c.hlAmber} strokeWidth="1.2" strokeOpacity="0.75"
          />
          {/* Re-draw those holes on top so they're visible */}
          {Array.from({ length: numRows }).map((_, ri) => (
            <circle key={`hl-${ri}`}
              cx={hlX}
              cy={tieTop + ri * rowStep}
              r={holeR}
              fill={c.hlFill} fillOpacity="0.35"
              stroke={c.hlFill} strokeWidth="1" strokeOpacity="0.8" />
          ))}

          {/* ── Column-9 callout (above the board) ──────────────────
              Previous design placed the label + bracket inside the hole
              grid. Any colour choice fought the dot pattern behind it
              (amber vanished on cream; darker ink got noisy amongst the
              black tie-points). The label now sits in the top padding
              area OUTSIDE the plastic, with a short leader line pointing
              down to the amber halo. The column-alignment of the leader
              + the halo carry the "which column" meaning inside the
              board — no in-grid text required. */}
          <text
            x={hlX} y={22}
            textAnchor="middle"
            fontSize="12" fontWeight="600"
            fill={c.hlAmber}>
            {`${t('ch0_2.breadboardCol', { num: hlColNum })} — ${t('ch0_2.breadboardNode')}`}
          </text>
          {/* Leader line from label down to the top edge of the board */}
          <line
            x1={hlX} y1={28}
            x2={hlX} y2={by - 2}
            stroke={c.hlAmber} strokeWidth="1.2" />
          {/* Small arrowhead pointing down onto the board */}
          <polyline
            points={`${hlX - 3},${by - 5} ${hlX},${by - 1} ${hlX + 3},${by - 5}`}
            fill="none"
            stroke={c.hlAmber} strokeWidth="1.2"
            strokeLinecap="round" strokeLinejoin="round" />
      </SVGDiagram>
    </DiagramFigure>
  )
}
