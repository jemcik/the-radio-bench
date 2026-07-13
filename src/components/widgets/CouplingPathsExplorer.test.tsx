import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import CouplingPathsExplorer from './CouplingPathsExplorer'

describe('CouplingPathsExplorer', () => {
  it('offers four coupling routes with the first selected by default', () => {
    const { container } = renderWithProviders(<CouplingPathsExplorer />)
    const buttons = container.querySelectorAll('button[aria-pressed]')
    expect(buttons.length).toBe(4)
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true')
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false')
  })

  it('selecting another route moves the highlight to it', () => {
    const { container } = renderWithProviders(<CouplingPathsExplorer />)
    const buttons = container.querySelectorAll('button[aria-pressed]')
    fireEvent.click(buttons[3])
    expect(buttons[3].getAttribute('aria-pressed')).toBe('true')
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false')
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<CouplingPathsExplorer />, { language: 'uk' })
    expect(container.querySelectorAll('button[aria-pressed]').length).toBe(4)
  })
})
