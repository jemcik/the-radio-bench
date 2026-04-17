# i18n in diagrams

Every word the reader sees inside or around a diagram must come from `t('...')`. The chapters shipped so far taught us that "I'll translate that one string later" is how English leftovers reach production.

This document covers the translation-infrastructure patterns specific to diagrams. For the actual English → Ukrainian translation process, invoke the `ua-translate` skill.

## Rule 0 — no hardcoded strings, ever

```tsx
// ❌ Any of these ship bugs
<text>Voltage</text>
<text aria-label="V rail">+5V rail</text>
<figcaption>Figure 3: Water analogy</figcaption>

// ✅ Correct
<text>{t('ch1_1.voltageLabel')}</text>
<SVGDiagram aria-label={t('ch1_1.railAria')}>
  <text>{t('ch1_1.railLabel')}</text>
</SVGDiagram>
<DiagramFigure caption={t('ch1_1.waterAnalogyCaption')}>
```

This includes: labels, tick captions, axis titles, footnotes, aria-labels, figcaptions, legend entries, tooltip text, error messages in widgets. If the reader can see it, translate it.

## Rule 1 — translate the WHOLE widget, not the one thing flagged

When a user screenshots one missed string ("this label is still in English"), the reflex is to fix that one string and move on. **Don't.** Open the whole widget file, grep for any of the unit family characters (`Hz`, `dB`, `mW`, `µ`, `V`, `Ω`), English words likely to leak (`rate`, `value`, `from`, `to`), and convert every occurrence in one pass. Then check sibling widgets in the same chapter — they usually share the same bugs.

The cost of the wider audit is ~2 minutes. The cost of round-tripping through 10 more screenshots is a session.

## Units — always from the `units.*` namespace

`src/i18n/locales/{en,uk}/ui.json` has a top-level `units` namespace:

```jsonc
{
  "units": {
    "hz": "Hz",       // UK: "Гц"
    "khz": "kHz",     // UK: "кГц"
    "mhz": "MHz",     // UK: "МГц"
    "w": "W",         // UK: "Вт"
    "mw": "mW",       // UK: "мВт"
    "uw": "µW",       // UK: "мкВт"
    "kw": "kW",       // UK: "кВт"
    "nw": "nW",       // UK: "нВт"
    "pw": "pW",       // UK: "пВт"
    "fw": "fW",       // UK: "фВт"
    "db": "dB",       // UK: "дБ"
    "dbm": "dBm",     // UK: "дБм"
    // ... add as needed
  }
}
```

Use a local helper in your component:

```tsx
const { t } = useTranslation('ui')
const tUnit = useCallback((k: string) => t(`units.${k}`), [t])

// Then in JSX:
return `${value} ${tUnit('khz')}`
return mode === 'dbm' ? tUnit('dbm') : tUnit('db')
```

`useCallback` keeps `tUnit` stable across renders, so any `useMemo` depending on it doesn't recompute every time.

### Adding a new unit family

When a chapter introduces a new unit family (currents in A / mA / µA, lengths in m / cm / mm, times in s / ms / µs / ns):

1. Extend `units.*` in BOTH `en/ui.json` and `uk/ui.json` — add the whole family at once, not just the one you need today.
2. Use `tUnit('key')` from the first occurrence.

Don't inline "just this once" — you will add the second one with the same pattern and ship both.

## Numbers — use the format helpers

For numbers generated at runtime (widget readouts, tick labels, `.toFixed` outputs), the Ukrainian decimal separator is a comma, not a period. Use [src/lib/format.ts](../../../../src/lib/format.ts):

```tsx
import { formatDecimal, formatNumber } from '@/lib/format'
const { t, i18n } = useTranslation('ui')
const locale = i18n.language

formatDecimal(20, 2, locale)   // "20.00" (en) / "20,00" (uk)
formatNumber(2.5, locale)      // "2.5" / "2,5"  (trailing zeros trimmed)
```

### CRITICAL caveat — `<input type="number">` needs machine format

HTML's native number input requires a period regardless of page locale. Pattern:

- State holds the machine-format string (`n.toFixed(2)`, period).
- State is bound to `<input>` via `value={machineStr}`.
- Read-only displays (ResultBox, SVG text, span) receive `formatDecimal(rawNumber, digits, locale)`.

Mixing these up wipes the input value to empty in Ukrainian locale.

### Section numbers stay with a period

`Розділ 0.2`, section `3.3` — those are IDs, not decimals. They use a period in both locales.

## Math variables — `<var>` + `<MathVar />`

Plain `R`, `V`, `I`, `f`, `Q` in sans-serif prose reads as an English letter intrusion in Cyrillic copy. Wrap every math variable (and schematic reference designator) in `<var>`:

### In `en/ui.json` AND `uk/ui.json`:

```jsonc
{
  "ch0_5": {
    "symbolResistorDesc": "A two-terminal component. Labelled <var>R</var>. Value in ohms."
  }
}
```

### In the chapter file:

```tsx
import { MathVar } from '@/components/ui/math'

<Trans
  i18nKey="ch0_5.symbolResistorDesc"
  ns="ui"
  components={{ var: <MathVar /> }}
/>
```

`MathVar` is exported from `@/components/ui/math`. It renders the wrapped letter through KaTeX so it shows with proper math serifs.

### Rules

