#!/usr/bin/env node
/**
 * check-animation-loop — every per-frame animation goes through
 * `useAnimationLoop`, and a chapter hero never animates through React state.
 *
 * WHY THIS EXISTS
 *
 * Two findings on 2026-09-17, one after the other:
 *
 *  1. `Ch1_3Hero` drove its scrolling sine with a `setState` per
 *     `requestAnimationFrame`. A hero mounts in `ChapterHeader`, OUTSIDE the
 *     chapter body's <Suspense>, so it is live while the body loads; React 19
 *     gives the body's retry render a lane that never expires, and sixty
 *     default-priority updates a second restarted that render forever whenever
 *     the body could not finish inside one frame gap (cold dev server, slower
 *     machine, headless Chromium). The reader saw the spinner, no error
 *     anywhere. Shipped 2026-04-19; a warm dev server hid it, `test:visual`
 *     counts overlaps and a spinner has none, jsdom has no frames.
 *
 *  2. The audit that followed found 21 hand-rolled frame loops. Every one ran
 *     from mount to unmount whatever was on screen: an idle chapter 1.3 tab
 *     kept the main thread ~73 % busy with three diagrams scrolled out of view,
 *     chapter 1.1 ~47 %, against ~6 % for a chapter with no animation. Three of
 *     the 21 honoured `prefers-reduced-motion`; the rest did not.
 *
 * `src/lib/hooks/useAnimationLoop.ts` fixes the second class for every caller
 * (runs only on screen, pauses in a hidden tab, never under reduced motion)
 * and cannot fix the first, so this gate holds both rules:
 *
 *  A. No raw `requestAnimationFrame(` / `setInterval(` in app code. The loop
 *     belongs in the hook. Two one-off uses are allow-listed below with their
 *     reason; a new one needs a reason here, not a silent exemption.
 *  B. A chapter hero that calls `useAnimationLoop` holds no `useState` /
 *     `useReducer` — its frame is written through a ref (`setAttribute`,
 *     `style`) so the hero never re-renders while the body is loading.
 *
 * Exit code: 0 clean, 1 on findings.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SCAN_DIRS = ['src/components', 'src/chapters', 'src/features', 'src/context', 'src/lib']
const HOOK_FILE = 'src/lib/hooks/useAnimationLoop.ts'
const HERO_DIR = 'src/components/chapter-heroes'

/** Raw timer calls that are not animation loops, each with its reason. */
const ALLOWED_ONE_OFF = new Map([
  ['src/features/search/SearchDialog.tsx', 'one requestAnimationFrame to focus the input after the dialog paints — not a loop'],
  ['src/components/tour/GuidedTour.tsx', 'a 200 ms poll for the language-banner choice that sets state once — no render per tick'],
])

const RAW_TIMER_RE = /\b(requestAnimationFrame|setInterval)\s*\(/
const STATE_RE = /\b(useState|useReducer)\s*[<(]/

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, out)
    else if (ent.isFile() && /\.tsx?$/.test(ent.name) && !/\.test\.tsx?$/.test(ent.name)) out.push(p)
  }
  return out
}

/** Drop block comments and comment-only lines so prose about rAF does not count. */
function code(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(line => {
      const t = line.trim()
      return !(t.startsWith('//') || t.startsWith('*'))
    })
    .join('\n')
}

const findings = []
for (const dir of SCAN_DIRS) {
  for (const abs of walk(path.join(ROOT, dir))) {
    const rel = path.relative(ROOT, abs)
    if (rel === HOOK_FILE || rel.startsWith('src/test/')) continue
    const src = code(fs.readFileSync(abs, 'utf8'))
    const timer = src.match(RAW_TIMER_RE)
    if (timer && !ALLOWED_ONE_OFF.has(rel)) {
      findings.push(`${rel}: raw ${timer[1]}() — run the frame through useAnimationLoop (src/lib/hooks/useAnimationLoop.ts)`)
    }
    if (rel.startsWith(HERO_DIR) && /\buseAnimationLoop\s*\(/.test(src) && STATE_RE.test(src)) {
      findings.push(`${rel}: a chapter hero animates AND holds React state — write the frame through a ref; a hero mounts outside the chapter <Suspense> and a re-render per frame starves the body's load`)
    }
  }
}

if (findings.length === 0) {
  console.log(
    `check-animation-loop OK: every frame loop goes through useAnimationLoop; ${ALLOWED_ONE_OFF.size} one-off timer(s) allow-listed with a reason.`,
  )
  process.exit(0)
}

console.error('check-animation-loop FAIL:')
console.error('')
for (const f of findings) console.error(`  ${f}`)
console.error('')
console.error('useAnimationLoop runs a loop only while its element is on screen, pauses in a')
console.error('hidden tab and never starts under prefers-reduced-motion. A hand-rolled loop does')
console.error('none of that. If the call really is a one-off (a focus after paint), add the')
console.error('file to ALLOWED_ONE_OFF in scripts/check-animation-loop.mjs with its reason.')
process.exit(1)
