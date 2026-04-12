import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, BookOpen, ArrowRight, ChevronDown } from 'lucide-react'
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
}

// ─── Build search index ──────────────────────────────────────────────────────

function buildResults(): SearchResult[] {
  const chapters: SearchResult[] = getAllChapters().map(ch => ({
    type: 'chapter',
    id: ch.id,
    title: `${ch.number} — ${ch.title}`,
    subtitle: ch.subtitle,
    href: ch.status !== 'coming-soon' ? `/chapter/${ch.id}` : null,
  }))

  const terms: SearchResult[] = Object.entries(glossary).map(([key, entry]) => ({
    type: 'glossary',
    id: `g-${key}`,
    title: key.charAt(0).toUpperCase() + key.slice(1),
    subtitle: entry.tip,
    href: null,
    entry,
  }))

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

function search(query: string, all: SearchResult[]): SearchResult[] {
  if (!query.trim()) return []
  return all
    .map(r => ({
      result: r,
      score: Math.max(
        matchScore(query, r.title),
        matchScore(query, r.subtitle) * 0.7
      ),
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(r => r.result)
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SearchTrigger({ onClick }: { onClick: () => void }) {
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
      <span className="flex-1 text-left text-xs">Search...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 h-5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground">
        {isMac ? '⌘' : 'Ctrl'}K
      </kbd>
    </button>
  )
}

/** Wrapper that unmounts the inner dialog when closed, giving us a clean state reset for free. */
export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return <SearchDialogInner onClose={onClose} />
}

function SearchDialogInner({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const allResults = useMemo(() => buildResults(), [])
  const results = useMemo(() => search(query, allResults), [query, allResults])

  // Focus input on mount
  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  // Clamp active index to results bounds (derived during render)
  const clampedActive = Math.min(active, Math.max(results.length - 1, 0))
  if (clampedActive !== active) setActive(clampedActive)

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setExpanded(null)   // collapse expanded card when query changes
    setActive(0)        // reset selection on new search
  }, [])

  const activate = useCallback((result: SearchResult) => {
    if (result.href) {
      navigate(result.href)
      onClose()
    } else if (result.type === 'glossary') {
      setExpanded(prev => prev === result.id ? null : result.id)
    }
  }, [navigate, onClose])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      activate(results[active])
    }
  }, [results, active, activate, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 pointer-events-none">
        <div
          className="w-full max-w-lg bg-popover border border-border rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
          role="dialog"
          aria-label="Search"
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search chapters and terms..."
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
                No results for "{query}"
              </p>
            )}

            {!query && (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">Type to search chapters and glossary terms</p>
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
                      i === active ? 'bg-accent text-accent-foreground' : 'text-foreground',
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
                      <span className="text-[10px] text-muted-foreground shrink-0 mt-1">soon</span>
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
                              <span className="font-semibold text-foreground/70">Unit:</span> {r.entry.unit}
                            </p>
                          )}
                          {r.entry.formula && (
                            <p className="text-muted-foreground">
                              <span className="font-semibold text-foreground/70">Formula:</span>{' '}
                              <span className="font-mono">{r.entry.formula}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {r.entry.see && r.entry.see.length > 0 && (
                        <p className="mt-2 pt-2 border-t border-border/40 text-muted-foreground">
                          <span className="font-semibold text-foreground/70">See also:</span>{' '}
                          {r.entry.see.join(', ')}
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
            <span className="flex items-center gap-1"><kbd className="px-1 rounded border border-border bg-muted font-mono">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 rounded border border-border bg-muted font-mono">↵</kbd> open / expand</span>
            <span className="flex items-center gap-1"><kbd className="px-1 rounded border border-border bg-muted font-mono">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </>
  )
}
