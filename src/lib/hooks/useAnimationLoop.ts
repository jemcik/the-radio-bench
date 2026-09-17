import { useEffect, useRef, type RefObject } from 'react'

/**
 * useAnimationLoop — the one way to run a per-frame animation in this app.
 *
 * Why a shared hook: an audit on 2026-09-17 found 21 hand-rolled
 * `requestAnimationFrame` loops (all since moved here). Every one of them ran from mount to unmount,
 * whatever was on screen — an idle chapter 1.3 tab kept the main thread ~73 %
 * busy (468 ms of script per second) with three diagrams scrolled out of
 * view, chapter 1.1 ~47 %. Three of the 21 honoured `prefers-reduced-motion`
 * differently from the rest, and one (the 1.3 hero) drove its frames through
 * React state from outside the chapter's <Suspense>, which starved the
 * chapter body's retry render and left the reader on the spinner forever
 * (`check-animation-loop.mjs` holds both rules and tells that story).
 *
 * What the hook guarantees, so no component has to remember to:
 *
 *  - **Runs only while `target` is in the viewport** (IntersectionObserver,
 *    with a margin so the motion is already going when the element scrolls
 *    in). A page full of animated diagrams costs only what is on screen.
 *  - **Pauses while the tab is hidden** — rAF stops anyway, but the hook also
 *    stops the clock so the animation resumes where it was rather than
 *    jumping.
 *  - **Never starts under `prefers-reduced-motion: reduce`** (and stops if the
 *    reader switches it on mid-session). The element keeps its initial frame,
 *    so every animated component must render a sensible still at elapsed = 0.
 *  - **`elapsed` counts running time only.** A periodic animation
 *    (`elapsed % PERIOD`) picks up exactly where it paused.
 *  - **The callback is always the latest render's** — read state or props in
 *    it freely; the loop is not restarted when they change.
 *
 * What the hook does not decide: how the frame reaches the DOM. Prefer a ref
 * + `setAttribute` / `style` for anything that changes every frame (no React
 * render per frame). `setState` per frame is acceptable for a small diagram
 * whose whole point is that its geometry follows the phase — but never in a
 * chapter hero, which mounts outside the body's <Suspense>.
 *
 * jsdom has no IntersectionObserver and no `matchMedia`; both are treated as
 * «visible» / «no preference», so unit tests see the loop as before.
 */

export interface FrameInfo {
  /** Milliseconds the loop has actually run — off-screen and hidden-tab pauses do not advance it. */
  elapsed: number
  /** Milliseconds since the previous frame; 0 on the first frame after a start or resume. */
  dt: number
  /** The `requestAnimationFrame` timestamp of this frame. */
  now: number
}

interface AnimationLoopOptions {
  /** Run only while true — Play/Pause, Charge/Discharge. Default `true`. */
  enabled?: boolean
  /** How far outside the viewport the loop already runs. Default `'96px'`. */
  rootMargin?: string
  /**
   * Restart the loop (elapsed back to 0) whenever this changes — for an
   * animation that replays from the start when its inputs move, such as a
   * charge curve whose duration depends on τ. Compose primitives into one
   * string; the value is compared by identity.
   */
  resetKey?: string | number
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function useAnimationLoop(
  target: RefObject<Element | null>,
  onFrame: (frame: FrameInfo) => void,
  options: AnimationLoopOptions = {},
): void {
  const { enabled = true, rootMargin = '96px', resetKey } = options

  // Latest callback without restarting the loop when it changes identity.
  const onFrameRef = useRef(onFrame)
  useEffect(() => {
    onFrameRef.current = onFrame
  })

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') return

    const mq = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION_QUERY) : null
    let reduced = !!mq?.matches
    let intersecting = true
    let hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden'

    let rafId = 0
    let running = false
    let disposed = false
    let last: number | null = null
    let elapsed = 0

    const step = (now: number) => {
      if (!running) return
      const dt = last === null ? 0 : now - last
      last = now
      elapsed += dt
      onFrameRef.current({ elapsed, dt, now })
      rafId = window.requestAnimationFrame(step)
    }

    const sync = () => {
      const shouldRun = !disposed && !reduced && intersecting && !hidden
      if (shouldRun === running) return
      running = shouldRun
      if (running) {
        last = null // first frame after a (re)start reports dt = 0
        rafId = window.requestAnimationFrame(step)
      } else {
        window.cancelAnimationFrame(rafId)
      }
    }

    const onMotionChange = (e: MediaQueryListEvent) => {
      reduced = e.matches
      sync()
    }
    mq?.addEventListener?.('change', onMotionChange)

    const onVisibility = () => {
      hidden = document.visibilityState === 'hidden'
      sync()
    }
    document.addEventListener('visibilitychange', onVisibility)

    let observer: IntersectionObserver | null = null
    const el = target.current
    if (el && typeof IntersectionObserver === 'function') {
      intersecting = false // until the observer's first report
      observer = new IntersectionObserver(
        entries => {
          intersecting = entries.some(entry => entry.isIntersecting)
          sync()
        },
        { rootMargin },
      )
      observer.observe(el)
    }

    sync()

    return () => {
      disposed = true
      running = false
      window.cancelAnimationFrame(rafId)
      observer?.disconnect()
      mq?.removeEventListener?.('change', onMotionChange)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [target, enabled, rootMargin, resetKey])
}
