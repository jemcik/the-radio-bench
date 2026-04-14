import { createContext, useContext, useEffect } from 'react'
import { DEFAULT_FONT, getFontById } from '@/lib/fonts'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { codec, readPersisted, usePersistedState } from '@/lib/hooks/usePersistedState'

/** 5 font-size steps in px. Index 2 (16px) is the default. */
export const FONT_SIZES = [14, 15, 16, 17, 18] as const
const DEFAULT_SIZE_INDEX = 2

interface FontContextValue {
  font: string
  setFont: (id: string) => void
  sizeIndex: number
  setSizeIndex: (i: number) => void
}

const FontContext = createContext<FontContextValue>({
  font: DEFAULT_FONT,
  setFont: () => {},
  sizeIndex: DEFAULT_SIZE_INDEX,
  setSizeIndex: () => {},
})

/** Apply font CSS custom properties to the root element */
function applyFont(id: string) {
  const f = getFontById(id)
  const root = document.documentElement
  root.style.setProperty('--font-sans', f.sans)
  root.style.setProperty('--font-mono', f.mono)
}

function applySize(index: number) {
  const px = FONT_SIZES[index] ?? FONT_SIZES[DEFAULT_SIZE_INDEX]
  document.documentElement.style.fontSize = `${px}px`
}

// Apply immediately before first render to avoid flash.
if (typeof document !== 'undefined') {
  applyFont(readPersisted(STORAGE_KEYS.font, DEFAULT_FONT, codec.string))
  applySize(readPersisted(STORAGE_KEYS.fontSize, DEFAULT_SIZE_INDEX, codec.number))
}

function clampSizeIndex(i: number): number {
  return Math.max(0, Math.min(i, FONT_SIZES.length - 1))
}

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFont] = usePersistedState(STORAGE_KEYS.font, DEFAULT_FONT, codec.string)
  const [sizeIndex, setSizeIndexRaw] = usePersistedState(
    STORAGE_KEYS.fontSize,
    DEFAULT_SIZE_INDEX,
    codec.number,
  )

  // Keep callers from setting an out-of-range index; the wrapped setter clamps.
  const setSizeIndex = (i: number) => setSizeIndexRaw(clampSizeIndex(i))

  useEffect(() => { applyFont(font) }, [font])
  useEffect(() => { applySize(sizeIndex) }, [sizeIndex])

  return (
    <FontContext.Provider value={{ font, setFont, sizeIndex, setSizeIndex }}>
      {children}
    </FontContext.Provider>
  )
}

export function useFont() {
  return useContext(FontContext)
}
