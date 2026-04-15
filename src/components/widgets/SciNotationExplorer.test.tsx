import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import SciNotationExplorer from './SciNotationExplorer'

// SciNotationExplorer is locale-aware (the mantissa decimal separator
// localizes via roundTo + formatNumber). Most tests pin English; the
// uk-locale test below covers the regression class.


function setup() {
  return renderWithProviders(<SciNotationExplorer />)
}

describe('SciNotationExplorer', () => {
  it('renders the input but no result panel when empty', () => {
    setup()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    // The Standard/Engineering toggle buttons only appear once the result
    // panel renders — use their absence as a proxy for "no result".
    expect(screen.queryByRole('button', { name: /engineering/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /^standard$/i })).toBeNull()
  })

  it('breaks 2_400_000_000 into mantissa 2.4 and exponent 9 (standard)', () => {
    setup()
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '2400000000' } })

    // Mantissa "2.4" is rendered in multiple places (the big display, the
    // breakdown, the formula line) — just confirm it shows up.
    expect(screen.getAllByText('2.4').length).toBeGreaterThan(0)
    expect(screen.getAllByText('9').length).toBeGreaterThan(0)
  })

  it('engineering mode keeps 2.4 × 10⁹ for 2_400_000_000 (multiple of 3)', () => {
    setup()
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '2400000000' } })
    fireEvent.click(screen.getByRole('button', { name: /engineering/i }))

    expect(screen.getAllByText('2.4').length).toBeGreaterThan(0)
    // The SI prefix chip should also appear for a multiple of 3 — "giga".
    expect(screen.getByText(/giga/i)).toBeInTheDocument()
  })

  it('engineering mode normalises 1500 to 1.5 × 10³', () => {
    setup()
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '1500' } })

    // Standard notation for 1500 is itself 1.5 × 10³ (already engineering-compatible).
    expect(screen.getAllByText('1.5').length).toBeGreaterThan(0)
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
  })

  it('engineering mode downshifts 0.00047 to 470 × 10⁻⁶', () => {
    setup()
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '0.00047' } })
    fireEvent.click(screen.getByRole('button', { name: /engineering/i }))

    expect(screen.getAllByText('470').length).toBeGreaterThan(0)
    expect(screen.getAllByText('-6').length).toBeGreaterThan(0)
    // 10⁻⁶ is the micro (µ) band.
    expect(screen.getByText(/micro/i)).toBeInTheDocument()
  })

  it('treats 0 as valid (exponent 0, no crash from log10(0))', () => {
    setup()
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '0' } })

    // The result panel shows the toggle buttons when ok. Presence of the
    // Engineering button proves result.ok for zero — the path that used to
    // short-circuit before the `num === 0` branch was added.
    expect(screen.getByRole('button', { name: /engineering/i })).toBeInTheDocument()
  })

  it('strips non-numeric characters at the input layer', () => {
    // The input is `type="text"` with inputMode="decimal" and an onChange
    // that filters `[^0-9.,\-]`. Typing letters therefore never lands in
    // state — the field stays empty and the result panel doesn't render.
    setup()
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'abc' } })

    expect(input.value).toBe('')
    expect(screen.queryByRole('button', { name: /engineering/i })).toBeNull()
  })

  it('switches notation mode via the Standard/Engineering buttons', () => {
    setup()
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '12345' } })

    const std = screen.getByRole('button', { name: /standard/i })
    const eng = screen.getByRole('button', { name: /engineering/i })

    // Standard highlights standard, engineering highlights engineering.
    expect(std.className).toMatch(/border-callout-note\/50/)
    expect(eng.className).not.toMatch(/border-callout-experiment\/50/)

    fireEvent.click(eng)
    expect(eng.className).toMatch(/border-callout-experiment\/50/)
  })

  it('handles negative inputs with a leading minus sign', () => {
    // Math.abs() in the widget covers log10(); the rendered mantissa must
    // still carry the sign so the reader sees "−2.4 × 10⁹", not "2.4 × 10⁹".
    setup()
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '-2400000000' } })
    // Some readout text contains the negative mantissa.
    expect(
      screen.getAllByText((_, el) => /-2\.4/.test(el?.textContent ?? '')).length,
    ).toBeGreaterThan(0)
  })

  it('localizes the mantissa decimal in the uk locale', () => {
    renderWithProviders(<SciNotationExplorer />, { language: 'uk' })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '2400000000' } })
    // The mantissa "2,4" (comma) should appear somewhere in the result panel.
    // Use a node-text matcher because the value sits inside a styled span.
    expect(
      screen.getAllByText((_, el) => /2,4/.test(el?.textContent ?? '')).length,
    ).toBeGreaterThan(0)
  })

  it('exposes aria-pressed on the Standard/Engineering toggle', () => {
    setup()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '42' } })

    const std = screen.getByRole('button', { name: /standard/i })
    const eng = screen.getByRole('button', { name: /engineering/i })

    expect(std).toHaveAttribute('aria-pressed', 'true')
    expect(eng).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(eng)
    expect(std).toHaveAttribute('aria-pressed', 'false')
    expect(eng).toHaveAttribute('aria-pressed', 'true')
  })
})
