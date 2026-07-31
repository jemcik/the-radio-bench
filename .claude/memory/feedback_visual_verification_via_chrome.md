---
name: Visual verification via Claude-in-Chrome MCP, not preview_start
description: For Radiopedia, NEVER invoke preview_start; ALWAYS use mcp__Claude_in_Chrome__* MCP tools to connect to the user's running dev server on :5173. Visual verification is mandatory after rendering-related edits.
type: feedback
originSessionId: bc831ca6-08ca-4458-841d-205d76cfc8e0
---
For the Radiopedia repo (`/Users/jemcik/Public/code/Radiopedia`), the user runs `npm run dev` locally on port 5173 in their own terminal, with the Claude-in-Chrome browser extension installed. They consider visual verification of rendering changes **non-negotiable**, and the workflow is:

**Never** invoke `preview_start` for this repo — port conflict with the user's server, plus the `PostToolUse:Edit` hook will misleadingly push you toward it. Ignore that hook for rendering-related files in this repo.

**If the user's server isn't running** (navigate to `localhost:5173` returns blank / fails), start `npm run dev` yourself in the background via Bash with `run_in_background=true`. No port conflict in that case. Leave it running for the user; mention you started it next time they reply.

**Always** use the `mcp__Claude_in_Chrome__*` MCP tools to connect to the user's running browser:

```
list_connected_browsers → select_browser
tabs_context_mcp (reuse) OR tabs_create_mcp (new tab)
navigate → http://localhost:5173/#/chapter/<id>
find / screenshot / zoom / read_page
```

**Why:** Multiple landmines per session have cost ~30 minutes each because «code lints clean» got mistaken for «renders correctly». Concrete examples on this branch alone: rotated `Ground` symbol pointing sideways (fixed only after browser-check), dangling wire stub on bottom-left rail after removing a label (caught only by browser screenshot), glossary popover clipped above viewport, `<strong>` tags shipping as literal text, IronCore SVG that took three hand-drawn attempts before delegating to Gemini. Each one would have shipped to the user if «gates green = done» were the bar.

**How to apply:**
- Any change touching SVG primitives, schematic files in `src/components/diagrams/`, glossary popover (`src/features/glossary/term.tsx`), i18n prose with markup tags, or any layout/render path — verify in browser **before** declaring done. Don't just rely on `lint`/`tsc`/`tests`.
- Pure code refactors with no rendering effect (helper functions, lint scripts, internal types) don't need browser verification.
- The user has explicitly emphasised continuity: «It's VERY important to me that you continue to do this the same way we're doing it now in this session.» (May 2026.)
- CLAUDE.md in the project root has the same rule, but treat this memory as the primary safety net in case CLAUDE.md gets reorganised or the rule moves.
