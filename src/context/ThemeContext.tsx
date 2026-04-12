import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_THEME } from '@/lib/themes'

const STORAGE_KEY = 'trb-theme'

interface ThemeContextValue {
  theme: string
  setTheme: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
})

// Apply the initial theme immediately (before first render) to avoid flash
if (typeof document !== 'undefined') {
  const saved = localStorage.getItem('trb-theme') ?? DEFAULT_THEME
  document.documentElement.setAttribute('data-theme', saved)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME
  })

  const setTheme = (id: string) => {
    setThemeState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
