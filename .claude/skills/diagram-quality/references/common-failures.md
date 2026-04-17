# Common failures catalogue

The list of diagram-related issues the user has flagged, what caused each, and the fix. This is the landmines equivalent for diagrams — extend it every time a new class of issue is caught. The goal is that next chapter's diagrams don't repeat any of these.

## Structure of an entry

Each entry follows the same shape: **symptom → root cause → fix → how to avoid repeating**. When adding a new one, keep that structure.

---

## 1. Font size too small next to body prose

**Symptom.** User reports "this label is too small" / "unreadable" / "looks like a footnote".

**Root cause.** `fontSize="11"` or `fontSize="12"` inside an SVG whose viewBox equals on-screen size — OR `fontSize="13"` inside a viewBox larger than on-screen (scaling-by-maxWidth).

**Fix.** Raise the fontSize to ≥ 13 on screen. If the diagram uses `maxWidth` to scale down, remove the `maxWidth` and shrink the viewBox to match. See [typography-and-padding.md](typography-and-padding.md).

**How to avoid.** Pre-flight checklist item 2. Any new `fontSize` < 13 is a bug unless it's a glyph decoration inside a shape.

---

## 2. Label clipped at the left/right edge of the canvas

**Symptom.** User screenshots show the first characters of a leftmost label cut off against the canvas edge, OR the rightmost label crosses the right border.

**Root cause.** `PAD_L` / `PAD_R` budgeted against English only; Ukrainian renders ~30–60% wider and overflows.

**Fix.** Re-budget against the worst-case translation. Mono char ≈ 7.8 px @ 13 px; sans char ≈ 6.5 px @ 13 px. Example:

```
EN "ratio"   — 5 chars × 7 px ≈ 35 px
UK "відношення" — 10 chars × 7 px ≈ 70 px
→ PAD_L ≥ 70 + 14 px clearance = 84 px
```

Document the math in a comment above the geometry constants.

**How to avoid.** Pre-flight checklist item 3. When adding or editing any edge label, re-run the budget math with both locales.

---

## 3. Diagram shrinks via `maxWidth` / `transform: scale()`

**Symptom.** Labels look small on screen even though source has `fontSize="13"`. Or: diagram looks OK on desktop but crushed on the review site.

**Root cause.** `<SVGDiagram style={{ maxWidth: 500 }}>` scales the SVG below its viewBox. A 13 px label inside a 800 × 300 viewBox capped at 500 px renders at `13 × (500/800) = 8.1 px` on screen.

**Fix.** Remove the CSS scaling. Match viewBox to intended on-screen size directly. `<SVGDiagram width={500} height={188}>`.

**How to avoid.** Pre-flight checklist item 1. The skill says "no scaling". If a reviewer or `git grep` finds `maxWidth` or `transform: scale` on an `SVGDiagram`, treat it as a bug.

---

## 4. Components overlap each other on the diagram

**Symptom.** Two labels on top of each other, an arrow crossing through a label, an electron orbit touching a nucleus label.

**Root cause.** Usually one of:

- New label added without updating neighbour positions
- Label text grew (EN → UK expansion) and collided with neighbour
- Geometry refactor that moved one element but not the label tied to it

**Fix.**

- For label-on-label: stagger to a second row with a short dashed leader (not a smaller font — see [typography-and-padding.md](typography-and-padding.md)).
- For label-on-shape: move the label to a position that doesn't cross the shape, or move the shape.
- For UK-only collision: budget against UK text width when placing the label.

**How to avoid.** After every geometry change, check the diagram at both EN and UK before claiming done. Run `npm run dev` locally (user's server — don't start your own).

---

## 5. Missing translation for a term / label / unit

**Symptom.** User screenshots show an English string inside the UK interface: `"5 kHz"`, `"rate"`, `"Voltage"`.

**Root cause.** Hardcoded string in the JSX, or a unit inlined without going through `units.*`.

**Fix.**

1. Add the key to BOTH `en/ui.json` and `uk/ui.json`.
2. Replace the hardcoded string with `t('...')` or `tUnit('...')`.
3. **Audit the whole file** — don't just fix the one string the user flagged. Grep for `Hz`, `dB`, `mW`, `W`, `Ω`, `µ`, `V`, and any English word likely to leak. Fix every occurrence.
4. Audit sibling widgets in the same chapter.

**How to avoid.**

- Translate widgets as a whole, not piecemeal.
- Use `tUnit('khz')` from the `units.*` namespace. Never inline "kHz".
- For new chapters, invoke the `ua-translate` skill before any diagram i18n work.
- Run `node scripts/check-i18n-usage.mjs` to catch orphan keys.

---

## 6. Missing `<var>` or `MathVar` mapping for math variables

**Symptom.** User sees plain `R`, `V`, `f` in Cyrillic prose and it reads as an English letter. Or: the literal text `<var>R</var>` appears in the UI.

