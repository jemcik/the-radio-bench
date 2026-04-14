import i18n from '@/i18n'
import { addBookmarkImperative, removeBookmarkImperative } from '@/context/BookmarkContext'

/**
 * Tour step definitions.
 *
 * Each step targets a DOM element via `data-tour` attribute (or a selector)
 * and provides the card content.
 */

export interface TourStepDef {
  /** Selector used to find the spotlight target (data-tour attribute value or CSS selector). */
  target: string
  /** i18n key for card title (under tour namespace, e.g. 'step1Title') */
  titleKey: string
  /** i18n key for card body text (under tour namespace, e.g. 'step1Body') */
  bodyKey: string
  /** Preferred card placement relative to the spotlight */
  placement: 'right' | 'bottom' | 'left' | 'top'
  /** Extra padding around the spotlight cutout (px) */
  padding?: number
  /** Callback fired when this step activates (e.g. to ensure sidebar is open) */
  onEnter?: () => void
  /** Callback fired when leaving this step (cleanup) */
  onExit?: () => void
}

/** Demo bookmark used during the guided tour */
const TOUR_BOOKMARK = { chapterId: 'welcome', sectionId: 'what-youll-need' } as const

function tourBookmarkLabel() {
  return i18n.t('tour.bookmarkDemoLabel', { ns: 'ui' })
}

export const TOUR_STEPS: TourStepDef[] = [
  {
    target: '[data-tour="sidebar"]',
    titleKey: 'tour.step1Title',
    bodyKey: 'tour.step1Body',
    placement: 'right',
    padding: 0,
    onEnter: () => window.dispatchEvent(new CustomEvent('radiopedia:open-sidebar')),
  },
  {
    target: '[data-tour="search"]',
    titleKey: 'tour.step2Title',
    bodyKey: 'tour.step2Body',
    placement: 'bottom',
    padding: 6,
  },
  {
    target: '[data-tour="theme"]',
    titleKey: 'tour.step3Title',
    bodyKey: 'tour.step3Body',
    placement: 'bottom',
    padding: 6,
  },
  {
    target: '[data-tour="glossary-term"]',
    titleKey: 'tour.step4Title',
    bodyKey: 'tour.step4Body',
    placement: 'top',
    padding: 8,
  },
  {
    target: '[data-tour="bookmark-demo"]',
    titleKey: 'tour.step5Title',
    bodyKey: 'tour.step5Body',
    placement: 'top',
    padding: 8,
    onEnter: () => {
      addBookmarkImperative(TOUR_BOOKMARK.chapterId, TOUR_BOOKMARK.sectionId, tourBookmarkLabel())
      window.dispatchEvent(new CustomEvent('radiopedia:open-sidebar'))
    },
  },
  {
    target: '[data-tour="sidebar"]',
    titleKey: 'tour.step6Title',
    bodyKey: 'tour.step6Body',
    placement: 'right',
    padding: 0,
    onEnter: () => window.dispatchEvent(new CustomEvent('radiopedia:open-sidebar')),
    onExit: () => {
      removeBookmarkImperative(TOUR_BOOKMARK.chapterId, TOUR_BOOKMARK.sectionId)
    },
  },
  {
    target: '[data-tour="feedback"]',
    titleKey: 'tour.step7Title',
    bodyKey: 'tour.step7Body',
    placement: 'right',
    padding: 8,
    onEnter: () => window.dispatchEvent(new CustomEvent('radiopedia:open-sidebar')),
  },
]

export const TOUR_STORAGE_KEY = 'radiopedia-tour-completed'
export const TOUR_STEP_KEY = 'radiopedia-tour-step'
