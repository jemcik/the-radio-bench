import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import CallsignDecoder, { decode } from './CallsignDecoder'

const type = (container: HTMLElement, value: string) =>
  fireEvent.change(container.querySelector('input#dec-input') as HTMLInputElement, { target: { value } })

const text = (container: HTMLElement, testId: string) =>
  (container.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null)?.textContent ?? ''

describe('decode', () => {
  it('splits a Ukrainian call sign into prefix, digit and suffix', () => {
    expect(decode('UR5HAA')).toMatchObject({ prefix: 'UR', digit: '5', suffix: 'HAA', admin: 'ua', format: '2×3' })
  })

  it('splits a one-letter-prefix US call sign', () => {
    expect(decode('W1AW')).toMatchObject({ prefix: 'W', digit: '1', suffix: 'AW', admin: 'us', format: '1×2' })
  })

  it('treats the longer segment of UT/DL1ABC as the home call, not the visitor prefix', () => {
    const d = decode('UT/DL1ABC')
    expect(d).toMatchObject({ call: 'DL1ABC', prefix: 'DL', digit: '1', suffix: 'ABC', indicator: 'UT' })
  })

  it('rejects anything without a call-sign shape', () => {
    expect(decode('hello')).toBeNull()
    expect(decode('')).toBeNull()
  })
})

describe('CallsignDecoder', () => {
  it('puts a Ukrainian call sign’s geography in the suffix, not the digit', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    expect(text(container, 'dec-country')).toMatch(/Ukraine/)
    // H is the Poltava letter — and the digit must be explicitly disclaimed
    expect(text(container, 'dec-ua')).toMatch(/Poltava/)
    expect(text(container, 'dec-ua')).toMatch(/digit carries no geography/)
  })

  it('reads the second suffix letter as the station type', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    expect(text(container, 'dec-ua')).toMatch(/individual station/)
    type(container, 'UR4YWA')          // W is in the collective range
    expect(text(container, 'dec-ua')).toMatch(/collective/)
  })

  it('recognises UR0 as reserved for repeaters and beacons', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'UR0FVA')
    expect(text(container, 'dec-ua')).toMatch(/repeaters and beacons/)
  })

  it('puts a US call sign’s geography in the digit, not the suffix', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'W1AW')
    expect(text(container, 'dec-country')).toMatch(/United States/)
    expect(text(container, 'dec-us')).toMatch(/Massachusetts/)
    expect(text(container, 'dec-us')).toMatch(/suffix carries no geography/)
  })

  it('maps the US numeral 0 to the tenth call area', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'K0ABC')
    expect(text(container, 'dec-us')).toMatch(/Colorado/)
  })

  it('names EM/EN/EO as Ukrainian special call signs', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'EM5HQ')
    expect(text(container, 'dec-country')).toMatch(/special event or contest/)
  })

  it('flags a visiting operator’s indicator separately from the issued call', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'UT/DL1ABC')
    expect(text(container, 'dec-country')).toMatch(/Germany/)
    expect(text(container, 'dec-indicator-note')).toMatch(/added indicator/)
  })

  it('is honest about prefixes outside its table rather than guessing', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'ZL1ABC')
    expect(text(container, 'dec-country')).toMatch(/Appendix 42/)
    expect(container.querySelector('[data-testid="dec-ua"]')).toBeNull()
    expect(container.querySelector('[data-testid="dec-us"]')).toBeNull()
  })

  it('explains itself instead of blanking on unparseable input', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'hello')
    expect(container.querySelector('[data-testid="dec-invalid"]')).not.toBeNull()
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<CallsignDecoder />, { language: 'uk' })
    expect(container.querySelector('input#dec-input')).not.toBeNull()
    expect(text(container, 'dec-parts')).toMatch(/UR/)
  })
})

describe('CallsignDecoder — cases the first version got wrong', () => {
  it('does not hand a Hawaiian call sign a mainland call area', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'KH6XYZ')
    expect(text(container, 'dec-country')).toMatch(/United States/)
    // KH is an insular-area prefix: the digit is not a mainland call area
    expect(text(container, 'dec-us')).not.toMatch(/California/)
  })

  it('does not hand an Alaskan call sign the north-western states', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'KL7AA')
    expect(text(container, 'dec-us')).not.toMatch(/Idaho|Montana|Oregon/)
  })

  it('still reads the call area for a mainland call sign', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'K6ABC')
    expect(text(container, 'dec-us')).toMatch(/California/)
  })

  it('does not give a special-event call sign an oblast', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'EM5UA')
    expect(text(container, 'dec-country')).toMatch(/special event or contest/)
    expect(text(container, 'dec-ua')).not.toMatch(/Kyiv|oblast/)
  })

  it('drops the digit note on a repeater call sign, where it would contradict', () => {
    const { container } = renderWithProviders(<CallsignDecoder />)
    type(container, 'UR0FVA')
    expect(text(container, 'dec-ua')).toMatch(/repeaters and beacons/)
    expect(text(container, 'dec-ua')).not.toMatch(/issued in sequence/)
  })
})
