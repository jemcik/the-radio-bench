import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import PhoneticSpeller from './PhoneticSpeller'

const type = (container: HTMLElement, value: string) =>
  fireEvent.change(container.querySelector('input#phon-input') as HTMLInputElement, { target: { value } })

const words = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-testid^="phon-word-"]')).map(el => el.textContent)

describe('PhoneticSpeller', () => {
  it('spells the default Ukrainian call sign, digits left as numerals', () => {
    const { container } = renderWithProviders(<PhoneticSpeller />)
    expect(words(container)).toEqual(['Uniform', 'Romeo', '5', 'Hotel', 'Alfa', 'Alfa'])
  })

  it('uses the official Appendix 14 spellings «Alfa» and «Juliett»', () => {
    const { container } = renderWithProviders(<PhoneticSpeller />)
    type(container, 'AJ')
    expect(words(container)).toEqual(['Alfa', 'Juliett'])
  })

  it('is case-insensitive and ignores punctuation a call sign cannot contain', () => {
    const { container } = renderWithProviders(<PhoneticSpeller />)
    type(container, 'ut/dl1')
    expect(words(container)).toEqual(['Uniform', 'Tango', 'Delta', 'Lima', '1'])
  })

  it('hides the words for self-testing but keeps the letters visible', () => {
    const { container } = renderWithProviders(<PhoneticSpeller />)
    type(container, 'AB')
    fireEvent.click(container.querySelector('input#phon-hide') as HTMLInputElement)
    expect(words(container)).toEqual(['·····', '·····'])
    // the letters themselves must survive, otherwise there is nothing to drill against
    expect(container.querySelector('[data-testid="phon-output"]')?.textContent).toMatch(/A/)
  })

  it('falls back to an explanatory note when nothing spellable is entered', () => {
    const { container } = renderWithProviders(<PhoneticSpeller />)
    type(container, '!!!')
    expect(container.querySelector('[data-testid="phon-empty"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="phon-output"]')).toBeNull()
  })

  it('loads a preset call sign on click', () => {
    const { container } = renderWithProviders(<PhoneticSpeller />)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'W1AW')
    fireEvent.click(btn as HTMLButtonElement)
    expect(words(container)).toEqual(['Whiskey', '1', 'Alfa', 'Whiskey'])
  })

  it('renders the Ukrainian version with the spelling words unchanged', () => {
    const { container } = renderWithProviders(<PhoneticSpeller />, { language: 'uk' })
    // the ITU words are proper names of the standard — they stay Latin in every locale
    expect(words(container)).toEqual(['Uniform', 'Romeo', '5', 'Hotel', 'Alfa', 'Alfa'])
  })
})
