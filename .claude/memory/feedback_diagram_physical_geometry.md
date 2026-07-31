---
name: feedback_diagram_physical_geometry
description: "Scene-diagram physical correctness (antennas on the surface, rays meeting feed points) is a failure class no gate catches — verify with eyes, drive geometry from one source of truth"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 302ab6e4-48fd-40e3-982b-d46a5f2dd860
---

On ch4.1 the user rejected the whole first diagram set: antennas floated above / sank below the curved earth, an RX pointed **down** below the surface, ray endpoints didn't meet the masts, and labels sat far from their referents. All this shipped with every gate green.

**Why:** the overlap/label gates (`diagram-text-overlap` et al.) only check text-bbox vs foreground-shape collisions and font floors. They do NOT check *physical/geometric* correctness — whether an antenna base lands on the surface curve, whether a ray ends at an antenna feed, whether a bounce touches the ground. I placed antennas at fixed `y` while the surface was a curve, so they floated. Gates can't catch this class; only looking at the pixels (Claude-in-Chrome, zoomed) can.

**Fix pattern (now in `src/components/diagrams/scene-earth.tsx`):** one source of truth for the geometry. The earth surface is an exact parabola; `surfaceY(x)` is evaluated from the SAME quadratic that draws the `stroke`/`fill` path, so an antenna rooted at `surfaceY(x)` and a ray endpoint from `feed(x, surfaceY(x), h)` sit pixel-perfect on the drawn curve. `surfaceArc(E,x0,x1,dy)` draws a band that hugs the curve (a Q-Bézier — also invisible to the edge-rail sampler). Trace filled earth **bottom-edge first** (`M 0 H L W H L W yEdge Q … Z`) so the overlap gate's M/L-only reconstruction sees the bottom+right edges, not a phantom corner-to-corner diagonal.

**How to apply:** for any scene diagram with a ground/sea + antennas + rays, reuse `scene-earth.tsx`. Never place an element on a curved surface with a literal `y`. After building, LOOK (zoom on antenna feet + ray joins), don't just trust green gates. Reinforces [[feedback_verify_visually_before_done]] and [[feedback_diagram_overlap_browser_geometry]] — this is the geometric-correctness sibling of those. Consider extending diagram-quality/references/common-failures.md with it.

Also: a hero must not duplicate an in-chapter diagram (ch4.1 hero first drew the same ionosphere-skip scene as the §1 ThreeModes diagram; user asked for a distinct concept → reframed as a frequency-spectrum→propagation strip).
