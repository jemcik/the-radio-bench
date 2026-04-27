import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import LcResonanceScale from './LcResonanceScale'

describe('LcResonanceScale', () => {
  it('renders the four band labels (MF / HF / VHF / UHF)', () => {
    const { container } = renderWithProviders(<LcResonanceScale />)
    const text = container.textContent ?? ''
    expect(text).toContain('MF')
    expect(text).toContain('HF')
    expect(text).toContain('VHF')
    expect(text).toContain('UHF')
  })

  it('renders example LC pair labels (× separator)', () => {
    const { container } = renderWithProviders(<LcResonanceScale />)
    const text = container.textContent ?? ''
    expect(text).toMatch(/4\s*µH\s*×\s*130\s*pF/)
  })

  it('renders frequency-axis decade labels', () => {
    const { container } = renderWithProviders(<LcResonanceScale />)
    const text = container.textContent ?? ''
    expect(text).toContain('1 MHz')
    expect(text).toContain('1 GHz')
  })
})
