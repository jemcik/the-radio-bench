import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Menu, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import LogoIcon from '@/components/LogoIcon'
import Sidebar from './Sidebar'
import ThemeToggle from './ThemeToggle'
import SearchDialog, { SearchTrigger } from './SearchDialog'

// Tailwind's lg breakpoint
const LG = 1024

const SIDEBAR_KEY = 'radiopedia-sidebar-open'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY)
    return saved === null ? true : saved === '1'
  })

  // Persist desktop sidebar preference
  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, desktopOpen ? '1' : '0')
  }, [desktopOpen])

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

      {/* ── Desktop sidebar (collapsible) ── */}
      <div
        className={cn(
          'hidden lg:flex shrink-0 h-full overflow-hidden',
          'transition-[width] duration-300 ease-in-out',
          desktopOpen ? 'lg:w-80 xl:w-[22rem]' : 'w-0'
        )}
      >
        <div className={cn(
          'lg:w-80 xl:w-[22rem] h-full',
          'transition-opacity duration-200',
          desktopOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <Sidebar onClose={() => setDesktopOpen(false)} />
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

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Content toolbar (always visible) ── */}
        <header className="flex items-center gap-3 px-4 py-2 border-b border-border bg-background/80 backdrop-blur-sm shrink-0 sticky top-0 z-30">
          {/* Left: mobile menu or desktop sidebar toggle */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {!desktopOpen && (
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open sidebar"
                onClick={() => setDesktopOpen(true)}
                className="w-8 h-8"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </Button>
              <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <LogoIcon size={26} />
                <span className="text-[15px] font-semibold text-foreground">The Radio Bench</span>
              </NavLink>
            </div>
          )}

          {/* Mobile logo (always show on mobile) */}
          <NavLink to="/" className="lg:hidden flex items-center gap-2 hover:opacity-80 transition-opacity">
            <LogoIcon size={26} />
            <span className="text-[15px] font-semibold text-foreground">The Radio Bench</span>
          </NavLink>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search trigger */}
          <SearchTrigger onClick={() => setSearchOpen(true)} />

          {/* Theme toggle */}
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Search dialog ── */}
      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </div>
  )
}
