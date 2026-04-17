# Plotted curves

When a diagram plots a function that can leave the chart rectangle — Bode roll-off, exponential decay, resonant peak — two failure modes keep appearing. This document gives you the boilerplate to avoid both.

## Failure 1: curve draws outside the plot rectangle

Without a `<clipPath>`, SVG `<path>` elements keep drawing wherever the coordinates send them. An RC low-pass roll-off plotted on a linear dB axis dives below the −60 dB floor, and the `<path>` happily draws through your x-axis labels, your footnote, and sometimes the next section's heading.

## Failure 2: clamping to the boundary creates a false plateau

The naive fix — "clamp y to the floor when it goes below" — is wrong. A segment glued along the bottom edge reads as *"the function is flat at the floor here"*, which is a lie. The function is continuing past the edge; the plot simply can't show it. Users see a plateau and ask "why is the filter perfectly flat at −60 dB from 600 kHz onward?"

The right behaviour is **truncate at the boundary**. Linearly interpolate the exact crossing point, draw the path to that crossing point, and stop (or, for non-monotonic functions, emit an `M` to skip the off-screen region and resume when back in range). Visually the curve exits through the edge, which is the universally-understood "off the chart" indicator.

## Boilerplate

### Step 1 — unique clipPath id

Static `id="myplot-clip"` breaks when the widget appears twice on one page. Always derive the id from `useId()`:

```tsx
import { useId } from 'react'

export default function MyPlot() {
  const uid = useId().replace(/:/g, '')
  const clipId = `myplot-${uid}`
  // ...
}
```

`useId()` returns strings like `:r0:` which aren't valid in SVG id attributes as-is — strip the colons.

### Step 2 — clipPath in `<defs>`

```tsx
<SVGDiagram width={W} height={H} aria-label={t('...')}>
  <defs>
    <clipPath id={clipId}>
      <rect x={PAD_L} y={PAD_T} width={plotW} height={plotH} />
    </clipPath>
  </defs>

  {/* ...axes, gridlines, labels... */}

  <path
    d={curvePath}
    stroke="hsl(var(--primary))"
    strokeWidth="1.5"
    fill="none"
    clipPath={`url(#${clipId})`}
  />
</SVGDiagram>
```

**Putting `<defs>` inside the `<g>` wrapper** that `SVGDiagram` already applies around its children is fragile — some renderers refuse to resolve the inner id. Keep `<defs>` at the top level inside `SVGDiagram`. The wrapper's internal clipPath (the overflow guard) and yours are independent.

### Step 3 — truncate-at-boundary in path generation

```tsx
function buildCurvePath(xValues: number[]): string {
  const pts: string[] = []
  let prevX: number | null = null
  let prevY: number | null = null

  for (const x of xValues) {
    const raw = computeValue(x)              // the function you're plotting
    const xPx = xScale(x)                    // map to pixel x
    const yPx = yScale(raw)                  // map to pixel y

    // If we've crossed the bottom boundary, interpolate the crossing
    // and stop. For non-monotonic: emit 'M' to skip and resume below.
    if (yPx > Y_MAX) {
      if (prevX !== null && prevY !== null) {
        const t = (Y_MAX - prevY) / (yPx - prevY)
        const xc = prevX + t * (xPx - prevX)
        pts.push(`L${xc.toFixed(2)},${Y_MAX}`)
      }
      break  // monotonic — no point continuing
    }

    pts.push(`${pts.length === 0 ? 'M' : 'L'}${xPx.toFixed(2)},${yPx.toFixed(2)}`)
    prevX = xPx
    prevY = yPx
  }

  return pts.join(' ')
}
```

For a two-sided truncation (curve can exit through either edge), run the same interpolation when `yPx < Y_MIN`. For non-monotonic curves (resonant peak), do not `break` — emit the crossing `L`, skip with `M<next-x>,<next-y>` when the curve re-enters, and continue.

### Step 4 — clipPath as secondary safety net

Even with truncation, keep the `clipPath={...}` on the `<path>`. If a truncation edge case slips through (floating-point boundary, off-by-one at the first sample), the clipPath prevents drawing across labels. **Truncation is the primary mechanism; clipPath is the backup.**

## Common patterns

### Bode plot (magnitude vs log frequency)

- X: `Math.log10(freq / fMin)` scaled to plot width
- Y: `20 * Math.log10(magnitude)` scaled inversely (higher dB = smaller y pixel)
- Sample ~100 points across the frequency range
- Truncate at `Y_MIN = PAD_T` (top) and `Y_MAX = PAD_T + plotH` (bottom)

### Time-domain exponential

- X: `t` linear in pixels
- Y: `V₀ * exp(-t / τ)` linear
- Sample ~80 points across the time window
- Truncate at bottom when decay goes below noise floor

### Resonant peak (non-monotonic)

```tsx
for (const x of xValues) {
  const yPx = yScale(value(x))

  if (yPx < Y_MIN || yPx > Y_MAX) {
    // Out of range
    if (prevX !== null && prevY !== null &&
        prevY >= Y_MIN && prevY <= Y_MAX) {
      // Was in, now out — emit exit crossing
      const yBound = yPx < Y_MIN ? Y_MIN : Y_MAX
      const t = (yBound - prevY) / (yPx - prevY)
      const xc = prevX + t * (xPx - prevX)
      pts.push(`L${xc.toFixed(2)},${yBound}`)
    }
    prevX = xPx; prevY = yPx
    continue
  }

  if (prevY !== null && (prevY < Y_MIN || prevY > Y_MAX)) {
    // Was out, now in — emit re-entry crossing and lift pen
    const yBound = prevY < Y_MIN ? Y_MIN : Y_MAX
    const t = (yBound - prevY) / (yPx - prevY)
    const xc = prevX! + t * (xPx - prevX!)
    pts.push(`M${xc.toFixed(2)},${yBound}`)
    pts.push(`L${xPx.toFixed(2)},${yPx.toFixed(2)}`)
  } else {
    pts.push(`${pts.length === 0 ? 'M' : 'L'}${xPx.toFixed(2)},${yPx.toFixed(2)}`)
  }

  prevX = xPx; prevY = yPx
}
```

## Pixel precision — `.toFixed(2)`

Always round path coordinates to 2 decimals. Raw floats like `231.7384759203` bloat the SVG string and make diffs unreadable. Two decimals is sub-pixel precision — plenty for a plot.

## Curves and live updates

If the curve reacts to slider / input state, memoise:

```tsx
const curvePath = useMemo(
  () => buildCurvePath(xValues, currentParams),
  [currentParams],
)
```

Don't rebuild the path on every unrelated re-render.

## Why not use a charting library?

We tried. Charting libraries like Recharts or visx are overkill for static textbook plots and they don't compose cleanly with rough.js or our theme-token system. For the kinds of plots a physics textbook needs — a few hundred points, one or two curves, annotated axes — hand-rolled `<path>` paths with truncation are simpler, smaller, and fully under our control.

The exception: if a plot needs user interaction (pan / zoom / tooltips), reach for a library then. Static curves stay hand-rolled.

## Reference implementations in the repo

Grep for `clipPath` and `useId` in `src/components/diagrams/` to find plots that use this pattern. As of ch1.1, plotted-curve diagrams are rarer than analogy illustrations — but the pattern is the one to follow when plots appear.
