import { describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import { useState } from 'react'
import { useEventListener } from './useEventListener'

describe('useEventListener', () => {
  it('attaches a window listener and fires the handler', () => {
    const handler = vi.fn()
    function C() {
      useEventListener('click', handler)
      return null
    }
    render(<C />)

    act(() => {
      window.dispatchEvent(new Event('click'))
    })

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('removes the listener on unmount', () => {
    const handler = vi.fn()
    function C() {
      useEventListener('click', handler)
      return null
    }
    const { unmount } = render(<C />)

    unmount()
    act(() => {
      window.dispatchEvent(new Event('click'))
    })

    expect(handler).not.toHaveBeenCalled()
  })

  it('uses the latest handler without re-binding the listener', () => {
    // If the listener were re-bound on every render, an inline-arrow handler
    // would still work — this test guards against the opposite bug: stale
    // closure capture (handler frozen on first render).
    const addSpy = vi.spyOn(window, 'addEventListener')
    let captured = 0

    function C() {
      const [n, setN] = useState(0)
      useEventListener('click', () => {
        captured = n
      })
      return <button onClick={() => setN(n + 1)}>{n}</button>
    }
    const { getByRole } = render(<C />)

    // Re-render via state change a few times
    act(() => getByRole('button').click())
    act(() => getByRole('button').click())
    act(() => getByRole('button').click())

    // Now fire a window click — it should see n=3, not 0.
    act(() => {
      window.dispatchEvent(new Event('click'))
    })
    expect(captured).toBe(3)

    // The listener should have been added exactly once across the renders.
    const addCalls = addSpy.mock.calls.filter(([type]) => type === 'click')
    expect(addCalls.length).toBe(1)
    addSpy.mockRestore()
  })

  it('attaches to a custom target (MediaQueryList)', () => {
    const handler = vi.fn()
    const mql = window.matchMedia('(min-width: 1024px)')

    function C() {
      useEventListener('change', handler, mql)
      return null
    }
    render(<C />)

    act(() => {
      mql.dispatchEvent(new Event('change'))
    })

    // matchMedia is mocked in setup; addEventListener is a vi.fn(), so the
    // dispatch above is a no-op. But the hook should have called addEventListener
    // on the mql exactly once.
    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function), undefined)

    // Direct invocation simulates the browser firing the event.
    const [, listener] = (mql.addEventListener as ReturnType<typeof vi.fn>).mock.calls[0]
    ;(listener as (e: Event) => void)(new Event('change'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('handles custom event names', () => {
    const handler = vi.fn()
    function C() {
      useEventListener('radiopedia:test-event', handler)
      return null
    }
    render(<C />)

    act(() => {
      window.dispatchEvent(new CustomEvent('radiopedia:test-event', { detail: 42 }))
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent)
  })
})
