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

## `<Ground>` vs battery — don't show both

If the schematic includes an explicit `<Battery>`, the battery's negative terminal already defines the 0 V reference; adding a separate `<Ground>` symbol creates the illusion of two distinct references and confuses the reader. Use `<Ground>` only when:

- (a) the supply is shown as a bare terminal label (`V_in`) with no `<Battery>` component, OR
- (b) several branches share a common return rail and the ground symbol helps declutter (e.g. transistor-stage circuits where the ARRL convention is an explicit GND at the emitter return — see `FlybackDiodeSchematic.tsx`).

For simple single-loop schematics with an explicit `<Battery>`, omit `<Ground>` and let the bottom rail speak for itself. The prose should match: if the schematic has no ground, don't write «between V_in and ground» — write «between the positive and negative terminals of V_in» or similar.

**Mechanically enforced by `check:circuit-conventions`** (`scripts/check-circuit-conventions.mjs`, wired into `check:all`). The gate flags every `.tsx` under `src/components/diagrams/` that uses BOTH `<Battery>` (or `<BatteryMulti>`) and `<Ground>` (or `<GroundEarth>`). Legitimate case-(b) exceptions opt out by adding a `ground-with-battery-ok: <one-line reason>` marker in any comment style — single-line `// …`, plain block `/* … */`, or JSX block — within ~12 lines above the `<Ground …>` element. Past failure: this rule was already in this file when `ZenerRegulatorSchematic.tsx` shipped with a redundant `<Ground>` and got user-flagged on review. Documentation alone wasn't sufficient — hence the gate.

## Schematic coordinates — one source of truth

Every component's `(x, y)` lives in a single `const NAME = { x, y }` object. `pins2(NAME.x, NAME.y, …)` and `<Component {...NAME} />` both derive from it. Never duplicate literal coordinates between pin helpers and JSX render — editing only one side causes silent drift (wires end at the new pin, symbol body drawn at the old position, and no test catches it).

## Schematic junction dots

Only at real T-junctions (three or more wires meeting from distinct directions). NEVER at a wire that simply turns a 90° corner — one continuous path going from horizontal to vertical is NOT a junction. NEVER at a phantom two-wire crossing.

A `<Junction>` (filled dot) signals «three or more conductors are electrically tied together at this point». A reader trained on schematic notation interprets the dot as «something branches here» and re-traces the wires to confirm. If nothing actually branches, the reader has been lied to and has to back out the assumption.

**Audit protocol when adding or moving a junction:** at the (x, y) it sits, count the wire segments that emanate from that point in distinct directions. Three or more → junction is correct. Two → it's a corner, remove the dot. The mirror failure mode is equally bad: a real T-joint with NO dot — every actual three-way connection in the schematic must have a `<Junction>`.

Not yet mechanically gated (would require parsing every `<Wire points={…}>` and intersecting paths to identify real T-joints). Worth adding when someone re-violates and feels the pain. Past failure: `ZenerRegulatorSchematic.tsx` shipped with two spurious dots at simple R_L corners and one missing dot at a real source-bottom-rail-ground junction — caught by user review.

## Designator labels share typography on one schematic

All component-designator labels on a single schematic must render at the same `(fontSize, fontWeight)`. Specifically:

- The R, C, L, Q1, Z, V_in, V_out, V_C, R_s, R_L letters that name components and node voltages all use **fontSize=14 / weight=600** by convention. The Circuit primitives (`Resistor.label`, `Capacitor.label`, `Inductor.label`, `Battery.value` when sole, `AcSource.value` when sole, `TerminalLabel`, `OrientedLabel`) all apply this default.
- Numeric values like «1.5V», «470µF», «9V» are NOT designator labels and stay at VALUE_SIZE (regular weight) — that's the textbook designator-vs-value hierarchy and is intentional.
- Symbol-internal glyphs (the «V» / «A» letter inside a Meter circle, the «A» / «B» letter inside a NodePoint, the «V» / «I» / «R» letters of the Ohm's-law triangle) are sized by their geometric container, not for label readability — they legitimately use different sizes. Primitive authors mark these with `data-uniform-typography-exempt="<glyph-class>"` so the gate skips them.

**Mechanically enforced by `diagram-label-consistency.test.tsx`** (auto-discovered Vitest test). For every diagram, walks all `<text>` elements that look like designators (single uppercase letter optionally followed by digits, OR a tspan with `font-size` in percent — the marker for `parseLabelSubscript`/`withSubscriptsSvg` output), groups them by `(fontSize, fontWeight)`, and fails when more than one tuple appears within a single SVG. Past failure: ZenerRegulatorSchematic.tsx shipped with V_in at fs=13 / weight=null (Battery's old default `value` styling) sitting next to R_s and R_L at fs=14 / weight=600 — three primitives applied three different default rules to what is, semantically, the same slot. Fix was at the primitive level (Battery + AcSource adapt when `value` is the sole label; TerminalLabel defaults to weight=600; OrientedLabel weight normalised from "bold" to 600).

If a primitive is added that introduces a new default style for designator labels, the gate fails. The fix is at the primitive level — not in any individual schematic — since the gate enforces a contract that all designator slots resolve to the same rendered styling.
