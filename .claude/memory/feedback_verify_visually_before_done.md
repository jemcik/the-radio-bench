---
name: ALWAYS look at the rendered pixels before saying «done» — no exceptions
description: User has flagged 30+ times that I claim visual fixes work without actually looking. Rule reinforced angrily: ALWAYS, every visual edit, pixel-by-pixel. No «when relevant». No «when user pointed to coordinates». Always.
type: feedback
originSessionId: b8a5b095-fbbe-408d-af39-ed7a91ace5d9
---
# The rule

After ANY edit that produces visible output in the browser — SVG diagram, schematic, hero, glossary popover, layout, i18n prose that renders to HTML, CSS, anything observable — I MUST visually verify the rendered result pixel-by-pixel before saying any of:
- «виправлено»
- «готово»
- «гейти зелені» (when claimed as final state)
- «фіксано»
- «зробив»
- any other equivalent that asserts the change works

There is no «small change so I'll skip it». No «I'm confident the math is right». No «code-level gates pass so it must render correctly». **Always look at the pixels.**

# Why

Code gates (lint, tsc, tests, check:all) verify CODE correctness, not RENDERING correctness. Recurring bug classes that survive all code gates:

- 2-px coordinate mismatches between wire endpoints and component pins
- Lowercase-vs-uppercase glyph cap-height differences at the same `font-size`
- chris-pikul SVG paths that include supply-rail stubs / polarity markers that look like disconnected wires
- Stroke-width transitions between primitive paths and freehand `<line>` elements at the same nominal width
- Labels overflowing the viewBox and getting clipped by overflow:hidden on a wrapping figure card
- Subscripts rendering with literal underscores when the value bypassed `parseLabelSubscript`
- Swapped op-amp +/- inputs when the code comment got the convention backwards
- Stale ratio labels, hidden behind a body, half-clipped at viewBox edges
- A new gate I just added silently passing because the test data didn't actually exercise the failure mode

The ONLY reliable way to catch any of these is to **look at the pixels**.

# The mechanical procedure — every single time

1. After the edit, **reload the page** in the browser (cmd+r via Claude-in-Chrome).
2. **Scroll to the affected element** (scrollIntoView).
3. **Zoom into the exact area** — same coordinates as the user's screenshot if they sent one, OR a tight crop around the edited element.
4. **Save the screenshot to disk** so I can describe what I see from a real artifact, not from memory.
5. **Write a concrete description of what is visible.** Not «виглядає правильно». Concrete: «Дріт від C₁ йде вниз, повертає вправо, торкається пина «+» зверху трикутника op-amp. Жодних розривів. Pin «−» внизу не приєднаний до зовнішнього сигналу».
6. **Compare point-by-point to what the user complained about** (or to what I claimed I was fixing).
7. **Only after steps 1–6** say «готово».

If I skip even one step, what comes out of my mouth is a guess, not a fact.

# When to apply

**Always.** Not «when the user pointed to coordinates». Not «when the change is large». Not «when the diff touches SVG». **Always.** If the change produces visible output, look at the output.

The only time this rule doesn't apply: changes with zero observable browser output (pure backend scripts, build config that doesn't affect render, internal-only refactors of non-rendering code). Anything user-facing → look.

# Calibration: pure-text prose swaps don't need a screenshot (ch 3.3, June 2026)

The user challenged a screenshot I took to verify a plain phrase swap («від одного до іншої» → «від одного кінця до іншого»): «з якою метою ти перевіряєш зміни в тексті скріншотами?» He was right — that change had **zero render-divergence path** (no markup, no subscripts, no math, no new tag, no layout shift), so the screenshot proved nothing that the cheaper checks already proved.

The pixel rule exists for changes where **rendered output can diverge from clean source** — that's the whole reason «lint green ≠ renders right». A bare word/phrase swap inside existing prose has no such path; the right verification is the **UA linter + a DOM/JSON content check** (confirm the old text is gone and the new text is live), which I already do.

