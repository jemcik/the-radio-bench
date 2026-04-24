# Ukrainian terminology glossary

**Single source of truth** for every domain term. Before translating, check here first. Never coin a new Ukrainian rendering without adding it to this file and getting user approval.

Each entry tracks: **EN term** → **UK rendering** + **grammatical gender** + notes on inflection/register.

## Core physical quantities (Ch 1.1)

| EN | UK | gender | notes |
|---|---|---|---|
| current (the quantity, in formulas) | сила струму | f | For formal definitions, quantity labels, table rows: `Сила струму (позначення <var>I</var>) — …` |
| current (running prose) | струм | m | Use in flowing prose where the quantity is being described in action. `Струм тече крізь щось…` |
| voltage | напруга | f | `Напруга` |
| resistance | опір | m | `Опір` (the quantity) |
| resistor | резистор | m | The physical component |
| charge (electric) | заряд | m | Plain `заряд`, or `електричний заряд` for emphasis on first mention |
| EMF (electromotive force) | ЕРС (електрорушійна сила) | f | Spell out fully on first mention per section: `електрорушійна сила (ЕРС)`. Then use `ЕРС`. |
| drift velocity | дрейфова швидкість | f | Full form in textbook style. `швидкість дрейфу носіїв` acceptable variant. |
| conductor | провідник | m | Plural: `провідники` |
| insulator (physics category / material) | діелектрик | m | Use when classifying materials by electrical property (rubber, glass, ceramic as `діелектрики`). |
| insulator (wire sheath / physical sleeve) | ізолятор | m | Only for the physical coating/sleeve on a cable, never for the material category. |
| semiconductor | напівпровідник | m | |
| conventional current direction | умовний (технічний) напрям струму | m | Phrase `за напрям струму умовно прийнято напрям руху позитивних зарядів` is standard. |
| power (the quantity) | потужність | f | Running-prose rendering. Formal-definition label: `Потужність (позначення <var>P</var>)`. Never `сила` — that's reserved for `сила струму`. |
| watt (unit — name spelled out) | ват | m | **Single `т`** — `ват`, `вата`, `ватом`, gen. pl. `ват`. Unit symbol: `Вт`. The double-`т` form `ватт` / `Ватт` is reserved for the SCIENTIST's surname (Джеймс Ватт, на честь Джеймса Ватта). Mixing them up is a spelling error the user has flagged. |
| watt-hour (energy unit) | ват-година | f | `Вт·год`. Same single-`т` rule. |
| joule | джоуль | m | `Дж`. One watt = one joule per second → `один ват дорівнює одному джоулю за секунду`. |

## Components

