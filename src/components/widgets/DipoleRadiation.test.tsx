import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import DipoleRadiation from './DipoleRadiation'

// jsdom returns null from canvas.getContext, so the draw loop early-returns;
// these tests cover the surrounding controls and i18n wiring.
describe('DipoleRadiation', () => {
  it('renders the canvas and the play/speed controls', () => {
    const { container } = renderWithProviders(<DipoleRadiation />)
    expect(container.querySelector('canvas')).not.toBeNull()
    expect(container.querySelector('input#rad-speed')).not.toBeNull()
    // default is playing → the button offers to Pause
    expect(container.textContent).toMatch(/Pause/)
  })

  it('toggles between Pause and Play', () => {
    const { getByRole } = renderWithProviders(<DipoleRadiation />)
    const btn = getByRole('button')
    expect(btn.textContent).toMatch(/Pause/)
    fireEvent.click(btn)
    expect(btn.textContent).toMatch(/Play/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<DipoleRadiation />, { language: 'uk' })
    expect(container.querySelector('canvas')).not.toBeNull()
  })
})
