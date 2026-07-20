import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import BodyCurrentCalculator from './BodyCurrentCalculator'

/**
 * These assertions are the chapter's safety claims in executable form. If one
 * of them ever fails, either the IEC 60479-1 Table 1 data was edited or the
 * interpolation broke — and the prose around the widget would then be lying.
 */
describe('BodyCurrentCalculator', () => {
  it('defaults to 230 V on a typical body — 1346 Ω, 170.9 mA', () => {
    const { container } = renderWithProviders(<BodyCurrentCalculator />)
    // Interpolating the 220 V row (1350 Ω) toward the 1000 V row (1050 Ω):
    // 1350 + (10/780)(1050−1350) = 1346.15 Ω → 230/1346.15 × 1000 = 170.86 mA
    expect(container.textContent).toMatch(/1346/)
    expect(container.textContent).toMatch(/170\.9/)
    expect(container.textContent).toMatch(/The heart can fibrillate/)
  })

  it('lands in the fibrillation zone at 230 V even for the MOST resistant body', () => {
    const { container } = renderWithProviders(<BodyCurrentCalculator />)
    const sel = container.querySelector('select#bc-pct') as HTMLSelectElement
    fireEvent.change(sel, { target: { value: 'p95' } })
    // 95th percentile at 220 V = 2125 Ω → interpolated at 230 V ≈ 2117 Ω
    // → 230/2117 × 1000 ≈ 108.6 mA, still far above the ~40 mA threshold.
    expect(container.textContent).toMatch(/108\.6/)
    expect(container.textContent).toMatch(/The heart can fibrillate/)
  })

  it('is the same story for the least resistant body, only worse', () => {
    const { container } = renderWithProviders(<BodyCurrentCalculator />)
    const sel = container.querySelector('select#bc-pct') as HTMLSelectElement
    fireEvent.change(sel, { target: { value: 'p5' } })
    // 5th percentile at 220 V = 1000 Ω → ≈ 996 Ω at 230 V → ≈ 230.9 mA
    expect(container.textContent).toMatch(/230\.9/)
    expect(container.textContent).toMatch(/The heart can fibrillate/)
  })

  it('impedance FALLS as touch voltage rises — the counter-intuitive core', () => {
    const { container } = renderWithProviders(<BodyCurrentCalculator />)
    const v = container.querySelector('input#bc-volts') as HTMLInputElement
    fireEvent.change(v, { target: { value: '25' } })
    expect(container.textContent).toMatch(/3250/) // typical body at 25 V
    fireEvent.change(v, { target: { value: '100' } })
    expect(container.textContent).toMatch(/1875/) // ...and at 100 V
  })

  it('a low voltage lands in the let-go band (5–10 mA)', () => {
    const { container } = renderWithProviders(<BodyCurrentCalculator />)
    const v = container.querySelector('input#bc-volts') as HTMLInputElement
    fireEvent.change(v, { target: { value: '25' } })
    // 25 V / 3250 Ω = 7.7 mA → inside the 5–10 mA let-go band, whose plain-
    // language label is «Getting hard to let go» (see shockZoneLetGo).
    expect(container.textContent).toMatch(/7\.7/)
    expect(container.textContent).toMatch(/Getting hard to let go/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<BodyCurrentCalculator />, { language: 'uk' })
    expect(container.querySelector('input#bc-volts')).not.toBeNull()
    expect(container.querySelector('select#bc-pct')).not.toBeNull()
  })
})
