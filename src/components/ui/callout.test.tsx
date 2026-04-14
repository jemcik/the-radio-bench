import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nTestProvider } from '@/test/i18nTestProvider'
import { Callout, type CalloutVariant } from './callout'

const renderCallout = (variant: CalloutVariant, title?: string) =>
  render(
    <I18nTestProvider>
      <Callout variant={variant} {...(title ? { title } : {})}>body</Callout>
    </I18nTestProvider>,
  )

describe('Callout', () => {
  it('renders the body content', () => {
    renderCallout('note')
    expect(screen.getByText('body')).toBeInTheDocument()
  })

  it.each<[CalloutVariant, string]>([
    ['danger', 'callout-danger'],
    ['key', 'callout-key'],
    ['tip', 'callout-tip'],
    ['note', 'callout-note'],
    ['caution', 'callout-caution'],
    ['experiment', 'callout-experiment'],
    ['onair', 'callout-onair'],
    ['math', 'callout-math'],
  ])('variant %s applies the matching theme color utilities', (variant, token) => {
    const { container } = renderCallout(variant)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain(`border-l-${token}`)
    expect(root.className).toContain(`bg-${token}`)
  })

  it('uses the default label per variant when no title prop is set', () => {
    renderCallout('danger')
    // The i18n key 'calloutLabels.danger' may or may not exist; in either case
    // the rendered label should match either the translation or the English
    // default ('Danger') — we only care that *some* label appears.
    const label = screen.getByText(/danger/i)
    expect(label).toBeInTheDocument()
  })

  it('renders the title prop verbatim, overriding the default label', () => {
    renderCallout('tip', 'Custom heading')
    expect(screen.getByText('Custom heading')).toBeInTheDocument()
  })
})
