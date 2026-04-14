import { describe, expect, it } from 'vitest'
import { SI_PREFIXES, UNITY_PREFIX_INDEX } from './prefixes'

describe('SI_PREFIXES', () => {
  it('covers pico through tera (nine entries)', () => {
    expect(SI_PREFIXES).toHaveLength(9)
    const names = SI_PREFIXES.map(p => p.name)
    expect(names).toEqual(['pico', 'nano', 'micro', 'milli', 'none', 'kilo', 'mega', 'giga', 'tera'])
  })

  it('exponents are strictly ascending (no drift between copies)', () => {
    const exponents = SI_PREFIXES.map(p => p.exponent)
    for (let i = 1; i < exponents.length; i++) {
      expect(exponents[i]).toBeGreaterThan(exponents[i - 1])
    }
  })

  it('engineering-scale exponents are all multiples of 3', () => {
    SI_PREFIXES.forEach(p => {
      // `% 3` can return -0 for negative exponents; abs() normalises that
      // so the assertion isn't tripped by +0 vs -0 identity.
      expect(Math.abs(p.exponent % 3)).toBe(0)
    })
  })

  it('unity prefix uses an empty symbol', () => {
    const unity = SI_PREFIXES.find(p => p.exponent === 0)!
    expect(unity.symbol).toBe('')
    expect(unity.name).toBe('none')
  })

  it('UNITY_PREFIX_INDEX points at the 10⁰ row', () => {
    expect(SI_PREFIXES[UNITY_PREFIX_INDEX].exponent).toBe(0)
  })

  it('every prefix carries matching powerLabel and valueLabel', () => {
    const kilo = SI_PREFIXES.find(p => p.name === 'kilo')!
    expect(kilo.powerLabel).toBe('10³')
    expect(kilo.valueLabel).toBe('1 000')
    expect(kilo.symbol).toBe('k')

    const micro = SI_PREFIXES.find(p => p.name === 'micro')!
    expect(micro.powerLabel).toBe('10⁻⁶')
    expect(micro.valueLabel).toBe('0.000001')
    expect(micro.symbol).toBe('µ')
  })

  it('nameKey and exampleKey follow the ch0_3 convention', () => {
    const mega = SI_PREFIXES.find(p => p.name === 'mega')!
    expect(mega.nameKey).toBe('prefixMega')
    expect(mega.exampleKey).toBe('prefixMegaEx')
  })
})
