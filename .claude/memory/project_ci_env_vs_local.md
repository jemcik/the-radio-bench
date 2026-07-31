---
name: project_ci_env_vs_local
description: CI runs Node 20 + Linux Chromium; local is Node 22 + macOS — two traps where local-green ≠ CI-green
metadata: 
  node_type: memory
  type: project
  originSessionId: 8652357b-8809-4955-83cf-386052a5237f
  modified: 2026-07-20T11:28:10.071Z
---

The Radio Bench CI (`.github/workflows/ci.yml`) runs on **Node 20** (setup-node `node-version: 20`) and **ubuntu-latest / Linux Chromium**. Local dev is **Node 22 + macOS**. Two concrete traps burned a green-local → red-CI on the ch 3.4 PR (#54):

1. **`fs.globSync` is Node-22-only.** `import { globSync } from 'node:fs'` runs fine locally but is a hard `SyntaxError` on Node 20, which failed the *whole* `check:all` (one bad gate module aborts). Use a recursive `readdirSync({withFileTypes:true})` walk instead (Node 18+ safe). Applies to any Node-22-only API in `scripts/*.mjs`.

2. **Playwright `visual` baseline must be captured in CI, not locally.** Font metrics differ between macOS and Linux Chromium enough to tip borderline SPILL/T×T overlaps past the 3px detector tolerance, so a locally-captured `e2e/diagram-geometry.baseline.json` reddens CI on chapters you never touched. Re-baseline via the `Re-baseline visual gate` `workflow_dispatch` (`.github/workflows/rebaseline-visual.yml`) and commit its artifact — that runs in CI's exact env. `workflow_dispatch` only dispatches from the **default branch**, so on a feature branch grab CI's own reported counts from the failed run log instead.

3. **Sizing an SVG canvas "snug" to macOS-measured text spills in CI.** ch4.3 (PR #57):
   `ShockCurrentScale` had `VB_W=486` with the widest UA label clearing the edge by
   17 px *as measured in the local browser* — `npm run test:visual` passed 52/52
   locally, then CI failed with `SPILL "Відчувається — ще можна відпустити"`. Linux
   Chromium falls back to a different face and renders the same string wider, so a
   local measurement bounds **one platform only**. Keep **≥10 % headroom** on the
   widest label. When it doesn't fit, buy room from the *other* columns (band /
   plot width) rather than widening the canvas — widening re-opens the dead space
   that makes a centred figure look indented (a thing the user has flagged).

**Why:** `npm run build`/`check:all`/`test:visual` passing locally does NOT prove CI-green — the runtime and font stack differ. This is exactly the CLAUDE.md warning "a local build passing ≠ CI green."

**How to apply:** after any push, verify CI (`gh pr checks <PR>`, `gh run view <id> --log-failed`, or `gh api repos/OWNER/REPO/actions/jobs/<jobId>/logs` for a completed job while the run is still going). Prefer Node-18-safe APIs in gate scripts. For the visual gate, treat CI's numbers as authoritative. See [[feedback_diagram_overlap_browser_geometry]].
