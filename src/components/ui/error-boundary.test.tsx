import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/render'
import { ErrorBoundary } from './error-boundary'

/**
 * ErrorBoundary uses componentDidCatch which logs to console.error in dev
 * mode and React always logs the caught error itself. Silence both for
 * test cleanliness — we assert behavior, not console output.
 */
let consoleErrorSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  consoleErrorSpy.mockRestore()
})

function Boom({ message = 'kaboom' }: { message?: string }): React.ReactElement {
  throw new Error(message)
}

describe('ErrorBoundary', () => {
  it('renders children unchanged when nothing throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <p>healthy content</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('healthy content')).toBeInTheDocument()
  })

  it('catches a thrown error and renders the fallback UI', () => {
    renderWithProviders(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    // Fallback heading text from the en locale
    expect(screen.getByText(/this chapter failed to load/i)).toBeInTheDocument()
  })

  it('shows a retry button + back-to-home link in the fallback', () => {
    renderWithProviders(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument()
  })

  it('clears the error and re-renders children when resetKey changes', () => {
    // Initial render — child throws, fallback shows.
    const { rerender } = renderWithProviders(
      <ErrorBoundary resetKey="chapter-a">
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/this chapter failed to load/i)).toBeInTheDocument()

    // User navigates to a different chapter — resetKey changes; the boundary
    // forgets the previous error and tries to render the new (healthy) tree.
    rerender(
      <ErrorBoundary resetKey="chapter-b">
        <p>different chapter</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('different chapter')).toBeInTheDocument()
    expect(screen.queryByText(/this chapter failed to load/i)).not.toBeInTheDocument()
  })

  it('exposes the error message in dev mode for easier debugging', () => {
    // In jsdom, import.meta.env.DEV is true (Vite test env); the fallback
    // should include the message text.
    renderWithProviders(
      <ErrorBoundary>
        <Boom message="something specific went wrong" />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/something specific went wrong/i)).toBeInTheDocument()
  })
})
