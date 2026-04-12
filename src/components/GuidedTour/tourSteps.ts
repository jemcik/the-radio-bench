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
  /** Card title */
  title: string
  /** Card body text */
  body: string
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
const TOUR_BOOKMARK = { chapterId: '0-1', sectionId: 'what-youll-need', label: "What you'll need" } as const

export const TOUR_STEPS: TourStepDef[] = [
  {
    target: '[data-tour="sidebar"]',
    title: 'Your map',
    body: 'Chapters are grouped by topic. The sidebar shows your progress — click any chapter to jump in. Chapters marked "soon" are on the way.',
    placement: 'right',
    padding: 0,
    onEnter: () => window.dispatchEvent(new CustomEvent('radiopedia:open-sidebar')),
  },
  {
    target: '[data-tour="search"]',
    title: 'Quick search',
    body: 'Press ⌘K (or Ctrl+K) from anywhere to search chapters and glossary terms instantly. Try typing "voltage" or "antenna".',
    placement: 'bottom',
    padding: 6,
  },
  {
    target: '[data-tour="theme"]',
    title: 'Pick a theme',
    body: 'Prefer dark mode? A warm paper look? Choose the theme that\'s easiest on your eyes — there are six to pick from.',
    placement: 'bottom',
    padding: 6,
  },
  {
    target: '[data-tour="glossary-term"]',
    title: 'Interactive terms',
    body: 'Highlighted words are glossary terms. Hover for a quick definition, or click to pin a full reference card with formulas and related terms.',
    placement: 'top',
    padding: 8,
  },
  {
    target: '[data-tour="bookmark-demo"]',
    title: 'Bookmark anything',
    body: 'Every section heading has a bookmark icon. We just saved "What you\'ll need" for you — look at the sidebar!',
    placement: 'top',
    padding: 8,
    onEnter: () => {
      addBookmarkImperative(TOUR_BOOKMARK.chapterId, TOUR_BOOKMARK.sectionId, TOUR_BOOKMARK.label)
      window.dispatchEvent(new CustomEvent('radiopedia:open-sidebar'))
    },
  },
  {
    target: '[data-tour="sidebar"]',
    title: 'Quick access',
    body: 'Bookmarks appear at the top of the sidebar. Click any saved item to jump straight back. The × removes it when you\'re done.',
    placement: 'right',
    padding: 0,
    onEnter: () => window.dispatchEvent(new CustomEvent('radiopedia:open-sidebar')),
    onExit: () => {
      removeBookmarkImperative(TOUR_BOOKMARK.chapterId, TOUR_BOOKMARK.sectionId)
    },
  },
  {
    target: '[data-tour="feedback"]',
    title: 'Get in touch',
    body: 'Spotted a mistake? Have a suggestion? Use the links at the bottom of the sidebar to send feedback by email or open an issue on GitHub.',
    placement: 'right',
    padding: 8,
    onEnter: () => window.dispatchEvent(new CustomEvent('radiopedia:open-sidebar')),
  },
]

export const TOUR_STORAGE_KEY = 'radiopedia-tour-completed'
export const TOUR_STEP_KEY = 'radiopedia-tour-step'
