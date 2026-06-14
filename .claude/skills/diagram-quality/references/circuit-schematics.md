# Circuit schematic authoring rules

Specifically for files in `src/components/diagrams/` that depict circuits (vs. plotted curves, magnitude scales, illustrations). Working reference: [`RCChargingSchematic.tsx`](../../../../src/components/diagrams/RCChargingSchematic.tsx).

## The schematic goes BEFORE the prose that describes it

**Non-negotiable, retroactive to every section.** Any paragraph that begins with «Wire X in series with Y», «Connect A to B», «Close the switch», «between V_in and ground», or any other topology-by-words must be accompanied by a schematic the reader can look at *while reading the sentence*. Readers without engineering backgrounds (the entire target audience) cannot build a mental circuit from prose — that's exactly what a schematic is for.

Minimum bar: the schematic renders BEFORE the first prose paragraph that names its components, and it shows every element the prose references (supply, switch, resistor, capacitor, each labelled node like V_C). Use `@/lib/circuit` primitives — see `RCChargingSchematic.tsx` for the standard two-rail topology.

**For every new chapter and every new section in an existing chapter: inventory the circuits described in prose, and gate the PR on each having a schematic above the prose that describes it.**

## Zero hand-drawn SVG in chapter diagrams

Every circuit diagram is composed ENTIRELY from `@/lib/circuit` primitives: `Circuit`, `Wire`, `Junction`, `Resistor`, `Capacitor`, `Inductor`, `Meter`, `Battery`, `Ground`, `Diode`, `LED`, `TransistorNPN`, `NodePoint`, `TerminalLabel`, etc. **No exceptions.** No raw `<circle>`, `<rect>`, `<line>`, `<text>` in chapter diagram files for circuit-like content.

- If a primitive exists — use it.
- If a primitive renders incorrectly — fix the primitive; do not work around it in a chapter file.
- If a primitive is missing — add a new one to `src/lib/circuit/symbols/` and export from `src/lib/circuit/index.ts`, then use it. The library is the single source of truth for schematic-element visuals; every new primitive makes every future chapter cheaper.

Check: junction dots at every T-joint (three or more wires meeting) and NOT at plain corners; meter symbols from the `Meter` primitive (circle + bold letter, `stroke=currentColor`) matching ch0.2 / ch0.5; stroke widths, label fonts, and node-label conventions identical to the rest of the book.

## Don't float voltage-name labels in empty space — draw a voltmeter

If prose names a voltage (V_C, V_out, V_B, V_probe…) and the reader needs to understand *what physical quantity that name refers to*, don't just drop a bare text label at a wire point — that's schematic shorthand for "the potential at this node", which non-engineer readers can't parse.

Instead, draw a `<Meter letter="V">` connected across the two points whose difference the label names, with blue probe wires (`METER_ACCENT_V`) and the label hanging off the meter in blue. That way the answer to «what is V_C?» is visible in the drawing itself: it's the reading of the voltmeter across C.

Past fix: ch 1.5 §6 had a bare `V_C` terminal label floating next to the top of the capacitor and a reader had to read a full paragraph of caption to learn what it meant — replaced with a proper voltmeter.

## Battery designator vs value — don't duplicate

The `<Battery>` primitive takes both `label` (component designator like "B", "V") and `value` (quantity like "9V", "V_in"). In a schematic with only one battery, the designator adds nothing — it just creates two labels hanging off the battery that the reader has to parse. **Supply only `value` in that case.**

If there ARE multiple batteries in a schematic, then `label="B1"` / `B2` earns its place.

Past fix: ch 1.5 RCChargingSchematic had `label="V" value="V_in"` — dropped the label.

## Battery value — omit unless the number is pedagogically critical

The polarity markers («+» and «−») rendered by the `<Battery>` primitive already convey «this is a DC voltage source». **Default: don't pass `value`.** Show the numeric voltage only when the specific value is load-bearing for the schematic's lesson:

