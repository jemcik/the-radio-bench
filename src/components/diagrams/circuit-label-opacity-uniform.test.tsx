/**
 * «Every label-text in a Circuit primitive renders at full opacity» gate.
 *
 * Why
 * ───
 * Earlier the library had three different label helpers with three
 * different defaults:
 *   - PassiveLabel (Resistor, Capacitor, Inductor): no opacity →
 *     full 1.0 by default.
 *   - CenteredLabel (DiodeZener, Diode, LED, Transistor*): explicit
 *     `opacity={0.7}` on the value.
 *   - OrientedLabel (used by switches, fuses, multi-cell batteries):
 *     explicit `opacity={0.7}` on the value.
 *   - Battery's own inline path: full opacity if `valueIsPrimary`,
 *     `0.7` if not.
 *
 * The user spotted this on the Zener regulator widget where R_s’s
 * V_Rs reading was solid and the Zener’s V_Z reading was visibly
 * dimmer — they sit centimetres apart on the same schematic and
 * read as «something is wrong with the Zener’s value». Asked
 * directly: «що ти зробиш, щоб такого більше ніколи не було?»
 *
 * The fix removed the `opacity={0.7}` from CenteredLabel,
 * OrientedLabel, and Battery’s helper. This gate locks the contract:
 * every primitive that takes both a label and a value must render
 * BOTH at full opacity (or no `opacity` attribute at all). If a future
 * change re-introduces dimming, every primitive that uses the dimmed
 * path will fail this test.
 *
 * What this gate does
 * ───────────────────
 * Renders every two-pin and three-pin primitive that accepts
 * (label, value) with sample inputs, walks every `<text>` element in
 * the resulting SVG, and asserts that any `opacity` attribute (if
 * present) equals 1.
 *
 * Out of scope (deliberate)
 * ─────────────────────────
 *   • Polarity / decorative marks like the «+» on electrolytic
 *     capacitors that explicitly use opacity=0.5 for visual subtlety.
 *     Those are not «label-text»; they’re part of the symbol body.
 *     Filtered out by checking that the text is not inside the
 *     symbol’s rotated `<g transform="...">` group (label helpers
 *     render their texts OUTSIDE that group, decorative marks
 *     INSIDE).
 */
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import {
  Circuit,
  Resistor,
  Capacitor,
  Inductor,
  Battery,
  BatteryMulti,
  AcSource,
} from '@/lib/circuit'
import {
  Diode,
  DiodeZener,
  LED,
  TransistorNPN,
  TransistorPNP,
} from '@/lib/circuit/symbols/semiconductors'

interface PrimitiveCase {
  name: string
  el: React.ReactElement
}

const CASES: PrimitiveCase[] = [
  { name: 'Resistor (horizontal, label+value)',
    el: <Resistor x={100} y={50} label="R_1" value="1 kΩ" /> },
  { name: 'Resistor (vertical, label+value)',
    el: <Resistor x={100} y={50} orient="down" label="R_2" value="2 kΩ" /> },
  { name: 'Capacitor (horizontal, label+value)',
    el: <Capacitor x={100} y={50} label="C_1" value="100 nF" /> },
  { name: 'Inductor (horizontal, label+value)',
    el: <Inductor x={100} y={50} label="L_1" value="10 mH" /> },
  { name: 'Battery (vertical, label+value)',
    el: <Battery x={100} y={100} orient="down" label="V_in" value="9 V" /> },
  { name: 'Battery (horizontal, label+value)',
    el: <Battery x={100} y={100} label="B_1" value="9 V" /> },
  { name: 'BatteryMulti (label+value)',
    el: <BatteryMulti x={100} y={100} label="B_2" value="3 V" /> },
  { name: 'AcSource (label+value)',
    el: <AcSource x={100} y={100} label="V_ac" value="230 V" /> },
  { name: 'Diode (label+value)',
    el: <Diode x={100} y={100} label="D_1" value="1N4148" /> },
  { name: 'DiodeZener (vertical, label+value)',
    el: <DiodeZener x={100} y={100} orient="up" label="Z" value="5.1 V" /> },
  { name: 'LED (label+value)',
    el: <LED x={100} y={100} label="LED1" value="red" /> },
  { name: 'TransistorNPN (label+value)',
    el: <TransistorNPN x={100} y={100} label="Q1" value="2N3904" /> },
  { name: 'TransistorPNP (label+value)',
    el: <TransistorPNP x={100} y={100} label="Q2" value="2N3906" /> },
]

describe('Circuit primitives: every label-text renders at full opacity', () => {
  for (const tc of CASES) {
    it(tc.name, () => {
      const { container } = render(
        <Circuit width={200} height={200}>
          {tc.el}
        </Circuit>,
      )
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)

      const offending: Array<{ text: string; opacity: string }> = []
      for (const svg of svgs) {
        const texts = svg.querySelectorAll('text')
        for (const t of texts) {
          // Only check label-helper texts: they live OUTSIDE any
          // rotated symbol-body group. Decorative marks (the «+» on
          // an electrolytic cap, polarity ticks on a battery) sit
          // INSIDE a `<g transform="translate ... rotate(...)">` and
          // are part of the symbol body, not labels — exempt.
          let inSymbolBody = false
          let parent: Element | null = t.parentElement
          while (parent && parent !== svg) {
            if (parent.tagName.toLowerCase() === 'g'
                && (parent.getAttribute('transform') ?? '').includes('rotate')) {
              inSymbolBody = true
              break
            }
            parent = parent.parentElement
          }
          if (inSymbolBody) continue

          const op = t.getAttribute('opacity')
          if (op === null) continue                 // no attribute → full
          const opNum = Number.parseFloat(op)
          if (Number.isNaN(opNum) || opNum < 1) {
            offending.push({
              text: (t.textContent ?? '').trim(),
              opacity: op,
            })
          }
        }
      }

      if (offending.length > 0) {
        const detail = offending
          .map(o => `  «${o.text}» at opacity=${o.opacity}`)
          .join('\n')
        throw new Error(
          `Found label-text rendered at opacity < 1:\n${detail}\n` +
          `Every primitive label helper must render text at full opacity. ` +
          `If you need a visually subtle annotation, use a different ` +
          `mechanism (background tone, smaller font) — not opacity, ` +
          `because mixed opacities across the same schematic read as ` +
          `«this label is wrong / less important».`,
        )
      }
    })
  }
})
