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

## Components

| EN | UK | gender | notes |
|---|---|---|---|
| current-limiting resistor | обмежувальний резистор | m | **NOT** `струмообмежувальний` — rarer and clunkier. |
| pull-up resistor | підтягувальний резистор | m | **NEVER** `підтягуючий` — Russianism. Always `-льний`. |
| pull-down resistor | стягувальний резистор | m | Same rule. |
| LED | світлодіод | m | |
| multimeter | мультиметр | m | |
| breadboard | макетна плата | f | Add `безпайна` when contrasting with solderable protoboard |
| breadboard (solderable) | макетна плата під пайку | f | |
| jumper wire | з'єднувальний провід / дріт-перемичка | m | |
| battery (AA cell) | батарейка АА / пальчикова батарейка | f | Project prefers AA over 9V — see CLAUDE.md |
| car battery | автомобільний акумулятор | m | |
| 9 V block | батарейка «Крона» (6F22) | f | Retail Ukraine almost always says «Крона» |

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

## Number formatting

- **Decimal separator**: comma, universal. `1,5 В`, `0,1 мм/с`, `6,25 × 10¹⁸`, `−2,5 дБ`.
- **Period** is reserved for section numbers and version numbers.
- **Non-breaking space** between number and unit: `1,5&nbsp;В` (as character `\u00a0`).
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

- **`сила струму` vs `струм`**: formal definitions and the terms table use `сила струму`. Running prose about current flowing somewhere uses `струм`. Widget labels and value boxes show whichever fits naturally in the sentence — default to `сила струму` for labels announcing the quantity.
- **React variable tags**: `<var>I</var>`, `<var>V</var>`, `<var>R</var>`, `<var>E</var>` — wired to the `MathVar` component in `Chapter1_1.tsx` (and any chapter that uses them) which passes through KaTeX for proper math serif. Capital I in italic sans-serif renders as `/` — always use the `<var>` wrapper, never bare `<i>I</i>`.
- **Ion charge notation**: `+3/−2` means 3 positive protons / 2 remaining electrons after one has been removed. The broken balance is `+3/−3` (neutral state). Preserve this exact notation in atomicCaption.
