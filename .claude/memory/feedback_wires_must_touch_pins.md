---
name: Wires MUST touch component pin endpoints exactly — no off-by-N px gaps
description: User has flagged multiple times that wire endpoints don't meet primitive pin endpoints. The fix is mechanical: every `<Wire>` terminal coord MUST equal a component pin coord exactly. No «close enough».
type: feedback
originSessionId: b8a5b095-fbbe-408d-af39-ed7a91ace5d9
---
# The rule

In every circuit schematic in `src/components/diagrams/**`, every `<Wire points={[…]} />` endpoint MUST equal a component pin endpoint exactly. Pixel-exact. Not «±2 because of stroke width», not «close enough», not «I'll eyeball it».

# Why this keeps breaking

Every chris-pikul primitive has pin endpoints at specific local coordinates (e.g. OpAmp: ±10 in y, NOT ±12; Battery: ±30 in x; Resistor: ±30 in x). I keep getting these off-by-1 or off-by-2 because I read a comment that says «±12» instead of computing from the actual SVG path, or because I copy-paste from a different primitive that has a different pin geometry.

The fix is to derive pin coords from the primitive's actual SVG path math, NOT from a comment / memory / nearby file.

# Pin coordinates table (chris-pikul, after wrapper translate(-75,-75) scale(0.4))

The wrapper transform maps source y=50 → local y=-10, source y=100 → local y=+10, etc. Every primitive's pin endpoints derived from this:

| Primitive | Pin | Local (x, y) |
|---|---|---|
| Resistor / Capacitor / CapacitorElectrolytic / Inductor / InductorCore / Fuse / Crystal | p1, p2 | (±30, 0) |
| AcSource | p1, p2 | (±30, 0) |
| Battery / BatteryMulti | + (pin1), − (pin2) | (∓30, 0) — after mirror |
| Diode / LED / DiodeZener | anode (p1), cathode (p2) | (±30, 0) |
| TransistorNPN / PNP | base, collector, emitter | (−30, 0), (+10, ∓30), (+10, ±30) — see source |
| TransistorNMOS / PMOS | gate, drain, source | same shape |
| OpAmp | +in (top), −in (bottom), out | (−30, **−10**), (−30, **+10**), (+30, 0) ← NOT ±12 |
| SwitchSPST | p1, p2 | (±30, 0) |
| SwitchSPDT | common, NO, NC | (−30, 0), (+30, ∓15), (+30, ±15) — verify from source |
| Meter | p1, p2 | (±20, 0) — uses METER_PIN_SPAN=40, not default SPAN=60 |
| Ground | pin tip | (0, **−10**) for orient='right' — after pin-shortening; was −30 before May 2026 |
| Transformer | pri.p1, pri.p2, sec.p1, sec.p2 | (−30, ∓25), (+30, ∓25) ← NOT ±30 in y, NOT ±12 in x |

**Always cross-check the table by reading the primitive's actual SVG path** before writing wire coords. The table can drift after primitive edits.

# Mechanical gate

`scripts/check-wire-pin-alignment.mjs` (new, May 2026) — auto-discovers every diagram under `src/components/diagrams/`, parses Wire/component JSX, resolves all pin endpoints for each component (using the primitive→pin-coord table), and FAILS if any `<Wire>` endpoint coordinate doesn't match a known pin coord within 0 px tolerance (exact integer equality after constant resolution). Wired into `check:all`.

Past failures the gate would have caught:
- CascadedRcSchematic OPAMP_PLUS_IN_Y = BUF_OPAMP_Y - 12 (should have been -10) — 2-px gap, reader-flagged
- TransformerVoltageSchematic / TransformerImpedanceSchematic / BalunSchematic shipped with pin coords ±12 horizontal / ±30 vertical from old ARRL stubs; should be ±30 horizontal / ±25 vertical for chris-pikul — caught only after the rail-doesn't-meet-coil renderings

# Workflow before saying «done» on any schematic

1. For every `<Component …>` placed in the schematic, write down its pin endpoint coords (use the table above + the primitive source).
2. For every `<Wire points={[…, last]} />`, check that `last` equals a known pin coord.
3. Run `npm run check:wire-pin-alignment` — must pass.
4. Then run the visual verify (per [feedback_verify_visually_before_done.md](feedback_verify_visually_before_done.md)).

Skipping any step = ship a broken schematic. Has happened 5+ times in May 2026 alone.
