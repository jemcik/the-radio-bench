---
name: feedback_glossary_no_reader_position
description: "Glossary entries are reached from ANY chapter — they must never assume which chapter/widget the reader is currently on (\"we'll cover in 1.9\", \"in this chapter\", \"the widget in this section\")"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: adb75137-2e98-440a-bc75-a212b6db086d
---

ch4.3 — user flagged the `transformer` glossary entry saying «Ми детально
розглянемо їх у розділі 1.9» (We'll cover them in detail in Chapter 1.9) as
«чистий ідіотизм»: a glossary popover fires from any chapter, so a
future-tense «we'll cover» only makes sense to someone reading *before* 1.9.
He asked to fix it **and find all similar cases** — «У довідці не повинно бути
якихось припущень щодо того, на якому розділі ми зараз».

**Why:** the glossary is context-free reference material. Any phrasing that
assumes the reader's position in the course is wrong for most of the readers
who will actually see it.

**How to apply — BANNED in glossary tip/detail (both `glossary.ts` EN and the
`glossary` block of `uk/ui.json`):**
- Course-narrator sequence: «we cover / we design / we work / we'll / ми
  розглянемо / ми працюємо / детально розглянемо».
- Reader-did-it past tense: «the field you wound in Chapter 1.6 / поле, яке ви
  створювали в розділі 1.6».
- Current-position words: «in this chapter / this section / the widget in this
  section / у цьому розділі / у віджеті цього розділу / внесок у цей розділ / тут».

**ALLOWED — neutral cross-references (a place to look, no position assumed):**
- «Chapter 1.8 covers filter design» / «is the subject of Chapter 1.10» /
  «(Chapter 1.6)» / «Детально їх розглянуто в розділі 1.9» / «Докладніше — у
  розділі 1.10».

**NOT position assumptions (leave alone) — these caught my regex but are fine:**
- External literature: «you'll see it in physics textbooks / які ви бачили в
  підручниках».
- Whole-course scope with no section: «In this course we use it as… / У цьому
  курсі ми використовуємо…».
- Measurement results: «ви побачите падіння напруги» (what the meter shows).
- Frequency/value comparisons: «вище/нижче частоти зрізу» (NOT «see above»).

Fixed 10 sentences across 9 entries (transformer, filter, rectification,
self-inductance, magnetic field, iec, nfpa, rsgb, forward voltage drop). UA
side spliced sentence-by-sentence via Gemini (never whole-entry re-translate —
that clobbers the untouched prose). See [[ua_translation_workflow]],
[[feedback_no_ideology_in_prose]].
