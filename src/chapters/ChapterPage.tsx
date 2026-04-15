import { useParams, Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import { getChapterById, getAdjacentChapters } from '@/data/chapters'
import { useTranslatedChapter } from '@/data/useTranslatedChapters'
import { lazy, Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import { BookmarkButton } from '@/features/bookmarks/bookmark-button'
import { ChapterScope } from '@/components/ui/section-heading'
import { ChapterHero } from '@/components/ui/chapter-hero'
import { CHAPTER_HEROES } from '@/components/chapter-heroes'
import { ErrorBoundary } from '@/components/ui/error-boundary'

// ─── Lazy-load each chapter module ───────────────────────────────────────────
// Add a new entry here as you write each chapter.
// The key matches the chapter id in chapters.ts

const CHAPTER_COMPONENTS: Record<string, React.LazyExoticComponent<() => React.JSX.Element>> = {
  '0-1': lazy(() => import('./00-intro/Chapter0_1')),
  '0-2': lazy(() => import('./00-intro/Chapter0_2')),
  '0-3': lazy(() => import('./00-intro/Chapter0_3')),
  '0-4': lazy(() => import('./00-intro/Chapter0_4')),
}

// ─── Adjacent chapter nav ─────────────────────────────────────────────────────

const chapterNavLinkClass =
  'group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'

function ChapterNavLink({
  to,
  edge,
  chapterTitle,
}: {
  to: string
  edge: 'prev' | 'next'
  chapterTitle: string
}) {
  const { t } = useTranslation('ui')
  const label = edge === 'prev' ? t('chapter.previous') : t('chapter.next')

  return (
    <Link to={to} className={chapterNavLinkClass}>
      {edge === 'prev' && <ChevronLeft className="w-4 h-4" aria-hidden />}
      <div className={edge === 'prev' ? 'text-right' : ''}>
        <div className={edge === 'next' ? 'text-xs text-muted-foreground/70 text-right' : 'text-xs text-muted-foreground/70'}>
          {label}
        </div>
        <div className="group-hover:text-foreground transition-colors">{chapterTitle}</div>
      </div>
      {edge === 'next' && <ChevronRight className="w-4 h-4" aria-hidden />}
    </Link>
  )
}

function ChapterNav({ currentId }: { currentId: string }) {
  const { t } = useTranslation('ui')
  const { prev, next } = getAdjacentChapters(currentId)
  const prevTitle = prev ? t(`chapterTitles.${prev.id}`, { defaultValue: prev.title }) : ''
  const nextTitle = next ? t(`chapterTitles.${next.id}`, { defaultValue: next.title }) : ''

  return (
    <div className="flex items-center justify-between pt-10 mt-10 border-t border-border">
      {prev ? (
        <ChapterNavLink to={`/chapter/${prev.id}`} edge="prev" chapterTitle={prevTitle} />
      ) : (
        <div />
      )}

      {next && next.status !== 'coming-soon' ? (
        <ChapterNavLink to={`/chapter/${next.id}`} edge="next" chapterTitle={nextTitle} />
      ) : (
        <div />
      )}
    </div>
  )
}

// ─── Coming soon placeholder ──────────────────────────────────────────────────

function ComingSoon({ id }: { id: string }) {
  const { t } = useTranslation('ui')
  const rawMeta = getChapterById(id)
  const meta = useTranslatedChapter(rawMeta)
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-4">
      <div className="text-5xl">🔧</div>
      <h1 className="text-2xl font-bold text-foreground">{meta?.title}</h1>
      <p className="text-muted-foreground">{t('chapter.comingSoon')}</p>
      <Link to="/" className="inline-block text-sm text-primary hover:opacity-80 transition-opacity">
        {t('chapter.backToHome')}
      </Link>
    </div>
  )
}

// ─── Chapter header ───────────────────────────────────────────────────────────

function ChapterHeader({ id }: { id: string }) {
  const { t } = useTranslation('ui')
  const rawMeta = getChapterById(id)
  const meta = useTranslatedChapter(rawMeta)
  if (!meta) return null

  // Optional vintage pen-and-ink sketch under the title.
  // Chapters without a registered hero simply render the header as before.
  const HeroComponent = CHAPTER_HEROES[id]
  const heroAriaLabel = t(`ch${id.replace('-', '_')}.heroAriaLabel`, { defaultValue: '' })

  return (
    <div className="mb-10 pb-8 border-b border-border">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs font-mono text-muted-foreground">{t('chapter.chapter')} {meta.number}</span>
        {meta.hasLab && (
          <Badge variant="lab">{t('chapter.labActivity')}</Badge>
        )}
        {meta.hasQuiz && (
          <Badge variant="warning">{t('chapter.quiz')}</Badge>
        )}
        {meta.erc32 && meta.erc32.length > 0 && (
          <Badge variant="muted">{t('chapter.erc32')} {meta.erc32.join(', ')}</Badge>
        )}
      </div>
      <div className="flex items-center gap-1">
        <h1 className="text-3xl font-bold text-foreground">{meta.title}</h1>
        <BookmarkButton
          chapterId={meta.id}
          sectionId={null}
          label={`${meta.number} ${meta.title}`}
          size="sm"
        />
      </div>
      <p className="text-muted-foreground mt-2">{meta.subtitle}</p>
      {HeroComponent && (
        <ChapterHero ariaLabel={heroAriaLabel}>
          <HeroComponent />
        </ChapterHero>
      )}
    </div>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function ChapterPage() {
  const { t } = useTranslation('ui')
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
    <ChapterScope chapterId={chapterId}>
    <div className="max-w-5xl mx-auto px-6 py-10">
      <ChapterHeader id={chapterId} />
      {/* ErrorBoundary catches both lazy-load failures and render-time
          throws inside the chapter; resetKey wipes a stuck error when the
          user navigates to a different chapter. */}
      <ErrorBoundary resetKey={chapterId}>
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
      </ErrorBoundary>
      {/* Feedback link */}
      <div className="mt-12 pt-6 border-t border-border/50 flex items-center gap-4 text-[13px] text-muted-foreground/60">
        <span>{t('chapter.feedbackIntro')}</span>
        <a
          href={`https://github.com/jemcik/the-radio-bench/issues/new?title=Feedback: Chapter ${meta.number} — ${meta.title}&labels=content`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
        >
          {t('chapter.openIssue')}
          <ArrowUpRight className="w-3 h-3" aria-hidden />
        </a>
      </div>
      <ChapterNav currentId={chapterId} />
    </div>
    </ChapterScope>
  )
}