**Root cause 1.** The i18n key uses plain text `R` instead of `<var>R</var>`.

**Fix.** Wrap the letter in `<var>…</var>` in BOTH locale JSON files. Render via `<Trans i18nKey="..." components={{ var: <MathVar /> }} />`.

**Root cause 2.** The i18n key uses `<var>R</var>` but the chapter renders with plain `t(...)` instead of `<Trans>`.

**Fix.** Convert that render site to `<Trans>` with the `components` map.

**Root cause 3.** The i18n key uses `<var>` in one locale but not the other.

**Fix.** Sync both locales. `check:i18n` catches parity but not placeholder mismatch.

**How to avoid.** Pre-flight checklist: every single-letter math variable or schematic reference designator in prose is `<var>X</var>`. See [i18n-in-diagrams.md](i18n-in-diagrams.md).

---

## 7. Dark-mode regression — label / stroke invisible

**Symptom.** Diagram reads OK in light theme but a component disappears / turns black-on-dark in dark mode.

**Root cause.** One of:

- Hardcoded colour like `stroke="#111"` or `fill="black"` instead of a CSS token
- `currentColor` used for text drawn on a fixed-colour coloured panel (e.g. dark board green) — resolves to near-black in light theme
- Rough.js path rendered without wrapping in a `<g style={{ color: ... }}>`

**Fix.**

- Replace hardcoded colours with `hsl(var(--foreground))` / `hsl(var(--muted-foreground))` / `hsl(var(--border))` / a callout token.
- For text on a fixed-colour panel, use an explicit light HSL: `fill="hsl(142 30% 82%)"`.
- Wrap rough.js paths in `<g style={{ color: 'hsl(var(--foreground))' }}>` so `currentColor` resolves.

**How to avoid.** Pre-flight checklist item 6. Use `svgTokens` or `hsl(var(--X))`. Raw hex is a flag.

---

## 8. Rough.js wobble on theme switch / scroll

**Symptom.** The hand-drawn sketch "re-rolls" every time the user scrolls or switches theme — the wiggle pattern changes.

**Root cause.** No `seed` on the rough.js call, or the sketch isn't wrapped in `useMemo`.

**Fix.** Add a unique `seed: N` to every `roughLine / roughRect / roughCircle / roughPath` call. Wrap the sketch block in `useMemo(() => ({ ... }), [])`.

**How to avoid.** Use the seed-hierarchy pattern (round bases per element group, `base + i` for repeats). See [roughjs-patterns.md](roughjs-patterns.md).

---

## 9. Plotted curve draws outside plot rectangle / through labels

**Symptom.** A filter roll-off dives below the plot bottom edge and runs through the x-axis labels or the figure caption.

**Root cause.** No `<clipPath>` on the curve, and no boundary truncation when generating the path.

**Fix.** Add truncate-at-boundary in the path generator AND a `<clipPath>` on the `<path>` element as backup. See [plotted-curves.md](plotted-curves.md).

**How to avoid.** Pre-flight checklist item 7. Any plotted function that can leave the chart rectangle gets both.

---

## 10. False plateau at plot floor

**Symptom.** A roll-off looks like it "flattens" at the bottom of the chart — reader asks "why is the filter perfectly flat past 1 MHz?"

**Root cause.** Code clamps y to the floor when the function exits the chart, producing a horizontal segment glued to the bottom.

**Fix.** Replace clamping with truncation. Interpolate the crossing point once, draw the path to that point, and stop (monotonic) or skip with `M` (non-monotonic). See [plotted-curves.md](plotted-curves.md).

**How to avoid.** Never clamp a plotted function to the plot boundary. Truncate.

---

## 11. Incomplete preview — hero / widget TODO left in place

**Symptom.** User says "this is a prose-only preview, where's the hero illustration?" or "the widget is just a placeholder".

**Root cause.** Claude handed the user a chapter for review with `// TODO: add hero` or `<div>[widget placeholder]</div>` still in the file.

**Fix.** Never hand the user a chapter preview until the hero and every primary widget render. This isn't negotiable.

**How to avoid.** New chapter checklist item 1. Plan visuals at outline time, not after prose is written. If a widget is non-trivial and might not finish, say so explicitly — don't ship a placeholder and call it done.

---

## 12. Prose promise with no artefact

**Symptom.** Chapter reads "The table below shows the comparison:" — and no table is rendered.

**Root cause.** Prose and artefact drifted out of sync during editing, OR a diagram was planned in outline and then not implemented.

**Fix.** Read the chapter top-to-bottom looking for phrases like `"The … diagram:"`, `"Below, the … figure …"`, `"The table above …"`. Every such promise has the referenced artefact actually rendered.

**How to avoid.** Pre-flight stage 5: visual sanity pass before declaring done. Run `node scripts/check-i18n-usage.mjs` to catch orphan i18n keys (often a symptom of removed-but-not-cleaned artefacts).

