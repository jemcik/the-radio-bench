# Typography & padding

The single most-caught class of diagram bug on this project is "label too small" or "label clipped at the edge". Both come from not doing the math before committing coordinates. This document gives you the math.

## The 13 px font floor — non-negotiable

Body prose on a chapter page renders at 16 px. A 10 or 11 px label inside an adjacent SVG reads as "footnote" next to the prose, which is almost never the intent. The user has flagged 11 px and 12 px as "too small" more than any other diagram issue.

**The floor: 13 px on screen, for every standalone readable label.**

| Role | `fontSize` | Weight | Notes |
|---|---|---|---|
| Primary tick / row label | 13–14 | 400 | Mono for numbers (`font-mono`), sans for words |
| Axis / row title | 14 | 600 | The thing the reader scans for |
| Secondary tick (units, examples) | 13 | 400 | Mono ok |
| Sub-label / hint under a title | 13 | 400 | `--muted-foreground` |
| Footnote / caveat inside SVG | 13 italic | 400 | Not smaller |
| Hero glyph (prefix `µ`, `V`, `R`, `I`) | 17 | 700 | Anchor point |

### The one exception

Glyph decorations **inside a shape** — the `+` inside a 5 px-radius ion circle, the `−` inside an electron dot, the `e⁻` tag on a 6 px electron — are typographic artwork, not readable text. They may use smaller `fontSize` to fit the container. Treat them like part of the drawing.

## HTML around the diagram also uses 13 px

`DiagramFigure`'s caption uses `text-[13px]`. `Circuit`'s figcaption and legend also use `text-[13px]`. **Never** use Tailwind's `text-xs` (= 12 px) or `text-[11px]` for diagram-adjacent copy. Apply the floor uniformly so the SVG interior and the surrounding HTML are typographically flush.

The old "11 px floor" rule that appeared in earlier chapters is deprecated.

## "fontSize on screen" means no scaling hacks

The `fontSize` number in source equals the `fontSize` the reader sees **only if** the viewBox matches the on-screen size. Common ways to break that invariant:

### ❌ Wrong — CSS `maxWidth` shrinks the whole diagram

```tsx
<SVGDiagram width={800} height={300} style={{ maxWidth: 500 }}>
  {/* fontSize="13" renders as 13 × (500/800) = 8.1 px on screen */}
</SVGDiagram>
```

### ❌ Wrong — `transform: scale()` wrapper

```tsx
<div style={{ transform: 'scale(0.7)', transformOrigin: '0 0' }}>
  <SVGDiagram ...>
</div>
```

### ❌ Wrong — inflating viewBox to "fit more stuff"

```tsx
// viewBox 1200 × 400 inside a container that caps width at 672 px
<SVGDiagram width={1200} height={400}>
  {/* everything shrinks to 56% → 13 px → 7.3 px on screen */}
</SVGDiagram>
```

### ✅ Right — match viewBox to the intended on-screen size

Pick a viewBox `W` that fits inside the chapter's column at 1:1 scale on a normal desktop viewport. The chapter column is ~672 px wide at max, narrower on tablet, much narrower on phone. Typical viewBox widths:

- **Narrow analogies / hero illustrations**: 480–540 px (gives some breathing room)
- **Standard schematic / plot**: 560–640 px
- **Full-width detailed figure**: 640–672 px (right at the column edge)

Height picks itself from the content.

**What about phones?** SVG scales gracefully when the container is narrower than the viewBox — `width="100%"` does the right thing. A 640-px-wide viewBox shrinks to ~340 px on an iPhone SE, and every label shrinks proportionally. That's an unavoidable constraint of responsive design, not a reason to inflate the viewBox. If a specific diagram is unreadable on small screens, consider a mobile-specific layout (CSS-stacked columns) rather than scaling.

## Padding math — worked examples

**The rule**: compute `PAD_L` and `PAD_R` from the widest label on each edge. Document the math in a comment so the next editor doesn't have to rediscover it.

### Character width estimates

Rough rules of thumb, good enough for budgeting:

| Font | Size | Mono char width | Sans char width |
|---|---|---|---|
| Mono (tabular numerals) | 11 | ~6.5 px | — |
| Mono | 13 | ~7.8 px | — |
| Mono | 14 | ~8.4 px | — |
| Sans | 11 | — | ~5.5 px |
| Sans | 13 | — | ~6.5 px |
| Sans | 14 | — | ~7.0 px |

Add ~10% for bold text, ~5% for italic.

### Example 1: symmetric tick axis

Plot with tick labels on both sides, no gutter labels:

```
EN labels:  "1"   "10"   "100"   "1 k"   "10 k"   "100 k"
UK labels:  "1"   "10"   "100"   "1 к"   "10 к"   "100 к"
```

All under 6 chars × 7.8 px = 47 px. Half-width of outermost label = 24 px. Clearance target = 14 px. `PAD_L = PAD_R = PAD = 24 + 14 = 38` — use a single `const PAD = 38`.

### Example 2: left gutter with variable-width row label

Plot with a row label to the left of the first tick:

