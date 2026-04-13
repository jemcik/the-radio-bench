import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import LogoIcon from '@/components/LogoIcon'
import Sidebar from './Sidebar'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import SearchDialog, { SearchTrigger } from './SearchDialog'
import { useTour } from '@/components/GuidedTour/GuidedTour'
import { useBookmarks } from '@/context/BookmarkContext'

// Tailwind's lg breakpoint
const LG = 1024

const SIDEBAR_KEY = 'radiopedia-sidebar-open'

export default function Layout() {
  const { t } = useTranslation('ui')
  const navigate = useNavigate()
  const { startTour } = useTour()
  const { bookmarks } = useBookmarks()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const sidebarBtnRef = useRef<HTMLButtonElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const prevBookmarkCount = useRef(bookmarks.length)
  const location = useLocation()
  const [desktopOpen, setDesktopOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY)
    return saved === null ? true : saved === '1'
  })

  // Scroll main content to top on route change
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  // Persist desktop sidebar preference
  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, desktopOpen ? '1' : '0')
  }, [desktopOpen])

  // Listen for tour requesting sidebar open
  useEffect(() => {
    const handler = () => setDesktopOpen(true)
    window.addEventListener('radiopedia:open-sidebar', handler)
    return () => window.removeEventListener('radiopedia:open-sidebar', handler)
  }, [])

  // Scroll to top when tour ends
  useEffect(() => {
    const handler = () => mainRef.current?.scrollTo(0, 0)
    window.addEventListener('radiopedia:scroll-top', handler)
    return () => window.removeEventListener('radiopedia:scroll-top', handler)
  }, [])

  // Show a floating notification when a bookmark is added while sidebar is closed
  // Uses direct DOM manipulation to avoid set-state-in-effect lint rule
  useEffect(() => {
    const count = bookmarks.length
    if (count > prevBookmarkCount.current && !desktopOpen) {
      // Pulse the button itself (capture ref for stable cleanup — exhaustive-deps)
      const cls = 'sidebar-pulse'
      const sidebarBtn = sidebarBtnRef.current
      sidebarBtn?.classList.add(cls)

      // Create a floating notification pill
      const pill = document.createElement('div')
      pill.className = 'bookmark-toast'
      pill.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5Z"/>
        </svg>
        <span>Bookmark saved</span>
      `
      document.body.appendChild(pill)

      const t = setTimeout(() => {
        sidebarBtn?.classList.remove(cls)
        pill.classList.add('bookmark-toast-out')
        setTimeout(() => pill.remove(), 400)
      }, 2500)

      prevBookmarkCount.current = count
      return () => {
        clearTimeout(t)
        sidebarBtn?.classList.remove(cls)
        pill.remove()
      }
    }
    prevBookmarkCount.current = count
  }, [bookmarks.length, desktopOpen])

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Auto-close when viewport crosses into desktop territory
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG}px)`)
    const onBreakpoint = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false)
    }
    mq.addEventListener('change', onBreakpoint)
    return () => mq.removeEventListener('change', onBreakpoint)
  }, [])

  // Lock body scroll while mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const closeSearch = useCallback(() => setSearchOpen(false), [])

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Shared header (always visible, spans full width) ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 h-[56px] border-b border-border bg-background/80 backdrop-blur-sm shrink-0 sticky top-0 z-30">
          {/* Hamburger — toggles sidebar, rotates when open */}
          <Button
            ref={sidebarBtnRef}
            variant="ghost"
            size="icon"
            aria-label={desktopOpen ? t('sidebar.closeSidebar') : t('sidebar.openSidebar')}
            onClick={() => {
              // On mobile, open the slide-in drawer; on desktop, toggle the panel
              if (window.innerWidth < LG) {
                setMobileOpen(o => !o)
              } else {
                setDesktopOpen(o => !o)
              }
            }}
            className="w-9 h-9 rounded-lg text-foreground/70 hover:text-foreground hover:bg-accent"
          >
            <Menu className={cn('w-5 h-5 transition-transform duration-300', desktopOpen && 'lg:rotate-90')} />
          </Button>

          {/* Logo + title (always visible, click navigates home) */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <LogoIcon size={32} />
            <div className="min-w-0 text-left">
              <div className="text-base font-bold text-foreground leading-tight">{t('site.title')}</div>
              <div className="text-xs text-muted-foreground leading-tight hidden sm:block">{t('site.subtitle')}</div>
            </div>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search trigger */}
          <div data-tour="search">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>

          {/* Language toggle */}
          <LanguageToggle />

          {/* Theme toggle */}
          <div data-tour="theme">
            <ThemeToggle />
          </div>

          {/* Tour button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={startTour}
            aria-label={t('guidedTour.takeATour')}
            title={t('guidedTour.guidedTour')}
            className="w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Compass className="w-4 h-4" />
          </Button>
        </header>

        {/* ── Body: sidebar + content ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Desktop sidebar (collapsible) ── */}
          <div
            data-tour="sidebar"
            className={cn(
              'hidden lg:flex shrink-0 overflow-hidden',
              'transition-[width] duration-300 ease-in-out',
              desktopOpen ? 'lg:w-80 xl:w-[22rem]' : 'w-0'
            )}
          >
            <div className={cn(
              'lg:w-80 xl:w-[22rem] h-full',
              'transition-opacity duration-200',
              desktopOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}>
              <Sidebar />
            </div>
          </div>

          {/* ── Mobile sidebar — CSS transform, no Radix portal ── */}
          {/* Backdrop */}
          <div
            aria-hidden="true"
            className={cn(
              'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden',
              'transition-opacity duration-300',
              mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            onClick={() => setMobileOpen(false)}
          />
          {/* Slide-in panel */}
          <div
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-80 overflow-hidden lg:hidden',
              'transition-transform duration-300 ease-in-out',
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <Sidebar onNavigation={() => setMobileOpen(false)} />
          </div>

          {/* Page content */}
          <main ref={mainRef} className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── Search dialog ── */}
      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </div>
  )
}
