import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for the real-browser diagram-geometry gate
 * (`e2e/diagram-geometry.spec.ts`).
 *
 * The jsdom `diagram-text-overlap` test has no layout engine, so it can't
 * catch a label whose rendered box descends onto a symbol, nor text inflated
 * by an un-capped `<Circuit>` scaling to fill the column. This suite opens the
 * app in a real Chromium and measures `getBoundingClientRect`.
 *
 * Runs on a dedicated port (4173) so it never collides with a dev server the
 * author already has on :5173. Locally it reuses an existing 4173 server if
 * present; in CI it starts its own.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'line',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:4173',
    // Fixed viewport → the chapter column width (and therefore diagram scale)
    // is reproducible, so overlap counts are stable across runs.
    viewport: { width: 1280, height: 900 },
    // Freeze time-based diagrams (needles, travelling waves) to their static
    // snapshot so text-vs-shape geometry is deterministic.
    reducedMotion: 'reduce',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
