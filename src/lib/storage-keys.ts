/**
 * All localStorage keys used by the app.
 *
 * Centralized so:
 *  - we never typo a key string
 *  - it's obvious what we persist (audit-able in one place)
 *  - migrations / clearing are trivial
 *
 * Keys are intentionally NOT renamed from their historical values — changing
 * them would orphan every existing user's preferences. New keys should follow
 * the `trb-*` convention going forward.
 */
export const STORAGE_KEYS = {
  // Appearance
  theme: 'trb-theme',
  font: 'trb-font',
  fontSize: 'trb-font-size',

  // i18n
  language: 'trb-lang',
  languageChosen: 'trb-lang-chosen',

  // Layout
  sidebarOpen: 'radiopedia-sidebar-open',

  // Bookmarks
  bookmarks: 'radiopedia-bookmarks',

  // Guided tour
  tourCompleted: 'radiopedia-tour-completed',
  tourStep: 'radiopedia-tour-step',

  // Last-location resume
  lastPath: 'rrb-last-path',
} as const

