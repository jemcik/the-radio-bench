#!/usr/bin/env node
/**
 * lint-ua-translation.mjs
 *
 * Mechanical linter for Ukrainian translation quality. Run after the
 * parallel-critique stage of the `ua-translate` skill to catch known
 * bad patterns (English leftovers, calques, wrong punctuation, etc.)
 * before the user ever sees the draft.
 *
 * Usage:
 *   node .claude/skills/ua-translate/scripts/lint-ua-translation.mjs <file> [block-prefix]
 *
 *   <file>         path to the UK JSON block (either /tmp/ch1_1-uk.json
 *                  containing just the inner content, or a full
 *                  src/i18n/locales/uk/ui.json — the script handles both)
 *   [block-prefix] optional namespace to scope the lint (e.g. "ch1_1").
 *                  When omitted, lints every string in the file.
 *
 * Exit codes:
 *   0 — no issues found
 *   1 — one or more lint violations (printed to stderr)
 *   2 — usage or parse error
 *
 * Note on regexes: JavaScript's `\b` word boundary is ASCII-only by
 * default, so Cyrillic "word boundary" is emulated by
 *   (?<!\p{L})…(?!\p{L})
 * with the `u` flag. Every rule uses this pattern where word-boundary
 * matters.
 */

import fs from 'node:fs'
import process from 'node:process'

