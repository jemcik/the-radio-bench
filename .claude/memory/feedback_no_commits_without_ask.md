---
name: Never commit/push without an explicit user request
description: User has flagged unauthorized commits during review passes. CLAUDE.md is explicit on this; the rule applies especially during iteration ("one by one" review).
type: feedback
originSessionId: 1ec18fa1-c3aa-4c6e-8e4e-5bdcbe77df01
---
NEVER run `git commit` or `git push` (or open / amend a PR) unless the user has
explicitly asked in the current turn. Even if the change is obviously correct,
gates are green, and the work mirrors what was asked for.

**Why:** The user has flagged this twice now in the same session — once for the
unauthorized glossary translation deferral («what the fuck»), once for an
unauthorized commit during a review pass. CLAUDE.md is unambiguous («NEVER
commit changes unless the user explicitly asks you to»), but the failure mode
keeps surfacing because I treat commits as a natural «finish» step. They
aren't — they're a state change visible to others, on a branch the user is
still actively reviewing.

**How to apply:**
- Default state during any review-pass conversation: edit files, run gates,
  REPORT back. Stop there. Do NOT `git commit`, `git push`, `git pr edit`, or
  any other shared-state action.
- If a fix feels «obviously done», resist the urge. Wait for «commit this» or
  «push it» or «ship» from the user.
- If the user opened the conversation with «let's go through issues one by one»
  or any equivalent, treat that as a hard freeze on commits — they expect to
  pause between every fix and decide what's next themselves.
- Pre-PR / per-edit gates (`lint`, `tsc`, `npm test`, `check:uk`) are still
  fine to run unprompted — those don't touch shared state.
- The «commit cadence» rule in CLAUDE.md («batch related changes into one
  commit») is about WHAT to commit when asked, not WHEN to commit. The
  trigger is always the user.

This rule overrides any «I'm just being efficient» instinct.
