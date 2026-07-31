---
name: national-content-is-marked-never-hidden-from-the-en-locale
description: "ch4.3 decision — Ukraine-specific rules (ПУЕ/ДСТУ/ПЗВ/НКЕК) stay visible in both locales, scoped in the first clause and marked in the visual; language is not location"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: adb75137-2e98-440a-bc75-a212b6db086d
---

User asked (ch4.3, 2026-07) whether EN readers could be shown *no* Ukraine-specific
rules/norms. Answer landed on **mark, don't hide** — his choice after I laid out the
tradeoffs.

**Why:** language ≠ location. Many Ukrainian engineers read technical material in
English by preference, so gating national rules on locale would hide «жовта шина =
фаза» (ПУЕ 1.1.30) from a reader standing in front of a Ukrainian switchboard who
merely picked the EN toggle — the exact person at risk. The EN reader abroad is
already safe, because the text says «Ukraine's own wiring rules» right there.

Two further reasons hiding was wrong:
- It isn't a render gate. §2's argument is a chain (code → ПУЕ busbar trap → Soviet
  wiring has no PE → *therefore* colour is never evidence). Cut the middle in EN and
  the conclusion has nothing holding it up → EN needs its own bridging prose →
  locale-divergent content, which breaks the EN-authored → UA-translated model that
  `ua-translate`, `check:i18n` parity and quiz parity all assume.
- **Ch 4.5 (Regulations) is entirely national** — under a hide-in-EN rule it renders
  empty.

**How to apply:**
1. Scope national content **in its first clause** («In Ukraine…», «Ukraine's own
   wiring rules…»), not buried mid-paragraph.
2. Mark it **in the visual too** — a reader scanning a figure never reaches the
   figcaption. ch4.3's `MainsColourCode` titles its panels «In a cable — the
   harmonised code» vs «On a busbar — Ukraine only» (red border + red title).
3. Regulator/band-plan rules → `onair` callout (`ch3_2.ampOnair` + НКЕК is the
   model; ch0_1 documents the variant as «Regulator rules, band plans»).
   Safety-critical national facts keep `danger`.
4. Use each locale's own name for a thing (EN «RCD» / UA «ПЗВ») rather than forcing
   one spelling on both — especially in quiz values, whose render path carries no
   glossary aliases so a bare «ПЗВ» in EN is unexplained *and* unwrappable.

Recorded in CLAUDE.md § «Conventions & non-derivable facts» in the same pass.
See [[feedback_no_syllabus_meta_in_prose]].
