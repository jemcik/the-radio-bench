# Rough.js patterns

Every hand-drawn illustration in The Radio Bench goes through the wrapper at [src/lib/rough.tsx](../../../../src/lib/rough.tsx). This document explains the wrapper's surface and the patterns ch1.1 landed on after iteration. Read this before writing a new illustration, or when a reviewer asks "why is this `<g>` wrapper there?"

## Why we wrap roughjs instead of using it directly

Rough.js's native `RoughSVG` / `RoughCanvas` bake `stroke="..."` into the paths it generates. That breaks two things in our setup:

1. **Theme switching.** A stroke of `#111` hardcoded into the SVG doesn't follow `hsl(var(--foreground))` when the user switches to dark mode. The illustration stays dark-on-dark.
2. **Semantic recolouring.** We want one pipe to read as "voltage" (amber / `--callout-key`) and another as "current" (blue / `--callout-note`) — not by hardcoding hex, but by wrapping the relevant paths in a `<g style={{ color: 'hsl(var(--callout-note))' }}>` block.

The wrapper calls `gen.toPaths(drawable)` to extract raw `d` strings, then renders `<path stroke="currentColor" ... />` ourselves. Every path inherits whatever `color` the nearest ancestor `<g>` sets, so CSS tokens flow naturally and grouping shapes by tone is just JSX nesting.

## The wrapper surface

```tsx
import {
  roughLine,
  roughRect,
  roughCircle,
  roughLinearPath,
  roughPath,
  RoughPaths,
  type RoughPath,
} from '@/lib/rough'
```

Each helper returns `RoughPath[]` = `{ d: string, strokeWidth: number }[]`. Render with:

```tsx
<RoughPaths paths={mySketch.foo} />
// or with extra props forwarded to every <path>:
<RoughPaths paths={mySketch.foo} opacity={0.7} strokeDasharray="4 3" />
```

**Never import `roughjs` directly.** The wrapper is the only blessed entry point.

## Default options

```ts
// src/lib/rough.tsx
const DEFAULT = {
  roughness: 0.7,
  bowing: 0.5,
  strokeWidth: 1.3,
  disableMultiStroke: false,
}
```

Per-shape overrides use the same `Options` type roughjs exports:

```tsx
roughLine(x1, y1, x2, y2, {
  seed: 42,
  roughness: 0.4,     // calmer for structural outlines
  strokeWidth: 1.1,
})
```

### Roughness budget

| Element type | Typical `roughness` | Example |
|---|---|---|
| Ground line / primary structural outlines | 0.5–0.6 | Platform outline, tank walls |
| Secondary structure / hatching | 0.3–0.4 | Platform hatches, ground tick marks |
| Small decorative marks | 0.2–0.35 | Tiny splash droplets, ion `+` glyph |
| Zigzag / chaotic motion | 0.9 | Electron thermal path |
| "Clean" directional arrow that must read straight | 0.2 | Drift velocity arrow in `DriftVelocitySketch` |

Drop roughness toward 0.2 for anything that must read as a straight line — high roughness on an arrow reads as "this arrow is wobbly" instead of "hand-drawn".

## Stable seeding — the seed hierarchy

Rough.js is deterministic only if you pass a `seed`. Without one, every render re-rolls the path. Our convention:

**Each `useMemo(..., [])` sketch block uses a round-number seed base per element group, with `base + i` for repeats.**

```tsx
const sketch = useMemo(() => ({
  // Structural elements — unique round seeds
  ground:          roughLine(...,               { seed: 1 }),
  platformOutline: roughRect(...,               { seed: 30 }),
  tankLeft:        roughLine(...,               { seed: 50 }),
  tankBottom:      roughLine(...,               { seed: 51 }),
  pipeTop:         roughLine(...,               { seed: 60 }),

  // Repeated elements — base + index
  groundHatches: xs.map((x, i) =>
    roughLine(...,                              { seed: 10 + i })),
  platformHatches: [0,1,2,3,4,5,6,7].map(i =>
    roughLine(...,                              { seed: 40 + i })),
}), [])
```

Why: round bases (1, 10, 20, 30, 50…) make it obvious which seed belongs to which element group when you're debugging a weird wobble. The spacing between bases (10+) leaves room for up to ~10 repeats before you'd collide with the next group.

**Do not use `useId()` for seeding.** `useId()` changes per instance and produces strings, not numbers. Seeds should be constants tied to the layout — if two readers see the same page, they see the same rough lines.

**Do wrap the sketch block in `useMemo(..., [])` with an empty dep array.** Otherwise every re-render (language switch, theme toggle, parent state) redraws. Deterministic output means re-runs produce the same paths, but re-running is wasted work.

## Theme-safe colour — group by tone

Each tonal group of paths lives in its own `<g style={{ color: '...' }}>`:

```tsx
return (
  <SVGDiagram width={W} height={H} aria-label={t('ch1_1.waterPipeAria')}>
    {/* Structural — foreground tone */}
    <g style={{ color: svgTokens.fg }}>
      <RoughPaths paths={sketch.ground} opacity={0.8} />
      <RoughPaths paths={sketch.platformOutline} />
      <RoughPaths paths={sketch.tankLeft} />
      <RoughPaths paths={sketch.tankBottom} />
    </g>

    {/* Water fill — blue (note tone), single clean path */}
    <path d={waterPath} fill="hsl(var(--callout-note) / 0.22)" />

    {/* Labels — each its own tone */}
    <g style={{ color: svgTokens.key }}>      {/* V — amber */}
      <text x={...} y={...} fontSize="17" fontWeight="700"
            fill="currentColor">V</text>
    </g>
    <g style={{ color: svgTokens.caution }}>  {/* R — orange */}
      <text x={...} y={...} fontSize="17" fontWeight="700"
            fill="currentColor">R</text>
    </g>
  </SVGDiagram>
)
```

