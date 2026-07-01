#!/usr/bin/env node
/**
 * check-all — single entry point that runs EVERY gate.
 *
 * Auto-discovers `scripts/check-*.mjs` (so adding a gate = dropping a file;
 * nothing to wire into a hand-maintained `&&` chain — that chain is exactly
 * how gates like `knip` / `check:circuit-maxwidth` used to get forgotten),
 * plus two non-`scripts/` gates: the UA linter and the gitignore check.
 *
 * Runs them in PARALLEL (a bounded pool), collects EVERY failure instead of
 * stopping at the first, and prints one grouped pass/fail summary. Gates are
 * read-only and independent, so parallelism is safe.
 *
 * Usage:
 *   node scripts/check-all.mjs            # run all gates
 *   node scripts/check-all.mjs glossary   # run only gates whose name matches
 *
 * Exit code: 0 if all pass, 1 if any fail.
 */
import { readdirSync } from 'node:fs'
import { spawn } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SELF = path.basename(fileURLToPath(import.meta.url))

// ── Gate registry ──────────────────────────────────────────────────────────
// Auto-discovered: every scripts/check-*.mjs except this runner.
const discovered = readdirSync(__dirname)
  .filter(f => /^check-.*\.mjs$/.test(f) && f !== SELF)
  .sort()
  .map(f => ({
    name: f.replace(/^check-/, '').replace(/\.mjs$/, ''),
    cmd: process.execPath,
    args: [path.join('scripts', f)],
  }))

// The two gates that don't live in scripts/ as check-*.mjs:
const extra = [
  {
    name: 'uk (UA linter)',
    cmd: process.execPath,
    args: ['.claude/skills/ua-translate/scripts/lint-ua-translation.mjs', 'src/i18n/locales/uk/ui.json'],
  },
  {
    name: 'gitignore',
    cmd: 'sh',
    args: ['-c',
      '! git ls-files | git check-ignore --no-index --stdin -q || ' +
      '(echo "Tracked paths match .gitignore (remove with git rm --cached):"; ' +
      'git ls-files | git check-ignore --no-index --stdin -v; exit 1)'],
  },
]

const filter = process.argv[2]?.toLowerCase()
let gates = [...discovered, ...extra]
if (filter) gates = gates.filter(g => g.name.toLowerCase().includes(filter))

if (gates.length === 0) {
  console.error(filter ? `No gates match "${filter}".` : 'No gates found.')
  process.exit(1)
}

// ── Bounded parallel runner ────────────────────────────────────────────────
const CONCURRENCY = Math.max(1, Math.min(
  (os.availableParallelism?.() ?? os.cpus().length) - 1,
  8,
))

function runGate(gate) {
  return new Promise(resolve => {
    const child = spawn(gate.cmd, gate.args, { cwd: ROOT })
    let out = ''
    child.stdout.on('data', d => { out += d })
    child.stderr.on('data', d => { out += d })
    child.on('close', code => {
      process.stdout.write(code === 0 ? `  \x1b[32m✓\x1b[0m ${gate.name}\n` : `  \x1b[31m✗\x1b[0m ${gate.name}\n`)
      resolve({ gate, code, out: out.trimEnd() })
    })
    child.on('error', err => resolve({ gate, code: 1, out: String(err) }))
  })
}

async function main() {
  const started = Date.now()
  console.log(`Running ${gates.length} gate(s), up to ${CONCURRENCY} in parallel…\n`)

  const results = []
  let i = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, gates.length) }, async () => {
    while (i < gates.length) {
      const gate = gates[i++]
      results.push(await runGate(gate))
    }
  })
  await Promise.all(workers)

  const failed = results.filter(r => r.code !== 0)
  const secs = ((Date.now() - started) / 1000).toFixed(1)

  if (failed.length) {
    console.log('\n' + '─'.repeat(60))
    for (const r of failed) {
      console.log(`\n\x1b[31m✗ ${r.gate.name}\x1b[0m`)
      if (r.out) console.log(r.out.split('\n').map(l => '    ' + l).join('\n'))
    }
    console.log('\n' + '─'.repeat(60))
    console.error(`\n\x1b[31m${failed.length}/${gates.length} gate(s) FAILED\x1b[0m in ${secs}s: ${failed.map(r => r.gate.name).join(', ')}`)
    process.exit(1)
  }

  console.log(`\n\x1b[32mAll ${gates.length} gates passed\x1b[0m in ${secs}s.`)
}

main()
