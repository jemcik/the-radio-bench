# Claude working notes for The Radio Bench

Short-form guidance to keep future work consistent. If you change a
convention here, update this file in the same commit.

## Workflow — read before starting work

### Per-edit i18n gate — run after EVERY i18n string edit (not just pre-PR)

**Non-negotiable after any change to `src/i18n/locales/**/ui.json`.** Most recurring
pain has been: I edit a string, say «готово», and the user catches a landmine
class we've already addressed 3+ times — em-dash before math variable, raw `<`
comparison, bare generic noun, `<em>` on a technical term without tooltip, etc.
Memory notes alone do not prevent this. Running the linter does.

```bash
# After ANY edit to a chapter's i18n block:
node .claude/skills/ua-translate/scripts/lint-ua-translation.mjs src/i18n/locales/uk/ui.json ch{N}_{M}
```

Must exit with **0 errors** before saying "готово", "виправлено", or equivalent.
The linter catches:
- `forbidden.emdash-before-math-var` — «— <var>X</var>» pattern (minus-sign confusion)
- `forbidden.raw-lt-gt-in-i18n` — raw `<` / `>` as comparison (renders as `&lt;`)
- `forbidden.playground-verbs` — дитячі дієслова на величинах («гойдається»)
- `forbidden.miryaty-measure` — розмовне «міряти» замість «вимірювати»
- `forbidden.raza-multiplier` — «у √2 раза» (русизм)
- `forbidden.personify-quantity` — «спокійна напруга»
- `forbidden.pry-verbal-noun` — «при + віддієслівний іменник» (русизм)
- `forbidden.oscilogram-generic` — «осцилограма» для generic waveform
- …and ~25 more. Every user-flagged landmine that can be mechanically detected
  should end up here — if you see a new recurring class, add a rule.

**After EVERY text-level edit** (adding a new callout, rewriting a paragraph,
changing a quiz answer — not just bulk translation), run the linter for the
affected block. Pasting/editing by memory doesn't scale — the machine remembers
so you don't have to.

### Pre-PR quality gate — non-negotiable

Before opening a PR for a new chapter, a batch of significant changes,
or any work the user hints is "done" / "ready", run the **full** gate.
Don't curate scripts from memory — list every quality-check script in
`package.json` and run them all:

```bash
jq -r '.scripts | keys[]' package.json | grep -E '^(check|lint|test|build|knip)'
# Then run each. Currently:
npm run lint
npx tsc --noEmit
npm run knip              # dead-code / unused-export sweep — DON'T SKIP
npm run check:i18n
npm run check:i18n-usage
npm run check:uk
npm run check:gitignore
npm test
npm run build
```