```
// EN main:  "ratio"     — 5 chars × 7 px @ 14 sans  ≈ 35 px
// UK main:  "відношення" — 10 chars × 7 px          ≈ 70 px
// EN sub:   "(vs 1 mW)"  — 9 chars × 5.5 px @ 11    ≈ 50 px
// UK sub:   "(відносно 1 мВт)" — 16 chars × 5.5 px  ≈ 88 px
// Worst case is the UK sub-label at 88 px.
// Plus 14 px clearance from canvas edge:
const PAD_L = 88 + 14  // 102
```

Always budget against the **UK worst case**, not EN. UK renders 30–60% wider across the board.

### Example 3: right-edge numeric readout

Plot with a live-updating right-edge label:

```
// EN:  "−20.0 dB" — 8 chars × 7.8 px mono @ 13 ≈ 62 px
// UK:  "−20,0 дБ" — 8 chars × 7.8 px mono @ 13 ≈ 62 px
// textAnchor="end" at x=W-PAD_R means right edge = W-PAD_R.
// Need 14 px clearance from W:
const PAD_R = 14
```

Numeric readouts with matched glyph counts across locales don't blow up UK-wise. Prose labels do.

### When to re-budget

- A new label is added on an edge
- An existing label's content changes in EN or UK
- The font on an edge changes (sans → mono, 13 → 14)
- You switch from "tick labels" to "tick labels + gutter"

Budget fresh every time. It's easier than chasing a user-reported clipping bug later.

## Label collisions — stagger, don't shrink

When two labels overlap horizontally (classic case: "1 Hz" and "10 Hz" on a linear axis where 10 Hz sits 1% from the origin):

### ❌ Don't shrink the font to fit
That punishes every reader to fix a problem affecting one tick. It also violates the 13 px floor if you have to go below 13 to resolve the collision.

### ✅ Stagger to a second row below the axis
Use a short dashed leader from tick → label so the association is visible:

```tsx
<text x={x} y={axisY + 14} textAnchor="middle" fontSize="13">
  {label}
</text>
{needsStagger && (
  <>
    <line x1={x} y1={axisY + 2} x2={x} y2={axisY + 14}
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="2 2" strokeWidth="0.5" />
    <text x={x} y={axisY + 28} textAnchor="middle" fontSize="13">
      {staggeredLabel}
    </text>
  </>
)}
```

### ✅ For >2 collisions in a cluster
Consider rotating labels 30°, or replacing the cluster with a single bracketed annotation: `"1, 10, 100 Hz crowd here →"`.

### ✅ Increase the plot range
If the collision is because the plot starts at 0 and your data spans many decades, switch to log scale — the labels distribute evenly.

## Overflow — coordinates that exceed `W` or `H`

`SVGDiagram` clips content at the viewport rectangle using a `<clipPath>`. Content outside `(W, H)` is cut off without warning.

**Before committing, verify the coordinate budget** (the comment block template in `SVGDiagram.tsx` lines 22–30):

```tsx
const W = 540, H = 240
// Verify before committing:
//  • max x used:  528 (< 540) ✓
//  • max y used:  232 (< 240 — include font descenders ≈ fontSize*0.3) ✓
//  • textAnchor="end" at x=X means right edge = X (must be < W)
//  • textAnchor="middle" at x=X means right edge = X + textWidth/2
```

**Font descenders** are easy to miss. A `<text>` at `y=235` with `fontSize="13"` extends ~4 px below baseline — that's `y = 239`, which clips against `H = 240`. Safe rule: the `y` coordinate of the baseline is `H − fontSize × 0.3 − clearance`. For a 13 px label at the bottom edge: `y ≤ H − 4 − 4 = H − 8`.

## Vertical rhythm

- Gap between section header and first axis row: 16 px minimum
- Gap between stacked row labels: 20 px if the labels are single-line, 28 px if either wraps
- Gap between figcaption and diagram box: handled by `DiagramFigure` (`mt-2`). Don't override.

## Cross-check: run the verification after geometry changes

```bash
npx tsc --noEmit
npx eslint src
npx vitest run src/components/diagrams
node scripts/check-i18n.mjs   # if you touched locale files
```

The dev server is the only place font metrics match production. jsdom can't catch visual overlap. Ask the user to verify in browser after you ship — don't start your own dev server.

## When padding goes wrong — how to tell

Symptoms and fixes:

| Symptom | Likely cause | Fix |
|---|---|---|
| Leftmost label clipped in UK but fine in EN | Budgeted against EN only | Widen `PAD_L` per the UK character count |
| Fat empty stripe on the left edge | `PAD_L` set for an earlier draft's label that shrunk or was removed | Re-budget against current labels |
| Bottom tick labels cut off | Forgot font descender | `y ≤ H − fontSize × 0.3 − clearance` |
| Right-edge readout number crawls across the right border when value grows | Fixed-width budget assumed a smaller number; `textAnchor="end"` means the right edge hits `x` exactly | Reserve width for the widest possible value, not the current one |
| Title label hits tick label below it | `titleY` computed without accounting for tick label height | `titleY ≥ tickY + tickFontSize + 4` |
