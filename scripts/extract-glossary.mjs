// Throwaway helper: dump the glossary defaults from glossary.ts to JSON
// for use by the UA translation Gemini workflow. Not part of the build.
import jiti from 'jiti'
import fs from 'node:fs'
import path from 'node:path'

const requireWithTS = jiti(import.meta.url)
const { glossary } = requireWithTS(path.resolve('src/features/glossary/glossary.ts'))

fs.writeFileSync('/tmp/glossary-en.json', JSON.stringify(glossary, null, 2))
console.log('Wrote', Object.keys(glossary).length, 'entries to /tmp/glossary-en.json')
