import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { THEMES } from '@/lib/themes'
import { FONTS } from '@/lib/fonts'
import { useTheme } from '@/context/ThemeContext'
import { useFont, FONT_SIZES } from '@/context/FontContext'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export default function ThemeToggle() {
  const { t } = useTranslation('ui')
  const { theme, setTheme } = useTheme()
  const { font, setFont, sizeIndex, setSizeIndex } = useFont()
  const [open, setOpen] = useState(false)

  const current = THEMES.find(th => th.id === theme)
  const isDark = current?.isDark ?? false

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={t('theme.changeTheme')}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md border border-border transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64 p-3">
        {/* Theme section */}
        <p className="text-[11px] font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">{t('theme.theme')}</p>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(th => (
            <button
              key={th.id}
              title={th.description}
              onClick={() => { setTheme(th.id); }}
              className={cn(
                'relative flex flex-col items-center justify-center h-14 rounded-lg border-2 transition-all',
                theme === th.id
                  ? 'border-primary shadow-md ring-1 ring-primary/30'
                  : 'border-transparent hover:border-border hover:scale-[1.03]'
              )}
              style={{ backgroundColor: th.swatch }}
            >
              <span
                className={cn(
                  'text-[11px] font-medium leading-none',
                  th.isDark ? 'text-white/70' : 'text-black/50'
                )}
              >
                {th.label}
              </span>
              {/* Light/dark indicator dot */}
              <span
                className={cn(
                  'mt-1.5 w-1.5 h-1.5 rounded-full',
                  th.isDark ? 'bg-white/25' : 'bg-black/15'
                )}
              />
            </button>
          ))}
        </div>

        {/* Font size section */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{t('theme.size')}</p>
            <span className="text-[11px] tabular-nums text-muted-foreground">{FONT_SIZES[sizeIndex]}px</span>
          </div>
          <div className="flex items-center gap-3 px-0.5">
            <span className="text-[10px] text-muted-foreground leading-none">A</span>
            <Slider
              value={[sizeIndex]}
              onValueChange={([v]) => setSizeIndex(v)}
              min={0}
              max={FONT_SIZES.length - 1}
              step={1}
              aria-label="Font size"
            />
            <span className="text-sm text-muted-foreground leading-none font-medium">A</span>
          </div>
        </div>

        {/* Font section */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-[11px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">{t('theme.font')}</p>
          <div className="flex flex-col gap-1">
            {FONTS.map(f => (
              <button
                key={f.id}
                onClick={() => { setFont(f.id); }}
                className={cn(
                  'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-left transition-all',
                  font === f.id
                    ? 'bg-primary/10 ring-1 ring-primary/30'
                    : 'hover:bg-accent'
                )}
              >
                <span
                  className="text-lg leading-none w-7 text-center text-foreground"
                  style={{ fontFamily: f.sans }}
                >
                  Aa
                </span>
                <span className="flex-1 min-w-0">
                  <span className={cn(
                    'text-xs font-medium block leading-tight',
                    font === f.id ? 'text-primary' : 'text-foreground'
                  )}>
                    {f.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 leading-tight">
                    {f.category}
                  </span>
                </span>
                {font === f.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

      </PopoverContent>
    </Popover>
  )
}
