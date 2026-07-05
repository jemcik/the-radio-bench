/**
 * Real-browser diagram-geometry gate.
 *
 * WHY THIS EXISTS (ch3.4, July 2026): a `<Circuit>` shipped without `maxWidth`
 * scaled ~2× to fill the column, so its `TerminalLabel`s rendered huge and
 * descended onto the meter symbols. The jsdom `diagram-text-overlap` test
 * missed it — jsdom has no layout engine, so it can't measure real text boxes
 * or scaling. This suite opens every published chapter in real Chromium and
 * measures `getBoundingClientRect`, the ground truth the author (twice) failed
 * to catch by eye.
 *
 * WHAT IT CHECKS, per chapter × locale, for every `<svg>`:
 *   • text ∩ text                     (labels colliding)
 *   • text ∩ meter/component circle    (label sitting on a symbol body) —
 *     excluding the symbol's OWN short centred letter (V / A / G / µA / S…)
 *   • text ∩ compact symbol path       (resistor zig-zag, diode triangle…)
 *   • text spilling outside the svg    (clipped label)
 * An "overlap" needs ≥ 3 px penetration in BOTH axes, which clears the
 * sub-pixel / cross-font jitter that would otherwise make counts flaky.
 *
 * BASELINE, not zero-tolerance. Several older chapters carry a few pre-existing
 * grazes / intentional design overlaps; those are grandfathered in
 * `diagram-geometry.baseline.json`. The gate FAILS only when a chapter's count
 * EXCEEDS its baseline — i.e. new or edited diagram work introduced an overlap.
 * A brand-new chapter has no baseline entry (treated as 0), so it must ship
 * clean. Regenerate after an intentional, browser-verified change:
 *   UPDATE_BASELINE=1 npm run test:visual
 *
 * IMPORTANT: font metrics differ between macOS/local and CI's Linux Chromium,
 * so a locally-captured baseline flips borderline overlaps and reddens CI.
 * Capture the baseline in CI's environment: run the `Re-baseline visual gate`
 * workflow (.github/workflows/rebaseline-visual.yml) and commit its artifact.
 */
import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllChapters } from '../src/data/chapters'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASELINE_PATH = path.join(__dirname, 'diagram-geometry.baseline.json')
const UPDATE = process.env.UPDATE_BASELINE === '1'

const baseline: Record<string, number> = fs.existsSync(BASELINE_PATH)
  ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
  : {}
const collected: Record<string, number> = {}

const chapters = getAllChapters().filter(c => c.status === 'published')
const LOCALES = ['uk', 'en'] as const

/**
 * Runs in the page. Returns { count, details } for every svg with a viewBox
 * wider than 120 px (skips tiny inline icons). Pure geometry from client rects.
 */
function pageDetector(minPen: number) {
  const overlap = (a: DOMRect, b: DOMRect) =>
    Math.min(a.right, b.right) - Math.max(a.left, b.left) >= minPen &&
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) >= minPen
  const centreIn = (t: DOMRect, c: DOMRect) => {
    const x = (t.left + t.right) / 2, y = (t.top + t.bottom) / 2
    return x > c.left + 1 && x < c.right - 1 && y > c.top + 1 && y < c.bottom - 1
  }
  const details: string[] = []
  const svgs = [...document.querySelectorAll('svg')].filter(
    s => s.viewBox && s.viewBox.baseVal && s.viewBox.baseVal.width > 120,
  )
  for (const s of svgs) {
    const sr = s.getBoundingClientRect()
    const T = [...s.querySelectorAll('text')]
      .map(t => ({ r: t.getBoundingClientRect(), x: (t.textContent || '').trim(), el: t }))
      .filter(o => o.r.width > 0)
    const C = [...s.querySelectorAll('circle')].map(c => c.getBoundingClientRect()).filter(r => r.width >= 16)
    const P = [...s.querySelectorAll('path')]
      .map(p => p.getBoundingClientRect())
      .filter(r => r.width > 8 && r.height > 8 && r.width < 90 && r.height < 90)
    for (let i = 0; i < T.length; i++) {
      for (let j = i + 1; j < T.length; j++) {
        if (T[i].el.parentElement === T[j].el.parentElement) continue
        if (overlap(T[i].r, T[j].r)) details.push(`T×T "${T[i].x}" ∩ "${T[j].x}"`)
      }
    }
    for (const t of T) {
      for (const c of C) {
        if (!overlap(t.r, c)) continue
        // The symbol's OWN designator (V / A / G / µA / S) is centred in the
        // circle and fits inside it (narrower than the diameter). A descriptive
        // label sitting on the symbol is wider than the circle → still counts.
        if (centreIn(t.r, c) && t.r.width < c.width) continue
        details.push(`T×CIRCLE "${t.x}"`)
      }
      for (const p of P) {
        if (t.r.width <= 26) continue // skip tiny glyphs / subscripts
        if (overlap(t.r, p) && !centreIn(t.r, p)) details.push(`T×PATH "${t.x}"`)
      }
      if (t.r.left < sr.left - 6 || t.r.right > sr.right + 6 || t.r.top < sr.top - 6 || t.r.bottom > sr.bottom + 6)
        details.push(`SPILL "${t.x}"`)
    }
  }
  return { count: details.length, details }
}

for (const chapter of chapters) {
  for (const locale of LOCALES) {
    const key = `${chapter.id}:${locale}`
    test(`diagram geometry — ${key}`, async ({ page }) => {
      await page.addInitScript(lng => localStorage.setItem('trb-lang', lng), locale)
      await page.goto(`/#/chapter/${chapter.id}`)
      // Let lazy chapter chunk + fonts + rough.js settle so boxes are final.
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(300)

      const { count, details } = await page.evaluate(pageDetector, 3)
      collected[key] = count

      if (UPDATE) return
      const allowed = baseline[key] ?? 0
      expect(
        count,
        `${key}: ${count} geometry overlap(s), baseline ${allowed}.\n` +
          details.map(d => '  • ' + d).join('\n') +
          `\n\nIf these are new, fix the diagram. If an intentional/pre-existing design, ` +
          `re-baseline with: UPDATE_BASELINE=1 npm run test:visual`,
      ).toBeLessThanOrEqual(allowed)
    })
  }
}

test.afterAll(async () => {
  if (!UPDATE) return
  const sorted = Object.fromEntries(Object.entries(collected).sort(([a], [b]) => a.localeCompare(b)))
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`\nWrote baseline: ${Object.keys(sorted).length} (chapter×locale) entries → ${BASELINE_PATH}`)
})
