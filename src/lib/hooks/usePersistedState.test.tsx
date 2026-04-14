import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { codec, readPersisted, usePersistedState } from './usePersistedState'

/* ── readPersisted ──────────────────────────────────────────────────── */

describe('readPersisted', () => {
  it('returns initial when key missing', () => {
    expect(readPersisted('missing', 'fallback', codec.string)).toBe('fallback')
  })

  it('returns deserialized value when key present', () => {
    localStorage.setItem('k', '42')
    expect(readPersisted('k', 0, codec.number)).toBe(42)
  })

  it('returns initial on deserialize error', () => {
    localStorage.setItem('k', 'not-json')
    expect(readPersisted<{ a: number }>('k', { a: 1 }, codec.json())).toEqual({ a: 1 })
  })
})

/* ── codecs ─────────────────────────────────────────────────────────── */

describe('codec', () => {
  it('string codec is identity', () => {
    expect(codec.string.serialize('hello')).toBe('hello')
    expect(codec.string.deserialize('hello')).toBe('hello')
  })

  it('number codec round-trips', () => {
    expect(codec.number.serialize(3)).toBe('3')
    expect(codec.number.deserialize('3')).toBe(3)
  })

  it('boolean codec uses 1/0 (matches existing storage format)', () => {
    expect(codec.boolean.serialize(true)).toBe('1')
    expect(codec.boolean.serialize(false)).toBe('0')
    expect(codec.boolean.deserialize('1')).toBe(true)
    expect(codec.boolean.deserialize('0')).toBe(false)
    // Anything other than '1' is false — covers legacy values.
    expect(codec.boolean.deserialize('')).toBe(false)
  })

  it('json codec round-trips arbitrary values', () => {
    const c = codec.json<{ list: number[] }>()
    const value = { list: [1, 2, 3] }
    expect(c.deserialize(c.serialize(value))).toEqual(value)
  })
})

/* ── usePersistedState ──────────────────────────────────────────────── */

describe('usePersistedState', () => {
  it('returns initial value when storage is empty', () => {
    const { result } = renderHook(() => usePersistedState('k', 'init', codec.string))
    expect(result.current[0]).toBe('init')
  })

  it('hydrates from localStorage if present', () => {
    localStorage.setItem('k', 'saved')
    const { result } = renderHook(() => usePersistedState('k', 'init', codec.string))
    expect(result.current[0]).toBe('saved')
  })

  it('persists updates to localStorage on change', () => {
    const { result } = renderHook(() => usePersistedState('k', 0, codec.number))
    act(() => result.current[1](7))
    expect(result.current[0]).toBe(7)
    expect(localStorage.getItem('k')).toBe('7')
  })

  it('writes the initial value on mount (so first read is consistent)', () => {
    renderHook(() => usePersistedState('k', 'first', codec.string))
    expect(localStorage.getItem('k')).toBe('first')
  })

  it('accepts a lazy initializer that is called once', () => {
    const init = vi.fn((): string => 'lazy')
    renderHook(() => usePersistedState<string>('k', init, codec.string))
    expect(init).toHaveBeenCalledTimes(1)
  })

  it('uses the json codec for arrays/objects', () => {
    const { result } = renderHook(() => usePersistedState<number[]>('k', [], codec.json()))
    act(() => result.current[1]([1, 2, 3]))
    expect(localStorage.getItem('k')).toBe('[1,2,3]')
    expect(result.current[0]).toEqual([1, 2, 3])
  })

  it('does not crash if localStorage.setItem throws (quota exceeded etc.)', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(() =>
      renderHook(() => usePersistedState('k', 'x', codec.string)),
    ).not.toThrow()
    setItem.mockRestore()
  })

  it('falls back to initial when stored JSON is corrupt', () => {
    localStorage.setItem('k', '{not valid json}')
    const { result } = renderHook(() =>
      usePersistedState<{ n: number }>('k', { n: 5 }, codec.json()),
    )
    expect(result.current[0]).toEqual({ n: 5 })
  })
})
