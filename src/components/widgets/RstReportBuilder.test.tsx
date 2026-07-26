import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import RstReportBuilder from './RstReportBuilder'

const slide = (container: HTMLElement, id: string, value: number) =>
  fireEvent.change(container.querySelector(`input#${id}`) as HTMLInputElement, { target: { value: String(value) } })

const text = (container: HTMLElement, testId: string) =>
  (container.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null)?.textContent ?? ''

describe('RstReportBuilder', () => {
  it('opens on the everyday voice report 59', () => {
    const { container } = renderWithProviders(<RstReportBuilder />)
    expect(text(container, 'rst-report')).toBe('59')
  })

  it('drops the tone digit on voice and restores it on telegraphy', () => {
    const { container } = renderWithProviders(<RstReportBuilder />)
    // voice: no tone slider at all, because a voice signal has no note to describe
    expect(container.querySelector('input#rst-t')).toBeNull()
    fireEvent.change(container.querySelector('select#rst-mode') as HTMLSelectElement, { target: { value: 'cw' } })
    expect(container.querySelector('input#rst-t')).not.toBeNull()
    expect(text(container, 'rst-report')).toBe('599')
  })

  it('pairs each digit with its written definition', () => {
    const { container } = renderWithProviders(<RstReportBuilder />)
    slide(container, 'rst-r', 3)
    slide(container, 'rst-s', 4)
    expect(text(container, 'rst-r-meaning')).toMatch(/considerable difficulty/)
    expect(text(container, 'rst-s-meaning')).toMatch(/Fair/)
    expect(text(container, 'rst-report')).toBe('34')
  })

  it('reports the weakest possible contact as 11', () => {
    const { container } = renderWithProviders(<RstReportBuilder />)
    slide(container, 'rst-r', 1)
    slide(container, 'rst-s', 1)
    expect(text(container, 'rst-report')).toBe('11')
    expect(text(container, 'rst-r-meaning')).toMatch(/Unreadable/)
  })

  it('spells the report out digit by digit for on-air use', () => {
    const { container } = renderWithProviders(<RstReportBuilder />)
    slide(container, 'rst-r', 5)
    slide(container, 'rst-s', 7)
    // the spoken form now matches the prose and the diagram: «5 and 7», not «5 7»
    expect(text(container, 'rst-spoken')).toMatch(/5 and 7/)
  })

  it('describes tone 9 as the purest note', () => {
    const { container } = renderWithProviders(<RstReportBuilder />)
    fireEvent.change(container.querySelector('select#rst-mode') as HTMLSelectElement, { target: { value: 'cw' } })
    expect(text(container, 'rst-t-meaning')).toMatch(/Purest note/)
    slide(container, 'rst-t', 1)
    expect(text(container, 'rst-t-meaning')).toMatch(/hissing/)
    expect(text(container, 'rst-report')).toBe('591')
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<RstReportBuilder />, { language: 'uk' })
    expect(container.querySelector('input#rst-r')).not.toBeNull()
    expect(text(container, 'rst-report')).toBe('59')
  })
})

describe('RstReportBuilder — the spoken line belongs to voice only', () => {
  it('drops it on telegraphy, where the report is keyed rather than said', () => {
    const { container } = renderWithProviders(<RstReportBuilder />)
    expect(container.querySelector('[data-testid="rst-spoken"]')).not.toBeNull()
    fireEvent.change(container.querySelector('select#rst-mode') as HTMLSelectElement, { target: { value: 'cw' } })
    expect(text(container, 'rst-report')).toBe('599')
    // «5 and 9 and 9» is not a thing anyone utters
    expect(container.querySelector('[data-testid="rst-spoken"]')).toBeNull()
  })
})
