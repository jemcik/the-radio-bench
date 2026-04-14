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
import SearchDialog, { SearchTrigger } from '@/features/search/SearchDialog'
import { useTour } from '@/components/tour/GuidedTour'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { codec, usePersistedState } from '@/lib/hooks/usePersistedState'
import { useEventListener } from '@/lib/hooks/useEventListener'
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut'
import { useBreakpoint } from '@/lib/hooks/useMediaQuery'
import { useTransientFlag } from '@/lib/hooks/useTransientFlag'
import { useToast } from '@/components/ui/toast'

export default function Layout() {
  const { t } = useTranslation('ui')
  const navigate = useNavigate()
  const { startTour } = useTour()
  const toast = useToast()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  // Bumped each time a bookmark-added event fires; drives the pulse animation.
  const [bookmarkAddedTick, setBookmarkAddedTick] = useState(0)
  const sidebarBtnRef = useRef<HTMLButtonElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const location = useLocation()
  const isDesktop = useBreakpoint('lg')
  const [desktopOpen, setDesktopOpen] = usePersistedState(
    STORAGE_KEYS.sidebarOpen,
    true,
    codec.boolean,
  )
  // Pulse the sidebar button briefly after a bookmark is added.
  const pulseSidebarBtn = useTransientFlag(bookmarkAddedTick, 2400)

  // Scroll main content to top on route change
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  // Tour can request the sidebar open / scroll content to top
  useEventListener('radiopedia:open-sidebar', () => setDesktopOpen(true))
  useEventListener('radiopedia:scroll-top', () => mainRef.current?.scrollTo(0, 0))

  // When a bookmark is added while the sidebar is closed, show a toast and
  // pulse the sidebar button so the user knows where it landed.
  useEventListener('radiopedia:bookmark-added', () => {
    if (desktopOpen) return
    toast.show(t('bookmark.bookmarkSaved'))
    setBookmarkAddedTick(n => n + 1)
  })

  // Global Cmd/Ctrl+K toggles the search dialog.
  useKeyboardShortcut('k', () => setSearchOpen(prev => !prev), { mod: true })

  // Auto-close the mobile drawer the moment the viewport crosses into
  // desktop. Render-time guard (rather than useEffect) avoids the cascading
  // render that the set-state-in-effect lint rule flags.
  if (isDesktop && mobileOpen) {
    setMobileOpen(false)
  }

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
              if (!isDesktop) {
                setMobileOpen(o => !o)
              } else {
                setDesktopOpen(o => !o)
              }
            }}
            className={cn(
              'w-9 h-9 rounded-lg text-foreground/70 hover:text-foreground hover:bg-accent',
              pulseSidebarBtn && 'sidebar-pulse',
            )}
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
