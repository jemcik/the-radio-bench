import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
] as const

export const LANG_CHOSEN_KEY = 'trb-lang-chosen'

/**
 * Full-screen language picker shown once on first visit.
 * Blocks all other UI until the user makes a choice.
 */
export default function LanguageBanner() {
  const { i18n } = useTranslation()
  const [dismissed, setDismissed] = useState(
    () => !!localStorage.getItem(LANG_CHOSEN_KEY),
  )

  if (dismissed) return null

  const pick = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem(LANG_CHOSEN_KEY, '1')
    setDismissed(true)
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Card */}
      <div className="relative z-10 w-80 max-w-[calc(100vw-2rem)] rounded-xl border-2 border-primary/40 bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-6 text-center space-y-5">
          <div className="text-4xl">🌐</div>

          <div>
            <h2 className="text-lg font-bold text-foreground">Choose your language</h2>
            <p className="text-sm text-muted-foreground mt-1">Оберіть мову</p>
          </div>

          <div className="flex flex-col gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => pick(lang.code)}
                className={cn(
                  'flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-colors',
                  'border border-border hover:border-primary/40 hover:bg-primary/5',
                )}
              >
                <span className="text-xl leading-none">{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
