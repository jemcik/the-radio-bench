import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import QCodeFlashcards from './QCodeFlashcards'

const click = (container: HTMLElement, testId: string) =>
  fireEvent.click(container.querySelector(`[data-testid="${testId}"]`) as HTMLElement)

const text = (container: HTMLElement, testId: string) =>
  (container.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null)?.textContent ?? ''

describe('QCodeFlashcards', () => {
  it('opens on the first card of the deck with the answer hidden', () => {
    const { container } = renderWithProviders(<QCodeFlashcards />)
    expect(text(container, 'qcode-prompt')).toBe('QRK')
    expect(text(container, 'qcode-counter')).toBe('1 of 15')
    expect(container.querySelector('[data-testid="qcode-answer"]')).toBeNull()
  })

  it('reveals both halves of the code — the question and the statement', () => {
    const { container } = renderWithProviders(<QCodeFlashcards />)
    click(container, 'qcode-reveal')
    const answer = text(container, 'qcode-answer')
    expect(answer).toMatch(/What is the readability of my signals\?/)
    expect(answer).toMatch(/The readability of your signals is/)
  })

  it('steps forward through the deck and re-hides the answer', () => {
    const { container } = renderWithProviders(<QCodeFlashcards />)
    click(container, 'qcode-reveal')
    expect(container.querySelector('[data-testid="qcode-answer"]')).not.toBeNull()
    click(container, 'qcode-next')
    expect(text(container, 'qcode-prompt')).toBe('QRM')
    expect(text(container, 'qcode-counter')).toBe('2 of 15')
    expect(container.querySelector('[data-testid="qcode-answer"]')).toBeNull()
  })

  it('wraps backwards from the first card to the last', () => {
    const { container } = renderWithProviders(<QCodeFlashcards />)
    click(container, 'qcode-prev')
    expect(text(container, 'qcode-prompt')).toBe('QTH')
    expect(text(container, 'qcode-counter')).toBe('15 of 15')
  })

  it('reverses the card in «meaning → code» direction', () => {
    const { container } = renderWithProviders(<QCodeFlashcards />)
    const select = container.querySelector('select#qcode-direction') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'toCode' } })
    expect(text(container, 'qcode-prompt')).toMatch(/The readability of your signals is/)
    click(container, 'qcode-reveal')
    expect(text(container, 'qcode-answer')).toBe('QRK')
  })

  it('carries all fifteen syllabus codes and no others', () => {
    const { container } = renderWithProviders(<QCodeFlashcards />)
    const seen: string[] = []
    for (let i = 0; i < 15; i++) {
      seen.push(text(container, 'qcode-prompt'))
      click(container, 'qcode-next')
    }
    expect(seen).toEqual([
      'QRK', 'QRM', 'QRN', 'QRO', 'QRP', 'QRS', 'QRT', 'QRV',
      'QRX', 'QRZ', 'QSB', 'QSL', 'QSO', 'QSY', 'QTH',
    ])
    // full cycle returns to the start
    expect(text(container, 'qcode-prompt')).toBe('QRK')
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<QCodeFlashcards />, { language: 'uk' })
    expect(container.querySelector('select#qcode-direction')).not.toBeNull()
    expect(text(container, 'qcode-prompt')).toBe('QRK')
  })
})
