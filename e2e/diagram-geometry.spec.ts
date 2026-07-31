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
 *   • text ∩ line/polyline/polygon    (a rule or arrow drawn through a label) —
 *     the ch0.3 prefix-ladder case: ÷1000 arrows ran through the «p (п)» ticks
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
    // ── STROKES: line / polyline / polygon ─────────────────────────────────
    // The blind spot that shipped ch0.3's prefix ladder with its ÷1000 arrows
    // drawn straight through the «p (п)» symbols: the checks above compare text
    // to text, to circles and to paths — an arrow is a <line> plus a <polyline>,
    // so nothing ever looked at it. It went green for as long as each symbol was
    // one narrow glyph and broke the moment they became two.
    //
    // Axis lines, rails and baselines legitimately run right next to labels, so
    // grazing an edge is not a defect. What IS a defect is a stroke crossing the
    // glyph band itself. So a hit needs the stroke to fall inside the MIDDLE HALF
    // of the text box on the axis it crosses, plus real penetration along the
    // other axis. «p (п)» with an arrow at 35 % of its height is a hit; «10 kHz»
    // resting on the axis it labels is not.
    const S_ = [...s.querySelectorAll('line, polyline, polygon')]
      .map(e => e.getBoundingClientRect())
      .filter(r => r.width > 4 || r.height > 4)
    // A stroke through a label is a defect only when the label is NOT sitting on
    // it deliberately. The discriminator is the text's own centre point:
    //   • tick label centred on its grid line → centre lies ON the stroke → fine
    //   • arrow clipping a symbol from one side → centre lies OFF it → defect
    // Plus the stroke has to reach the middle half of the glyph band; grazing an
    // edge (a label resting just above its axis) never counts.
    const crossesCore = (t: DOMRect, k: DOMRect) => {
      const inMiddle = (lo: number, hi: number, a: number, b: number) => {
        const q = (hi - lo) / 4
        return b > lo + q && a < hi - q
      }
      const horizontal = k.height <= k.width
      const reaches = horizontal
        ? inMiddle(t.top, t.bottom, k.top, k.bottom) &&
          Math.min(t.right, k.right) - Math.max(t.left, k.left) >= minPen
        : inMiddle(t.left, t.right, k.left, k.right) &&
          Math.min(t.bottom, k.bottom) - Math.max(t.top, k.top) >= minPen
      if (!reaches) return false
      const cx = (t.left + t.right) / 2, cy = (t.top + t.bottom) / 2
      const onStroke =
        cx >= k.left - 2 && cx <= k.right + 2 && cy >= k.top - 2 && cy <= k.bottom + 2
      return !onStroke
    }
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
      for (const k of S_) {
        if (crossesCore(t.r, k)) details.push(`T×STROKE "${t.x}"`)
      }
      if (t.r.left < sr.left - 6 || t.r.right > sr.right + 6 || t.r.top < sr.top - 6 || t.r.bottom > sr.bottom + 6)
        details.push(`SPILL "${t.x}"`)
    }
    // ── GRAPHICAL frame-spill — HEROES ONLY ────────────────────────────────
    // The text block above only checks whether TEXT pokes past the frame. A
    // chapter hero is a pure illustration with zero <text>, so it was invisible
    // to this gate: that is exactly how ch4.3's hero shipped with its lightning
    // cloud sliced by the top edge (getBoundingClientRect top −1.4, every gate
    // green). A hero is a self-contained illustration that MUST fit its frame
    // entirely, so here we check every graphical element against it.
    //
    // Scoped to heroes (svg inside the ChapterHero `[data-hero]` wrapper) on
    // purpose: in-chapter diagrams legitimately bleed past the viewBox —
    // dipole/antenna radiation arcs (ch2.1, ch2.2) sweep out of frame as an
    // intentional "waves propagating outward" fade, clipped by the svg
    // viewport. Running this everywhere flagged all of them. A hero never does
    // that. Tolerance 2px: a path bbox is real ink + half its stroke, so a
    // glyph genuinely sliced by the frame clips by more; sub-2px is jitter.
    const isHero = !!s.closest('[data-hero]')
    if (isHero) {
      // Skip clipPath'd elements: a clip-path is explicit authorial intent, and
      // getBoundingClientRect reports UN-clipped geometry — e.g. ch4.2's hero
      // draws the TV's herringbone (RFI) pattern with a bbox 3px past the frame,
      // but it is clipped to the TV screen and renders perfectly.
      const clipped = (el: Element): boolean => {
        let n: Element | null = el
        while (n && n !== s) {
          const a = n.getAttribute('clip-path')
          const st = (n as SVGElement).style?.clipPath
          if ((a && a !== 'none') || (st && st !== 'none')) return true
          n = n.parentElement
        }
        return false
      }
      const GFX = [...s.querySelectorAll('path, circle, rect, line, polygon, polyline')]
        .filter(el => !clipped(el))
        .map(el => ({ r: el.getBoundingClientRect(), tag: el.tagName }))
        .filter(o => o.r.width > 6 && o.r.height > 6)
      for (const g of GFX) {
        const over: string[] = []
        if (g.r.top < sr.top - 2) over.push('top')
        if (g.r.bottom > sr.bottom + 2) over.push('bottom')
        if (g.r.left < sr.left - 2) over.push('left')
        if (g.r.right > sr.right + 2) over.push('right')
        if (over.length) details.push(`HERO-SPILL <${g.tag}> ${over.join(',')}`)
      }
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
