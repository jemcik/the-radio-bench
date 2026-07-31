---
name: project_glossary_common_word_collisions
description: Adding a common English word to glossary.ts imposes a course-wide wrapping obligation AND can collide semantically with an unrelated meaning in other chapters
metadata: 
  node_type: memory
  type: project
  originSessionId: 9612685c-dd07-42c7-a9b4-0147d5b16d01
  modified: 2026-07-20T15:04:00.111Z
---

Adding an entry to `src/features/glossary/glossary.ts` makes `check:glossary-coverage`
demand a `<G>` wrap of the **first occurrence in every chapter that mentions the word**.
For a common English word this is not just churn — it can be **semantically wrong**.

Found while building ch 4.4 (2026-07-20). Proposed keys `log`, `prefix`, `net` would have
matched:
- `log` — 31 mentions in ch0_4 (decibels) + 18 in ch1_8 (filters) = **logarithm**, not station log
- `prefix` — 16 mentions in ch0_3 = **SI prefixes** (kilo-, milli-), not call-sign prefix
- `net` — 7 in ch1_1 = **net charge**, not an on-air net

A reader hovering «log» in the decibel chapter would have got «a record of contacts».

**How to apply:** before adding a glossary key, run
`node scripts/check-glossary-coverage.mjs` and read the per-chapter hits. If the word
lands in chapters where it means something else, **rename the key to a phrase that cannot
collide** (`logbook`, `call sign prefix`, `radio net`) rather than wrapping it there.
Renaming also changes how the prose must read — write «logbook», not «log».

For a term that genuinely means the same thing across many chapters (`ham`, 10 chapters),
the codebase's own convention is `EXEMPT_TERMS` in `scripts/check-glossary-coverage.mjs`
— its comment says entries "still exist; they just don't have to be wrapped in every
chapter that mentions them". `ham radio`, `qso`, `qrp`, `arrl`, `cept` were already there.

Full entry contract is four artifacts, enforced by `check-glossary-completeness`:
`glossary.ts` entry + `en:glossary._names.<key>` + `uk:glossary._names.<key>` +
`uk:glossary.<key>.{tip,detail}`. UA content is keyed by the **short key**, not the
display name. See [[ua_translation_workflow]] and [[project_glossary_translate_stale_dump]].
