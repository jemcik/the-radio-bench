import { useParams, Link, Navigate } from 'react-router-dom'
import { getChapterById, getAdjacentChapters } from '@/data/chapters'
import { lazy, Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import { BookmarkButton } from '@/components/ui/bookmark-button'

// ─── Lazy-load each chapter module ───────────────────────────────────────────
// Add a new entry here as you write each chapter.
// The key matches the chapter id in chapters.ts

const CHAPTER_COMPONENTS: Record<string, React.LazyExoticComponent<() => React.JSX.Element>> = {
  '0-1': lazy(() => import('./00-intro/Chapter0_1')),
  '0-2': lazy(() => import('./00-intro/Chapter0_2')),
}

// ─── Adjacent chapter nav ─────────────────────────────────────────────────────

const chapterNavLinkClass =
  'group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'

function ChevronLeftIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M9.78 12.78a.75.75 0 01-1.06 0L4.47 8.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L6.06 8l3.72 3.72a.75.75 0 010 1.06z" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06L7.28 12.78a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
    </svg>
  )
}

function ChapterNavLink({
  to,
  edge,
  chapterTitle,
}: {
  to: string
  edge: 'prev' | 'next'
  chapterTitle: string
}) {
  const label = edge === 'prev' ? 'Previous' : 'Next'

  return (
    <Link to={to} className={chapterNavLinkClass}>
      {edge === 'prev' && <ChevronLeftIcon />}
      <div className={edge === 'prev' ? 'text-right' : ''}>
        <div className={edge === 'next' ? 'text-xs text-muted-foreground/70 text-right' : 'text-xs text-muted-foreground/70'}>
          {label}
        </div>
        <div className="group-hover:text-foreground transition-colors">{chapterTitle}</div>
      </div>
      {edge === 'next' && <ChevronRightIcon />}
    </Link>
  )
}

function ChapterNav({ currentId }: { currentId: string }) {
  const { prev, next } = getAdjacentChapters(currentId)

  return (
    <div className="flex items-center justify-between pt-10 mt-10 border-t border-border">
      {prev ? (
        <ChapterNavLink to={`/chapter/${prev.id}`} edge="prev" chapterTitle={prev.title} />
      ) : (
        <div />
      )}

      {next && next.status !== 'coming-soon' ? (
        <ChapterNavLink to={`/chapter/${next.id}`} edge="next" chapterTitle={next.title} />
      ) : (
        <div />
      )}
    </div>
  )
}

// ─── Coming soon placeholder ──────────────────────────────────────────────────

function ComingSoon({ id }: { id: string }) {
  const meta = getChapterById(id)
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-4">
      <div className="text-5xl">🔧</div>
      <h1 className="text-2xl font-bold text-foreground">{meta?.title}</h1>
      <p className="text-muted-foreground">This chapter is being written. Check back soon.</p>
      <Link to="/" className="inline-block text-sm text-primary hover:opacity-80 transition-opacity">
        ← Back to home
      </Link>
    </div>
  )
}

// ─── Chapter header ───────────────────────────────────────────────────────────

function ChapterHeader({ id }: { id: string }) {
  const meta = getChapterById(id)
  if (!meta) return null

  return (
    <div className="mb-10 pb-8 border-b border-border">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs font-mono text-muted-foreground">Chapter {meta.number}</span>
        {meta.hasLab && (
          <Badge variant="lab">Lab activity</Badge>
        )}
        {meta.hasQuiz && (
          <Badge variant="warning">Quiz</Badge>
        )}
        {meta.erc32 && meta.erc32.length > 0 && (
          <Badge variant="muted">ERC 32: {meta.erc32.join(', ')}</Badge>
        )}
      </div>
      <div className="flex items-start gap-2">
        <h1 className="text-3xl font-bold text-foreground flex-1">{meta.title}</h1>
        <BookmarkButton
          chapterId={meta.id}
          sectionId={null}
          label={`${meta.number} ${meta.title}`}
          className="mt-1"
        />
      </div>
      <p className="text-muted-foreground mt-2">{meta.subtitle}</p>
    </div>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function ChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>()

  if (!chapterId) return <Navigate to="/" replace />

  const meta = getChapterById(chapterId)
  if (!meta) return <Navigate to="/" replace />

  if (meta.status === 'coming-soon') {
    return <ComingSoon id={chapterId} />
  }

  const ChapterContent = CHAPTER_COMPONENTS[chapterId]
  if (!ChapterContent) return <ComingSoon id={chapterId} />

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <ChapterHeader id={chapterId} />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <div className="prose-chapter">
          <ChapterContent />
        </div>
      </Suspense>
      <ChapterNav currentId={chapterId} />
    </div>
  )
}
