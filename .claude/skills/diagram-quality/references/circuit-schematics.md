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
- (b) several branches share a common return rail and the ground symbol helps declutter.

For simple single-loop schematics with an explicit `<Battery>`, omit `<Ground>` and let the bottom rail speak for itself. The prose should match: if the schematic has no ground, don't write «between V_in and ground» — write «between the positive and negative terminals of V_in» or similar.

## Schematic coordinates — one source of truth

Every component's `(x, y)` lives in a single `const NAME = { x, y }` object. `pins2(NAME.x, NAME.y, …)` and `<Component {...NAME} />` both derive from it. Never duplicate literal coordinates between pin helpers and JSX render — editing only one side causes silent drift (wires end at the new pin, symbol body drawn at the old position, and no test catches it).

## Schematic junction dots

Only at real T-junctions (three or more wires meeting). Never at a corner bend, never at a phantom two-wire crossing.
