import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import Widget from '@/components/ui/widget'
import { Button } from '@/components/ui/button'
import { ResultBox } from '@/components/ui/result-box'
import { codec, usePersistedState } from '@/lib/hooks/usePersistedState'
import { cn } from '@/lib/utils'

/** A single question in the quiz */
export interface QuizQuestion {
  /** Unique identifier for the question */
  id: string
  /** The question text */
  question: string
  /** Array of 4 answer choices */
  options: string[]
  /** Index of the correct answer (0-3) */
  correctIndex: number
  /** Explanation shown after answering */
  explanation: string
}

interface QuizProps {
  /** Quiz title */
  title: string
  /** Array of questions */
  questions: QuizQuestion[]
  /** localStorage key for progress persistence (optional) */
  storageKey?: string
}

interface QuizProgress {
  currentIndex: number
  currentScore: number
}

const INITIAL_PROGRESS: QuizProgress = { currentIndex: 0, currentScore: 0 }

/**
 * Build a `QuizQuestion[]` from i18n keys shaped like
 *   `${prefix}.quiz_q${n}`, `_a`, `_b`, `_c`, `_d`, `_correct`, `_explanation`
 *
 * Every chapter with a quiz follows this convention, so callers can just do:
 *
 *     const questions = useMemo(() => buildQuizFromI18n(t, 'ch0_3', 12), [t])
 */
export function buildQuizFromI18n(t: TFunction, prefix: string, count: number): QuizQuestion[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1
    return {
      id: `${prefix}-q${n}`,
      question: t(`${prefix}.quiz_q${n}`),
      options: [
        t(`${prefix}.quiz_q${n}_a`),
        t(`${prefix}.quiz_q${n}_b`),
        t(`${prefix}.quiz_q${n}_c`),
        t(`${prefix}.quiz_q${n}_d`),
      ],
      correctIndex: Number(t(`${prefix}.quiz_q${n}_correct`)),
      explanation: t(`${prefix}.quiz_q${n}_explanation`),
    }
  })
}

/**
 * Reusable Quiz component for Radiopedia chapters.
 *
 * - Shows one question at a time
 * - Immediate feedback after each answer (correct/incorrect + explanation)
 * - Score summary at the end
 * - No backend — all answers are embedded
 * - Progress persisted via usePersistedState when `storageKey` is supplied
 */
export default function Quiz({ title, questions, storageKey }: QuizProps) {
  const { t } = useTranslation('ui')

  // Progress is only persisted when a storageKey is supplied. We always call
  // the hook (it tolerates an unused key) and pass a safe no-op key otherwise.
  const [progress, setProgress] = usePersistedState<QuizProgress>(
    storageKey ?? '__quiz-ephemeral__',
    INITIAL_PROGRESS,
    codec.json<QuizProgress>(),
  )

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)

  // Bail out if the persisted index is out of range (questions may shrink
  // between visits).
  const currentQuestionIndex =
    progress.currentIndex < questions.length ? progress.currentIndex : 0
  const score = progress.currentScore

  if (questions.length === 0) {
    return (
      <Widget title={title}>
        <p className="text-sm text-muted-foreground">{t('quiz.noQuestions')}</p>
      </Widget>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnsweredCorrectly = answered && selectedOptionIndex === currentQuestion.correctIndex

  const handleSelectOption = (optionIndex: number) => {
    if (answered) return  // Prevent changing answer after submission
    setSelectedOptionIndex(optionIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null) return

    setAnswered(true)
    if (selectedOptionIndex === currentQuestion.correctIndex) {
      setProgress({ ...progress, currentScore: score + 1 })
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setProgress({ ...progress, currentIndex: currentQuestionIndex + 1 })
      setSelectedOptionIndex(null)
      setAnswered(false)
    } else {
      setQuizComplete(true)
    }
  }

  const handleTryAgain = () => {
    setProgress(INITIAL_PROGRESS)
    setSelectedOptionIndex(null)
    setAnswered(false)
    setQuizComplete(false)
  }

  // Score screen
  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100)
    const perfectScore = score === questions.length
    const goodScore = percentage >= 70

    const feedbackMessage = perfectScore
      ? t('quiz.perfect')
      : goodScore
        ? t('quiz.good')
        : t('quiz.review')

    return (
      <Widget title={title}>
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">{t('quiz.score')}</h3>
            <div className="text-5xl font-bold text-primary mb-4">{percentage}%</div>
            <p className="text-lg text-muted-foreground mb-4">
              {score} / {questions.length}
            </p>
            <p className="text-base text-foreground">{feedbackMessage}</p>
          </div>

          <Button onClick={handleTryAgain} size="lg">
            {t('quiz.tryAgain')}
          </Button>
        </div>
      </Widget>
    )
  }

  // Question screen
  return (
    <Widget title={title}>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">
            {t('quiz.questionOf', {
              current: currentQuestionIndex + 1,
              total: questions.length,
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOptionIndex === index
            const isCorrect = index === currentQuestion.correctIndex
            const shouldHighlightCorrect = answered && isCorrect
            const shouldShowError = answered && isSelected && !isCorrect

            return (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={answered}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-md border-2 transition-all',
                  'hover:bg-accent disabled:cursor-default',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  !answered && !isSelected && 'border-border bg-card hover:border-primary/50',
                  !answered && isSelected && 'border-primary bg-primary/5',
                  shouldHighlightCorrect && 'border-callout-experiment bg-callout-experiment/10',
                  shouldShowError && 'border-callout-danger bg-callout-danger/10',
                )}
              >
                <span className="text-sm font-medium text-foreground">{option}</span>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div className="mb-6">
            <ResultBox tone={isAnsweredCorrectly ? 'success' : 'error'}>
              <p className={cn(
                'text-sm font-semibold mb-2',
                isAnsweredCorrectly ? 'text-callout-experiment' : 'text-callout-danger',
              )}>
                {isAnsweredCorrectly ? t('quiz.correct') : t('quiz.incorrect')}
              </p>
              <p className="text-sm text-foreground">{currentQuestion.explanation}</p>
            </ResultBox>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {!answered ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedOptionIndex === null}
              className="flex-1"
            >
              {t('quiz.submit')}
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              {currentQuestionIndex < questions.length - 1 ? t('quiz.next') : t('quiz.score')}
            </Button>
          )}
        </div>
      </div>
    </Widget>
  )
}
