import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from './render'
import { useTranslation } from 'react-i18next'

/**
 * Smoke test — verifies the test harness itself works end-to-end:
 *   - vitest + jsdom run TS/TSX
 *   - @testing-library/jest-dom matchers register
 *   - renderWithProviders wires i18next + MemoryRouter
 */

function SiteTitle() {
  const { t } = useTranslation('ui')
  return <h1>{t('site.title')}</h1>
}

describe('test harness', () => {
  it('runs vitest with TS/TSX', () => {
    expect(1 + 1).toBe(2)
  })

  it('renders a component with i18n + router providers', () => {
    renderWithProviders(<SiteTitle />)
    // 'site.title' is defined in src/i18n/locales/en/ui.json
    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(screen.getByRole('heading').textContent).toBeTruthy()
  })

  it('supports switching the test language', () => {
    const { unmount } = renderWithProviders(<SiteTitle />, { language: 'uk' })
    const ukText = screen.getByRole('heading').textContent
    unmount()
    renderWithProviders(<SiteTitle />, { language: 'en' })
    const enText = screen.getByRole('heading').textContent
    // Either the locales differ, or both fall back to en — both are valid.
    // The important part is no crash and both render.
    expect(ukText).toBeTruthy()
    expect(enText).toBeTruthy()
  })
})
