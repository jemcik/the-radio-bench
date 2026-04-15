import { describe, expect, it } from 'vitest'
import {
  formatDecimal,
  formatNumber,
  roundTo,
  formatScientific,
  formatHz,
} from './format'

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

describe('roundTo', () => {
  it('rounds to the given number of decimals', () => {
    expect(roundTo(1.23456, 2)).toBe(1.23)
    expect(roundTo(1.23456, 4)).toBe(1.2346)
    expect(roundTo(1.5, 0)).toBe(2)
  })

  it('swallows floating-point drift', () => {
    expect(roundTo(0.1 + 0.2, 4)).toBe(0.3)
  })

  it('handles negative numbers', () => {
    expect(roundTo(-1.235, 2)).toBe(-1.24)
  })
})

describe('formatScientific', () => {
  it('produces canonical mantissa·10ⁿ with localized separator', () => {
    expect(formatScientific(1.23e-9, 3, 'en')).toBe('1.23e-9')
    expect(formatScientific(1.23e-9, 3, 'uk')).toBe('1,23e-9')
  })

  it('trims trailing zeros from the mantissa', () => {
    expect(formatScientific(1.2e-9, 6, 'en')).toBe('1.2e-9')
    expect(formatScientific(1, 6, 'en')).toBe('1e+0')
  })

  it('returns the literal "0" for zero (avoids 0.00e+0)', () => {
    expect(formatScientific(0, 6, 'en')).toBe('0')
  })

  it('handles negative exponents', () => {
    expect(formatScientific(0.000005, 2, 'uk')).toBe('5e-6')
  })
})

describe('formatHz', () => {
  const tUnit = (k: string) =>
    ({ hz: 'Hz', khz: 'kHz', mhz: 'MHz' } as const)[k as 'hz' | 'khz' | 'mhz']

  it('returns Hz under 1 kHz', () => {
    expect(formatHz(440, tUnit, 'en')).toBe('440 Hz')
  })

  it('switches to kHz at 1 kHz with locale separator', () => {
    expect(formatHz(1500, tUnit, 'en')).toBe('1.5 kHz')
    expect(formatHz(1500, tUnit, 'uk')).toBe('1,5 kHz')
  })

  it('drops decimals once the value reaches 10 kHz / 10 MHz', () => {
    expect(formatHz(15_000, tUnit, 'en')).toBe('15 kHz')
    expect(formatHz(15_000_000, tUnit, 'en')).toBe('15 MHz')
  })

  it('switches to MHz at 1 MHz', () => {
    expect(formatHz(2_400_000, tUnit, 'en')).toBe('2.40 MHz')
  })
})
