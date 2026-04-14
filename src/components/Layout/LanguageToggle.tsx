import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { useState } from 'react'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
] as const

/**
 * Compact language selector for the header bar.
 * Shows the current language flag; clicking opens a small popover to pick a language.
 */
export default function LanguageToggle() {
  const { t, i18n } = useTranslation('ui')
  const [open, setOpen] = useState(false)

  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={t('language.label')}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md border border-border transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
        >
          <span className="text-base leading-none">{current.flag}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-44 p-1.5 space-y-1">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => {
              i18n.changeLanguage(lang.code)
              localStorage.setItem('trb-lang-chosen', '1')
              setOpen(false)
            }}
            className={cn(
              'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-left transition-all',
              i18n.language === lang.code
                ? 'bg-primary/10 ring-1 ring-primary/30'
                : 'hover:bg-accent',
            )}
          >
            <span className="text-lg leading-none w-6 text-center">{lang.flag}</span>
            <span
              className={cn(
                'text-xs font-medium',
                i18n.language === lang.code ? 'text-primary' : 'text-foreground',
              )}
            >
              {lang.label}
            </span>
            {i18n.language === lang.code && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
