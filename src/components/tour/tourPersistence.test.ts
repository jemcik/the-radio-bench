import { describe, expect, it } from 'vitest'
import { tourPersistence } from './tourPersistence'
import { STORAGE_KEYS } from '@/lib/storage-keys'

describe('tourPersistence', () => {
  describe('isCompleted', () => {
    it('false when nothing is stored', () => {
      expect(tourPersistence.isCompleted()).toBe(false)
    })

    it("true when the flag is exactly '1'", () => {
      localStorage.setItem(STORAGE_KEYS.tourCompleted, '1')
      expect(tourPersistence.isCompleted()).toBe(true)
    })

    it('false for any other stored value', () => {
      localStorage.setItem(STORAGE_KEYS.tourCompleted, 'true')
      expect(tourPersistence.isCompleted()).toBe(false)
    })
  })

  describe('getSavedStep', () => {
    it('null when nothing is stored', () => {
      expect(tourPersistence.getSavedStep()).toBeNull()
    })

    it('returns the parsed integer when present', () => {
      localStorage.setItem(STORAGE_KEYS.tourStep, '3')
      expect(tourPersistence.getSavedStep()).toBe(3)
    })

    it('null on garbage values (defensive)', () => {
      localStorage.setItem(STORAGE_KEYS.tourStep, 'oops')
      expect(tourPersistence.getSavedStep()).toBeNull()
    })
  })

  describe('saveStep', () => {
    it('stringifies and stores', () => {
      tourPersistence.saveStep(5)
      expect(localStorage.getItem(STORAGE_KEYS.tourStep)).toBe('5')
    })

    it('round-trips through getSavedStep', () => {
      tourPersistence.saveStep(7)
      expect(tourPersistence.getSavedStep()).toBe(7)
    })
  })

  describe('markCompleted', () => {
    it("sets the completion flag to '1'", () => {
      tourPersistence.markCompleted()
      expect(localStorage.getItem(STORAGE_KEYS.tourCompleted)).toBe('1')
    })

    it('clears any in-progress saved step (so the next start is fresh)', () => {
      tourPersistence.saveStep(4)
      tourPersistence.markCompleted()
      expect(tourPersistence.getSavedStep()).toBeNull()
    })
  })

  describe('reset', () => {
    it('clears the completion flag', () => {
      tourPersistence.markCompleted()
      tourPersistence.reset()
      expect(tourPersistence.isCompleted()).toBe(false)
    })

    it('leaves a saved step in place (so the user resumes where they were)', () => {
      tourPersistence.saveStep(2)
      tourPersistence.markCompleted() // would normally clear step
      tourPersistence.saveStep(2) // user resumes — pretend they got back to step 2
      tourPersistence.reset()
      expect(tourPersistence.getSavedStep()).toBe(2)
    })
  })
})
