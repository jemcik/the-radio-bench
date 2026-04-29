/**
 * i18n locale checks:
 *   1. Key parity — every flat key in en/ui.json exists in uk/ui.json.
 *   2. No HTML entities in string values — react-i18next renders &quot;,
 *      &amp;, &nbsp;, &lt;, &gt;, &apos;, &#NNN; verbatim in text nodes.
 *      Use real characters: curly quotes, real non-breaking space, etc.
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

if (failed) process.exit(1)

console.log(`i18n OK: ${enKeys.size} keys in en all present in uk; no HTML entities in either locale.`)
