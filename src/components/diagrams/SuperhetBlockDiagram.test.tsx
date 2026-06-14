import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import SuperhetBlockDiagram from './SuperhetBlockDiagram'

/**
 * Guards the bug class the gates could NOT catch statically: each stage's
 * description renders through `<Trans i18nKey={`…${selected}Desc`}>` with a
 * DYNAMIC key, so check:trans/check:tag-renders can't resolve which keys are
 * reached and can't verify the local `descComponents` map covers every tag in
 * them. A UA-only `<em>` (added by the «(англ. …)» expansions) was missing from
 * the map and shipped as literal «&lt;em>…&lt;/em>» — twice, reader-flagged.
 *
 * This test clicks EVERY block in BOTH locales and asserts the rendered panel
 * never leaks a raw or escaped tag. Any future desc tag that isn't mapped fails
 * here.
 */
describe('SuperhetBlockDiagram', () => {
  for (const language of ['en', 'uk'] as const) {
    it(`renders every stage description without leaking literal markup (${language})`, () => {
      const { container } = renderWithProviders(<SuperhetBlockDiagram />, { language })
      const blocks = Array.from(container.querySelectorAll('[role="button"]'))
      // antenna + speaker are glyphs; the 9 stages (rf, mixer, if, det, af, lo,
      // bfo, squelch, ps) are the clickable buttons.
      expect(blocks.length).toBe(9)
      for (const block of blocks) {
        fireEvent.click(block)
        const text = container.textContent ?? ''
        const label = block.getAttribute('aria-label')
        // A leaked tag shows up either escaped («&lt;em>») or raw («<em>»).
        expect(text, `stage "${label}" leaked an escaped tag`).not.toContain('&lt;')
        expect(text, `stage "${label}" leaked a raw tag`).not.toContain('<')
      }
    })
  }
})
