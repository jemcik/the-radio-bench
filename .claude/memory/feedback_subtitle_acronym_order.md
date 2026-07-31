---
name: subtitle-acronym-order
description: "chapterSubtitles/chapterTitles must lead with the expanded UA term, acronym+English in parens after — never bare-acronym-first; re-vet pre-existing metadata when shipping a chapter"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 04b5987e-99ff-4567-b80d-2c7d4049b21f
---

User flagged (June 2026, ch 3.1) that `chapterSubtitles.3-1` (uk) read «TRF (приймач прямого підсилення), супергетеродин, …» — a bare acronym leading the line, with the UA expansion in parens *after*. User called it «рагульство» and gave the correct form: «Приймач прямого підсилення (TRF, англ. tuned radio frequency), супергетеродин, …».

**The rule:** a UA subtitle/title (and prose) must lead with the **expanded Ukrainian term**, then the acronym + English original in parens — «Повна українська назва (ACR, англ. full english form)». NEVER «ACR (українська назва)» with the acronym first. Same first-mention-explicitness bar as body prose — see [[feedback_first_mention_explicitness]].

**Why I missed it:** the offending string was NOT written this session — it shipped in a prior commit (#50, ERC 32 audit). My chapter pre-flight cross-checks that `chapterTitles`/`chapterSubtitles` *exist* (parity scripts can't see them), but I only verified existence, not **quality**.

**How to apply:** when shipping ANY chapter, treat the pre-existing `chapterTitles.{id}` and `chapterSubtitles.{id}` (both locales) as in-scope for review — read them as a beginner, apply the bare-leading-acronym / introduce-before-use check, fix to the «term (ACR, англ. …)» order. Do this even if I didn't author them; "it was already in HEAD" is not a pass. Not mechanically linted (acronyms legitimately appear mid-string), so it's a manual gate.
