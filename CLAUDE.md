# Claude working notes for The Radio Bench

Short-form guidance to keep future work consistent. If you change a
convention here, update this file in the same commit.

## Workflow — read before starting work

### Authorization — never act on shared state without an explicit ask

- **Never `git commit` or `git push` without an explicit user request** for the specific action. Editing files, running gates, and reporting findings is fine — stop there. A user approval for one commit/push does not extend to the next one.
- **Never commit to `main`.** Create a feature branch first if HEAD is on main.
- **Never use git worktrees.** Don't pass `isolation: "worktree"` to the Agent tool; don't suggest `git worktree add`. A stray worktree once made the user's dev server serve a stale snapshot.
- **Don't start a local dev server.** User runs `npm run dev` locally; both servers fight for port 5173. Never invoke `preview_start` for this repo. If visual verification is needed, ask the user.

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

Before opening a PR or saying «done» / «ready», enumerate scripts and run them all — don't curate from memory:

```bash
jq -r '.scripts | keys[]' package.json | grep -E '^(check|lint|test|build|knip)'
# Run each match. Plus `npx tsc --noEmit` (not an npm script).
```

All must exit green. Past failure: a gate run missed `knip` (it wasn't in the curated list at the time) and shipped a PR with 5 unused exports — that's why the rule is «enumerate, don't recite».

After every `git push`, verify CI:

```bash
gh pr checks <PR_NUMBER>
gh run view <run-id> --log-failed   # if red
```

Local `npm run build` ≠ CI green. CI uses `npm ci` (strict peer deps; worked around via `.npmrc legacy-peer-deps=true`) and pins a Node version (`.github/workflows/*.yml`). Wait for CI to complete before saying «ready for review».

### Commit cadence

When the user does ask for a commit: batch related changes into one. Don't commit after every single fix — a commit is a unit of reviewable work, not a save point.

### Research resources for chapter content

WebSearch / WebFetch and two on-disk reference PDFs (ARRL Handbook 2023, The Art of Electronics 3rd ed.) are pre-authorised for chapter work. Paths and read-tool caveats live in memory: `memory/reference_research_pdfs.md`. Cite the source in commit/PR when a claim depends on either book.

## New chapter checklist

A chapter is done when ALL of these are true, not just "prose is
written":

1. **Hero illustration renders.** Never hand the user a prose-only preview with a TODO placeholder for the hero or primary widget.
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
   `npm run check:i18n-usage` to catch orphan keys too.
6. **Schematic consistency.** Every circuit diagram composed entirely from `@/lib/circuit` primitives — zero hand-drawn SVG. Detailed rules in `.claude/skills/diagram-quality/references/circuit-schematics.md`.
7. **Status flip last.** `'coming-soon'` → `'published'` in
   `src/data/chapters.ts` only after 1–6 and the full gate above
   are green.

## SVG diagrams / rough.js — use the `diagram-quality` skill

Before touching any file under `src/components/diagrams/` or `src/components/chapter-heroes/`, or any inline SVG inside a chapter page, invoke the `diagram-quality` skill at `.claude/skills/diagram-quality/`. Same when fixing a reader-reported diagram issue (font, padding, overlap, clipped labels, missing translations, scaling hacks). The skill is the source of truth — typography/padding, rough.js patterns, plotted curves, i18n-in-diagrams, common failures, and circuit schematics all live there.

## Ukrainian translation — use the `ua-translate` skill

Before translating any EN → UK content (new chapter, new widget, new diagram labels), invoke the `ua-translate` skill at `.claude/skills/ua-translate/`. Never hand-author UA, even for inline mid-conversation rewrites longer than a clause — Claude produces calques even on short sentences (ch 1.5: `найчесніше взяти нову деталь` from EN "honest move" — UA `найчесніше` reads as ethically honest, nonsense in context). The skill's SKILL.md owns the workflow (Gemini 2.5 + 3.1 Pro side-by-side via `gemini-translate.py`, Claude reviewer, linter); references/ holds glossary, landmines, style, markup. Background: Intento 2025 ranks Gemini 2.5 Pro #1 for EN→UA; Claude isn't in the top tier. Claude-only translation of ch 1.1–1.4 cost ~30 landmines per chapter; switching to Gemini-primary in ch 1.5 cut that tenfold.

**Evergreen rule.** Every time the user pushes back on a UA phrasing, decide if Gemini was right (our convention was wrong → update `references/glossary.md`) or wrong (regression → log in `SKILL.md` + add a linter rule if mechanically catchable). Never fix the same class twice across different chapters.

For genuinely one-word swaps (case fix, single glossary term) Gemini is overkill — but any rewrite touching idiom or sentence structure goes through the workflow.

## If the prose describes a circuit — the schematic goes BEFORE the prose

**PR gate.** For every new chapter and every new section in an existing chapter: inventory the circuits described in prose, and gate the PR on each having a schematic above the first paragraph that names its components. Readers without engineering backgrounds cannot build a mental circuit from prose — that's exactly what a schematic is for.

Authoring rules for circuit schematics (zero hand-drawn SVG; voltmeter not floating label; battery designator vs value; ground vs battery; coordinate-source-of-truth; junction-dot rules) live in `.claude/skills/diagram-quality/references/circuit-schematics.md`. Read it before touching any file in `src/components/diagrams/` that depicts a circuit. Working reference: `src/components/diagrams/RCChargingSchematic.tsx`.

## Writing discipline — introduce every concept before using it

**Non-negotiable rule.** Do not use any symbol, abbreviation, or domain
shorthand in chapter prose, formulas, widget labels, or worked examples
*before* it has been introduced with an explicit inline definition.

Chapter prose must stand on its own for a reader who does NOT share the
specific sub-domain background (ham radio / RF / embedded / DSP). If
the author has to pause and think "a beginner would not get this", the
sentence needs rewriting.

Failure modes (full catalogue + worked examples in `memory/feedback_first_mention_explicitness.md` — run that checklist before drafting any new section):

- **Math symbols** — every `<var>X</var>` defined in prose with meaning + units before its first formula use.
- **Abbreviations** (HT, QRP, HF, UHF, AM, FM, SSB, CW, VNA…) — expand inline on first appearance.
- **Band-wavelength shorthand** (`2 m`, `70 cm`) — expand to «VHF ≈144 MHz» / «UHF ≈435 MHz» on first use.
- **`вище` / `above`** as quantity reference — name the SOURCE (`the calculator gives…`), not the textual position.
- **Ambiguous comparatives** on components — attach to the QUANTITY (`resistor with lower resistance`), not the part.
- **Bare generic nouns** (`значення`, `рівень`, `параметр`, `величина`) — always qualify (`значення опору`).
- **Vague back-reference pronouns** (`те саме`, «it», «that», «the same») — rewrite concretely, name the partners.
- **«Three numbers / these two values»** when fewer are visible — name the quantities instead.
- **Spatial direction as pedagogical scaffolding** — only when the diagram is on screen AND the direction isn't load-bearing. Teach the dimensional rule first; spatial metaphor is a mnemonic, never the primary explanation.

## Don't cargo-cult — verify rendered output before copying a pattern

When adopting a label string, SVG attribute, or `<Trans>` map from another file, look at the rendered output before committing the copy. Two ch 1.5 examples: `value="V_in"` rendered with a literal underscore in both source and copy; `<em>` was bug-styled to look like a glossary term and got copy-pasted everywhere. «It's in the codebase» ≠ «it works.»

## i18n authoring discipline

Markup conventions (subscripts inside `<var>X_{…}</var>`, `<G>` vs `<strong>` vs `<em>`, `<Trans>` placeholder parity, no HTML entities — the last is now enforced by `check:i18n`) live in `.claude/skills/ua-translate/references/markup.md`. Per-locale label-width budgeting for SVG diagrams lives in `.claude/skills/diagram-quality/references/typography-and-padding.md`. Read those before authoring i18n strings. The two rules below stay here because they cross-cut the whole codebase.

### Unit symbols live in `units.*`, not inline

`src/i18n/locales/{en,uk}/ui.json` exposes a top-level `units` namespace (`hz`, `khz`, `mhz`, `w`, `mw`, `uw`, `kw`, `nw`, `pw`, `fw`, `db`, `dbm`). Use `t('units.<key>')` everywhere a unit symbol would otherwise be a string literal — never inline `kHz` / `dBm`. When adding a new unit family (currents, lengths, times), extend the namespace before the first use.

### When you spot a hardcoded string, audit the WHOLE widget

The recurring failure was fixing only what the user screenshot, then missing siblings in the same widget. After any unit-symbol fix, grep the file for `Hz` / `dB` / `mW` / `µ` and convert every occurrence in one pass; then check sibling widgets in the same chapter.

## Lab activity content

- **Battery preference is AA (1.5 V), not 9 V.** AA cells are universally available and cheap; 9 V batteries are a niche format in many countries. Ratio-based experiments work just as well at 1.5 V — switch the multimeter to the 2 V range / autorange for three decimal places of resolution.
- **Card primitives**: `LabActivity` (and any new sibling) must apply `not-prose` on the wrapper plus explicit `text-foreground` / `text-card-foreground` on body text — the chapter wrapper's prose styles otherwise dominate. The bullet-flex pattern (`flex items-start gap-2 leading-6`, `shrink-0` marker, `flex-1 min-w-0` text) is already encoded in `src/components/lab/LabActivity.tsx`; copy from there for new card types.

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
- **Decimal separator** in Ukrainian is a **comma**, not a period: `1,55 В`, `−2,5 дБ`, `0,1`. Every numeric value in `uk/ui.json` follows this. For runtime-generated numbers (widget output, SVG tick labels, anything involving `.toFixed()`), use `formatDecimal` / `formatNumber` from `src/lib/format.ts` — its JSDoc covers the rules including the `<input type="number">` caveat (inputs need raw `.toFixed()` with a period; the helpers are display-only). Section numbers (`Розділ 0.2`, `3.3`) keep the period — they're IDs, not decimals.

## Other recurring conventions

- **Test pairs**: every interactive widget needs a `*.test.tsx` next to it using `renderWithProviders` from `src/test/render`. dB / numeric outputs use `.toFixed(2)` — assert on that exact format (`"20.00"`, not `"20"`).
- **Glossary terms**: wrap first occurrence of each technical term in `<G k="termKey">` so the tooltip works. Don't sprinkle `<G>` on every occurrence — once per chapter section is enough. Markup details (`<G>` tag span, `<Trans>` placeholder parity) live in `.claude/skills/ua-translate/references/markup.md`.
- **Chapter status**: flip `'coming-soon'` → `'published'` in `src/data/chapters.ts` only after the full pre-PR gate (see top) is green.
