import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Card } from './card'

/**
 * Catches render-time errors in its subtree and shows a friendly fallback
 * instead of letting the page go blank.
 *
 * Used to wrap lazy-loaded chapter content so a single broken chapter (bad
 * import, missing i18n key, undefined glossary lookup, etc.) doesn't take
 * down the whole site.
 *
 * Reset model: when `resetKey` changes, the boundary forgets the previous
 * error and re-mounts its children. Pass the chapter id as the key so
 * navigating away clears a stuck error state.
 */

interface ErrorBoundaryProps {
  /** Change this to clear a thrown error and re-attempt render. */
  resetKey?: string | number
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to the console so devs see *what* broke without grovelling
    // through the React dev tools. Production users still only see the
    // friendly fallback.
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onRetry={this.reset} />
    }
    return this.props.children
  }
}

function ErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const { t } = useTranslation('ui')
  return (
    <Card surface="accent" className="max-w-2xl mx-auto my-12 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground mb-1">
            {t('chapter.loadFailedTitle')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('chapter.loadFailedBody')}
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={onRetry}
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
            >
              {t('chapter.loadFailedRetry')}
            </button>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('chapter.backToHome')}
            </Link>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-4 text-[11px] text-muted-foreground/80 whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    </Card>
  )
}
