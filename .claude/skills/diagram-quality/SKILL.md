---
name: diagram-quality
description: Build, edit, or fix SVG diagrams, rough.js hand-drawn illustrations, chapter hero images, magnitude scales, and schematic diagrams for The Radio Bench. Covers the padding/typography/i18n/roughjs patterns landed on through chapter 1.1. Invoke whenever touching `src/components/diagrams/`, `src/components/chapter-heroes/`, or any visual artifact inside a chapter page. Also invoke when a diagram has issues with font size, padding, overlap, scaling, missing translations, or positioning.
---

# Diagram quality skill

The **goal**: every diagram we ship — hero illustrations, schematic figures, plots, magnitude ladders, analogy sketches — reads cleanly alongside body prose on first render, in both locales, in both themes. No font-floor violations. No scaling hacks. No untranslated English labels. No overlapping components. No "fix this one thing" screenshot round-trips.

Previous chapters taught us that a diagram lands in one of two states when the user first sees it:

1. **It reads** — typography flush with body text, padding symmetric, translations complete, no overflow. User moves on.
2. **It doesn't** — font 11 px next to 16 px prose, UK labels clipped at the left padding, a rough.js re-roll on every scroll, or an illustration that disappears in dark mode. User screenshots the problem, I fix one instance, next screenshot catches a sibling I missed, and the cycle burns the session.

This skill eliminates state 2.

## When to invoke

**Always invoke for:**

- Creating a new file in `src/components/diagrams/` or `src/components/chapter-heroes/`
- Editing any existing diagram — even a one-label tweak (sibling labels usually need the same tweak)
- Fixing a user-reported diagram issue (font, padding, overlap, translation, theme, scaling)
- Adding an inline SVG inside a chapter page
- Writing a schematic with `Pin`, `Resistor`, `Capacitor`, etc. primitives

**Safe to skip for:**

- Pure icon components (lucide imports, decorative glyphs under ~24 px — they have different rules)
- Markdown image references to a `/public/*.png` file — those are pre-rendered artwork, not code

## Pre-flight checklist — run through this before writing a single path

Work the checklist in order. Don't skip items because they seem obvious — the failures come from the obvious ones.

### 1. Sizing — no scaling, ever

**Hard rule:** the SVG renders at fixed pixel dimensions equal to the viewBox. Every number in viewBox units is the number of pixels on screen.

- `<svg width={W} height={H} viewBox="0 0 W H">` with W and H as literal numbers. Same values both places.
- **Never** `width="100%"`. The chapter container is `max-w-5xl` (1024 px); percentage widths inflate every fontSize by the container/viewBox ratio. A `fontSize="13"` in a viewBox 460 wide rendered at 100% becomes ~26 px on screen.
- **Never** CSS `maxWidth` or `transform: scale(…)`. Same problem — scales everything, breaks the font-floor rule invisibly.
- The wrapper helper `SVGDiagram` passes `width="100%"` internally and therefore **scales**. Prefer a bare `<svg width={W} height={H} viewBox="0 0 W H" style={{ margin: '0 auto' }}>` for widgets where you control sizing.
- Narrow viewports: wrap the SVG in a container with `overflow-x-auto`. The diagram keeps its dimensions and the card scrolls, which is the correct trade-off per user feedback (`feedback_svg_font_minimum_on_screen.md`).
- Pick W and H to match the on-screen size you actually want. If a plot feels too big, shrink W and H — don't leave a big viewBox and add a max-width.

### 2. Typography — 13 px floor

Any standalone readable label inside the SVG is **≥ 13 px on screen**. See [references/typography-and-padding.md](references/typography-and-padding.md) for the full table.

- Primary row/tick labels: **13–14**
- Axis/row titles: **14**, weight 600
- Secondary labels, footnotes, hints: **13**
- Hero glyphs (prefix `µ`, `V`, `I`): **17**, weight 700

Exception: **glyph decorations inside a shape** (e.g. `+` inside a 5 px-radius ion circle) are typographic artwork, not readable text — smaller is fine.

Surrounding HTML (DiagramFigure caption, Circuit legend) uses `text-[13px]`. Never `text-xs` (12) or `text-[11px]` around diagrams.

### 3. Padding — symmetric, tight, computed from labels

1. Estimate widest left-edge label and widest right-edge label.
   - Mono char ≈ 7.8 px @ 13 px fontSize
   - Sans char ≈ 5.5 px @ 11 px, ≈ 6.5 px @ 13 px
