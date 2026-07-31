---
name: no-politics-religion-patriotism-ideology-in-course-prose-ever
description: ch4.3 — user furious that a glossary entry said «the reason to prefer IEC over American sources is not patriotism»; NO ideological/values framing anywhere reader-visible
metadata: 
  node_type: memory
  type: feedback
  originSessionId: adb75137-2e98-440a-bc75-a212b6db086d
---

User was furious (ch4.3, emphatic, «щоб більше ніколи») that the `iec` glossary
entry contained: «The reason to prefer them over American sources is not
patriotism — it is that they describe the equipment actually sold here…». Even
negating «patriotism» is out of bounds — it drags an identity/ideology frame
into a radio-electronics course where it has no place.

**Why:** this is a technical course. Any mention of politics, religion,
patriotism, nationalism, nazism, or ideological/values framing is off-topic,
unprofessional, and (for a Ukrainian audience during wartime) can land very
badly. The user reacted to the STYLE as much as the word — «писати в такому
стилі» — so the ban covers the whole register, not just the one word.

**How to apply:**
- Never introduce a political/ideological concept in prose, glossary, callouts,
  captions, or reader-visible comments — not even to dismiss it. If you catch
  yourself writing «it's not [patriotism/politics/…] — it's [technical reason]»,
  delete the first half and state the technical reason plainly.
- Neutral geographic/standards descriptors are FINE and load-bearing: «the IEC /
  European standard», «the American UL convention», «sold in Ukraine and the EU».
  These are facts about where a convention originates (IEC vs UL rating rules,
  ICNIRP vs FCC exposure tiers), not value judgements — the chapter genuinely
  needs them to explain why US ham advice doesn't transfer. The banned thing is
  editorial framing around identity/ideology, not naming a country's standard.
- Kill the «not X — it's Y» rhetorical strawman as a class (see also the ch4.3
  intro post-mortem: writing for «voice» instead of teaching). If the point is
  Y, just say Y.

Recorded as a hard rule in CLAUDE.md § «Prose & i18n discipline». Verified clean:
`grep -riE 'патріот|patriot|нацизм|nazi|реліг|relig' src/` → none.
See [[feedback_no_syllabus_meta_in_prose]].