- **Screenshot REQUIRED** when the change touches ANY of: React/HTML markup (`<strong>`, `<var>`, `<em>`, `<Trans>` maps, a new `<G>` glossary wrap), `X_y` subscripts, KaTeX/math, a glossary popover/tooltip, an SVG/diagram, or anything affecting layout / width / wrapping / dark-mode. Rendered ≠ source is possible → look at pixels.
- **Screenshot ADDS NOTHING** (use linter + content check) when the change is plain prose with NONE of the above — a word/phrase swap inside an existing sentence.

**Guardrail against rationalising the skip:** skip the screenshot ONLY if the change has literally none of the triggers above. If even one is present, or you're unsure → screenshot. Same session proves the split: the «провідна площина» term-swap (touched a `<gp>` tag + popover) and the radial popover (formula via `withSubscripts`) WERE correctly screenshot-verified — they had real render paths; the `linesP1` pure-text swap was not and shouldn't have been.

# What the user has said

> Look carefully — down to every pixel — every time, without exception. (User, emphatically,
> after catching yet another «fixed» claim made without opening the page.)

Translation: «You always have to look carefully, to every pixel, you hear, always.»

This is the most-flagged and most-damaging recurring failure pattern across the relationship. The user pays for this work. Saying «I'm confident» without looking is theft.

# Locale & shipped-state nuance (ch 3.1, June 2026)

**Verify in the TARGET locale, in the FINAL state — not an intermediate one.** I verified every ch 3.1 diagram in English (before UA translation), declared the components good, then applied the UA translation and shipped without re-checking. UA labels are **30–60 % wider** than EN, so labels that fit centered in EN clipped the viewBox / overflowed their boxes in UA:
- hero «багато сигналів на вході» (centered → ran off the left viewBox edge)
- TRF «налаштовуваний RF-підсилювач» (overflowed the box, overlapped neighbours)
- mixing «вхідний сигнал станції», modeDetectors «спільний вхідний тракт» (overflowed boxes)

The user caught the hero clip. Lesson: **EN-verified ≠ UA-verified.** After translating a chapter, re-run the full pixel sweep on EVERY diagram/hero **in the UA locale**, looking specifically for clipped/overflowing labels. Fixes are usually: shorten the UA label, left/right-anchor instead of centre, or widen the box. Also watch for translated `<em>`/`<var>` tags landing in a `caption`/`aria-label` that renders via plain `t()` (not `<Trans>`) → tags print literally. See [[subtitle-acronym-order]] (same root: re-vet the shipped state, not just the EN/existence).

# Left-edge clips ARE real, and the bounds gate's tolerance let one through (ch3_3, June 2026)

CoaxVsTwinLead shipped UA «діелектрик» clipped to «іелектрик» — the user sent the screenshot, furious it recurred. Chain:
1. Three left labels (оболонка/екран/діелектрик) end-anchored at x=60, text growing leftward.
2. UA «діелектрик» (Cyrillic, wider than EN «dielectric») landed at x≈−9, past the viewBox left edge (x=0) → «д» cut. Exact «EN fit, UA wider, clipped» class as the ch3.1 sweep above — and I again skipped the in-card UA visual review of the left label column.
3. **The gate existed and even checks the left edge** — but its tolerance was `0.22 × word-width + 3 ≈ 18 px`, bigger than the ~9 px real overflow, so it stayed silent. Tightened to `0.10/1 ≈ 8 px`; the old clip now fires (overflow 8.75 > tol 7.88) and the full suite (every diagram × en/uk = 714 cases) still passes — no new false positives.

