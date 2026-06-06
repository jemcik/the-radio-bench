---
name: ua-translate
description: Translate Radiopedia chapter content from English to Ukrainian using Gemini Pro (primary translator) + Claude (analyst/reviewer) + mechanical linter. This is the MANDATORY workflow — the old Claude-only 6-agent pipeline is deprecated because it produced unreadable UA prose that required 30+ round-trips with the user to clean up. Use when translating any `ch*` i18n block.
---

# Ukrainian translation skill — Gemini-primary workflow

The **goal**: when the user sees the Ukrainian translation, it reads as if it were originally written in Ukrainian by a technically-literate native speaker — not translated from English. Zero calques. Zero English leftovers. Zero gender-agreement bugs after edits.

## Why this approach, not the old one

Claude is not the best LLM for Ukrainian translation. Intento's 2025 "State of Translation Automation" benchmark found **Gemini 2.5 Pro leads on EN→UA** — Claude doesn't even make the top tier for Ukrainian. When we ran Claude as primary translator for ch 1.1–1.5, the user caught ~30 landmines per chapter across multiple review rounds; each correction took the chapter further from shippable.

Switching to Gemini as primary + Claude as reviewer + mechanical linter cut the round-trip cost roughly tenfold on ch 1.5.

**This skill is invoked for every `ch*` block.** Do not fall back to the old Claude-agent pipeline even if it still appears in critique briefs under `critiques/` — those remain only as reference material for what to scan for.

---

## Prerequisites

- `.env.local` at the repo root contains `GEMINI_API_KEY=...`
- The project's Google Cloud account has **Paid Tier** enabled on the Gemini API (Pro-model free-tier quota = 0). Cost: ~$0.10–0.15 per chapter section ≈ $5 for the whole course. Billing page: [console.cloud.google.com/billing](https://console.cloud.google.com/billing).
- Models in use:
  - **`gemini-2.5-pro`** — stable workhorse, best on technical UA physics terminology
  - **`gemini-3.1-pro-preview`** — strongest on complex conceptual paragraphs (inversion descriptions, parallel constructions, participial clauses)
  - Flash models — available but lower quality; skip for chapter translation

---

## Workflow — 5 stages. Do NOT skip stages.

### Stage 0 — Fact-check EN prose before translating

**New as of ch 1.5 post-mortem.** Translators (Gemini OR Claude) do NOT reason about arithmetic, and they do NOT notice missing-how-to instructions. Before running stage 1 for any batch, scan the EN keys for:

**(a) Quantitative claims that don't compute:**
- Does the claim match the widget's achievable range?
- Do the two numbers in parallel prose (e.g. «at 1 kHz → 160 Ω; at 1 MHz → 0.16 Ω») actually compute?
- Do adjacent paragraphs in the SAME section give consistent numbers? (ch 1.5 shipped with «hectares» in prose contradicting «dinner table» in the widget hint — both in EN — because no one computed A = C·d/ε₀ during authorship.)
- Do counterfactual framings («current would be X if…») actually need the counterfactual? ch 1.5 `rcIntro` shipped «current would be infinite at the first instant if the cap were a short» — double-wrong: at t=0 the discharged cap IS a short (that's not a hypothetical), and with R in series the current is V_in/R (finite). Scrub any «would be X if Y» clause where Y is actually true at that time — it confuses the reader who notices the contradiction.

**(b) «Do X with Y» instructions missing the HOW:**
- Any sentence of the form «measure it with a multimeter», «debounce the switch», «check the polarity», «verify the datasheet rating» should either (i) explain the procedure inline, (ii) link to a widget/section that demonstrates it, or (iii) be rewritten as a qualitative statement («polarity matters — here's how to identify it: stripe = negative, longer lead = positive»). A bare directive without method is bookkeeping, not teaching. ch 1.5 shipped with «виміряйте мультиметром перед тим, як подавати живлення» — no instructions for what mode or what the meter should show. Every directive of this kind should survive the reader asking «how exactly?».

If you find either class of discrepancy, **fix the EN first**, then translate. Translators cannot catch either bug.

### Stage 1 — Decide the batch

Chapter blocks are large (ch 1.5 had 185 keys). Translate in **logical sections**, not the whole chapter at once. Standard sections:

1. `intro` + `introPreview` (2 keys) — always first; establishes style anchor for the rest
2. §1 concept intro (e.g. `sectionWhatItIs`, `whatItIsIntro`, etc. — 4–6 keys)
3. §2 details (4–6 keys)
4. … one logical section per batch, normally 3–12 keys
5. `Summary` section (sectionSummary + keyTakeaway1..5, 6 keys)
6. `Lab` section (labGoal + labEquip + labComp + labStep + labTrouble, 15–20 keys)
7. `Quiz` — split into two halves (Q1–Q4, then Q5–Q8), each batch ~25 keys
8. `widget.*` subtree — run once as a whole object (~28 keys)

Section-by-section lets the user review without drowning, AND lets Claude/user pick model per key (2.5 Pro vs 3.1 Pro).

### Stage 2 — Run Gemini side-by-side

Always call BOTH models; they have different strengths. The script is `scripts/gemini-translate.py`:

```bash
python3 .claude/skills/ua-translate/scripts/gemini-translate.py \
    ch1_6 sectionGeometry geometryIntro geometryVars
```

The same script handles nested subtrees: `python3 scripts/gemini-translate.py ch1_6 widget` translates the whole `widget.*` subtree as one call and returns nested JSON. Outputs land in `/tmp/gemini-section/widget_2.5_Pro.json` etc. No separate widget-only script needed.

The scripts:
- Load `GEMINI_API_KEY` from `.env.local` silently (never echo)
- Attach the project glossary (`references/glossary.md`) AND a curated landmine summary to the system prompt
- Attach already-translated `intro` + `introPreview` as a **style anchor** so the model matches the chapter's voice
- Write outputs to `/tmp/gemini-section/<first-key>_2.5_Pro.json` and `_3.1_Pro.json`

### Stage 3 — Claude-led side-by-side analysis

Claude (the main agent in the session) reads the three candidates per key:
1. Current Claude translation in `uk/ui.json` (if exists)
2. Gemini 2.5 Pro output
3. Gemini 3.1 Pro output

…and for each key recommends which to apply, with brief justification. Checks specifically for:

- **Mix at the SENTENCE level, not per-key wholesale — this is the whole point of running both models.** A multi-sentence key almost never has one model strictly better on every sentence. Do NOT grab the entire key from the model that wins on one sentence: read EACH sentence of the key against both candidates and assemble the best per sentence. **ch 2.3 failure (user-flagged):** I took all of `intro1`+`intro2` from 3.1 Pro because 3.1 had the correct «обвідної» in `intro2` (2.5 had the «огинаючої» landmine there) — and shipped 3.1's clumsy `intro1` opener «Ви називаєте **її** «100-ватною» **радіостанцією**» (cataphoric pronoun + the noun it names). **2.5 Pro had already produced the clean opener** «Ви називаєте свою радіостанцію «100-ватною».» — verbatim what the user wanted. Gemini gave the right sentence; I picked the wrong model wholesale and never compared the openers. The fix was never to hand-write anything (which separately broke the no-hand-authoring rule) — it was to take 2.5's `intro1` sentence + 3.1's `intro2` sentence. When two candidates of the same key diverge on a sentence, that divergence IS the signal to stop and choose per sentence.
- **Conflicts with our glossary / landmine registry** (flag regressions)
- **Subscript integrity**: Gemini 2.5 Pro sometimes regresses `V_in` → `V_вх`, `f_c` → `f_зр` (Cyrillic). Keep Latin per our convention.
- **Component noun regressions**: Gemini sometimes uses «висновок» for leads instead of «вивід» (Q6 of ch 1.5 quiz) — keep «вивід».
- **Terminology regressions**: «розрядний» (Gemini) vs «розряджувальний» (our Wikipedia-backed convention); «експоненціальний» vs «експоненційний» (Wikipedia prefers the latter).
- **Landmine traps**: bare comparative on component («менший резистор»), playground verbs («покладіть» for placement), anthropomorphism («шум бачить»), «з підступом» for EN "the catch".
- **Cases where Gemini catches OUR past mistakes**: «налаштований контур» → «коливальний контур», «електронні роботи» → «в електроніці», etc. — apply the fix.

Present recommendations as a table:

```
| Key | Recommendation | Why |
|---|---|---|
| ... | 2.5 Pro | best physics term («синфазно») |
| ... | 3.1 Pro | cleaner inversion («міняються місцями») |
| ... | KEEP Claude | preserves user-requested expansion |
| ... | 2.5 Pro + manual fix | «розрядний» → «розряджувальний» |
```

Explicitly list conflicts-with-rules so the user can override.

### Stage 4 — User approval and apply

User says «застосувати», Claude applies via Python script:

```python
for key, src in plan:
    uk['ch1_5'][key] = src[key]

# Manual fixes for known Gemini regressions:
# - V_вх → V_in (if any)
# - розрядний → розряджувальний
# - (datasheet) gloss → specифікація
# - раw `<` / `>` → «менше за» / «більше за»
```

### Stage 5 — Mechanical linter + per-batch check

After EVERY batch apply, ALWAYS run:

```bash
node .claude/skills/ua-translate/scripts/lint-ua-translation.mjs \
    src/i18n/locales/uk/ui.json ch<N>_<M>
```

Exit code must be 0 (errors). Warnings for `style.unglossed-canonical-term` on «зміщення» in a DC-bias / capacitor context are domain-legitimate false positives.

Common lint-triggered fixes:
- `forbidden.emdash-before-math-var` — em-dash right before `<var>X</var>` reads as a minus; replace with colon or restructure.
- `forbidden.raw-lt-gt-in-i18n` — replace `< 1 %` with «менше за 1 %».
- `forbidden.pry-verbal-noun` — replace «при навантаженні» with «для навантажень» / «за навантаження».
- `forbidden.dodatny-polarity` (ERROR) — replace «додатний вивід» with «позитивний вивід».
- `forbidden.playground-placement` / `forbidden.postavte-component` — replace «покладіть»/«поставте» with «розмістіть»/«увімкніть».

---

## Known Gemini regressions to watch for

| Pattern | Who does it | Fix |
|---|---|---|
| `V_in` → `V_вх` (Cyrillic subscript) | 2.5 Pro | Manual: keep Latin |
| `f_c` → `f_зр` | 2.5 Pro | Manual: keep Latin |
| «ESR» → «ЕПС» | 2.5 Pro | Manual: keep Latin |
| «розряджувальний резистор» → «розрядний» | Both | Manual: keep «розряджувальний» (Wikipedia-canonical) |
| «вивід» → «висновок» (component lead) | 3.1 Pro in some contexts | Manual: keep «вивід» |
| `<coupl>Розділювальний конденсатор</coupl>` → `<coupl>Міжкаскадний зв'язок</coupl>` | Both | Accept if EN structure matches (concept-based) |
| «осцилограма» for generic waveform | 3.1 Pro sometimes | Manual: «форма сигналу» / «ескіз сигналу» |
| «(datasheet)» gloss | 2.5 Pro sometimes | Manual: «специфікацією» (glossary-canonical) |
| «1 µF brick» → «цеглина» (not diminutive) | Both | Accept «цеглинка» (diminutive); reject «цеглина» |
| «permittivity of free space» → «електрична стала» (bare SI name, erasing pedagogical link) | Both | Keep «діелектрична проникність вакууму» as primary noun; «електрична стала» may appear as parenthetical SI-synonym. The reader needs εᵣ ↔ ε₀ connection visible. See glossary. |
| «forward bias» / «reverse bias» → «пряме/зворотне ввімкнення» | 3.1 Pro consistently (4× in ch 1.11) | Manual: replace with «пряме/зворотне зміщення» (Wikipedia-canonical UA EE term, matches project usage in `varactorTunerCaption`, `energySparkCalloutMechanism`, glossary `base.detail`, `jfet.detail`). «ввімкнення» literally means "switching on" — describes wiring, not the physics. 2.5 Pro usually picks «зміщення» correctly. |
| «несуча» (carrier) → non-word «несна / несної / несну / несній» | Both (2.5 in ch 2.2 quiz + amPower; 3.1 throughout) | Manual: keep «несуч-». «несн-» is **not a Ukrainian word** and slips every gate (it's a plausible-looking adjective). Caught only by beginner-review in ch 2.2. Scan re-translations for `несн` — but do NOT add a blanket linter rule: «несн-» legitimately appears in «несн**ий** елемент» (load-bearing element, `folded dipole` glossary). |
| «envelope» → «огинаюча» (also a `-юча` participle landmine) | 2.5 Pro (ch 2.2 `amP4`) | Manual: keep «обвідна» (glossary `envelope` _name, used in `amP1`/`amExplorer`). |
| «carrier» → «носій / носія» (only in one section) | 2.5 Pro (ch 2.2 `fmP1`, `fmExplorer.description`) | Manual: keep «несуча». «носій» reads as a generic medium and breaks consistency with the `<car>` glossary term used everywhere else. |
| Cyrillic mode/band abbreviations «АМ/ЧМ/КХ/УКХ/ДВЧ/УВЧ/ШІМ» | Both | Normalize to Latin to match ch 2.1 + glossary `_names` (am/fm/ssb/cw/hf/vhf/uhf/pwm render Latin in prose): АМ→AM, ЧМ→FM, КХ→HF, УКХ→VHF, ДВЧ/УВЧ/НВЧ→UHF, ШІМ→PWM. Careful with paired forms: «УКХ (VHF/UHF)» → «VHF/UHF» (not «VHF (VHF/UHF)»). Formula abbreviations use Latin «BW» (per `bandwidth.formula`). |
| «RF» (radio-frequency) → «РЧ» or «ВЧ» | Both (ch 2.3 throughout) | Keep Latin **«RF»**, same class as AM/FM/SSB above. Both models default to «РЧ» (2.5 sometimes «ВЧ» = high-freq, also semantically wrong for RF). `check:acronym-parity` REQUIRES the UA to keep the EN-introduced acronym verbatim: EN «radio-frequency (RF)» → UA «радіочастотна (RF)», then «RF» / «RF-вихід» / «RF-потужність» / «RF-ватметр» everywhere after. Scan re-translations for `РЧ`/`ВЧ` and replace with `RF`. The full UA noun is «радіочастотна потужність»; the abbrev stays Latin. |
| «dummy load» → «еквівалент навантаження» | Both | Keep **«еквівалент антени»** (Ukrainian-Wikipedia-canonical, = glossary `_names['dummy load']`). Watch the case-sensitive trap: a capitalised «Еквівалент навантаження» at the start of lab equipment/component strings slips a lowercase-only `еквівалент навантаження→антени` regex (ch 2.3). |
| Cataphoric pronoun before the noun it names — «Ви називаєте **її** «100-ватною» **радіостанцією**» | 3.1 Pro (ch 2.3 `intro1`) | User-flagged as «рагульство»: the pronoun «її/його/їх» stands for the very noun that immediately follows as the naming predicate — redundant, clumsy. EN «You call **it** a «100-watt» radio» does NOT translate to pronoun-then-noun. Restructure to name the object directly: «Ви називаєте **свою радіостанцію** «100-ватною».» NOT mechanically lintable (cataphora is normal in most other contexts) — catch it in review: any «назива(є/ють/єте) + (її/його/їх/це) … + <the same noun>» should drop the pronoun and put the noun as the object. |

---

## Stylistic decisions established through ch 1.5

These are now project-canonical (also in `references/glossary.md`):

- **"in phase"** → **синфазно** (more precise than «у фазі»)
- **"blocks DC, passes AC"** → **«не пропускає постійний струм, пропускає змінний»** (not «блокує»)
- **Pole / terminal / lead polarity** → **позитивний / негативний** (never «додатний / від'ємний» for physical leads; the latter is scalar/math only)
- **Bleeder resistor** → **розряджувальний резистор** (Wikipedia article is titled so)
- **Exponential** → **експоненційний** OR **експоненціальний** (both valid; Wikipedia and 20-volume dictionary prefer «експоненційний»; orthographic dictionary has «експоненціальний»; either is acceptable)
- **RC time constant** → **стала часу RC-кола** (not «постійна часу»; full «RC-кола» better than bare «RC»)
- **Parallel-plate capacitor** → **плоский конденсатор** (canonical UA physics term)
- **Tuned circuit / resonant tank** → **коливальний контур** (not «налаштований контур»)
- **Capacitor plate** → **обкладка** (not «пластина» as the current-carrying element)
- **Worked example** → **Приклад розрахунку** (not «Розв'язаний приклад» — landmine)
- **Debouncing** → **усунення дрижання контактів** (not «усунення брязкоту»)
- **Derivative** → **похідна** (glossary entry added ch 1.5)
- **Widget → widget (українською)**: we use «віджет» project-wide; don't substitute «модель»
- **Button labels for actions** → imperatives «Зарядити» / «Розрядити» / «Скинути» (not nouns «Заряд» / «Розряд»)

---

## Hard rules

- **Never skip stage 2 (side-by-side).** The user explicitly rejected single-model output.
- **Never apply Gemini output without Claude's analysis stage.** Gemini regresses on several known patterns and the analysis is where we catch them.
- **Never commit an apply without running the lint.** Every post-apply must pass `check:uk`.
- **Never present a fix to the user without running the lint on the affected key first.** Mid-conversation small fixes (user flagging a sentence) must re-lint even for one key.
- **Never use the old Claude 6-agent Pipeline** described in `critiques/` — that approach is what got us into the 30-round-trip hole. The critique briefs there remain as reference but aren't invoked as agents in the workflow.

---

## Updating the skill

Whenever the user pushes back on a specific Gemini word choice:
1. Decide: is Gemini right (UA preference we missed) or wrong (regression)?
2. If Gemini right: update `references/glossary.md` with the canonical form + add the row to the "Stylistic decisions" section above.
3. If Gemini wrong: add the regression pattern to the "Known Gemini regressions" table above + add a linter rule to `scripts/lint-ua-translation.mjs` if mechanically catchable.

The skill gets smarter per chapter. Every user correction in ch 1.5 → 1.6 → 1.7 etc. becomes a future-proof guardrail.
