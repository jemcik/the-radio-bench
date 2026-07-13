import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import RemedyMatrix from './RemedyMatrix'

describe('RemedyMatrix', () => {
  it('offers five symptoms with the first selected by default', () => {
    const { container } = renderWithProviders(<RemedyMatrix />)
    const buttons = container.querySelectorAll('button[aria-pressed]')
    expect(buttons.length).toBe(5)
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true')
  })

  it('selecting another symptom moves the highlight', () => {
    const { container } = renderWithProviders(<RemedyMatrix />)
    const buttons = container.querySelectorAll('button[aria-pressed]')
    fireEvent.click(buttons[2])
    expect(buttons[2].getAttribute('aria-pressed')).toBe('true')
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false')
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<RemedyMatrix />, { language: 'uk' })
    expect(container.querySelectorAll('button[aria-pressed]').length).toBe(5)
  })
})
