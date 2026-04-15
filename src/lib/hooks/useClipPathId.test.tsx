import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useClipPathId } from './useClipPathId'

describe('useClipPathId', () => {
  it('produces an id that begins with the prefix', () => {
    const { result } = renderHook(() => useClipPathId('plot'))
    expect(result.current.startsWith('plot-')).toBe(true)
  })

  it('strips colons (which break url(#id) in some SVG renderers)', () => {
    const { result } = renderHook(() => useClipPathId('plot'))
    expect(result.current).not.toContain(':')
  })

  it('returns distinct ids for separate hook instances', () => {
    const { result: a } = renderHook(() => useClipPathId('plot'))
    const { result: b } = renderHook(() => useClipPathId('plot'))
    expect(a.current).not.toBe(b.current)
  })
})
