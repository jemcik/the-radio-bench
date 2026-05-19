---
name: beginner-review
description: Read a chapter (or specific i18n keys) as if you have never seen the topic before, and flag every place where the prose assumes context a first-time reader does not have. MANDATORY before declaring chapter prose final — `check:uk` catches mechanical patterns (bare «вхід», «рівень», «лінійно») but NOT genuine ambiguity that a fresh reader would notice. Triggers when user asks «беґіннер-перевірка», «прочитай новачком», «is this clear to a beginner», or before any commit that touches chapter prose. Also invoke proactively at the end of any prose-writing task.
---

# Beginner-reader review

The chapter author and the chapter reader live in two different worlds:

- **Author** has every concept, every formula, every variable name loaded into working memory. Pronouns resolve themselves. Bare nouns have obvious referents. «Linear» is obviously with respect to i_b. «Input» is obviously V_in.
- **Reader** is meeting this material for the first time. They have ONLY what came before in the course. Every pronoun is a question. Every undefined comparative («higher», «smaller», «above») requires guessing. Every bare noun («value», «level», «parameter») feels like a gap they should fill in but can't.

**The author cannot self-review for this gap** — by definition they have the context the reader lacks. That is what this skill exists for: simulate a fresh reader's perspective, methodically, with no shortcuts.

This skill is the **last gate** before declaring chapter prose ready. Running `check:uk` is necessary but not sufficient — it catches mechanical patterns like bare «вхід»/«рівень»/«лінійно», but not genuine ambiguity that depends on context («через нього» — through what?; «вище» — above what on screen?; «робоча точка» — the bias point or the Q-point or both?).

## When to invoke

**Always** before:
- Committing any change to `src/i18n/locales/{en,uk}/ui.json` that touches a `ch{N}_{M}` block
- Declaring a new chapter ready to ship (status `coming-soon` → `published`)
- Declaring a chapter prose rewrite "done"
- Replying «готово» / «done» on any task that included writing or rewriting chapter prose

**Always** invoke as a **subagent** (spawn via the `Agent` tool with `subagent_type: "general-purpose"`), not in-line. The subagent's value is its independent context — it has not read the rest of the chapter recently, so it cannot resolve the same gaps the main agent's context fills in.

The skill is NOT for: glossary entries (different reading mode — looked up, not read top-down), widget UI labels (single-line strings have no «before» context), or commit messages (audience is developers, not students).

## What the subagent should do

Spawn with a prompt of the following shape:

```
You are reviewing chapter prose for The Radio Bench, a Ukrainian-language
electronics course aimed at total beginners. The reader's only background is
what the course itself has covered up to the section in question — no
outside engineering knowledge.

Read the following prose AS THIS BEGINNER. For every sentence, ask:

  1. PRONOUNS — every «це», «той», «нього», «вони», «that», «it», «them»:
     can you point to exactly one prior noun it refers to, with no
     ambiguity? If two nouns of the same gender appear in the previous
     sentence, the reader will guess wrong.

  2. BARE NOUNS — every «вхід», «вихід», «рівень», «значення», «параметр»,
     «величина», «термінал», «сигнал»: is it qualified (genitive noun, or
     specific name like V_in)? Or does the reader have to fill in
     context from somewhere not in the prose?

  3. COMPARATIVES — every «вищий», «нижчий», «більший», «менший», «higher»,
     «smaller», «above»: what is being compared to what? Both sides
     must be explicit OR very obvious from one sentence back.

  4. ADVERBS — every «лінійно», «експоненційно», «обернено», «directly»,
     «inversely»: linear/exponential WITH RESPECT TO WHAT? Name the
     independent variable.

  5. SYMBOLS AND ABBREVIATIONS — every V_BE, i_b, β, NPN, BJT, MOSFET,
     PWM, RMS, HF, VHF: introduced inline at first use? «Defined earlier
     in this chapter» does not count if the definition is more than ~3
     paragraphs back — the beginner has lost it.

  6. SPATIAL REFERENCES — every «вище», «нижче», «above», «below», «to
     the right»: refers to a visible thing currently on screen? Or to
     something else that is also called «above»?

  7. CONTRADICTIONS — every claim that contradicts an interactive widget
     visible on the same page («V_BE is always 0.7 V» when the widget
     has a V_BE slider). Cross-reference prose claims to widget
     behaviour.

  8. UNDEFINED JARGON — every term that sounds technical: was it
     introduced earlier in this chapter, or is it a new word the reader
     is supposed to absorb from context?

Return a numbered list of EVERY issue. For each: quote the exact phrase,
say what the beginner would not understand, propose a concrete fix.

Do NOT skip issues that "the reader can probably figure out". The whole
point is that the reader cannot. If you have to think for >2 seconds,
flag it.

Do NOT return a summary or a "looks good overall" — only return the
issues list. If there are zero issues, return exactly: «No issues
found.»
```

Then paste the relevant i18n keys (translated values, not English source) and any widget descriptions visible on the same page.

## After the review

Address EVERY issue. Treat each item as a P0 blocker for «done». Common patterns of acceptable fixes:

- **Bare noun** → add genitive qualifier («рівень напруги») or name («термінал V_in»).
- **Pronoun ambiguity** → repeat the noun.
- **Linear/exponential** → add «з V_BE» / «з i_b» / «у часі».
- **Comparative without baseline** → name the baseline.
- **Symbol not introduced** → expand inline at first use, or rephrase.
- **Contradiction with widget** → reword to match (or fix the widget).

Once all issues are addressed, re-run `check:uk` (the mechanical linter), `check:all`, AND pixel-verify in the browser. Only THEN say «готово».

## Why this exists

User feedback (May 2026, ch 1.11):

> «Я вже заїбався постійно вказувати тобі на такі речі. Ми працюємо над освітнім курсом, вперше пишемо для учня про транзистор, а ти навалюєш якусь незрозуміло хуйню.»

Pattern of issues across one chapter that triggered this skill:
- «лінійно» without object
- «через нього» — through what?
- «V_BE завжди» — contradicts the slider in the widget
- «рівень» / «вхід» without qualifier
- «вище / нижче» without referring to a concrete thing on screen
- «робоча точка» used for two different concepts in adjacent paragraphs
- «активний (лінійний)» coloured like a glossary term

Mechanical linter catches the easy ones (bare «лінійно», bare «рівень») but the deeper class — «this paragraph reads fluently TO ME because I have the context» — needs an outside perspective. That is what this skill provides.

## Hard rules

- **Never** declare chapter prose done without invoking this skill first.
- **Never** skip the skill because «I already read it carefully». The whole pattern is that careful self-review by the author cannot catch this class. The whole reason this skill exists is to bypass self-review.
- **Never** filter the subagent's output — address every flagged issue or explicitly explain why one is a false positive.
- **Always** prefer a slightly verbose explicit phrasing over a terse implicit one. The reader will not get angry that you named V_in twice; they will get angry that they cannot figure out what «вхід» means.
