---
name: Lint warnings are bugs until proven otherwise — never «contextual, acceptable»
description: User has been burned multiple times in one session by my dismissing lint warnings as «false positive in this context» when they were in fact bugs that rendered visibly badly. Treat every warning as a real bug; either fix or write down WHY it is benign with proof.
type: feedback
originSessionId: 1ec18fa1-c3aa-4c6e-8e4e-5bdcbe77df01
---
A lint warning is the system telling you «this MIGHT render incorrectly».
The default response must be: triage every warning, fix it or document
explicitly why it is safe in THIS context. NEVER dismiss as «contextual,
acceptable» without verifying the claim end-to-end.

**Why:** Across the ch1.7 build I dismissed `markup.bare-subscript-pattern`
warnings on the grounds «no Trans/KaTeX in this render path, false-positive».
Wrong on every count — those strings were rendered as plain JSX text
(`<span>{display}</span>` in Section, `<p>{description}</p>` in Widget,
SVG `<text>{t(...)}</text>` in plot markers) and showed up as literal
«X_L = X_C» with underscore characters in the UI. The user had to flag
each one individually across multiple turns. Cumulative cost: a whole
review session unwinding what should have been caught at draft time.

**How to apply:**
- After `npm run check:uk` (or any other linter): treat every warning as a
  defect to triage. For each warning, either:
  1. Fix the string (rephrase, use Unicode subscripts, switch to
     `<var>X_{\\mathrm{L}}</var>` markup), OR
  2. Verify the render path: open every JSX call site that interpolates
     the value and confirm it goes through a wrapper (`withSubscripts` /
     `withSubscriptsSvg` / `<MathText>` / `<Trans>` with `<var>`
     mapping) before claiming «safe».
- A code-side gate now exists: `npm run check:bare-subscripts` runs
  `scripts/check-bare-subscript-renders.mjs`, which scans `.tsx` for raw
  `{t('flagged-key')}` interpolations and ERRORs if not wrapped.
  This is part of `check:all`. Future bare-subscript bugs cannot ship.
- The contract for plain-string i18n values containing `X_Y` patterns:
  every interpolation must explicitly wrap. Auto-wrap inside container
  components (Widget, etc.) is intentionally NOT used — the wrapper
  appears at the call site so a future reader sees the subscript
  handling without inspecting deep components.
- ARIA-only / never-rendered strings are the only legitimate exception.
  These can keep the bare form, but each should be commented or
  documented if they trigger the warning.

This rule generalises beyond subscripts: every linter warning should be
triaged with the same skepticism. «Contextual / false-positive»
self-talk is the failure mode that produces visible UI bugs.
