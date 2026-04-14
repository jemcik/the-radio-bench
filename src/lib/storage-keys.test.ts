import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from './storage-keys'

describe('STORAGE_KEYS.quizProgress', () => {
  // The exact key format is load-bearing: changing it would orphan every
  // user's in-progress quiz state. Pin the expected shape.
  it('formats quiz keys as trb-quiz-<chapterId>', () => {
    expect(STORAGE_KEYS.quizProgress('0-3')).toBe('trb-quiz-0-3')
    expect(STORAGE_KEYS.quizProgress('1-5')).toBe('trb-quiz-1-5')
  })

  it('produces distinct keys per chapter', () => {
    expect(STORAGE_KEYS.quizProgress('0-3')).not.toBe(STORAGE_KEYS.quizProgress('0-4'))
  })
})
