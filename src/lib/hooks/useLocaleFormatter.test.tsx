import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { useLocaleFormatter, useUnitFormatter } from './useLocaleFormatter'

// Standalone i18n instance for these tests so we don't depend on app config.
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: {}, ui: { units: { hz: 'Hz', dbm: 'dBm' } } },
    uk: { translation: {}, ui: { units: { hz: 'Гц', dbm: 'дБм' } } },
  },
  interpolation: { escapeValue: false },
})

describe('useLocaleFormatter', () => {
  it('exposes the current locale', () => {
    const { result } = renderHook(() => useLocaleFormatter())
    expect(result.current.locale).toBe('en')
  })

  it('formats numbers with the active locale separator', () => {
    const { result } = renderHook(() => useLocaleFormatter())
    expect(result.current.fmt(20, 2)).toBe('20.00')
    expect(result.current.num(2.5)).toBe('2.5')
  })

  it('switches separator when the language changes', async () => {
    const { result, rerender } = renderHook(() => useLocaleFormatter())
    await act(async () => { await i18n.changeLanguage('uk') })
    rerender()
    expect(result.current.fmt(20, 2)).toBe('20,00')
    expect(result.current.num(2.5)).toBe('2,5')
    await act(async () => { await i18n.changeLanguage('en') })
  })
})

describe('useUnitFormatter', () => {
  it('looks up unit symbols from the units namespace', () => {
    const { result } = renderHook(() => useUnitFormatter())
    expect(result.current('hz')).toBe('Hz')
    expect(result.current('dbm')).toBe('dBm')
  })

  it('returns localized symbols when the language changes', async () => {
    const { result, rerender } = renderHook(() => useUnitFormatter())
    await act(async () => { await i18n.changeLanguage('uk') })
    rerender()
    expect(result.current('hz')).toBe('Гц')
    expect(result.current('dbm')).toBe('дБм')
    await act(async () => { await i18n.changeLanguage('en') })
  })
})
