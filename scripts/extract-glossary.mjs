// Throwaway helper: dump the glossary defaults from glossary.ts to JSON
// for use by the UA translation Gemini workflow. Not part of the build.
//
// Run via the npm script (which adds Node's TS-strip flag):
//   npm run extract:glossary
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const tsPath = path.resolve('src/features/glossary/glossary.ts')
const { glossary } = await import(pathToFileURL(tsPath).href)

fs.writeFileSync('/tmp/glossary-en.json', JSON.stringify(glossary, null, 2))
console.log('Wrote', Object.keys(glossary).length, 'entries to /tmp/glossary-en.json')
