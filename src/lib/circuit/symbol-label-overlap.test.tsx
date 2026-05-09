import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { CenteredLabel } from './SymbolLabel'
import { Diode, DiodeZener, LED, TransistorNPN, TransistorPNP } from './symbols/semiconductors'
import { Crystal } from './symbols/misc'
import { type Orientation } from './types'

/**
 * Regression suite: the «label-on-lead» class of bug.
 *
 * History — ch 1.10 bridge rectifier shipped with `<Diode orient="up">`
 * symbols whose labels («D1», «D2», «D3», «D4») rendered EXACTLY on the
 * vertical leads connecting the diodes into the circuit. Cause: the
 * `CenteredLabel` primitive (used by every centred-label symbol —
 * diodes, BJTs, crystals) ignored `orient` and always placed the label
 * above/below the symbol centre. For HORIZONTAL diodes that's empty
 * space (leads run left/right). For VERTICAL diodes that's the leads
 * themselves — so the label crashed into the wires.
 *
 * Fix: `CenteredLabel` now accepts `orient`. For vertical orientations
 * it places the label/value to the RIGHT of the symbol (start-anchored),
 * out of the lead column.
 *
 * These tests lock the contract for every centred-label symbol so the
 * same bug cannot regress chapter-by-chapter.
 *
 * Geometry budget: for a vertical symbol with leads on the y-axis at
 * x = centre_x, the label MUST sit at least 14 px away in absolute
 * x-distance. (Body half-width ≈ 8, lead-stroke half-width ≈ 1,
 * minimum readable gap ≈ 5 → safe floor of 14 px.)
 */

const VERT_LEAD_GUARD_PX = 14

function Svg({ children }: { children: React.ReactNode }) {
  return <svg data-testid="root">{children}</svg>
}

describe('CenteredLabel orient-awareness', () => {
  it.each(['up', 'down'] as const)(
    "vertical orient='%s' places the label OFF the lead column",
    orient => {
      const { container } = render(
        <Svg>
          <CenteredLabel x={100} y={50} orient={orient} label="D1" />
        </Svg>,
      )
      const text = container.querySelector('text')!
      const labelX = parseFloat(text.getAttribute('x') ?? '0')
      expect(Math.abs(labelX - 100)).toBeGreaterThanOrEqual(VERT_LEAD_GUARD_PX)
      expect(text.getAttribute('text-anchor')).toBe('start')
    },
  )

  it.each(['right', 'left'] as const)(
    "horizontal orient='%s' centres the label on the symbol axis (above body)",
    orient => {
      const { container } = render(
        <Svg>
          <CenteredLabel x={100} y={50} orient={orient} label="D1" />
        </Svg>,
      )
      const text = container.querySelector('text')!
      expect(text.getAttribute('x')).toBe('100')
      expect(text.getAttribute('text-anchor')).toBe('middle')
    },
  )

  it('vertical orient places value (when present) on same side as label', () => {
    const { container } = render(
      <Svg>
        <CenteredLabel x={100} y={50} orient="up" label="D1" value="1N4148" />
      </Svg>,
    )
    const [labelEl, valueEl] = Array.from(container.querySelectorAll('text'))
    expect(labelEl?.getAttribute('x')).toBe(valueEl?.getAttribute('x'))
    // Value sits BELOW label (positive y delta); both are on the right side.
    expect(parseFloat(valueEl?.getAttribute('y') ?? '0')).toBeGreaterThan(
      parseFloat(labelEl?.getAttribute('y') ?? '0'),
    )
  })
})

/**
 * For every centred-label symbol (diodes, transistors, crystal), verify
 * that vertical orientations place every rendered text label off the
 * lead column. Uses the same geometric guard as above.
 */
const SYMBOLS: Array<{
  name: string
  Component: React.FC<{ x: number; y: number; orient?: Orientation; label?: string }>
}> = [
  { name: 'Diode', Component: Diode },
  { name: 'DiodeZener', Component: DiodeZener },
  { name: 'LED', Component: LED },
  // BJTs use TransistorProps (with optional `circle`) — but our test only
  // passes the common props, which match. Cast at the call site.
  { name: 'TransistorNPN', Component: TransistorNPN as never },
  { name: 'TransistorPNP', Component: TransistorPNP as never },
  { name: 'Crystal', Component: Crystal },
]

describe.each(SYMBOLS)(
  '$name — label clears the lead column on vertical orientations',
  ({ Component }) => {
    it.each(['up', 'down'] as const)("orient='%s'", orient => {
      const { container } = render(
        <Svg>
          <Component x={100} y={100} orient={orient} label="X1" />
        </Svg>,
      )
      const labels = Array.from(container.querySelectorAll('text'))
      expect(labels.length).toBeGreaterThan(0)
      for (const t of labels) {
        const x = parseFloat(t.getAttribute('x') ?? '0')
        expect(Math.abs(x - 100)).toBeGreaterThanOrEqual(VERT_LEAD_GUARD_PX)
      }
    })
  },
)
