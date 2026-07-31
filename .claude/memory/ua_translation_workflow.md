---
name: UA translation workflow — Gemini primary, Claude reviewer, linter
description: MANDATORY new workflow for translating Radiopedia ch* blocks. The old Claude-6-agent pipeline produced unshippable UA and was deprecated in ch 1.5. This is how every future chapter translation must proceed.
type: process
originSessionId: dae04b93-349b-4b3c-8804-ac218a0068a2
---
## Core decision — Gemini, not Claude, is the primary translator

**Claude is not the best LLM for Ukrainian.** Intento's 2025 "State of Translation Automation" benchmark found Gemini 2.5 Pro leads on EN→UA; Claude doesn't make the top tier for Ukrainian. Using Claude as the primary translator for ch 1.1 through ch 1.4 produced 30+ correctable landmines per chapter and burnt days of user review time.

Switching to Gemini as the primary translator, with Claude as side-by-side reviewer + mechanical linter + user approval, cut the per-chapter cost roughly tenfold on ch 1.5.

**This workflow is mandatory for every new chapter.** The user explicitly demanded it: «це дуже важливо використовувати новий підхід до перекладу, тому що попередній підхід до перекладу — це було повне лайно!»

## Production setup (already live as of ch 1.5)

- **API key** lives in `.env.local` at repo root (git-ignored). Load it silently in any script; NEVER echo it to stdout or the chat.
- **Google Cloud Paid Tier is active** on the user's account. Pro models require it (free-tier quota = 0 for `gemini-2.5-pro` and `gemini-3.x-pro`). Cost per chapter section: $0.10–0.15. Full course ≈ $5.
- **Production script**: `.claude/skills/ua-translate/scripts/gemini-translate.py`. Takes `<chapter_id> <key1> [<key2> ...]`. Calls BOTH Gemini 2.5 Pro AND 3.1 Pro side-by-side; writes outputs to `/tmp/gemini-section/<first-key>_{2.5_Pro,3.1_Pro}.json`.
- **Nested subtrees** (e.g. `widget`): pass the parent key once, script preserves nested JSON structure.

## Per-batch workflow

For every section of every chapter, ALWAYS:

1. **Run both Pro models side-by-side** via the script. Never apply output from a single model without comparison — the two have different strengths and overlap on regressions:
   - **Gemini 2.5 Pro** — best on technical physics terminology («синфазно», «коливальний контур», «плоский конденсатор»), cleaner on component-description strings
   - **Gemini 3.1 Pro** — best on complex conceptual paragraphs (inversions, parallel constructions, participial clauses); often fixes Claude legacy calques («лежать в основі», «не пропускає/пропускає» parallel, «міняються місцями»)
2. **Claude (the agent) analyzes three candidates** per key: current Claude translation + 2.5 Pro + 3.1 Pro. For each key, recommends one with brief justification. Must flag:
   - Subscript regressions (Gemini 2.5 Pro → `V_вх`, `f_зр` — keep Latin)
   - Terminology regressions vs our glossary («розрядний» → we say «розряджувальний»; «висновок» → we say «вивід» for leads; «осцилограма» for generic waveform → use «форма сигналу»)
   - Polarity word substitutions («додатний вивід» → must be «позитивний вивід» — linter ERROR)
   - Cases where Gemini catches OUR past mistakes (Claude's «налаштований контур» → Gemini's «коливальний контур»)
3. **User approves** («так, застосувати» or with specific overrides).
4. **Apply via Python** — replace uk[key] from chosen model + manual fixes for the identified regressions.
5. **Run the linter** — `node .claude/skills/ua-translate/scripts/lint-ua-translation.mjs src/i18n/locales/uk/ui.json ch<N>_<M>`. Must exit 0 errors. Warnings for `style.unglossed-canonical-term` on «зміщення» in DC-bias context are domain-legitimate false positives.

## Known Gemini regressions (catch during stage 2)

| Pattern | Who | Fix |
|---|---|---|
| `V_in` / `f_c` → Cyrillic subscripts | 2.5 Pro | Keep Latin (manual) |
| «ESR» → «ЕПС» | 2.5 Pro | Keep Latin |
| «розряджувальний резистор» → «розрядний» | Both | Keep «розряджувальний» (Wikipedia) |
| «вивід» → «висновок» (for component lead) | 3.1 Pro | Keep «вивід» |
| «осцилограма» for generic waveform | 3.1 Pro | Replace with «форма сигналу» / «ескіз сигналу» |
| «цеглина» for «brick» metaphor | 2.5 Pro | Replace with «цеглинка» (diminutive) OR drop metaphor entirely |

## Cases where Gemini IMPROVES on previous Claude output

- Claude «налаштовані контури» → Gemini «коливальні контури» (UA physics standard)
- Claude «електронні роботи» → Gemini «в електроніці» (decalque)
- Claude «Розв'язаний приклад» → Gemini «Приклад розрахунку» (landmine 141)
- Claude «стоять за кожним застосуванням» → Gemini «лежать в основі» (native idiom)
- Claude «шум бачить замикання» → Gemini «для шуму конденсатор являє собою коротке замикання» (decalque anthropomorphism)
- Claude «у фазі» → Gemini «синфазно» (physics-textbook term)
- Claude «РЧ-генератор» (abbreviation) → Gemini «радіочастотного генератора» (expanded, per landmine registry)

Gemini catches these because it's not carrying Claude's prior-chapter baggage. Apply them.

## Hard rules

- **Never skip the side-by-side stage.** Single-model output is forbidden — we've seen both 2.5 Pro and 3.1 Pro regress differently.
- **Never apply without running the linter afterwards.** Even for a single-key mid-conversation fix.
- **Never translate with Claude only.** If Gemini API is down, stop and tell the user — don't fall back to the old broken pipeline.
- **Every new user pushback → update `.claude/skills/ua-translate/references/glossary.md`** with the canonical form + row to "Known Gemini regressions" table if mechanically catchable, + linter rule if pattern is stable enough.

## Related files

- Skill entry: `.claude/skills/ua-translate/SKILL.md`
- Production script: `.claude/skills/ua-translate/scripts/gemini-translate.py`
- Linter: `.claude/skills/ua-translate/scripts/lint-ua-translation.mjs`
- Glossary: `.claude/skills/ua-translate/references/glossary.md`
- Landmines: `.claude/skills/ua-translate/references/landmines.md`
- API key: `.env.local` (repo root, git-ignored)
