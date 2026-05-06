# Common patterns — Claude-in-Chrome browser workflow

Reusable moves for the verify-in-browser loop. Each pattern is one tool call (or a small composed sequence) you'll reach for repeatedly while working in this repo.

---

## Connecting to the browser (once per session)

The user has the Claude-in-Chrome extension installed. First MCP call in a fresh session:

```
list_connected_browsers          → returns deviceId + display name
select_browser deviceId=<id>     → connects this conversation to that browser
```

Subsequent tool calls reuse the connection automatically. If `list_connected_browsers` returns nothing, the user's Chrome isn't running or the extension isn't paired — say so and ask them to open Chrome.

---

## Tabs

```
tabs_context_mcp createIfEmpty=true   → returns existing MCP tab IDs (or creates a fresh tab group)
tabs_create_mcp                       → opens a new empty tab in the existing group
tabs_close_mcp tabId=<n>              → close one when you're done
```

Default: create one new tab per chapter / per investigation, don't dump every check into a single tab. The user reuses Chrome for other work — leaving tabs open clutters their session.

---

## Navigation

```
navigate url="http://localhost:5173/#/chapter/1-9" tabId=<n>
```

Always include the `#/chapter/<id>` fragment — the app uses HashRouter. Some valid examples:

- `http://localhost:5173/` — home / chapter index
- `http://localhost:5173/#/chapter/1-9` — chapter 1.9
- `http://localhost:5173/#/glossary` — glossary index

To go back/forward in the tab's history: `navigate url="back"` or `navigate url="forward"`.

---

## Reload after an edit

The Vite dev server has HMR, so most edits propagate without a manual reload. But CSS variable changes, route definitions, and i18n JSON edits sometimes don't trigger HMR cleanly. Force-reload via:

```
javascript_tool action=javascript_exec text="window.location.reload()" tabId=<n>
```

Or via `computer.key text="F5" tabId=<n>` if the page has focus.

After reload, give Vite a beat (≈1 s) before screenshotting — the page may briefly show its loading state.

---

## Locating an element

Two main tools — pick by what you know:

**`find` — natural-language search.** Returns up to 20 matching elements with `ref_<n>` IDs.

```
find query="schematic caption for the 4:1 balun" tabId=<n>
find query="glossary popover contents for 'feeder'" tabId=<n>
find query="Tap arrow inside the autotransformer figure" tabId=<n>
```

**`read_page` — full accessibility tree.** Use when you need structure, not just one element. Cap output with `depth` or `ref_id` if the chapter is dense.

```
read_page tabId=<n> filter="interactive" depth=10
read_page tabId=<n> ref_id="ref_42"           # zoom in on a subtree
```

For a long chapter, `find` is almost always faster — you describe what you want, you get refs back, you act on them. Reach for `read_page` only when you need to map out the page.

---

## Bringing the element into view

```
computer action="scroll_to" ref="ref_42" tabId=<n>
```

Always scroll to the element before screenshotting. The default screenshot captures the **viewport**, not the document — anything scrolled off-screen won't be in the image.

If the element is inside a scrollable container (rare in chapter pages), `scroll_to` handles that too.

---

## Capturing what you see

Two tools — pick by zoom level:

**`computer.screenshot` — wide capture of the whole viewport.** Use for "is this section laid out correctly", overall context, gallery shots.

```
computer action="screenshot" tabId=<n>
```

**`computer.zoom` — close-up of a rectangular region.** Use when the bug is in a small area (a label glyph, a single icon, an arrow tip). Coordinates are pixels from the viewport top-left.

```
computer action="zoom" region=[120, 340, 580, 540] tabId=<n>
```

Zoom is also useful when the screenshot is too large to read — it crops + upscales.

If you need to share the image with the user, set `save_to_disk=true` on the screenshot/zoom — the tool returns the saved path.

---

## Inspecting computed CSS / layout

When the bug is "this label looks too close to the wire" or "the popover height isn't what I expect":

```
javascript_tool action="javascript_exec" text="
  const el = document.querySelector('[data-testid=balun-caption]');
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  ({ rect: r.toJSON(), maxHeight: cs.maxHeight, fontSize: cs.fontSize });
" tabId=<n>
```

Returned values flow back as the JS expression result. Don't write `return` — write the bare expression on the last line.

For Radix popovers specifically, the live available-height var:

```
getComputedStyle(document.querySelector('[data-radix-popper-content-wrapper]'))
  .getPropertyValue('--radix-popper-available-height')
```

---

## Triggering interactions

Click a glossary term to open its popover:

```
computer action="left_click" ref="<glossary-term-ref>" tabId=<n>
```

Or by coordinate (only when you have to — refs survive layout shifts, coordinates don't):

```
computer action="left_click" coordinate=[420, 380] tabId=<n>
```

Hover (for tooltips that activate on hover):

```
computer action="hover" ref="<ref>" tabId=<n>
```

Form input (for widget sliders / number boxes):

```
form_input ref="<input-ref>" value="0.5" tabId=<n>
```

---

## Batching for fewer round trips

When the next 3–5 actions are predictable (navigate → find → scroll_to → screenshot), batch them into one `browser_batch` call:

```
browser_batch actions=[
  { name: "navigate", input: { url: "http://localhost:5173/#/chapter/1-9", tabId: <n> } },
  { name: "find",     input: { query: "balun schematic", tabId: <n> } },
  { name: "computer", input: { action: "scroll_to", ref: "ref_<placeholder>", tabId: <n> } },
  { name: "computer", input: { action: "screenshot", tabId: <n> } }
]
```

Caveat: refs from `find` aren't known until that step runs, so the third action in the example above is contrived. Realistic batches: navigate + screenshot, or scroll_to + zoom, or fill + click.

For dependent chains (where step N's output feeds step N+1), use individual calls in parallel where possible, sequential where required.

---

## Reading console errors

If the chapter looks broken (blank section, missing diagram), check console first:

```
read_console_messages tabId=<n> pattern="error|warning|i18n" onlyErrors=false
```

Always pass a `pattern` — the unfiltered console is noisy with HMR/Vite messages.

---

## Resizing for responsive checks

```
resize_window width=375 height=812 tabId=<n>     # iPhone-ish
resize_window width=1440 height=900 tabId=<n>    # back to desktop
```

Useful when the layout-overlap bug only appears at narrow widths.

---

## End-of-loop sanity check

Before you say "verified":

1. The screenshot you took matches the section you intended to verify.
2. The text content in the screenshot reads correctly in EN AND UA (don't verify only one locale and assume the other works).
3. Sibling components on the same page haven't regressed — if you fixed one Tap arrow, scroll to the others and look.
4. If the change involved an i18n string with a tag, the tag is rendered (not literal text).

If any of those is uncertain, take another screenshot. The cost is nothing; the cost of declaring done prematurely is one more user round-trip.