- Symbolic variables (`V_in`, `V_CC`, `v_in`) — **keep**, they're referenced by the surrounding formula/derivation.
- Specific design voltages (`+3.3V` for a logic-level driver where 3.3 V is part of why the β/R_b calculation works) — **keep**.
- Arbitrary example numbers (`3V`, `1.5V` in a generic «here's a circuit» context) — **omit**. The reader doesn't need a magic number to follow the topology.

Past fix: ch 0.2 `MultimeterDiagram` shipped with `value="1.5V"` on both the voltmeter-parallel and ammeter-series sub-schematics. The numeric value added nothing to the lesson («here's how a voltmeter sits parallel»), and on the post-chris-pikul layout it competed visually with the polarity markers. User-flagged on review, value dropped from both. Same pass: ch 0.5 «how to read a schematic» and ch 1.1 hero diagram had arbitrary `value="3V"` markers — also dropped.

## Battery value — drop the redundant «+» prefix

When a value IS shown, **omit the leading «+»** for single-supply rails. The «+» / «−» polarity markers rendered by the `<Battery>` primitive already indicate which terminal is positive; adding «+» to the numeric label duplicates that information.

Convention by context (per ARRL Handbook 2023, AoE 3rd ed., SparkFun/modern open-hardware practice):

- Single-supply schematics (one battery, one ground): just the magnitude — **`value="3.3V"`**, not `"+3.3V"`. Polarity is unambiguous from the battery symbol.
- Dual-supply (positive AND negative rails): the sign IS meaningful — `value="+12V"` / `value="−12V"` distinguishes the two rails. Use this only when there are actually two rails of opposite polarity in the schematic.
- Named rails (`V_in`, `V_CC`, `V_DD`, `v_in`): leave as-is — these are variable identifiers, not numeric values, and don't take a sign.

Past fix: ch 1.11 `BjtSwitchSchematic` and `MosfetSwitchSchematic` shipped with `value="+3.3V"`. The «+» was redundant against the polarity marker right next to it, and the chapter's prose uses just «3.3 V» everywhere. User-flagged on review; both files dropped the «+».

## Battery label slot — three legitimate conventions (pick by chapter intent)

The single-letter slot next to a `<Battery>` in our schematics is used three different ways across the course. They look identical on the page (one uppercase letter next to the cell) but mean different things, so **pick the convention that fits your chapter's lesson** rather than copy-pasting from whichever schematic is closest:

- **Component designator** — `label="B"` (Battery), single letter, no subscript. Used in ch 0.5 «Читаємо просту схему», whose explicit lesson is «schematics name parts with R / C / Q / D letters»; the schematic shows R / D / B together so the reader maps each letter to its component. Pair this with a legend that names the parts in words («батарея / резистор / світлодіод»), not by letter — the schematic teaches «letter = part» on its own.
- **Quantity label** — `label="V"` (with V / I / R on the three components in the same loop). Used in ch 1.1 «Що таке електрика?», whose lesson is Ohm's law and needs the V / I / R triplet visually attached to «their natural circuit roles» — voltage across the battery, current along the wire, resistance at the resistor. The legend MUST separate «Величини» from «Компоненти» so the reader isn't confused into reading V as a designator.
- **Variable name** — `value="V_in"` (or `V_CC`, `v_in`, etc.) with the underscore subscript. Used in ch 1.5+ schematics that derive equations (`V_out = V_in × (1 − e^(−t/RC))`); the variable on the schematic is the same identifier as in the derivation, so the reader can trace where each symbol lives in the circuit. Goes in the `value` slot, not `label`.

These conventions overlap visually but not semantically. Don't mix two in the same schematic (e.g. don't pair a designator-B battery with a variable-name `R_b` resistor — pick one register and stick to it for the whole figure).

Past «why is this inconsistent?»: ch 0.5 uses `label="B"` while ch 1.1 uses `label="V"` and ch 1.5+ use `value="V_in"` — three different conventions for what looks like the same slot. Each is right for its chapter's pedagogy; the overlap is the cost of running designators, quantities, and variables through one rendering slot.

## `<Ground>` vs battery — don't show both

If the schematic includes an explicit `<Battery>`, the battery's negative terminal already defines the 0 V reference; adding a separate `<Ground>` symbol creates the illusion of two distinct references and confuses the reader. Use `<Ground>` only when:

- (a) the supply is shown as a bare terminal label (`V_in`) with no `<Battery>` component, OR
- (b) several branches share a common return rail and the ground symbol helps declutter (e.g. transistor-stage circuits where the ARRL convention is an explicit GND at the emitter return — see `FlybackDiodeSchematic.tsx`).

For simple single-loop schematics with an explicit `<Battery>`, omit `<Ground>` and let the bottom rail speak for itself. The prose should match: if the schematic has no ground, don't write «between V_in and ground» — write «between the positive and negative terminals of V_in» or similar.

**Mechanically enforced by `check:circuit-conventions`** (`scripts/check-circuit-conventions.mjs`, wired into `check:all`). The gate flags every `.tsx` under `src/components/diagrams/` that uses BOTH `<Battery>` (or `<BatteryMulti>`) and `<Ground>` (or `<GroundEarth>`). Legitimate case-(b) exceptions opt out by adding a `ground-with-battery-ok: <one-line reason>` marker in any comment style — single-line `// …`, plain block `/* … */`, or JSX block — within ~12 lines above the `<Ground …>` element. Past failure: this rule was already in this file when `ZenerRegulatorSchematic.tsx` shipped with a redundant `<Ground>` and got user-flagged on review. Documentation alone wasn't sufficient — hence the gate.

## Schematic coordinates — one source of truth

Every component's `(x, y)` lives in a single `const NAME = { x, y }` object. `pins2(NAME.x, NAME.y, …)` and `<Component {...NAME} />` both derive from it. Never duplicate literal coordinates between pin helpers and JSX render — editing only one side causes silent drift (wires end at the new pin, symbol body drawn at the old position, and no test catches it).

## Wire endpoints MUST touch primitive pin endpoints — exactly

Every `<Wire points={[…]} />` endpoint must equal a component pin endpoint to the pixel. No 2-px gap, no «close enough». If the wire is supposed to attach to a transistor's collector, compute the wire endpoint from the SAME helper that places the pin — `pinsBJT(TR_X, TR_Y, 'right').collector` — never a hand-typed `{x: TR_X + 12, y: TR_Y - 19}` that approximates it.

**Pin endpoint table for the chris-pikul primitives** (after wrapper `translate(-75,-75) scale(0.4)`):

| Primitive | Pin offsets (local, default orient) |
|---|---|
| `Resistor` / `Capacitor` / `CapacitorElectrolytic` / `Inductor` / `InductorCore` / `Fuse` / `Crystal` | p1 = (−30, 0), p2 = (+30, 0) |
| `AcSource` | p1 = (−30, 0), p2 = (+30, 0) |
| `Battery` / `BatteryMulti` | + (pin1) = (−30, 0), − (pin2) = (+30, 0) — after the «pin1 = positive» mirror |
| `Diode` / `LED` / `DiodeZener` | anode (p1) = (−30, 0), cathode (p2) = (+30, 0) |
| `TransistorNPN` / `PNP` / `NMOS` / `PMOS` | base/gate = (−30, 0), collector/drain = (+10, −30), emitter/source = (+10, +30) |
| `OpAmp` | non-inv «+» = (−30, **−10**), inv «−» = (−30, **+10**), output = (+30, 0) |
| `Meter` | p1 = (−20, 0), p2 = (+20, 0) — uses `METER_PIN_SPAN=40`, NOT the default 60 |
| `Ground` / `GroundEarth` | pin tip = (0, **−10**) for orient='right' (compact post-May-2026 primitive) |
| `Antenna` | pin = (0, −30) for orient='up' |
| `Transformer` | pri.p1 / pri.p2 = (−30, ∓25), sec.p1 / sec.p2 = (+30, ∓25) |
| `SwitchSPDT` | common = (−30, 0), NO = (+30, −15), NC = (+30, +15) |

**Don't memorise the table.** Always check the actual SVG path in `src/lib/circuit/symbols/*.tsx` (the path's `M…h…`, `M0 75h…`, etc. give the source-coord pin endpoints; apply the wrapper transform to get local coords).

