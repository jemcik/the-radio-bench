import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Lightweight toast system.
 *
 * Replaces the previous imperative `document.createElement` + setTimeout block
 * in Layout.tsx. Toasts are rendered through a React portal driven by context;
 * any component can call `useToast().show(message)` to enqueue one.
 *
 * Kept intentionally small — single icon, single position, single duration —
 * because the only consumer right now is the bookmark-saved notification. Add
 * variants here when a second use case appears, not before.
 */

const DEFAULT_DURATION_MS = 2500
const EXIT_ANIMATION_MS = 350

interface Toast {
  id: number
  message: string
  /** Internal lifecycle flag flipped just before the toast is removed. */
  exiting: boolean
}

interface ToastContextValue {
  show: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>[]>>(new Map())
  const nextId = useRef(0)

  // Cleanup any pending timers if the provider unmounts mid-toast.
  useEffect(() => {
    const map = timers.current
    return () => {
      map.forEach(list => list.forEach(clearTimeout))
      map.clear()
    }
  }, [])

  const show = useCallback((message: string) => {
    const id = nextId.current++
    setToasts(prev => [...prev, { id, message, exiting: false }])

    // Schedule the exit animation, then the removal.
    const exitTimer = setTimeout(() => {
      setToasts(prev => prev.map(t => (t.id === id ? { ...t, exiting: true } : t)))

      const removeTimer = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
        timers.current.delete(id)
      }, EXIT_ANIMATION_MS)

      timers.current.set(id, [exitTimer, removeTimer])
    }, DEFAULT_DURATION_MS)

    timers.current.set(id, [exitTimer])
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(<ToastViewport toasts={toasts} />, document.body)}
    </ToastContext.Provider>
  )
}

function ToastViewport({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-[4.5rem] left-4 z-[9990] flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-2 py-2.5 pl-3 pr-4 rounded-xl border-[1.5px] border-primary/40',
            'bg-card text-primary text-[0.8125rem] font-semibold shadow-lg',
            'shadow-primary/15',
            toast.exiting ? 'animate-toast-out' : 'animate-toast-in',
          )}
        >
          <Bookmark size={16} fill="currentColor" stroke="none" className="shrink-0" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
