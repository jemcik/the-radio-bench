# Ukrainian translation style — Radiopedia

## Voice & register

- **Polite plural `ви`, always LOWERCASE** — never capital `Ви`/`Ваш`/`Вам`. Capital `Ви` is a Russian-textbook convention; Radiopedia's Ukrainian audience reads lowercase as natural, capital as stiff.
- **Never mix `ви` and `ти`** in one chapter.
- **Impersonal infinitive / 1-pl `ми`** is OK and idiomatic for derivations: `розгляньмо коло`, `отримуємо формулу`, `бачимо, що…`. Mix freely with `ви`.
- **Tone target**: friendly-direct textbook. Match Ch 0.2's voice (e.g. `Ласкаво просимо! …ви у правильному місці`). Not stuffy. Not overly chatty. Room for em-dash asides, parentheticals, and the occasional conversational phrase.

## Punctuation

- **Em-dash `—`** (U+2014) for emphasis, apposition, asides. Common in Ukrainian prose — lean on it.
- **Guillemets `«…»`** for quoted inline terms, letter symbols, model names: `«струм»`, `позначення «I»`, вивід «+». **Never straight quotes** `"…"` in user-facing strings.
- **Apostrophe** — use the typographic curly form `'` (U+2019), not the ASCII straight `'`. Ukrainian uses apostrophe inside words (`з'являється`, `п'ять`, `кулон'ять`).
- **Ellipsis `…`** — single character U+2026, not three periods `...`.
- **Non-breaking space** `\u00a0` between number and unit: `1,5 В`, between digit groups in large numbers, before certain short words following a number.
- **En-dash `–`** (U+2013) for numeric ranges with NBSPs: `1–3 А`, `3,3–5 В`, `1736–1806`.

## Numbers

- **Decimal separator**: comma always. `1,5 В`, `−2,5 дБ`, `0,1 мм/с`.
- Period ONLY for:
  - Section numbers (`Розділ 1.2`)
  - Version numbers
- **Thousands grouping**: non-breaking space. `30 000`, `6,25 × 10¹⁸`.
- For runtime-formatted numbers, always use `formatNumber(n, locale)` / `formatDecimal(n, digits, locale)` from `src/lib/format.ts`. **Never feed a localized string into `<input type="number">`** — that element only accepts canonical period-format; the display layer does the localization.

## Unit symbols

All units render in Cyrillic in prose. See `glossary.md` for the full table. Key instances:

- `В`, `кВ`, `мВ` (voltage)
- `А`, `кА`, `мА`, `мкА` (current)
- `Ом`, `кОм`, `МОм`, `мОм` (resistance — note `Ом` has capital `О` + lowercase `м`)
- `Кл` (coulomb — **never** `К` alone, that's Kelvin)
- `Гц`, `кГц`, `МГц`, `ГГц` (frequency)
- `Вт`, `Дж`, `Ф`, `Гн`, `дБ`, `дБм`

## Math variables AND schematic reference designators

Both physics variables (`I`, `V`, `R`, `E`, `Q`, `f_c`, …) and schematic reference designators (`R` for resistor, `C` for capacitor, `L` for inductor, `D` for diode, `Q` for transistor, and their subscripted forms `R_1`, `C_2`) must render in KaTeX math italic, not HTML italic and not plain sans-serif.

**In i18n JSON**, wrap them in `<var>X</var>`:

```json
"currentIntro": "… (позначення <var>I</var>) — …",
"symbolResistorDesc": "… Позначається <var>R</var>. …",
"symbolVoltmeterDesc": "Кружок з літерою <var>V</var> всередині. …"
```

**In the chapter JSX**, map `var` to `MathVar`:

```tsx
<Trans i18nKey="ch1_1.currentIntro" ns="ui"
  components={{ current: <G k="current" />, var: <MathVar /> }}
/>
```

`MathVar` is exported from `src/components/ui/math.tsx` — use the shared export, **do not redeclare** per chapter. If your chapter renders a description field (e.g. `SymbolCell`) with plain `t(...)`, convert it to `<Trans>` with the `var` mapping before introducing `<var>` in the i18n string, or the tag renders literally.

**Why**: browser italic of capital `I` in sans-serif renders as `|` or `/`, mistakable for lowercase `l`. Standalone letters like `R`, `C`, `L`, `D`, `Q` in plain prose read as stray English letters and compete visually with surrounding Cyrillic. KaTeX math serifs make them unambiguously "this is a symbol / label".

**Locale parity**: `<var>X</var>` must appear in BOTH `en/ui.json` and `uk/ui.json` — the Trans component mapping requires the same tag structure across locales. Don't put `<var>` only in UK.

## Typographic details caught during review

- **`«»` around an isolated `+` or `−` polarity mark in prose**: Ukrainian readers parse `до − клеми` as a hyphen, not a polarity indicator. Wrap: `до клеми «−»`. In English this is often fine but sometimes still ambiguous (`to the − terminal` looks like em-dash); wrap too if so.
- **Scientist names in genitive**: Ukrainian declines surnames. `на честь Шарля-Огюстена де Кулона`, `на честь Андре-Марі Ампера`, `на честь Алессандро Вольти`, `на честь Ґеорґа Сімона Ома`. See glossary for the full list.
- **The `<code>` tag** in i18n strings is fine for inline code; react-i18next passes it through. Don't conflate with `<var>` (math variable) — `<code>` is monospace; `<var>` is KaTeX math serif.

## Diagram text

Same rules, plus on-screen size:

- **Minimum on-screen font: 13 px** (was 11, raised mid-Ch 1.1). Smaller is unreadable next to body copy.
- **Never use CSS `maxWidth` that differs from the viewBox width**. That imposes a scale factor and shrinks every font below its source value. Design coordinates natively at the intended display size. See `feedback_svg_font_minimum_on_screen.md`.
- **Ukrainian runs ~20–30% wider than English** at the same font size. Budget `PAD_L` and label-column widths against the worst-case Ukrainian string, not the English original. Document the math in a comment block above the geometry constants.

## React/Trans component placeholders

Every `<strong>`, `<i>`, `<em>`, `<var>`, `<G>`, and domain-specific tag like `<current>`, `<voltage>`, `<resistance>`, `<conductor>`, `<drift>` etc. is a component placeholder mapped in the chapter JSX. **Preserve tags exactly**. Translating them (e.g. `<напруга>` or `<сильний>`) breaks the Trans render.

## Things to avoid, briefly

- **Transliteration of Latin terms** when a Ukrainian word exists: `datasheet` → `специфікація`, NOT `даташит`.
- **Russianisms in participles**: `-льний` is the correct Ukrainian ending (`підтягувальний`, `стягувальний`, `обмежувальний`, `нагрівальний`). `-ючий` forms like `підтягуючий`, `стягуючий` are Russianisms — reject.
- **Mid-phrase `приблизно`** in numeric prose: `заряд приблизно 6,25 × 10¹⁸` reads awkwardly. Put `близько` before the number instead: `заряд близько 6,25 × 10¹⁸`.
- **Abstract "conversion" phrasings** for physics-beginner audiences: `перетворити струм на напругу` will confuse someone who hasn't learned Ohm's law yet. Describe what physically happens: `отримати напругу, пропорційну струму`.
