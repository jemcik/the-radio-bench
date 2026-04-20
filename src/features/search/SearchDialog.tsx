import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, FileText, BookOpen, ArrowRight, ChevronDown } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { cn } from '@/lib/utils'
import { buildIndex, searchIndex, type SearchResult } from './buildIndex'

// ─── Components ──────────────────────────────────────────────────────────────

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('ui')
  const isMac = navigator.platform.toUpperCase().includes('MAC')

  // Mobile (< sm): collapses to a 36×36 icon button matching the other
  // header icons — the full placeholder trigger doesn't fit alongside
  // hamburger + logo + title + 3 icon buttons on a 375-px viewport
  // and was overlapping the site title. Desktop: keeps the roomy
  // trigger with placeholder text and the ⌘K / Ctrl+K hint.
  return (
    <button
      onClick={onClick}
      aria-label={t('search.placeholder')}
      className={cn(
        'flex items-center shrink-0 transition-colors',
        // Mobile — icon button
        'w-9 h-9 justify-center rounded-lg text-foreground/70 hover:text-foreground hover:bg-accent',
        // sm+ — expanded placeholder trigger
        'sm:w-full sm:max-w-xs sm:h-8 sm:px-3 sm:gap-2 sm:justify-start sm:rounded-md sm:border sm:border-border sm:text-sm sm:text-muted-foreground sm:bg-background/50 sm:hover:text-foreground',
      )}
    >
      <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
      <span className="hidden sm:flex-1 sm:inline-block sm:text-left sm:text-xs">
        {t('search.placeholder')}
      </span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 h-5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground">
        {isMac ? '⌘' : 'Ctrl'}K
      </kbd>
    </button>
  )
}

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('ui')

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent
        hideClose
        className="top-[12vh] translate-y-0 p-0 gap-0 max-w-lg overflow-hidden rounded-xl data-[state=open]:slide-in-from-top-[10vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <VisuallyHidden><DialogTitle>{t('search.title')}</DialogTitle></VisuallyHidden>
        <SearchDialogBody onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}

function SearchDialogBody({ onClose }: { onClose: () => void }) {
  const { t, i18n } = useTranslation('ui')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Memoize on the active language, not on `t` — `t` gets a new identity on
  // every render, which would rebuild the 200+ entry index unnecessarily.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allResults = useMemo(() => buildIndex(t), [i18n.language])
  const results = useMemo(() => searchIndex(query, allResults), [query, allResults])

  const maxIdx = Math.max(results.length - 1, 0)
  const safeActive = Math.min(active, maxIdx)

  // Focus input on mount
  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setExpanded(null)
    setActive(0)
  }, [])

  const activate = useCallback((result: SearchResult) => {
    if (result.href) {
      navigate(result.href)
      onClose()
    } else if (result.type === 'glossary') {
      setExpanded(prev => prev === result.id ? null : result.id)
    }
  }, [navigate, onClose])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const cap = Math.max(results.length - 1, 0)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive(i => {
          const cur = Math.min(i, cap)
          return Math.min(cur + 1, cap)
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive(i => {
          const cur = Math.min(i, cap)
          return Math.max(cur - 1, 0)
        })
      } else if (e.key === 'Enter' && results[safeActive]) {
        activate(results[safeActive])
      }
    },
    [results, safeActive, activate],
  )

  return (
    <>
      {/* Input */}
      <div className="flex items-center gap-3 px-4 border-b border-border">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('search.inputPlaceholder')}
          className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <kbd className="px-1.5 h-5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground inline-flex items-center">
          Esc
        </kbd>
      </div>

      {/* Results */}
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {query && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t('search.noResults', { query })}
          </p>
        )}

        {!query && (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">{t('search.typeToSearch')}</p>
          </div>
        )}

        {results.map((r, i) => {
          const isExpanded = expanded === r.id
          const isGlossary = r.type === 'glossary'
          const isComingSoon = r.type === 'chapter' && !r.href

          return (
            <div key={r.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => activate(r)}
                className={cn(
                  'flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors',
                  i === safeActive ? 'bg-accent text-accent-foreground' : 'text-foreground',
                )}
              >
                {/* Icon */}
                <span className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-md shrink-0 mt-0.5',
                  r.type === 'chapter' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'
                )}>
                  {r.type === 'chapter' ? <FileText className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                </span>

                {/* Text */}
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium">{r.title}</span>
                  <span className="block text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {r.subtitle}
                  </span>
                </span>

                {/* Action indicator */}
                {r.href && (
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1.5" />
                )}
                {isComingSoon && (
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-1">{t('sidebar.soon')}</span>
                )}
                {isGlossary && (
                  <ChevronDown className={cn(
                    'w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1.5 transition-transform',
                    isExpanded && 'rotate-180'
                  )} />
                )}
              </button>

              {/* Expanded glossary preview */}
              {isGlossary && isExpanded && r.entry && (
                <div className="mx-3 mb-2 px-3 py-3 rounded-md bg-muted/50 border border-border/50 text-xs leading-relaxed">
                  <p className="text-foreground/90">{r.entry.detail}</p>

                  {(r.entry.unit || r.entry.formula) && (
                    <div className="mt-2 pt-2 border-t border-border/40 space-y-0.5">
                      {r.entry.unit && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold text-foreground/70">{t('glossary._ui.unit')}</span>{' '}
                          {r.entry.unit}
                        </p>
                      )}
                      {r.entry.formula && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold text-foreground/70">{t('glossary._ui.formula')}</span>{' '}
                          <span className="font-mono">{r.entry.formula}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {r.entry.see && r.entry.see.length > 0 && (
                    <p className="mt-2 pt-2 border-t border-border/40 text-muted-foreground">
                      <span className="font-semibold text-foreground/70">{t('glossary._ui.seeAlso')}</span>{' '}
                      {r.entry.see.map(sk => t(`glossary._names.${sk}`, { defaultValue: sk })).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><kbd className="px-1 rounded border border-border bg-muted font-mono">↑↓</kbd> {t('search.hintNavigate')}</span>
        <span className="flex items-center gap-1"><kbd className="px-1 rounded border border-border bg-muted font-mono">↵</kbd> {t('search.hintOpen')}</span>
        <span className="flex items-center gap-1"><kbd className="px-1 rounded border border-border bg-muted font-mono">esc</kbd> {t('search.hintClose')}</span>
      </div>
    </>
  )
}
