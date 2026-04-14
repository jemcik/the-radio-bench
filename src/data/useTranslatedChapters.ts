import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PARTS, type Part, type ChapterMeta } from './chapters'

/**
 * Returns PARTS with titles and subtitles resolved through i18n.
 * Falls back to the English values baked into chapters.ts when a key is missing.
 */
export function useTranslatedParts(): Part[] {
  const { t } = useTranslation('ui')

  return useMemo(
    () =>
      PARTS.map(part => ({
        ...part,
        title: t(`parts.${part.number}`, { defaultValue: part.title }),
        chapters: part.chapters.map(ch => ({
          ...ch,
          title: t(`chapterTitles.${ch.id}`, { defaultValue: ch.title }),
          subtitle: t(`chapterSubtitles.${ch.id}`, { defaultValue: ch.subtitle }),
        })),
      })),
    [t],
  )
}

/**
 * Translate a single chapter's metadata.
 */
export function useTranslatedChapter(meta: ChapterMeta | undefined): ChapterMeta | undefined {
  const { t } = useTranslation('ui')

  return useMemo(() => {
    if (!meta) return undefined
    return {
      ...meta,
      title: t(`chapterTitles.${meta.id}`, { defaultValue: meta.title }),
      subtitle: t(`chapterSubtitles.${meta.id}`, { defaultValue: meta.subtitle }),
    }
  }, [meta, t])
}
