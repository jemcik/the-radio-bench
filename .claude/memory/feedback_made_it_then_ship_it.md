---
name: feedback-made-it-then-ship-it
description: Never ask whether an already-made change belongs in the diff — if the work is done and the tokens are spent, it goes in
metadata:
  type: feedback
---

**Never ask «should this change go in the PR or should I revert it?» about work that is
already done.** If I made the change and spent the tokens, it ships. The user has flagged
this repeatedly and was furious the last time (2026-08-13, ch1.2 branch): I finished the
chapter, listed four edits that fell outside its scope — `ch1_4.loadingAria`,
`ch1_9.impedanceWidgetIntro`, the `antenna tuner` glossary entry, `MagnitudeLadder` plus
the `check-tag-renders` gate — and asked whether to include them or revert.

**Why:** every one of those was a real bug that surfaced *because* of the chapter work,
already found, already fixed, already verified green. Throwing it away to keep a diff
tidy destroys work he has already paid for, and asking about it costs him a round-trip to
say the only sensible thing. Scope of an already-finished change is my call, not a
decision to hand back.

**How to apply:** finish the work, keep it all, say in one line what else is in the diff
and why it is there. Do not offer a revert, do not present it as a choice. This is about
*scope*, not about *shared state* — [[feedback-no-commits-without-ask]] still holds, so
the commit/push/PR itself still waits for his word.

Related: [[feedback-scan-the-class-fix-what-was-asked]],
[[feedback-proofread-fast-minimal-fixes]].
