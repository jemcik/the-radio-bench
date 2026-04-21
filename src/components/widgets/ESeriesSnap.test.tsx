import { describe, expect, it } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import ESeriesSnap from './ESeriesSnap'

/* E-series snap-to-value widget smoke tests.
 *
 * The default target is 5000 Ω — the "5 kΩ that isn't available" worked
 * example from the chapter. That target snaps to specific preferred
 * values in each series:
 *
 *   E12 (±10 %) → 4.7 kΩ   (−6 %)
 *   E24 (±5 %)  → 5.1 kΩ   (+2 %)
 *   E48 (±2 %)  → 4.99 kΩ  (−0.2 %)
 *   E96 (±1 %)  → 4.99 kΩ  (−0.2 %)
 *
 * Both E48 and E96 include 4.99 kΩ, which is the closest preferred
 * value to 5.00 kΩ. The tests pin the E12 and E24 choices (where the
 * series difference is visible) so a future change to the snap
 * algorithm can't silently break the teaching.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<ESeriesSnap />, { language })
}

describe('ESeriesSnap', () => {
  it('snaps 5000 Ω to 4.7 kΩ in E12', () => {
    const { container } = setup()
    expect(container.textContent).toContain('4.7 kΩ')
  })

  it('snaps 5000 Ω to 5.1 kΩ in E24', () => {
    const { container } = setup()
    expect(container.textContent).toContain('5.1 kΩ')
  })

  it('shows an error percentage per row', () => {
    const { container } = setup()
    // E12 is 6 % low. Match either EN ("−6.0 %" style) or the sign-less
    // form "6.0 %". The leading minus depends on the locale formatter.
    expect(container.textContent).toMatch(/-?6\.0 %|−6\.0 %/)
  })

  it('recomputes when the target value changes', () => {
    setup()
    const input = screen.getByLabelText(/target/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: '10000' } })
    // 10 kΩ is on every E-series on the nose. Every row should now
    // report 10 kΩ. Ensure "10 kΩ" appears at least twice in the
    // readout area (once per series).
    const matches = document.body.textContent?.match(/10 kΩ/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(4)
  })

  it('uses a comma separator in UK locale', () => {
    const { container } = setup('uk')
    // E12 snap = 4.7 kΩ → "4,7 кОм" in UK locale.
    expect(container.textContent).toMatch(/4,7\s*кОм/)
  })
})
