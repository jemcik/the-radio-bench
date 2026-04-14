import { createContext, useContext, useEffect } from 'react'
import { DEFAULT_THEME } from '@/lib/themes'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { codec, readPersisted, usePersistedState } from '@/lib/hooks/usePersistedState'

interface ThemeContextValue {
  theme: string
  setTheme: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
})

// Apply the initial theme immediately (before first render) to avoid flash.
// Uses the same codec as the hook so the storage format is single-sourced.
if (typeof document !== 'undefined') {
  const saved = readPersisted(STORAGE_KEYS.theme, DEFAULT_THEME, codec.string)
  document.documentElement.setAttribute('data-theme', saved)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = usePersistedState(STORAGE_KEYS.theme, DEFAULT_THEME, codec.string)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
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
