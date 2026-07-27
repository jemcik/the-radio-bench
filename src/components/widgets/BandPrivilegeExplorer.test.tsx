import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/render'
import BandPrivilegeExplorer from './BandPrivilegeExplorer'

/** The row whose first cell is this band label. */
function bandRow(label: string): HTMLElement {
  return screen.getByRole('rowheader', { name: label }).closest('tr') as HTMLElement
}

describe('BandPrivilegeExplorer', () => {
  it('opens on qualification B and shows the span that qualification actually gets', () => {
    renderWithProviders(<BandPrivilegeExplorer />)
    // таблиця 12: B has 7.000–7.100 on 40 m at 100 W. 7.100–7.200 is A only,
    // so it must not appear at all while B is selected.
    const row = bandRow('40 m')
    expect(row.textContent).toContain('7.000–7.100')
    expect(row.textContent).toContain('100 W')
    expect(row.textContent).not.toContain('7.200')
  })

  it('changing qualification changes the frequencies, not just the power', () => {
    renderWithProviders(<BandPrivilegeExplorer />)
    expect(bandRow('40 m').textContent).toContain('7.000–7.100')

    fireEvent.click(screen.getByRole('button', { name: /A —/ }))
    // A reaches the top of the band, and at twice the power.
    expect(bandRow('40 m').textContent).toContain('7.000–7.200')
    expect(bandRow('40 m').textContent).toContain('200 W')

    fireEvent.click(screen.getByRole('button', { name: /C —/ }))
    // C stops where B does but at 40 W, and 20 m is closed to it entirely.
    expect(bandRow('40 m').textContent).toContain('7.000–7.100')
    expect(bandRow('40 m').textContent).toContain('40 W')
    expect(bandRow('20 m').textContent).not.toContain('14.000')
  })

  it('reports a band as secondary only where every segment on offer is secondary', () => {
    renderWithProviders(<BandPrivilegeExplorer />)
    // 30 m is secondary outright; 160 m mixes a primary and a secondary segment.
    expect(bandRow('30 m').textContent).toContain('secondary')
    expect(bandRow('160 m').textContent).toContain('primary in part')
  })
})
