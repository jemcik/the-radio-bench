import { useEventListener } from './useEventListener'

interface ShortcutOptions {
  /** Require Ctrl on Windows/Linux and Cmd (⌘) on Mac. */
  mod?: boolean
  /** Require Shift. */
  shift?: boolean
  /** Require Alt / Option. */
  alt?: boolean
  /** preventDefault on match (default: true) */
  preventDefault?: boolean
  /** Skip when the user is typing in an input/textarea/contenteditable (default: true) */
  ignoreInputs?: boolean
  /** Listen on `document` (default) or another EventTarget. */
  target?: Document | HTMLElement | null
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function isInTextField(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (el.isContentEditable) return true
  return false
}

/**
 * Match a single keypress against a key + modifier set.
 *
 * The `mod` flag maps to ⌘ on Mac and Ctrl elsewhere — match the platform
 * convention for "Cmd+K"-style shortcuts. Use raw `e.altKey` / `e.shiftKey`
 * checks if you need stricter platform-specific behavior.
 *
 * @example
 *   useKeyboardShortcut('k', () => setSearchOpen(o => !o), { mod: true })
 *   useKeyboardShortcut('Escape', close)
 */
export function useKeyboardShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {},
) {
  const {
    mod = false,
    shift = false,
    alt = false,
    preventDefault = true,
    ignoreInputs = true,
    target,
  } = options

  // Cast through `Event` so the hook can accept either Document or HTMLElement
  // as a target — both fire `keydown` as KeyboardEvent at runtime.
  useEventListener(
    'keydown',
    (rawEvent: Event) => {
      const e = rawEvent as KeyboardEvent
      // Lowercase comparison for letter keys so 'k' matches 'K'.
      if (e.key.toLowerCase() !== key.toLowerCase()) return

      const expectMod = isMac ? e.metaKey : e.ctrlKey
      if (mod && !expectMod) return
      if (!mod && (e.metaKey || e.ctrlKey)) return

      if (shift !== e.shiftKey) return
      if (alt !== e.altKey) return

      if (ignoreInputs && isInTextField(e.target)) return

      if (preventDefault) e.preventDefault()
      handler(e)
    },
    target ?? (typeof document !== 'undefined' ? document : null),
  )
}
