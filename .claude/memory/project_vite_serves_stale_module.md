---
name: project-vite-serves-stale-module
description: The dev server can keep serving an old transform of one file, so a browser check confirms code that is no longer on disk
metadata:
  type: project
---

**A green browser check can be measuring a file you already replaced.** During the ch1.3
pass Vite kept serving a stale transform of one newly-created component: the module the
page executed had a different line map from the file on disk, so the geometry I measured
and the pixels I looked at belonged to an earlier revision. Everything I concluded from
that check was about code that no longer existed.

It does not announce itself. HMR reports success, the page repaints, and every *other*
file in the same edit is fresh — so the usual «did it reload?» sanity check passes.

**Confirm the served module before trusting a measurement**, whenever the file is new or
was created and edited within the same minute:

- Assert on something only the NEW revision can produce — a changed `viewBox`, a label
  that did not exist before, a `<g transform>` value the old code could not emit. If the
  DOM shows the old value, the transform is stale, not the layout.
- Force it with a cache-busting navigation (`location.href = url + '?cb=' + Date.now()`),
  which re-requests the module graph. A plain `location.reload()` did not clear it.
- Never restart the user's `npm run dev` to fix this — see
  [[feedback-visual-verification-via-chrome]]. The cache-busting reload is enough.

Related: [[feedback-verify-visually-before-done]] — the rule is look at the pixels; this
is the failure mode where you look and the pixels lie.
