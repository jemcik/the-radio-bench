import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { FlaskConical, HelpCircle, ChevronRight, PanelLeftClose, Bookmark, X } from 'lucide-react'
import LogoIcon from '@/components/LogoIcon'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { PARTS, type ChapterMeta, getChapterById } from '@/data/chapters'
import { useBookmarks, type Bookmark as BookmarkType } from '@/context/BookmarkContext'

// ─── Chapter row ──────────────────────────────────────────────────────────────

function ChapterRow({ chapter, onNavigation }: { chapter: ChapterMeta; onNavigation?: () => void }) {
  const isClickable = chapter.status !== 'coming-soon'

  const baseClass = cn(
    'flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors',
    isClickable
      ? 'hover:bg-accent hover:text-accent-foreground cursor-pointer'
      : 'opacity-50 cursor-default'
  )

  const content = (
    <>
      <span className="font-mono text-[11px] text-muted-foreground w-6 shrink-0 tabular-nums">
        {chapter.number}
      </span>
      <span className="flex-1 leading-tight text-sidebar-foreground">
        {chapter.title}
      </span>
      <span className="flex items-center gap-1 shrink-0">
        {chapter.hasLab && (
          <FlaskConical className="w-3 h-3 text-teal-500 opacity-70" />
        )}
        {chapter.hasQuiz && (
          <HelpCircle className="w-3 h-3 text-primary opacity-70" />
        )}
        {chapter.status === 'draft' && (
          <Badge variant="warning" className="text-[10px] px-1 py-0">draft</Badge>
        )}
        {chapter.status === 'coming-soon' && (
          <Badge variant="muted" className="text-[10px] px-1 py-0">soon</Badge>
        )}
      </span>
    </>
  )

  if (!isClickable) {
    return <div className={baseClass}>{content}</div>
  }

  return (
    <NavLink
      to={`/chapter/${chapter.id}`}
      onClick={onNavigation}
      className={({ isActive }) =>
        cn(baseClass, isActive && 'bg-primary/10 text-primary font-medium [&_.text-sidebar-foreground]:text-primary')
      }
    >
      {content}
    </NavLink>
  )
}

// ─── Part section ─────────────────────────────────────────────────────────────

const ROMAN = ['0', 'I', 'II', 'III', 'IV']

function PartSection({ part, onNavigation }: { part: (typeof PARTS)[number]; onNavigation?: () => void }) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-start gap-1.5 w-full px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent group">
        <ChevronRight className={cn('w-3.5 h-3.5 mt-0.5 shrink-0 transition-transform', open && 'rotate-90')} />
        <span className="font-mono text-primary/70 mr-0.5 shrink-0">{ROMAN[part.number]}</span>
        <span className="text-left">{part.title}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 mt-0.5 ml-1">
          {part.chapters.map(ch => (
            <ChapterRow key={ch.id} chapter={ch} onNavigation={onNavigation} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ─── Bookmarks section ───────────────────────────────────────────────────────

function BookmarksSection({ onNavigation }: { onNavigation?: () => void }) {
  const { bookmarks, remove } = useBookmarks()
  const [open, setOpen] = useState(true)

  if (bookmarks.length === 0) return null

  // Group by chapter
  const grouped = bookmarks.reduce<Record<string, BookmarkType[]>>((acc, b) => {
    (acc[b.chapterId] ||= []).push(b)
    return acc
  }, {})

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent">
          <ChevronRight className={cn('w-3.5 h-3.5 shrink-0 transition-transform', open && 'rotate-90')} />
          <Bookmark className="w-3 h-3 shrink-0 text-primary/70" />
          <span>Bookmarks</span>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">{bookmarks.length}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-0.5 ml-1 space-y-2">
            {Object.entries(grouped).map(([chapterId, items]) => {
              const meta = getChapterById(chapterId)
              if (!meta) return null

              // Separate chapter-level bookmark from section bookmarks
              const chapterBm = items.find(b => b.sectionId === null)
              const sectionBms = items.filter(b => b.sectionId !== null)

              return (
                <div key={chapterId}>
                  {/* Chapter name as subtle label */}
                  <div className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    {meta.number} {meta.title}
                  </div>

                  {/* Chapter-level bookmark */}
                  {chapterBm && (
                    <BookmarkRow
                      chapterId={chapterId}
                      sectionId={null}
                      label="Entire chapter"
                      onNavigate={onNavigation}
                      onRemove={() => remove(chapterId, null)}
                    />
                  )}

                  {/* Section bookmarks */}
                  {sectionBms.map(b => (
                    <BookmarkRow
                      key={b.sectionId}
                      chapterId={chapterId}
                      sectionId={b.sectionId}
                      label={b.label}
                      onNavigate={onNavigation}
                      onRemove={() => remove(chapterId, b.sectionId)}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
      <Separator className="my-1" />
    </>
  )
}

function BookmarkRow({
  chapterId,
  sectionId,
  label,
  onNavigate,
  onRemove,
}: {
  chapterId: string
  sectionId: string | null
  label: string
  onNavigate?: () => void
  onRemove: () => void
}) {
  const navigate = useNavigate()

  const handleClick = useCallback(() => {
    // Navigate to the chapter
    navigate(`/chapter/${chapterId}`)
    onNavigate?.()

    if (sectionId) {
      // Wait for the chapter to render, then scroll to section
      const scrollToSection = () => {
        const el = document.getElementById(sectionId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          // Chapter might still be lazy-loading, retry once
          setTimeout(() => {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 300)
        }
      }
      // Small delay to let React Router + Suspense render
      setTimeout(scrollToSection, 50)
    } else {
      // Chapter bookmark — scroll to top
      setTimeout(() => {
        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 50)
    }
  }, [navigate, chapterId, sectionId, onNavigate])

  return (
    <div className="group flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition-colors">
      <button
        onClick={handleClick}
        className="flex-1 text-left text-xs text-sidebar-foreground leading-tight truncate hover:text-foreground transition-colors"
      >
        {label}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="opacity-0 group-hover:opacity-100 shrink-0 w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-all"
        aria-label="Remove bookmark"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

// ─── Sidebar root ─────────────────────────────────────────────────────────────

export default function Sidebar({ onNavigation, onClose }: { onNavigation?: () => void; onClose?: () => void }) {
  return (
    <div className="h-full w-full min-w-0 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden">
      {/* Logo + close button */}
      <div className="flex items-center">
        <NavLink
          to="/"
          onClick={onNavigation}
          className="flex-1 flex items-center gap-3 px-4 py-4 hover:bg-accent/50 transition-colors min-w-0"
        >
          <LogoIcon size={38} />
          <div className="min-w-0">
            <div className="text-base font-bold text-foreground leading-tight">The Radio Bench</div>
            <div className="text-xs text-muted-foreground leading-tight">Radio & electronics from ground up</div>
          </div>
        </NavLink>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="hidden lg:flex items-center justify-center w-8 h-8 mr-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      <Separator />

      {/* Chapter list */}
      <ScrollArea className="flex-1 px-2 py-2">
        <BookmarksSection onNavigation={onNavigation} />
        <nav className="space-y-0.5">
          {PARTS.map(part => (
            <PartSection key={part.number} part={part} onNavigation={onNavigation} />
          ))}
        </nav>
        {/* Legend */}
        <div className="flex items-center gap-3 px-2 mt-4 mb-1">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <FlaskConical className="w-3 h-3 text-teal-500" /> Lab
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <HelpCircle className="w-3 h-3 text-primary" /> Quiz
          </span>
        </div>
      </ScrollArea>

    </div>
  )
}
