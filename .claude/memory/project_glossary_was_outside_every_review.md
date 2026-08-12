---
name: project-glossary-was-outside-every-review
description: The glossary sat outside every review the project has — beginner-review excluded it by rule and every run was scoped to one chapter block, so 42 % of its 341 entries shipped with defects
metadata:
  type: project
---

**Two scoping decisions, each reasonable alone, left 341 glossary entries
unreviewed for the life of the project.** Swept 2026-08-02; **144 of 341 —
42 % — had defects.**

The two decisions:

1. `beginner-review/SKILL.md` said «The skill is NOT for: glossary entries
   (different reading mode — looked up, not read top-down)».
2. Every invocation was scoped to one `ch{N}_{M}` block, deliberately, so that
   rounds would not re-read settled chapter text.

Neither is wrong on its own. Together they mean **no reviewer had ever read a
single glossary entry**, in any chapter, ever — while `<G k="…">` fires those
entries into the reader's face from every chapter in the course.

**Why:** the owner found three defects in three consecutive glances at popovers
in ch 1.1 — «Франклін **вгадав** напрямок… протилежний до реального» (вгадати is
perfective-*successful* in Ukrainian, so the entry said he guessed right and then
that he was wrong), «вищий опір **за міддю**» (за + instrumental forms no
comparison), and «тієї самої **товщини**» for EN «the same cross-section». The
sweep that followed found, among much else: −60 dBm called 1 µW (it is 1 nW), a
14 MHz half-wave dipole called 5 m (10.6 m), «every pole **doubles** the slope»
(it adds −20 dB/decade), 40/20 m traps called 7 MHz (14 MHz), approaching the MUF
said to **shrink** the skip zone (it widens it), and the LED anode given the big
anvil that belongs to the cathode. Twelve of those were wrong in the **English**
too and had been faithfully translated.

**How to apply:** the skill now says glossary entries are in scope. Beyond the
usual checks, three apply only to them — a popover fires from any chapter, so it
cannot assume the reader's position or country; it must not contradict its own
display name in `glossary._names` or the prose that links it; and it has to be
read against the English line by line, because a dropped closing sentence is
invisible in a popover. Nothing mechanical catches any of this:
`check:uk` is a regex blocklist with no grammar model or dictionary, and
`check:glossary-*` gates check coverage, markup and parity — never meaning.

Related: [[feedback_beginner_review_after_fixes]] — the scoping half of the same
lesson («scoping the reviewer to one chapter blinds it to cross-chapter claims»),
and [[feedback_ua_plausible_nonwords_slip_gates]] — the sweep turned up
«гетеродування», «щоциклу», «несним», «самонакладене» by the same mechanism.
