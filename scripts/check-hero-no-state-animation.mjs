#!/usr/bin/env node
/**
 * check-hero-no-state-animation — fail when a chapter hero drives an
 * animation through React state (`useState` / `useReducer` alongside
 * `requestAnimationFrame` or `setInterval`).
 *
 * Why this exists: a hero mounts in `ChapterHeader`, OUTSIDE the chapter
 * body's `<Suspense>`, so it is live while the body is still loading. A
 * `setState` per animation frame is a default-priority update sixty times a
 * second, and React 19 gives the body's Suspense *retry* render a lane that
 * never expires — every frame restarted that render. Whenever the body could
 * not finish inside one frame gap (cold dev server, slower machine, headless
 * Chromium) the reader saw the spinner forever, with no error anywhere.
 * `Ch1_3Hero` shipped this way on 2026-04-19 and it was found 2026-09-17: on
 * a warm dev server the body squeezed through, `test:visual` cannot tell a
 * spinner from a chapter (zero overlaps either way), and jsdom has no frames.
 *
 * The rule: a hero may animate, but it writes to the DOM from the frame
 * callback (a ref + `setAttribute` / `style`, or a CSS animation) and never
 * re-renders per frame. Animations INSIDE the body are not covered — they
 * only start once the body has committed, so they cannot starve it.
 *
 * Exit code: 0 clean, 1 on findings.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const HERO_DIR = path.join(ROOT, 'src/components/chapter-heroes')

const TIMER_RE = /\b(requestAnimationFrame|setInterval)\s*\(/
const STATE_RE = /\b(useState|useReducer)\s*[<(]/

const findings = []
for (const name of fs.readdirSync(HERO_DIR)) {
  if (!/\.tsx$/.test(name) || /\.test\.tsx$/.test(name)) continue
  const src = fs.readFileSync(path.join(HERO_DIR, name), 'utf8')
  const timer = src.match(TIMER_RE)
  const state = src.match(STATE_RE)
  if (timer && state) findings.push({ name, timer: timer[1], state: state[1] })
}

if (findings.length === 0) {
  console.log('check-hero-no-state-animation OK: no chapter hero re-renders per animation frame.')
  process.exit(0)
}

console.error('check-hero-no-state-animation FAIL — a hero animates through React state:')
console.error('')
for (const f of findings) {
  console.error(`  src/components/chapter-heroes/${f.name}: ${f.timer}() together with ${f.state}()`)
}
console.error('')
console.error('A hero mounts outside the chapter body\'s <Suspense>; a state update per frame')
console.error('restarts the body\'s retry render and can leave the reader on the spinner forever.')
console.error('Write the frame to the DOM through a ref (setAttribute / style) or use a CSS')
console.error('animation — see the header comment in Ch1_3Hero.tsx.')
process.exit(1)
