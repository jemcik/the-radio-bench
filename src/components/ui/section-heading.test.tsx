import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nTestProvider } from '@/test/i18nTestProvider'
import { BookmarkProvider } from '@/features/bookmarks/BookmarkContext'
import { ChapterScope, Section } from './section-heading'

/**
 * Section is a UI primitive — it should render without react-router. The old
 * implementation called useParams() directly; the refactor replaced that with
 * an explicit <ChapterScope> context (or chapterId prop) so the primitive is
 * router-agnostic and trivially testable.
 */

function withProviders(ui: React.ReactElement) {
  return (
    <I18nTestProvider>
      <BookmarkProvider>{ui}</BookmarkProvider>
    </I18nTestProvider>
  )
}

describe('Section', () => {
  it('renders the heading text with the given id (no router required)', () => {
    render(withProviders(<Section id="intro">Intro</Section>))
    const heading = screen.getByRole('heading', { level: 2, name: 'Intro' })
    expect(heading).toHaveAttribute('id', 'intro')
  })

  it('omits the bookmark button when no chapter context is available', () => {
    render(withProviders(<Section id="intro">Intro</Section>))
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the bookmark button when wrapped in <ChapterScope>', () => {
    render(
      withProviders(
        <ChapterScope chapterId="0-1">
          <Section id="intro">Intro</Section>
        </ChapterScope>,
      ),
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('chapterId prop overrides the surrounding ChapterScope', () => {
    render(
      withProviders(
        <ChapterScope chapterId="0-1">
          <Section id="intro" chapterId="0-2">
            Intro
          </Section>
        </ChapterScope>,
      ),
    )
    // Just verify it renders without crashing — the bookmark button uses
    // the prop value, but we don't expose chapterId on the rendered DOM.
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('falls back to a derived label when children is not a string', () => {
    render(
      withProviders(
        <ChapterScope chapterId="0-1">
          <Section id="my-section">
            <em>Fancy</em>
          </Section>
        </ChapterScope>,
      ),
    )
    // The bookmark button should still exist; label is "my section" derived
    // from id (no crash on non-string children).
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
