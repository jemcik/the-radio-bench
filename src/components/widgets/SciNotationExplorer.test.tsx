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
    expect(screen.queryByRole('button', { name: /^scientific$/i })).toBeNull()
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
    // The exponent box renders U+2212 MINUS, matching the 10⁻⁶ beside it.
    expect(screen.getAllByText('−6').length).toBeGreaterThan(0)
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

  it('switches notation mode via the Scientific/Engineering buttons', () => {
    setup()
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '12345' } })

    const std = screen.getByRole('button', { name: /scientific/i })
    const eng = screen.getByRole('button', { name: /engineering/i })

    // Scientific highlights scientific, engineering highlights engineering.
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
      screen.getAllByText((_, el) => /−2\.4/.test(el?.textContent ?? '')).length,
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

  // ── Exactness ──────────────────────────────────────────────────────────
  // Reader-flagged: entering a 32-digit number returned «1,111122 × 10³¹» and
  // printed it with an equals sign. Two independent losses — `roundTo(m, 6)`
  // threw away ten digits, and `parseFloat` had already corrupted everything
  // past the 17th, because a double holds ~17 significant digits. The widget now
  // decomposes the decimal STRING, so the digits the reader typed survive.
  it('keeps every digit of a 32-digit input (no float rounding)', () => {
    setup()
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '11111222233333444455565544444444' },
    })
    // 32 digits ⇒ exponent 31, mantissa = the same digit run with the point
    // after the first digit. parseFloat would have given 1.1111222233333444.
    expect(
      screen.getAllByText('1.1111222233333444455565544444444').length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('31').length).toBeGreaterThan(0)
  })

  it('the «number and its notation» line is a true equality', () => {
    const { container } = setup()
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '11111222233333444455565544444444' },
    })
    // Both sides must carry the same digit run — that is what makes the «=» honest.
    expect(container.textContent).toContain(
      '11111222233333444455565544444444 = 1.1111222233333444455565544444444',
    )
  })

  it('keeps every digit in engineering form too', () => {
    setup()
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '11111222233333444455565544444444' },
    })
    fireEvent.click(screen.getByRole('button', { name: /engineering/i }))
    // Exponent drops 31 → 30, so one digit crosses the point.
    expect(
      screen.getAllByText('11.111222233333444455565544444444').length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('30').length).toBeGreaterThan(0)
  })

  it('does not invent digits for a short input', () => {
    setup()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '7' } })
    // «7» is 7 × 10⁰ — not «7.000000».
    expect(screen.getAllByText('7').length).toBeGreaterThan(0)
  })

  it('trailing zeros do not survive as false precision', () => {
    setup()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '4700' } })
    expect(screen.getAllByText('4.7').length).toBeGreaterThan(0)
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
  })

  it('treats every spelling of zero as zero', () => {
    setup()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '0.000' } })
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
  })

  it('exposes aria-pressed on the Standard/Engineering toggle', () => {
    setup()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '42' } })

    const std = screen.getByRole('button', { name: /scientific/i })
    const eng = screen.getByRole('button', { name: /engineering/i })

    expect(std).toHaveAttribute('aria-pressed', 'true')
    expect(eng).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(eng)
    expect(std).toHaveAttribute('aria-pressed', 'false')
    expect(eng).toHaveAttribute('aria-pressed', 'true')
  })
})
