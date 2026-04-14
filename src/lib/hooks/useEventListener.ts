import { useEffect, useRef } from 'react'

/**
 * Targets we know how to attach to. `null`/`undefined` are accepted so a
 * caller can pass `ref.current` without a guard — the listener is simply not
 * attached until the target exists.
 */
type EventTarget_ =
  | Window
  | Document
  | HTMLElement
  | MediaQueryList
  | EventTarget
  | null
  | undefined

/* ── Overloads — narrow the event-name → event-object mapping per target ── */

export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (e: WindowEventMap[K]) => void,
  target?: Window | null,
  options?: AddEventListenerOptions | boolean,
): void

export function useEventListener<K extends keyof DocumentEventMap>(
  event: K,
  handler: (e: DocumentEventMap[K]) => void,
  target: Document | null,
  options?: AddEventListenerOptions | boolean,
): void

export function useEventListener<K extends keyof HTMLElementEventMap>(
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  target: HTMLElement | null,
  options?: AddEventListenerOptions | boolean,
): void

export function useEventListener<K extends keyof MediaQueryListEventMap>(
  event: K,
  handler: (e: MediaQueryListEventMap[K]) => void,
  target: MediaQueryList | null,
  options?: AddEventListenerOptions | boolean,
): void

// Fallback for custom events / arbitrary EventTargets.
export function useEventListener(
  event: string,
  handler: (e: Event) => void,
  target?: EventTarget_,
  options?: AddEventListenerOptions | boolean,
): void

/**
 * Attach an event listener for the lifetime of the component.
 *
 * Defaults to `window` if no target is provided. The handler is captured in a
 * ref so callers can pass an inline arrow without re-binding the listener on
 * every render.
 *
 * @example
 *   useEventListener('keydown', e => { if (e.key === 'Escape') close() })
 *   useEventListener('change', onChange, mediaQueryList)
 *   useEventListener('radiopedia:open-sidebar', () => setOpen(true))
 */
export function useEventListener(
  event: string,
  handler: (e: Event) => void,
  target?: EventTarget_,
  options?: AddEventListenerOptions | boolean,
): void {
  // Stash the latest handler so the effect doesn't need it in deps.
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const t = target ?? (typeof window !== 'undefined' ? window : null)
    if (!t) return

    const listener = (e: Event) => handlerRef.current(e)
    t.addEventListener(event, listener, options)
    return () => t.removeEventListener(event, listener, options)
  }, [event, target, options])
}
