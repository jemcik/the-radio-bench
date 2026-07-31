---
name: feedback_ua_emdash_before_sign
description: Never put an em-dash «—» directly before a +/− sign in UA prose (even across a <strong> wrapper) — reads as two dashes; now linted
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c038fcb6-497a-4f78-ba71-83c0d1642330
---

In UA chapter prose, an em-dash «—» immediately before a **minus/charge sign «−»** (or a negative number) reads as two consecutive dashes and is very hard to read. The user has flagged this class **multiple times** ("ми вже про це говорили не раз"). The trap that slipped through on ch3.3 `transducerP2`: an elided-verb dash straight before a charge sign — «верхній кінець стає +, а нижній — <strong>−</strong>».

**Why:** «— −» visually mashes the em-dash and the minus into one smear; same for «— −40 дБ» (negative number). The `<strong>` (or any tag) between them doesn't help — the reader still sees dash-then-minus.

**How to apply:** Never write `— −` (em-dash then minus), even with a tag in between. Put a non-dash character between them: repeat the verb («а нижній **стає** −»), insert a noun («— **спад** −40 дБ»), or use a colon. The `+` sign after an em-dash is fine (it doesn't look like a dash) — it's specifically the **minus** that collides.

Enforced by `forbidden.emdash-before-minus` in `.claude/skills/ua-translate/scripts/lint-ua-translation.mjs` (pattern broadened on ch3.3 from `/—\s*−\s*\d/` to `/—\s*(?:<[^>]+>\s*)*−/` so it also catches the standalone charge sign and the `<strong>`-wrapped form). The per-edit UA linter (`check:uk`) will now fail on any recurrence — run it after every i18n string edit. See [[feedback_lint_warnings_are_bugs]].