2. Pick `PAD_L` and `PAD_R` so each side has **~12–18 px clearance** from the canvas edge after the half-width of the outermost label.
3. If both sides have only tick labels (no gutter), use a single `PAD` constant — symmetric by construction.
4. **Compute against Ukrainian too** — UK renders ~30–60 % wider. `відношення` (10) vs `ratio` (5). Document the worst-case math in a comment block above the geometry constants.

See [references/typography-and-padding.md](references/typography-and-padding.md) for worked examples.

### 4. Rough.js — if the diagram uses hand-drawn style

Use the wrapper at [src/lib/rough.tsx](../../../src/lib/rough.tsx). **Never import `roughjs` directly** — the wrapper handles theme colour (paths inherit `currentColor` from a parent `<g>`) and stable seeding.

- Import `roughLine`, `roughRect`, `roughCircle`, `roughLinearPath`, `roughPath`, `RoughPaths` from `@/lib/rough`.
- Memoise every sketch with `useMemo(..., [])` so rough.js doesn't re-roll on re-render.
- Use a **seed hierarchy**: structural elements on round seed bases (1, 10, 20, 30, 50…), repeats on `base + i`. See `WaterPipeDiagram` lines 76–94.
- Wrap every `<RoughPaths>` in a `<g style={{ color: 'hsl(var(--TOKEN))' }}>` so strokes inherit the right theme colour.
- Decorate with plain helper functions (`function renderNucleus(...)`), not nested components — the latter fails `react-hooks/static-components`.

Full patterns: [references/roughjs-patterns.md](references/roughjs-patterns.md).

### 5. i18n — every visible word comes from `t(...)`, both locales

- Every label, footnote, tick caption, aria-label, figcaption is `t('ch{id}.{key}')` or a `units.*` / `glossary.*` key — never a hardcoded English string.
- When a unit appears (Hz, kHz, dB, dBm, W, mW, µW, …), use `tUnit('khz')` from the `units` namespace. Don't inline "kHz" "just this once".
- Math variables (`f`, `R`, `V`, `Q`): `<var>X</var>` in i18n JSON + `components={{ var: <MathVar /> }}` in the `<Trans>` call. Both locales need the `<var>` tag.
- In-SVG math subscripts/superscripts: `<tspan fontStyle="italic">f</tspan><tspan dy="3" fontSize="8">c</tspan>` — KaTeX can't render inside `<text>`.
- After editing either locale, the parity check must stay green.

Full patterns: [references/i18n-in-diagrams.md](references/i18n-in-diagrams.md).

### 6. Theme tokens — CSS variables, not raw hex

Use [svgTokens.ts](../../../src/components/diagrams/svgTokens.ts) wherever possible:

```tsx
import { svgTokens } from './svgTokens'
<text fill={svgTokens.fg} />
<rect stroke={svgTokens.border} fill={svgTokens.note} opacity={0.15} />
```

Or inline: `hsl(var(--foreground))`, `hsl(var(--muted-foreground))`, `hsl(var(--border))`, `hsl(var(--primary))`, `hsl(var(--callout-note))`, `hsl(var(--callout-caution))`, `hsl(var(--callout-experiment))`, `hsl(var(--callout-key))`.

Exceptions (decorative-only, real-world colour): breadboard green, scope bezel grey, prefix-segment rainbow. Document inline with a short comment.

**Text opacity**: `TEXT_PRIMARY` (0.85), `TEXT_DIM` (0.60), `TEXT_GHOST` (0.45) from [SVGDiagram.tsx](../../../src/components/diagrams/SVGDiagram.tsx). Never below 0.60 for readable labels. Never `currentColor` on a fixed-colour panel (resolves to near-black in light theme, invisible on dark fills).

### 7. Plotted curves — clip + truncate-at-boundary

If you're drawing a function that can leave the plot rectangle (Bode roll-off, exponential, etc.):

1. Add `<clipPath>` with a `useId`-derived unique id. Static ids clash across widget instances.
2. **Truncate at the boundary**, don't clamp. Clamping draws a false plateau at the floor. Linearly interpolate the crossing point and stop the path there.

Full boilerplate: [references/plotted-curves.md](references/plotted-curves.md).

### 8. Schematic-specific rules

- **One source of truth for coordinates**: every component's `(x, y)` lives in a single `const NAME = { x, y }` object. `pins2(NAME.x, NAME.y, …)` and `<Component {...NAME} />` both derive from it. Don't duplicate literals between pin helpers and JSX.
- **Junction dots**: only at real T-junctions (three or more wires meeting). Never at corner bends. Never at phantom two-wire crossings.
- **Reference designators**: schematic values use compact form (`1.5V`, `220Ω`); prose uses spaced (`1.5 V`, `220 Ω`).
- Schematic `R`, `C`, `L`, `D`, `Q` in i18n prose must be `<var>R</var>` + `<MathVar />` — plain letter reads as English intrusion in Cyrillic.

