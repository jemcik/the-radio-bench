---
name: text-touching-a-block-edge-gate-blind-spot-fixed
description: diagram-text-overlap jsdom gate under-measured wide short Cyrillic and only checked overflow (not clearance); a label flush against its box passed the gate but the user rejected it
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a8702b8b-0702-4153-b76d-96165932d08c
---

Shipped ch4.2 `FilterPlacementDiagram` with the UK «мережа» label flush against its 48-px block (0-ish px clearance). I wrote «притиснуто, але гейт пройшов» and moved on — the exact «trust the gate, not the pixels» failure the memory warns about. User rejected it: a block label needs **≥2–3 px clearance** on each side, not «just fits».

**Why the gate (`diagram-text-overlap.test.tsx`, «label fits its own block») missed it:**
1. It flagged only when the label **overflowed** the box edge (`spill > 3`); a label that touches but stays inside slipped through.
2. Its width estimate is `chars × fontSize × 0.55` (flat sans average). 0.55 **under-measures short strings of wide glyphs** (мережа = м, ж are wide) and over-measures long/narrow ones — so «мережа» estimated ~2.5 px clearance when the real render had ~0.

**Fix applied to the gate (keep it):**
- Per-glyph width factor for the fit check: WIDE `мшщжфюъыёМШЩЖФЮЪЫWMmw@%&` → 0.72, NARROW `іїjlItr.,:;'’!|() -` → 0.36, else 0.55. This distinguishes touching «мережа» from the fine-but-long «детектування»/«Noise: supplies, motors» that a flat ×1.1 fatten falsely flagged.
- Require **≥2 px clearance for CENTRED labels** (`Math.abs(cx − boxCentre) < 0.15·boxW`), PLUS the overflow check for all. Edge-anchored labels (a scope readout hugging its panel's left edge, textAnchor start/end) are exempt from the clearance rule — only overflow applies — else you false-flag them.

**Process lesson (the real one):** the jsdom gate is a coarse net; ground truth is `getBoundingClientRect` in the real browser. After any diagram edit, run the browser audit that checks BOTH svg-spill AND text-vs-own-block clearance (min gap < 2 px, centred only) — see the detector I used, it caught «ZERO SPILL / ZERO BLOCK-TOUCH» only after the box was widened. Never ship a label «притиснуто до рамки». Related: [[feedback_diagram_overlap_browser_geometry]], [[feedback_verify_visually_before_done]], [[feedback_wires_must_touch_pins]].

Same round the user also caught: a bare-SVG wire ending 4 px short of the box it should join (FilterPlacement mains riser y=80 vs TV box bottom y=76 → fixed to y=76, gap 0) — the `check:wire-pin-alignment` gate only covers `@/lib/circuit` primitives, NOT hand-drawn `<line>`/`<path>` in scene diagrams, so **eyeball every wire endpoint in bare-SVG diagrams**. And: an unlabelled hero motif (ferrite bead on a dangling cable) that read as «a wire with an oval rectangle» — a hero must read on first glance; drop any element that needs a caption to parse.

**Same round, third catch — badges/labels riding a path:** I hand-placed the path-number badges in `CouplingPathsExplorer` by eye; badges 2 & 3 (placed at a computed midpoint) sat on their lines, but 1 & 4 (eyeballed) were 8–12 px off — visibly inconsistent, user «дратує». Root-cause fix: never hand-place an annotation that must sit ON a line/curve — compute it from the geometry. In the browser, put the badge at `pathEl.getPointAtLength(L/2)` in a `useEffect` (guard for jsdom, which has no `getTotalLength`/`getPointAtLength` — keep a static on-line fallback). Then it's exact for every path and can't drift when a `d` is later tweaked. Applies to any label/marker anchored to a rendered path.
