---
name: project-i18n-editing-traps
description: Exact-match replacement in ui.json fails silently on NBSP and on unescaped apostrophes in glossary.ts — always assert the match count
metadata: 
  node_type: memory
  type: project
  originSessionId: a8380fd5-99a1-4a2c-93ce-2b1b0a9c4753
  modified: 2026-07-28T21:42:52.830Z
---

**Never call `.replace()` on an i18n string without asserting the match first.** Two
traps in this repo make exact-match edits fail *silently*, and a silent no-op is worse
than a crash because the gates then pass on unchanged text.

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

**Why:** both bit repeatedly in one session. A `.replace()` that matched nothing left a
UA string untouched while I reported it fixed; the stale dump nearly shipped translations
of superseded English.

**How to apply:** every scripted edit to `en/ui.json`, `uk/ui.json` or `glossary.ts` goes
through a helper that asserts `count == 1`. When a substitution is genuinely optional,
assert `count in (0, 1)` explicitly rather than letting it pass by accident.

Related: [[project_glossary_translate_stale_dump]] records the stale-dump half of trap 2;
[[ua_translation_workflow]] is the pipeline these edits feed.