---

## 13. Junction dot at a corner bend or phantom crossing

**Symptom.** Schematic has a solid black dot at a 90° wire turn, or at a point where two wires cross but don't electrically connect.

**Root cause.** Over-application of "dot at every connection point".

**Fix.** Junction dots only at real T-junctions (three or more wires meeting). Corner bends: no dot. Two-wire crossings without electrical connection: no dot.

**How to avoid.** Pre-flight checklist item 8. Count wires at every dot before shipping.

---

## 14. Pin coordinates drift from component body

**Symptom.** Wires end in mid-air, not at the component's terminal, OR component body is drawn in the wrong position relative to its pins.

**Root cause.** Literal `(x, y)` coordinates duplicated between `pins2(...)` helper and `<Component x={...} y={...} />` JSX. Edit one side, forget the other, silent drift.

**Fix.** Refactor to one source of truth:

```tsx
const R1 = { x: 120, y: 80 }
// ...
pins2(R1.x, R1.y, 'a', 'b')
// ...
<Resistor {...R1} value="220Ω" />
```

**How to avoid.** Pre-flight checklist item 8. One `const NAME = { x, y }` per component, used by both pin helpers and JSX.

---

## 15. Reference designator in schematic uses spaced form

**Symptom.** Schematic value label reads `"1.5 V"` or `"220 Ω"` — cramped on a small symbol.

**Root cause.** Copied the prose spacing convention into the schematic label.

**Fix.** Schematic values are compact: `1.5V`, `220Ω`, `10kΩ`, `470µF`. Prose uses spaced: `1.5 V`, `220 Ω`.

**How to avoid.** Two different conventions, two different contexts. Check which one you're writing.

---

## 16. Fat empty stripe on one side of the chart

**Symptom.** Chart has obvious empty space on the left (or right) even though there's nothing there to pad for.

**Root cause.** `PAD_L` was sized for an earlier draft's label (e.g. a gutter label that got removed). Padding never shrunk.

**Fix.** Re-budget against current labels. If the gutter went away, `PAD_L` drops to just the half-width of the leftmost tick + clearance.

**How to avoid.** Re-budget every time labels change, not just when adding. Additions get attention; removals slip through.

---

## 17. Tiny text in DiagramFigure caption / Circuit legend

**Symptom.** Caption or legend text reads as footnote-sized next to body prose.

**Root cause.** Tailwind class `text-xs` (= 12 px) or `text-[11px]` on the wrapper.

**Fix.** Use `text-[13px]`. `DiagramFigure` already defaults to this; `Circuit` legend and figcaption too. If you find `text-xs` on a diagram-adjacent element, change it.

**How to avoid.** Pre-flight checklist item 2. The 13 px floor applies to HTML around the diagram, not just SVG interior.

---

## 18. Helper component declared inside parent component

**Symptom.** `react-hooks/static-components` lint error, or subtle hook-identity bugs.

**Root cause.** `function Subpart(...) { return <g>...</g> }` declared inside the parent component's body.

**Fix.** Write a plain function that returns JSX, not a component:

```tsx
// Outside any component, or at module scope:
function renderSubpart(x: number, y: number) {
  return <g>...</g>
}
// Parent uses: {renderSubpart(100, 50)}
```

**How to avoid.** Pre-flight checklist / [roughjs-patterns.md](roughjs-patterns.md). Helpers are functions, not components.

---

## 19. Hardcoded hex colour instead of theme token

**Symptom.** A bar/line/area renders the wrong colour after a theme palette change, even though CSS variables are used elsewhere.

**Root cause.** `stroke="#f59e0b"` or `fill="#0ea5e9"` inline instead of a CSS token.

**Fix.** Replace with `hsl(var(--callout-key))` / `hsl(var(--callout-note))` / etc. Use `svgTokens.TOKEN` where possible.

**How to avoid.** Pre-flight checklist item 6. Exceptions (breadboard green, scope bezel) are documented inline with a short comment.

---

## 20. Rough.js fill has jagged edge

**Symptom.** A water body / electron / panel fill has visible jitter along the fill edge.

**Root cause.** Used rough.js `fillStyle: 'solid'` for a clean filled shape.

**Fix.** Use a plain `<path fill="...">` or `<circle fill="...">` for clean fills. Rough.js fill is good for cross-hatch / zigzag styles, not for "a body of water".

**How to avoid.** See [roughjs-patterns.md](roughjs-patterns.md) — fill vs stroke decisions.

---

## When adding a new entry

1. Number it sequentially after the last entry.
2. Use the **symptom → root cause → fix → avoid** structure.
3. Reference the specific commit or user message that surfaced it, if helpful for context (optional).
4. Add to the matching pre-flight checklist section in `SKILL.md` if it's a new category.
5. If the failure is mechanically detectable, consider adding a rule to `npm run check:uk` (for i18n issues) or proposing a lint rule.
