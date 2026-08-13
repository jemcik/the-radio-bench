---
name: project-diagram-gates-measure-bboxes-not-ink
description: Two diagram gates judge a layout by bounding boxes, not by drawn ink — an L-shaped wire blocks its whole rectangle, and label text is invisible to the viewBox-fit check
metadata:
  type: project
---

Two of the diagram gates reason about **bounding boxes**, not about where the ink
actually is. Both cost a full layout redesign on ch1.2's `OhmLabSchematic` before
the cause was clear.

**1. `npm run test:visual` — `T×PATH` compares a label against a whole `<path>` bbox.**
A `<Wire>` with a corner (`bat.p1 → {x:55,y:47} → amm.p1`) is ONE path whose bbox is
the entire 85 × 45 rectangle the L spans — including the empty quadrant no stroke
passes through. A caption placed in that empty quadrant is reported as
`T×PATH "amps, step 3"` even though nothing is drawn near it. The exemption
(`centreIn`) only fires when the label's centre is inside the bbox, which a label
sitting just outside the corner never is.

Fix the layout, don't re-baseline: move the label out of the *rectangle*, not just
off the *stroke*. The ch1.2 ammeter caption ended up ABOVE its meter for exactly
this reason — below it, the corner wire from the cell owns the whole band.

**2. `check:diagram-viewbox-fit` cannot see `TerminalLabel` text at all.**
It parses x coordinates out of the source (component props, `pins2(...)`, wire
points) and demands `canvas_w − (max_x + 40) ≤ 80`. A caption to the RIGHT of the
rightmost symbol needs canvas width the gate scores as dead space, so a layout that
looks correct in the browser fails. The fix is to spread the *symbols* across the
canvas (put series elements along the rail) rather than to widen the canvas for a
label — or, if the design is genuinely correct, add the file to `SKIP_FILES` with a
one-line note.

Corollary for both: run `npm run test:visual` and `npm run check:all` **before**
polishing a new diagram's pixels, so a forced relayout does not throw away the
polish. And measure the real collision in the browser rather than guessing which
element is at fault — the `getBoundingClientRect` loop over `text` × `path` in the
page names the exact `d` attribute in one call.

Related: [[feedback-diagram-overlap-browser-geometry]],
[[feedback-text-touching-block-edge]], [[feedback-verify-visually-before-done]].
