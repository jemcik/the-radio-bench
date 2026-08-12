---
name: project-i18n-editing-traps
description: Scripted edits to ui.json fail silently three ways — NBSP, unescaped apostrophes in glossary.ts, and an unscoped regex hitting another chapter's copy of the same key name
metadata: 
  node_type: memory
  type: project
  originSessionId: a8380fd5-99a1-4a2c-93ce-2b1b0a9c4753
  modified: 2026-07-28T21:42:52.830Z
---

**Never call `.replace()` on an i18n string without asserting the match first, and
never match against the whole file.** Three traps in this repo make scripted edits fail
*silently* — a silent no-op or a hit on the wrong chapter is worse than a crash, because
the gates then pass on text nobody meant to write.

**1. Non-breaking spaces.** `ui.json` uses U+00A0 in places you cannot see: `Part 1`,
`Частину 0`, `5 В`, `0,5 мс`. `JSON.stringify` prints them as ordinary spaces, so a
dump looks identical to what you typed and the replacement still misses. Match
NBSP-insensitively — normalise both sides, find the index on the normalised copy, splice
on the real string:

```python
NB = ' '
def sub(s, old, new):
    norm, o = s.replace(NB, ' '), old.replace(NB, ' ')
    i = norm.find(o)
    assert i != -1 and norm.count(o) == 1
    return s[:i] + new + s[i+len(o):]
```

**2. Unescaped apostrophes in `glossary.ts`.** The file uses single-quoted TS strings, so
`the multimeter's continuity setting` is a syntax error. `extract-glossary.mjs` then
throws — and `gemini-translate.py` only checks that `/tmp/glossary-en.json` **exists**,
so the next translation run silently translates the *previous* English. Always read the
extractor's `Wrote N entries` line before trusting a translation.

Two things that will NOT catch it: `check:all` (all 33 gates stayed green) and
`tsc --noEmit` (it also passed). What fails is `vitest`, and it fails as **twelve
unrelated suites erroring at import**, not as one clear message — the real error is
`vite:esbuild … Expected "}" but found "s"` buried in one suite's output. Escape on
write: `s.replace("metal's", "metal\\'s")`.

**3. Key names repeat in every chapter block, so an unscoped regex hits the wrong
chapter.** `heroAriaLabel`, `intro`, `hint`, `labStep1`, `quiz_q1_a` exist under
`ch0_1`, `ch0_2`, `ch1_1`, … A pattern like `re.search(r'"heroAriaLabel": ".*?"', raw)`
matches the **first** one in the file — `ch0_1`'s — and `count == 1` does not save you,
because there is exactly one match at that (wrong) position. Slice the block first:

```python
b0 = raw.index('\n  "ch1_1": {'); b1 = raw.index('\n  "ch1_', b0 + 10)
block = raw[b0:b1]          # edit inside `block`, splice back at the end
```

**Why:** all three bit in one session. A `.replace()` that matched nothing left a
UA string untouched while I reported it fixed; the stale dump nearly shipped translations
of superseded English; and trap 3 overwrote `ch0_1.heroAriaLabel` with chapter 1.1's
water-pipe description — every gate stayed green, because the value is a valid string
and both locales still had the key. It surfaced only from a diff of *which keys changed*
EN vs UA: `heroAriaLabel` showed as «EN changed, UA did not», which is impossible if the
UA edit had landed where it was aimed. **Run that cross-check at the end of every
translation pass** — it catches misapplied edits no gate can see:

```python
ench = {k for k in en1 if en0.get(k) != en1[k]}   # HEAD vs working tree
ukch = {k for k in uk1 if uk0.get(k) != uk1[k]}
assert not (ench - ukch)                 # an EN edit with no UA counterpart
# and: nothing changed OUTSIDE the block you were working in
```

**How to apply:** every scripted edit to `en/ui.json`, `uk/ui.json` or `glossary.ts` goes
through a helper that asserts `count == 1`. When a substitution is genuinely optional,
assert `count in (0, 1)` explicitly rather than letting it pass by accident.

Related: [[project_glossary_translate_stale_dump]] records the stale-dump half of trap 2;
[[ua_translation_workflow]] is the pipeline these edits feed.
