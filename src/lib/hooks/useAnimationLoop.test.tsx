import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAnimationLoop, type FrameInfo } from './useAnimationLoop'

/* ── A hand-cranked requestAnimationFrame ────────────────────────────────── */

let queue: Array<{ id: number; cb: FrameRequestCallback }> = []
let nextId = 1

/** Run every queued frame callback once with the given timestamp. */
function frame(now: number) {
  const batch = queue
  queue = []
  act(() => {
    for (const { cb } of batch) cb(now)
  })
}

/* ── A controllable IntersectionObserver ─────────────────────────────────── */

type IOCallback = (entries: Array<Pick<IntersectionObserverEntry, 'isIntersecting'>>) => void
let observers: Array<{ cb: IOCallback; observed: Element[]; disconnected: boolean }> = []

function report(isIntersecting: boolean) {
  act(() => {
    for (const o of observers) if (!o.disconnected) o.cb([{ isIntersecting }])
  })
}

/* ── matchMedia with a switchable reduced-motion preference ──────────────── */

let reducedMotion = false
let motionListeners: Array<(e: { matches: boolean }) => void> = []

function setReducedMotion(matches: boolean) {
  reducedMotion = matches
  act(() => {
    for (const l of motionListeners) l({ matches })
  })
}

beforeEach(() => {
  queue = []
  nextId = 1
  observers = []
  reducedMotion = false
  motionListeners = []

  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextId++
    queue.push({ id, cb })
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    queue = queue.filter(q => q.id !== id)
  })
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      private entry: { cb: IOCallback; observed: Element[]; disconnected: boolean }
      constructor(cb: IOCallback) {
        this.entry = { cb, observed: [], disconnected: false }
        observers.push(this.entry)
      }
      observe(el: Element) {
        this.entry.observed.push(el)
      }
      unobserve() {}
      disconnect() {
        this.entry.disconnected = true
      }
    },
  )
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      get matches() {
        return query.includes('reduce') ? reducedMotion : false
      },
      media: query,
      addEventListener: (_: string, l: (e: { matches: boolean }) => void) => {
        motionListeners.push(l)
      },
      removeEventListener: (_: string, l: (e: { matches: boolean }) => void) => {
        motionListeners = motionListeners.filter(x => x !== l)
      },
    }),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function mount(opts: { enabled?: boolean } = {}) {
  const frames: FrameInfo[] = []
  const el = document.createElement('div')
  document.body.appendChild(el)
  const target = { current: el }
  const hook = renderHook(
    ({ enabled }) => useAnimationLoop(target, f => frames.push({ ...f }), { enabled }),
    { initialProps: { enabled: opts.enabled ?? true } },
  )
  return { frames, el, ...hook }
}

describe('useAnimationLoop', () => {
  it('does not run a single frame until the observer reports the element on screen', () => {
    const { frames } = mount()
    expect(observers).toHaveLength(1)
    expect(queue).toHaveLength(0)

    report(true)
    expect(queue).toHaveLength(1)
    frame(1000)
    frame(1016)
    expect(frames.map(f => f.dt)).toEqual([0, 16])
    expect(frames.map(f => f.elapsed)).toEqual([0, 16])
  })

  it('stops off-screen and resumes with `elapsed` frozen across the pause', () => {
    const { frames } = mount()
    report(true)
    frame(1000)
    frame(1016)
    frame(1032)
    expect(frames.at(-1)?.elapsed).toBe(32)

    report(false)
    expect(queue).toHaveLength(0) // frame cancelled, nothing scheduled

    // A long time passes while the diagram is scrolled away.
    report(true)
    frame(9000)
    frame(9016)
    expect(frames.slice(-2).map(f => f.dt)).toEqual([0, 16])
    expect(frames.at(-1)?.elapsed).toBe(48) // 32 + 0 + 16 — the 8 s away did not count
  })

  it('never starts under prefers-reduced-motion, and stops when it is switched on', () => {
    reducedMotion = true
    const a = mount()
    report(true)
    expect(queue).toHaveLength(0)
    expect(a.frames).toHaveLength(0)
    a.unmount()

    reducedMotion = false
    const b = mount()
    report(true)
    frame(100)
    expect(b.frames).toHaveLength(1)
    setReducedMotion(true)
    expect(queue).toHaveLength(0)
  })

  it('`enabled: false` runs nothing; flipping it on starts a fresh clock', () => {
    const { frames, rerender } = mount({ enabled: false })
    expect(observers).toHaveLength(0)
    expect(queue).toHaveLength(0)

    rerender({ enabled: true })
    report(true)
    frame(500)
    frame(520)
    expect(frames.map(f => f.elapsed)).toEqual([0, 20])

    rerender({ enabled: false })
    expect(queue).toHaveLength(0)
  })

  it('pauses while the document is hidden', () => {
    const { frames } = mount()
    report(true)
    frame(0)
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(queue).toHaveLength(0)
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    frame(5000)
    expect(frames.at(-1)).toMatchObject({ dt: 0, elapsed: 0 })
  })

  it('calls the latest callback without restarting the loop', () => {
    const el = document.createElement('div')
    const target = { current: el }
    const seen: string[] = []
    const { rerender } = renderHook(
      ({ label }) => useAnimationLoop(target, () => seen.push(label)),
      { initialProps: { label: 'a' } },
    )
    report(true)
    frame(0)
    rerender({ label: 'b' })
    expect(observers).toHaveLength(1) // no second observer — the effect did not re-run
    frame(16)
    expect(seen).toEqual(['a', 'b'])
  })

  it('cancels the pending frame and disconnects the observer on unmount', () => {
    const { unmount } = mount()
    report(true)
    expect(queue).toHaveLength(1)
    unmount()
    expect(queue).toHaveLength(0)
    expect(observers[0]?.disconnected).toBe(true)
  })

  it('`resetKey` restarts the clock without a remount', () => {
    const el = document.createElement('div')
    const target = { current: el }
    const frames: FrameInfo[] = []
    const { rerender } = renderHook(
      ({ key }) => useAnimationLoop(target, f => frames.push({ ...f }), { resetKey: key }),
      { initialProps: { key: 'a' } },
    )
    report(true)
    frame(100)
    frame(140)
    expect(frames.at(-1)?.elapsed).toBe(40)
    rerender({ key: 'b' })
    report(true) // the new effect observes afresh
    frame(200)
    frame(216)
    expect(frames.slice(-2).map(f => f.elapsed)).toEqual([0, 16])
  })

  it('treats a missing IntersectionObserver (jsdom) as always visible', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { frames } = mount()
    expect(queue).toHaveLength(1)
    frame(10)
    expect(frames).toHaveLength(1)
  })
})
