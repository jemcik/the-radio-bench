# Claude working notes for The Radio Bench

Terse always-on rules. The detail behind each lives in the skills (load on
demand) and is enforced by the gates in `check:all` — this file is the index,
not the manual. Deep rules: `.claude/skills/{diagram-quality,ua-translate,beginner-review}/`.
If you change a convention here, update this file in the same commit.

## Authorization — never touch shared state without an explicit ask

- **Never `git commit` / `git push` without a specific user request.** Editing files, running gates, reporting findings — fine; stop there. One approval does not extend to the next commit/push.
- **Never commit to `main`** — create a feature branch first if HEAD is on main.
- **Never use git worktrees** (no `isolation: "worktree"`, no `git worktree add`) — a stray one once served the user a stale dev snapshot.

## Verify rendering with your eyes (via Claude-in-Chrome), not just gates

Gates prove *code* correctness, not *visual* correctness — a rotated symbol, a literal `<strong>`, a clipped popover, oversized/overlapping labels all lint clean. After ANY change that renders (SVG/diagrams, i18n prose with markup, glossary popovers, layout), look at it in the user's browser:

- The user runs `npm run dev` on `:5173`; **never `preview_start`** (port conflict). If their server is down, start `npm run dev` yourself in the background and mention it.
- Connect via `mcp__Claude_in_Chrome__*`: `list_connected_browsers` → `select_browser` → `tabs_context_mcp`/`tabs_create_mcp` → `navigate` `http://localhost:5173/#/chapter/<id>` → `find`/`screenshot`/`zoom`.
- For diagrams, trust **measured geometry over a screenshot glance** — run the `getBoundingClientRect` overlap audit (diagram-quality Stage 7) or `npm run test:visual`.

## Gates — run before every «done» / PR (non-negotiable)

`npm run check:all` runs **every** gate — it auto-discovers `scripts/check-*.mjs` (plus the UA linter + gitignore) and runs them in parallel, so nothing is hand-maintained and no gate can be forgotten. Then run the rest: `npm run lint`, `npm test`, `npm run build`, `npm run knip`, `npx tsc --noEmit`. All green before saying done. (`npm run check:all <substring>` runs a subset; `npm run test:visual` is the browser diagram-geometry gate.)

