import { describe, expect, it } from 'vitest'
import type { TFunction } from 'i18next'

import enUi from '@/i18n/locales/en/ui.json'
import ukUi from '@/i18n/locales/uk/ui.json'
import { getAllChapters } from '@/data/chapters'
import { buildQuizFromI18n } from './Quiz'

// Regression guard: ch1.3 shipped with all 8 `quiz_qN_correct` values 1-indexed
// instead of 0-indexed (one was even "4" for a 4-option question), so every
// answer registered as wrong. The user caught it by taking the quiz; this test
// catches it in CI by walking every published chapter × locale pair.

type Json = { [key: string]: unknown }

function lookup(resources: Json, key: string): string | undefined {
  const parts = key.split('.')
  let cur: unknown = resources
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Json)) {
      cur = (cur as Json)[p]
    } else {
      return undefined
    }
  }
  return typeof cur === 'string' ? cur : undefined
}

function makeT(resources: Json): TFunction {
  return ((key: string) => lookup(resources, key) ?? key) as unknown as TFunction
}

// Chapter ids use a hyphen (`0-3`); i18n top-level keys use an underscore (`ch0_3`).
function chapterPrefix(id: string): string {
  return `ch${id.replace('-', '_')}`
}

// Walk the chapter's i18n block counting `quiz_qN_correct` keys. Stops at the
// first gap so a deleted question can't silently mask later ones.
function questionCount(resources: Json, prefix: string): number {
  const block = resources[prefix]
  if (!block || typeof block !== 'object') return 0
  let n = 0
  while (`quiz_q${n + 1}_correct` in (block as Json)) n++
  return n
}

const LOCALES: ReadonlyArray<readonly [string, Json]> = [
  ['en', enUi as Json],
  ['uk', ukUi as Json],
]

interface QuizCase {
  chapterId: string
  prefix: string
  count: number
}

const cases: QuizCase[] = getAllChapters()
  .filter(c => c.hasQuiz)
  .map(c => {
    const prefix = chapterPrefix(c.id)
    return { chapterId: c.id, prefix, count: questionCount(enUi as Json, prefix) }
  })
  // `hasQuiz: true` is set ahead of authoring (coming-soon chapters). Skip
  // chapters whose quiz keys aren't in the EN locale yet.
  .filter(c => c.count > 0)

describe('chapter quiz data — every correctIndex is in range', () => {
  it('discovered at least one chapter with quiz content', () => {
    // Guard against the loop silently going empty (e.g. JSON shape change).
    expect(cases.length).toBeGreaterThan(0)
  })

  for (const { chapterId, prefix, count } of cases) {
    for (const [lang, resources] of LOCALES) {
      describe(`${chapterId} (${prefix}) [${lang}]`, () => {
        const localeCount = questionCount(resources, prefix)

        it(`has the same number of questions as en (${count})`, () => {
          expect(localeCount).toBe(count)
        })

        const questions = buildQuizFromI18n(makeT(resources), prefix, count)

        it.each(questions.map((q, i) => [i + 1, q] as const))(
          'q%i correctIndex is an integer in [0, options.length)',
          (_n, q) => {
            expect(Number.isInteger(q.correctIndex)).toBe(true)
            expect(q.correctIndex).toBeGreaterThanOrEqual(0)
            expect(q.correctIndex).toBeLessThan(q.options.length)
          },
        )
      })
    }
  }
})
