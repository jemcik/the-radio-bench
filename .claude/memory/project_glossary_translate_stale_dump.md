---
name: glossary-translation-silently-uses-a-stale-dump
description: "gemini-translate.py for the `glossary` block reads /tmp/glossary-en.json and only errors if it is MISSING, never if it is STALE — so a failed extract-glossary.mjs makes Gemini translate the OLD English"
metadata: 
  node_type: memory
  type: project
  originSessionId: a8702b8b-0702-4153-b76d-96165932d08c
---

The EN glossary lives in `src/features/glossary/glossary.ts`, **not** in `en/ui.json` (which holds only `glossary._names` / `._ui`). So translating a glossary entry needs two steps:

```bash
node scripts/extract-glossary.mjs          # dumps glossary.ts -> /tmp/glossary-en.json
python3 .claude/skills/ua-translate/scripts/gemini-translate.py glossary <term>
```

**The trap:** `gemini-translate.py` checks only `if not glossary_dump.exists()`. A **stale** dump passes that check silently, so Gemini happily translates the *previous* English and the new sentences simply never appear in the output.

Hit this on ch4.2: an **unescaped apostrophe** in a single-quoted TS string (`the ARRL Handbook's`) terminated the string → `SyntaxError [ERR_INVALID_TYPESCRIPT_SYNTAX]` from Node's TS stripping → `extract-glossary.mjs` died → the dump stayed old → **both** Gemini models returned text missing the sentence I had just added. I only caught it because I checked for that sentence in the output. `npx tsc --noEmit` would have caught the syntax break, but I ran Gemini before re-running tsc.

**Do this every time:**
1. Escape apostrophes as `\'` in `glossary.ts` (see `a dipole\'s two legs`), or reword to avoid them — rewording is safer.
2. After editing `glossary.ts`, run `npx tsc --noEmit` **before** anything downstream.
3. After `extract-glossary.mjs`, assert the dump actually contains the new text before trusting any translation:
   ```bash
   python3 -c "import json;print('<new phrase>' in json.load(open('/tmp/glossary-en.json'))['<term>']['detail'])"
   ```
   Its success line is `Wrote 284 entries to /tmp/glossary-en.json` — a bare `Node.js v24.x` tail is the sign it crashed.

Related: [[ua_translation_workflow]], [[feedback_verify_visually_before_done]].
