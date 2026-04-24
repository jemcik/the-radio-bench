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

  // ── Markup hygiene ──────────────────────────────────────────────────────

  {
    id: 'markup.var-sub-linebreak',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    // KaTeX's <var> (inline-block math span) + plain <sub> creates a
    // line-break opportunity at the element boundary; browsers can
    // orphan a subscript onto the next line (e.g. V_C rendered as
    // "V" / "ᴄ"). Authors MUST put the subscript inside the TeX:
    // `<var>V_{\mathrm{C}}</var>` / `<var>V_{i}</var>`. One-pass
    // migration landed in ch 1.5; this rule exists to prevent
    // regression.
    pattern: /<var>[^<]+<\/var>\s*<sub>/g,
    hint: '<var>X</var><sub>Y</sub> pattern — breaks across lines. Use <var>X_{\\mathrm{Y}}</var> (Latin subscript) or <var>X_{Y}</var> (italic variable index) instead.',
  },

  {
    id: 'markup.bare-subscript-pattern',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // Bare X_Y («V_pk», «R_1», «V_out») rendered from a raw `t()` call
    // shows a literal underscore in the UI. Either wrap the string in
    // `<var>X_{\\mathrm{Y}}</var>` so it routes through KaTeX via
    // <Trans>/<MathText>, or the render site uses <MathText> on raw
    // t() output. WARN (not ERROR) because some strings are ARIA-only
    // and never seen; check each case.
    pattern: /(?<![<>\\{])\b[A-Za-z]_[A-Za-zА-ЯІЇЄа-яіїє0-9]+\b(?![<>}])/g,
    hint: 'Bare X_Y pattern outside <var>…</var>. Wrap in <var>X_{\\mathrm{Y}}</var> (or X_{Y} for variable indices, X_{\\text{Y}} for Cyrillic).',
  },

  {
    id: 'markup.cyrillic-subscript-in-var',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    // Classic Gemini regression: V_in → V_вх, f_c → f_зр, etc.
    // Project convention (per glossary.md «Subscripts — hard
    // typographic rule»): keep Latin subscripts for standard physics
    // labels (in, out, min, max, rms, pk, c for cutoff, etc.). If a
    // genuinely Ukrainian-only subscript becomes necessary later,
    // add an explicit allow-list exception here.
    pattern: /<var>[^<]*\\text\{[^{}]*[\u0400-\u04FF][^{}]*\}[^<]*<\/var>/g,
    hint: 'Cyrillic subscript inside <var>…</var>. Keep Latin: V_{\\mathrm{in}} not V_{\\text{вх}}, f_{\\mathrm{c}} not f_{\\text{зр}}. Known Gemini regression.',
  },

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
    id: 'forbidden.raza-multiplier',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // Russian uses «в N раза / в N разу» (gen. sg.) as a multiplier. Ukrainian
    // uses «у N рази» (nom. pl., for factors 2/3/4 or non-integer factors near
    // them) or «у N разів» (gen. pl., for 5+). The singular forms `раза` and
    // `разу` as multipliers are hard Russianisms. User-flagged on ch1.3:
    // «у √2 раза більший» → «у √2 рази більший». Uses `wb()` for Cyrillic
    // word boundaries; the pattern anchors on a preposition (у/в/і) + a
    // numeric/variable token + раза/разу.
    pattern: wb('[уів]\\s+\\S+\\s+(?:раза|разу)'),
    hint: 'Use «рази» (nom. pl.) for multipliers with 2/3/4 or non-integer factors near them («у 2 рази», «у √2 рази»); use «разів» (gen. pl.) for 5 and above («у 10 разів»). The singular forms «раза» / «разу» as multipliers are Russianisms.',
  },

  {
    id: 'forbidden.playground-verbs',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // Childish/playground-register verbs applied to physical quantities. A
    // voltage does NOT «гойдатися» (swing on a swingset), a current does NOT
    // «танцювати/стрибати/бігати» (dance/jump/run), electrons don't «ворушитися»
    // (fidget). User-flagged on ch1.3 for «напруга гойдається вгору-вниз» —
    // children's-book register in a physics textbook. Use technical verbs:
    // `коливатися`, `періодично змінюватися`, `зростати/спадати`, `відхилятися`.
    pattern: wb('гойда(?:ється|ються|тися|ються|вся|лися|лася|лося)|танцю(?:є|ють|вати|вав|вала|вали)|стрибає|стрибають|бігає|бігають|ворушит(?:ься|ься|ься)'),
    hint: 'Playground-register verb applied to a physical quantity. Use «коливається / періодично змінюється / зростає / відхиляється» instead. Voltages don\'t swing; sines oscillate.',
  },

  // ── Playground-register PLACEMENT verbs for components/materials ────────
  //
  // User-flagged on ch1.5 (repeatedly): «покладіть між ними ізолятор»,
  // «Поставте обкладки обличчям», «Поставте резистор послідовно», etc.
  // Placing a component into a circuit in UA technical prose uses:
  //   - `розмістити / розмістіть` (generic placement)
  //   - `помістити / помістіть` (placing between / inside something)
  //   - `установити / установіть` (installing a component)
  //   - `увімкнути послідовно/паралельно` (connecting in series/parallel)
  //   - `під'єднати / під'єднайте` (connecting terminals)
  //
  // Colloquial «покласти / покладіть», «поставити / поставте» for
  // components read as playground/kitchen register in a physics lab text.
  // Also «висіти» as intransitive for a wire end — «залишається вільним»
  // is the technical form.
  //
  // **Exceptions**: «поставити прилад у розрив», «поставити метальну
  // крапку», «поставити задачу» — established collocations; not flagged.
  //
  // Pattern is narrow: verb form + 0-3 words + component/placement noun.
  {
    id: 'forbidden.playground-placement',
    category: 'FORBIDDEN',
    severity: 'WARN',
    pattern: /(?<!\p{L})(?:покладіть|покладемо|покладуть|покласти|кладіть|покладу|кладемо)\s+(?:\S+\s+){0,3}?(ізолятор|діелектрик|резистор|конденсатор|індуктивність|котушку|діод|компонент|дротину|провід|перемичку|плату|мікросхему|транзистор|обкладк[уи])/giu,
    hint: 'Playground-register verb for placing a component. Use «розмістіть», «помістіть», «установіть», «увімкніть послідовно/паралельно» or «під\'єднайте». See landmines — «покладіть між ними X» is colloquial; lab-register is «розмістіть між ними X».',
  },

  {
    id: 'forbidden.postavte-component',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // «Поставте резистор послідовно / Поставте обкладку / Поставте
    // конденсатор» — for component placement, not for «поставити задачу»
    // or «поставити крапку» (abstract, OK).
    pattern: /(?<!\p{L})(?:поставте|поставити|постав)\s+(?:\S+\s+){0,2}?(резистор|конденсатор|індуктивність|котушку|діод|обкладк[уи]|пластин[уи]|компонент|мікросхему|транзистор|запобіжник)\b/giu,
    hint: 'Playground-register «поставте» for a component. Use «розмістіть» / «установіть» / «увімкніть» (for connection) / «під\'єднайте». Compare the existing ch1_5 labStep1 fix: «Поставте резистор послідовно» → «Увімкніть резистор послідовно».',
  },

  {
    id: 'forbidden.visity-wire',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // «залиште кінець дроту висіти» — a wire/lead does not «hang» in UA
    // tech prose; use «залишатися вільним» / «бути неприєднаним».
    pattern: /(?<!\p{L})(?:висіти|висить|висять)\s+(?:до|поки|аж|—|\.)/giu,
    hint: 'A wire/lead in UA tech prose does not «висіти». Use «залишається вільним» / «лишається неприєднаним» instead.',
  },

  {
    id: 'forbidden.miryaty-measure',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // Colloquial «міряти/поміряти» instead of formal «вимірювати/виміряти» in
    // lab/physics contexts. User-flagged on ch1.3. Matches Ch 1.1 / 1.2 formal
    // register. Uses `wb()` so compound words like «примірювати» (which starts
    // with `при-`, not a bare «мір-») are not false-flagged — `wb` anchors on
    // a non-letter (or start-of-string) before `(по)?мір`.
    pattern: wb('(?:по)?мір(?:ят[ьи]|яю|яєш|яє(?:мо|те)?|яють|яй(?:те)?|ял[иао]|яв)'),
    hint: 'Use formal «вимірювати / виміряти / Виміряйте» instead of colloquial «міряти / Поміряйте» in lab and physics contexts. The latter is conversational register and clashes with textbook voice established in Ch 1.1 / 1.2.',
  },

  {
    id: 'forbidden.shchupaty-measure',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // «щупати/щупаєте» used as a verb meaning «to measure with probes» is a
    // colloquialism. Use «торкатися щупами» or «вимірювати». User-flagged on
    // ch1.3 labTrouble2.
    pattern: wb('щупає(?:ш|мо|те)?|щупа[юлв][имаоли]*'),
    hint: 'Colloquial «щупати» for «measure with probes». Use «торкатися щупами» (for the act of touching probes to a node) or «вимірювати» (for the act of taking a reading).',
  },

  {
    id: 'forbidden.personify-quantity',
    category: 'FORBIDDEN',
    severity: 'WARN',
    // Anthropomorphic language applied to physical quantities. Voltage/current
    // don't «спокійно сидять», «люблять», «хочуть», «відпочивають», «панікують».
    // User-flagged on ch1.3 («така спокійна електроніка» → «така стала»).
    // Pattern: adjective-of-calmness/emotion immediately preceding a quantity
    // noun (within 0–2 words). `wb()` ensures we catch «спокійна», «спокійно».
    pattern: /(?<!\p{L})(?:спокійн[аиоуіе]+|спокійно)\s+(?:напруг[аиу]|струм[уи]?|сигнал[и]?|коливанн[яюями]+|електронік[аиою]+)(?!\p{L})/giu,
    hint: 'Anthropomorphic descriptor «спокійна/спокійно» applied to a physical quantity. Use a physics descriptor: «стала», «незмінна», «не змінюється в часі». Voltages are not emotional.',
  },

  {
    id: 'forbidden.emdash-before-math-var',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    // An em-dash «—» followed by an italic math variable reads visually
    // as a UNARY MINUS — the italic letter and the dash collapse into a
    // signed quantity. Triggers:
    //   1) em-dash + <var>                                 («— V»)
    //   2) em-dash + short-word (1–4 chars) + <var>        («— і V»)
    //   3) em-dash + <nowrap> that STARTS with <var>       («— <nowrap><var>V</var>…»)
    //   4) em-dash + short-word + <nowrap><var>
    // A <nowrap> wrapping plain text (numbers, units, words) is NOT
    // ambiguous — «— це <nowrap>10 кОм</nowrap>» reads cleanly as a
    // prose definition, not a minus sign, because «10» is not italic.
    // So the rule is narrower than "any <nowrap>": only nowraps that
    // begin with a math variable count.
    // User-flagged on ch1.2 / ch1.3 (`nonSineIntro`) and ch1.4
    // (`dividerFormulaSubstLead`, `labStep4`).
    pattern: /—\s*(?:\S{1,4}\s+)?(?:<var>|<nowrap>\s*<var>)/gi,
    hint: 'Em-dash directly before a math variable (or with only a short word between) reads as a minus sign — the italic letter + the em-dash collapse into a signed quantity. Use a period + new sentence, a colon, or restructure so no math variable follows the em-dash within ~10 characters. Never `— <var>X</var>` or `— word <var>X</var>` (short word).',
  },

  {
    id: 'forbidden.raw-lt-gt-in-i18n',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    // A raw `<` or `>` inside an i18n string, when rendered via <Trans>,
    // triggers i18next's HTML-like tag parser and gets HTML-encoded to
    // `&lt;`/`&gt;` in the browser. User-flagged on ch1.3
    // («230 В < 250 В» showed as «230 В &lt; 250 В»). Fix: rewrite
    // comparisons in words (UK «менше за», EN «is less than») — NEVER
    // use raw `<`/`>` for math operations in prose.
    // Pattern: `<` or `>` that is NOT part of a recognised tag opener/closer.
    // Heuristic: math comparators are space-delimited in prose («x < 10»,
    // «1 ≤ м < 10»). Tag openers have a letter right after the `<`; tag
    // closers have an alphanumeric right before the `>`. So a bare
    // math `<`/`>` must be PRECEDED by whitespace (or start-of-string) AND
    // FOLLOWED by whitespace or a digit. This excludes `</foo2> <bar>`
    // (closing-tag `>` preceded by digit, not by whitespace — false
    // positive in the earlier, looser regex).
    pattern: /(?:^|\s)[<>](?=\s|\d)/g,
    hint: 'Raw `<` or `>` in an i18n string is interpreted as tag markup by react-i18next and gets encoded to `&lt;`/`&gt;` in the browser. Express comparisons in words: UK «менше за» / «більше за», EN «is less than» / «is greater than». Reserve `<tag>` for actual Trans components.',
  },

  // NOTE: «formula-without-nowrap» rule omitted from the linter — requires a
  // stateful check (is this var+sub pair inside an existing <nowrap>?) that
  // the current single-regex runner doesn't support. Instead, run a dedicated
  // audit script before shipping each chapter (see scripts/audit-nowrap.mjs if
  // we later add one). For now, rely on manual grep + pre-PR review.

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

  // ── Polarity of poles/terminals must be позитивний/негативний ──────────
  //
  // User-flagged on ch1.5: «додатний вивід», «від’ємний вивід», «додатна
  // обкладка» etc. — in UA, poles / terminals / leads / plates ALWAYS
  // take `позитивний/негативний`, never `додатний/від'ємний`. The latter
  // is reserved for scalar/math contexts (`додатне число`, `від'ємна
  // півхвиля`) — not for physical polarity labels. See landmine (row in
  // section 3) «Polarity of POLES/TERMINALS — always позитивний/негативний».
  {
    id: 'forbidden.dodatny-polarity',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    // Match `додатн*` / `від'ємн*` (both ' and ’ apostrophe forms)
    // followed within 0-2 words by a physical-polarity noun.
    pattern: /(?<!\p{L})(додатн|від['’]ємн)\S*\s+(?:\S+\s+)?(вивід|виводу|виводі|виводом|виводи|виводів|виводах|полюс|полюсу|полюсі|полюсом|полюси|полюсів|полюсах|клем[ауиоюі]?|клемам[иі]?|клемах|обкладк[ауиоюі]?|обкладок|обкладкам[иі]?|обкладках|електрод|електрода|електроду|електродом|електроди|електродів|електродах|терміналь\S*|провід|провода|проводу|проводом)(?!\p{L})/giu,
    hint: 'Polarity of poles/terminals: use «позитивний / негативний», never «додатний / від’ємний». The latter is for scalar/math contexts only (додатне число, від’ємна півхвиля). Applies to: вивід, полюс, клема, обкладка, електрод, термінал, провід.',
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

  // ── «паралельна/послідовна комбінація» — circuit-topology calque ─────────────
  //
  // For series/parallel CIRCUIT CONNECTIONS, UA uses «з'єднання» (neuter),
  // never «комбінація». «Паралельна комбінація [резисторів]» is an English
  // calque («parallel combination»). Canonical: «паралельне з'єднання».
  // (Generic «комбінація значень / комбінація кольорів» for non-topology
  // meanings is fine — only circuit-topology usage is flagged here.)
  //
  // Matches «паралельн*/послідовн* + any whitespace + комбінаці*» where the
  // surrounding context suggests circuit topology (resistor / з'єднання /
  // опір / струм / схема within ~40 chars).
  {
    id: 'forbidden.parallel-combination-calque',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    match: (s) => {
      const results = []
      const re = /(паралельн|послідовн)[ауиеіоюяй]+\s+комбінаці[ьїіюяям]+/giu
      let mt
      while ((mt = re.exec(s)) !== null) {
        const ctx = s.slice(Math.max(0, mt.index - 40), mt.index + mt[0].length + 40)
        if (/резистор|з[’']єднанн|опор|струм|схем|коло|подільник/giu.test(ctx)) {
          results.push({
            index: mt.index,
            match: mt[0],
            hint: 'Circuit-topology term: use «з\'єднання» (neuter) not «комбінація». «Паралельна комбінація резисторів» → «паралельне з\'єднання резисторів». Generic non-topology use of «комбінація» (e.g. «комбінація кольорів») is fine.',
          })
        }
      }
      return results
    },
  },

  // ── «взяти з собою» as section heading — calque of "take away" ────────────────
  //
  // English «What to take away» is idiomatic (≈ «key lessons to remember»).
  // Literal UA «що взяти з собою» reads as "what to physically take along
  // with yourself" — the verb «взяти» governs motion/possession, not
  // learning. Use «Головне», «Підсумки», «Ключове» for section summaries.
  // The calque is especially likely on section-summary headings.
  {
    id: 'forbidden.take-away-calque',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: /взят[иь]\s+з\s+соб(?:ою|і)/giu,
    hint: 'Calque of English "take away" / "take with you". «Взяти» implies physical motion — a reader can\'t literally «взяти» a concept. For section summaries use «Головне» (matches ch1.2). Other options: «Підсумки», «Ключове», «Що треба запам\'ятати».',
  },

  // ── «(завжди більше)» / «(завжди менше)» bare parenthetical ──────────────────
  //
  // Flagged by user on ch 1.4 keyTakeaway4. Calque of EN "(always larger)" /
  // "(always smaller)". Two problems:
  //
  //   1. Agreement — the bare neuter form «більше/менше» grammatically attaches
  //      to the nearest neuter noun (usually «з'єднання»), not to the intended
  //      implicit subject (the resistance R). Reader parses it as "the
  //      connection is always larger" — nonsense.
  //   2. Missing comparison target — "bigger than WHAT?" UA prose cannot elide
  //      the compared-to the way an EN parenthetical does.
  //
  // Fix: name the subject («сумарний опір», «вихід», «струм», etc.) and the
  // comparison target («більший за кожен із резисторів», «менша за вхідну
  // напругу»). Only fires on the exact parenthetical form — ordinary «завжди
  // більше/менше» inside a full sentence with an explicit subject is fine.
  {
    id: 'forbidden.bare-zavzhdy-comparative',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: /\(\s*завжди\s+(?:більш[аеіеоєи]?|менш[аеіеоєи]?|вищ[аеіоєи]?|нижч[аеіоєи]?)\s*\)/giu,
    hint: 'Bare parenthetical «(завжди більше/менше)» has no grammatical subject and no comparison target — reads as ambiguous calque of EN "(always larger)". Name the subject and the compared-to explicitly: «сумарний опір більший за кожен із резисторів», «вихід завжди менший за вхід».',
  },

  // ── «торкнутися» + instrument in genitive — should be instrumental ──────────
  //
  // Flagged by user ch 1.4 labStep2: «торкніться щупів один до одного» must be
  // «торкніться щупами». Grammar: «торкнутися» governs the OBJECT in genitive
  // («торкнутися руки» = touch the hand) and the INSTRUMENT in instrumental
  // («торкнутися рукою столу» = touch the table with the hand). When the thing
  // you name is a tool/probe/finger — the instrument — it must be instrumental.
  //
  // Narrow rule: any form of «торкнутися» / «торкатися» followed by «щупів»
  // (the canonical instrument noun in our lab prose). Pattern «торк\p{L}+»
  // covers all inflected forms — both perfective (торкнутися, торкнувся,
  // торкнулися, торкніться, торкнеться) and imperfective (торкатися,
  // торкаюся, торкається). Other instrument nouns (пальців, викруткою)
  // aren't caught yet — add if flagged. Legitimate genitive objects
  // («торкнутися виводів резистора») are not false-positived because «виводи»
  // IS the thing being touched, not the instrument.
  {
    id: 'forbidden.torknutysya-schupiv',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: /(?<!\p{L})торк\p{L}+\s+щупів(?!\p{L})/giu,
    hint: '«Торкнутися щупів» treats probes as the object being touched, but probes are the INSTRUMENT — use instrumental case: «торкніться щупами» / «торкнутися щупами». General rule: «торкнутися» + genitive = object touched; «торкнутися» + instrumental = tool used to touch. Probes, fingers, screwdrivers → instrumental.',
  },

  // ── «точніше, ніж на X відсотків» — margin-comparator calque ─────────────────
  //
  // Flagged by user ch 1.4 labStep5: «Вони мають збігатися точніше, ніж на
  // пару відсотків» must be «з точністю до кількох відсотків».
  //
  // English «to within X» / «better than X» maps onto a margin/tolerance
  // phrase. UA literal translation «точніше, ніж на X» uses «ніж» as the
  // comparison conjunction (which is correct grammar for comparatives) but
  // the SEMANTICS of "agreement to within a margin" is expressed in UA by
  // different constructions: «з точністю до X», «в межах X», «з похибкою
  // не більше X». The literal «точніше, ніж на X» reads as translation debris.
  //
  // Narrow rule: matches the exact calqued pattern «точніше, ніж на \w+
  // відсотк…» / «процент…». Other comparator verbs (швидше, сильніше) would
  // need their own rule if they show up.
  {
    id: 'forbidden.tochnishe-nizh-na-calque',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: /точніше,?\s+ніж\s+на\s+\p{L}+\s+(?:відсотк|процент)/giu,
    hint: 'Calque of EN "to within X percent". «Точніше, ніж на» is not the native UA construction for agreement-within-a-margin. Use «з точністю до кількох відсотків», «в межах кількох відсотків», or «з похибкою не більше X %».',
  },

  // ── «пару відсотків/герц/ват/…» — colloquial/russism in technical register ───
  //
  // Flagged by user ch 1.4 labStep5: «на пару відсотків» is the Russian-
  // influenced «пару процентов» carrying a colloquial count-word into a
  // technical context. Native UA uses «кілька» / «декілька»  for "a few"
  // in engineering prose. «пара» in UA primarily means "pair" (two of
  // something); the extended colloquial sense of "a few" is a russism and
  // in any case reads as informal.
  //
  // Narrow rule: «пару» or «пари» followed by a plural-genitive
  // technical/measurement unit. Pair-of-objects uses («пара черевиків»,
  // «пара резисторів») use NOMINATIVE singular «пара» — not caught, as they
  // are legitimate. The accusative «пару» with a measurement unit is the
  // colloquial-count-word form we want to flag.
  {
    id: 'forbidden.paru-units-russism',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: /(?<!\p{L})пар[уи]\s+(?:відсотк|процент|герц|вольт|ампер|ват|ом[ах]?|децибел|хвилин|секунд|мілісекунд|мікросекунд|хвиль|канал|розділ)/giu,
    hint: 'Russism/colloquialism: «пару X» for "a few X" in technical measurement register. Use «кілька відсотків», «кілька герц», «декілька хвилин». «Пара» in UA = "pair (of two)"; the "a few" sense is a russism (ru: «пару процентов»).',
  },

  // ── «статичні факти» — calque of EN academic "static facts" ─────────────────
  //
  // Flagged by user ch 1.4 labConnection. UA «статичний» means physically
  // motionless (статична електрика, статичне поле); it does NOT carry the
  // English sense "information that sits in a table and doesn't change".
  // The calque «статичні факти» reads as dead academic translationese.
  // Use: «теорія», «довідкові знання», «значення з таблиці», «табличні дані».
  {
    id: 'forbidden.statychni-fakty-calque',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: /(?<!\p{L})статичн[іихаоиіе]{1,3}\s+факт[иівуаомах]{1,4}/giu,
    hint: 'Calque of EN "static facts". UA «статичний» means physically motionless, not "table-of-data". Use «теорія», «довідкові знання», «значення з таблиці», «табличні дані», or rephrase around «теорія → практика».',
  },

  // ── «мотивує теорему/закон/підхід/…» — academic-motivate calque ──────────────
  //
  // Flagged by user ch 1.4 labConnection: «а це мотивує теорему Тевенена». UA
  // «мотивувати» only means "to motivate a person to do X" (an agent's
  // decision/action). Applied to an abstract noun (теорема, закон, формула,
  // підхід, метод) it's a calque of EN academic "this motivates the theorem"
  // and reads as nonsense in UA.
  //
  // Native constructions for "X motivates Y" (EN academic sense):
  //   • «саме тут стає в нагоді Y» / «саме для цього потрібна Y»
  //   • «X робить потрібним Y»  • «через X нам знадобиться Y»
  //   • «саме тому в розділі N ми введемо Y»
  //
  // Pattern catches any form of «мотивує/мотивують/мотивувало/…» followed
  // within ~25 chars by an abstract target noun. Legitimate «мотивує
  // студентів» (motivates students — actual agent) is not caught because the
  // target noun is human.
  {
    id: 'forbidden.motyvuye-abstract-calque',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    match: (s) => {
      const results = []
      const re = /(?<!\p{L})мотив(?:ує|ують|ував[аоиі]?|уватиме|уватимуть|увало)(?!\p{L})/giu
      let mt
      while ((mt = re.exec(s)) !== null) {
        const tail = s.slice(mt.index + mt[0].length, mt.index + mt[0].length + 40)
        if (/\s+(?:теорем|закон|підхід|метод|формул|правил|обговоренн|дискус|висновок|результат|рівнянн)/iu.test(tail)) {
          results.push({
            index: mt.index,
            match: mt[0] + tail.slice(0, 30),
            hint: 'Calque of EN academic "motivates the theorem/law/…". UA «мотивувати» means "to motivate a person"; applied to an abstract noun it\'s translationese. Use «саме тут стає в нагоді Y», «робить потрібним Y», «через це нам знадобиться Y», «саме для цього ми введемо Y».',
          })
        }
      }
      return results
    },
  },

  // ── «від постійного струму до X Гц» — frequency-range dimension clash ────────
  //
  // Flagged by user ch 0.2 vnaHobby: «працюють від постійного струму до 1,5–3
  // ГГц». EN "DC" is dual-meaning: (1) "direct current" — a current TYPE; (2)
  // "zero frequency" — a point on the frequency axis (standard RF/filter
  // engineering shorthand). In "VNA covers DC to 3 GHz" it's meaning (2).
  //
  // UA «постійний струм» only carries meaning (1) — a current type. When used
  // in a frequency-range phrase («постійного струму до X Гц»), it collides
  // with the frequency unit on the other side and reads as a dimension clash:
  // "from CURRENT to FREQUENCY". Fix: name the lower bound in frequency units
  // («від 0 Гц до X»), optionally with a gloss («від 0 Гц (постійний струм) до X»).
  //
  // Pattern: «постійн* струм*» within ~30 chars of «до» + [freq unit]. Freq
  // units: Гц/кГц/МГц/ГГц (+ declension). Other «постійного струму» uses
  // («споживає 2 А постійного струму») are not touched because they don't
  // cross a frequency unit.
  {
    id: 'forbidden.dc-to-freq-dimension-clash',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    pattern: /постійн[оиа][гм][оу]\s+струм[ауом]\s+до\s+[^.]{0,30}?(?:Гц|кГц|МГц|ГГц|ТГц)(?!\p{L})/giu,
    hint: 'Dimension clash: EN "DC" in a frequency-range spec means "0 Hz" (zero frequency), not «постійний струм» (current type). Use «від 0 Гц до X Гц» — or «від 0 Гц (постійний струм) до X Гц» if you want to preserve the RF flavor.',
  },

  // ── «дільник напруги» — MUST be «подільник напруги» (landmine 13.7 + glossary) ─
  {
    id: 'forbidden.dilnyk-napruhy',
    category: 'FORBIDDEN',
    severity: 'ERROR',
    // Matches «дільник напруги», «дільника напруги», «дільників напруги», etc.
    // NOT prefixed by «по-» (so «подільник напруги» is fine). Negative lookbehind
    // for `по` to avoid flagging the correct form.
    pattern: /(?<!по)(?<!\p{L})дільник(?:а|ів|ом|ами|у|и|ами|ах|ові|ами)?\s+напруг[иауі]/giu,
    hint: 'Voltage divider in UA is «подільник напруги», NEVER «дільник напруги». (Frequency divider «дільник частоти» is a separate case — this rule targets voltage-divider phrases only.)',
  },

  // ── «декада» in a resistor E-series context — use «десяток» (landmine 13.7) ───
  {
    id: 'style.dekada-for-resistor-eseries',
    category: 'STYLE',
    severity: 'WARN',
    // Heuristic: «декад[ауиі]» within 80 characters of «номінал», «ряд E», «резистор»,
    // «E12»/«E24»/«E48»/«E96»/«E192» — strongly suggests resistor preferred-value context.
    // Frequency-response contexts («на декаду» with «частот», «Гц», «dB», «фільтр»)
    // do NOT match.
    match: (s) => {
      const results = []
      const re = /декад[ауиіюі]/giu
      let m
      while ((m = re.exec(s)) !== null) {
        const windowStart = Math.max(0, m.index - 80)
        const windowEnd = Math.min(s.length, m.index + 80)
        const ctx = s.slice(windowStart, windowEnd)
        const isResistorCtx = /номінал|ряд[уи]?\s*E|резистор|E12|E24|E48|E96|E192/giu.test(ctx)
        const isFrequencyCtx = /частот|Гц|кГц|МГц|дБ|фільтр|спад[уі]?|рол/giu.test(ctx)
        if (isResistorCtx && !isFrequencyCtx) {
          results.push({
            index: m.index,
            match: m[0],
            hint: 'UA Wikipedia «Ряди номіналів радіоелементів» uses «десяток» for resistor E-series, NOT «декада». Use «на десяток», «у кожному десятку», etc. (Frequency-response rolloff context keeps «декада»/«порядок».)',
          })
        }
      }
      return results
    },
  },

  // ── Unglossed canonical technical terms (landmine 13.5) ───────────────────────
  //
  // Registry: UA technical jargon that reads as opaque to beginners unless
  // introduced with a gloss, paraphrased, or wrapped in a <G> glossary tag.
  // Each entry is paired with `safeFromChapter` — the chapter number at or
  // after which the term is considered "canonical for the reader" and the
  // warning is suppressed.
  //
  // The rule fires on any occurrence in a block whose chapter number is
  // below the threshold AND the term is NOT wrapped in a <G>…</G> tag AND
  // there is no parenthetical gloss immediately after (≤50 chars window).
  //
  // Grows from every user pushback. If the user flags a new term, add it
  // here with its formal-introduction chapter.
  {
    id: 'style.unglossed-canonical-term',
    category: 'STYLE',
    severity: 'WARN',
    match: (s, meta) => {
      // Parse chapter number from the key (e.g. "ch1_4.loadingIntro" → 1.04)
      const key = meta?.key ?? ''
      const m = key.match(/^ch(\d+)_(\d+)/)
      const chapterNumber = m ? parseInt(m[1], 10) + parseInt(m[2], 10) / 100 : null

      const REGISTRY = [
        // term pattern (word-boundary), safeFromChapter, suggested paraphrase
        { term: /(?<!\p{L})атенюатор[ауиеіою]?(?!\p{L})/giu, safeFrom: 3.00, hint: 'атенюатор — canonical from ch3+; before that, use «ступінь послаблення сигналу» or describe directly.' },
        { term: /(?<!\p{L})адмітанс[ауі]?(?!\p{L})/giu,      safeFrom: 1.06, hint: 'адмітанс — canonical from ch1.6+; before that, use «провідність у колах змінного струму» or wrap in <G>.' },
        { term: /(?<!\p{L})гістерезис[ауі]?(?!\p{L})/giu,    safeFrom: 2.00, hint: 'гістерезис — introduce with a gloss («поріг із запасом») or wrap in <G>.' },
        { term: /(?<!\p{L})каскад[ауіиовх]?(?!\p{L})/giu,    safeFrom: 1.08, hint: 'каскад — electronics jargon; for beginner prose use «ступінь», «частина схеми», «блок схеми», or wrap in <G>.' },
        { term: /(?<!\p{L})трансивер[ауі]?(?!\p{L})/giu,     safeFrom: 2.00, hint: 'трансивер — introduce with a gloss or wrap in <G>.' },
        { term: /(?<!\p{L})гетеродин[ауі]?(?!\p{L})/giu,     safeFrom: 3.01, hint: 'гетеродин — introduce with a gloss or wrap in <G>.' },
        { term: /(?<!\p{L})зміщенн[яіюеі]/giu,               safeFrom: 1.10, hint: 'зміщення (biasing) — canonical from ch1.10+; in earlier chapters prefer «задавання робочої точки».' },
        { term: /(?<!\p{L})ВЧ(?!\p{L})/gu,                   safeFrom: 2.00, hint: 'ВЧ — abbreviation for «високі частоти»; in beginner prose expand the full form.' },
        { term: /(?<!\p{L})КХ(?!\p{L})/gu,                   safeFrom: 4.01, hint: 'КХ (short waves) — ham-radio term; in earlier chapters expand to «діапазон коротких хвиль».' },
        { term: /(?<!\p{L})реактивн(?:ий|ого|ому|им|ій|ої|ою|е|і|их|ими)\s+опір/giu, safeFrom: 1.05, hint: 'реактивний опір — canonical from ch1.5+; before that, describe directly.' },
      ]

      const results = []
      if (chapterNumber == null) return results // skip for unscoped lints
      for (const { term, safeFrom, hint } of REGISTRY) {
        if (chapterNumber >= safeFrom) continue
        let mt
        const re = new RegExp(term.source, term.flags)
        while ((mt = re.exec(s)) !== null) {
          // Skip if the term is wrapped in ANY tag (gloss wrapper like <G>,
          // <hf>, <transceiver>, etc. — the project uses many component
          // names for term-tagging). Match: opening tag immediately before
          // (optional whitespace), closing tag immediately after.
          const immediateBefore = s.slice(Math.max(0, mt.index - 60), mt.index)
          const immediateAfter = s.slice(mt.index + mt[0].length, mt.index + mt[0].length + 60)
          if (/<\w+[^>]*>\s*$/.test(immediateBefore) && /^\s*<\/\w+>/.test(immediateAfter)) continue
          // Skip if a parenthetical gloss is immediately after (≤50 chars).
          if (/^\s*\(/.test(immediateAfter)) continue
          results.push({
            index: mt.index,
            match: mt[0],
            hint,
          })
        }
      }
      return results
    },
  },

  // ── Pronoun-elision calque «на менше/ширше/меншого» without noun headword ─────
  {
    id: 'style.pronoun-elision-on-smaller',
    category: 'STYLE',
    severity: 'WARN',
    // Matches «на менше.», «на ширше,», «до меншого;» — bare predicative adjective
    // at end-of-clause with no accompanying noun. Common EN "one/ones" calque.
    //
    // Positive lookahead requires that AFTER optional whitespace the next char is
    // clause-end punctuation or end-of-string. That excludes:
    //   «меншу одиницю»         — followed by another letter-word (noun)
    //   «менше вихідне значення» — followed by another adjective
    //   «менше за 250 В»         — comparative «за X», followed by letters
    //   «менше ніж X»            — comparative, same
    // Negative lookbehind on `.` avoids matching inside decimal numbers or URLs.
    pattern: /(?<![.\p{L}])\s(на|у|в|до|з)\s+(менш[еогоийому]|більш[еогоийому]|ширш[еогоийому]|вужч[еогоийому]|кращ[еогоийому]|гірш[еогоийому])(?=\s*[.,;:!?»—]|\s*$)/giu,
    hint: 'Bare predicative adjective («на менше», «до меншого») at end-of-clause is likely a calque of EN "one/ones" pronoun elision. Name the noun explicitly: «на меншу напругу», «до меншого опору». See landmine 13.1.',
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
    // Exclude the allowed case: `<var>X</var>` for single-letter math vars,
    // and native HTML formatting tags (`<strong>`, `<em>`, `<b>`, `<i>`,
    // `<code>`, `<u>`, `<sub>`, `<sup>`, `<span>`, `<a>`, `<mark>`, `<kbd>`,
    // `<small>`, `<nowrap>`) — those aren't Radix-popped glossary tags and
    // don't suffer the tooltip-misplacement issue this rule targets. Glossary
    // tags on this project are always short lowercase custom keys (dc, ac,
    // rms, vna, ham, …).
    pattern: /<(?!(?:strong|em|b|i|code|u|sub|sup|span|a|mark|kbd|small|nowrap|var|br)\b)([a-z]+)>[^<()]{2,}\s+\([^)]+\)<\/\1>/g,
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

function runRule(rule, s, meta) {
  if (rule.match) return rule.match(s, meta)
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
    const hits = runRule(rule, value, { key })
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
