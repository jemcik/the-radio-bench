---
name: feedback_quiz_answer_balance
description: Quiz answers must not be guessable by length OR position; build balanced from the start because reordering churns the UA translation. Enforced by check:quiz-balance (length + position + en/uk parity).
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 302ab6e4-48fd-40e3-982b-d46a5f2dd860
---

Reviewing the ch4_1 quiz the user flagged two guess-by tells: «правильна відповідь — помітно довша» (correct is noticeably the longest) and «вірна відповідь частіше всього B» (correct is most often option B). Measured course-wide: B was correct in 70–88 % of questions in 7 chapters and «d» was NEVER correct in 15 of 22 chapters — a student picking B (or never D) beats chance almost everywhere.

**Why:** a quiz that can be passed without reading the material is worthless as a check. Length and position are both silent leaks; the length one already had a gate, the position one did not.

**How to apply:** when authoring a chapter quiz —
- Spread `_correct` across a/b/c/d: ≤40 % on any single letter, and use all four slots.
- Keep the four options length-parallel; put the justification in `_explanation` (shown after answering), never padded into the correct option. Distractors must be substantial + plausible, not terse throwaways.
- Keep en and uk `_correct` identical (a desync silently mis-grades one locale — happened in this very session with q5/q7/q8/q10).
- **Build it balanced from the start.** Fixing it after the fact means reordering options, which forces re-translating the moved/rewritten distractors through the [[ua_translation_workflow]] — expensive. Decide the a/b/c/d layout when you write the EN.

Enforced by `scripts/check-quiz-balance.mjs` (`check:quiz-balance`, in `check:all`): three sections — LENGTH (correct not unique-longest >60 %), POSITION (modal slot ≤40 % AND, for quizzes with ≥8 questions, every slot a/b/c/d correct at least once — a never-correct «d» is its own tell), PARITY (en/uk `_correct` must match). Has a `QUIZ_LOCALES_DIR` env hook for fixture self-tests. See [[feedback_lint_warnings_are_bugs.md]] — encode the class as a gate, never fix it twice by hand.

**Debt cleared 2026-07:** all 18 skewed chapters (the 17 grandfathered + ch2_3's `d0`) were rebalanced by pure option-reordering, so `POSITION_BASELINE` is now `{}` and every chapter meets the strict bar on its own. The ratchet mechanism stays in the script (empty) for the rare truly-un-reorderable quiz.

**Ripple lesson — reordering quiz options disturbs OTHER gates' position-keyed state** (they key baselines/exempts by `chN_M.quiz_qX_slot`). After a reorder, expect to fix up: (1) `scripts/unwrapped-math-var-baseline.json` — re-snapshot with `node scripts/check-unwrapped-math-var.mjs --update-baseline` (safe: a pure reorder can't add debt — verify the only NEW text you wrote caused no baseline delta); (2) `EXEMPT_KEYS` in `scripts/check-acronym-parity.mjs` — repoint any moved quiz-option exemption (e.g. ch1_9's «(DC)»→«(постійна напруга)» moved `quiz_q1_b`→`quiz_q1_d`). Pure reordering does NOT touch the UA translation (option texts are unchanged, only their slot + `_correct`).
