---
name: no-syllabus-meta-in-reader-prose
description: "ERC 32 coverage notes («purpose only», «the syllabus requires X») are author scoping notes — never copy them into reader-facing chapter text"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 04b5987e-99ff-4567-b80d-2c7d4049b21f
---

Ch 3.1, user-flagged (angrily): I copied the ERC 32 syllabus scoping phrase «Squelch (purpose only)» straight into the reader-facing squelch description as «(Лише призначення — програма не вимагає більшого.)», and similarly «програма вказує його як обовʼязковий каскад» in the power-supply block. To a reader this is meaningless meta — «what program? why are you telling me how deep the exam goes?». Removed both (EN + UA).

**Why:** ERC 32 phrases like «(purpose only)», «block-diagram treatment only», «the syllabus lists X as a required stage» tell ME how deep to cover a topic. They are NOT content. The reader wants to understand the radio, not the exam's coverage rules.

**How to apply:** when drafting chapter prose from the syllabus, strip every coverage/scoping note. The test for any sentence: does it help the reader understand the *thing*, or only describe what the *exam asks*? If the latter, cut it. **Exception that IS fine:** bridging an exam TERM to a handbook term — «the syllabus calls it the HF amplifier; handbooks call it the RF amplifier — same stage» — that teaches a real terminology mapping the reader will encounter. Related: [[first-mention-explicitness]] (reader-facing prose discipline).

**Recurrence (same Ch 3.1, days later): the meta lives in TWO places.** I removed the scoping notes from the diagram BLOCK descriptions (`ch3_1.superhet.*Desc`) but the SAME sentence survived in the GLOSSARY `detail` fields (`local oscillator`: «…що в програмі іспиту названо "генератор, фіксований та змінний"»; `squelch`: «Програма іспиту вимагає знати лише його призначення, а не схемотехніку»). The reader sees the glossary `detail` in the term popover, so it shipped. **When you cut exam-scoping meta, don't just fix the one string you're looking at — grep the distinctive phrase across the WHOLE locale file AND `glossary.ts`** (`grep -rn "іспит\|програм\|syllabus\|exam" src/i18n/locales/ src/features/glossary/`), because a stage usually has both a block description and a glossary entry, and they were authored from the same source sentence. Fix EN (`glossary.ts`) + UA (`uk/ui.json`) together to keep parity. Verify the popover renders clean (pixel-check the term popover, not just the block).
