---
name: feedback_no_condescension_explain_standards
description: "NEVER attribute error/incompetence to hams, the reader, or anyone in prose ('hams routinely get this wrong', 'better than any amateur manages', 'most people fit the wrong X'); user has flagged this class 2+ times, emphatic. Sweep the WHOLE chapter for it, don't wait to be caught."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: adb75137-2e98-440a-bc75-a212b6db086d
  modified: 2026-07-19T16:06:08.778Z
---

**RECURRING — flagged 2+ times, second time with real fury («тупий довбойоб…
на ОДНІ І ТІ САМІ помилки»).** The offense is one class, broader than standards:
**attributing error or incompetence to hams / the reader / "most people".**

Instances found in ch4.3 (all pre-existing chapter debt, surfaced one-by-one):
- `mainsP7` (fuse): «радіоаматори зазвичай помиляються в обох» + «Не робіть цього».
- `rfP7` (RF arithmetic): «арифметика, у якій радіоаматори постійно помиляються»
  — **nothing to do with standards**, which is why the too-narrow first version
  of this memory missed it.
- `lightP5`: «краще, ніж вдається майже будь-якому радіоаматору» (amateur-centering).
- `mainsP1`: «люди встановлюють запобіжники неправильного номіналу» (blame tail).
- `mainsP12`: «його часто розуміють неправильно» ("widely misunderstood").

**Lesson: when the user flags ONE instance, grep the WHOLE chapter for the class
immediately** — EN and UA — and fix every hit in the same pass. Patterns:
`радіоаматор.*помил`, `помиляються`, `більшість (людей|радіоаматор)`,
`неправильно (розумі|вважа)`, `\bhams?\b.*(wrong|get)`, `most people`,
`reliably get wrong`, `widely misunderstood`, `better than.*amateur`.

The fuse case ALSO needed the "why the standard exists" explanation (below);
but the core rule is simpler and universal: **never say people get it wrong.**

**Why:** condescension toward the reader (or the people the advice was written
for) is unpleasant and unteacherly, and a rule presented as arbitrary-but-wrong
teaches nothing. When two national standards genuinely differ (IEC vs UL,
ICNIRP vs FCC, ДСТУ vs NEC — a recurring theme in this course), the honest and
useful framing is: **each is correct in its own context; here is the mechanism
that makes them differ; here is why one doesn't transfer.**

**How to apply:**
- Never imply the reader (or hams, or Americans, or anyone) is stupid for
  following advice. If people commonly get X wrong, explain the *reason the
  mistake is easy* — usually "the advice you'll read was written for a different
  standard than the hardware you're holding" — not "people get it wrong."
- When you say "don't use rule X here," you owe the reader: what X is, why X
  exists, why X is *correct where it comes from*, and the specific mechanism by
  which it fails in the new context. (Fuse example: a UL fuse's printed number
  is ~135 % of what it carries continuously, so the US "125–150 % of running
  current" rule lands the running current right — it's correct for UL fuses; an
  IEC fuse carries its full printed rating, so the same rule oversizes it 25–50 %.)
- No scolding imperatives («Не робіть цього») and no sneering asides
  («маскується під добру пораду»). State the mechanism; let it carry the point.

This is the constructive twin of [[feedback_no_ideology_in_prose]] and
[[feedback_national_content_marked_not_hidden]]: standards differences are
described neutrally AND explained, never used to rank people or countries.
