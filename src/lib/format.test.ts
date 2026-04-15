import { describe, expect, it } from 'vitest'
import { formatDecimal, formatNumber } from './format'

describe('formatDecimal', () => {
  it('uses a period for English locale', () => {
    expect(formatDecimal(20, 2, 'en')).toBe('20.00')
    expect(formatDecimal(3.014, 2, 'en')).toBe('3.01')
  })

  it('uses a comma for Ukrainian locale', () => {
    expect(formatDecimal(20, 2, 'uk')).toBe('20,00')
    expect(formatDecimal(3.014, 2, 'uk')).toBe('3,01')
  })

  it('respects the digits argument (including 0)', () => {
    expect(formatDecimal(1_000_000, 0, 'uk')).toBe('1000000')
    expect(formatDecimal(1.5, 0, 'uk')).toBe('2')
  })

  it('treats region-qualified locales (uk-UA) as Ukrainian', () => {
    expect(formatDecimal(1.5, 1, 'uk-UA')).toBe('1,5')
    expect(formatDecimal(1.5, 1, 'en-US')).toBe('1.5')
  })
})

describe('formatNumber', () => {
  it('preserves the number\'s natural precision', () => {
    expect(formatNumber(2.5, 'en')).toBe('2.5')
    expect(formatNumber(2.5, 'uk')).toBe('2,5')
  })

  it('returns integers unchanged across locales', () => {
    expect(formatNumber(100, 'en')).toBe('100')
    expect(formatNumber(100, 'uk')).toBe('100')
  })

  it('handles negative numbers', () => {
    expect(formatNumber(-3.14, 'uk')).toBe('-3,14')
  })
})
