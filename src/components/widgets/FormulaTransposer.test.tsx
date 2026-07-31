import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import FormulaTransposer from './FormulaTransposer'

function setup() {
  return renderWithProviders(<FormulaTransposer />)
}

describe('FormulaTransposer', () => {
  it('renders all five formula buttons', () => {
    setup()
    // Buttons contain the TeX string (rendered as text in this widget).
    expect(screen.getByRole('button', { name: /V = I × R/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /P = I × V/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /P = I² × R/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /P = V² \/ R/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /f = 1 \/ T/i })).toBeInTheDocument()
  })

  it('opens on the first variable that has a rearrangement to show', () => {
    setup()
    // Ohm's law is the first formula, but V is already isolated in it — opening
    // there showed a single step that demonstrates nothing. The default skips
    // to I, the first variable with real solveSteps.
    expect(screen.getByRole('button', { name: 'I' }).className).toMatch(/bg-primary\/20/)
    expect(screen.getByRole('button', { name: 'V' }).className).not.toMatch(/bg-primary\/20/)
  })

  it('derives the already-isolated step from tex (A7 fix)', () => {
    setup()
    // V is already isolated in V = I × R — selecting it shows a single step
    // whose result equals the tex string.
    fireEvent.click(screen.getByRole('button', { name: 'V' }))
    expect(screen.getAllByText(/V = I × R/).length).toBeGreaterThan(0)
  })

  it('solves for I in Ohm\'s law in two steps', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'I' }))
    // Step 2 result duplicates into the "Rearranged" success box, so we
    // assert on multiple matches rather than a unique one.
    expect(screen.getAllByText(/I = V \/ R/).length).toBeGreaterThanOrEqual(2)
  })

  it('switching formulas resets the variable selection (B5 fix)', () => {
    setup()
    // Pick I from Ohm's law, then switch to P = V² / R (no I variable).
    fireEvent.click(screen.getByRole('button', { name: 'I' }))
    fireEvent.click(screen.getByRole('button', { name: /P = V² \/ R/i }))
    // Variables for the new formula: P, V, R. P is already isolated there, so
    // the default lands on V — the first one that has a rearrangement.
    expect(screen.getByRole('button', { name: 'V' }).className).toMatch(/bg-primary\/20/)
  })

  it('solving for V in P = V² / R uses the square-root step', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: /P = V² \/ R/i }))
    fireEvent.click(screen.getByRole('button', { name: 'V' }))
    expect(screen.getAllByText(/V = √\(P × R\)/).length).toBeGreaterThanOrEqual(1)
  })

  it('highlights the final step in a success ResultBox', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'R' }))
    // The last step's result ("R = V / I") appears twice: once in the
    // step list, once in the "Rearranged" result box below it.
    expect(screen.getAllByText(/R = V \/ I/).length).toBeGreaterThanOrEqual(2)
    // English translation of formulaTransposerResult is "Rearranged".
    expect(screen.getByText(/rearranged/i)).toBeInTheDocument()
  })

  it('hides the "Rearranged" box for the already-isolated case (no duplication)', () => {
    setup()
    // Select V in Ohm's law — V is already isolated, so there's only one step
    // and the "Rearranged" highlight would just repeat it. The box must not render.
    fireEvent.click(screen.getByRole('button', { name: 'V' }))
    expect(screen.queryByText(/rearranged/i)).toBeNull()

    // Switching to a non-isolated variable brings the box back.
    fireEvent.click(screen.getByRole('button', { name: 'I' }))
    expect(screen.getByText(/rearranged/i)).toBeInTheDocument()
  })

  it('exposes aria-pressed on formula and variable toggles', () => {
    setup()
    // The active formula's aria-pressed should be "true", others "false".
    const active = screen.getByRole('button', { name: /V = I × R/i })
    const inactive = screen.getByRole('button', { name: /f = 1 \/ T/i })
    expect(active).toHaveAttribute('aria-pressed', 'true')
    expect(inactive).toHaveAttribute('aria-pressed', 'false')

    // Likewise for the variable picker (I is active by default on Ohm's law —
    // V is already isolated there, so the default skips it).
    expect(screen.getByRole('button', { name: 'I' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'V' })).toHaveAttribute('aria-pressed', 'false')
  })
})
