import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { TOUR_STEPS } from './tourSteps'
import TourOverlay from './TourOverlay'
import WelcomeBuddy from '../WelcomeBuddy'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { tourPersistence } from './tourPersistence'

/* ── Tour context (lets any component trigger the tour) ───────────────────── */

interface TourContextValue {
  startTour: () => void
}

const TourContext = createContext<TourContextValue>({ startTour: () => {} })

export function useTour() {
  return useContext(TourContext)
}

/**
 * Guided tour that auto-starts on first visit.
 * Can also be triggered from any page via the useTour() hook.
 *
 * Steps whose targets aren't in the DOM when reached are automatically
 * skipped at runtime (rather than pre-filtered at start).
 */
export default function GuidedTour({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isWelcome = location.pathname === '/'

  // 'idle' → 'prompt' → 'active' → 'done'
  const [phase, setPhase] = useState<'idle' | 'prompt' | 'active' | 'done'>('idle')
  const [step, setStep] = useState(0)

  // We use ALL steps — missing targets are skipped at runtime
  const steps = TOUR_STEPS

  // Track skip attempts to avoid infinite loops
  const skipCount = useRef(0)

  // Auto-trigger on first visit (welcome page only, after language is chosen)
  useEffect(() => {
    if (!isWelcome) return
    if (tourPersistence.isCompleted()) return

    // Wait for the language banner to be dismissed first
    const check = () => !!localStorage.getItem(STORAGE_KEYS.languageChosen)
    if (check()) {
      const t = setTimeout(() => setPhase('prompt'), 800)
      return () => clearTimeout(t)
    }

    // Poll until language is chosen (banner writes STORAGE_KEYS.languageChosen on pick)
    const interval = setInterval(() => {
      if (check()) {
        clearInterval(interval)
        setTimeout(() => setPhase('prompt'), 600)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [isWelcome])

  /**
   * When a step activates, check if its target exists.
   * If not, auto-advance to the next step. If the target exists but is
   * off-screen, scroll it into view first.
   */
  useEffect(() => {
    if (phase !== 'active') return

    const currentStep = steps[step]
    if (!currentStep) return

    // Fire onEnter first (may open sidebar, creating the target)
    currentStep.onEnter?.()

    const t = setTimeout(() => {
      // Match TourOverlay.measure: Sidebar renders twice (desktop +
      // mobile copies) so `querySelector` may pick a hidden copy with
      // a (0,0,0,0) rect. Iterate and pick the first visible match.
      const els = document.querySelectorAll(currentStep.target)
      let el: Element | null = null
      for (const candidate of els) {
        const r = candidate.getBoundingClientRect()
        if (r.width > 0 && r.height > 0) {
          el = candidate
          break
        }
      }

      if (!el) {
        // Target doesn't exist — skip to next (with loop guard)
        if (skipCount.current < steps.length) {
          skipCount.current++
          if (step < steps.length - 1) {
            const next = step + 1
            setStep(next)
            tourPersistence.saveStep(next)
          } else {
            completeTour()
          }
        } else {
          // Exhausted all steps, none have targets — bail
          completeTour()
        }
        return
      }

      // Reset skip counter when we find a valid target
      skipCount.current = 0

      // Scroll the target into view if it's outside the viewport
      const rect = el.getBoundingClientRect()
      const inViewport =
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth

      if (!inViewport) {
        // Try to scroll within the nearest scrollable ancestor
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 120) // wait for onEnter effects (sidebar open, etc.)

    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, step])

  const startTour = useCallback(() => {
    skipCount.current = 0
    // Resume from saved step if available
    const saved = tourPersistence.getSavedStep()
    const resumeStep = saved !== null ? Math.min(saved, steps.length - 1) : 0
    setStep(resumeStep)
    setPhase('active')
  }, [steps.length])

  // Dismiss = remember where the user left off
  const dismissTour = useCallback(() => {
    steps[step]?.onExit?.()
    tourPersistence.saveStep(step)
    setPhase('done')
    // Ensure the mobile drawer doesn't stay open after the tour —
    // the last-visited step may have opened it. Desktop ignores this.
    window.dispatchEvent(new Event('radiopedia:close-sidebar'))
    window.dispatchEvent(new Event('radiopedia:scroll-top'))
  }, [step, steps])

  // Complete = finished all steps
  const completeTour = useCallback(() => {
    steps[step]?.onExit?.()
    tourPersistence.markCompleted()
    setPhase('done')
    window.dispatchEvent(new Event('radiopedia:close-sidebar'))
    window.dispatchEvent(new Event('radiopedia:scroll-top'))
  }, [step, steps])

  const nextStep = useCallback(() => {
    // Fire onExit for the current step (cleanup, e.g. remove demo bookmark)
    steps[step]?.onExit?.()

    if (step < steps.length - 1) {
      const next = step + 1
      setStep(next)
      tourPersistence.saveStep(next)
    } else {
      completeTour()
    }
  }, [step, steps, completeTour])

  const contextValue = useCallback(() => {
    // Clear stored flag and start fresh or resume
    tourPersistence.reset()
    skipCount.current = 0
    const saved = tourPersistence.getSavedStep()
    if (saved !== null) {
      // Has a saved step — go straight to active (resume)
      const resumeStep = Math.min(saved, steps.length - 1)
      setStep(resumeStep)
      setPhase('active')
    } else {
      setStep(0)
      setPhase('prompt')
    }
  }, [steps.length])

  return (
    <TourContext.Provider value={{ startTour: contextValue }}>
      {children}
      {phase !== 'idle' && phase !== 'done' && createPortal(
        <>
          {phase === 'prompt' && (
            <TourPrompt onStart={startTour} onSkip={completeTour} />
          )}
          {phase === 'active' && steps[step] && (
            <TourOverlay
              step={steps[step]}
              current={step}
              total={steps.length}
              onNext={nextStep}
              onSkip={completeTour}
              onDismiss={dismissTour}
            />
          )}
        </>,
        document.body,
      )}
    </TourContext.Provider>
  )
}

/* ── Initial prompt card ──────────────────────────────────────────────────── */

function TourPrompt({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const { t } = useTranslation('ui')

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onSkip}
      />

      {/* Prompt card */}
      <div className="relative z-10 w-80 max-w-[calc(100vw-2rem)] rounded-xl border-2 border-primary/40 border-t-[3px] border-t-primary bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-5 text-center">
          <WelcomeBuddy size={80} className="text-primary mx-auto mb-3" />

          <h2 className="text-lg font-bold text-foreground">
            {t('guidedTour.firstTimeHere')}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {t('guidedTour.tourDescription')}
          </p>

          <div className="flex flex-col gap-2 mt-5">
            <button
              onClick={onStart}
              className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {t('guidedTour.showMeAround')}
            </button>
            <button
              onClick={onSkip}
              className="w-full px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('guidedTour.exploreOnMyOwn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
