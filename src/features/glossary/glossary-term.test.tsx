import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { G } from './glossary-term'

/**
 * The glossary popover renders four fields: detail, unit, formula, seeAlso.
 * Prior to the `unit`/`formula` translation fix, those two pass-through
 * fields always showed the English source string — even in the uk locale.
 * These tests pin the fix.
 */

function openPopover(triggerText: string | RegExp) {
  // Term trigger is rendered as a role="button" span.
  const trigger = screen.getByRole('button', { name: triggerText })
  fireEvent.click(trigger)
}

describe('G (glossary term) i18n for unit/formula', () => {
  it('renders the Ukrainian unit when the uk locale provides one', () => {
    renderWithProviders(<G k="voltage">Voltage</G>, { language: 'uk' })
    openPopover(/voltage/i)
    // uk locale: "Вольт (В)". Regression: used to read "Volt (V)".
    expect(screen.getByText(/Вольт \(В\)/)).toBeInTheDocument()
  })

  it('renders the Ukrainian formula annotation when provided', () => {
    renderWithProviders(<G k="voltage">Voltage</G>, { language: 'uk' })
    openPopover(/voltage/i)
    // uk locale: "V = I × R  (закон Ома)". Regression: used to read "(Ohm's Law)".
    expect(screen.getByText(/закон Ома/)).toBeInTheDocument()
  })

  it('falls back to baseDef.unit when no translation exists for the key', () => {
    // `usb` has no unit in glossary.ts — the fallback path should simply
    // render nothing instead of crashing. Open the popover and assert no
    // "Unit:" label is present (the conditional hides the row entirely).
    renderWithProviders(<G k="usb">USB</G>, { language: 'uk' })
    openPopover(/usb/i)
    expect(screen.queryByText(/Одиниця:/)).toBeNull()
  })

  it('uses the English unit in the en locale', () => {
    renderWithProviders(<G k="voltage">Voltage</G>, { language: 'en' })
    openPopover(/voltage/i)
    // en locale has no per-key unit translation — falls through to baseDef.
    expect(screen.getByText(/Volt \(V\)/)).toBeInTheDocument()
  })

  it('uses the English formula in the en locale', () => {
    renderWithProviders(<G k="voltage">Voltage</G>, { language: 'en' })
    openPopover(/voltage/i)
    expect(screen.getByText(/Ohm's Law/)).toBeInTheDocument()
  })

  it('uses en glossary._names for related terms (not the raw capitalized key)', () => {
    // Prior to the _names backfill, "See also: rms" rendered as "Rms" in the
    // en locale. After adding glossary._names to en/ui.json, it should read
    // "RMS". Exercise via oscilloscope whose `see` includes 'rms'.
    renderWithProviders(<G k="oscilloscope">Oscilloscope</G>, { language: 'en' })
    openPopover(/oscilloscope/i)
    // Find the "See also:" row and assert its sibling text contains "RMS"
    // (not "Rms"). The See also line is the only place the acronym appears
    // in the popover for this entry.
    const seeAlsoLabel = screen.getByText('See also:')
    const seeAlsoRow = seeAlsoLabel.parentElement!
    expect(seeAlsoRow.textContent).toMatch(/RMS/)
    expect(seeAlsoRow.textContent).not.toMatch(/\bRms\b/)
  })
})
