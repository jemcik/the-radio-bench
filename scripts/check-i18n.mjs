/**
 * i18n locale checks:
 *   1. Key parity — every flat key in en/ui.json exists in uk/ui.json.
 *   2. No HTML entities in string values — react-i18next renders &quot;,
 *      &amp;, &nbsp;, &lt;, &gt;, &apos;, &#NNN; verbatim in text nodes.
 *      Use real characters: curly quotes, real non-breaking space, etc.
 *   3. No «§» (section sign) — flagged by the user as out-of-style.
 *      Use «розділ X.Y» / «Chapter X.Y» / «previous section» instead.
 *      Source-code header comments are unaffected; this scans i18n only.
 *   4. Tag open/close parity — `<bsf>X</bpf>` (mismatched) silently
 *      passes the components-mapping check but causes the unclosed
 *      `<bsf>` to swallow following prose into the glossary tooltip
 *      at runtime. Caught visually in ch1_8.keyTakeaway4 (UA);
 *      mechanized here so it cannot recur.
 */
import fs from 'node:fs'
import process from 'node:process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales')

function flatKeys(obj, prefix = '') {
  const keys = []
  for (const [key, val] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${key}` : key
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      keys.push(...flatKeys(val, p))
    } else {
      keys.push(p)
    }
  }
  return keys
}

const HTML_ENTITY_RE = /&(?:quot|amp|nbsp|lt|gt|apos|#\d+);/

function findEntities(obj, prefix = '', out = []) {
  for (const [key, val] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${key}` : key
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      findEntities(val, p, out)
    } else if (typeof val === 'string') {
      const m = val.match(HTML_ENTITY_RE)
      if (m) {
        out.push({
          key: p,
          entity: m[0],
          snippet: val.slice(Math.max(0, m.index - 10), m.index + m[0].length + 10),
        })
      }
    }
  }
  return out
}

const TAG_RE = /<\/?([a-zA-Z][a-zA-Z0-9]*)>/g

function findTagMismatches(obj, prefix = '', out = []) {
  for (const [key, val] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${key}` : key
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      findTagMismatches(val, p, out)
    } else if (typeof val === 'string') {
      const stack = []
      let m
      TAG_RE.lastIndex = 0
      while ((m = TAG_RE.exec(val)) !== null) {
        const isClose = m[0][1] === '/'
        const tag = m[1]
        if (isClose) {
          if (stack.length === 0) {
            out.push({
              key: p,
              error: `stray closing </${tag}>`,
              snippet: val.slice(Math.max(0, m.index - 20), m.index + tag.length + 5),
            })
            continue
          }
          const top = stack.pop()
          if (top.tag !== tag) {
            out.push({
              key: p,
              error: `<${top.tag}> closed by </${tag}>`,
              snippet: val.slice(Math.max(0, top.index - 5), m.index + tag.length + 5),
            })
          }
        } else {
          stack.push({ tag, index: m.index })
        }
      }
      for (const open of stack) {
        out.push({
          key: p,
          error: `unclosed <${open.tag}>`,
          snippet: val.slice(Math.max(0, open.index - 5), open.index + 40),
        })
      }
    }
  }
  return out
}

const SECTION_SIGN_RE = /§/

function findSectionSigns(obj, prefix = '', out = []) {
  for (const [key, val] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${key}` : key
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      findSectionSigns(val, p, out)
    } else if (typeof val === 'string') {
      const m = val.match(SECTION_SIGN_RE)
      if (m) {
        out.push({
          key: p,
          snippet: val.slice(Math.max(0, m.index - 20), m.index + 20),
        })
      }
    }
  }
  return out
}

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en', 'ui.json'), 'utf8'))
const uk = JSON.parse(fs.readFileSync(path.join(localesDir, 'uk', 'ui.json'), 'utf8'))

let failed = false

const enKeys = new Set(flatKeys(en))
const ukKeys = new Set(flatKeys(uk))
const missingInUk = [...enKeys].filter(k => !ukKeys.has(k)).sort()

if (missingInUk.length > 0) {
  console.error('i18n parity failed: these keys exist in en/ui.json but not in uk/ui.json:')
  for (const k of missingInUk) console.error(`  - ${k}`)
  failed = true
}

const entityHits = [...findEntities(en, 'en'), ...findEntities(uk, 'uk')]
if (entityHits.length > 0) {
  console.error('i18n entity check failed: HTML entities render verbatim through react-i18next — use real characters instead:')
  for (const { key, entity, snippet } of entityHits) {
    console.error(`  - ${key}: ${entity}  …${snippet}…`)
  }
  failed = true
}

const sectionSignHits = [...findSectionSigns(en, 'en'), ...findSectionSigns(uk, 'uk')]
if (sectionSignHits.length > 0) {
  console.error('i18n section-sign check failed: «§» is not used in this course (user-flagged). Use «розділ X.Y» / «Chapter X.Y» / «previous section» instead:')
  for (const { key, snippet } of sectionSignHits) {
    console.error(`  - ${key}: …${snippet}…`)
  }
  failed = true
}

const tagMismatchHits = [...findTagMismatches(en, 'en'), ...findTagMismatches(uk, 'uk')]
if (tagMismatchHits.length > 0) {
  console.error('i18n tag-mismatch check failed: malformed open/close tags in i18n strings — react-i18next will silently consume following prose into the wrong glossary tooltip:')
  for (const { key, error, snippet } of tagMismatchHits) {
    console.error(`  - ${key}: ${error}  …${snippet}…`)
  }
  failed = true
}

if (failed) process.exit(1)

console.log(`i18n OK: ${enKeys.size} keys in en all present in uk; no HTML entities in either locale; no «§» in user-facing text; all <tag>…</tag> pairs balanced.`)
