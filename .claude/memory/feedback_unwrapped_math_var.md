# Every math variable in chapter prose must be wrapped in `<var>`

**Reader-flagged, ch 2.1 (2026-05).** The speed of light shipped as bare
letters — «…written c.», «λ = c / f» — instead of `<var>c</var>`,
`<var>λ</var>`, `<var>f</var>`. The lowercase `c` blended into the
sans-serif body text; the reader couldn't tell it was the variable. Part 1
wraps every variable in `<var>` (→ `<MathVar>` → KaTeX italic, 600+ uses);
the new Part-2 symbols were authored as plain text.

## Why it slipped through everything

All existing `<var>` gates check the **render safety of markup already
present** (`check:tag-renders`, `check:bare-subscript-renders`,
`check:var-multichar-subscripts`, `check:hardcoded-jsx-subscript`). NONE
checked for the **absence** of `<var>` on a bare variable. `beginner-review`
targets clarity/ambiguity, not typography. So neither machine nor human was
positioned to catch «you forgot to wrap a variable».

## The rule (do this every chapter, every section)

- Any math variable or Greek symbol in chapter **prose, summaries, quiz,
  widget descriptions/hints** → `<var>X</var>`, rendered via `<Trans>` /
  `buildQuizFromI18n` (both map `var` → `<MathVar>`).
- A symbol that belongs in a JSX **control label** (e.g. an input label
  «Frequency 𝑓») → render `<MathVar>f</MathVar>` in the `.tsx`, keep the
  i18n string symbol-free so `aria-label` stays plain. (This is what the
  ch 2.1 λ↔f converter does for «Частота 𝑓» / «Довжина хвилі 𝜆».)

## Mechanical enforcement

`check:unwrapped-math-var` (in `check:all`) — `scripts/check-unwrapped-math-var.mjs`.
Scans `chN_M` i18n blocks, removes `<var>` contents, then flags:
- (A) lone Greek variable letter (Ω / µ excluded — units);
- (B) single Latin letter next to operator `= · × ≈ ÷` (slash excluded —
  units like m/s);
- (C) standalone lowercase Latin letter in prose (article «a», unit /
  abbreviation / apostrophe-contraction contexts excluded).

Part 0–1 pre-existing debt (~541 keys) is grandfathered in
`scripts/unwrapped-math-var-baseline.json`; the gate fails only when a
key's count grows or a new key appears. Re-snapshot after an intentional,
render-verified change with `--update-baseline`.

**Gotcha caught during build:** the Greek set first OMITTED `λ` itself —
the exact bug variable — so always self-test new symbol sets
(`node -e "/[…]/u.test('λ')"`). Lesson: a gate is only as good as its
alphabet; verify it fails on the original bug before trusting it.
