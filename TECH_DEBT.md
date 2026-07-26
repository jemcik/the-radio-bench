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
| [ ] | `0.1` |
| [ ] | `0.2` |
| [ ] | `0.3` |
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
