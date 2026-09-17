import { vi } from 'vitest'
import { act } from '@testing-library/react'

/**
 * Hand-cranked `requestAnimationFrame` for tests that drive an animation to
 * a known point (`frame(0)` then `frame(6000)` → «the charge curve has run
 * 6 s»). A cancelled frame really is dropped — `useAnimationLoop` cancels the
 * previous effect's frame whenever its inputs change, and a stub whose
 * cancel is a no-op would hand that stale callback the timestamp meant for
 * the live one.
 *
 * Call `restore()` in `finally` (it is `vi.unstubAllGlobals()`).
 */
export function stubAnimationFrames() {
  const pending = new Map<number, FrameRequestCallback>()
  let nextHandle = 0
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    pending.set(++nextHandle, cb)
    return nextHandle
  })
  vi.stubGlobal('cancelAnimationFrame', (handle: number) => {
    pending.delete(handle)
  })
  return {
    /** Run the oldest live frame callback with this timestamp (no-op when none is pending). */
    async frame(now: number) {
      const first = pending.entries().next()
      if (first.done) return
      const [handle, cb] = first.value
      pending.delete(handle)
      await act(async () => {
        cb(now)
      })
    },
    /** How many frames are waiting to run. */
    get pendingCount() {
      return pending.size
    },
    restore() {
      vi.unstubAllGlobals()
    },
  }
}