**Mechanically enforced by `check:wire-pin-alignment`** (`scripts/check-wire-pin-alignment.mjs`, wired into `check:all`). The script:

1. Parses every component placement (`<Resistor x={…} y={…} orient="…" />`) in `src/components/diagrams/`.
2. Computes each component's actual pin endpoints using a built-in geometry table (mirroring the table above).
3. Parses every `<Wire points={[…]} />` and finds its FIRST and LAST endpoints (interior corners may live anywhere).
4. For each wire endpoint, finds the nearest known pin. If distance is between 0.5 px (effectively exact) and 15 px (suspiciously close), FAILS with the exact offset.

Threshold note: the gate was originally 5 px, widened to 15 px (May 2026) after the buggy `pinsBJT` helper produced wire endpoints up to 11 px off the chris-pikul TransistorNPN pin tips — a 5-px window let that bug through.

Opt-out for wires that intentionally end at non-pin locations (rail T-joints, TerminalLabel positions, hanging stubs that meet other wires mid-air): place `// wire-pin-alignment-ok: <reason>` within 8 lines above the `<Wire>`.

Past failures the gate catches:
- `CascadedRcSchematic.tsx` had `OPAMP_PLUS_IN_Y = BUF_OPAMP_Y - 12` (should have been `-10` per chris-pikul OpAmp's +in at `(−30, −10)`). Reader screenshot: «зʼєднання не правильно підходять».
- `FlybackDiodeSchematic.tsx` had `TR_X = COIL_X - 12` (based on the buggy `pinsBJT` returning collector at `+12`; chris-pikul has collector at `+10`). Wire endpoints were 11 px off the actual transistor pin tips.
- The `pinsBJT` helper itself returned ARRL-era offsets `(-26, 0) / (+12, -19) / (+12, +19)` after the chris-pikul migration shipped — these were the OLD hand-drawn-transistor pin coords. Corrected to `(-30, 0) / (+10, -30) / (+10, +30)` May 2026. `pinsMOSFET` shared the bug because it delegated.

## Schematic width must fit the content extent

A schematic's `SCHEMATIC_W` (and `maxWidth` prop) should be just wide enough for the content (leftmost label to rightmost label/component) plus a small symmetric margin (~20 px). Don't pick a round number like 540 «to be safe» — the reader sees the excess as wasted whitespace and reads it as «something's missing on the right».

Past failure: `FlybackDiodeSchematic.tsx` shipped with `SCHEMATIC_W = 540`, content extending to ≈ x=380, leaving ~170 px of empty space on the right that the reader flagged. Corrected to 420 (May 2026).

When unsure, place all components, then in the browser DevTools console call `svg.getBBox()` on the schematic SVG to get the actual content extent and size `SCHEMATIC_W` to `bbox.x + bbox.width + ~20 px`.

**Do NOT confuse «hug the content» with «make the canvas as narrow as possible».** The rule above is about not leaving empty space *inside* the viewBox. It is NOT a licence to cram. The content extent INCLUDES every label at a comfortable position — so you size the canvas around well-placed labels, not around bare component bodies with labels jammed into whatever px remain. Past failure (ch 3.1 `CrystalRadioSchematic`, user-flagged twice): I set `SCHEMATIC_W=480`, packed 6 components 70–90 px apart, hung long labels («налаштування», «навушник») to the right of vertical components where they collided with the next symbol, clipped «земля» at the viewBox bottom, and left the schematic as a narrow strip with empty card on both sides. The lab card is ~850 px usable; the fix was 670 px with components spread and labels in their own lanes.

## Schematic labels: lanes, not collisions

- **Long labels go in their own lane.** ABOVE a horizontal component (the diode → «детектор» above it); BELOW a vertical branch (a cap / speaker → label centred under the drop wire, below the bottom rail). NEVER hang a long label to the *side* of a vertical component — it runs into the next symbol. Short side-labels (a coil designator) are fine only when there is a genuinely wide gap to the neighbour.
- **Every label needs clearance on all four sides** from neighbouring labels, component symbols, and the viewBox edge. Budget the label's rendered width (~7 px/char at the 14 px default) and check it against the gap to whatever is next to it — in BOTH locales (UA runs ~30–60 % wider).
- **Leave bottom padding for the lowest label.** A `<Ground>` with a «земля»/«earth» label below it needs the label baseline ≥ ~10 px above the viewBox bottom, AFTER the ground stripes. Size `SCHEMATIC_H` accordingly; don't let the label kiss the card's rounded border.

## Verifying a schematic — what the tests do NOT catch

`diagram-text-overlap.test.tsx` is necessary but **not sufficient**. It does NOT catch three whole defect classes:

1. **Text clipped by the viewBox / card edge** (e.g. «земля» half-cut at the bottom) — no test checks a `<text>` bbox is inside the viewBox.
2. **Text overlapping a component SYMBOL** (e.g. «навушник» across a capacitor's plates) — the overlap test explicitly **skips elements inside `<g transform>`, which is every `@/lib/circuit` primitive**, so text-over-symbol is invisible to it.
3. **Text-over-text** (cramped/colliding labels) — the test only samples text-vs-`<line>`/`<path>`, never text-vs-text.

So a green `npm test` proves NOTHING about label placement. Process, every schematic:

- **Screenshot the schematic IN ITS CARD at normal zoom FIRST** — to see overall fit, wasted side-space, and any edge clipping. ONLY THEN zoom into the graphic. Verifying by zooming straight into the drawing hides both the wasted-space problem and the card-edge clip.
- **Read each label's BOUNDARIES** against its neighbours, the nearest symbol, and the viewBox edge — to FIND defects, not to confirm the diagram «looks fine». Legible ≠ well-placed.
- **Never rationalise an observed defect.** If a label is even slightly clipped or touching, STOP and fix it. Writing «cut off at the very bottom but present» and moving on is the exact failure this section exists to prevent.

**Built: `diagram-label-bounds.test.tsx`** — flags a `<text>` label that spills past the **RIGHT** or **BOTTOM** edge of the viewBox. It caught two real shipped clips: SineOriginDiagram's «time»/«час» axis label (right) and CrystalRadioSchematic's «земля» (bottom).

It checks ALL FOUR edges, but with per-edge tolerances (the first cut dropped top/left after false positives — wrong move; the fix is tuned tolerances, not dropping edges):
- **jsdom has no text metrics**, so label width is estimated `chars × fontSize × 0.55`, which over-counts a long label by ~25 px. A naive left/right check false-positives on every long label (AtomicDiagram's 38-char labels looked like they spilled when they fit). Fix: LEFT and RIGHT use a LENGTH-AWARE tolerance — allow horizontal overflow up to ~22 % of the label's estimated width + 3 px. Short labels (tight estimate) are still caught; long labels aren't falsely flagged.
- **Outside-viewBox is NOT always clipped — at the TOP.** A label placed in the viewBox's top padding (RLChargingSchematic's «I» at y=3, glyph ~7 px above the frame) renders fine — top overflow shows in the card's padding instead of being cut. So TOP uses a generous fixed tolerance (16 px) that absorbs that harmless overflow while still catching a label grossly pushed off the top.
- **BOTTOM** uses a small fixed tolerance (4 px): descender depth (≈0.2·fontSize) is predictable, so the bbox bottom is accurate. RIGHT/BOTTOM are where real clips actually get cut (SineOrigin's «time»/«час» right; CrystalRadio's «земля» bottom).
- Still NOT gated: text-over-component-symbol. That needs per-primitive geometry and stays the job of the in-card visual review.

## Schematic junction dots

Only at real T-junctions (three or more wires meeting from distinct directions). NEVER at a wire that simply turns a 90° corner — one continuous path going from horizontal to vertical is NOT a junction. NEVER at a phantom two-wire crossing.

A `<Junction>` (filled dot) signals «three or more conductors are electrically tied together at this point». A reader trained on schematic notation interprets the dot as «something branches here» and re-traces the wires to confirm. If nothing actually branches, the reader has been lied to and has to back out the assumption.

**Audit protocol when adding or moving a junction:** at the (x, y) it sits, count the wire segments that emanate from that point in distinct directions. Three or more → junction is correct. Two → it's a corner, remove the dot. The mirror failure mode is equally bad: a real T-joint with NO dot — every actual three-way connection in the schematic must have a `<Junction>`.

Mechanically gated by **`scripts/check-junction-placement.mjs`** (May 2026, after the chris-pikul migration shipped four spurious dots in `TransformerVoltageSchematic.tsx`). The script parses every `<Wire points={…}>` and `<Junction x={…} y={…} />` in `src/components/diagrams/`, counts conductor directions at each junction (wire endpoints = +1, interior pass-throughs = +2, component pins = +1), and fails the build for any junction with fewer than 3 conductors. Wired into `check:all`.

Past failures the gate now catches automatically:
- `ZenerRegulatorSchematic.tsx` shipped with two spurious dots at simple R_L corners and one missing dot at a real source-bottom-rail-ground junction (May 2025; user review).
- `TransformerVoltageSchematic.tsx` shipped with four spurious dots at L-corners on the primary / secondary stubs after the chris-pikul migration (May 2026).

## Designator labels share typography on one schematic

All component-designator labels on a single schematic must render at the same `(fontSize, fontWeight)`. Specifically:

- The R, C, L, Q1, Z, V_in, V_out, V_C, R_s, R_L letters that name components and node voltages all use **fontSize=14 / weight=regular (400)** by convention. The Circuit primitives (`Resistor.label`, `Capacitor.label`, `Inductor.label`, `Battery.value` when sole, `AcSource.value` when sole, `TerminalLabel`, `OrientedLabel`, `CenteredLabel`, `Transformer.ratio`, OpAmp label) all apply this default. (Prior to May 2026 the default was bold weight=600 to differentiate designator from value; that gave rail-end terminal labels visible heavier ink than value labels like «1:N» on the same SVG. User flagged the mismatch — «V_p має інший колір, ніж 1:N» — and chose uniform regular weight across the board.)
- Numeric values like «1.5V», «470µF», «9V» stay at VALUE_SIZE (also regular weight) — same weight as designators, but smaller font-size. The size hierarchy (LABEL_SIZE=14 vs VALUE_SIZE=13) keeps the designator/value distinction visible without weight.
- Symbol-internal glyphs (the «V» / «A» letter inside a Meter circle, the «A» / «B» letter inside a NodePoint, the «V» / «I» / «R» letters of the Ohm's-law triangle) are sized by their geometric container, not for label readability — they legitimately use different sizes AND can stay bold (the small circle context wants weight contrast). Primitive authors mark these with `data-uniform-typography-exempt="<glyph-class>"` so the gate skips them.

**Mechanically enforced by `diagram-label-consistency.test.tsx`** (auto-discovered Vitest test). For every diagram, walks all `<text>` elements that look like designators (single uppercase letter optionally followed by digits, OR a tspan with `font-size` in percent — the marker for `parseLabelSubscript`/`withSubscriptsSvg` output), groups them by `(fontSize, fontWeight)`, and fails when more than one tuple appears within a single SVG. Past failure: ZenerRegulatorSchematic.tsx shipped with V_in at fs=13 / weight=null (Battery's old default `value` styling) sitting next to R_s and R_L at fs=14 / weight=600 — three primitives applied three different default rules to what is, semantically, the same slot. Fix was at the primitive level (Battery + AcSource adapt when `value` is the sole label; all primitive label slots converge on size 14 / regular weight).

If a primitive is added that introduces a new default style for designator labels, the gate fails. The fix is at the primitive level — not in any individual schematic — since the gate enforces a contract that all designator slots resolve to the same rendered styling.

## Don't use lowercase math identifiers (`v_in`, `i_C`) — they read smaller

Uppercase Latin letters have cap-height ≈ 10 px at fontSize 14; lowercase Latin letters have x-height ≈ 7 px at the same fontSize. Side-by-side on one schematic, lowercase «v_in» reads as visually smaller than uppercase «L» / «C» / «R» — even though both render with identical SVG `font-size` attributes. Reader-flagged on `LcSeriesSchematic.tsx`: «Vin використовує інший розмір шрифту, ніж L або C».

**Convention: math identifiers in `label="…"` / `value="…"` / `letter="…"` props are uppercase.** `V_in`, `V_CC`, `R_b`, `I_C`. Never `v_in`, `i_c`, `r_b`. (The EE textbook convention of «lowercase = AC instantaneous, uppercase = DC quantity» is not load-bearing for our pedagogy — we use uppercase uniformly.)

**Mechanically enforced by `check:designator-case`** (`scripts/check-designator-case.mjs`, wired into `check:all`). Scans every `.tsx` under `src/components/diagrams/`, `chapter-heroes/`, `widgets/`, `chapters/` for attributes matching `^[a-z]_` (lowercase letter followed by underscore → math identifier with lowercase base). Multi-letter lowercase words like `coil`, `motor`, `peak` are NOT flagged — they're descriptive labels, not designators that need to match the uppercase-component-letter typography.

Opt-out: `// lowercase-designator-ok: <reason>` on the line directly above. Use only when lowercase is genuinely the load-bearing convention (e.g. teaching AC-instantaneous vs DC notation specifically).

## Identical label text → identical visual attributes

Two `<text>` elements within the SAME SVG that share visible textContent (after normalisation) must share `fillOpacity`, `opacity`, and `fill`. Otherwise the reader sees «same label, different ink» and reads it as either inconsistency or a hidden semantic distinction — neither is intended.

Past failure: `HalfWaveRectifierWaveform.tsx` shipped with the top-plot «+V_peak» labels at `fillOpacity=0.85` and the bottom-plot «+V_peak» label at `fillOpacity=0.5` — the author was encoding «this V_peak is a reference, not actual peak» via opacity. The encoding was invisible nuance; the reader saw only «чому для нижнього графіка V_peak показаний шрифтом світлішого кольору?»

**Mechanically enforced by `diagram-label-attribute-uniform.test.tsx`** (auto-discovered Vitest test). For every diagram SVG: collects all `<text>` elements, normalises visible textContent, groups by content. For each group of 2+ elements, fails if any of `fillOpacity` / `opacity` / `fill` don't match.

Out of scope:
- Empty / whitespace-only textContent.
- Digits-only labels (axis ticks, where the same digit is incidental).
- Single-character labels (V, I, R, +, − etc. — too many incidental uses across different diagram regions).

Opt-out: `<text data-attr-uniform-exempt="<reason>">` or `data-uniform-typography-exempt="<reason>"` (honoured for compatibility with `diagram-label-consistency.test.tsx`'s exempt attribute).

## Mechanical gates — inventory

Every visual / structural diagram rule above is enforced by code. Full inventory of diagram-related gates:

| Gate | Location | What it enforces |
|---|---|---|
| `check:circuit-conventions` | `scripts/check-circuit-conventions.mjs` | No `<Ground>` when `<Battery>` is present (one reference rule) |
| `check:junction-placement` | `scripts/check-junction-placement.mjs` | Every `<Junction>` sits at a real 3+ wire convergence |
| `check:wire-pin-alignment` | `scripts/check-wire-pin-alignment.mjs` | Wire endpoints touch primitive pin endpoints exactly (≤15 px near-miss = fail) |
| `check:designator-case` | `scripts/check-designator-case.mjs` | No lowercase math identifiers (`v_in`, `i_C`) in primitive props |
| `check:diagram-fontsize` | `scripts/check-diagram-fontsize.mjs` | No hardcoded numeric fontSize in diagrams (advisory) |
| `check:svg-diagram-fontsize-units` | `scripts/check-svg-diagram-fontsize-units.mjs` | SVGDiagram-wrapped diagrams use em/rem/% units only |
| `diagram-text-overlap.test.tsx` | (Vitest, auto-discover) | Text labels don't overlap chart shapes |
| `diagram-curve-edge-rail.test.tsx` | (Vitest, auto-discover) | Plotted curves don't ride the chart's bbox edge as a flat rail |
| `diagram-label-consistency.test.tsx` | (Vitest, auto-discover) | Designator-style text shares (fontSize, fontWeight) within one SVG |
| `diagram-label-attribute-uniform.test.tsx` | (Vitest, auto-discover) | Identical text within one SVG shares (fillOpacity, opacity, fill) |
| `circuit-label-opacity-uniform.test.tsx` | (Vitest, auto-discover) | Primitive value-label opacity uniform across primitive helpers |

All `check:*` scripts run as part of `npm run check:all` (the pre-PR gate). All `*.test.tsx` run via `npm run test`. New diagram-quality rule → new gate; documentation alone is insufficient (it always drifts).