Every rough.js `<path>` uses `stroke="currentColor"` via the wrapper; every label uses `fill="currentColor"`. The enclosing `<g>` decides what that colour is.

### Available tokens

From [svgTokens.ts](../../../../src/components/diagrams/svgTokens.ts):

- `svgTokens.fg` — `--foreground`, body-text equivalent
- `svgTokens.mutedFg` — `--muted-foreground`, secondary marks
- `svgTokens.border` — `--border`, hairlines
- `svgTokens.primary` — `--primary`, brand accent (sparing)
- `svgTokens.termAccent` — `--term-accent`, glossary-linked labels
- `svgTokens.experiment` — `--callout-experiment`, teal
- `svgTokens.key` — `--callout-key`, amber
- `svgTokens.note` — `--callout-note`, blue
- `svgTokens.caution` — `--callout-caution`, orange
- `svgTokens.onair` — `--callout-onair`, purple

Match the tone to the meaning. "Voltage" has been amber across chapters; "current" blue; "resistance / caution / warning" orange. Don't randomize.

## Helper functions, not inner components

When the diagram has repeating sub-structures (two tanks, four electrons, three nucleus variations), DO NOT declare a React component inside the parent:

```tsx
// ❌ Wrong — react-hooks/static-components fires, hook identity changes each render
export default function AtomicDiagram() {
  function Nucleus({ x, y }: { x: number; y: number }) {  // new identity each render
    return <g>...</g>
  }
  return <Nucleus x={100} y={50} />
}
```

Write a plain function that returns JSX:

```tsx
// ✅ Right — pure function, stable identity
function renderNucleus(x: number, y: number, label: string) {
  return (
    <g>
      <circle cx={x} cy={y} r={14} fill="hsl(var(--callout-caution))" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="13"
            fontWeight="700" fill="currentColor">{label}</text>
    </g>
  )
}

export default function AtomicDiagram() {
  return (
    <SVGDiagram ...>
      {renderNucleus(100, 50, '+11')}
      {renderNucleus(280, 50, '+10')}
    </SVGDiagram>
  )
}
```

## Fill vs stroke — when to bypass rough.js

Rough.js is for **strokes** that should look hand-drawn. For clean filled shapes (water body, ion core, opaque background panels), use plain `<path>` / `<rect>` / `<circle>` with `fill`:

```tsx
// Water body — ONE continuous path, no seams
const waterPath = `M ${tankX} ${waterLevelY}
                   L ${tankX + tankW} ${waterLevelY}
                   ...`
<path d={waterPath} fill="hsl(var(--callout-note) / 0.22)" />

// Electron — clean circle
<circle cx={ex} cy={ey} r={5} fill="hsl(var(--callout-note))" />
```

Rough.js `fillStyle: 'solid'` exists but adds visible jitter to the fill edge — not what we want for "a body of water" or "an electron". Use it only for the cross-hatch / zigzag fill styles it's actually good at.

### Why water is one path, not tank + pipe + stream

Earlier drafts drew water inside the tank, water inside the pipe, and the stream as separate paths. At the pipe/tank joint and the pipe/stream joint, subtle seams appeared — anti-aliasing exposed the boundary. Fix: one continuous path from tank surface → through pipe → out the stream. Commit the math once, don't chase seams forever.

## Memoisation rules

- Sketch object: `useMemo(() => ({ ... }), [])`. Empty deps — sketches don't depend on anything reactive.
- Coordinate math: plain `const` outside the memo. These are layout, not state.
- **Never** put the sketch inside JSX without `useMemo`:
  ```tsx
  // ❌ Every render re-runs roughjs
  return <RoughPaths paths={roughLine(...)} />
  ```
  Even with a stable seed, this is wasted work — rough.js runs a seeded PRNG through each stroke on every render.

## Debugging hand-drawn paths

Common symptoms:

- **"The line keeps wiggling on scroll"** — missing seed. Add `seed: N`.
- **"The line wobbles on theme switch"** — you're re-running roughjs on render. Check for missing `useMemo`, or a dep array that changes.
- **"Two identical shapes look suspiciously identical"** — same seed. Give each a unique seed (`{ seed: 1 }` vs `{ seed: 2 }`).
- **"Line won't go dark in dark mode"** — you passed `stroke="#333"` somewhere, or forgot to wrap paths in a `<g style={{ color: ... }}>`.
- **"Arrow looks floppy instead of directional"** — roughness too high. Drop to 0.2–0.3 for directional lines.
- **"Fill has a jagged edge"** — you used rough.js for a fill. Use plain `<path fill="...">` instead.

## Reference implementations

- [WaterPipeDiagram.tsx](../../../../src/components/diagrams/WaterPipeDiagram.tsx) — seed hierarchy, tonal grouping, continuous-path water fill, placed droplets
- [AtomicDiagram.tsx](../../../../src/components/diagrams/AtomicDiagram.tsx) — `renderNucleus` / `renderElectron` helper pattern, electron escape trajectory avoiding label collision
- [DriftVelocitySketch.tsx](../../../../src/components/diagrams/DriftVelocitySketch.tsx) — low-roughness directional arrow next to high-roughness zigzag path
- [ResistanceCollision.tsx](../../../../src/components/diagrams/ResistanceCollision.tsx) — collision scene geometry
- [MaterialsComparison.tsx](../../../../src/components/diagrams/MaterialsComparison.tsx) — three side-by-side panels with tonal differentiation
- [Ch1_1Hero.tsx](../../../../src/components/chapter-heroes/Ch1_1Hero.tsx) — hero illustration composition

When in doubt, copy the structure from the closest reference and adapt.
