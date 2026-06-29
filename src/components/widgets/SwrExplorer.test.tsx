import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import SwrExplorer from './SwrExplorer'

describe('SwrExplorer', () => {
  it('shows SWR ≈ 1.46 and |Γ| ≈ 0.19 for the default 73 Ω dipole on 50 Ω', () => {
    const { container } = renderWithProviders(<SwrExplorer />)
    expect(container.textContent).toMatch(/1\.46/)
    expect(container.textContent).toMatch(/0\.19/)
  })

  it('reports a perfect match at 50 Ω', () => {
    const { container } = renderWithProviders(<SwrExplorer />)
    fireEvent.change(container.querySelector('input#swr-r') as HTMLInputElement, { target: { value: '50' } })
    expect(container.textContent).toMatch(/1\.00/) // SWR 1.00 : 1
    expect(container.textContent).toMatch(/0\.00/) // |Γ| 0.00
    expect(container.textContent).toMatch(/∞/) // infinite return loss
  })

  it('gives SWR 3.00 and 25 % reflected at 150 Ω', () => {
    const { container } = renderWithProviders(<SwrExplorer />)
    fireEvent.change(container.querySelector('input#swr-r') as HTMLInputElement, { target: { value: '150' } })
    expect(container.textContent).toMatch(/3\.00/)
    expect(container.textContent).toMatch(/0\.50/)
    expect(container.textContent).toMatch(/25\.0/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<SwrExplorer />, { language: 'uk' })
    expect(container.querySelector('input#swr-r')).not.toBeNull()
  })
})