## Workflow — building a new diagram

### Stage 1 — Plan before code

Write these on a scratch line in the chapter file or a comment:

- **viewBox**: `W = ?, H = ?` (match intended on-screen size)
- **Labels inventory**: every text string the reader will see, in EN and UK. If you don't know the UK yet, invoke `ua-translate` first — don't translate piecemeal.
- **Left/right padding budget**: widest label on each edge, in both locales, → `PAD_L`, `PAD_R`.
- **Rough.js or clean SVG?** Hand-drawn style for analogies / hero illustrations / conceptual sketches. Clean SVG for plots, schematics, precise tick axes, magnitude ladders.
- **Theme tokens used**: pick from `svgTokens`. Sketch which tone each structural element takes.

If any of these are unclear, stop and ask the user.

### Stage 2 — Scaffold geometry

Declare all coordinates and constants at the top of the component, BEFORE any `useMemo` sketch block. Document the padding math in a comment:

```tsx
// PAD_L budget (worst case):
//   EN "ratio"      — 5 chars × ~7.5 px @ 14 sans  ≈ 37 px
//   UK "відношення" — 10 chars × ~7.5 px           ≈ 75 px
//   EN "(vs 1 mW)"  — 9 chars × ~5.5 px @ 11       ≈ 50 px
//   UK "(відносно 1 мВт)" — 16 chars × ~5.5 px     ≈ 88 px
// → PAD_L ≥ 88 + 14 (clearance) = 102
const PAD_L = 102
```

### Stage 3 — Implement

- i18n keys first (both locales), then reference them in JSX. Don't write English strings "to be translated later" — you will forget.
- Rough.js sketches inside a single `useMemo(() => ({ ... }), [])`.
- Render JSX outside the memo; decorate with helper functions (`function renderX(...)`).
- Wrap roughjs paths in `<g style={{ color: 'hsl(var(--TOKEN))' }}>`.
- Add `aria-label` via `<SVGDiagram aria-label={t('...')}>` and `<DiagramFigure caption={t('...')}>`.

### Stage 4 — Verify

Run in order:

```bash
npx tsc --noEmit
npx eslint src
npx vitest run src/components/diagrams
node scripts/check-i18n.mjs
node scripts/check-i18n-usage.mjs
npm run check:uk
```

Then ask the user to check in their browser (both themes, both locales). **Never run `preview_start` yourself** — user runs `npm run dev` locally and both servers fight for port 5173. See `feedback_local_dev_server.md`.

### Stage 5 — Visual sanity pass (the under-appreciated step)

Before saying "done", reread the chapter prose top-to-bottom with the diagram in mind. For each promise like `"The … diagram shows X"`, confirm the diagram actually shows X (not a near-miss). This is the step that catches dangling-prose-promise bugs (`feedback_orphan_i18n_and_prose.md`).

## References — fetched on demand

The root-level checklist above is loaded every invocation. Dig into these when the task warrants it:

- [references/roughjs-patterns.md](references/roughjs-patterns.md) — wrapper surface, seed hierarchies, theme-safe colour flow, helper-function rule, fill-vs-stroke decisions
- [references/typography-and-padding.md](references/typography-and-padding.md) — full font table, character-width budget for EN and UK, padding worked examples, label-collision handling (stagger vs shrink)
- [references/plotted-curves.md](references/plotted-curves.md) — useId + clipPath boilerplate, truncate-at-boundary sketch, why clamping is wrong
- [references/i18n-in-diagrams.md](references/i18n-in-diagrams.md) — `<tspan>` math, `<var>` + `<MathVar />`, units namespace, whole-widget translation rule
- [references/common-failures.md](references/common-failures.md) — the catalogue of issues we've hit and the fix for each

## When you mess up

If the user screenshots a diagram issue you shipped:

1. **Audit the whole file, not just the one thing.** Open the diagram, grep for the same anti-pattern (hardcoded string, `text-xs`, `fontSize="11"`, `maxWidth` scaling), fix every occurrence.
2. **Check sibling diagrams in the same chapter.** They usually share the bug.
3. **If the issue is a recurring class** (new kind of calque, new font-floor violation), extend [references/common-failures.md](references/common-failures.md) in the same commit so the next session starts smarter. Same pattern as `ua-translate/references/landmines.md`.