All must be green. If any fails, stop and fix before continuing.
Past failure: a gate run missed `knip` (not in Claude's memory set)
and shipped a PR with 5 unused exports + 1 unused file.

**After every `git push`**, verify CI actually passes:

```bash
gh pr checks <PR_NUMBER>
gh run view <run-id> --log-failed   # if red
```

Local `npm run build` ≠ CI green. Two common CI-only failure modes on
this repo:

1. **`npm ci` peer-dep strictness** — CI uses `npm ci`, which rejects
   mismatched `peerDependencies`. Worked around via `.npmrc` with
   `legacy-peer-deps=true`.
2. **Node-version drift** — CI pins one Node version (see
   `.github/workflows/*.yml`); local Node may be newer.

Wait for CI to complete before telling the user "ready for review".

For new chapters / large refactors, also delegate an agent review
covering: UK translation quality, EN↔UK consistency, i18n completeness
(see "New chapter checklist" below), test coverage, prose promises
paid off, schematic conventions. Report findings first — don't
silently apply every suggestion.

### Don't start a local dev server

The user runs `npm run dev` locally. Both servers fight for port 5173
and any screenshot I take reflects my instance, not theirs. If visual
verification is needed, ask the user to screenshot or describe.
Never invoke `preview_start` for this repo.

### Never use git worktrees

Don't pass `isolation: "worktree"` to the Agent tool; don't suggest
`git worktree add`. A stray worktree once made the user's dev server
serve a stale snapshot missing Ch 1.1 + uncommitted edits. Work
directly in the main checkout.

### Commit cadence

Batch related changes into one commit. Don't commit after every
single fix — the user has flagged this. A commit is a unit of
reviewable work, not a save point.

### Research resources for chapter content

When working on chapter content (new chapter, expanding a section,
adding a widget, fact-checking prose), these resources are
pre-authorised — use them without asking:

- **Web search / WebFetch** — for current specs, part datasheets,
  regulator pages (ITU, FCC, УДЦР), Wikipedia reality-checks, modern
  prices, etc. The user expects this to be part of chapter work.
- **The ARRL Handbook for Radio Communications 2023** (100th edition):
  `/Users/jemcik/Downloads/ham_26/ARRL handbook 100th/The ARRL Handbook for Radio Communications 2023.pdf`
  — canonical reference for ham-radio topics, band plans, propagation,
  antennas, operating practice.
- **The Art of Electronics** (Horowitz & Hill, 3rd ed.):
  `/Users/jemcik/Downloads/The Art of Electronics/The Art of Electronics.pdf`
  — canonical reference for circuit fundamentals, component behaviour,
  instruments, signals. Use when deriving or double-checking any
  quantitative claim about electronics.

Both PDFs are large — always pass `pages: "N-M"` to `Read` (max 20
pages per call) and prefer targeted section reads over scanning the
table of contents cold. When a claim in the chapter depends on either
book, cite the source in the commit message / PR description so the
user can verify.

## New chapter checklist

A chapter is done when ALL of these are true, not just "prose is
written":

1. **Hero illustration renders.** Never hand the user a prose-only
   preview with a TODO placeholder for the hero or primary widget.
   The user has caught this twice — no more incomplete previews.
2. **Visual density throughout.** Every section has something to look
   at — widget, illustration, magnitude scale. A chapter that's 2/3
   prose before the first visual fails review. Plan visuals at
   outline time, not after prose is written.
3. **Five i18n touchpoints**, each in BOTH `en/ui.json` AND
   `uk/ui.json`:
   - `chapterTitles.{id}`
   - `chapterSubtitles.{id}`
   - `ch{id}.*` translation block
   - New glossary terms in `glossary.*`
   - New unit symbols in `units.*`

   `chapterTitles` / `chapterSubtitles` are separate namespaces that
   silently fall back to English via `defaultValue` when missing —
   parity scripts can't catch that. Cross-check manually.
4. **Test pairs.** Every interactive widget has a `*.test.tsx`
   sibling using `renderWithProviders` from `src/test/render`.
   Numeric outputs asserted on the exact `.toFixed(2)` format
   (`"20.00"`, not `"20"`).
5. **Prose promises paid off.** Read top-to-bottom for phrasings like
   `"The … table:"` / `"The … diagram:"` — every such promise has
   the referenced artefact actually rendered. Run
   `node scripts/check-i18n-usage.mjs` to catch orphan keys too.
6. **Status flip last.** `'coming-soon'` → `'published'` in
   `src/data/chapters.ts` only after 1–5 and the full gate above
   are green.

## SVG diagrams / rough.js illustrations — use the `diagram-quality` skill

**Before touching any file in `src/components/diagrams/`,
`src/components/chapter-heroes/`, or any inline SVG inside a chapter
page**, invoke the `diagram-quality` skill at
`.claude/skills/diagram-quality/`. Also invoke when fixing a
user-reported diagram issue (font too small, padding wrong, components
overlapping, labels clipped, missing translations, scaling hacks).

The skill's `SKILL.md` holds an 8-point pre-flight checklist and a
5-stage workflow. Its `references/` directory covers:

- `roughjs-patterns.md` — wrapper surface, seed hierarchies, tonal
  grouping, helper-function rule, fill-vs-stroke decisions
- `typography-and-padding.md` — 13 px on-screen floor, `PAD_L`/`PAD_R`
  math with EN/UK worst-case budgeting, label-collision handling, the
  no-scaling rule
- `plotted-curves.md` — `useId` + `clipPath` boilerplate, truncate-at-
  boundary (don't clamp) for functions that leave the plot rectangle
- `i18n-in-diagrams.md` — every visible word comes from `t(...)`, units
  from `units.*`, math variables via `<var>` + `<MathVar />`, in-SVG
  math via `<tspan>`, aria-labels required
- `common-failures.md` — numbered catalogue of every diagram issue
  we've caught, with fix pattern and "how to avoid repeating". Extend
  it whenever a new class of failure is flagged.

The top-level Ch 1.1 rules (no scaling, 13 px floor, seed hierarchy,
`svgTokens` for theme, `<g style={{ color: ... }}>` wrapper for rough
paths, plain helper functions not inner components, translate whole
widgets never piecemeal) all live in the skill. This file is no longer
the source of truth for diagram work — the skill is.

## Ukrainian translation — use the `ua-translate` skill

**Before translating any EN → UK content** (new chapter, new widget, new diagram labels), invoke the `ua-translate` skill at `.claude/skills/ua-translate/`. Never translate inline key-by-key.

The skill runs six stages:
1. Load glossary + landmines + style refs
2. Primary translation via briefed agent
3. **Parallel critique** — 5 specialist agents in one spawn (fluency / technical / consistency / calques / grammar)
4. Consolidate findings + apply high-confidence auto-fixes
5. Automated lint: `npm run check:uk` (fails on mechanical errors — English leftovers, decimal periods, Latin units, forbidden words, capitalised `Ви`, `<i>I</i>` for math vars)
6. Present only non-obvious decisions to the user

Every time the user pushes back on a specific Ukrainian phrasing, extend `.claude/skills/ua-translate/references/landmines.md` (and, where detectable, the linter). The skill gets smarter per chapter instead of repeating the same 30-issue round-trip.

**Linter CLI**: `npm run check:uk` scans the whole `uk/ui.json`. Scope to one chapter: `node .claude/skills/ua-translate/scripts/lint-ua-translation.mjs src/i18n/locales/uk/ui.json ch1_1`.

## Writing discipline — introduce every concept before using it

**Non-negotiable rule.** Do not use any symbol, abbreviation, or domain
shorthand in chapter prose, formulas, widget labels, or worked examples
*before* it has been introduced with an explicit inline definition.

Chapter prose must stand on its own for a reader who does NOT share the
specific sub-domain background (ham radio / RF / embedded / DSP). If
the author has to pause and think "a beginner would not get this", the
sentence needs rewriting.

Typical failure modes (user has flagged all of these in Ch 1.2 alone):

- **Math symbols** — `Q` used in a widget's formula hint before prose
  introduces charge. Every `<var>X</var>` in a widget or MBlock must be
  defined in prose first, with its meaning and units.
- **Abbreviations** — `HT`, `QRP`, `HF`, `UHF`, `AM`, `FM`, `SSB`, `CW`,
  `VNA` etc. First appearance → inline expansion in parens or apposition.
- **Band-wavelength shorthand** — `2 m / 70 cm` is ham-radio jargon for
  the VHF (≈144 MHz) and UHF (≈435 MHz) amateur bands. First appearance
  → expand: "2 metres (the VHF amateur band, around 144 MHz) and 70
  centimetres (UHF, around 435 MHz)".
- **Back-reference to a quantity with `вище` / `above`** — `R_min вище`
  reads as "higher" (comparative), not "mentioned above in text". Name
  the SOURCE of the quantity (`the calculator gives…`, `the formula
  above gives…`) instead of its textual position.
- **Ambiguous comparatives on components** — `менший резистор` /
  "smaller resistor" defaults to physical-size reading. Attach the
  comparative to the QUANTITY: "resistor with lower resistance",
  `резистор з меншим опором`, `конденсатор більшої ємності`.
- **Bare generic nouns** — `значення` / `рівень` / `параметр` /
  `величина` without a qualifier. Always attach the domain noun:
  `значення опору`, `рівень напруги`, `номінал резистора`.
- **Vague back-reference pronouns** — `те саме`, `для неї`, `це все`,
  "it", "that", "the same" — rewrite concretely, naming the partners
  and the relationship.
- **"Three numbers / these two values"** when fewer are visible on the
  page — name the QUANTITIES instead: `напруга, сила струму й
  потужність`.

Full catalogue of the pattern + prevention checklist in memory at
`memory/feedback_first_mention_explicitness.md`. **Run that checklist
before drafting any new section.**

## i18n discipline — translate WHOLE widgets, never piecemeal

The single most repeated failure across ch0.3 and ch0.4 was leaving
unit symbols and short strings hardcoded in English. The user would
screenshot one missed string; I'd fix that one; the next screenshot
caught a sibling I missed in the same widget. Don't do that.

### Unit symbols live in `units.*`, not in widget code

`src/i18n/locales/{en,uk}/ui.json` has a top-level `units` namespace
with: `hz`, `khz`, `mhz`, `w`, `mw`, `uw`, `kw`, `nw`, `pw`, `fw`,
`db`, `dbm`. Use them everywhere a unit symbol would otherwise be a
string literal:

```tsx
const tUnit = useCallback((k: string) => t(`units.${k}`), [t])
// then
return `${value} ${tUnit('khz')}`           // not `${value} kHz`
return mode === 'dbm' ? tUnit('dbm') : tUnit('db')   // not 'dBm' / 'dB'
```

If you're using `tUnit` inside a `useMemo` dep list, wrap it in
`useCallback` first so the memo doesn't recompute on every render.

When adding a new unit family (currents in mA/µA, lengths in m/cm/mm,
times in s/ms/µs/ns), extend the `units` namespace before the first
use — don't inline it "just this once."

### When you spot a hardcoded string, audit the WHOLE widget

Don't fix only what was screenshot. Open the file, `grep` for any of
the unit family characters (`Hz`, `dB`, `mW`, `µ`, …), and convert
every occurrence in one pass. Then check sibling widgets in the same
chapter — they're likely to share the same problems.

### Per-locale geometry budget for SVG diagrams

Ukrainian renders ~30–60 % wider than English. `відношення` is 10
chars vs `ratio`'s 5; `(відносно 1 мВт)` is 16 chars vs `(vs 1 mW)`'s
9. Compute your `PAD_L` (and any internal column widths) against the
**worst-case translation**, not the English original. Document the
math in a comment block:

```tsx
//   EN main: "ratio" / "watts"  — 5 chars × ~7.5 px @ 14 sans  ≈ 37 px
//   UK main: "відношення"        — 10 chars × ~7.5 px           ≈ 75 px
//   EN sub:  "(vs 1 mW)"         — 9 chars × ~5.5 px @ 11       ≈ 50 px
//   UK sub:  "(відносно 1 мВт)"   — 16 chars × ~5.5 px           ≈ 88 px
// Worst case is the UK sub-label at 88 px → PAD_L ≥ 88 + gutter
```

Re-budget every time you add or rename a label.

### `<Trans>` for any inline component, in EVERY locale

When wrapping a glossary term inside a sentence, both locale files get
the component placeholder. Easy to forget the second locale and have
half the readers see literal `<ham>ham</ham>` in their UI:

```jsonc
// en/ui.json
"shortcutTip": "Every <ham>ham</ham> in the world …",
// uk/ui.json  ← MUST also have <ham>…</ham>
"shortcutTip": "Кожен <ham>радіоаматор</ham> у світі …",
```

Then the chapter file uses `<Trans i18nKey="…" components={{ ham: <G k="ham radio" /> }} />`.
Run `node scripts/check-i18n.mjs` after every locale edit — it catches
parity mismatches but not placeholder mismatches, so a manual diff
of the two files is still required when you add component placeholders.

## Lab activity content

- **Battery preference is AA (1.5 V), not 9 V.** AA cells are
  universally available and cheap; 9 V batteries are a niche format
  in many countries. All ratio-based experiments work just as well at
  1.5 V — only the absolute voltages on the multimeter shift. Tell the
  reader to switch to the 2 V range / autorange so they get three
  decimal places of resolution.
- **Lab activity card is `not-prose`.** The chapter wrapper applies
  prose styles (padding-left on `ul`, list-style discs, `card-foreground`
  text color) that fight with the lab card's own design system. The
  outer `<div>` of `LabActivity` already has `not-prose`; if you build
  a similar card primitive, do the same. After opting out of prose,
  set explicit `text-foreground` (or another foreground token) on body
  text — `text-teal-700 dark:text-teal-300` and similar paired colors
  read as washed-out without the prose color override they relied on.
- **Bullet/text alignment in flex lists.** Pattern is
  `<li className="flex items-start gap-2 leading-6">` with the marker
  span `shrink-0` (no `mt-*` nudge — `leading-6` aligns the baseline)
  and the text span `flex-1 min-w-0` (so wrapping hangs correctly).

## Glossary entries — describe WHO/WHAT directly

When a term refers to a person (or any concrete noun the reader can
point at), the `tip` must answer "what is this thing" in the first
clause. Example: `ham` is a person, so `tip` opens "A ham is a
licensed amateur radio operator…", not "Amateur radio is the activity
of…". The reader clicked on a noun; lead with the noun.

`see` references are first-class — every new entry should link to at
least one related term so the tooltip's "see also" chain works.

## Ukraine-specific facts

- **Amateur radio callsigns** in Ukraine are issued by **УДЦР**
  (Український державний центр радіочастот / Ukrainian State Centre
  of Radio Frequencies, a.k.a. UCRF). УДЦР is the licensing body;
  the regulator ABOVE УДЦР is **НКЕК** (Національна комісія, що
  здійснює державне регулювання у сферах електронних комунікацій,
  радіочастотного спектра та надання послуг поштового зв'язку) —
  НКЕК replaced НКРЗІ in 2022. If you need to mention the regulator,
  use НКЕК (not НКРЗІ). Any glossary entry, lab callout, or prose
  about the licensing process must use УДЦР for the issuing body.
- **Decimal separator** in Ukrainian is a **comma**, not a period:
  `1,55 В`, not `1.55 В`. Every numeric value in `uk/ui.json` should
  follow this — including dB values (`−2,5 дБ`), ratios (`0,1`),
  voltages, frequencies, etc.

  For numbers generated at runtime (widget results, SVG tick labels,
  cutoff readouts, anything involving `.toFixed()`), use the helpers in
  `src/lib/format.ts`:

  ```tsx
  import { formatDecimal, formatNumber } from '@/lib/format'
  const { t, i18n } = useTranslation('ui')
  const locale = i18n.language

  // Fixed width:   "20.00" / "20,00"
  formatDecimal(20, 2, locale)
  // Natural width: "2.5" / "2,5"   (trailing zeros trimmed)
  formatNumber(2.5, locale)
  ```

  **CRITICAL**: do NOT feed localized strings back into an HTML
  `<input type="number">` — that element requires the canonical machine
  format (period, no grouping) regardless of the page's display locale,
  and will wipe the value to empty otherwise. Pattern is:

  - Keep a machine-format string (`n.toFixed(2)`, period) in state and
    use it as the `<input>` value.
  - At the render point of any read-only display (ResultBox, SVG text,
    span), call `formatDecimal(rawNumber, digits, locale)` to produce
    the localized variant.

  Section numbers (`Розділ 0.2`, `3.3`) stay with a period — those are
  IDs, not decimals.

## Other recurring conventions

- **Branch discipline**: never commit to `main`. Create a feature
  branch (`chapter-0-X`, `fix-something`, …) before any edit.
- **Test pairs**: every interactive widget needs a `*.test.tsx` next to
  it using `renderWithProviders` from `src/test/render`. dB / numeric
  outputs use `.toFixed(2)` — assert on that exact format
  (`"20.00"`, not `"20"`).
- **Glossary terms**: wrap first occurrence of each technical term in
  `<G k="termKey">` so the tooltip works. Don't sprinkle `<G>` on every
  occurrence — once per chapter section is enough.
- **Glossary tag span**: keep the `<G>` wrapper tight around the
  abbreviation or canonical term only — never wrap a long parenthetical
  expansion too. `<vna>VNA (Vector Network Analyser)</vna>` makes the
  Radix popper measure the wrapped union of the whole phrase and
  position the tooltip off-screen; `<vna>VNA</vna> (Vector Network
  Analyser)` anchors to the abbreviation alone.
- **Schematic coordinates — one source of truth**: every component's
  `(x, y)` lives in a single `const NAME = { x, y }` object.
  `pins2(NAME.x, NAME.y, …)` and `<Component {...NAME} />` both derive
  from it. Never duplicate literal coordinates between pin helpers and
  JSX render — editing only one side causes silent drift (wires end at
  the new pin, symbol body drawn at the old position, and no test
  catches it).
- **Chapter status**: flip `'coming-soon'` → `'published'` in
  `src/data/chapters.ts` only after the full pre-PR gate (see top)
  is green.
- **No HTML entities in i18n JSON**: `&quot;`, `&amp;`, `&nbsp;`
  render verbatim through react-i18next. Use real characters — curly
  quotes `"…"` / `«…»`, a real non-breaking space, etc.
- **Schematic junction dots**: only at real T-junctions (three or
  more wires meeting). Never at a corner bend, never at a phantom
  two-wire crossing.
