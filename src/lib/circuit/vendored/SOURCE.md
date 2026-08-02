# Vendored schematic symbols — chris-pikul/electronic-symbols

The SVG-derived TSX components in `src/lib/circuit/symbols/` are adapted from
**[chris-pikul/electronic-symbols](https://github.com/chris-pikul/electronic-symbols)**
(MIT-licensed).

## Source revision

- Repository: <https://github.com/chris-pikul/electronic-symbols>
- Commit: `9c22054b11cb865cda7c817e4a9f4a4d3be6256e`
- Captured: 2026-05-11

## What we adapted

- **Vendored, not depended on.** The MIT license permits copying with attribution;
  see `LICENSE-electronic-symbols.txt` next to this file.
- **Coordinate system.** Source uses a 150×150 viewBox with a 25-px grid; we map
  this to our internal SVG coordinate convention (`SPAN = 60`, half-span 30 for
  two-terminal components, `r = 15` for circle-bodied transistors / op-amps).
- **Colour.** Source uses hardcoded `stroke="#000"`; we replace with
  `stroke="currentColor"` so symbols pick up the theme foreground and adapt to
  dark mode.
- **Stroke width.** Source uses hardcoded `stroke-width="5"` (in the 150-px frame).
  We strip the inline value and inherit `STROKE` from the parent — single
  thickness across all symbols (no separate inner/outer detail strokes, per the
  May 2026 design decision to keep schematics visually uniform).
- **Pin geometry.** Each symbol exposes its pin coordinates via the
  `pins{Component}` helpers in `types.ts`, calibrated against the 150×150 source
  layout.

## Symbols we currently use

Generated 2026-05-11; updated when the symbol set changes.

| Our component | Source SVG |
|---|---|
| `TransistorNPN` | `Transistor-COM-BJT-NPN.svg` |
| `TransistorPNP` | `Transistor-COM-BJT-PNP.svg` |
| `TransistorNMOS` | `Transistor-COM-MOSFET-N-Enhancement.svg` |
| `TransistorPMOS` | `Transistor-COM-MOSFET-P-Enhancement.svg` |
| `OpAmp` | `IC-COM-OpAmp.svg` |
| `Diode` | `Diode-COM-Standard.svg` |
| `LED` | `Diode-COM-LED.svg` |
| `DiodeZener` | `Diode-COM-Zener.svg` |
| `Resistor` | `Resistor-IEEE-Standard.svg` |
| `Capacitor` | `Capacitor-IEEE-NonPolarized.svg` — **body redrawn**, see below |
| `CapacitorElectrolytic` | `Capacitor-IEEE-Polarized.svg` |
| `Inductor` | `Inductor-COM-Air.svg` |
| `InductorCore` | `Inductor-COM-Magnetic.svg` |
| `AcSource` | `Source-COM-AC.svg` |
| `Battery` | `Source-COM-Battery-Single.svg` |
| `BatteryMulti` | `Source-COM-Battery-Multiple.svg` |
| `Ground` | `Ground-COM-General.svg` |
| `GroundEarth` | `Ground-COM-Chassis.svg` |
| `Antenna` | `Antenna-COM-Aerial.svg` |
| `Crystal` | `Miscellaneous-COM-Crystal_Oscillator.svg` |
| `Transformer` | `Transformer-COM-Standard.svg` |
| `SwitchSPST` | `Switch-COM-SPST.svg` |
| `SwitchSPDT` | `Switch-COM-SPDT.svg` |
| `Fuse` | `Fuse-IEEE.svg` |
| `Meter` | *Not in source* — implemented locally (circle + V/A glyph) |
| `NodePoint` / `Tap` / `TerminalLabel` | *Not symbols* — wire annotations, implemented locally |

## Updating from upstream

If new revisions of upstream become useful:

1. Re-fetch the relevant SVGs from the new commit
2. Re-run the conversion script (`scripts/convert-electronic-symbol.mjs`)
3. Update the «Source revision» commit hash above
4. Re-verify pin coordinates in any symbol whose source path changed

## Deviations from upstream

- **`Capacitor` body redrawn (2026-08-02).** Upstream's
  `Capacitor-IEEE-NonPolarized.svg` draws one plate as a curve
  (`M54 44s12.5 12.25 12.5 31S54 106 54 106`), despite the file name. A curved
  plate is not a stylistic variant: in IEC 60617 and ANSI/IEEE 315 it marks the
  negative electrode of a *polarised* capacitor. We draw the non-polarised
  symbol the way both standards define it — two straight parallel plates — and
  keep the curve for `CapacitorElectrolytic`, where it belongs.
  `CapacitorVariable` inherits the straight-plate body for the same reason.
