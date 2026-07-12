import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import BandConditions from './BandConditions'

const setSelect = (container: HTMLElement, id: string, value: string) => {
  const el = container.querySelector(`select#${id}`) as HTMLSelectElement
  fireEvent.change(el, { target: { value } })
}

describe('BandConditions', () => {
  it('shows worldwide DX for 10 m by day with a high sun (the default)', () => {
    const { container } = renderWithProviders(<BandConditions />)
    expect(container.textContent).toMatch(/Worldwide DX/)
  })

  it('reports 80 m as local by day (D-layer absorption)', () => {
    const { container } = renderWithProviders(<BandConditions />)
    setSelect(container, 'cond-band', '80m')
    setSelect(container, 'cond-time', 'day')
    expect(container.textContent).toMatch(/Local only/)
    expect(container.textContent).toMatch(/D layer absorbs/)
  })

  it('opens 40 m for DX at night', () => {
    const { container } = renderWithProviders(<BandConditions />)
    setSelect(container, 'cond-band', '40m')
    setSelect(container, 'cond-time', 'night')
    expect(container.textContent).toMatch(/Worldwide DX/)
    expect(container.textContent).toMatch(/D layer is gone/)
  })

  it('reports 2 m as line-of-sight regardless of the sun', () => {
    const { container } = renderWithProviders(<BandConditions />)
    setSelect(container, 'cond-band', '2m')
    setSelect(container, 'cond-sun', 'low')
    expect(container.textContent).toMatch(/Local only/)
    expect(container.textContent).toMatch(/line-of-sight/)
  })

  it('closes 10 m when the sun is quiet', () => {
    const { container } = renderWithProviders(<BandConditions />)
    setSelect(container, 'cond-sun', 'low')
    expect(container.textContent).toMatch(/Closed/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<BandConditions />, { language: 'uk' })
    expect(container.querySelector('select#cond-band')).not.toBeNull()
  })
})
