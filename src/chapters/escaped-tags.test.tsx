/**
 * Regression test: i18n-tagged markup must NOT leak into the DOM as
 * escaped text.
 *
 * If a `<Trans>` call renders an i18n string containing `<var>`,
 * `<sub>`, etc., and the Trans components={} map doesn't declare those
 * tags, react-i18next passes them through as literal text. React
 * then HTML-escapes the angle brackets, so the reader sees
 * «&lt;var&gt;V_{\mathrm{in}}&lt;/var&gt;» in the UI.
 *
 * This was shipped multiple times (ch0_4 labSteps, and several
 * others) because we had no systemic check for it. This test renders
 * every chapter component and every locale, then fails if the DOM
 * textContent contains an escaped tag fragment.
 */
import { describe, it } from 'vitest'
import type { ComponentType } from 'react'
import { renderWithProviders } from '@/test/render'
import { BookmarkProvider } from '@/features/bookmarks/BookmarkContext'

import Welcome from './Welcome'
import Chapter0_1 from './00-intro/Chapter0_1'
import Chapter0_2 from './00-intro/Chapter0_2'
import Chapter0_3 from './00-intro/Chapter0_3'
import Chapter0_4 from './00-intro/Chapter0_4'
import Chapter0_5 from './00-intro/Chapter0_5'
import Chapter1_1 from './01-electricity/Chapter1_1'
import Chapter1_2 from './01-electricity/Chapter1_2'
import Chapter1_3 from './01-electricity/Chapter1_3'
import Chapter1_4 from './01-electricity/Chapter1_4'
import Chapter1_5 from './01-electricity/Chapter1_5'

const chapters: Array<[string, ComponentType]> = [
  ['Welcome', Welcome],
  ['Chapter0_1', Chapter0_1],
  ['Chapter0_2', Chapter0_2],
  ['Chapter0_3', Chapter0_3],
  ['Chapter0_4', Chapter0_4],
  ['Chapter0_5', Chapter0_5],
  ['Chapter1_1', Chapter1_1],
  ['Chapter1_2', Chapter1_2],
  ['Chapter1_3', Chapter1_3],
  ['Chapter1_4', Chapter1_4],
  ['Chapter1_5', Chapter1_5],
]

// Tags we commonly use inside i18n strings. If any of these appear in
// the rendered DOM text (not inside an actual element), that's an
// escaped-tag regression.
const FORBIDDEN_PATTERNS = [
  /<var>/,
  /<\/var>/,
  /<sub>/,
  /<\/sub>/,
  /<sup>/,
  /<\/sup>/,
  /<strong>/,
  /<\/strong>/,
  /<em>/,
  /<\/em>/,
  /<nowrap>/,
  /<\/nowrap>/,
]

describe('Chapters render i18n markup without leaking escaped tags into the DOM', () => {
  for (const [name, Comp] of chapters) {
    for (const language of ['en', 'uk'] as const) {
      it(`${name} (${language}) has no escaped <var>/<sub>/<strong>/<em> in DOM`, () => {
        const { container } = renderWithProviders(
          <BookmarkProvider><Comp /></BookmarkProvider>,
          { language },
        )
        const text = container.textContent ?? ''
        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.test(text)) {
            // Pull ~80 chars of context around the first match to
            // make the failure easy to diagnose.
            const m = text.match(pattern)!
            const idx = text.indexOf(m[0])
            const ctx = text.slice(Math.max(0, idx - 40), idx + 40 + m[0].length)
            throw new Error(
              `Found escaped tag ${m[0]} in rendered ${name} (${language}). ` +
              `Context: …${ctx}… ` +
              `Likely cause: a <Trans> components={} map is missing the tag. ` +
              `Spread {...mathComponents} into the map.`,
            )
          }
        }
      })
    }
  }
})
