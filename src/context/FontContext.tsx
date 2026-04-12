import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_FONT, getFontById } from '@/lib/fonts'

const FONT_KEY = 'trb-font'
const SIZE_KEY = 'trb-font-size'

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

// Apply immediately before first render to avoid flash
if (typeof document !== 'undefined') {
  const savedFont = localStorage.getItem(FONT_KEY) ?? DEFAULT_FONT
  applyFont(savedFont)

  const savedSize = localStorage.getItem(SIZE_KEY)
  const sizeIdx = savedSize != null ? Number(savedSize) : DEFAULT_SIZE_INDEX
  applySize(sizeIdx)
}

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_FONT
    return localStorage.getItem(FONT_KEY) ?? DEFAULT_FONT
  })

  const [sizeIndex, setSizeIndexState] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_SIZE_INDEX
    const saved = localStorage.getItem(SIZE_KEY)
    return saved != null ? Number(saved) : DEFAULT_SIZE_INDEX
  })

  const setFont = (id: string) => {
    setFontState(id)
    localStorage.setItem(FONT_KEY, id)
  }

  const setSizeIndex = (i: number) => {
    const clamped = Math.max(0, Math.min(i, FONT_SIZES.length - 1))
    setSizeIndexState(clamped)
    localStorage.setItem(SIZE_KEY, String(clamped))
  }

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
