# i18n markup conventions

Authoring rules for HTML-in-JSON inside `src/i18n/locales/{en,uk}/ui.json`. These are owned by the skill, not CLAUDE.md — when a new failure mode emerges, extend this file (and add a linter rule if mechanically catchable).

## Subscripts: write them inside `<var>…</var>` (TeX), never as separate `<sub>`

**Hard rule.** Never use the pattern `<var>X</var><sub>Y</sub>` in i18n strings. Write subscripts inside the TeX: `<var>X_{…}</var>`. The old pattern produces two adjacent inline-block spans and browsers can (and do) break lines between them, orphaning the subscript onto the next line (`V_C` rendered as «V» on one line, «ᴄ» on the next).

Subscript-form conventions (preserves visual parity with plain HTML `<sub>`):

- **Latin multi-char label** (in, out, rms, pk, pk-pk, min, avg, rated): `<var>V_{\mathrm{in}}</var>` — upright, matches physics notation.
- **Latin single-char label** (C, L, R, D): `<var>V_{\mathrm{C}}</var>` — also `\mathrm{}` for upright. (Using `\mathrm{1}` for digits is fine too; KaTeX renders digits upright either way.)
- **Italic variable subscript** (i, j, k, n as index): `<var>V_{i}</var>` — no `\mathrm`, italic is correct for indices.
- **Cyrillic subscript** (ном, вх, вых): `<var>V_{\text{ном}}</var>` — `\text{}` switches out of math mode to render Cyrillic correctly.

Linter rule: `markup.var-sub-linebreak` is an ERROR for any `<var>X</var><sub>Y</sub>` it finds. One-pass migration of 260 instances (EN + UA) landed in ch 1.5.

## Term styling: `<G>` for terms, `<strong>` for emphasis, NEVER `<em>` on terms

Hard rule established ch 1.5 after a reader saw orange «заряд» (wrapped in `<em>`) and clicked it expecting a tooltip — but `<em>` is just typographic emphasis, not a glossary term. The project's CSS historically styled `<em>` as orange (`color: hsl(var(--primary))`) which looked identical to how readers expect interactive terms to look. That CSS has been fixed so `<em>` is now plain italic + inherit colour, but the authoring rule stands:

- **Glossary term** (defined in `src/features/glossary/glossary.ts` and `glossary._names.*` in ui.json) → `<G k="term-key">` or the chapter-local alias tag (`<deb>`, `<charge>`, `<vna>`, `<ham>`, etc. registered in the `<Trans components={{...}} />` map). Renders with dashed underline, hover tooltip, click-to-pin popup.
- **Non-term emphasis** (comparative adjectives like "smaller / *larger* voltage", key-phrase italics like "*rate of change*", stress on a word like "*all* curves have the same shape") → `<em>`. Plain italic after the CSS fix, no orange colour, no tooltip.
- **Key-concept highlight that isn't a glossary term** → `<strong>`. Bold, clearly distinct from both body text and glossary terms.

NEVER wrap a known glossary term in `<em>`. If the term has a glossary entry, use `<G>`; if it doesn't, either add the entry (if it's worth defining) or don't give the word special styling.

**Decision rule when uncertain:** does the reader need a definition? Yes → `<G>` (create the entry if missing). No → `<strong>` for key concepts, `<em>` for grammatical emphasis (contrast / stress / italicised phrase).

## `<G>` tag span — anchor on the abbreviation only

Keep the `<G>` wrapper tight around the abbreviation or canonical term — never wrap a long parenthetical expansion too.

- **Wrong**: `<vna>VNA (Vector Network Analyser)</vna>` — the Radix popper measures the wrapped union of the whole phrase and positions the tooltip off-screen.
- **Right**: `<vna>VNA</vna> (Vector Network Analyser)` — anchors on the abbreviation alone.

## `<Trans>` placeholder parity across locales

When wrapping an inline component, BOTH locale files must include the placeholder — `check:i18n` catches missing keys but not missing component placeholders inside a present key.

```jsonc
// en/ui.json
"shortcutTip": "Every <ham>ham</ham> in the world …",
// uk/ui.json  ← MUST also have <ham>…</ham>
"shortcutTip": "Кожен <ham>радіоаматор</ham> у світі …",
```

Then the chapter file uses `<Trans i18nKey="…" components={{ ham: <G k="ham radio" /> }} />`. After every locale edit, run `npm run check:i18n` and `npm run check:trans`, and manually diff the two locale strings when a new placeholder is introduced.

## No HTML entities in i18n JSON

`&quot;`, `&amp;`, `&nbsp;` render verbatim through react-i18next. Use real characters — curly quotes `"…"` / `«…»`, a real non-breaking space, etc.
