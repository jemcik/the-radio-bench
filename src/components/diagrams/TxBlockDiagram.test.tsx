import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import TxBlockDiagram from './TxBlockDiagram'

/**
 * Same guard as SuperhetBlockDiagram: each stage description renders through
 * `<Trans i18nKey={`…${selected}Desc`}>` with a DYNAMIC key, so the static
 * tag-render gates can't verify the local `descComponents` map covers every tag
 * reachable at runtime. This clicks EVERY block in BOTH locales and asserts the
 * panel never leaks a raw or escaped tag — catching, in particular, any UA-only
 * tag (e.g. an `<em>` from an «(англ. …)» expansion) the translation might add.
 */
// stage counts per variant (the antenna is a non-interactive glyph):
//   ssb  → osc, buffer, mod, mixer, driver, pa, filter, mic, vfo  (9)
//   cwfm → osc, buffer, mult, driver, pa, filter, mic             (7)
const VARIANTS = [
  { variant: 'ssb', count: 9 },
  { variant: 'cwfm', count: 7 },
] as const

describe('TxBlockDiagram', () => {
  for (const language of ['en', 'uk'] as const) {
    for (const { variant, count } of VARIANTS) {
    it(`renders every stage description without leaking literal markup (${variant}, ${language})`, () => {
      const { container } = renderWithProviders(<TxBlockDiagram variant={variant} />, { language })
      const blocks = Array.from(container.querySelectorAll('[role="button"]'))
      expect(blocks.length).toBe(count)
      for (const block of blocks) {
        fireEvent.click(block)
        const text = container.textContent ?? ''
        const label = block.getAttribute('aria-label')
        expect(text, `stage "${label}" leaked an escaped tag`).not.toContain('&lt;')
        expect(text, `stage "${label}" leaked a raw tag`).not.toContain('<')
      }
    })
    }
  }
})
