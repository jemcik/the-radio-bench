import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import PowersOfTenTable from './PowersOfTenTable'
import { SI_PREFIXES } from '@/features/si/prefixes'

describe('PowersOfTenTable', () => {
  it('renders one row per prefix in SI_PREFIXES', () => {
    renderWithProviders(<PowersOfTenTable />)
    const table = screen.getByRole('table')
    const bodyRows = table.querySelectorAll('tbody tr')
    expect(bodyRows.length).toBe(SI_PREFIXES.length)
  })

  it('renders the canonical power and value labels', () => {
    renderWithProviders(<PowersOfTenTable />)
    // Sanity-check a couple of entries from the shared list.
    expect(screen.getByText('10⁶')).toBeInTheDocument()
    expect(screen.getByText('10⁻¹²')).toBeInTheDocument()
    expect(screen.getByText('1 000 000')).toBeInTheDocument()
  })

  it('renders a header row with four columns', () => {
    renderWithProviders(<PowersOfTenTable />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(4)
  })

  it('associates column headers via scope="col" for screen readers', () => {
    renderWithProviders(<PowersOfTenTable />)
    screen.getAllByRole('columnheader').forEach(h => {
      expect(h).toHaveAttribute('scope', 'col')
    })
  })
})
