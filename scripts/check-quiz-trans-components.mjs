/**
 * Quiz <Trans>-tag coverage check.
 *
 * `Quiz` renders questions through `<Trans>` constructed dynamically by
 * `buildQuizFromI18n(t, 'chN_M', count, components)`. The static
 * `check:trans` gate cannot see those Trans blocks because they are
 * built at runtime, so a quiz string that uses `<pa>` / `<adc>` / etc.
 * without the matching component in `components` silently renders as
 * escaped text «&lt;pa&gt;…&lt;/pa&gt;» in the browser.
 *
 * This check parses `buildQuizFromI18n(...)` call sites in chapter
 * source files, extracts the components-map keys, compares against
 * tags actually used in the i18n quiz strings, and fails if any tag
 * is missing.
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { globSync } from 'node:fs'

const localeFile = 'src/i18n/locales/uk/ui.json'
const data = JSON.parse(fs.readFileSync(localeFile, 'utf8'))

// react-i18next renders these without a components mapping.
// (basic-html nodes: br, strong, i, p — plus em/span we always allow.)
const SAFE_TAGS = new Set(['br', 'strong', 'i', 'p', 'em', 'span'])

// Tags Quiz.tsx provides by default in its <Trans> components map
// (`{ var: <MathVar />, ...components }`), so chapter callers don't
// have to repeat them. Keep in sync with Quiz.tsx `render()`.
const QUIZ_PROVIDED = new Set(['var'])

/**
 * Find `buildQuizFromI18n(...)` calls in source and extract:
 *   - prefix string (e.g. 'ch1_8')
 *   - the components-object keys
 *
 * Uses a manual brace counter to handle nested JSX `{{ ... }}` like
 * `<span style={{ whiteSpace: 'nowrap' }} />`.
 */
function extractCalls(src) {
  const calls = []
  const re = /buildQuizFromI18n\s*\(/g
  let m
  while ((m = re.exec(src)) !== null) {
    const start = m.index + m[0].length
    // Walk to find the matching closing paren
    let depth = 1
    let i = start
    while (i < src.length && depth > 0) {
      const c = src[i]
      if (c === '(') depth++
      else if (c === ')') depth--
      if (depth > 0) i++
    }
    const args = src.slice(start, i)
    // 4 args: t, prefix, count, components
    const prefixMatch = args.match(/['"]([a-z0-9_]+)['"]/i)
    const prefix = prefixMatch ? prefixMatch[1] : null
    if (!prefix) continue
    // Components is the LAST argument. Find its enclosing `{...}` by
    // walking BACK from the last `}` and matching brace depth — this
    // is robust to JSX `style={{ ... }}` props inside the body, where
    // a forward `lastIndexOf('{')` would lock onto the inner brace.
    const compsEnd = args.lastIndexOf('}')
    if (compsEnd < 0) continue
    let cd = 1
    let bj = compsEnd - 1
    while (bj >= 0 && cd > 0) {
      if (args[bj] === '}') cd++
      else if (args[bj] === '{') cd--
      if (cd > 0) bj--
    }
    if (cd !== 0) continue
    const compsStart = bj  // index of the components-map opening `{`
    let compsBody = args.slice(compsStart + 1, compsEnd)
    // Strip JS comments — `// ...` and `/* ... */` — so commas /
    // angle-brackets / braces inside comments don't confuse the
    // top-level-key splitter below.
    compsBody = compsBody
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '')
    // Top-level keys: split by commas at depth 0
    const keys = []
    let buf = ''
    let d = 0
    for (const ch of compsBody) {
      if (ch === '{' || ch === '(' || ch === '[' || ch === '<') d++
      else if (ch === '}' || ch === ')' || ch === ']' || ch === '>') d--
      if (ch === ',' && d === 0) {
        const km = buf.match(/^\s*([a-zA-Z_$][\w$]*)\s*:/)
        if (km) keys.push(km[1])
        buf = ''
      } else {
        buf += ch
      }
    }
    if (buf.trim()) {
      const km = buf.match(/^\s*([a-zA-Z_$][\w$]*)\s*:/)
      if (km) keys.push(km[1])
    }
    calls.push({ prefix, keys: new Set(keys) })
  }
  return calls
}

function tagsInQuiz(chBlock) {
  const tags = new Set()
  for (const [k, v] of Object.entries(chBlock)) {
    if (!k.startsWith('quiz_q')) continue
    if (typeof v !== 'string') continue
    for (const m of v.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)\s*\/?>/g)) {
      tags.add(m[1])
    }
  }
  return tags
}

const chapterFiles = globSync('src/chapters/**/Chapter*.tsx')
let failed = false

for (const file of chapterFiles) {
  const src = fs.readFileSync(file, 'utf8')
  const calls = extractCalls(src)
  for (const { prefix, keys } of calls) {
    const ch = data[prefix]
    if (!ch) continue
    const used = tagsInQuiz(ch)
    const missing = [...used].filter(t => !keys.has(t) && !SAFE_TAGS.has(t) && !QUIZ_PROVIDED.has(t))
    if (missing.length > 0) {
      console.error(`${path.relative('.', file)}: buildQuizFromI18n('${prefix}', ...) is missing components for tags: ${missing.join(', ')}`)
      console.error(`  → at runtime react-i18next renders these as escaped text «&lt;${missing[0]}&gt;…&lt;/${missing[0]}&gt;» instead of the intended tooltip.`)
      failed = true
    }
  }
}

if (failed) process.exit(1)
console.log('quiz-trans coverage OK: every <tag> used in quiz i18n strings has a matching components-map entry.')
