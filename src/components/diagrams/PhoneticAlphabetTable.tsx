/**
 * Chapter 4.4 §2 — the spelling alphabet itself.
 *
 * The reference table. The chapter previously taught what a phonetic alphabet
 * is, explained two of its spellings and shipped a trainer to drill it — but
 * never actually showed the twenty-six words, so a reader could not learn the
 * set from the page. Reader-flagged, and correctly: a course has to hand over
 * the thing it is teaching.
 *
 * Rendered as HTML rather than SVG on purpose. Twenty-six items need to reflow
 * from four columns to two on a narrow screen, stay selectable and copyable,
 * and be read in order by a screen reader — none of which an SVG does well.
 * The letters carry `font-mono` so A/I and O/0 stay distinguishable, which is
 * the whole reason the alphabet exists.
 *
 * The words come from `@/lib/phonetic-alphabet`, shared with `PhoneticSpeller`,
 * so the reference and the trainer cannot disagree.
 */
import { useTranslation } from 'react-i18next'
import { ITU_ALPHABET, ITU_LETTERS } from '@/lib/phonetic-alphabet'

export default function PhoneticAlphabetTable() {
  const { t } = useTranslation('ui')

  return (
    <div className="not-prose">
      <ul
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5 list-none p-0 m-0"
        aria-label={t('ch4_4.alphabetTable.aria')}
      >
        {ITU_LETTERS.map(letter => (
          <li
            key={letter}
            className="flex items-baseline gap-3 border-b border-border/40 py-1.5"
          >
            <span className="font-mono text-lg font-semibold text-foreground w-5 shrink-0">
              {letter}
            </span>
            <span className="text-foreground">{ITU_ALPHABET[letter]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
