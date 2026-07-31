# Technical debt

Known, accepted, and deliberately deferred. Each entry says what the debt is, why it
was not fixed when it was found, and how to work it off. **Nothing here is a bug that ships broken** —
these are quality items. Where a gate exists it is already green via a baseline, so new
work cannot add to that item; where no gate is possible (§2) this register is the only
thing keeping the work from being forgotten.

When you clear an item, delete its section here and its entries from the baseline in
the same commit.

---

## 1. Widget/diagram strings that restate the prose beside them

**Found** 2026-07, while proofreading ch 4.4. **Scale:** 51 pairs across 18 chapters.
**Gate:** `check:widget-prose-duplication` (green — all 51 are grandfathered in
`scripts/widget-prose-duplication-baseline.json`).

### What the defect is

A widget note, a figure caption or a diagram label says the same thing, in nearly the
same words, as a paragraph rendered a few lines away. The reader is handed the same
sentence twice and has to work out whether the second one is adding anything.

The ch 4.4 case that surfaced it is worth remembering, because the cause was not
carelessness: `rst.judgementNote` and `rstP4` originally **contradicted** each other, a
review caught the contradiction, and it was "fixed" by copying one text into the other.
A contradiction was traded for a duplication. Watch for that move whenever two artefacts
are made to agree.

### Why it was deferred

It surfaced mid-proofread of ch 4.4. Rewriting prose in 18 published chapters during a
review of a different chapter would have buried the review, and every edited UA string
would need to go back through the `ua-translate` pipeline. The gate stops the problem
growing; the backlog can be worked off a chapter at a time.

### How to work it off

Per chapter, decide which artefact **owns** each fact, and cut it from the other:

- Facts the reader needs *at the moment they act* — a caveat about numbers a widget is
  generating, the scope of what a decoder covers — belong in the **widget**.
- Facts a reader needs while *looking at a figure* belong in the **caption or label**,
  because a reader scanning a figure never reaches the paragraph.
- Everything else belongs in the **prose**, and the other artefact should carry only
  what it alone says.

Then remove those ids from the baseline so the gate holds the chapter to the new state.
Re-run `node scripts/check-widget-prose-duplication.mjs` after temporarily moving the
baseline aside to see the current list with the offending sentences printed in full.

### The backlog

Ordered by chapter. «Worst» is the highest sentence-overlap score in that chapter;
1.00 means a verbatim copy.

