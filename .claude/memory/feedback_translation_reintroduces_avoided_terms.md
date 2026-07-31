---
name: feedback-translation-reintroduces-avoided-terms
description: Gemini restores the exact jargon the English was rewritten to avoid — check every deliberate avoidance survives the translation
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a8380fd5-99a1-4a2c-93ce-2b1b0a9c4753
  modified: 2026-07-29T08:24:57.655Z
---

**When the English deliberately avoids a term, the Ukrainian will put it back.** Chapter
0.3's `fractionsExample` was rewritten as «two resistors **joined end to end**» precisely
because «in series» is undefined in Part 0. Both Gemini 2.5 Pro and 3.1 Pro returned
«з'єднані **послідовно**» — the term the rewrite existed to remove. Neither model can know
the avoidance was intentional; the English reads like clumsy phrasing, so both "improve"
it back to the standard term.

The same shape appeared three more times in one chapter: «показник степеня» reintroduced
as «порядок», «науковий запис» swapped for «експоненційний запис», and «переведення»
(the settled word for prefix conversion) collapsed back into «перетворення» (reserved for
formula transposition).

**Why:** a beginner-review round that costs 15 minutes to run flags «undefined jargon»,
the fix lands in English, and the translation silently undoes it — so the next round flags
the same thing again and the loop never converges.

**How to apply:** after every `gemini-translate.py` run, diff the candidate against the
English for *deliberate* choices, not just for tags and numbers. Keep a short list of the
chapter's settled terms and grep the applied Ukrainian for their rivals — `re.search` over
the whole `ch{N}_{M}` block, not just the keys you changed, because one restored word in a
quiz explanation is enough to break the chapter's consistency. When the English phrasing
looks deliberately plain, say so in a comment next to the key so the next pass does not
"fix" it either.

Related: [[ua_translation_workflow]] is the pipeline this check belongs to;
[[feedback_ua_plausible_nonwords_slip_gates]] is the other class the mechanical linter
cannot see.
