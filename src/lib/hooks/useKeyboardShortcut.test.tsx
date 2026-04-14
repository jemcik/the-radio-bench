import { describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import { useKeyboardShortcut } from './useKeyboardShortcut'

function dispatchKey(opts: {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  target?: HTMLElement
}) {
  const event = new KeyboardEvent('keydown', {
    key: opts.key,
    ctrlKey: !!opts.ctrl,
    metaKey: !!opts.meta,
    shiftKey: !!opts.shift,
    altKey: !!opts.alt,
    bubbles: true,
    cancelable: true,
  })
  act(() => {
    ;(opts.target ?? document).dispatchEvent(event)
  })
  return event
}

describe('useKeyboardShortcut', () => {
  it('fires on the matching key (no modifiers)', () => {
    const handler = vi.fn()
    function C() {
      useKeyboardShortcut('Escape', handler)
      return null
    }
    render(<C />)

    dispatchKey({ key: 'Escape' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not fire on a different key', () => {
    const handler = vi.fn()
    function C() {
      useKeyboardShortcut('Escape', handler)
      return null
    }
    render(<C />)

    dispatchKey({ key: 'a' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('matches case-insensitively for letter keys', () => {
    const handler = vi.fn()
    function C() {
      useKeyboardShortcut('k', handler, { mod: true })
      return null
    }
    render(<C />)

    // Capital K (e.g. when shift+caps state varies). jsdom reports an empty
    // navigator.platform so the hook expects ctrlKey, not metaKey.
    dispatchKey({ key: 'K', ctrl: true })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('requires the mod key when mod is true', () => {
    const handler = vi.fn()
    function C() {
      useKeyboardShortcut('k', handler, { mod: true })
      return null
    }
    render(<C />)

    dispatchKey({ key: 'k' }) // no modifier
    expect(handler).not.toHaveBeenCalled()

    // Either metaKey (Mac) or ctrlKey (others) should work — the hook picks
    // the right one based on navigator.platform. In jsdom, navigator.platform
    // is empty so isMac is false → ctrlKey path.
    dispatchKey({ key: 'k', ctrl: true })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('rejects modifier-keyed presses when mod is false', () => {
    const handler = vi.fn()
    function C() {
      useKeyboardShortcut('k', handler)
      return null
    }
    render(<C />)

    dispatchKey({ key: 'k', ctrl: true })
    dispatchKey({ key: 'k', meta: true })
    expect(handler).not.toHaveBeenCalled()
  })

  it('preventDefault by default', () => {
    function C() {
      useKeyboardShortcut('k', () => {}, { mod: true })
      return null
    }
    render(<C />)

    const e = dispatchKey({ key: 'k', ctrl: true })
    expect(e.defaultPrevented).toBe(true)
  })

  it('skips when the event originates from an input', () => {
    const handler = vi.fn()
    function C() {
      useKeyboardShortcut('k', handler, { mod: true })
      return <input data-testid="i" />
    }
    const { getByTestId } = render(<C />)

    dispatchKey({ key: 'k', ctrl: true, target: getByTestId('i') as HTMLElement })
    expect(handler).not.toHaveBeenCalled()
  })

  it('respects ignoreInputs: false', () => {
    const handler = vi.fn()
    function C() {
      useKeyboardShortcut('k', handler, { mod: true, ignoreInputs: false })
      return <input data-testid="i" />
    }
    const { getByTestId } = render(<C />)

    dispatchKey({ key: 'k', ctrl: true, target: getByTestId('i') as HTMLElement })
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