| Chapter | Pairs | Worst | Pairs (widget × prose) |
|---|---|---|---|
| `ch0_2` | 1 | 0.50 | `ammeterCaption` × `currentDesc` |
| `ch1_1` | 4 | 0.83 | `atomicCaption` × `chargeIntro`<br>`circuitCaption` × `circuitOhmPreview`<br>`resistanceCollisionCaption` × `resistanceMechanism`<br>`waterPipeCaption` × `waterPipeAriaLabel` |
| `ch1_3` | 3 | 1.00 | `widget.rmsSelector.hint_peak` × `levelsPeak`<br>`widget.rmsSelector.hint_rms` × `levelsRmsDerivation`<br>`widget.rmsSelector.hint_rms` × `levelsRmsIntro` |
| `ch1_6` | 4 | 0.91 | `widget.builder.description` × `geometryBuilderIntro`<br>`widget.builder.hint` × `geometryBuilderIntro`<br>`widget.combine.hint` × `combinationsCalcIntro`<br>`widget.rl.hint` × `rlWidgetIntro` |
| `ch1_7` | 2 | 0.86 | `schematicParallelCaption` × `keyTakeaway3`<br>`widget.vna.hint` × `vnaCurveBehaviour` |
| `ch1_8` | 8 | 1.00 | `schematicLcLpfCaption` × `rcHpfIntro`<br>`schematicLcNotchCaption` × `lcNotchIntro`<br>`schematicRcHpfCaption` × `rcHpfIntro`<br>`schematicRcLpfCaption` × `rcHpfIntro`<br>`schematicRcLpfCaption` × `rcLpfBehaviour`<br>`schematicRcLpfLabCaption` × `labStep2`<br>`widget.cutoff.description` × `cutoffIntro`<br>`widget.cutoff.description` × `keyTakeaway2` |
| `ch1_9` | 7 | 0.70 | `coresGalleryCaption` × `coresIntro`<br>`coresGalleryCaption` × `introPreview`<br>`coresGalleryCaption` × `keyTakeaway6`<br>`schematicAutoCaption` × `topologyAuto`<br>`schematicImpedanceMatchCaption` × `impedanceFormulaIntro`<br>`schematicVoltageDemoCaption` × `keyTakeaway2`<br>`widget.impedance.description` × `impedanceFormulaIntro` |
| `ch1_10` | 1 | 0.50 | `widget.ripple.description` × `bridgeAfter` |
| `ch1_11` | 1 | 0.63 | `mosfetSwitchSchematicCaption` × `familiesFetRow` |
| `ch2_2` | 1 | 0.57 | `carrierKnobs.caption` × `carrierP2` |
| `ch3_1` | 2 | 0.56 | `modeDetectors.caption` × `keyTakeaway6`<br>`superhet.psDesc` × `blocksP2` |
| `ch3_2` | 1 | 0.63 | `txBlocks.clickHint` × `chainP1` |
| `ch3_3` | 2 | 0.75 | `chooseTable.r3Antenna` × `typesTip`<br>`erpCalc.description` × `gainErpFormula` |
| `ch3_4` | 1 | 0.71 | `bench.caption` × `benchLead` |
| `ch4_1` | 2 | 0.64 | `conditions.description` × `conditionsLead`<br>`mufSkip.description` × `mufLead` |
| `ch4_2` | 4 | 1.00 | `diagnose.caption` × `socialP1`<br>`diagnose.q1` × `socialP1`<br>`ferriteCalc.description` × `ferritesP2`<br>`ferriteChoke.caption` × `ferritesP2` |
| `ch4_3` | 2 | 0.75 | `rfCalc.description` × `rfP7`<br>`rfCalc.note` × `rfP9` |
| `ch4_4` | 5 | 0.88 | `callsignAnatomy.uaNote1` × `csP5`<br>`callsignAnatomy.usNote2` × `csP4`<br>`decoder.uaDigitNote` × `csP5`<br>`decoder.uaIndividual` × `csP5`<br>`decoder.usSuffixNote` × `csP4` |

### Known false-positive shape

Some pairs are **deliberate reinforcement across modes** rather than accidental twins —
notably ch 4.4 §6, where the same fact about call-sign geography appears in the prose,
as a label on the anatomy figure, and as the decoder's answer to what the reader typed.
Those three are meant to repeat. Judge each pair before rewriting it; if you decide a
pair is legitimate, leave it in the baseline and note why in its value string.

---

## 2. Chapters never read by `beginner-review`

**Found** 2026-07, during the ch 4.4 proofread. **Scale:** 15 of 27 published chapters.
**Gate:** none possible — no mechanical check can tell whether a human-style read happened.
That is exactly why it is written down here.

### What the gap is

The `beginner-review` skill was added on **2026-05-20**, in the same commit as ch 1.11
(`43f5ef2`), and was a hard rule from that moment. Every chapter published **before**
that date was therefore written, translated and shipped without ever being read by a
fresh-context reader.

Never reviewed (15): 0.1 – 0.5, 1.1 – 1.10.
Covered by the rule (12): 1.11, 2.1 – 2.3, 3.1 – 3.4, 4.1 – 4.4.

Boundary case worth checking first: **ch 1.11** shipped in the very commit that
introduced the skill, so whether it was actually run on that chapter's prose is unknown.

### Why this matters more than it sounds

On ch 4.4 in a single session, `beginner-review` found a **factual error** (an alphabet
described as governing until 1956 when later conventions had revised it), three
internal contradictions between prose and its own widgets, undefined jargon carrying a
paragraph's argument, and a caption asserting something the figure it captioned visibly
broke. **All 31 gates were green throughout.** Those classes are invisible to every
mechanical check the project has — they are precisely what this skill exists to catch,
and fifteen chapters have never been through it.

