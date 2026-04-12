import SVGDiagram from './SVGDiagram'

/**
 * Chapter 0.2 — Breadboard anatomy
 *
 * Key fact visualised:
 *   Power rails  → connected HORIZONTALLY (full length, + and −)
 *   Tie-point rows → connected VERTICALLY in groups of 5 (a–e for one column,
 *                    f–j for the mirrored column across the gap)
 *
 * A highlighted column group shows exactly which holes share one node.
 */
export default function BreadboardDiagram() {
  const W = 520, H = 220

  // Board body
  const bx = 16, by = 16, bw = 488, bh = 188

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

  return (
    <figure className="my-8 not-prose">
      <div className="rounded-xl border border-border bg-muted/40 p-4 overflow-x-auto">
        <SVGDiagram
          width={W} height={H}
          style={{ maxWidth: W, margin: '0 auto' }}
          fontFamily="inherit"
          aria-label="Breadboard anatomy: power rails run horizontally, tie-point columns connect 5 holes vertically"
        >
          {/* ── Board body ──────────────────────────────────────────── */}
          <rect x={bx} y={by} width={bw} height={bh} rx="6"
            fill="hsl(142 22% 30%)" />

          {/* ── Power rail backgrounds ───────────────────────────── */}
          {[topRailY, btmRailY].map((ry, i) => (
            <rect key={i} x={bx + 4} y={ry} width={bw - 8} height={railH}
              rx="3" fill="hsl(142 18% 24%)" />
          ))}

          {/* Rail stripes: red (+) and blue (−) */}
          {[topRailY, btmRailY].map((ry, i) => (
            <g key={i}>
              <line
                x1={holeStartX - 4} y1={ry + railH * 0.35}
                x2={holeStartX + (numCols - 1) * colStep + 4} y2={ry + railH * 0.35}
                stroke="hsl(0 70% 52%)" strokeWidth="1.5" opacity="0.45" strokeDasharray="7 4" />
              <line
                x1={holeStartX - 4} y1={ry + railH * 0.7}
                x2={holeStartX + (numCols - 1) * colStep + 4} y2={ry + railH * 0.7}
                stroke="hsl(221 80% 58%)" strokeWidth="1.5" opacity="0.45" strokeDasharray="7 4" />
              {/* + / − labels */}
              <text x={labelX + 2} y={ry + railH * 0.35 + 3}
                fontSize="10" fontWeight="700" fill="hsl(0 70% 60%)" textAnchor="middle">+</text>
              <text x={labelX + 2} y={ry + railH * 0.7 + 3}
                fontSize="10" fontWeight="700" fill="hsl(221 80% 65%)" textAnchor="middle">−</text>
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
                  fill="hsl(142 16% 20%)"
                  stroke="hsl(142 16% 42%)" strokeWidth="0.7" />
              ))
            )
          )}

          {/* ── Middle gap label ─────────────────────────────────── */}
          <text
            x={bx + bw / 2}
            y={tieTop + halfH + midGapH / 2 + 3}
            textAnchor="middle" fontSize="10"
            fill="hsl(142 30% 72%)">
            ← DIP gap — separates the two sides →
          </text>

          {/* ── Row labels ───────────────────────────────────────── */}
          {topRows.map((label, ri) => (
            <text key={label}
              x={labelX} y={tieTop + ri * rowStep + 4}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill="hsl(142 30% 82%)">{label}</text>
          ))}
          {btmRows.map((label, ri) => (
            <text key={label}
              x={labelX} y={tieBtm + ri * rowStep + 4}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill="hsl(142 30% 82%)">{label}</text>
          ))}

          {/* ── Tie-point holes ──────────────────────────────────── */}
          {/* Top half (a–e) */}
          {Array.from({ length: numRows }).map((_, ri) =>
            Array.from({ length: numCols }).map((_, ci) => (
              <circle key={`t-${ri}-${ci}`}
                cx={holeStartX + ci * colStep}
                cy={tieTop + ri * rowStep}
                r={holeR}
                fill="hsl(142 16% 20%)"
                stroke="hsl(142 16% 42%)" strokeWidth="0.7" />
            ))
          )}
          {/* Bottom half (f–j) */}
          {Array.from({ length: numRows }).map((_, ri) =>
            Array.from({ length: numCols }).map((_, ci) => (
              <circle key={`b-${ri}-${ci}`}
                cx={holeStartX + ci * colStep}
                cy={tieBtm + ri * rowStep}
                r={holeR}
                fill="hsl(142 16% 20%)"
                stroke="hsl(142 16% 42%)" strokeWidth="0.7" />
            ))
          )}

          {/* ── Column number ticks (every 5) ────────────────────── */}
          {[1, 5, 10, 15, 20, 25, 30].map(n => (
            <text key={n}
              x={holeStartX + (n - 1) * colStep}
              y={by + bh - 3}
              textAnchor="middle" fontSize="9"
              fill="hsl(142 25% 65%)">{n}</text>
          ))}

          {/* ── Highlighted column group (col hlColNum, rows a–e) ─── */}
          {/* Vertical highlight bar */}
          <rect
            x={hlX - holeR - 2}
            y={tieTop - holeR - 2}
            width={holeR * 2 + 4}
            height={(numRows - 1) * rowStep + holeR * 2 + 4}
            rx="4"
            fill="hsl(38 92% 50%)" fillOpacity="0.18"
            stroke="hsl(38 92% 50%)" strokeWidth="1.2" strokeOpacity="0.6"
          />
          {/* Re-draw those holes on top so they're visible */}
          {Array.from({ length: numRows }).map((_, ri) => (
            <circle key={`hl-${ri}`}
              cx={hlX}
              cy={tieTop + ri * rowStep}
              r={holeR}
              fill="hsl(38 92% 50%)" fillOpacity="0.35"
              stroke="hsl(38 92% 50%)" strokeWidth="1" strokeOpacity="0.8" />
          ))}

          {/* Bracket from top to bottom of highlight, with label */}
          <line
            x1={hlX + holeR + 10} y1={tieTop}
            x2={hlX + holeR + 10} y2={tieTop + (numRows - 1) * rowStep}
            stroke="hsl(38 92% 55%)" strokeWidth="1.2" />
          <line
            x1={hlX + holeR + 6}  y1={tieTop}
            x2={hlX + holeR + 14} y2={tieTop}
            stroke="hsl(38 92% 55%)" strokeWidth="1.2" />
          <line
            x1={hlX + holeR + 6}  y1={tieTop + (numRows - 1) * rowStep}
            x2={hlX + holeR + 14} y2={tieTop + (numRows - 1) * rowStep}
            stroke="hsl(38 92% 55%)" strokeWidth="1.2" />
          <text
            x={hlX + holeR + 18}
            y={tieTop + ((numRows - 1) * rowStep) / 2 - 5}
            fontSize="11" fill="hsl(38 92% 55%)" fontWeight="600">
            col {hlColNum}
          </text>
          <text
            x={hlX + holeR + 18}
            y={tieTop + ((numRows - 1) * rowStep) / 2 + 6}
            fontSize="10" fill="hsl(38 92% 55%)" opacity="0.8">
            a–e: one node
          </text>
        </SVGDiagram>
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">
        Breadboard anatomy.{' '}
        <span style={{ color: 'hsl(0 70% 55%)' }}>Red</span>/
        <span style={{ color: 'hsl(221 80% 60%)' }}>blue</span> rails run the full length
        (power &amp; ground). In the main area, the <strong>5 holes in each column</strong> (a–e,
        or f–j) share one electrical node — inserting two legs into the same column connects them.
      </figcaption>
    </figure>
  )
}
