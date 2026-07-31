---
name: feedback-course-parts-lowercase-roman
description: "The course's five divisions are «частина» lowercase + a Roman numeral — «частина III», never «Частині 3»"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a8380fd5-99a1-4a2c-93ce-2b1b0a9c4753
  modified: 2026-07-29T19:34:00.295Z
---

**A course division is «частина» (lowercase) followed by a Roman numeral.** «частина I»,
«у частині III», «для частин 0 та I». Part 0 has no Roman form and stays `0`. In English:
`Part I`, `Part III`, `Parts 0 and I` — capitalised there, because English capitalises the
name of a titled division, but the numeral is Roman in both locales.

**Why:** every surface the reader has ever seen labels them that way —
`['0', 'I', 'II', 'III', 'IV'][part.number]` in `Welcome.tsx`, the sidebar, the chapter
headers. «Частині 3» sends them looking for a division that is labelled «III» everywhere.
And «частина» is an ordinary common noun in Ukrainian, so the capital is simply wrong.

**Do not re-derive the old rule.** I once concluded from `ch0_1.path2` that «Частина»
takes a capital *when a numeral follows*. That is wrong and the user has now corrected it
twice. The numeral changes nothing about the case.

**How to apply:** both halves are enforced, so run them rather than trusting your eye —
`forbidden.course-part-capital-or-arabic` in
`.claude/skills/ua-translate/scripts/lint-ua-translation.mjs` covers Ukrainian (case *and*
numeral, with measured quantities like «частину 3 В батареї» excluded), and
`scripts/check-course-part-numbering.mjs` covers English. Both run under
`npm run check:all`. When one instance is flagged, grep the whole course — the first time
this surfaced it was in nine keys across ch0_1, ch0_2, ch0_3, ch1_11, ch2_1, ch2_2 and
`welcome`, never a one-off.

Related: [[project_i18n_editing_traps]] — these strings carry NBSPs
(`Частину 0`), so match NBSP-insensitively.
