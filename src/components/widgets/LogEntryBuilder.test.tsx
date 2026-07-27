import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/render'
import LogEntryBuilder from './LogEntryBuilder'

describe('LogEntryBuilder', () => {
  it('assembles the six required fields into one log line', () => {
    renderWithProviders(<LogEntryBuilder />)
    expect(screen.getByTestId('log-row').textContent).toBe(
      '2026-07-27  18:42  7.090 MHz  SSB  DL1ABC  59',
    )
  })

  it('upper-cases the call sign, which the Regulations recommend writing in Latin capitals', () => {
    renderWithProviders(<LogEntryBuilder />)

    const call = screen.getByLabelText(/call sign/i)
    fireEvent.change(call, { target: { value: 'ur5haa' } })

    expect(screen.getByTestId('log-row').textContent).toBe(
      '2026-07-27  18:42  7.090 MHz  SSB  UR5HAA  59',
    )
  })
})
