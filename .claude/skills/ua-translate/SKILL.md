---
name: ua-translate
description: Translate Radiopedia chapter content from English to Ukrainian with multi-agent parallel critique and automated linting, targeting native-Ukrainian fluency on the first presentation to the user. Use when translating any `ch*` i18n block or diagnosing why existing UK text sounds off.
---

# Ukrainian translation skill

The **goal**: when the user sees the Ukrainian translation, it reads as if it were originally written in Ukrainian by a technically-literate native speaker — not translated from English. Zero calques. Zero English leftovers. Zero gender-agreement bugs after edits.

Previous chapters (Ch 1.1) taught us that a single-pass agent translation leaves ~30 small fixes for the user to catch. That round-trip is the problem this skill eliminates.

## Workflow

The skill runs in **six stages**. Do not skip stages. Do not merge stages.

### Stage 1 — Load context

Read every file in `references/` (glossary, landmines, style). Also:

- Current `src/i18n/locales/en/ui.json` for the target block
- Current `src/i18n/locales/uk/ui.json` to extract terminology already approved
- `CLAUDE.md` for project conventions
- Memory files at `/Users/jemcik/.claude/projects/-Users-jemcik-Documents-Claude-Projects-Radiopedia/memory/` for session-specific rules

If the target content introduces a new domain term NOT in `references/glossary.md`, stop and ask the user for the preferred UK rendering. Do not coin terms unilaterally.

### Stage 2 — Primary translation

Spawn **one** general-purpose agent with this brief:

