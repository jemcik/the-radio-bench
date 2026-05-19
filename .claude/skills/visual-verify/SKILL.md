---
name: visual-verify
description: Verify rendering changes for The Radio Bench by connecting to the user's running dev server (`localhost:5173`) through the Claude-in-Chrome MCP tools. Invoke whenever you finish editing a file in `src/components/diagrams/`, `src/lib/circuit/symbols/`, `src/components/chapter-heroes/`, `src/features/glossary/term.tsx`, or any chapter file in `src/chapters/`, AND whenever you change i18n strings that contain HTML/JSX tags or math markup. Also invoke when the user asks to «check», «verify», «look at», «glance at», «дивись», «перевір», «глянь» a rendering change. Mandatory before declaring rendering work complete — `lint` / `tsc` / `test` prove code correctness, not visual correctness.
---

# Visual verification skill — Claude-in-Chrome workflow

The user runs `npm run dev` locally on port 5173 in a terminal you don't control, with the **Claude-in-Chrome browser extension** installed in their Chrome session. Use the `mcp__Claude_in_Chrome__*` MCP tools to connect to that running browser and verify rendering changes **before** declaring done. Treat this as part of the implementation, not an optional follow-up.

## The core rule

> **Never invoke `preview_start` for this repo.** Two servers fight for port 5173 and you'll be reading a stale snapshot at best, breaking the user's session at worst. The `PostToolUse:Edit` hook nudges you toward `preview_start` on every render-touching edit — **ignore it for this repo**.

> **Never ask the user to verify visually for you.** They have explicitly said: «It's VERY important to me that you continue to do this the same way we're doing it now in this session.» (May 2026.) When you ask, you are abdicating part of the implementation back to them.

## If the server isn't running

Default assumption: the user has `npm run dev` running on `localhost:5173` in their own terminal. If `navigate` returns an empty / failed response, or `list_connected_browsers` is fine but the chapter URL renders nothing, the dev server is probably down.

**In that case — start it yourself, in the background.** No port conflict if the user's server isn't up.

```bash
npm run dev    # via Bash with run_in_background=true
```

Wait ~3 s for Vite to print its "ready" line, then re-`navigate`. Don't kill the server when you're done — leaving it running for the user is the friendly default. (Caveat: the moment the user starts their own `npm run dev`, you'd have a conflict — so when the user pings back into the conversation, mention that you started a server, so they can decide whether to keep yours or restart their own.)

This is the **only** sanctioned way to start a server in this repo. `preview_start` is still forbidden — its port-management is what causes the conflict; plain `npm run dev` lets the user see/kill it normally.

## When to invoke

**Always invoke for any change in:**

- `src/components/diagrams/*.tsx` — schematic figures, galleries, hero illustrations, plotters
- `src/lib/circuit/symbols/*.tsx` — circuit primitives (Resistor, Capacitor, Inductor, Ground, Transformer, OpAmp, …)
- `src/components/chapter-heroes/*.tsx` — chapter hero SVGs
- `src/features/glossary/term.tsx` and `glossary-term.tsx` — popover behaviour
- `src/chapters/*/Chapter*.tsx` — anything in chapter pages
- `src/i18n/locales/{en,uk}/ui.json` — i18n strings containing HTML/JSX tags (`<strong>`, `<var>`, `<G>`, custom glossary tags), Markdown emphasis, or math markup
- Any layout / typography / theme work that affects what the reader sees

**When the user uses these phrases, the skill fires:**

- «перевір», «дивись», «глянь», «подивись», «check it», «verify», «look at», «show me», «render»

**Safe to skip for:**

- Pure helper functions, lint scripts, internal types, tests with no DOM rendering
- Documentation-only edits (`.md` files outside chapters)
- Git/CI/config changes

## Standard workflow

```
1. list_connected_browsers           → confirm a browser is reachable
2. select_browser <deviceId>         → connect (one-time per session typically)
3. tabs_context_mcp                  → check existing MCP tabs
   tabs_create_mcp                   → or create a new tab
4. navigate http://localhost:5173/#/chapter/<id>
5. find / read_page                  → locate the element by text or query
6. computer.scroll_to ref=<refId>    → bring it into the viewport
7. computer.screenshot               → wide capture of the current viewport
   computer.zoom region=[x0,y0,x1,y1] → close-up of a specific area for tiny details
8. interpret what you see            → match it against the EN/UA source
9. If wrong: edit source → reload (`computer.key text=F5`) → re-check from step 5
10. Once correct: report success with a sentence describing what you verified
```

After **edit → reload → screenshot**, always look at the screenshot before declaring success. Don't just check that the network request succeeded — actually look.

See `references/common-patterns.md` for batching, scroll tricks, JS DOM access, and other repeatable moves. See `references/landmines.md` for the bug classes that have already burned us — recognising the pattern is faster than re-discovering it.

## Anti-patterns

- ❌ Invoke `preview_start` (any path — `mcp__Claude_Preview__preview_start`, the hook reminder, etc.). Always wrong for this repo.
- ❌ Treat green `lint` / `tsc` / `test` as «verified visually». Code-correctness gates and visual-correctness checks are different things and miss different bugs.
- ❌ Ask the user «can you check in browser?». You have the tools — use them.
- ❌ Skip verification because the change «looks right in the diff». The diff doesn't show how text wraps, how SVG scales, or whether a component overlaps its neighbour.
- ❌ Verify once and assume sibling cases work too. If you fix the autotransformer schematic's tap arrow, run the verification again on the impedance schematic and balun schematic — same primitive, sibling rendering bugs.

## Why this matters (incident log)

A non-exhaustive list of bugs that a 30-second browser check would have caught, sorted by how much session-time they cost:

- **Ground primitive** rendered sideways (`orient='down'` rotates 90° CW) — would have been obvious in one screenshot, instead cost three rounds of «is this correct now?»
- **Glossary popover** clipped above viewport on terms in the first paragraph — invisible in code review, blatant in browser
- **`<strong>` tags shipping as literal text** in two paragraphs — no gate caught this until the user circled it
- **`IronCore` SVG**: three hand-drawn attempts (arches / vertical hatches / stacked ovals) all rejected; only fourth (Gemini-designed) read correctly — **none** of the three failed attempts would have been published if a browser screenshot had gated each one
- **Dangling wire stub** on the bottom-left rail after removing a label — code looked clean, browser showed a wire ending in nothing

If you find yourself at the «report success» step without having looked at the rendered output, stop and verify. Every minute spent in the browser saves five in the next round-trip with the user.