### Why it was deferred

Fifteen reviews is not the work; the **fixes** are. Each finding needs an edit, and each
edited Ukrainian string goes back through the `ua-translate` pipeline. Doing that during
a proofread of a different chapter would bury the proofread.

### How to work it off

One chapter at a time, oldest first (the early chapters have had the longest to accrete
readers who hit the same confusion). Per chapter: spawn the skill as a subagent against
that chapter's `ch{N}_{M}` block in both locales plus its page component, triage the
findings, fix, re-verify, tick the box below.

**Do not treat a clean report as proof.** `beginner-review` is an LLM with the same
blind spots as the author: on ch 4.4 it read the Ukrainian prose in full twice and
flagged neither «атмосферики» (a transliterated non-word) nor a duplicated paragraph.
It is a filter, not a guarantee.

### The backlog

| Done | Chapter |
|---|---|
| [x] | `0.1` — 2026-07-27. 12 findings fixed (see below); 6 further calls made at review. |
| [x] | `0.2` — 2026-07-29 (#60). Two review rounds; blockers fixed, polish taken in the same pass. |
| [x] | `0.3` — 2026-07-29. Four review rounds (71 → 53 → 35 → 34 findings); all applied. §3 math-var debt for this chapter cleared in the same pass. |
| [ ] | `0.4` |
| [ ] | `0.5` |
| [ ] | `1.1` |
| [ ] | `1.2` |
| [ ] | `1.3` |
| [ ] | `1.4` |
| [ ] | `1.5` |
| [ ] | `1.6` |
| [ ] | `1.7` |
| [ ] | `1.8` |
| [ ] | `1.9` |
| [ ] | `1.10` |

---

## 3. Math variables in prose that are not wrapped in `<var>`

**Found** 2026-05-24, when `check:unwrapped-math-var` was added alongside ch 2.1
(`da1c413`). **Scale:** 486 keys across 13 chapters (0.2 – 1.11); originally 533 across
14. Ch 0.3 was worked off 2026-07-29, and the symbol-gloss exemption added the same day
cleared a further fifteen keys spread over ch 0.2, 1.1, 1.3, 1.5 and 1.6.
**Gate:** `check:unwrapped-math-var` (green — all 486 are grandfathered in
`scripts/unwrapped-math-var-baseline.json`).

### What the defect is

A math variable is written as a plain letter in prose instead of `<var>c</var>`, so it
ships as upright body text rather than the KaTeX math-italic glyph. The reader cannot
tell the letter is a variable — it blends into the surrounding sans-serif sentence.

The reader-flagged case that created the gate is the shape to remember: ch 2.1 wrote the
speed of light as «…written c.» and «λ = c / f» with bare letters. It slipped through
every pre-existing `<var>` gate, because `check:tag-renders`,
`check:bare-subscript-renders` and `check:var-multichar-subscripts` all check the *render
safety of markup that is already present* — none of them check for the **absence** of
`<var>` on a bare variable. `beginner-review` did not catch it either: it targets
clarity, not typography.

### Why it was deferred

The gate was written mid-chapter-2.1. Wrapping 533 keys across fourteen already-published
chapters at that moment would have buried that chapter's work, and every edited Ukrainian
string has to go back through the `ua-translate` pipeline. The baseline stops the problem
growing; the backlog can be worked off a chapter at a time.

### How to work it off

Per chapter, wrap each flagged variable — `c` → `<var>c</var>`, `λ` → `<var>λ</var>` —
and make sure the value actually reaches a renderer that maps `var` → `<MathVar>`:
`<Trans>` for prose and summaries, `buildQuizFromI18n` for quiz strings. A wrapped
variable in a string rendered as raw text ships a literal `<var>` to the reader, so
verify the render path, not just the markup.

Two traps specific to this item:

- **Variable names stay Latin in Ukrainian prose** — do not let a UA pass transliterate
  `f` into `ч` or similar. Wrap first, then translate.
- **The baseline is position-keyed by occurrence count**, so it also moves when prose is
  merely reordered. After an intentional, verified change re-snapshot with
  `node scripts/check-unwrapped-math-var.mjs --update-baseline`, and read the resulting
  diff — a count that *dropped* is the work; a count that *grew* is a new bug.

Then remove those keys from the baseline so the gate holds the chapter to the new state.

### The backlog

Ordered by chapter. Counts are baselined keys per locale; a key can hold more than one
unwrapped variable.

| Chapter | `en` | `uk` | Total |
|---|---|---|---|
| `ch0_2` | 1 | 1 | 2 |
| `ch0_4` | 3 | 1 | 4 |
| `ch1_1` | 2 | 2 | 4 |
| `ch1_2` | 16 | 16 | 32 |
| `ch1_3` | 11 | 11 | 22 |
| `ch1_4` | 6 | 8 | 14 |
| `ch1_5` | 34 | 34 | 68 |
| `ch1_6` | 40 | 40 | 80 |
| `ch1_7` | 43 | 43 | 86 |
| `ch1_8` | 29 | 28 | 57 |
| `ch1_9` | 2 | 2 | 4 |
| `ch1_10` | 13 | 13 | 26 |
| `ch1_11` | 44 | 43 | 87 |
| **Total** | **244** | **242** | **486** |

Note that `ch1_11` carries the largest share despite post-dating the `beginner-review`
rule — the two backlogs are independent, and a chapter can be clear of one and not the
other.

### Known false-positive shape

Rule B flags a single Latin letter next to `=`, `·`, `×`, `≈` or `÷`. A chemical formula,
a musical note, or a single-letter component designator sitting beside one of those
operators is not a math variable. Judge each hit; if a flagged letter is genuinely not a
variable, leave it baselined rather than wrapping it.

**SI prefix symbols are the trap to know about.** Wrapping the `k` of `kHz` or the `p` of
`pF` in `<var>` is *wrong*: SI prefix symbols are set upright, and `<var>` → `<MathVar>`
renders math-italic. Rule B flagged exactly this in ch 0.1 (`maths2`, «the k in kHz, the
M in MHz»). The fix is neither to wrap nor to baseline — it is to name the prefixes as
words («kilo in kHz, mega in MHz»), which is also what a beginner needs and what the
`scientific notation` glossary popover already says.

The **symbol-gloss** shape — a lone letter in parentheses, «kilo (k)», «micro (µ)»,
«47 × 10³ (k)» — is the same trap in a form the gate can recognise, so as of 2026-07-29
`strip()` removes `(x)` before scanning and those keys no longer need baselining. That
is what cleared eight of ch 0.3's twenty English entries; the other twelve were real
variables in quiz strings and got wrapped.

**Units are the mirror trap.** «<var>V</var> = 12 V» — the first `V` is the variable, the
second is the volt, and only the first takes `<var>`. A blanket regex sweep gets this
wrong every time; check each occurrence against its sentence.

---

## 4. «ланцюг» used for *circuit* in Ukrainian prose

**Found** 2026-07-27, while working ch 0.1 off §2. **Scale:** ~7 strings across 5 chapters.
**Gate:** none — see the trap below for why a linter rule would do more harm than good.

### What the defect is

Ukrainian uses «коло» for an electrical circuit; «ланцюг» in that sense is a calque. The
course already settled on «коло» — `parts.1` is «Електрика та електричні кола», and
«електричне коло» appears throughout — but a handful of strings still say «ланцюг».

Circuit-sense hits, all Ukrainian-only: `glossary.calibrated.detail` («розімкнутий
ланцюг»), `ch1_11.oscFrequency` and `ch1_11.quiz_q10_explanation`
(«частотно-вибірковий ланцюг»), `ch1_11.quiz_q9_explanation` («ланцюгом зворотного
зв'язку»), `ch3_2.txBlocks.bufferDesc` («наступних ланцюгів» — here «каскадів» is the
right word), `ch4_3.quiz_q9_explanation` («на кінцях усього ланцюга»).

### The trap — do NOT sweep this with a regex

«ланцюг» is a perfectly good Ukrainian word meaning *chain*, and the course uses it
correctly in that sense in at least six places: «ланцюг блоків» and «ланцюг каскадів»
(ch 3.2), «сигнальний ланцюг» (ch 0.4), «в один ланцюг» (ch 1.4), «ланцюг із трьох
ланок» (ch 4.2), «ланцюг "трансформатор–випрямляч–стабілізатор"» (`glossary.psu`).
A blanket replace would corrupt every one of them. Each hit has to be read for sense.
This is also why no linter rule is proposed: the word itself is not the defect.

### Deliberately excluded: «векторний аналізатор ланцюгів»

The VNA's Ukrainian name appears in 12 strings across 6 chapters and is currently
**consistent**. It was left alone on purpose: the Ukrainian abbreviation «ВАЛ» is built
from that expansion, so changing it to «кіл» also forces «ВАЛ» → «ВАК» in four glossary
entries and several chapters. That is a deliberate course-wide terminology migration, not
a side-effect of a chapter review. The course's primary term is the Latin «VNA» in any
case (`glossary._names.vna` = «VNA»). If it is ever migrated, do the name and the
abbreviation in the same commit.

### How to work it off

Fold it into each chapter's §2 pass — the affected chapters (1.11, 3.2, 4.3) are on that
backlog anyway, and the strings are already being re-read there. Judge each hit for
chain-vs-circuit sense before touching it.

---

## 5. The landing page sits outside five gates

**Found** 2026-07-27, while reviewing the landing page after ch 0.1.
**Scale:** 6 gates, ~90 strings (`welcome`, `hero`, `tour`, `guidedTour`, `site`, `parts`,
`sidebar`, `chapterTitles`, `chapterSubtitles`).
**Gate:** none — this item *is* the missing gate coverage.

### What the gap is

Six gates restrict themselves to chapter blocks and therefore never scan the first page
every visitor sees:

| Gate | Restriction |
|---|---|
| `check-unwrapped-math-var` | `:137` — `/^ch\d+_\d+$/` |
| `check-widget-prose-duplication` | `:109` — `/^ch\d+_\d+$/` |
| `check-undefined-acronyms` | `:359` — `/^ch\d+_\d+\./` |
| `check-glossary-coverage` | `:326` — `/^ch\d+_\d+$/` |
| `check-acronym-parity` | `:110` — `/^(ch\d+_\d+\|glossary)\b/` |
| `check-hardcoded-jsx-text` | `SCAN_DIRS` omits the `src/components` root |

The landing page is also absent from §2 — that backlog lists chapters only.

### Measured cost of closing it

Each gate was copied to a scratch dir, widened, and run. Results:

- **`acronym-parity`** — passes clean when widened. A one-line regex change, free.
- **`unwrapped-math-var`** — clean on `welcome`. Widening surfaces exactly one real key,
  `chapterSubtitles["1-2"]` (`V = I·R, P = V·I — …`, six bare variables in both locales).
  **Blocked:** subtitles render as flat text (`{meta.subtitle}`, `ChapterPage.tsx:162`) and
  also feed the search index, so `<var>` would ship literally. The render path has to
  change first.
- **`glossary-coverage`** — **cannot be widened by regex alone.** It locates a block's TSX
  via ``chId.replace('ch', 'Chapter') + '.tsx'`` (`:329`), so for `welcome` it looks for
  `welcome.tsx`, misses `Welcome.tsx`, resolves no alias tags, and reports every wrapped
  term as unwrapped. A naive widening produced three false positives (`swr`, `impedance`,
  `filter`) that are in fact correctly wrapped. Fix the TSX lookup before the scope.
- **`undefined-acronyms`** — widening yields 5 hits, 4 of them false: `hero.title` is set
  in capitals, and the gate reads every all-caps word as an acronym. Needs an all-caps-
  title exemption first.
- **`hardcoded-jsx-text`** — adding the `src/components` root finds two real untranslated
  `aria-label`s (`WelcomeBuddy.tsx`, fixed 2026-07-27 by making the decorative mascot
  `aria-hidden`; `layout/ThemeToggle.tsx:85` — "Font size", still open). But the root
  overlaps the four subdirectories already listed, so every existing finding is reported
  twice — the scan needs de-duplication in the same change.
- **`widget-prose-duplication`** — not applicable; it needs the widget/prose split that
  only chapter blocks have.

### Known blind spot no gate covers

`HeroStations.tsx` draws `MIC`, `AF`, `MIX`, `PA`, `RF` as literal English text nodes
(`:53,58,65,87,131,138,160`). They are outside i18n entirely, and widening
`hardcoded-jsx-text` does **not** catch them — the gate skips short all-caps tokens. They
render at 5.5 px and 0.5–0.7 opacity, i.e. as texture rather than as reading matter, and
the legend beneath explains the symbols the reader actually needs. Left alone
deliberately; recorded so a future reader knows it was a decision, not an oversight.

### How to work it off

In order, cheapest first: `acronym-parity` (regex), then `hardcoded-jsx-text` (root +
de-dup), then `undefined-acronyms` (all-caps exemption), then `glossary-coverage` (TSX
lookup), and `unwrapped-math-var` last, behind the subtitle render-path change.

---

## 6. Ukrainian glossary entries that lost content in translation

**Found** 2026-07-28, on the fifth review round of ch 0.2. **Scale:** 1 entry remaining
(6 cleared on discovery). **Gate:** `check:glossary-locale-parity` (green — the one
survivor is grandfathered in `scripts/glossary-locale-parity-baseline.json`).

### What the defect is

A Ukrainian glossary entry silently carries less than its English original — usually a
dropped trailing sentence, sometimes a whole paragraph. Nothing about the result reads as
wrong. It reads as *complete*, which is why four consecutive `beginner-review` passes over
the chapter prose found none of it.

The three that mattered most, all reachable from ch 0.2:

- **`duty cycle`** lost its entire general lead paragraph in Ukrainian — in the very round
  that added that lead to English. A reader hovering the term in ch 0.2 landed straight in
  Part-4 RF-exposure limits with the term never defined in the entry at all.
- **`power rails`** lost the sentence warning that large boards break each rail at the
  midpoint, so the popover flatly contradicted the prose that opens it.
- **`breadboard`** lost the only sentence in either locale explaining *why* a leg pushed
  into a hole stays put (spring contacts).

### Why no existing gate saw it

`check:glossary-completeness` checks that keys exist. `check:glossary-markup` checks that
markup renders. `check:glossary-coverage` and `check:glossary-overwrap` check wrapping in
prose. **None of them compares what the two locales actually say.**

### How the gate decides

Sentence count alone is not a signal: a translator legitimately merges two English
sentences into one Ukrainian sentence. Character count alone is not either: a terser but
complete translation dips below 1.0 without losing anything.

The calibration that separates them: across the 340 translated entries the **median
Ukrainian field is 1.10× the English one** by character count — Ukrainian simply runs
longer. So the gate flags a field only when it is **both** shorter in sentences **and**
below 0.85× the English character count. At that threshold it found 7 entries, every one
of which was a real omission on inspection, and no false positives.

### How to work it off

Translate the missing sentences through the `ua-translate` pipeline — never by hand. If
the English sentence is genuinely redundant, cut it there instead, so both locales say the
same thing. Then re-snapshot with
`node scripts/check-glossary-locale-parity.mjs --update-baseline` and read the diff.

### The backlog

| Entry | Gap | Belongs to |
|---|---|---|
| `skywave.detail` | en 3 sentences / 400 chars → uk 2 / 291 | ch 4.1 (propagation) |

### Two traps for whoever works on the glossary next

- **`extract-glossary.mjs` fails silently into a stale dump.** An unescaped apostrophe in
  `glossary.ts` makes it throw; `gemini-translate.py` only checks that
  `/tmp/glossary-en.json` *exists*, so the next translation run silently translates the
  **previous** English. Always read the extractor's output line before trusting a
  translation. (Hit again 2026-07-28, on `power rails`: `the multimeter's continuity
  setting` needed `\'`.)
- **`gemini-translate.py` cannot write entries whose key contains a slash** (`time/div`,
  `volt/div`) — it derives the output filename from the key and the intermediate directory
  does not exist. `mkdir -p /tmp/gemini-section/time /tmp/gemini-section/volt` first.

---

## 7. `text ∩ stroke` hits the visual gate never looked for

**Found** 2026-07-29, when ch 0.3's prefix ladder shipped with its ÷1000 arrows drawn
straight through the `p (п)` symbols. **Scale:** 51 newly frozen hits across 10 chapters.
**Gate:** `npm run test:visual` — RED until the baseline is re-captured (see below).

### What the defect is

`e2e/diagram-geometry.spec.ts` compared text against text, against circles and against
paths. An arrow is a `<line>` plus a `<polyline>`, so nothing ever looked at it. The ladder
went green for as long as each tick carried one narrow glyph (`p`); the moment the symbols
became two forms (`p (п)`, ~41 px instead of ~8), the arrow — which started at `tick + 6` —
ran through the text. Every gate stayed green, and the ad-hoc browser check used to verify
that change grouped labels into rows with an 8 px tolerance while the two rows sat 9 px
apart, so it compared nothing and printed `overlaps: []`.

### How the rule decides

A stroke has to reach the **middle half** of the glyph band with ≥ 3 px penetration along
the other axis — grazing an edge is what a label resting on its axis does, and that is
fine. On top of that, the text's own **centre point must NOT lie on the stroke**: a tick
label centred on its grid line is deliberate, an arrow clipping a symbol from one side is
not. That second test is what took the course-wide residue from 21 runs to 15.

Verified against the defect by reproducing the shipped geometry in the DOM: 14 hits, one
per symbol; zero after the fix.

### The backlog

| Chapter | `en` was → now | `uk` was → now | What the labels are |
|---|---|---|---|
| `0.2` | 0 → **4** | 0 → **4** | oscilloscope panel text (`VOLT/DIV`, `TIME/DIV`) |
| `0.4` | 0 → **4** | 0 → **4** | log-axis tick labels, «Логарифмічна вісь», `fc · −3 dB` |
| `1.6` | 5 → **13** | 5 → **13** | `SNSN` / `GG` / `vIII` — doubled strings, so suspect duplicated text nodes rather than layout |
| `1.10` | 0 → **1** | 0 → **1** | — |
| `1.11` | — | 1 → **3** | uk only |
| `2.2` | 2 → **4** | 2 → **3** | — |
| `2.3` | — | 0 → **1** | uk only |
| `3.1` | — | 2 → **4** | uk only |
| `3.2` | — | 1 → **2** | uk only |
| `3.4` | 0 → **4** | 0 → **4** | band labels («80 м», «70 см») on the band ruler |

Counts are the CI baseline, not a local run — the two environments disagree on 18 of 46
entries. 51 newly frozen hits across 10 chapters. Ch 0.3 is at zero.

(An earlier version of this table was built from a local run and was wrong: it listed
ch 1.8, where the count actually *fell*, and missed ch 2.2, 2.3, 3.1 and 3.2.)

Ch 0.3 is at zero.

### How to work it off

Seven of the ten chapters (0.2, 0.4, 1.6, 1.10, 1.11, 2.2, 2.3) are already in the §2
`beginner-review` queue, so the diagram fix belongs in the same pass as that chapter's
prose — the diagram is open in the browser anyway. **3.1, 3.2 and 3.4 are not in that
queue and need scheduling on their own.**

The counts are frozen in `e2e/diagram-geometry.baseline.json`, captured on CI's Linux
Chromium via the `Re-baseline visual gate` workflow — never locally. The two environments
genuinely disagree: 18 of 46 entries differ between macOS and CI, `ch1_6` by 8 and
`ch1_8` by 2 in the other direction. Freezing the counts means a NEW overlap still fails
the gate; the table above is what has to be worked off.
