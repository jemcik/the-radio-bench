import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import PepCalculator from './PepCalculator'

describe('PepCalculator', () => {
  it('gives 20 W average and a 0.20 ratio for a 100 W PEP SSB voice (default)', () => {
    const { container } = renderWithProviders(<PepCalculator />)
    expect(container.textContent).toMatch(/20 W/)
    expect(container.textContent).toMatch(/0\.20/)
  })

  it('makes average equal PEP for a steady carrier', () => {
    const { container } = renderWithProviders(<PepCalculator />)
    const mode = container.querySelector('select#pep-mode') as HTMLSelectElement
    fireEvent.change(mode, { target: { value: 'carrier' } })
    // ratio 1.0 → average = 100 W
    expect(container.textContent).toMatch(/100 W/)
    expect(container.textContent).toMatch(/1\.00/)
  })

  it('halves the PEP for the two-tone test', () => {
    const { container } = renderWithProviders(<PepCalculator />)
    const mode = container.querySelector('select#pep-mode') as HTMLSelectElement
    fireEvent.change(mode, { target: { value: 'twoTone' } })
    expect(container.textContent).toMatch(/50 W/)
    expect(container.textContent).toMatch(/0\.50/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<PepCalculator />, { language: 'uk' })
    expect(container.querySelector('input#pep-watts')).not.toBeNull()
  })
})
