import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import SwrToReflectedPower from './SwrToReflectedPower'

describe('SwrToReflectedPower', () => {
  it('shows 11.1 % reflected and Γ ≈ 0.33 at the default SWR 2.0', () => {
    const { container } = renderWithProviders(<SwrToReflectedPower />)
    expect(container.textContent).toMatch(/0\.33/) // |Γ|
    expect(container.textContent).toMatch(/11\.1/) // % reflected and reflected watts
  })

  it('splits 100 W into 88.9 W delivered and 11.1 W reflected at SWR 2.0', () => {
    const { container } = renderWithProviders(<SwrToReflectedPower />)
    expect(container.textContent).toMatch(/88\.9/) // delivered
    expect(container.textContent).toMatch(/11\.1/) // reflected
  })

  it('reports a perfect match (0 % reflected, ∞ return loss) at SWR 1.0', () => {
    const { container } = renderWithProviders(<SwrToReflectedPower />)
    fireEvent.change(container.querySelector('input#swrp-swr') as HTMLInputElement, { target: { value: '1' } })
    expect(container.textContent).toMatch(/0\.00/) // |Γ|
    expect(container.textContent).toMatch(/∞/) // infinite return loss
    expect(container.textContent).toMatch(/100\.0/) // all 100 W delivered
  })

  it('gives 25 % reflected and Γ = 0.50 at SWR 3.0', () => {
    const { container } = renderWithProviders(<SwrToReflectedPower />)
    fireEvent.change(container.querySelector('input#swrp-swr') as HTMLInputElement, { target: { value: '3' } })
    expect(container.textContent).toMatch(/0\.50/)
    expect(container.textContent).toMatch(/25\.0/)
  })

  it('hides the power split when the forward power is invalid', () => {
    const { container } = renderWithProviders(<SwrToReflectedPower />)
    fireEvent.change(container.querySelector('input#swrp-pf') as HTMLInputElement, { target: { value: '' } })
    // Γ readout still present, power split replaced by the invalid notice
    expect(container.textContent).toMatch(/0\.33/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<SwrToReflectedPower />, { language: 'uk' })
    expect(container.querySelector('input#swrp-swr')).not.toBeNull()
  })
})