| EN | UK | gender | notes |
|---|---|---|---|
| current-limiting resistor | обмежувальний резистор | m | **NOT** `струмообмежувальний` — rarer and clunkier. |
| pull-up resistor | підтягувальний резистор | m | **NEVER** `підтягуючий` — Russianism. Always `-льний`. |
| pull-down resistor | стягувальний резистор | m | Same rule. |
| voltage divider | подільник напруги | m | **NEVER** `дільник` — use `подільник` everywhere (glossary, chapter body, chapter subtitles). Enforced by ch1.4 pushback. |
| tolerance (component spec) | допуск | m | `допуск` — short, canonical. `толеранс` is a calque; avoid. |
| preferred value (E-series member) | стандартний номінал / номінал зі стандартного ряду | m | Series names stay Latin: E12, E24, E48, E96, E192. |
| decade (10-fold interval of resistor values) | десяток | m | UA Wikipedia «Ряди номіналів радіоелементів» uses `десяток` exclusively for E-series context. **NOT** `декада` in this context. |
| decade (frequency, Bode-plot rolloff) | порядок / декада | m | Here `декада` IS acceptable (English borrowing glossed as synonym in `decade.detail`). Do not conflate with resistor-E-series context. |
| package / form-factor (component body) | корпус | m | Datasheet-canonical. In beginner prose (intro/preview paragraphs), prefer general paraphrase («тип резистора»); introduce the technical term in-section with context. |
| surface-mount / SMD | SMD / поверхневий монтаж | m / m | `SMT` = technology; `SMD` = component. Both can stay Latin in UA electronics register. |
| colour code (resistor bands) | кольоровий код / кольорове кодування | m / n | Both accepted; pick one per context. Section-heading style: `кольоровий код`. Prose-definition style: `кольорове кодування`. |
| orange (colour name — anywhere in the course) | оранжевий | m | **Project-wide convention (user-flagged ch1.4).** UA has three equally-valid synonyms: `оранжевий` / `помаранчевий` / `жовтогарячий`. This course standardises on `оранжевий`. Do NOT introduce the other two forms in new content. Applies to resistor colour bands, diagram arrows, waveform plots, callout tones — every "orange" in every chapter. |
| biasing (transistor DC operating point) | зміщення (datasheet register) / задавання робочої точки (pedagogical register) | n / n | `зміщення` is the canonical engineering term (every datasheet). In a BEGINNER chapter before transistors are introduced, use `задавання робочої точки` for clarity. Include both on first use if mixing registers. |
| conductance | провідність | f | Symbol `<var>G</var>`, unit «сіменс» (См). Dual of resistance. |
| sag (voltage-output collapse under load) | просадка / просідання | f / n | Verb: `просідати` / `просісти`. Contrast `падіння напруги` = voltage DROP across a component (IR drop), different concept. |
| load (R_L in divider/amplifier input) | навантаження | n | Adj.: `навантажений`. Verb: `навантажувати`. |
| Thévenin's theorem | теорема Тевенена | f | Canonical UA form (genitive `Тевенена`, not `Тевеніна`/`Тевеніна`). |
| Horowitz & Hill (AoE attribution) | Горовіц і Гілл | — | Instrumental with `за`: `за Горовіцем і Гіллом`. Full UA name-forms; no Latin inside running prose. |
| LED | світлодіод | m | |
| multimeter | мультиметр | m | |
| breadboard | макетна плата | f | Add `безпайна` when contrasting with solderable protoboard |
| breadboard (solderable) | макетна плата під пайку | f | |
| jumper wire | з'єднувальний провід / дріт-перемичка | m | |
| battery (AA cell) | батарейка АА / пальчикова батарейка | f | Project prefers AA over 9V — see CLAUDE.md |
| car battery | автомобільний акумулятор | m | |
| 9 V block | батарейка «Крона» (6F22) | f | Retail Ukraine almost always says «Крона» |

## Ch 1.5 — capacitor-specific canonical terminology

Established through Gemini side-by-side + user review in ch 1.5. These are project-canonical going forward.

