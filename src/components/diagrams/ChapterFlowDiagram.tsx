/**
 * Chapter 0.1 — How a chapter is structured
 * Shows the Concept → Formula → Widget → Lab → Quiz flow.
 */
import SVGDiagram from './SVGDiagram'

export default function ChapterFlowDiagram() {
  const steps = [
    { label: 'Analogy', sub: 'Real-world hook', color: 'hsl(38 92% 50%)',  w: 120 },
    { label: 'Formula', sub: 'Made precise',    color: 'hsl(38 92% 50%)',  w: 104 },
    { label: 'Widget',  sub: 'Interactive',     color: 'hsl(221 83% 53%)', w: 104 },
    { label: 'Lab',     sub: 'Optional ✦',      color: 'hsl(172 66% 40%)', w: 96  },
    { label: 'Quiz',    sub: 'Check recall',    color: 'hsl(250 60% 60%)', w: 100 },
  ]

  const BOX_H  = 56
  const GAP    = 32   // space between box edges where the arrow lives
  const PAD_X  = 20
  const PAD_Y  = 20
  const TOTAL_W = PAD_X * 2 + steps.reduce((s, st) => s + st.w, 0) + (steps.length - 1) * GAP
  const TOTAL_H = BOX_H + PAD_Y * 2
  const CY = PAD_Y + BOX_H / 2

  // Pre-compute X positions based on variable widths
  const boxXs: number[] = []
  let cursor = PAD_X
  for (const step of steps) {
    boxXs.push(cursor)
    cursor += step.w + GAP
  }

  return (
    <figure className="my-8 not-prose">
      <div className="rounded-xl border border-border bg-muted/40 p-4 overflow-x-auto">
        <SVGDiagram
          width={TOTAL_W} height={TOTAL_H}
          style={{ maxWidth: TOTAL_W, margin: '0 auto' }}
          aria-label="Chapter structure flow: Analogy → Formula → Widget → Lab → Quiz"
        >
          {steps.map((step, i) => {
            const boxX = boxXs[i]
            const boxW = step.w
            // Arrow: shaft from previous box edge to just before this box
            const ax1 = boxX - GAP + 2   // shaft start
            const ax2 = boxX - 5         // chevron tip
            const headLen = 7
            const headW = 5

            return (
              <g key={step.label}>
                {/* Arrow — single path, no marker opacity mismatch */}
                {i > 0 && (
                  <path
                    d={[
                      `M ${ax1} ${CY}`,
                      `L ${ax2} ${CY}`,
                      `M ${ax2 - headLen} ${CY - headW}`,
                      `L ${ax2} ${CY}`,
                      `L ${ax2 - headLen} ${CY + headW}`,
                    ].join(' ')}
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.3"
                  />
                )}

                {/* Box */}
                <rect
                  x={boxX} y={PAD_Y}
                  width={boxW} height={BOX_H}
                  rx="10"
                  fill={step.color}
                  fillOpacity="0.12"
                  stroke={step.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />

                {/* Label */}
                <text
                  x={boxX + boxW / 2}
                  y={CY - 7}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="600"
                  fontFamily="inherit"
                  fill={step.color}
                >
                  {step.label}
                </text>

                {/* Sub-label */}
                <text
                  x={boxX + boxW / 2}
                  y={CY + 10}
                  textAnchor="middle"
                  fontSize="12"
                  fontFamily="inherit"
                  fill="currentColor"
                  opacity="0.45"
                >
                  {step.sub}
                </text>
              </g>
            )
          })}
        </SVGDiagram>
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">
        Every chapter follows this structure. Lab activities are optional; everything else is always present.
      </figcaption>
    </figure>
  )
}
