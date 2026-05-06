# Visual landmines — bug classes already burned

A growing catalogue of rendering bugs that passed every code-correctness gate (`lint`, `tsc`, `test`, project `check:*` linters) and only got caught by browser screenshot. **Skim this list before/after touching any rendering file** — half the time the next bug is a sibling of one already documented here.

Every entry follows: **What you see** → **Cause** → **Fix** → **How to spot the class next time**.

---

## SVG primitive rotation traps

### `Ground` symbol pointing sideways

**What you see.** The ⏚ symbol's three horizontal stripes have rotated 90° and are now vertical, with the «pin» pointing right or left instead of up. The wire above doesn't connect to anything visible.

**Cause.** `<Ground orient='down' />`. The library's `orientAngle('down')` returns `90`, applying `rotate(90)` to the path. The path coordinates are drawn in canonical down-pointing form (lead UP at `(0, -15)→(0, 0)`, body lines BELOW), so rotating those by 90° produces a sideways symbol.

**Fix.** Use `orient='right'` (= 0° rotation, the unrotated path = the canonical down-pointing ⏚). Position the component so the pin tip lands on the wire: `y = WIRE_Y + 15` if the symbol hangs below the wire.

**Class to spot.** Any primitive whose path is drawn in its «final visible orientation» **then** rotated by `orient` will surprise you. Check the path coordinates relative to where the pin actually wants to be.

---

### Symbol body extending past `SCHEMATIC_H` and getting clipped