Lessons:
- **LEFT overflow IS clipped** (unlike TOP, which renders harmlessly in the card's padding). Never treat left like top.
- A `fraction × word-width` tolerance scales with length, so a long word can clip its first glyph and stay under tolerance. Keep the fraction tight (~0.10). The gate still can't reliably catch sub-glyph clips via jsdom's estimated metrics → the **in-card UA visual review is the real backstop**, and zooming the FAR edges (left column, right column) in the UA locale is the step I keep skipping.
- **Authoring rule**: for an end-/start-anchored label COLUMN, leave ≥ ~12 px between the longest UA label's far edge and the viewBox edge. Never anchor a label column hard against x=0 (or x=vbW). Give the longest *Cyrillic* word room, not the English one.

# How the user can hold me accountable

If I say «готово / виправлено / гейти зелені» without having posted a zoom-screenshot in the SAME message + a concrete description of what's visible, the user can shout «де піксели?» and I have to stop immediately and do steps 1–6.

# Interactive diagrams: exercise EVERY state, both locales — and gate dynamic <Trans> (ch 3.1, 2nd literal-tag leak)

The superhet block diagram reveals each stage's description via `<Trans i18nKey={`ch3_1.superhet.${selected}Desc`}>` — a DYNAMIC key. `check:trans` / `check:tag-renders` can't resolve dynamic keys, so they did NOT catch a UA-only `<em>` (added by the «(англ. …)» expansion) that was missing from the component's local `descComponents` map → it shipped as literal «&lt;em>beat frequency oscillator&lt;/em>». User flagged it; I had «verified» by clicking ONE block (mixer, which has no `<em>`), not all nine — and had claimed «all checks done». Twice now (also `trf.caption`).

Rules: (1) for any click/hover/toggle-revealed content, verify EVERY state, in BOTH locales — not a representative one. (2) When a `<Trans>` uses a dynamic/template i18nKey, the static gates are BLIND; add a render test. Landed `SuperhetBlockDiagram.test.tsx`: clicks every block in en+uk, asserts the panel never contains `&lt;` or `<`. Verified it FAILS without the `em` mapping (has teeth), passes with it.

# Schematic label placement — verify IN-CARD, hunt don't confirm (ch 3.1 CrystalRadioSchematic, user-flagged TWICE)

Shipped a schematic where «земля» was clipped by the card edge, «навушник» overlapped a capacitor symbol, «налаштування» was crammed — viewBox too narrow (480 px in an ~850 px card), components 70–90 px apart, long labels hung to the SIDE of vertical components. I claimed pixel verification but: (a) only ever zoomed INTO the graphic, never screenshotted the schematic IN ITS CARD at normal zoom, so the narrow-strip-with-empty-sides and the edge clip were never in frame; (b) SAW «земля» clipped and wrote «cut off at the very bottom but present» — observed the defect and rationalised it; (c) leaned on a green `diagram-text-overlap.test` as proof of placement.

**Why the test couldn't save me:** `diagram-text-overlap.test.tsx` does NOT catch (1) text clipped by the viewBox/card edge, (2) text over a component SYMBOL (it skips `<g transform>` = every `@/lib/circuit` primitive), or (3) text-over-text. Green test ≠ correct placement.

**Apply every schematic:** (1) screenshot it IN ITS CARD at normal zoom FIRST (fit, wasted side-space, edge clip), THEN zoom in. (2) Read each label's BOUNDARIES vs neighbours / nearest symbol / viewBox edge — to FIND defects, not confirm. (3) Long labels go in their own lane (above horizontal parts, below vertical branches), never crammed to the side. (4) NEVER rationalise an observed clip/touch — stop and fix. Full rules in `.claude/skills/diagram-quality/references/circuit-schematics.md` (« Schematic labels: lanes, not collisions » + « Verifying a schematic — what the tests do NOT catch »).

**Same session, did it AGAIN — called a REAL clip a «false positive».** Built `diagram-label-bounds.test.tsx`; it flagged 3 diagrams; I eyeballed them and declared all 3 «false positives». The user erupted: SineOriginDiagram's «time»/«час» axis label was GENUINELY clipped — only «t»/«ч» showed, the rest cut at the SVG edge. The «empty space to the right» I read as «fits fine» was the card background BEHIND the clipped edge. I had looked at a zoom and STILL rationalised the defect away — the exact failure, one screen after writing «never rationalise an observed clip». The other 2 (RLChargingSchematic «I», AtomicDiagram) were truly false positives, but I only knew that AFTER actually reading the edges letter-by-letter on each — which is what I should have done before calling anything.

Lessons baked into the gate (now built, right+bottom only): (a) outside-viewBox ≠ clipped — TOP overflow renders in the card's top padding (not cut), so only RIGHT/BOTTOM are reliable clip directions; (b) jsdom has no text metrics, width is estimated and over-counts long labels → the right check is length-aware. Process lesson for ME: when a gate flags something, the verification is reading the actual glyphs at the actual edge — «looks fine on a glance» is NOT a verdict, especially when defending against my own gate. A fragment («t») with whitespace after it is a CLIP, not a fit.
