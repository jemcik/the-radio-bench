---
name: project-hero-state-animation-starves-suspense
description: A chapter hero that setStates every animation frame can leave the chapter body on its Suspense spinner forever — no error, every gate green
metadata:
  type: project
---

**A chapter can hang on its loading spinner with no error anywhere because the hero
animates through React state.** `Ch1_3Hero` scrolled its sine with a `setState` per
`requestAnimationFrame` (shipped 2026-04-19, found 2026-09-17). The hero mounts in
`ChapterHeader`, outside the body's `<Suspense>`, so it is live while the body loads.
React 19 gives the body's Suspense *retry* render a lane that never expires; the hero's
default-priority update every 16 ms restarted that render, and whenever the body could
not finish inside one frame gap — a cold dev server, a slower machine, headless
Chromium — the spinner stayed forever.

Why nothing caught it: on a warm dev server the body squeezes through, so the author's
own browser showed the chapter; `test:visual` cannot tell a spinner from a chapter (zero
overlaps either way); jsdom has no animation frames; there is no thrown error, no
rejected promise, no console line. The Suspense fiber shows the fallback with a fully
rendered *hidden* primary tree and `lanes = 0` — and React's MessageChannel loop spins at
~250 posts/s. That signature = starvation, not a stuck promise.

**Rule (enforced by `check:animation-loop`):** every frame loop goes through
`useAnimationLoop` (`src/lib/hooks/`) — it runs only while the element is on screen, pauses
in a hidden tab and never starts under `prefers-reduced-motion`. A hero additionally writes
each frame through a ref (`setAttribute` / `style`), never a state update. Animations inside
the body may use state per frame (they start after the body commits), but the audit that
followed this bug found 21 loops running from mount to unmount whatever was on screen — an
idle chapter 1.3 tab at ~73 % main-thread busy — so the off-screen pause is not optional.

**Diagnosing a silent spinner next time**, in order: (1) `page.emulateMedia({ reducedMotion:
'reduce' })` — if the chapter appears, something animates through state outside the
boundary; (2) count `MessageChannel` posts after load — hundreds per second means a render
that never finishes, zero means a promise that never settles; (3) only then trap thenables.
Do not start from the served modules or the preamble — three hours went there first.

Related: [[project-vite-serves-stale-module]] (the warm server also masks this),
[[feedback-verify-visually-before-done]].