**What you see.** The bottom row of the ⏚ stripes (or any other component's body) is missing — only the top portion is visible.

**Cause.** `SCHEMATIC_H = schematicHeight(RAIL_SPAN) + N` where `N` is too small. `schematicHeight` allots only `SCHEMATIC_PAD_BOT = 20` px below the bottom rail. A `Ground` hanging from the wire occupies `15 + 10 = 25` px below it, so the lower stripes get cropped by `<SVGDiagram>`'s clipPath.

**Fix.** Bump the trailing constant: `+ 40` is comfortable for `Ground` + room. If you add a component below the rail, recompute the bottom budget.

**Class to spot.** Any SVG primitive whose visible extent goes outside the component's «pin position» needs the schematic height to accommodate it. The clipPath is silent — you'll never see the missing pixels in the source.

---

## Wire layout traps

### Dangling wire stub from a removed label

**What you see.** A short horizontal wire segment that ends in nothing — no terminal, no component, just a wire-to-air on the left or right edge of a schematic.

**Cause.** A `TerminalLabel` used to anchor the wire's endpoint visually. When the label is removed (e.g., «Земля» dropped because the ⏚ symbol speaks for itself), the wire still extends to its old position but now has nothing to «end at».

**Fix.** Either: (a) move the next anchored component (e.g., `Ground`) to the wire's end, eliminating the stub; or (b) restore some kind of terminal marker — a label, a junction dot, a connector glyph.

**Class to spot.** When you remove a `TerminalLabel`, walk the wires that ended at it. If they now end in empty space, fix the layout.

---

## Glossary popover traps

### Popover top clipped above the viewport

**What you see.** Click on a glossary term in the first paragraph of a chapter; the popover appears, but the top half is cut off above the page header. Scrolling up doesn't help — the page is already at the top.

**Cause.** Static `max-h-[70vh]` on the `PopoverContent`. When the anchor is high in the viewport and the popover flips above (Radix collision-detection), 70 % of viewport height extends past the viewport top edge. The clip happens at the browser viewport, not inside the popover.

**Fix.** Use the live var: `max-h-[var(--radix-popper-available-height)]`. Radix's Floating-UI `size` middleware computes the actual available height between anchor and viewport edge (minus `collisionPadding`) and writes it to that CSS variable. The popover then clamps to whatever fits, scrolling internally when needed.

**Class to spot.** Any floating UI with a static viewport-fraction cap (`max-h-[Nvh]`) is wrong — it ignores anchor position. Always use Radix's available-* CSS vars.

---

## i18n markup traps

### `<strong>` (or any HTML/JSX tag) shipping as literal text

**What you see.** The text «<strong>important</strong>» appears in the rendered prose, with the tags visible to the reader.

**Cause.** The i18n value contains an HTML/JSX tag, but the call site is `{t('key')}` raw interpolation, not a `<Trans>` block with a `components={{ … }}` mapping. React renders the i18n string as plain text, so the tags become literal characters (HTML-escaped to `&lt;strong&gt;` so they're visible).

**Fix.** Replace `{t('key')}` with `<Trans i18nKey="key" ns="ui" components={{ strong: <strong />, ... }} />`. The `check:tag-renders` gate catches this at build time, but always re-verify in browser since the gate has heuristic safe-wrapper detection that can mis-classify edge cases.

**Class to spot.** Any change to an i18n value that adds tag-shaped content (`<X>...</X>`) needs a sibling change at the call site.

---

### Markdown emphasis (`**bold**`) shipping as literal asterisks

**What you see.** Glossary tooltip shows «**no galvanic isolation**» with the asterisks visible.

**Cause.** Glossary entries render via `withSubscripts(entry.detail)`, which only converts bare `X_Y` subscripts to `<sub>`. It does NOT process Markdown. Asterisks pass through as text.

**Fix.** Strip the `**...**` to plain text, or replace with guillemets «...», or use `<strong>...</strong>` (which `withSubscripts` also doesn't process — same trap, different cosmetic). The `check:glossary-markup` gate now catches this class.

**Class to spot.** Any glossary `tip` / `detail` / `formula` / `unit` field with non-plain-text formatting is suspect.

---

### Subscript braces appearing as literal `{` `}`

**What you see.** The text «N_{p}» renders with the curly braces and underscore visible.

**Cause.** `withSubscripts` (the bare-subscript helper used in many label call sites) understands `X_Y` (no braces) but NOT `X_{Y}` (LaTeX-style with braces). If the i18n value uses the LaTeX form and the call site wraps with `withSubscripts`, the braces survive and ship.

**Fix.** Either rewrite the value as bare `X_Y` (and `withSubscripts` handles it), OR wrap as `<var>X_{Y}</var>` AND render through `<MathText>` or `<Trans>` with `MathVar` mapping. The `check:bare-subscripts` gate covers most of this — re-verify in browser.

**Class to spot.** When you see `_{...}` form in an i18n value, check the rendering site. It's only safe inside `<var>...</var>` rendered by KaTeX.

---

## Layout / overlap traps

### Label overlapping its target

**What you see.** A `TerminalLabel` text bleeds into a wire, a transformer body, or another label, making both unreadable.

**Cause.** Labels positioned by `anchor='middle'` extend symmetrically from the anchor `x`, so a wide label centered on a narrow target overflows in both directions. Or: vertical position too close to the wire (`y = WIRE_Y - 13` puts the label baseline only ~7 px above a 14-px-tall text glyph, causing overlap).

**Fix.** Move the label vertically further from the wire (`y = WIRE_Y - 18` or more), OR change the anchor so it extends in only one direction (`anchor='start'`/`'end'`), OR position it over a less-cluttered region (like the middle of an empty wire span instead of over a primitive's body).

**Class to spot.** When a label is wider than the visual element it labels, `anchor='middle'` will overflow. Use `'start'` or `'end'` and position the anchor at one edge.

---

### Sibling labels in the same schematic with mismatched `tone`

**What you see.** Three labels in a schematic are appropriately muted (light gray, `mutedFg`) and one is darker (default `fg`). The reader notices the inconsistency immediately — the darker label «pops» without any semantic reason.

**Cause.** `TerminalLabel`'s `tone` prop defaults to `fg` (foreground / dark). When adding a new label to a schematic where the existing convention is `tone="mutedFg"` for annotations, forgetting the prop produces this exact mismatch. The `check:*` gates don't see colour, so the bug ships unless caught by browser screenshot.

Concrete example: `TransformerLabSchematic` had four annotations — «ШІМ з Arduino» (no `tone`, dark), «GND з Arduino» (`mutedFg`), «10 витків» / «40 витків» (`mutedFg`). Three muted, one dark. User-flagged as inconsistent.

**Fix.** Add `tone="mutedFg"` to the outlier. **Generally:** before committing any schematic change, scan ALL `<TerminalLabel>` calls in the file and confirm their `tone` props are consistent (or that any difference is intentional and load-bearing — e.g., the active signal vs. ground in a context where the contrast matters).

**Class to spot.** Any time you add or copy-paste a `<TerminalLabel>` (or any prop-bearing primitive whose default differs from the file's prevailing convention), check the OTHER siblings in the same diagram — `tone`, `anchor`, font weight, italic, etc. The default props of a primitive are a trap when the established convention overrides them.

---

### Component icon doesn't read as the thing it represents

**What you see.** You drew an SVG meant to depict a laminated-iron transformer; the user looks at it and asks «what is this?». The shape doesn't map to any familiar mental model of the component.

**Cause.** Hand-drawn from scratch, without grounding in (a) ARRL standard symbology, (b) the project's existing primitive library, or (c) a textbook reference.

**Fix.** Don't iterate hand-drawn versions blindly. **First** check what the project already has (`src/lib/circuit/symbols/`), then ARRL Handbook 2023 PDF for the canonical convention, then delegate to Gemini if iconography is the weakness (`/tmp/gen-iron-core.py`-style one-off script with the existing FerriteCore / PowderedIronCore as style anchors).

**Class to spot.** If the second hand-drawn attempt didn't work, don't try a third. Either find the canonical symbol or delegate.
