import { describe, expect, it } from 'vitest'
import { naturalToDb, dbToNatural } from './decibel'

describe('naturalToDb', () => {
  it('handles power-ratio landmarks', () => {
    expect(naturalToDb(1, 'power')).toBe(0)
    expect(naturalToDb(10, 'power')).toBeCloseTo(10, 6)
    expect(naturalToDb(100, 'power')).toBeCloseTo(20, 6)
    expect(naturalToDb(0.5, 'power')).toBeCloseTo(-3.0103, 4)
  })

  it('handles voltage-ratio landmarks (20·log)', () => {
    expect(naturalToDb(1, 'voltage')).toBe(0)
    expect(naturalToDb(2, 'voltage')).toBeCloseTo(6.0206, 4)
    expect(naturalToDb(10, 'voltage')).toBeCloseTo(20, 6)
  })

  it('handles dBm landmarks (1 mW reference)', () => {
    expect(naturalToDb(0.001, 'dbm')).toBe(0)
    expect(naturalToDb(1, 'dbm')).toBeCloseTo(30, 6)
    expect(naturalToDb(0.1, 'dbm')).toBeCloseTo(20, 6)
  })
})

describe('dbToNatural', () => {
  it('inverts the power-ratio mapping', () => {
    expect(dbToNatural(0, 'power')).toBe(1)
    expect(dbToNatural(10, 'power')).toBeCloseTo(10, 6)
    expect(dbToNatural(20, 'power')).toBeCloseTo(100, 4)
  })

  it('inverts the voltage-ratio mapping', () => {
    expect(dbToNatural(0, 'voltage')).toBe(1)
    expect(dbToNatural(6, 'voltage')).toBeCloseTo(1.99526, 4)
    expect(dbToNatural(20, 'voltage')).toBeCloseTo(10, 4)
  })

  it('inverts the dBm mapping (returns watts)', () => {
    expect(dbToNatural(0, 'dbm')).toBeCloseTo(0.001, 6)
    expect(dbToNatural(30, 'dbm')).toBeCloseTo(1, 4)
  })

  it('roundtrips: dbToNatural(naturalToDb(x)) ≈ x', () => {
    for (const v of [0.5, 1, 2, 10, 100, 1000]) {
      expect(dbToNatural(naturalToDb(v, 'power'), 'power')).toBeCloseTo(v, 4)
      expect(dbToNatural(naturalToDb(v, 'voltage'), 'voltage')).toBeCloseTo(v, 4)
    }
  })

  it('captures the ratio-trap: 6 dB voltage ≈ 3 dB power', () => {
    // Doubling voltage = 6 dB; doubling power = 3 dB. Same physical doubling.
    expect(naturalToDb(2, 'voltage')).toBeCloseTo(6.02, 2)
    expect(naturalToDb(2, 'power')).toBeCloseTo(3.01, 2)
  })
})
