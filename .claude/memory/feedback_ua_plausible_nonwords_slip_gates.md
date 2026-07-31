---
name: feedback_ua_plausible_nonwords_slip_gates
description: "Plausible-looking UA non-words and calques pass every gate — the UA linter is a 52-regex blocklist with no dictionary, and neither Claude reviewer nor beginner-review can spot them"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 9612685c-dd07-42c7-a9b4-0147d5b16d01
  modified: 2026-07-26T12:56:39.067Z
---

**Second occurrence of this exact class** («несна» in ch 2.2, «атмосферики» in ch 4.4,
2026-07). The user catches these; nothing else does.

Why they survive the whole pipeline:

1. `lint-ua-translation.mjs` is a **blocklist of ~52 regexes**, not a spell-checker.
   It has zero dictionary lookup, so any word not explicitly listed passes. It did not
   even catch «несна», the previous instance of this class.
2. `check:uk` and the other 29 gates check structure, parity and markup — never lexis.
3. **Claude cannot reliably tell a real UA technical term from a plausible calque.**
   That is the whole reason the skill says never to hand-author UA — but *selecting*
   Gemini's sentence in the per-sentence mix is the same trap wearing a different hat.
4. **beginner-review is another LLM with the same blind spot.** It read ch4.4's UA in
   full, twice, and flagged neither. Two passes with a shared weakness do not cover
   each other — do not treat a clean beginner-review as evidence the UA lexis is sound.

**How to apply.** When picking UA sentences, treat any term that is *transliterated
from English* or *structurally mirrors the English* as suspect even when it looks
technical — check whether the course already has a settled word for it before
accepting Gemini's. `grep` the UA locale for the concept first: ch4.4 already used
«атмосферні завади» 7× including in its own `qrn` glossary entry, so both variants
were internally inconsistent as well as wrong.

When the user flags one, the project rule applies (CLAUDE.md: never fix the same class
twice): fix every instance, add a rule to the linter, add a row to the ua-translate
regression table, and **prove the rule fires** by running the linter against a probe
file containing the old text — a rule that silently matches nothing is worse than none.

See [[ua_translation_workflow]] and [[feedback_lint_warnings_are_bugs]].
