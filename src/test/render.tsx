import { type ReactElement, type ReactNode } from 'react'
import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'

import { I18nTestProvider } from './i18nTestProvider'

interface ProviderOptions {
  /** Language to seed i18n with. Defaults to 'en'. */
  language?: 'en' | 'uk'
  /** Initial entries for MemoryRouter. Defaults to ['/']. */
  routerEntries?: MemoryRouterProps['initialEntries']
  /** Skip the MemoryRouter wrapper (for components that already mount one). */
  withoutRouter?: boolean
}

interface RenderWithProvidersOptions
  extends Omit<RenderOptions, 'wrapper'>,
    ProviderOptions {}

/**
 * Render a component wrapped in the providers it almost always needs in this app:
 *   - i18next (test instance, isolated from production)
 *   - MemoryRouter
 *
 * Add more providers here only when they are needed by *most* tests. Specific
 * providers (Theme, Font, Bookmark) should be opted into per-test to keep
 * isolation explicit.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
): RenderResult {
  const { language, routerEntries, withoutRouter, ...rtlOptions } = options

  function Wrapper({ children }: { children: ReactNode }) {
    const inner = withoutRouter ? (
      children
    ) : (
      <MemoryRouter
        initialEntries={routerEntries ?? ['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {children}
      </MemoryRouter>
    )
    return <I18nTestProvider language={language}>{inner}</I18nTestProvider>
  }

  return render(ui, { wrapper: Wrapper, ...rtlOptions })
}

export * from '@testing-library/react'
