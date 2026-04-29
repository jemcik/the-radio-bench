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

  it('renders example LC pair labels (L on one line, × C on the next)', () => {
    const { container } = renderWithProviders(<LcResonanceScale />)
    const text = container.textContent ?? ''
    // L and C live on separate <text> lines, so check for each independently.
    expect(text).toContain('4 µH')
    expect(text).toContain('× 130 pF')
  })

  it('renders frequency-axis decade labels via i18n units', () => {
    const { container } = renderWithProviders(<LcResonanceScale />)
    const text = container.textContent ?? ''
    expect(text).toContain('1 MHz')
    expect(text).toContain('1 GHz')
  })

  it('renders Cyrillic unit suffixes in Ukrainian locale', () => {
    const { container } = renderWithProviders(<LcResonanceScale />, { language: 'uk' })
    const text = container.textContent ?? ''
    // Decade tick + L + C all flow through t('units.X')
    expect(text).toContain('1 МГц')
    expect(text).toContain('4 мкГн')
    expect(text).toContain('× 130 пФ')
  })
})
