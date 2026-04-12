import { useState, useRef, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { THEMES } from '@/lib/themes'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = THEMES.find(t => t.id === theme)
  const isDark = current?.isDark ?? false

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Change theme"
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-md transition-colors',
          'text-muted-foreground hover:text-foreground hover:bg-accent'
        )}
      >
        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-lg border border-border bg-popover p-3 shadow-xl">
          <p className="text-[11px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">Theme</p>
          <div className="grid grid-cols-6 gap-1.5">
            {THEMES.map(t => (
              <button
                key={t.id}
                title={t.label}
                onClick={() => { setTheme(t.id); setOpen(false) }}
                className={cn(
                  'relative h-7 w-full rounded-md border-2 transition-all',
                  theme === t.id
                    ? 'border-primary scale-110 shadow-md'
                    : 'border-transparent hover:border-border hover:scale-105'
                )}
                style={{ backgroundColor: t.swatch }}
              >
                <span
                  className={cn(
                    'absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full border border-white/30',
                    t.isDark ? 'bg-white/20' : 'bg-black/20'
                  )}
                />
                <span className="sr-only">{t.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 capitalize">
            {current?.label} · {isDark ? 'Dark' : 'Light'}
          </p>
        </div>
      )}
    </div>
  )
}
