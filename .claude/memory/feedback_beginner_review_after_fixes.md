---
name: feedback-beginner-review-after-fixes
description: beginner-review must run AGAIN on every string rewritten during a fix pass — the first run never sees the prose I write in response to it
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a8380fd5-99a1-4a2c-93ce-2b1b0a9c4753
  modified: 2026-07-28T18:19:16.428Z
---

**`beginner-review` runs twice: once to find, once to check what I wrote.** User-flagged
with fury on ch 0.2, 2026-07-28.

The hole: the review agent reads the chapter *as it exists*. I then write brand-new prose
for every finding. That new prose — often 30+ strings — goes through **no comprehension
check at all**. Gates are mechanical (tags, units, wraps). The UA linter is a regex
blocklist with no dictionary. Gemini translates faithfully, including faithfully
translating a confused English sentence into a confused Ukrainian one.

So the more findings the review produces, the more unreviewed text I add.

**Why:** ch 0.2 finding C12 said only «`scopeSpecs` names Nyquist without explaining it».
I wrote the explanation myself and shipped
«…межа Найквіста, нижче якої оцифровану хвилю вже неможливо відрізнити від повільнішої…»
— nested inside an already-long sentence via two em-dashes plus a trailing «але», with
the physics backwards (aliasing makes a *fast* wave masquerade as a slow one). All 31
gates green. Same defect in `vnaSparams`: a parenthesis containing an em-dash and a
semicolon, mid-sentence, before a quoted string.

**How to apply:** after finishing a fix pass, re-run `beginner-review` as a subagent
scoped to **only the rewritten keys** (both locales) before declaring anything done or
committing. Cheap — tens of strings, not the whole chapter. Watch specifically for the
shape I default to under pressure: bolting an explanation into an existing sentence with
dashes or parentheses instead of writing a separate sentence. One idea, one sentence.

**The finding count is NOT a convergence signal.** ch 0.4 ran seven rounds and went
85 → 45 → 19 → 35 → 12 → 7 → 7. Round 4 nearly doubled round 3 — and its findings were
the worst of the whole pass: «the decibel is, fundamentally, a power unit» (which
`introNote` and `quiz_q9_a` both deny), a derivation that skipped `V₁²/V₂² = (V₁/V₂)²`
while the prose named the identity that needs it, and a lab step sending the reader to a
calculator that opens in the *other* mode. Stopping at 19 because the trend «looked
converged» would have shipped all three. The count falls when the *text* stops changing,
not on a schedule: a round that rewrites 30 keys will find more than the round before it.
Stop when a round returns nothing that is a defect — not when the number looks small.

Related: [[feedback_verify_visually_before_done]] — same class of failure, different
sense. Both are «I declared done without the check that would have caught it».
