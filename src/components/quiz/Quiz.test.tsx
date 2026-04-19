import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import Quiz, { buildQuizFromI18n, type QuizQuestion } from './Quiz'

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctIndex: 1,
    explanation: 'Basic arithmetic.',
  },
  {
    id: 'q2',
    question: 'Capital of France?',
    options: ['Paris', 'Berlin', 'Madrid', 'Rome'],
    correctIndex: 0,
    explanation: 'Paris has been the capital since 987 AD.',
  },
  {
    id: 'q3',
    question: 'SI unit of resistance?',
    options: ['Volt', 'Ampere', 'Ohm', 'Farad'],
    correctIndex: 2,
    explanation: 'The ohm, named after Georg Ohm.',
  },
]

function setup(opts: { storageKey?: string } = {}) {
  return renderWithProviders(
    <Quiz title="Sample Quiz" questions={QUESTIONS} storageKey={opts.storageKey} />,
  )
}

describe('buildQuizFromI18n', () => {
  it('builds N questions from prefix and count', () => {
    // Fake TFunction that echoes the key so the shape is observable.
    const t = ((key: string) => key) as unknown as Parameters<typeof buildQuizFromI18n>[0]
    const result = buildQuizFromI18n(t, 'foo', 2)

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      id: 'foo-q1',
      question: 'foo.quiz_q1',
      options: ['foo.quiz_q1_a', 'foo.quiz_q1_b', 'foo.quiz_q1_c', 'foo.quiz_q1_d'],
      explanation: 'foo.quiz_q1_explanation',
    })
    expect(result[1].id).toBe('foo-q2')
  })

  it('parses the correctIndex key as a number', () => {
    const t = ((key: string) => key.endsWith('_correct') ? '2' : key) as unknown as Parameters<typeof buildQuizFromI18n>[0]
    const [q] = buildQuizFromI18n(t, 'x', 1)
    expect(q.correctIndex).toBe(2)
  })
})

describe('Quiz component', () => {
  it('shows the first question on mount', () => {
    setup()
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    // Submit is disabled until an option is picked.
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('enables Submit once an answer is selected', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled()
  })

  it('reveals the explanation after submitting an answer', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(screen.getByText('Basic arithmetic.')).toBeInTheDocument()
  })

  it('marks correct answers as "Correct"', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(screen.getByText(/correct!/i)).toBeInTheDocument()
  })

  it('marks wrong answers as "Incorrect" but still shows explanation', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(screen.getByText(/incorrect/i)).toBeInTheDocument()
    expect(screen.getByText('Basic arithmetic.')).toBeInTheDocument()
  })

  it('advances to the next question via Next', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText('Capital of France?')).toBeInTheDocument()
  })

  it('shows the score screen after the last question', () => {
    setup()
    // Answer all three correctly: 1, 0, 2
    const correct = [1, 0, 2]
    for (let i = 0; i < QUESTIONS.length; i++) {
      // Test fixtures use string options; assert that back so getByRole's
      // name matcher accepts it (QuizQuestion.options is ReactNode[] in the
      // real type, so fixtures just happen to be strings).
      const option = QUESTIONS[i].options[correct[i]] as string
      fireEvent.click(screen.getByRole('button', { name: option }))
      fireEvent.click(screen.getByRole('button', { name: /submit/i }))
      fireEvent.click(screen.getByRole('button', { name: /next|score/i }))
    }
    // Perfect score message appears.
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('persists progress via usePersistedState (A5 regression guard)', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    setup({ storageKey: 'trb-quiz-test' })
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    // Look for at least one write to the quiz key with JSON-shaped state.
    const writesToKey = setItem.mock.calls.filter(([key]) => key === 'trb-quiz-test')
    expect(writesToKey.length).toBeGreaterThan(0)
    const lastPayload = writesToKey[writesToKey.length - 1][1] as string
    const parsed = JSON.parse(lastPayload)
    expect(parsed).toMatchObject({ currentIndex: 1, currentScore: 1 })
    setItem.mockRestore()
  })

  it('resumes from persisted progress on remount', () => {
    localStorage.setItem(
      'trb-quiz-test',
      JSON.stringify({ currentIndex: 1, currentScore: 1 }),
    )
    setup({ storageKey: 'trb-quiz-test' })
    // We should land on question 2 — not question 1 — confirming the hydrate path.
    expect(screen.getByText('Capital of France?')).toBeInTheDocument()
  })

  it('Try Again resets progress from the score screen', () => {
    localStorage.setItem(
      'trb-quiz-test',
      JSON.stringify({ currentIndex: 2, currentScore: 2 }),
    )
    setup({ storageKey: 'trb-quiz-test' })
    // Answer the last question to trigger the score screen.
    fireEvent.click(screen.getByRole('button', { name: 'Ohm' }))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    fireEvent.click(screen.getByRole('button', { name: /score/i }))
    // Try Again button appears.
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    // Question 1 is back.
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('shows an empty-state message when given no questions', () => {
    renderWithProviders(<Quiz title="Empty" questions={[]} />)
    // noQuestions key renders English text in the test provider.
    expect(screen.getByText(/no questions available/i)).toBeInTheDocument()
  })

  it('does not double-count the score when the user remounts after submitting (bug: 7/6 score)', () => {
    // Seed storage as if the user answered q1 correctly and reloaded BEFORE
    // clicking Next — {answered: true, selectedOptionIndex: 1, currentScore: 1}.
    localStorage.setItem(
      'trb-quiz-test',
      JSON.stringify({
        currentIndex: 0,
        currentScore: 1,
        answered: true,
        selectedOptionIndex: 1,
        quizComplete: false,
      }),
    )
    setup({ storageKey: 'trb-quiz-test' })
    // Explanation should be showing (the answered-state is preserved).
    expect(screen.getByText('Basic arithmetic.')).toBeInTheDocument()
    // Submit button is gone — Next takes its place.
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    // Advance to q2, answer it, finish. Score should be 2/3, NOT 3/3.
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Paris' }))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Volt' })) // wrong
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    fireEvent.click(screen.getByRole('button', { name: /score/i }))
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('backfills missing fields when resuming from old-shape stored progress', () => {
    // Pre-fix storage only had {currentIndex, currentScore}. After the fix,
    // loading that shape must not crash and must behave like a fresh question.
    localStorage.setItem(
      'trb-quiz-test',
      JSON.stringify({ currentIndex: 1, currentScore: 1 }),
    )
    setup({ storageKey: 'trb-quiz-test' })
    // Land on q2, with no selection, Submit disabled.
    expect(screen.getByText('Capital of France?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })
})