**After ANY `ui.json` edit — even a single string —** also run the UA linter for just that block to **0 errors** for fast feedback (the #1 recurring-landmine source; `check:all` covers the whole file, this is the targeted mid-edit run):
```bash
node .claude/skills/ua-translate/scripts/lint-ua-translation.mjs src/i18n/locales/uk/ui.json ch{N}_{M}
```
After a push, verify CI (`gh pr checks <PR>`, `gh run view <id> --log-failed`); CI uses `npm ci` + pinned Node, so a local build passing ≠ CI green.

## Technical debt

`TECH_DEBT.md` is the register of accepted, deferred quality work — each entry says what
it is, why it was deferred, and how to work it off. Every item is held green by a gate
baseline, so **new work cannot add to it**. Read it before proposing a sweep; when you
clear an item, delete its section and its baseline entries in the same commit.

## Commit cadence

On request, batch related changes into one reviewable commit — not one per fix, not a save point.

## Chapter workflow

**Pre-flight — before ANY prose/visual (fires at every new chapter/section; no reminder needed):**
1. Re-read the structure contract: `ch0_1.sectionStructure` + «Notes on Content Philosophy» in `PLAN.md` (analogy-before-formula, every formula → worked example + calculator widget, visual density throughout).
2. Consult the reference books to fact-check every number and borrow the clearest framing — pre-authorised, paths + pdftotext how-to in `memory/reference_research_pdfs.md` and `reference_large_pdfs.md` (ARRL Handbook 2023; Art of Electronics 3rd ed.). Cite the book when a claim depends on it.
3. Web-search current specs / datasheets / regulator pages / prices as needed (pre-authorised).

Only then: outline → visuals → prose. (Jumping straight to building is the ch2.1 first-attempt failure.)

**A chapter is «done» only when ALL hold** — not just «prose written»:
1. Hero illustration renders (never a TODO placeholder for hero or primary widget).
2. Visual density throughout — every section has a widget/illustration/scale, planned at outline time.
3. Five i18n touchpoints, in BOTH `en` and `uk`: `chapterTitles.{id}`, `chapterSubtitles.{id}`, `ch{id}.*`, new `glossary.*`, new `units.*`. (Titles/subtitles silently fall back to EN — cross-check manually.)
4. Test pair for every widget (`renderWithProviders` from `src/test/render`; assert the exact `.toFixed(2)` string, `"20.00"` not `"20"`).
5. Prose promises paid off — every «the … table/diagram» has the artefact rendered; `npm run check:i18n-usage` catches orphan keys.
6. Every circuit diagram built from `@/lib/circuit` primitives only (zero hand-drawn SVG).
7. Quiz is fair — spread `_correct` across a/b/c/d (≤40 % on any one letter, use all four), keep the four options length-parallel (the «why» goes in `_explanation`, never padded into the correct option), and keep en/uk `_correct` identical. Build it balanced from the start; `check:quiz-balance` enforces length + position + parity but reordering after the fact churns the UA translation.
8. Status flip `'coming-soon'` → `'published'` in `src/data/chapters.ts` LAST, after 1–7 and gates are green.

## Invoke the right skill before the work (they hold the detailed rules)

- **`diagram-quality`** — before touching `src/components/diagrams/`, `src/components/chapter-heroes/`, or inline SVG in a chapter, or fixing any diagram issue (font/padding/overlap/scaling/translation). Source of truth for typography, rough.js, plotted curves, circuit schematics, and common failures. **Every `<Circuit>` needs `maxWidth`** or it scales ~2× and inflates text (`check:circuit-maxwidth`).
- **`ua-translate`** — before ANY EN→UA content (chapter, widget, diagram labels). Never hand-author UA beyond a clause — Claude calques even short sentences; Gemini-primary cut landmines tenfold. Writing EN+UA in one authoring pass silently bypasses the skill: write EN only, then invoke it. When the user corrects a UA phrasing, decide convention-vs-regression and update `references/glossary.md` (or add a linter rule) — never fix the same class twice.
- **`beginner-review`** (spawn as a subagent — independent context is the point) — MANDATORY before saying «done» on any task that wrote/rewrote `ch{N}_{M}` prose, and before any commit touching those keys. **Run it TWICE: once to find, once on what you wrote in response.** The first pass reads the chapter as it exists; the prose you then write for each finding is never read by anyone — gates are mechanical, the UA linter is a regex blocklist, and Gemini faithfully translates a confused English sentence into a confused Ukrainian one. After a fix pass, re-run the skill scoped to **only the rewritten keys** in both locales. Watch for the failure shape: an explanation bolted into an existing sentence with dashes or parentheses instead of a separate sentence. One idea, one sentence. `check:uk` catches mechanical patterns; only a fresh reader catches ambiguous pronouns, comparatives without a baseline, or prose that contradicts an on-screen widget. **Chapters 0.1–1.10 predate this skill and have never been through it** — see `TECH_DEBT.md` §2.

## Prose & i18n discipline (mostly gate-enforced — skills hold the how-to)

- **Stay strictly on the technical subject — NO politics, religion, patriotism, nationalism, nazism, or any ideological/values framing, ever, in prose OR glossary OR comments visible to the reader** (user-flagged, ch4.3, emphatic). This is a radio-electronics course. A line like «the reason to prefer IEC over American sources is not patriotism — it is that…» is out of bounds even when negating the concept: don't raise it at all. State the technical reason plainly. Neutral geographic/standards descriptors are fine and necessary («the IEC/European standard», «the American UL convention», «sold in Ukraine and the EU») — those are facts about where a convention comes from, not a value judgement. The banned thing is editorial framing around identity/ideology.
- **No cute rhetorical strawmen generally** — the «it's not X — it's Y» construction that sets up a non-technical X only to knock it down reads as performance, not teaching. If the point is Y, just say Y.
- **NEVER attribute error or incompetence to hams / the reader / «most people»** (user-flagged 2+ times, ch4.3, furious). Banned: «hams routinely get this wrong», «better than any amateur manages», «most people fit the wrong X», «widely misunderstood». State the fact or mechanism; if you're addressing a real misconception, frame it as a natural intuition being corrected («your instinct is to…»), never as people's failure. When the user flags ONE such line, grep the WHOLE chapter (EN+UA) for the class and fix every hit in the same pass — see `memory/feedback_no_condescension_explain_standards.md`.
- **Schematic before prose.** Every circuit described in prose needs a schematic above the first paragraph that names its components. Authoring rules: `diagram-quality/references/circuit-schematics.md` (working example: `RCChargingSchematic.tsx`).
- **Introduce every symbol/abbreviation before use.** Prose must stand alone for a non-specialist. Wrap EVERY math variable / Greek letter (even a lone `c`) in `<var>` (`check:unwrapped-math-var`); expand abbreviations (HT/QRP/HF/AM/FM/SSB/CW/VNA…) and band shorthand (`2 m` → «VHF ≈144 MHz») on first use; name the source for «above», the quantity for comparatives, concrete partners for vague pronouns. Full catalogue: `memory/feedback_first_mention_explicitness.md`.
- **Units via `units.*`**, never inline `kHz`/`dBm` (`check:hardcoded-units`); extend the namespace before first use of a new family; when you fix one hardcoded unit, grep the whole widget + sibling widgets.
- **Markup / subscripts / dynamic `t()`** — any markup-bearing value must reach a renderer: subscripts via `withSubscripts`/`withSubscriptsSvg`/`<MathText>`/`<Trans var>`; a runtime-chosen key goes into `<Trans i18nKey={key}>`, never `t(varName)`; variable names stay Latin even in UA prose. Details: `ua-translate/references/markup.md`. Enforced by `check:bare-subscripts`, `check:hardcoded-jsx-subscript`, `check:tag-renders`.
- **Don't cargo-cult** a label / SVG attr / `<Trans>` map from another file without checking its rendered output first — «it's in the codebase» ≠ «it works».

## Conventions & non-derivable facts

- **Glossary entries** — `tip` leads with WHAT the noun is (`ham` → «A ham is a licensed amateur radio operator…», not «Amateur radio is the activity of…»); every entry links ≥1 `see`; wrap the first occurrence per section in `<G k="…">` (not every occurrence).
- **Lab activities** — prefer AA (1.5 V) batteries, not 9 V (a niche format in many countries). `LabActivity` cards need `not-prose` + explicit `text-foreground`; copy the bullet-flex pattern from `src/components/lab/LabActivity.tsx`.
- **Ukraine — the licensing body is УДЦР** (issues callsigns); the regulator above it is **НКЕК** (replaced НКРЗІ in 2022) — never write «НКРЗІ».
- **National content (ПУЕ/ДСТУ/ПЗВ/НКЕК/УДЦР) is MARKED, never hidden from EN** (decided ch4.3). Language ≠ location: many Ukrainian readers use the EN toggle by preference, so gating national rules on locale would hide them from a reader physically in Ukraine — the exact person at risk. Instead: scope it **in the first clause** («In Ukraine…», «Ukraine's own wiring rules…»), and mark it **in the visual too** — a reader scanning a figure never reaches the figcaption (ch4.3's busbar panel is titled «On a busbar — Ukraine only»). Regulator/band-plan rules go in an `onair` callout (`ch3_2.ampOnair` is the model); safety-critical national facts keep `danger`. Prefer the reader's own name for a thing per locale (EN «RCD» / UA «ПЗВ»), not one spelling forced on both.
- **Ukrainian decimals use a comma**: `1,55 В`, `−2,5 дБ`. Runtime numbers → `formatDecimal`/`formatNumber` from `src/lib/format.ts` (an `<input type="number">` still needs a raw `.toFixed()` with a period). Section IDs (`Розділ 3.3`) keep the period — they're not decimals.
