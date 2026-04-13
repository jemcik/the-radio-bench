import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Search, FileText, BookOpen, ArrowRight, ChevronDown } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { cn } from '@/lib/utils'
import { getAllChapters } from '@/data/chapters'
import { glossary, type GlossaryEntry } from '@/data/glossary'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchResult {
  type: 'chapter' | 'glossary'
  id: string
  title: string
  subtitle: string
  /** Where to navigate (null for glossary terms without a page) */
  href: string | null
  /** Full glossary entry for inline preview */
  entry?: GlossaryEntry
  /** Original glossary key (for matching and “See also” labels) */
  glossaryKey?: string
}

// ─── Build search index ──────────────────────────────────────────────────────

function mergeGlossaryEntry(key: string, base: GlossaryEntry, t: TFunction<'ui'>): GlossaryEntry {
  const translatedTip = t(`glossary.${key}.tip`, { defaultValue: '' })
  const translatedDetail = t(`glossary.${key}.detail`, { defaultValue: '' })
  return {
    ...base,
    tip: translatedTip || base.tip,
    detail: translatedDetail || base.detail,
  }
}

function glossaryDisplayTitle(key: string, t: TFunction<'ui'>): string {
  const fallback = key.charAt(0).toUpperCase() + key.slice(1)
  return t(`glossary._names.${key}`, { defaultValue: fallback })
}

function buildResults(t: TFunction<'ui'>): SearchResult[] {
  const chapters: SearchResult[] = getAllChapters().map(ch => {
    const title = t(`chapterTitles.${ch.id}`, { defaultValue: ch.title })
    const subtitle = t(`chapterSubtitles.${ch.id}`, { defaultValue: ch.subtitle })
    return {
      type: 'chapter',
      id: ch.id,
      title: `${ch.number} — ${title}`,
      subtitle,
      href: ch.status !== 'coming-soon' ? `/chapter/${ch.id}` : null,
    }
  })

  const terms: SearchResult[] = Object.entries(glossary).map(([key, entry]) => {
    const merged = mergeGlossaryEntry(key, entry, t)
    return {
      type: 'glossary' as const,
      id: `g-${key}`,
      title: glossaryDisplayTitle(key, t),
      subtitle: merged.tip,
      href: null,
      entry: merged,
      glossaryKey: key,
    }
  })

  return [...chapters, ...terms]
}

// ─── Fuzzy match ─────────────────────────────────────────────────────────────

function matchScore(query: string, text: string): number {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  // Exact substring — best match
  if (t.includes(q)) return 100 - t.indexOf(q)
  // All query words present
  const words = q.split(/\s+/).filter(Boolean)
  const allPresent = words.every(w => t.includes(w))
  if (allPresent) return 50
  // At least some words
  const matchCount = words.filter(w => t.includes(w)).length
  if (matchCount > 0) return matchCount * 10
  return 0
}

function searchFn(query: string, all: SearchResult[]): SearchResult[] {
  if (!query.trim()) return []
  return all
    .map(r => {
      const keyScore =
        r.type === 'glossary' && r.glossaryKey
          ? matchScore(query, r.glossaryKey) * 0.85
          : 0
      return {
        result: r,
        score: Math.max(
          matchScore(query, r.title),
          matchScore(query, r.subtitle) * 0.7,
          keyScore,
        ),
      }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(r => r.result)
}

// ─── Components ──────────────────────────────────────────────────────────────

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('ui')
  const isMac = navigator.platform.toUpperCase().includes('MAC')

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full max-w-xs',
        'h-8 px-3 rounded-md border border-border',
        'text-sm text-muted-foreground',
        'bg-background/50 hover:bg-accent hover:text-foreground',
        'transition-colors'
      )}
    >
      <Search className="w-3.5 h-3.5 shrink-0" />
      <span className="flex-1 text-left text-xs">{t('search.placeholder')}</span>
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
  const { t } = useTranslation('ui')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const allResults = useMemo(() => buildResults(t), [t])
  const results = useMemo(() => searchFn(query, allResults), [query, allResults])

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
