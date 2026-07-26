import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import PhoneticAlphabetTable from './PhoneticAlphabetTable'
import { ITU_ALPHABET } from '@/lib/phonetic-alphabet'

describe('PhoneticAlphabetTable', () => {
  it('shows all twenty-six letters — the reader must be able to learn the set from the page', () => {
    const { container } = renderWithProviders(<PhoneticAlphabetTable />)
    expect(container.querySelectorAll('li')).toHaveLength(26)
  })

  it('pairs every letter with its ITU word, in A–Z order', () => {
    const { container } = renderWithProviders(<PhoneticAlphabetTable />)
    const rows = Array.from(container.querySelectorAll('li')).map(li => li.textContent)
    expect(rows[0]).toBe('AAlfa')
    expect(rows[25]).toBe('ZZulu')
    for (const [letter, word] of Object.entries(ITU_ALPHABET)) {
      expect(rows).toContain(`${letter}${word}`)
    }
  })

  it('uses the Appendix 14 spellings, not the anglicised ones', () => {
    const { container } = renderWithProviders(<PhoneticAlphabetTable />)
    const txt = container.textContent ?? ''
    expect(txt).toMatch(/Alfa/)
    expect(txt).toMatch(/Juliett/)
    expect(txt).not.toMatch(/Alpha/)
    expect(txt).not.toMatch(/Juliet(?!t)/)
  })

  it('keeps the words Latin in the Ukrainian locale — they are names of the standard', () => {
    const { container } = renderWithProviders(<PhoneticAlphabetTable />, { language: 'uk' })
    expect(container.querySelectorAll('li')).toHaveLength(26)
    expect(container.textContent).toMatch(/Whiskey/)
  })
})
