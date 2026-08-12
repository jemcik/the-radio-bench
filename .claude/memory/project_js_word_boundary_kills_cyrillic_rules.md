---
name: project-js-word-boundary-kills-cyrillic-rules
description: JavaScript `\b` is defined over [A-Za-z0-9_], so a `\b` at the end of a Cyrillic alternation can never match — a UA linter rule written that way is dead on arrival and reports green forever
metadata:
  type: project
---

**Never end a Cyrillic pattern with `\b` in the UA linter.** Use `(?!\p{L})`.

JavaScript's `\b` is a word boundary over `[A-Za-z0-9_]` only — Cyrillic letters are
not word characters to it. So `/конденсатор\b/u.test('конденсатор навпаки')` is
**false**: there is no boundary between `р` and the space, because `р` was never
inside a word to begin with. The rule silently matches nothing, in every string,
forever.

**Why:** found 2026-08-02 in `forbidden.postavte-component`
(`.claude/skills/ua-translate/scripts/lint-ua-translation.mjs`). It guards eleven
Cyrillic nouns against the banned placement verb «поставте» and had been dead since
it was written — «Якщо поставити такий конденсатор навпаки» shipped through a green
`check:uk` in ch 0.5. Swapping the trailing `\b` for `(?!\p{L})` made it fire on
that exact string immediately. A sweep of all 7914 UA strings then found no other
hidden hit, so the damage was one line — but the rule had been reporting success
for months.

**How to apply:** when writing or reviewing any rule whose alternation ends in a
Cyrillic character, check the terminator. `(?!\p{L})` gives the intended
"not followed by another letter" and works for both alphabets. Same trap applies to
`\w` and to `\B`. And when adding a linter rule, prove it fires: paste a string it
must catch and run the linter, exactly as with a gate's negative control — a rule
that has never been seen to fail is indistinguishable from a rule that cannot.

Related: [[feedback_lint_warnings_are_bugs]] — there the warning was real and I
dismissed it; here the warning could never be emitted at all. Both end with a green
gate and a broken string. Also [[feedback_ua_plausible_nonwords_slip_gates]] — the
UA linter is a regex blocklist, so its coverage is exactly the rules that actually
run.
