import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

/**
 * Codec — converts a typed value to/from the string form used by localStorage.
 *
 * Codecs are explicit (not inferred from the value's type) because the
 * existing storage formats in this app are heterogeneous: some keys hold raw
 * strings, some hold '1'/'0' flags, some hold JSON. Forcing the caller to
 * choose prevents accidental format changes that would orphan saved data.
 */
interface Codec<T> {
  serialize: (value: T) => string
  deserialize: (raw: string) => T
}

const stringCodec: Codec<string> = {
  serialize: v => v,
  deserialize: r => r,
}

const numberCodec: Codec<number> = {
  serialize: v => String(v),
  deserialize: r => Number(r),
}

const booleanCodec: Codec<boolean> = {
  serialize: v => (v ? '1' : '0'),
  deserialize: r => r === '1',
}

function jsonCodec<T>(): Codec<T> {
  return {
    serialize: v => JSON.stringify(v),
    deserialize: r => JSON.parse(r) as T,
  }
}

/** Bundle of ready-made codecs covering the common cases. */
export const codec = {
  string: stringCodec,
  number: numberCodec,
  boolean: booleanCodec,
  json: jsonCodec,
}

/**
 * Read the persisted value for a key, falling back to `initial` if missing or
 * corrupt. Safe to call outside React (no hooks). Useful for pre-render setup
 * (e.g. apply theme to <html> before first render to avoid flash).
 */
export function readPersisted<T>(key: string, initial: T, c: Codec<T>): T {
  if (typeof window === 'undefined') return initial
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return initial
    return c.deserialize(raw)
  } catch {
    return initial
  }
}

/**
 * useState that mirrors its value to localStorage.
 *
 * Reads `key` once on mount; subsequent updates are written back through the
 * provided codec. Writes are wrapped in try/catch so quota errors or disabled
 * storage do not crash the component — the in-memory state still updates.
 *
 * @example
 *   const [theme, setTheme] = usePersistedState(STORAGE_KEYS.theme, DEFAULT_THEME, codec.string)
 *   const [open, setOpen] = usePersistedState(STORAGE_KEYS.sidebarOpen, true, codec.boolean)
 *   const [items, setItems] = usePersistedState<Item[]>(KEY, [], codec.json())
 */
export function usePersistedState<T>(
  key: string,
  initial: T | (() => T),
  c: Codec<T>,
): [T, Dispatch<SetStateAction<T>>] {
  // Lazy initial read so it runs once even if `initial` is a thunk.
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === 'function' ? (initial as () => T)() : initial
    return readPersisted(key, fallback, c)
  })

  // Keep latest codec in a ref so the persistence effect doesn't re-fire when
  // the caller passes a fresh codec object on every render.
  const codecRef = useRef(c)
  codecRef.current = c

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, codecRef.current.serialize(value))
    } catch {
      // localStorage may be full, disabled, or unavailable. State stays in
      // memory; nothing else we can do.
    }
  }, [key, value])

  // Stable setter identity — matches React's useState contract.
  const setStable = useCallback<Dispatch<SetStateAction<T>>>(next => setValue(next), [])

  return [value, setStable]
}
