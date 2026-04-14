import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount any React tree mounted by RTL between tests.
afterEach(() => {
  cleanup()
})

// jsdom does not implement matchMedia. Provide a minimal stub so code that
// reads media queries (Layout breakpoint listener, color-scheme detection,
// etc.) does not throw during tests.
beforeEach(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // legacy
        removeListener: vi.fn(), // legacy
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }

  // Reset localStorage between tests so persisted state does not leak across them.
  window.localStorage.clear()
})
