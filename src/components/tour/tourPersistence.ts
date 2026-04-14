import { STORAGE_KEYS } from '@/lib/storage-keys'

/**
 * localStorage helpers for the guided tour.
 *
 * All access goes through this module so:
 *  - GuidedTour.tsx reads as orchestration logic (no key strings)
 *  - the persistence contract is testable in isolation
 *  - the LANG_CHOSEN check is the only thing GuidedTour still imports
 *    directly from STORAGE_KEYS (it isn't tour state)
 *
 * These are plain functions, not a React hook — every caller is imperative
 * (inside an effect or callback), so there's no value-changes-trigger-render
 * benefit to make this reactive.
 */
export const tourPersistence = {
  /** True once the user has finished or dismissed the tour at least once. */
  isCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.tourCompleted) === '1'
  },

  /** The 0-based step the user was on when they last left the tour, or null. */
  getSavedStep(): number | null {
    const raw = localStorage.getItem(STORAGE_KEYS.tourStep)
    if (raw === null) return null
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? n : null
  },

  /** Persist progress so the user can resume after a reload. */
  saveStep(step: number): void {
    localStorage.setItem(STORAGE_KEYS.tourStep, String(step))
  },

  /**
   * Mark the tour finished. Clears the saved step so a future "start tour"
   * begins fresh rather than resuming.
   */
  markCompleted(): void {
    localStorage.setItem(STORAGE_KEYS.tourCompleted, '1')
    localStorage.removeItem(STORAGE_KEYS.tourStep)
  },

  /**
   * Wipe the completion flag so the tour can be re-triggered. Saved step (if
   * any) is left in place so the user resumes where they were.
   */
  reset(): void {
    localStorage.removeItem(STORAGE_KEYS.tourCompleted)
  },
}