// ─── CLI ──────────────────────────────────────────────────────────────────
const [, , filePath, prefix] = process.argv
if (!filePath) {
  console.error('Usage: lint-ua-translation.mjs <file> [block-prefix]')
  process.exit(2)
}
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`)
  process.exit(2)
}

let raw = fs.readFileSync(filePath, 'utf8')

// Handle two formats: full JSON object, or inner-content (no wrapping {})
let data
try {
  data = JSON.parse(raw)
} catch {
  try {
    data = JSON.parse(`{${raw}}`)
  } catch (err) {
    console.error(`Cannot parse ${filePath}:`, err.message)
    process.exit(2)
  }
}

// Scope to the requested block if a prefix is given
let scope = data
if (prefix) {
  const parts = prefix.split('.')
  for (const p of parts) {
    if (scope && typeof scope === 'object' && p in scope) scope = scope[p]
    else {
      console.error(`Prefix not found in file: ${prefix}`)
      process.exit(2)
    }
  }
}

// ─── Word-boundary helper ─────────────────────────────────────────────────
// Wraps a letter-word pattern with Unicode-aware word boundaries.
// Works for mixed Cyrillic + Latin. Must be used with /u flag.
const WB_START = '(?<!\\p{L})'
const WB_END = '(?!\\p{L})'
const wb = (inner) => new RegExp(`${WB_START}(?:${inner})${WB_END}`, 'giu')

// ─── Rules ────────────────────────────────────────────────────────────────

const RULES = [

  // ── Forbidden words from landmines.md ───────────────────────────────────

  {
    id: 'forbidden.domovlenist',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: wb('домовленіст[ьіюи]|домовленост[іюи]|домовленим|домовленою|домовленост[ьі]'),
    hint: 'Forbidden: «домовленість». Use «вибір» (person\'s choice) or «правило»/«прийняте правило» (scientific convention) per landmines.md.',
  },

  {
    id: 'forbidden.knyzhka',
    category: 'FORBIDDEN',
    severity: 'WARN',
    pattern: wb('книг[аиоуіеою]|книжк[аиоуіеою]|книз[іе]|книжц[іе]'),
    hint: 'Possible forbidden: «книжка/книга». If this refers to the project itself, use «курс». If it refers to a physical book in a diagram, this is fine.',
  },

  {
    id: 'forbidden.sajt-self-ref',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    // «цей сайт» + case declensions = project self-reference. Must be «курс».
    // Legitimate references to third-party websites use «сайт виробника», «на сайті ...»,
    // i.e. not preceded by «цей/цього/цьому/цим/ці».
    pattern: /(?<!\p{L})(цей|цього|цьому|цим|цього\s+нашого|нашого|на\s+цьому|у\s+цьому|в\s+цьому)\s+сайт(?:у|і|ом|ів)?(?!\p{L})/giu,
    hint: 'Project self-reference must be «курс», not «сайт». Use «цей курс», «у цьому курсі», etc. Third-party websites (e.g. «сайт виробника») are fine.',
  },

  {
    id: 'forbidden.nahrivnyk',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: wb('нагрівник[аиуомиі]?'),
    hint: 'Forbidden: «нагрівник» is not standard Ukrainian. Use «нагрівач».',
  },

  {
    id: 'forbidden.vtomlena-battery',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    // Context-aware: the word «втомлен*» within ~30 chars of «батар*»
    pattern: /втомлен[аоуиіяую][\s\S]{0,30}батар|батар[\s\S]{0,30}втомлен[аоуиіяую]/giu,
    hint: 'Forbidden: «втомлена батарейка» is an English calque. Use «розряджена батарейка».',
  },

  {
    id: 'forbidden.pidtjaguiuchyi',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: wb('підтягуюч[иоаіеу]|стягуюч[иоаіеу]|обмежуюч[иоаіеу]'),
    hint: 'Russianism. Ukrainian uses -льний: «підтягувальний», «стягувальний», «обмежувальний».',
  },

  {
    id: 'forbidden.pracuyuchy-generic',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // General Russianism `-ючий` active participles. Common words the lint catches
    // explicitly; other forms still need human review.
    pattern: wb('працююч[иоаіеу]+|діюч[иоаіеу]+|кочуюч[иоаіеу]+|живлюч[иоаіеу]+|біжуч[иоаіеу]+'),
    hint: 'Russianism `-ючий` active participle. Use `-льний`/`-чий` form or a relative clause: «працюючий» → «робочий»/«справний»/«що працює».',
  },

  {
    id: 'forbidden.typu-such-as',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // «типу» used as "such as / like" (NOT as genitive of `тип`)
    // Match: " типу «…»" or " типу <letter>" where the next token is a descriptor.
    pattern: /(?<!\p{L})типу\s+(«|"|такий|таких|так[иу]|щось|якогось)/giu,
    hint: 'Register: «типу X» as "such as X" is Russianism/colloquial. Use «на кшталт X» or «на зразок X».',
  },

  {
    id: 'forbidden.apgreidyty',
    category: 'LEFTOVER',
    severity: 'ERROR',
    // Anglicism verb: апгрейд-, upgrade-
    pattern: wb('апгрейд[иеаяу]+|апгрейдуват[иь]+|upgrade|upgraded'),
    hint: 'Anglicism: «апгрейдити». Use «оновити», «оновлювати», «перейти на кращий», «модернізувати» — depending on context.',
  },

  {
    id: 'forbidden.skazhimo-say',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // «скажімо,» as a parenthetical "say," — direct calque
    pattern: /\(\s*скажімо,\s*/giu,
    hint: 'Calque of EN "say" as parenthetical. Use «(наприклад, …)» or «(припустімо, …)».',
  },

  {
    id: 'forbidden.prygoda-vs-nahoda',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    // «стати/ставати/знадобитися в/у пригоді» is a confusion with the real
    // idiom «стати в нагоді». `пригода` = adventure/incident; `нагода` =
    // occasion/use. Sound-alike mistake that slips past fluency critics.
    pattern: /(?<!\p{L})(стан[еуютьі]+|став[ае][тв]?\p{L}*|став[аеи]\p{L}*|стало|ставало|знадоб\p{L}*)\s+(?:в|у)\s+пригод[іеаую](?!\p{L})/giu,
    hint: 'Wrong idiom: «стати у пригоді» is a confusion with «пригода» (adventure). The correct UA idiom is «стати в нагоді» («нагода» = occasion/need). «Ці поради стануть вам у нагоді».',
  },

  {
    id: 'style.missing-nbsp-volt',
    category: 'STYLE',
    severity: 'WARN',
    // Number directly followed by В without space or NBSP (digit,comma,digit)?В
    // Exclude cases inside words (e.g., 2ВС is not likely but possible)
    pattern: /(\d(?:[.,]\d+)?(?:[–-]\d(?:[.,]\d+)?)?)В(?!\p{L})/gu,
    hint: 'Missing space/NBSP between number and unit. Use «5 В» (with NBSP \\u00a0 ideally). Applies to В, А, Ом, Гц, Вт, etc.',
  },

  {
    id: 'style.mains-220',
    category: 'STYLE',
    severity: 'WARN',
    // Legacy Soviet 220 V mains reference. Ukraine harmonised to 230 V in 2003.
    pattern: /(?<!\p{L})220\s*В(?!\p{L})/gu,
    hint: 'Ukraine\'s mains is 230 В (harmonised with EU since 2003). If you\'re writing about historical Soviet-era 220 В specifically, ignore this. Otherwise use «230 В».',
  },

  {
    id: 'forbidden.datasheet',
    category: 'LEFTOVER',
    severity: 'ERROR',
    pattern: /\bdatasheet[sy]?\b|(?<!\p{L})даташит[аиу]?(?!\p{L})/giu,
    hint: 'Forbidden: «datasheet» / «даташит». Use «специфікація» (also OK: «технічний опис»).',
  },

  {
    id: 'forbidden.pamyatka-for-namesake',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: /іменн[іа]\s+пам['’]ятк[иа]/giu,
    hint: 'Forbidden: «іменні пам\'ятки» for "namesakes". Use «вчених» or «імена».',
  },

  {
    id: 'forbidden.vorushatsja',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // Only flag near electron/particle context
    match: (s) => {
      if (!/електрон|заряд|носі|частинк|іон/iu.test(s)) return null
      return matchAllRegex(s, wb('ворушат[ьсяисся]+|ворушитис[ья]'),
        'Calque/register: «ворушаться» for electron motion. Use «рухаються».')
    },
  },

  {
    id: 'forbidden.prolitaiut',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    match: (s) => {
      if (!/електрон|заряд/iu.test(s)) return null
      return matchAllRegex(s, wb('пролітают[ьі]|пролітати'),
        'Physics: «пролітають» (fly) is wrong for electrons at drift velocities (~0.1 mm/s). Use «проходять».')
    },
  },

  {
    id: 'forbidden.voda-letit',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    match: (s) => {
      if (!/вод[аиою]/iu.test(s)) return null
      // Water doesn't fly, doesn't roll, doesn't crawl. It flows («тече»).
      return matchAllRegex(s, wb('летит[ьі]|літає|лі́тати|котиться|котяться|скотиться|скотяться|котитися|повзе|повзут[ьи]|повзти'),
        'Physics: water flows, not flies / rolls / crawls. Use «тече» / «ллється» / «розганяється» depending on context.')
    },
  },

  {
    id: 'forbidden.vylyvaietsja-designed',
    category: 'FORBIDDEN',
    severity: 'WARN',
    pattern: wb('виливаєтьс[яю]|виливатис[яю]'),
    hint: 'Register: «виливається» (spill/leak) — use «ллється» for designed water flow in a pipe.',
  },

  {
    id: 'forbidden.shmatochok-resistance',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: /шматочок[\s\S]{0,10}опор|шматочком[\s\S]{0,10}опор/giu,
    hint: 'Calque: «шматочок опору» — abstract quantities can\'t have pieces. Rewrite to describe the function directly.',
  },

  {
    id: 'forbidden.sydila-in-convention',
    category: 'FORBIDDEN',
    severity: 'WARN',
    pattern: /сидів[\s\S]{0,60}(рівнянн|схем|формул)|сиділа[\s\S]{0,60}(рівнянн|схем|формул)|сиділо[\s\S]{0,60}(рівнянн|схем|формул)|сиділи[\s\S]{0,60}(рівнянн|схем|формул)/giu,
    hint: 'Register: «сиділа в рівнянні» is too colloquial. Use «укорінилася», «закріпилася», «була закладена».',
  },

  {
    id: 'forbidden.strumobmezuvalnyi',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // Also catches `струмообмежуючий` (double landmine: струмо- prefix + -ючий
    // Russianism participle). E.g. «струмообмежуючого резистора» in led.detail.
    pattern: wb('струмообмежувальн[иоеаій]+|струмообмежуюч[иоаіеуою]+'),
    hint: 'Use «обмежувальний резистор» — shorter and more common in UA electronics publications. If you see «-уючий» form (struwобмежуюч-), it is DOUBLY wrong: verbose prefix + Russianism participle.',
  },

  {
    id: 'forbidden.pry-verbal-noun',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // Russianism pattern «при + gerund/nominalisation» for "when X-ing".
    // Native UA uses «коли X», «під час X», «за X-ою» (instrumental), or
    // an adverbial participle («роблячи X»). Catches common verbal-noun
    // endings: -нні, -нням, -нні, -онні, -оні, -енні, -анні.
    //
    // Exceptions NOT flagged (standard physics/scientific collocations):
    // - при + temperature / pressure / conditions («при кімнатній температурі»)
    // - при цьому / при тому (discourse markers)
    // - при умові (conditional idiom)
    // Detection: «при + word ending in -нні/-анні/-енні/-онні» where the word
    // is NOT «температурі/умові/тому/цьому/нагоді».
    pattern: /(?<!\p{L})при\s+(?!(?:температур|умов|тому|цьому|нагод|розрахунк|вимірюванн[іі]\s+температур))[а-яіїєґ]+(?:анн|енн|інн|онн|янн)[іеаяою](?!\p{L})/giu,
    hint: 'Russianism: «при + verbal noun» (e.g. «при проходженні», «при прикладенні»). Use «коли …», «під час …», «за + instrumental», or an adverbial participle («роблячи …»). Standard physics collocations («при кімнатній температурі», «при умові») are allowed.',
  },

  {
    id: 'forbidden.rechi-generic',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // Common abstract-"things" patterns that land on «речі» (clothes/items in colloquial UA)
    pattern: /(?:крізь|про|ці|такі|ті|всі)\s+реч[іе](?!\p{L})|(?<!\p{L})реч[іе](?=,\s+(на\s+яких|що|які|яких))/giu,
    hint: 'Register: «речі» colloquially = clothes/personal items. For abstract "things" use «явища» / «поняття» / «щось» / «те».',
  },

  {
    id: 'forbidden.oscilogram-generic',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // «осцилограма» used in generic "waveform" context (not a specific scope capture)
    pattern: wb('осцилограм[аиеою]'),
    hint: 'If this refers to a generic waveform, use «форма хвилі» / «хвиля» / «сигнал». «Осцилограма» = specific captured scope trace. Skip this warning if you really mean a scope capture.',
  },

  {
    id: 'leftover.vna-latin',
    category: 'LEFTOVER',
    severity: 'ERROR',
    // VNA left in Latin — canonical UA form is ВАЛ.
    // Exclude product names (NanoVNA, NanoVNA-H4, NanoVNA-Saver, etc.) — the brand
    // string is kept as-is since it's a specific hardware model.
    pattern: /(?<![\p{L}-])VNA(?![\p{L}-])/gu,
    hint: 'Leftover: Latin «VNA» in UK text. Use «ВАЛ» (векторний аналізатор ланцюгів) — see vna.label in ui.json.',
  },

  {
    id: 'forbidden.trymaites-kartynky',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: /тримайтес[ья]\s+цієї\s+картинк/giu,
    hint: 'Calque: «Тримайтеся цієї картинки» — use «Запам\'ятайте цю картинку».',
  },

  {
    id: 'forbidden.naskilki-as-predicate',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: /—\s*це\s+наскільки\s+(вузьк|широк|велик|малий|довг|коротк)/giu,
    hint: 'Verb-less calque: replace subordinate clause with noun phrase. «Опір — це звуження труби», not «це наскільки вузька труба».',
  },

  // ── Capitalised «Ви» mid-sentence ───────────────────────────────────────

  {
    id: 'register.capitalised-vy',
    category: 'REGISTER',
    severity: 'ERROR',
    // After Cyrillic/Latin letter (or ","/")") + whitespace, a capital Ви-form is wrong.
    // Sentence-start (after . ! ? \n, or at position 0) is fine.
    pattern: /([а-яіїєґА-ЯІЇЄҐa-zA-Z,;—–"'»)]\s+)(Ви|Вас|Вам|Вами|Ваш|Ваша|Ваше|Ваші|Вашу|Вашою|Вашим|Вашому|Вашого|Ваших|Вашій)(?!\p{L})/gu,
    hint: 'Register: «Ви»/«ваш» should be LOWERCASE mid-sentence. Radiopedia UA uses lowercase hobbyist register.',
    // Custom formatter so snippet shows where exactly
    extractMatch: (m) => m[2],
  },

  // ── Mid-phrase «приблизно» before a number ─────────────────────────────

  {
    id: 'style.mid-approximately',
    category: 'STYLE',
    severity: 'WARN',
    pattern: wb('заряд|напруга|струм|опір|величина|значення|частота') + '',
    // That's wrong — can't concat a regex with a string. Do it differently:
    match: (s) => {
      const re = /(заряд|напруга|струм|опір|величин[ауи]|значенн[яюі]|частот[ауи]|сила)\s+приблизно\s+[0-9]/giu
      return matchAllRegex(s, re,
        'Put «близько» before the number instead of «приблизно» mid-phrase: «заряд близько 6,25 × 10¹⁸».')
    },
  },

  // ── Decimal period in UK numeric strings ───────────────────────────────

  {
    id: 'punct.decimal-period',
    category: 'PUNCT',
    severity: 'ERROR',
    pattern: /(\d)\.(\d)(?=\s*(В|А|Ом|Гц|Вт|Кл|Дж|Ф|Гн|мм|см|м[\s.,;:)]|с[\s.,;:)]|кВ|мВ|мА|кА|мкА|кОм|МОм|мОм|кГц|МГц|ГГц|мкФ|нФ|пФ|дБ|дБм))/g,
    hint: 'UK decimal separator must be comma, not period. Use «1,5 В» (or formatNumber(n, locale) at runtime).',
  },

  // ── Latin unit symbols in UK strings ────────────────────────────────────

  {
    id: 'punct.latin-units',
    category: 'PUNCT',
    severity: 'ERROR',
    pattern: /(\d)\s(V|kV|mV|A|kA|mA|µA|uA|Ω|kΩ|MΩ|mΩ|Hz|kHz|MHz|GHz|J|W|F|µF|uF|nF|pF|Wh|mW|kW)(?=\s|$|[.,;:)\]])/g,
    hint: 'Latin unit symbol in UK text. Use Cyrillic: В/кВ/мВ / А/кА/мА/мкА / Ом/кОм/МОм/мОм / Гц/кГц/МГц/ГГц / Дж/Вт / Ф/мкФ/нФ/пФ / Гн / Вт·год / мВт/кВт.',
  },

  {
    id: 'punct.mixed-cyr-greek-ohm',
    category: 'PUNCT',
    severity: 'ERROR',
    // Catch Cyrillic prefix GLUED to Greek-Ω (kΩ/МΩ style), which is the
    // failure mode observed in Ch 0.3 labStep3/labStep4/quiz_q1. Legitimate
    // bare «Ω» in glossary entries like «Ом (Ω)» or «(Ω)» meter-knob
    // references are NOT flagged — glossary uses dual-notation by design.
    pattern: /[кКмМнНпПмгГТ]Ω/gu,
    hint: 'Mixed Cyrillic-prefix + Greek-Ω (e.g. «кΩ», «МΩ»). Use Cyrillic: «кОм», «МОм», «мОм», «нОм».',
  },

  {
    id: 'punct.mixed-cyr-latin-word',
    category: 'PUNCT',
    severity: 'ERROR',
    // Mixed Cyrillic + Latin letters inside a single word (encoding accident).
    // Three patterns: cyr+lat, lat+cyr, and single-char contamination inside a word.
    // Examples caught: «пікo» (Latin o at end), «наноfarads» (Latin stem),
    // «Кlас» (Latin l in middle), «Aрдуіно» (Latin A at start).
    // Allowed mixed-script like «Arduino-сумісний» (with hyphen) is NOT caught —
    // it requires letters glued with no separator.
    pattern: /\p{Script=Cyrillic}[A-Za-z]+(?![\p{Script=Cyrillic}A-Za-z]*-)|[A-Za-z]+\p{Script=Cyrillic}(?![-A-Za-z])/gu,
    hint: 'Mixed-script word (Cyrillic + Latin letters glued with no separator). Likely an encoding typo — e.g. «пікo» should be «піко», «наноfarads» should be «нанофарад». If intentional (hyphenated brand like «Arduino-сумісний»), add a hyphen.',
  },

  // ── Bare `K` for coulomb (collides with Kelvin) ─────────────────────────

  {
    id: 'punct.coulomb-k-clash',
    category: 'PUNCT',
    severity: 'ERROR',
    // A number + space + isolated «К» (uppercase Cyrillic K) — ambiguous with Kelvin.
    pattern: /(\d)\s+К(?=\s|$|[.,;:)»"'])/gu,
    hint: 'Ambiguous unit: bare «К» reads as Kelvin. For coulombs use «Кл».',
  },

  // ── Straight apostrophe ─────────────────────────────────────────────────

  {
    id: 'punct.ascii-apostrophe',
    category: 'PUNCT',
    severity: 'WARN',
    pattern: /([а-яіїєґА-ЯІЇЄҐ])'(?=[а-яіїєґА-ЯІЇЄҐ])/gu,
    hint: 'Typographic: straight apostrophe U+0027 between Cyrillic letters. Use curly apostrophe «’» (U+2019).',
  },

  // ── <i>X</i> for single-letter math variable ───────────────────────────

  {
    id: 'markup.i-math-var',
    category: 'MARKUP',
    severity: 'ERROR',
    pattern: /<i>[IVREQfTt]<\/i>/g,
    hint: 'Use <var>X</var> for math variables (renders as KaTeX math italic with serifs). <i>I</i> renders as «/» or «l» in sans-serif.',
  },

  {
    id: 'markup.glossary-tag-with-parenthetical',
    category: 'MARKUP',
    severity: 'WARN',
    // Match a glossary-style tag that wraps BOTH an abbreviation AND a
    // parenthetical expansion, e.g. <vna>VNA (Vector Network Analyser)</vna>.
    // The long underlined inline span wraps across lines (reads as "two
    // items") and desyncs Radix popper's tooltip positioning.
    // Exclude the allowed case: `<var>X</var>` for single-letter math vars.
    pattern: /<([a-z]+)>[^<()]{2,}\s+\([^)]+\)<\/\1>/g,
    hint: 'Glossary tag wraps both an abbreviation AND its parenthetical expansion. Wrap only the short form: «<tag>ABBR</tag> (Full form)» so the tooltip anchors correctly and the reader sees one underlined term, not two.',
  },
]

// ─── Runner ───────────────────────────────────────────────────────────────

function matchAllRegex(s, re, hint) {
  const found = []
  let m
  const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
  while ((m = r.exec(s)) !== null) {
    found.push({ index: m.index, match: m[0], hint })
    if (m.index === r.lastIndex) r.lastIndex++ // guard against zero-width
  }
  return found.length ? found : null
}

function runRule(rule, s) {
  if (rule.match) return rule.match(s)
  if (rule.pattern) return matchAllRegex(s, rule.pattern, rule.hint)
  return null
}

function collectStrings(obj, prefix = '') {
  const out = []
  if (typeof obj === 'string') {
    out.push({ key: prefix || '<root>', value: obj })
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      out.push(...collectStrings(v, prefix ? `${prefix}.${k}` : k))
    }
  }
  return out
}

const strings = collectStrings(scope, prefix ?? '')

let errors = 0
let warnings = 0
const findings = []

for (const { key, value } of strings) {
  for (const rule of RULES) {
    const hits = runRule(rule, value)
    if (hits) {
      for (const hit of hits) {
        findings.push({ key, rule, hit, value })
        if (rule.severity === 'ERROR') errors++
        else warnings++
      }
    }
  }
}

// ─── Report ───────────────────────────────────────────────────────────────

if (findings.length === 0) {
  console.log(`✓ ua-translate lint: ${strings.length} string(s) checked, no issues.`)
  process.exit(0)
}

// Group by category
const byCat = new Map()
for (const f of findings) {
  const cat = f.rule.category
  if (!byCat.has(cat)) byCat.set(cat, [])
  byCat.get(cat).push(f)
}

for (const [cat, group] of byCat.entries()) {
  console.log(`\n== ${cat} (${group.length}) ==`)
  for (const f of group) {
    const start = Math.max(0, f.hit.index - 25)
    const end = Math.min(f.value.length, f.hit.index + f.hit.match.length + 25)
    const snippet = f.value.slice(start, end)
    const marker = f.rule.severity === 'ERROR' ? '✗' : '!'
    console.log(`${marker} [${f.rule.id}] ${f.key}`)
    console.log(`  ...${snippet}...`)
    console.log(`  → ${f.hit.hint}`)
  }
}

console.log(`\nSummary: ${errors} error(s), ${warnings} warning(s) across ${strings.length} string(s).`)
process.exit(errors > 0 ? 1 : 0)