- The `<var>` tag must appear in **both** `en/ui.json` and `uk/ui.json`. Trans component mapping requires matching tags per locale.
- If the current prose uses plain `t(...)` (not `<Trans>`), convert to `<Trans>` **before** introducing `<var>`, or the tag renders literally as text.
- `<var>` also wraps schematic reference designators: `R`, `C`, `L`, `D`, `Q` when they appear in prose.

## In-SVG math — use `<tspan>`, not KaTeX

KaTeX can't render inside an SVG `<text>`. For subscripts and superscripts inside a diagram, compose with `<tspan>`:

```tsx
<text fontSize="13">
  <tspan fontStyle="italic">f</tspan>
  <tspan dy="3" fontSize="8">c</tspan>
  <tspan dy="-3" fontStyle="normal"> · −3 dB</tspan>
</text>
```

Rules:

- **Italic** for the variable, normal for anything else.
- **~60–70% of the base font size** for the subscript (13 → 8).
- `dy="3"` to drop to subscript baseline, `dy="-3"` to return. These are baseline shifts, not absolute y coordinates.

### i18n + tspan

The text that the reader-world sees (the prose part — "Cutoff frequency") goes in the translation key. The math symbol is composed in JSX:

```jsonc
// en/ui.json
"cutoffLabel": "Cutoff frequency"
// uk/ui.json
"cutoffLabel": "Частота зрізу"
```

```tsx
<text>
  <tspan fontStyle="italic">f</tspan>
  <tspan dy="3" fontSize="8">c</tspan>
  <tspan dy="-3"> — {t('ch1_1.cutoffLabel')}</tspan>
</text>
```

The aria-label for the surrounding `<g>` or `<SVGDiagram>` can use the plain prose key — screen readers don't need the symbol composition.

## aria-labels — required on every diagram

`SVGDiagram` takes `aria-label` as a prop. Always pass one, always translated:

```jsonc
// en/ui.json
"waterPipeAria": "Water-pipe analogy: tank with water pressure flowing through a pipe with a narrow restriction"
// uk/ui.json
"waterPipeAria": "Аналогія з водопроводом: бак із водою під тиском, що тече трубою через вузьке звуження"
```

```tsx
<SVGDiagram width={W} height={H} aria-label={t('ch1_1.waterPipeAria')}>
```

### What to write in an aria-label

Describe what the diagram *shows*, in one sentence, for a screen-reader user who cannot see it. Not "Figure 3" or "Water diagram" — actual content. "Three panels comparing conductor, semiconductor, and insulator electron availability." "Bode plot of an RC low-pass filter from 100 Hz to 100 kHz showing the cutoff frequency at 1 kHz."

## Captions — `<DiagramFigure caption={...}>`

Use the `caption` prop, not a bare `<figcaption>`:

```tsx
<DiagramFigure caption={t('ch1_1.waterPipeCaption')}>
  <WaterPipeDiagram />
</DiagramFigure>
```

### Bilingual nuance

`DiagramFigure`'s caption is a single string — but sometimes a caption needs emphasis or a component (glossary link, `<var>`). Use `<Trans>` then:

```tsx
<DiagramFigure
  caption={
    <Trans
      i18nKey="ch1_1.waterPipeCaption"
      ns="ui"
      components={{
        var: <MathVar />,
        G: <G k="voltage" />,
      }}
    />
  }
>
  <WaterPipeDiagram />
</DiagramFigure>
```

## Inline component placeholders in JSON

When wrapping a glossary term inside a sentence (or any other component), BOTH locale files get the placeholder. Easy to forget the second locale:

```jsonc
// en/ui.json
"shortcutTip": "Every <ham>ham</ham> in the world …",
// uk/ui.json  ← MUST also have <ham>…</ham>
"shortcutTip": "Кожен <ham>радіоаматор</ham> у світі …",
```

### Glossary tag discipline

Keep the `<G>` wrapper tight around the abbreviation or canonical term only — never wrap a long parenthetical expansion:

```jsonc
// ❌ Tooltip positioned off-screen because Radix popper measures the whole phrase
"vnaDesc": "A <vna>VNA (Vector Network Analyser)</vna> measures …"

// ✅ Tooltip anchored to the abbreviation
"vnaDesc": "A <vna>VNA</vna> (Vector Network Analyser) measures …"
```

## Verification checklist

After any i18n-affecting diagram edit:

```bash
node scripts/check-i18n.mjs          # parity between en and uk
node scripts/check-i18n-usage.mjs    # orphan key detection
npm run check:uk                     # UK linter (calques, decimal periods, Latin units)
```

Parity OK does not mean placeholder parity. A manual diff of the two locale blocks is still required when you add component placeholders like `<var>`, `<ham>`, `<G>`.

## When translating a new chapter — always go through `ua-translate`

`ua-translate` (at `.claude/skills/ua-translate/`) runs a 6-stage pipeline: load glossary + landmines, primary translation via briefed agent, 5 parallel critique agents (fluency / technical / consistency / calques / grammar), consolidated findings, automated `npm run check:uk` linter, then user review.

**Never** translate a diagram's i18n block inline key-by-key. Invoke `ua-translate`. Every new user correction becomes a new landmine entry + lint rule so the next chapter is cleaner.

## Linter CLI

```bash
# Scope to one chapter while iterating:
node .claude/skills/ua-translate/scripts/lint-ua-translation.mjs src/i18n/locales/uk/ui.json ch1_1
```
