/**
 * LastLocationTracker
 *
 * Persists the user's last visited path to localStorage and restores it on
 * the next visit. Renders nothing — side-effects only.
 *
 * Must be rendered inside a React Router <Router> but does NOT need to be
 * inside <Routes>. Placed as a sibling to <Routes> in App.tsx.
 */
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'rrb-last-path'

export default function LastLocationTracker() {
  const location = useLocation()
  const navigate  = useNavigate()
  const restored  = useRef(false)

  // Restore on first mount only.
  // useRef guard prevents double-firing in React Strict Mode.
  useEffect(() => {
    if (restored.current) return
    restored.current = true

    const saved = localStorage.getItem(STORAGE_KEY)
    // Only navigate away from root if we have a non-root saved path
    if (saved && saved !== '/' && location.pathname === '/') {
      navigate(saved, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist every path change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, location.pathname)
  }, [location.pathname])

  return null
}
