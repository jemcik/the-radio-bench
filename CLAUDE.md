# Claude working notes for The Radio Bench

Short-form guidance to keep future work consistent. If you change a
convention here, update this file in the same commit.

## SVG diagrams (`src/components/diagrams/*`)

These render at fixed `viewBox` dimensions and scale responsively
(`width="100%"` via `SVGDiagram`). They appear inside a tinted card via
`DiagramFigure`. Past iterations have repeatedly had the same flaws —
work through this checklist before declaring a diagram done.

### Font sizes — readable defaults

Diagrams are viewed inline with body copy. Small SVG text reads as
"unreadable footnote" next to 16 px prose. Use these floors:

| Role | fontSize | Notes |
|---|---|---|
| Primary tick / row label | **13–14** | Mono for numbers, sans for words |
| Axis / row title | **14**, weight 600 | The thing the reader scans for |
| Secondary tick label (units, examples) | **12–13** | Mono ok |
| Sub-label / hint under a title | **11** | `--muted-foreground` |
| Footnote / caveat inside the SVG | **11** italic | Not smaller |
| Symbol / hero glyph (e.g. prefix `µ`) | **17**, weight 700 | Anchor point |

**Never** drop below 11 px inside a diagram. If text doesn't fit at
11 px, the layout is wrong (rotate, stagger, wrap, or shrink the
content set — don't shrink the type).

### Padding — symmetric and tight

Compute padding from content widths, not by feel:

1. Estimate the widest left-edge label (gutter or leftmost tick) and the
   widest right-edge label (rightmost tick). Mono char ≈ 7.8 px at
   13 px; sans char ≈ 5.5 px at 11 px.
2. Pick `PAD_L` and `PAD_R` so each side has **~12–18 px of clearance**
   from the canvas edge after the half-width of the outermost label.
3. If both sides have only tick labels (no gutter), use a single `PAD`
   constant — symmetric padding by construction.
4. Document the math in a comment block above the geometry constants so
   the next editor doesn't have to rediscover it.

Common failure: PAD_L sized for an early draft's gutter labels, then the
gutter shrinks but PAD_L doesn't, leaving a fat empty stripe on the
left. Re-budget every time labels change.

### Label collisions — stagger, don't shrink

When two labels overlap horizontally (e.g. "1 Hz" and "10 Hz" on a
linear axis where 10 Hz sits 1% from the origin):

- **Don't** shrink the font to fit. That punishes every reader to fix
  a problem only one tick has.
- **Do** stagger the colliding label to a second row below the axis,
  with a short dashed leader from tick → label so the association is
  visible.
- For more than two collisions in a cluster, consider rotating labels
  30° or replacing the cluster with a single bracketed annotation
  ("1, 10, 100 Hz crowd here →").

### Theme tokens, not raw colours

Use CSS variables, not literal hex/HSL strings:

- `hsl(var(--foreground))` / `hsl(var(--muted-foreground))`
- `hsl(var(--border))`
- `hsl(var(--primary))` for accents
- `hsl(var(--callout-experiment))` / `--callout-note` / `--callout-warning`
  for the emphasised tones used in widget result boxes

Exceptions are decorative-only colours that represent a real-world
object (breadboard green, oscilloscope bezel grey, prefix-segment
rainbow). Document the exception inline.

### i18n for in-SVG text

Every word the reader sees must come from `t('ch0_X.someKey')` — no
hardcoded English strings inside the SVG, even if "it's just a label".
Both `en/ui.json` and `uk/ui.json` get the key. The `aria-label` and
`<DiagramFigure caption>` already follow this; tick titles, axis
titles, footnotes, etc. must too.

### Helper functions, not inner components

Splitting an SVG into reusable subgroups: write a plain function
(`renderFoo(...)`) that returns JSX. Do **not** declare a component
inside the parent — `react-hooks/static-components` will (correctly)
reject it because the new component identity on every render breaks
hook stability.

### Math notation in labels — use KaTeX or `<tspan>`, never raw underscores

`f_c`, `R_1`, `x^2` etc. written as plain text leak the LaTeX source to
the reader (`f_c` literally appears as `f_c`, not `f` with a subscript).
Two correct paths:

- **HTML/JSX context** (widget labels, prose): import `M` /`MBlock` from
  `@/components/ui/math` and render `<M tex="f_c" />`. KaTeX styles it
  properly and matches the rest of the chapter's typography.
- **Inside an SVG `<text>`**: KaTeX can't render here. Fake the
  subscript / superscript with `<tspan>`:
  ```tsx
  <text fontSize="11">
    <tspan fontStyle="italic">f</tspan>
    <tspan dy="3" fontSize="8">c</tspan>
    <tspan dy="-3" fontStyle="normal"> · −3 dB</tspan>
  </text>
  ```
  Italic for the variable, ~70 % font size for the subscript, `dy="3"`
  to drop / `dy="-3"` to return to baseline.

i18n strings should hold the **prose only** ("Cutoff frequency"); the
math symbol is composed in JSX. The same plain-text key can serve as
the `aria-label` (screen readers don't need the symbol).

### Plot curves must be clipped to the plot rectangle

When a plotted function can leave the plot area (e.g. an RC roll-off
that dives past the −60 dB floor on a linear axis), the SVG `<path>`
will keep drawing outside the chart and run through axis labels. Always
add a `<clipPath>`:

```tsx
const uid = useId().replace(/:/g, '')
const clipId = `myplot-${uid}`
…
<defs>
  <clipPath id={clipId}>
    <rect x={PAD_L} y={PAD_T} width={plotW} height={plotH} />
  </clipPath>
</defs>
…
<path d={path} clipPath={`url(#${clipId})`} … />
```

`useId()` keeps the id unique across multiple instances of the widget
on one page. A static id is a footgun — eventually two widgets clash
and one curve gets clipped by the wrong rect.

**Truncate at the boundary, don't clamp.** When a plotted function
goes outside the chart's value range:

- **Wrong**: clamp the y to the floor / ceiling. A segment glued along
  the bottom edge reads as "the function is flat at the floor here",
  which is a lie — the function is actually continuing past it. Even
  for monotonic curves where you might think "well, it's monotonic, the
  reader will figure it out", users see a plateau and ask "why is the
  filter perfectly flat at −60 dB from 600 kHz onward?".
- **Right**: truncate. When a sample crosses the boundary, linearly
  interpolate the exact crossing point against the previous in-range
  sample, draw the path to that crossing point, and stop (or, for
  non-monotonic functions, emit an `M` to skip the off-screen region
  and resume when back in range). Visually the curve exits through the
  edge, which is the universally-understood "off the chart" indicator.

Sketch:

```tsx
let prevX: number | null = null, prevY: number | null = null
for (…) {
  const y = yFor(value(x))
  if (y > yMax) {
    if (prevX !== null && prevY !== null) {
      const t = (yMax - prevY) / (y - prevY)
      const xc = prevX + t * (xNow - prevX)
      pts.push(`L${xc},${yMax}`)
    }
    break  // monotonic — no point continuing
  }
  pts.push(`${pts.length === 0 ? 'M' : 'L'}${xNow},${y}`)
  prevX = xNow; prevY = y
}
```

Putting `<defs><clipPath>` *inside* the `<g>` that `SVGDiagram` already
wraps around its children is fragile — some renderers refuse to resolve
the inner id. Truncation at sampling time is the primary mechanism;
SVG clipPath is at best a secondary safety net.

### After any geometry change

Run, in order:

```
npx tsc --noEmit
npx eslint src
npx vitest run src/components/diagrams
node scripts/check-i18n.mjs   # if you touched locale files
```

Then sanity-check visually in `npm run dev`. The dev server is the only
place font metrics match production — jsdom can't catch label overlap.

## i18n discipline — translate WHOLE widgets, never piecemeal

The single most repeated failure across ch0.3 and ch0.4 was leaving
unit symbols and short strings hardcoded in English. The user would
screenshot one missed string; I'd fix that one; the next screenshot
caught a sibling I missed in the same widget. Don't do that.

### Unit symbols live in `units.*`, not in widget code

`src/i18n/locales/{en,uk}/ui.json` has a top-level `units` namespace
with: `hz`, `khz`, `mhz`, `w`, `mw`, `uw`, `kw`, `nw`, `pw`, `fw`,
`db`, `dbm`. Use them everywhere a unit symbol would otherwise be a
string literal:

```tsx
const tUnit = useCallback((k: string) => t(`units.${k}`), [t])
// then
return `${value} ${tUnit('khz')}`           // not `${value} kHz`
return mode === 'dbm' ? tUnit('dbm') : tUnit('db')   // not 'dBm' / 'dB'
```

If you're using `tUnit` inside a `useMemo` dep list, wrap it in
`useCallback` first so the memo doesn't recompute on every render.

When adding a new unit family (currents in mA/µA, lengths in m/cm/mm,
times in s/ms/µs/ns), extend the `units` namespace before the first
use — don't inline it "just this once."

### When you spot a hardcoded string, audit the WHOLE widget

Don't fix only what was screenshot. Open the file, `grep` for any of
the unit family characters (`Hz`, `dB`, `mW`, `µ`, …), and convert
every occurrence in one pass. Then check sibling widgets in the same
chapter — they're likely to share the same problems.

### Per-locale geometry budget for SVG diagrams

Ukrainian renders ~30–60 % wider than English. `відношення` is 10
chars vs `ratio`'s 5; `(відносно 1 мВт)` is 16 chars vs `(vs 1 mW)`'s
9. Compute your `PAD_L` (and any internal column widths) against the
**worst-case translation**, not the English original. Document the
math in a comment block:

```tsx
//   EN main: "ratio" / "watts"  — 5 chars × ~7.5 px @ 14 sans  ≈ 37 px
//   UK main: "відношення"        — 10 chars × ~7.5 px           ≈ 75 px
//   EN sub:  "(vs 1 mW)"         — 9 chars × ~5.5 px @ 11       ≈ 50 px
//   UK sub:  "(відносно 1 мВт)"   — 16 chars × ~5.5 px           ≈ 88 px
// Worst case is the UK sub-label at 88 px → PAD_L ≥ 88 + gutter
```

Re-budget every time you add or rename a label.

### `<Trans>` for any inline component, in EVERY locale

When wrapping a glossary term inside a sentence, both locale files get
the component placeholder. Easy to forget the second locale and have
half the readers see literal `<ham>ham</ham>` in their UI:

```jsonc
// en/ui.json
"shortcutTip": "Every <ham>ham</ham> in the world …",
// uk/ui.json  ← MUST also have <ham>…</ham>
"shortcutTip": "Кожен <ham>радіоаматор</ham> у світі …",
```

Then the chapter file uses `<Trans i18nKey="…" components={{ ham: <G k="ham radio" /> }} />`.
Run `node scripts/check-i18n.mjs` after every locale edit — it catches
parity mismatches but not placeholder mismatches, so a manual diff
of the two files is still required when you add component placeholders.

## Lab activity content

- **Battery preference is AA (1.5 V), not 9 V.** AA cells are
  universally available and cheap; 9 V batteries are a niche format
  in many countries. All ratio-based experiments work just as well at
  1.5 V — only the absolute voltages on the multimeter shift. Tell the
  reader to switch to the 2 V range / autorange so they get three
  decimal places of resolution.
- **Lab activity card is `not-prose`.** The chapter wrapper applies
  prose styles (padding-left on `ul`, list-style discs, `card-foreground`
  text color) that fight with the lab card's own design system. The
  outer `<div>` of `LabActivity` already has `not-prose`; if you build
  a similar card primitive, do the same. After opting out of prose,
  set explicit `text-foreground` (or another foreground token) on body
  text — `text-teal-700 dark:text-teal-300` and similar paired colors
  read as washed-out without the prose color override they relied on.
- **Bullet/text alignment in flex lists.** Pattern is
  `<li className="flex items-start gap-2 leading-6">` with the marker
  span `shrink-0` (no `mt-*` nudge — `leading-6` aligns the baseline)
  and the text span `flex-1 min-w-0` (so wrapping hangs correctly).

## Glossary entries — describe WHO/WHAT directly

When a term refers to a person (or any concrete noun the reader can
point at), the `tip` must answer "what is this thing" in the first
clause. Example: `ham` is a person, so `tip` opens "A ham is a
licensed amateur radio operator…", not "Amateur radio is the activity
of…". The reader clicked on a noun; lead with the noun.

`see` references are first-class — every new entry should link to at
least one related term so the tooltip's "see also" chain works.

## Ukraine-specific facts

- **Amateur radio callsigns** in Ukraine are issued by **УДЦР**
  (Український державний центр радіочастот / Ukrainian State Centre
  of Radio Frequencies, a.k.a. UCRF), not by НКРЗІ. НКРЗІ is the
  regulator; УДЦР is the licensing body. Any glossary entry, lab
  callout, or prose mentioning the licensing process must use УДЦР.
- **Decimal separator** in Ukrainian is a **comma**, not a period:
  `1,55 В`, not `1.55 В`. Every numeric value in `uk/ui.json` should
  follow this — including dB values (`−2,5 дБ`), ratios (`0,1`),
  voltages, frequencies, etc.

  For numbers generated at runtime (widget results, SVG tick labels,
  cutoff readouts, anything involving `.toFixed()`), use the helpers in
  `src/lib/format.ts`:

  ```tsx
  import { formatDecimal, formatNumber } from '@/lib/format'
  const { t, i18n } = useTranslation('ui')
  const locale = i18n.language

  // Fixed width:   "20.00" / "20,00"
  formatDecimal(20, 2, locale)
  // Natural width: "2.5" / "2,5"   (trailing zeros trimmed)
  formatNumber(2.5, locale)
  ```

  **CRITICAL**: do NOT feed localized strings back into an HTML
  `<input type="number">` — that element requires the canonical machine
  format (period, no grouping) regardless of the page's display locale,
  and will wipe the value to empty otherwise. Pattern is:

  - Keep a machine-format string (`n.toFixed(2)`, period) in state and
    use it as the `<input>` value.
  - At the render point of any read-only display (ResultBox, SVG text,
    span), call `formatDecimal(rawNumber, digits, locale)` to produce
    the localized variant.

  Section numbers (`Розділ 0.2`, `3.3`) stay with a period — those are
  IDs, not decimals.

## Other recurring conventions

- **Branch discipline**: never commit to `main`. Create a feature
  branch (`chapter-0-X`, `fix-something`, …) before any edit.
- **Test pairs**: every interactive widget needs a `*.test.tsx` next to
  it using `renderWithProviders` from `src/test/render`. dB / numeric
  outputs use `.toFixed(2)` — assert on that exact format
  (`"20.00"`, not `"20"`).
- **Glossary terms**: wrap first occurrence of each technical term in
  `<G k="termKey">` so the tooltip works. Don't sprinkle `<G>` on every
  occurrence — once per chapter section is enough.
- **Chapter status**: flip `'coming-soon'` → `'published'` in
  `src/data/chapters.ts` only after tsc/eslint/i18n/vitest all pass.
