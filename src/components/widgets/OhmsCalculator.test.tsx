import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import OhmsCalculator from './OhmsCalculator'

/* Smoke + regression tests for the Ohm's Law + Power Calculator.
 *
 * At mount the widget initialises with V = 12 V and R = 470 Ω as the
 * two "I know" inputs. That pair derives I = V/R = 25.5 mA (rounded to
 * one decimal in the readout format) and P = V²/R = 306 mW (also one
 * decimal at this magnitude). We assert those two headline readouts
 * plus the formula strings underneath, and confirm the two input-
 * quantity select controls render.
 */

function setup() {
  return renderWithProviders(<OhmsCalculator />)
}

describe('OhmsCalculator', () => {
  it('renders the default I = V/R = 25.5 mA readout', () => {
    const { container } = setup()
    // Value + unit are separate text nodes inside one span — search
    // the whole container's text content so we don't get split-text
    // false negatives.
    expect(container.textContent).toContain('25.5 mA')
  })

  it('renders the default P = V²/R = 306 mW readout', () => {
    const { container } = setup()
    expect(container.textContent).toContain('306 mW')
  })

  it('shows the formula string beneath each computed result', () => {
    const { container } = setup()
    expect(container.textContent).toContain('= V / R')
    expect(container.textContent).toContain('= V² / R')
  })

  it('renders four select controls (2 quantity pickers + 2 unit pickers)', () => {
    setup()
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBe(4)
  })
})
