/**
 * Ensures Ukrainian locale includes every key from English (flat key parity).
 * Exit 1 if any en key is missing in uk.
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

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en', 'ui.json'), 'utf8'))
const uk = JSON.parse(fs.readFileSync(path.join(localesDir, 'uk', 'ui.json'), 'utf8'))

const enKeys = new Set(flatKeys(en))
const ukKeys = new Set(flatKeys(uk))

const missingInUk = [...enKeys].filter(k => !ukKeys.has(k)).sort()

if (missingInUk.length > 0) {
  console.error('i18n check failed: these keys exist in en/ui.json but not in uk/ui.json:')
  for (const k of missingInUk) console.error(`  - ${k}`)
  process.exit(1)
}

console.log(`i18n OK: ${enKeys.size} keys in en are all present in uk.`)
