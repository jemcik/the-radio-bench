#!/usr/bin/env node
/**
 * Advisory scan for hardcoded unit symbols in widget source files.
 *
 * Reports every string literal under src/components/ (excluding tests)
 * that contains a number followed by a recognised unit suffix. The
 * canonical fix is to use t('units.<key>') from the i18n `units`
 * namespace so Ukrainian readers get «кГц» / «дБ» instead of «kHz» / «dB».
 *
 * Exits 0 with a report — this is advisory, not a CI gate. Lots of
 * legitimate occurrences (test fixtures, demo data, pre-locale prose)
 * will surface and need human judgement, so we never fail the build.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcRoot = path.join(__dirname, '..', 'src')
const componentsRoot = path.join(srcRoot, 'components')

const UNIT_RE = /(["'`])([^"'`\n]*?\b\d+(?:\.\d+)?\s*(?:Hz|kHz|MHz|GHz|dB|dBm|mW|µW|nW|pW|fW|kW|W|kΩ|MΩ|µF|nF|pF|µH|mH|nH|mA|µA|mV|µV)\b[^"'`\n]*?)\1/g

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else if (/\.(tsx|ts)$/.test(entry.name) && !/\.test\.(tsx|ts)$/.test(entry.name)) {
      out.push(p)
    }
  }
  return out
}

const files = walk(componentsRoot)
const hits = []

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import ')) return
    if (/\bunits\.\w+/.test(line)) return
    UNIT_RE.lastIndex = 0
    let m
    while ((m = UNIT_RE.exec(line)) !== null) {
      hits.push({ file: path.relative(srcRoot, file), line: i + 1, snippet: m[0] })
    }
  })
}

if (hits.length === 0) {
  console.log('check:hardcoded-units OK — no inline unit literals found in src/components/')
  process.exit(0)
}

console.log(`Found ${hits.length} potential inline unit literal${hits.length === 1 ? '' : 's'} in src/components/:`)
console.log('(advisory — review and migrate to t(\'units.<key>\') where appropriate)\n')
for (const { file, line, snippet } of hits) {
  console.log(`  ${file}:${line}  ${snippet}`)
}