> You are translating `ch<id>` from English to Ukrainian for a ham-radio / electronics textbook.
>
> **Rule #1 — native-Ukrainian mindset.** Read each sentence after writing it. If it sounds translated — awkward word order, calqued idiom, stilted construction — REJECT and rewrite.
>
> **Terminology**: use `references/glossary.md` verbatim. For anything not in the glossary, use standard Ukrainian physics/electronics terminology (Засєкіна/Бар'яхтар register). Never coin transliterations.
>
> **Register**: polite plural `ви` LOWERCASE (never capital `Ви`). Never mix `ви` and `ти`. Em-dashes `—` for emphasis. Guillemets `«»` for quoted terms. Decimal comma: `1,5 В` not `1.5 V`. NBSP between number and unit.
>
> **Math variables** (`I`, `V`, `R`, `E`): wrap in `<var>X</var>` — the JSX layer renders these through KaTeX so they display with proper math serifs.
>
> **Landmines**: `references/landmines.md` lists every calque / wrong verb / register mismatch caught in previous chapters. Before writing any sentence, mentally check it doesn't fall into any of those patterns.
>
> **React tags**: preserve every `<strong>`, `<G>`, `<conductor>`, `<var>`, etc. exactly — they're component placeholders.
>
> **Output**: `/tmp/ch<id>-uk.json` — inner content of the `ch<id>: { ... }` object only, 4-space indent.

Agent outputs the draft + a decision log of non-obvious word choices.

### Stage 3 — Parallel critique (**the critical stage**)

Spawn **6 agents in parallel** (single message with 6 Agent tool calls). Each gets the draft + a specific critique brief from `critiques/`.

| Agent | Brief | What it finds |
|---|---|---|
| 1 | `critiques/fluency.md` | Sentences that sound translated, awkward word order, calqued idioms, verbs with missing objects |
| 2 | `critiques/technical.md` | Physics/engineering errors, wrong technical terms, beginner-hostile phrasings |
| 3 | `critiques/consistency.md` | Same English term translated multiple ways, register drift, voice inconsistency |
| 4 | `critiques/calques.md` | Known landmine patterns from `references/landmines.md` + English-leftover scan |
| 5 | `critiques/grammar.md` | Gender agreement (especially after word substitutions), pronoun antecedents, case errors |
| 6 | `critiques/register.md` | **Technical register purity** — playground verbs on quantities (гойдається/танцює/стрибає), anthropomorphic descriptors (спокійна напруга / поводяться режими), colloquial measurement verbs (міряти/поміряти/щупати vs вимірювати/виміряти), colloquial approximators (щось близько / десь на), diminutives, dramatic register outside callouts. Added after ch1.3 — the prior five critics missed «напруга гойдається» because it's grammatically fine and not a landmine; it's register-wrong and needed its own lane. |

Each agent returns findings in a structured format:

```
{key}: {problem} → {suggested_fix}
```

### Stage 4 — Consolidate findings

Main context (or a 6th agent) merges the 5 findings lists:

- Dedupe overlapping flags
- Group by key
- Prioritize: grammar/calque errors (must fix) > technical errors (must fix) > fluency (should fix) > consistency (should fix)
- Apply **high-confidence** auto-fixes (those where all critics agree)
- Present ambiguous calls to user with context

### Stage 5 — Automated lint

Run `node .claude/skills/ua-translate/scripts/lint-ua-translation.mjs <path-to-uk.json> <block-prefix>`.

The linter catches mechanical failures:
- English words in UK strings (`datasheet`, `convention`, `book`, `pull-up`…)
- Decimal periods in numeric UK strings (`1.5 В` must be `1,5 В`)
- Latin unit symbols where Cyrillic is expected (`kV` must be `кВ`)
- Forbidden words from the landmines list (`домовленість`, `книжка/книга`, `втомлена батарейка`, `нагрівник`, `підтягуючий`…)
- Simple noun-pronoun gender disagreements after a glossary-tracked term

Must exit 0. Fix any failures, re-run. Max 3 iterations before escalating to user.

### Stage 6 — Present to user

Only reach the user with:
- A decision log of the **non-obvious** choices the translator made (5–15 items, not every line)
- A list of anything the critics flagged that needed subjective judgment
- The final JSON block (still in `/tmp/`, merge manual)

User reviews → manual merge into `uk/ui.json` → run `node scripts/check-i18n.mjs` and `npm run lint` / `npm test`.

## Invocation

Typical user prompts that should trigger this skill:

- "Translate ch1.2 to Ukrainian"
- "Sync UK for the new voltage widget keys"
- "Run translation QA on ch1.1" (just runs stages 3–5 against existing UK)
- "Why does the Ukrainian in ch0.4 sound off?" (diagnostic mode — stage 3 only)

## Updating the skill

Whenever the user pushes back on a specific word choice:
1. Add it to `references/landmines.md` as a new forbidden pattern + the fix
2. Add any new term to `references/glossary.md`
3. If it's a new class of error, add detection to `scripts/lint-ua-translation.mjs`

This is how the skill gets better over time — every user correction becomes a guardrail for the next chapter.

## Hard rules

- **Never present first-pass translation to the user.** Always go through the critique + lint stages first.
- **Never coin new terminology unilaterally.** Ask the user.
- **Never skip the parallel critique.** Sequential "translate then review by the same agent" is the failure mode that produced the 30-fix backlog.
- **Never merge to `uk/ui.json` automatically.** Always output to `/tmp/` for manual user merge.
- **Re-run the lint after EVERY post-review edit**, not just on the initial translation. Each fix the user sends is a new vector for fresh jargon/calques. Narrow scope is fine (`node .claude/skills/ua-translate/scripts/lint-ua-translation.mjs src/i18n/locales/uk/ui.json ch1_4`), but the lint MUST run before declaring any fix done. Post-review edits bypassed the pipeline in ch1.4 and produced 20+ round-trips. Breaking this rule is the failure mode this discipline exists to prevent.
- **Audit the EN source for jargon BEFORE translating.** Landmine 13.5 (canonical term without gloss) applies to both locales — if EN itself has unexplained jargon the UA translation faithfully reproduces it. When writing or editing `en/ui.json`, grep for terms in the `style.unglossed-canonical-term` REGISTRY (in the lint script) and fix EN first; then UA follows cleanly.