| EN | UK | gender | notes |
|---|---|---|---|
| capacitor | конденсатор | m | |
| capacitance | ємність | f | **NEVER** `місткість` (volumetric). **NEVER** `ємнисть` (misspell). |
| capacitor plate | обкладка | f | **NOT** `пластина` for the charge-carrying conductive element. `Пластина` OK for the ceramic substrate (a plate the electrodes are printed on), NOT for the capacitor plate itself. |
| dielectric (insulating layer in a cap) | діелектрик | m | Plural «діелектрики» when multiple materials are listed. See also `insulator` in Ch 1.1. |
| dielectric constant / relative permittivity | діелектрична проникність | f | **NEVER** `діелектрична стала` as the primary term (legacy/Russian-leaning; OK only as a secondary synonym after «проникність»). Symbol `<var>ε</var><sub>r</sub>`. |
| permittivity of free space / vacuum permittivity (ε₀) | діелектрична проникність вакууму | f | **PEDAGOGY RULE**: EN's "permittivity of free space" must NOT be translated as bare «електрична стала» (the post-2019 SI name) — doing so erases the pedagogical link from εᵣ to ε₀. Keep «діелектрична проникність вакууму» as the primary noun; «електрична стала» may appear as a parenthetical SI-synonym. The reader needs to see that εᵣ and ε₀ are the SAME physical quantity, with ε₀ being the vacuum-reference. Past Gemini regression on ch 1.5 `geometryVars`. |
| electrolytic capacitor | електролітичний конденсатор | m | **Full noun phrase** — never bare «електролітичний» (bare adjective) or «електроліт» (which means the electrolyte substance, not the component). |
| coupling capacitor | розділювальний конденсатор | m | Placed in series to pass AC while blocking DC bias. |
| bypass / decoupling capacitor | блокувальний конденсатор | m | Placed shunt to short HF noise to ground. |
| bleeder resistor | **розряджувальний резистор** | m | **Wikipedia-canonical** — uk.wikipedia.org article title is «Розряджувальний резистор». Never «розрядний резистор» (Gemini's tendency). |
| parallel-plate capacitor | плоский конденсатор | m | Canonical UA physics term. Also accepted: «конденсатор із паралельними обкладками» (literal). |
| tuned circuit / resonant tank | коливальний контур | m | **NOT** «налаштований контур» (literal calque of "tuned"). Wrong Claude translation caught by Gemini. |
| time constant | стала часу | f | **NEVER** `постійна часу`. Full form «стала часу RC-кола» preferred over bare «стала часу RC». |
| RC circuit | RC-коло | n | **NOT** `RC-ланцюжок` (colloquial), **NOT** `RC-ланцюг` (broader term for a chain — use коло for a loop). |
| capacitive reactance | ємнісний реактивний опір | m | Safe for use from ch 1.5 onward (per linter jargon registry). |
| derivative (calculus) | похідна | f | Glossary entry added in ch 1.5. «Як швидко величина змінюється». |
| ESR (Equivalent Series Resistance) | ESR / еквівалентний послідовний опір | m | Keep **`ESR`** in Latin (do NOT translate to «ЕПС»). Expand UA meaning on first mention: «ESR (еквівалентний послідовний опір)». |
| DC offset / DC bias (on a signal path) | постійна складова / постійне зміщення | f / n | «Постійна складова» is more accessible for beginners. «Постійне зміщення» is equally valid and used in Datasheets. BOTH avoid the verb «блокує» — use «не пропускає постійну складову». |
| DC bias on a capacitor (causes X7R drift) | **прикладена постійна напруга** | f | **Pedagogical preference**: use descriptive «прикладена постійна напруга» instead of jargon «напруга зміщення». The X7R DC-bias drift can be described fully without ever using the word «зміщення». Example: «ємність X7R знижується під дією прикладеної постійної напруги». User-flagged during ch 1.5 §3 review — «напруга зміщення» is undefined jargon for a beginner chapter. The linter warns on «зміщення» before ch 1.10+ (jargon registry). |
| bypass / decoupling (actions, first use) | шунтування високочастотних завад на землю (**блокування**) / ізоляція каскадів за постійним струмом (**розв'язування**) | n | On first appearance in §3 Types, the action nouns «блокування» and «розв'язування» MUST be explained inline with a descriptive phrase. Forward-reference §7 («детально розглянемо у §7»). Later uses don't need to repeat the gloss. User-flagged during ch 1.5 §3 review. |
| "blocks DC, passes AC" (slogan) | **«не пропускає постійний струм, пропускає змінний»** | — | **Canonical slogan** across the whole course. Use guillemets when quoting. The verb is «не пропускає», NEVER «блокує». (`блокує` only in compound «блокувальний конденсатор» for bypass caps, and in filter stop-band terminology «фільтр блокує високі частоти» / «режекторний фільтр блокує смугу».) |
| switch debouncing (circuit / action) | усунення дрижання контактів | n | **NOT** «усунення брязкоту» alone — `брязкіт` is colloquial without qualifier. Full form «дрижання контактів» is the physics/engineering register term. Has its own glossary entry (`<deb>` tag → `<G k="debouncing" />`); every chapter that uses the term **must wrap first occurrence in `<deb>…</deb>`** so the reader gets the clickable tooltip, not bare bold. Tooltips (`glossary.time constant.detail`, `glossary.rc circuit.detail`) have inline parenthetical gloss because tooltip content can't contain nested tooltips. |
| exponential (adj., of curve/function) | експоненційний / експоненціальний | — | **Both valid per UA dictionaries.** Wikipedia and 20-volume dictionary prefer «експоненційний». Orthographic dictionary accepts «експоненціальний». Either form is correct — don't flag one as wrong. |
| worked example (callout label) | Приклад розрахунку | — | **NEVER** «Розв'язаний приклад» (landmine 141 — calque of EN "worked"). Also acceptable: «Наочний приклад», «Приклад із розрахунком», or start with `Розглянемо приклад` / `Візьмімо`. |
| widget | віджет | m | Project-wide UA term for UI interactive element. **NOT** `модель` (Gemini sometimes substitutes — regress to `віджет`). |
| action-button label (imperative) | Зарядити / Розрядити / Скинути | — | UI convention: imperative verbs, not noun forms («Заряд» / «Розряд»). |

### Polarity vocabulary — hard lexical rule

For poles, leads, terminals, plates, electrodes, conductors spoken of as positive/negative in a physical-polarity sense — **ALWAYS «позитивний / негативний»**. NEVER «додатний / від'ємний». This is a hard rule — the linter flags it as ERROR (`forbidden.dodatny-polarity`).

- **позитивний вивід / позитивний полюс / позитивна обкладка / позитивний електрод** — correct
- **додатний вивід** — WRONG (lint error)

`додатний / від'ємний` is reserved for scalar/math contexts only:
- `додатне число` — positive number
- `від'ємна півхвиля` — negative half-wave of a sine
- `√ від'ємного числа` — square root of a negative number

This rule was established during ch 1.5 in response to user pushback repeated several times across ch 1.1–1.4.

### Subscripts — hard typographic rule

Math-variable subscripts stay in the **source script**. Never localize:

- `<var>V</var><sub>in</sub>` — Latin "in", NEVER «вх»
- `<var>f</var><sub>c</sub>` — Latin "c" for cutoff, NEVER «зр»
- `<var>V</var><sub>0</sub>`, `<var>V</var><sub>out</sub>`, `<var>V</var><sub>DC</sub>` — keep as source

Rationale: these symbols appear in formulas, widgets, diagrams; localizing the subscript breaks cross-context identity. Gemini 2.5 Pro sometimes regresses this; catch during side-by-side review.


## Meta / project-level

| EN | UK | gender | notes |
|---|---|---|---|
| this site / this course / this book (the project itself, prose self-reference) | цей курс | m | **NEVER** `сайт`, `книга`, or `книжка`. Project is a web course. The Ukrainian brand name `Радіоверстак` (see below) is the ONLY place a different word for the project appears. |
| **"The Radio Bench" (site name)** | **Радіоверстак** | m | The project's Ukrainian name — a deliberate pun. `верстак` is kept as the site identity, NOT replaced with `стенд`. Appears in `site.title`, `welcome.heading`, and is callbacks like `oneMore2` "Насолоджуйтесь **верстаком**" play on this name. |
| lab bench (equipment setup, abstract) | стенд / лабораторний стенд | m | For the physical/abstract electronics setup used in lab activities. Genitive: `стенда` (match `chapterTitles.0-2`). NOT `верстак` (see above — that word is reserved for site-identity puns). |
| bench (physical carpenter's/workbench illustration) | верстак | m | Only when the text refers to a depicted physical workbench (e.g. `heroAriaLabel` describing an ink sketch of a workbench). |
| Franklin's convention / Franklin's choice | вибір Франкліна | m | **NOT** `домовленість Франкліна` — no two-party agreement existed |
| scientific convention (impersonal, e.g. "by convention") | правило / прийняте правило / загальноприйнятe правило | n / n | **NOT** `домовленість` — too interpersonal. `за прийнятим правилом, стрілки струму…` |
| heater / heating element | нагрівач | m | **NOT** `нагрівник` — non-standard |
| datasheet | специфікація | f | Component datasheet. Also acceptable: `технічний опис`, `технічний паспорт`. **Never keep the English word.** |
| waveform (generic "a wave shape") | форма хвилі / хвиля / сигнал | f/f/m | Generic waveform (e.g. "where there's a waveform, there's a diagram"). **NOT** `осцилограма` — that specifically means a captured oscilloscope trace. |
| oscilloscope trace / oscillogram (specific scope reading) | осцилограма | f | Only when referring to an actual scope capture/screenshot, not a generic waveform. |
| VNA (vector network analyser) | ВАЛ (векторний аналізатор ланцюгів) | m | Canonical Ukrainian form. Use `ВАЛ` after first mention. See `vna.label` in ui.json. |
| ARRL Handbook | довідник ARRL | m | Proper-noun publication — keep `ARRL` Latin (acronym rule). |
| ERC Report 32 | ERC Report 32 | — | Keep as-is — proper-noun publication. |

## Ham radio

| EN | UK | gender | notes |
|---|---|---|---|
| radio amateur (person) | радіоаматор | m | Universal in UA amateur-radio literature |
| amateur radio (activity) | радіоаматорство | n | |
| callsign | позивний | m | Formal: `позивний сигнал`; operational: `позивний` |
| licensing body (UA) | УДЦР | | Український державний центр радіочастот; the regulator above is `НКЕК` (since 2022, replaced НКРЗІ) |
| QSO, CW, SSB, AM, FM, DX | keep Latin uppercase | — | Never transliterate. `провести QSO на 20-метровому діапазоні в CW` |
| transceiver | трансивер | m | |
| transmitter | передавач | m | |
| receiver | приймач | m | |
| antenna | антена | f | |
| band | діапазон | m | `80-метровий діапазон`, `діапазон 2 м` |

## Units

**Rule**: in prose, use **Cyrillic unit symbols** always. Latin forms (`mA`, `kΩ`) appear only on instrument faceplates (per ДСТУ 3651.0-97), not in flowing Ukrainian text.

| EN symbol | UK symbol | notes |
|---|---|---|
| V | В | volt |
| kV | кВ | kilovolt |
| mV | мВ | millivolt |
| A | А | ampere |
| kA | кА | kiloampere |
| mA | мА | milliampere |
| µA | мкА | microampere |
| Ω | Ом | ohm (capital О, lowercase м) |
| kΩ | кОм | kiloohm |
| MΩ | МОм | megohm |
| mΩ | мОм | milliohm |
| C | Кл | coulomb (**NOT** `К` alone — that's Kelvin) |
| J | Дж | joule |
| W | Вт | watt |
| Hz | Гц | hertz |
| kHz | кГц | — |
| MHz | МГц | — |
| GHz | ГГц | — |
| F | Ф | farad |
| µF | мкФ | — |
| nF | нФ | — |
| pF | пФ | — |
| H | Гн | henry |
| s | с | second |
| ms | мс | — |
| µs | мкс | — |
| ns | нс | — |
| dB | дБ | decibel |
| dBm | дБм | — |

## Phase and AC-specific terminology

| EN | UK | notes |
|---|---|---|
| in phase (of two signals) | синфазно / синхронно (both OK; prefer **синфазно** for a physics-textbook register — more precise than «у фазі», which can read as «at some phase») | For "voltage and current are in phase in a resistor", UA `напруга та струм змінюються синфазно` is the canonical form in Ukrainian physics literature. `у фазі` is an acceptable shortcut but subtly ambiguous. User-approved ch1.5. |
| out of phase | у протифазі / не в фазі | |
| 90° out of phase (capacitor/inductor case) | зсунуті на 90° / у квадратурі | |
| phase shift / phase difference | фазовий зсув / різниця фаз | |

## "Blocks DC" — prefer «не пропускає постійний струм»

For the canonical capacitor slogan "blocks DC, passes AC", Ukrainian physics/electronics register prefers `не пропускає постійний струм, пропускає змінний` over `блокує / пропускає`. Reasoning:

- `блокує` in UA carries the sense of a physical obstruction / siege / roadblock; applied to current it reads as a calque of EN `blocks`.
- `не пропускає / пропускає` is the matched-pair construction used in Ukrainian textbooks (passes / does-not-pass).

Scope: use the `не пропускає` form when describing capacitor behaviour w.r.t. DC/AC current. Keep `блокує` for:
- `блокувальний конденсатор` — the noun for "bypass capacitor" — this is an established technical term, don't touch.
- `блокує постійне зміщення` — blocking a DC offset / bias voltage on a signal path — different object (static potential, not current flow). Either form OK; current project usage keeps `блокує` here.
- Filter-stop-band behaviour: `фільтр блокує високі частоти / режекторний фільтр блокує смугу` — established filter terminology, keep `блокує`.

## Number formatting

- **Decimal separator**: comma, universal. `1,5 В`, `0,1 мм/с`, `6,25 × 10¹⁸`, `−2,5 дБ`.
- **Period** is reserved for section numbers and version numbers.
- **Non-breaking space** (character `\u00a0`) required to keep tightly-linked pairs on one line:
  - Number + unit: `1,5\u00a0В`, `100\u00a0мА`, `50\u00a0Гц`, `20\u00a0мс`.
  - Structural designator + number/Roman: `Частина\u00a0I`, `Частину\u00a01`, `Розділ\u00a01.3`, `Part\u00a0I`, `§\u00a03.2`.
  - Without NBSP the pair can break across lines — reader sees «Частини» on one line, «I» on the next (or clipped). User-flagged on welcome page where «Частини I» was torn.
- **Range dash**: en-dash `–` with NBSPs: `1–3 А`, `3,3–5 В`.
- For runtime-formatted numbers, use `formatNumber(n, locale)` / `formatDecimal(n, digits, locale)` from `src/lib/format.ts` so the period/comma switches with the locale.

## Scientist-name genitive

When used with `на честь`:

- Coulomb → **Шарля-Огюстена де Кулона** (1736–1806)
- Ampère → **Андре-Марі Ампера** (1775–1836) — declines as hard-consonant masculine
- Volta → **Алессандро Вольти** (1745–1827)
- Ohm → **Ґеорґа Сімона Ома** (1787–1854)
- Faraday → **Майкла Фарадея**
- Henry → **Джозефа Генрі** (indeclinable)
- Hertz → **Генріха Герца**

## Pre-approved idiom substitutions

Source English idioms that translate literally into awkward Ukrainian. Use these verbatim:

| EN | UK |
|---|---|
| tip the balance (atom becoming ion) | порушити рівновагу / достатньо втратити або приєднати один електрон |
| push six times harder | штовхає вшестеро сильніше |
| carry you further than you'd expect | ця проста модель заведе вас далі, ніж здається на перший погляд |
| knock a little energy out of the electron | забирає в електрона частину енергії |
| a feel for typical magnitudes | щоб око звикло до масштабу / відчуття характерних порядків величин |
| order of magnitude | порядок величини |
| rule of thumb | емпіричне правило / правило «на око» |
| Hold on to this picture (remember it) | Запам'ятайте цю картинку |
| Putting it together (section heading) | Як вони працюють разом |
| in a loop (circuit) | з'єднані послідовно (do NOT use `у петлі`) |

## Decision notes for tricky cases

- **One-shot jargon: plain-language primary + term in parens.** When a scientific/mathematical term appears exactly ONCE in a chapter and isn't worth a full glossary entry (yet), don't just drop it bare — replace with a plain-language description and drop the technical term in parens for the curious. Pattern: «X дедалі повільніше наближається до Y, але ніколи повністю його не досягає (математики називають це «асимптотичним» наближенням).» This teaches the concept AND the vocabulary without forcing the reader to guess what «асимптотично» means. If the term later appears in 2+ chapters, promote it to a proper glossary entry and use `<tag>` wrapping. Past fix: `ch1_5.rcIntro` «асимптотично» → plain language + parenthetical.
- **«Вузол» (node) is engineering jargon — avoid in beginner prose.** In graph / circuit theory a "node" means "a point where components meet." Readers without engineering background don't parse that meaning; they read «вузол» as «knot» or guess at random. When the text needs to point at a location on a schematic, use plain words: «позначка V_C», «точка між R і C», «місце, де R з'єднується з C». Reserve «вузол» for later chapters that build up to it with a proper introduction. Past fix: `ch1_5.rcSchematicCaption` said «Вузол V_C — напруга на конденсаторі» and readers had to guess what «вузол» meant.
- **If a term has a glossary entry, the first appearance in every chapter MUST be wrapped in its tag.** Past misses in ch 1.5: `ESR` in `typesElectrolyticIntro` (entry `esr` existed in `src/features/glossary/glossary.ts` and `glossary.esr` in ui.json, but prose used bare «ESR»); `сталою часу` in `rcTauDefn` (entry `time constant` existed; EN had `<tc>` but UA didn't); `дрижання контактів` in `rcCurvePoints` (entry `debouncing` existed; was only wrapped in `<strong>`). **Pre-apply audit**: after every batch, grep the chapter prose for each UA value in `glossary._names.*` and verify at least one occurrence in each section is wrapped in a tag. The project convention is «once per section is enough» — don't re-tag every mention, but the FIRST appearance in each `<h2>`-level section should always have the tooltip handle. Future work: add a `style.untagged-glossary-term` rule to the linter that parses section boundaries and flags first-occurrence misses automatically.
- **`<strong>` ≠ glossary term.** When a reader doesn't know what a word means, bolding it with `<strong>` doesn't help — it just says "this is emphasised." A glossary term must use `<G k="...">` (or a short alias like `<deb>`, `<vna>`, `<ham>` registered in the chapter's `components={{}}` map) so the reader gets a dashed-underline style + hover tooltip + pinned popup with the full definition. Rule: if you find yourself typing `<strong>UnknownTerm</strong>` to make a term stand out, stop — create a glossary entry instead. Past fix: `ch1_5.rcCurvePoints` used `<strong>дрижання контактів</strong>` which rendered as bare bold; readers saw no tooltip, no definition path. Switched to `<deb>…</deb>` with a proper `glossary.debouncing` entry.
- **`<em>` is italic emphasis, NOT a term marker.** Historical `src/index.css` rule styled `<em>` as orange (`color: hsl(var(--primary))`, non-italic, 500-weight), which made any italicised word read as a glossary term — orange colour, no underline, no tooltip, pure confusion. Fixed in ch 1.5 by changing the CSS to plain italic + inherit colour. **Rule for authors**: `<em>` is now real HTML5 emphasis (italic, same colour as body). Never wrap a term name in `<em>` — wrap it in `<G k="...">` or an alias tag. Never use `<em>` to make a term "look colourful"; if the term deserves accent styling, it deserves a glossary entry. Only legitimate `<em>` uses are for contrastive adjectives («менша ємність / <em>більша</em> напруга»), key-phrase italics («<em>швидкість зміни</em>»), or whole-word stress («<em>всі</em> криві мають однакову форму»). Past fix: `ch1_5.seriesFormulaLead` used `<em>заряд</em>` — «заряд» is a defined glossary term, so switched to `<charge>…</charge>` → `<G k="charge" />`.
- **Section / subsection headings need an explicit subject in UA.** EN headings lean on elliptical nominal phrases whose subject is carried by the chapter context («Types», «Energy stored», «Combinations»). UA readers see headings in the navigation / table of contents / chapter sidebar **out of context**, so the subject must be named in the heading itself. Always translate «Types» → «Типи конденсаторів», «Energy stored» → «Накопичена енергія» (OK only because «накопичена» is already specific), «Combinations» → «Послідовне та паралельне з'єднання конденсаторів». Past fix on `ch1_5.sectionTypes`. Applies to every chapter's section keys.
- **`сила струму` vs `струм`**: formal definitions and the terms table use `сила струму`. Running prose about current flowing somewhere uses `струм`. Widget labels and value boxes show whichever fits naturally in the sentence — default to `сила струму` for labels announcing the quantity.
- **React variable tags**: `<var>I</var>`, `<var>V</var>`, `<var>R</var>`, `<var>E</var>` — wired to the `MathVar` component in `Chapter1_1.tsx` (and any chapter that uses them) which passes through KaTeX for proper math serif. Capital I in italic sans-serif renders as `/` — always use the `<var>` wrapper, never bare `<i>I</i>`.
- **Ion charge notation**: `+3/−2` means 3 positive protons / 2 remaining electrons after one has been removed. The broken balance is `+3/−3` (neutral state). Preserve this exact notation in atomicCaption.
