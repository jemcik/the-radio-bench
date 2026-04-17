# Translation landmines — never repeat these

Every entry here is a concrete mistake that surfaced during Ch 1.1 review. Each cost a round-trip with the user. **Before writing any Ukrainian sentence, mentally scan this list.**

Format: `❌ Wrong → ✅ Right → Why`.

---

## 1. Project-level naming

❌ **`в цій книзі` / `в цій книжці`** (referring to the whole project)
✅ **`в цьому курсі`**
Why: Radiopedia is a web course, not a book. "The book" in the English source was a casual metonym; Ukrainian makes it feel wrong when rendered literally.

❌ **`Цей сайт побудований…` / `Цей сайт передбачає…`** (EN `This site is built…` / `This site assumes…`)
✅ **`Цей курс побудований…` / `Цей курс передбачає…`**
Why: `сайт` is literal for "website" but the project's self-reference is canonically `курс` everywhere else (see `welcome.closingParagraph`, `ercDetail`, etc.). Don't drift.

### The `Радіоверстак` exception — `верстак` IS the site identity

The project's **Ukrainian brand name** is **`Радіоверстак`** (literally "Radio Workbench" — a pun on the English "The Radio Bench"). `верстак` in Ukrainian means a carpenter's workbench. The word is intentionally preserved whenever the text plays on the site's identity:

✅ **KEEP** `Радіоверстак` — in `site.title`, `welcome.heading`, any branding string
✅ **KEEP** `Насолоджуйтесь верстаком` (Ch 0.1 `oneMore2`) — this is a callback to the brand name, NOT generic "bench"
✅ **KEEP** `верстак` / `верстака` when describing a depicted physical workbench illustration (e.g. `heroAriaLabel` in Ch 0.2)

❌ DO NOT replace `верстак` with `стенд` in the cases above. It sounds "correct" by the glossary `bench = стенд` rule but destroys the brand pun.

✅ **USE `стенд` / `стенда`** for any OTHER mention of the lab-equipment setup in running prose: `на реальному стенді`, `налаштування лабораторного стенда`, `зберіть на своєму стенді`.

Genitive: align with `chapterTitles.0-2` — **`стенда`**, not `стенду`. Both are grammatically valid in UA, but the codebase has picked `стенда` as canonical.

---

## 2. `домовленість` — never for scientific convention or a person's choice

❌ **`домовленість Франкліна з'явилася раніше…`** (calling a person's unilateral choice an "agreement")
✅ **`вибір Франкліна з'явився раніше…`**

❌ **`За домовленістю, стрілки струму малюють…`**
✅ **`За прийнятим правилом, стрілки струму малюють…`**

❌ **`усі символи землі на схемі з'єднані між собою за домовленістю`**
✅ **`усі символи землі на схемі вважаються з'єднаними між собою`**

❌ **`Загальноприйнята домовленість, що струм тече від «+» до «−»`**
✅ **`Загальноприйняте правило, згідно з яким струм тече від «+» до «−»`**

Why: `домовленість` = interpersonal agreement (two parties), which doesn't fit scientific conventions (nobody signed an agreement) or a person's choice (Franklin didn't agree with anyone).

**Gender-follow-up**: after substituting `вибір` (m) for `домовленість` (f), check all pronouns — `її/нею` (f) must become `його/ним` (m). Miss this and the user catches it.

---

## 3. Calqued idioms (English thinking, Ukrainian words)

| ❌ Wrong | ✅ Right | Context |
|---|---|---|
| `Тримайтеся цієї картинки` | `Запам'ятайте цю картинку` | "Hold on to this picture" — `тримайтеся` is physical holding |
| `Збираємо разом` (section heading) | `Як вони працюють разом` | "Putting it together" — loses meaning in UA |
| `світлодіод у петлі` | `світлодіод… з'єднані послідовно` | "In a loop" means circuit loop, but `петля` = physical noose |
| `Струм тече крізь речі` | `Струм тече крізь щось` | `речі` colloquially = personal items/clothes |
| `міркувати про речі, яких ви не бачили` | `міркувати про явища, яких ви не бачили` | EN `things` as abstract → `явища` / `щось`, not `речі` |
| `Якщо ці речі здаються невизначеними` | `Якщо ці поняття здаються незнайомими` | Same `речі` issue; note the pronoun chain (`їм`, `вони`) requires a plural noun, not `це` sg |
| `Речі, на яких спотикаються` | `Те, на чому спотикаються` | Same — `речі` for abstract "things that trip up" is a calque |
| `осцилограма` (generic "waveform") | `форма хвилі` / `хвиля` / `сигнал` | `осцилограма` = specific scope trace. Generic EN `waveform` → `форма хвилі`. |
| `VNA` left in Latin in UK prose | `ВАЛ` (векторний аналізатор ланцюгів) | Codebase canonicalises `ВАЛ` (see `vna.label`, Ch 0.2). Consistency across chapters. |
| `мудрість від досвідчених операторів` | `мудрість досвідчених операторів` | `від + gen` is a calque of EN `from`; pure genitive is idiomatic |
| `заміна їй` (EN "a replacement for it") | `замість неї` | Calqued word order; `замість неї` flows naturally |
| `Сам процес спроби пригадати` | `Сама спроба щось пригадати` | EN nominalisation `the act of trying` stacked into UA three-noun chain; verbalise instead |
| `ми чесно його пропускаємо — скажемо про це` | `ми це чесно визнаємо й пропускаємо — скажемо про це` | `чесно` modifies the admitting, not the skipping — restructure so the adverb binds to the right verb |
| `Бічна панель показує, де саме ви знаходитесь` | `Бічна панель показує, де саме ви зараз` | `знаходитесь` is a soft Russianism; UA prefers shorter "ви зараз" or just a positional adverb |
| `а не здавався незбагненним` | `а не здавався суцільною загадкою` | `незбагненний` is high/theological register; warmer intro tone fits a lighter phrase |
| `три речі, якими ви користуватиметесь` | `три величини, з якими ви матимете справу` | EN "three things" for quantities → `величини` / `параметри` / `характеристики`, not `речі` |
| `звертайте увагу на три речі` | `звертайте увагу на три характеристики` | Same — `речі` for specs/features is a landmine |
| `розповідають різні речі про неї` | `говорять про неї різне` | `речі` again + calqued word order |
| `найпростіший прилад` (for EN "most fundamental instrument") | `найосновніший прилад` / `найбазовіший прилад` | `найпростіший` = simplest (structural); EN "fundamental" = foundational/basic |
| `3¾ знаки` (multimeter resolution) | `3¾ розряди` | Metrology term: "digits" on a meter display = `розряди`, not `знаки` |
| `скажімо, −20 дБ` (parenthetical "say") | `наприклад, −20 дБ` | `скажімо` is a direct calque of EN "say"; UA uses `наприклад` or `припустімо` |
| `прості концепції модуляції` | `прості поняття модуляції` | `концепція` is philosophical/technical-abstract; textbook register prefers `поняття` |
| `залишитесь у захопленні надовго` | `захоплення радіо з вами надовго` | Calque of "keep at the hobby" — `захоплення` is the hobby itself, don't nest it as location |
| `Пронумеровані набори з обчищеними кінцями` (pre-cut jumper wires) | `набори попередньо нарізаних дротів зі знятою ізоляцією` | `пронумеровані` mistranslates "pre-cut" — would mean "numbered" which makes no sense for jumpers |
| `Доплатите $5–10` (future indicative for "Spend extra") | `Доплатіть $5–10` | EN imperative → UA imperative, not future indicative |
| `апгрейдите` / `апгрейдитеся` | `перейдете на кращі` / `оновлюватимете [...]` | Anglicism; UA has native verbs |
| `постануть зрозумілими` | `стане на свої місця` | Calque of "become clear"; `постануть зрозумілими` is high register + awkward |
| `Найважливіші дві характеристики.` | `Найбільше значення мають дві характеристики.` | Verb-less English fragment ("X matter most") needs a finite UA verb |
| `ВАЛ — для аматорського радіо — найпотужніший` | `Для аматорського радіо ВАЛ — найпотужніший` | Dash-wedged parenthetical in middle of subject+predicate reads awkward in UA; move qualifier to front |
| `що може дозволити собі будь-хто` | `доступний кожному` | Clumsy relative clause; UA has adjective |
| `роздумів над неправильними результатами` | `витрачених на з'ясування, чому результати неправильні` | `роздуми над результатами` reads as philosophical contemplation |
| `у найгіршу мить випадає` | `випадає саме тоді, коли цього не треба` | Dramatic register; EN "at the worst moment" doesn't need `мить` |
| `не робить чистого запуску` | `не синхронізується чітко` (or `погано запускається`) | `робити запуск` is bureaucratic — verb `запускатися` / `синхронізуватися` is native |
| `проходить через кожен розділ` (theme/idea) | `наскрізна в усіх розділах` | Cliché calque of "runs through every chapter" |
| `загадок типу «не працює»` | `загадок на кшталт «не працює»` | `типу` as "such as" is Russianism; `на кшталт` / `на зразок` is native |
| `з'єднання працюють` (connections "work") | `з'єднання дають показання` / `схеми відгукуються` | Connections don't "work" in UA idiom — they yield readings |
| `коло під напругою це вже готовий нещасний випадок, якому бракує лише нагоди` | `коло під напругою — це нещасний випадок, що вже чекає свого часу` | Missing em-dash + calqued "an accident waiting to happen" |
| `Верстак` (abstract lab-bench setup) | `Стенд` | `верстак` is reserved for `Радіоверстак` brand pun + literal workbench illustration. Abstract "bench" = `стенд`. |
| `працюючих інструментів` (Russianism participle) | `справних інструментів` / `робочих інструментів` | `-ючих` active participles are Russianism; UA uses `-льний`/`-чий` or relative clauses. Same rule as `підтягуючий` → `підтягувальний`. |
| `кΩ` / `МΩ` / `мΩ` (Cyrillic prefix + Greek Ω) | `кОм` / `МОм` / `мОм` | Mixed-script compound in prose. Keep «Ω» only as a standalone parenthetical («(Ω)») referencing meter-faceplate labels, or in the glossary dual-notation form «Ом (Ω)». |
| `наноfarads` (Latin stem in mid-word) | `нанофарад` | English leftover glued to UA prefix; case form needs adjustment (skilки + genitive plural). |
| `пікo` (Latin `o` inside Cyrillic word) | `піко` | Mixed-script encoding typo. Any `-ико`, `-ано`, etc. ending that "looks right" but contains a Latin letter renders identically in Latin fonts but breaks search/screen readers. |
| `обидві сторони (рівняння)` (math equation "sides") | `обидві частини (рівняння)` | `сторони` is a literal calque of EN "both sides". UA math textbooks prefer `обидві частини рівняння` as the formal idiom. Applies to `formulaDivideBothSides`, `formulaMultiplyBothSides`, `formulaTakeSquareRoot`, `formulaTakeReciprocal`, quiz explanations. |
| `Невірне введення` (for "invalid input") | `Некоректне введення` / `Неправильне значення` | `невірний` strictly means "unfaithful" in UA. Use `некоректний` for "invalid/incorrect". |
| `Струм` (as formal quantity-label row in units table) | `Сила струму` | Glossary rule: formal quantity labels use `сила струму`; running prose uses `струм`. |
| `найбільш використовуваний навичка` | `найуживаніша навичка` | Gender mismatch (`навичка` is f, needs f adjective) + stylistic: UA prefers `найуживаніший` over analytic `найбільш + X`. |
| `закрий невідому` (ти-imperative, f-accusative) | `закрийте невідоме` (ви-imperative, n-accusative) | Register break (familiar ти in a ви-chapter) + gender: "the unknown" as abstract = `невідоме` (n). |
| `яку змінну вам потрібна` | `яка змінна вам потрібна` | Case agreement: after `вам потрібна` the subject is nom., not acc. |
| `або еквівалентно поділену на 2` | `— тобто поділену на 2` | `еквівалентно` as floating adverb is calque of "or equivalently". UA uses a dash + `тобто`. |
| `Як тільки ви побачите це як ділення` | `Щойно ви почнете сприймати їх як ділення` | `Як тільки` + perfective future is a calque of "once/as soon as". `Щойно` + `почнете` reads native. |
| `нудно й схильно до помилок` | `нудно і легко помилитися` | `схильно до помилок` is a literal calque of "error-prone"; UA `схильність` needs a person/object subject, not an activity. |
| `Число перед множенням` (for "the number in front") | `Число-множник перед степенем десяти` | Literal rendering opens the sentence unclearly — `множення` as a noun here reads opaque. |
| `в десять разів більше!` | `вдесятеро більше, ніж потрібно!` | Calque of "ten times too big!" — UA has `вдесятеро` as the compact multiplier. |
| `на скільки кроків ви рухаєтеся` | `скільки кроків ви робите` | `рухатися на N кроків` isn't idiomatic; you `робите` N steps. Also the preposition `на` is redundant here. |
| `йде в іншу сторону` (for "the inverse operation") | `це зворотна дія` / `робить навпаки` | Spatial calque of "goes the other way" for an abstract inverse. |
| `перетворюєте формулу для напруги чи струму` | `виражаєте з формули напругу чи струм` | EN "rearrange for" is an idiom; UA says `виразити з формули X`. |
| `робить речі більшими швидко` | `швидко збільшує числа` | `речі` landmine + calqued word order. |
| `приносять їх назад` (of inverse operations) | `повертає їх до попередніх величин` | `приносити назад` is physical carrying; abstract "bring them back down" needs `повертає`. |
| `ви часто будете знати … й вам потрібно знайти` | `часто трапляється так, що ви знаєте … й маєте знайти` | Tense-mismatched calque of "you will know … and need to find". |
| `Ми будемо практикуватися в цьому з кожною новою формулою` | `Ми відпрацьовуватимемо це на кожній новій формулі` | Triple calque: `практикуватися в N` + `з кожною N` + periphrastic future. |
| `близькі до позначених значень` | `близькими до номінальних значень` | `позначених` is ambiguous (marked by whom?). EN "labelled values" = `номінальні`. |
| `ви на неправильному діапазоні` | `обрано не той діапазон` | Literal calque of "you are on the wrong range". UA electrical idiom is impersonal. |
| `відрізняється від позначення` | `сильно відрізняється від номіналу` | Same as `номінальні` above — `позначення` means "marking/designation", wrong register for "label value". |
| `Число з 1 цифрою (або більше) перед комою` | `Число з однією або кількома цифрами перед комою` | Mid-phrase `(або більше)` parenthetical reads as anglicism. |
| `Перетворіть на I = V/R` (for "rearrange to") | `Виразіть I: I = V/R` | `Перетворіть на X` reads as "transform [something] into X", unclear. UA math idiom: `виразити змінну`. |
| `напишіть формулу як трикутник` | `запишіть формулу у вигляді трикутника` | EN "write as [a shape]" needs UA `записати у вигляді N`. |
| `справжні радіо-приклади` | `реальні приклади з радіо` | Hyphenated compound `радіо-приклади` isn't natural UA; also `справжній` too often = "genuine/authentic". |
| `вільне володіння перетворенням означає, що ви можете` | `якщо ви робите такі перетворення впевнено, то зможете` | `вільне володіння N` in UA is reserved for languages; calqued "being fluent means you can" restructures awkwardly. |
| `вода летить стрімко` | `вода тече стрімко` | Water flows, doesn't fly |
| `електрони пролітають повз точку` | `електрони проходять повз точку` | At drift-velocity speeds, electrons don't fly |
| `струмінь, що виливається` | `струмінь з труби` / `струмінь, що ллється` | `виливатися` = spill/leak (problem), not designed flow |
| `ворушаться електрони` | `рухаються електрони` | `ворушитися` is too colloquial for physics |
| `втомлена батарейка` | `розряджена батарейка` | "Tired battery" is an English idiom |
| `шматочок опору навмисної величини` | `елемент із точно заданим опором` | "A piece of resistance" is English wordplay; in UA it's nonsense — resistance is a quantity |
| `вибір, навмисна величина` — noun + abstract English wordplay | Rephrase to describe the function directly | |
| `сиділа в кожній схемі` | `укорінилася в кожній схемі` | `сидіти` is too colloquial |
| `іменні пам'ятки` (for "namesakes") | `вчених` (with implicit "named after") | `пам'ятка` = monument/memorial |
| `Точніше, …` as sentence-opener refining earlier claim | Often redundant — just start the sentence | |
| `Проміжний випадок, і — що головне — …` (fragmented) | Restructure as proper subject + verb | Fragmented calque |

---

## 4. Register / verb-choice mismatches

❌ **`Напруга проганяє крізь матеріал зовсім різні струми`** — `проганяти` = drive/herd, wrong register
✅ **`Напруга створює в різних матеріалах зовсім різні струми`**

❌ **`За характером відгуку матеріали поділяють…`** — `відгук` = feedback/review
✅ **`За тим, як вони реагують, матеріали поділяють…`**

❌ **`нагрівник`** — not a standard Ukrainian word
✅ **`нагрівач`**

❌ **`підтягуючий резистор`** — Russianism
✅ **`підтягувальний резистор`**

❌ **`Висока вежа штовхає сильно; порожня не штовхає взагалі.`** — `штовхає` transitive verb with no object
✅ **`Висока вежа створює сильний тиск; порожня — жодного.`**

---

## 5. Awkward sentence structures (verb-less predicates, fragments)

❌ **`Опір — це наскільки вузька труба.`** — subordinate clause as predicate
✅ **`Опір — це звуження труби.`**

❌ **`Напруга завжди існує між двома точками — ніколи не в одній.`** — elided verb
✅ **`Напруга завжди існує між двома точками, а не в одній.`**

❌ **`Струм — це те, що відбувається, коли заряд рухається.`** — direct calque of "is what happens when"
✅ **`Струм виникає тоді, коли заряд рухається.`**

❌ **`Зазвичай збіг у межах кількох відсотків.`** — verb-less
✅ **`Зазвичай вони збігаються з точністю до кількох відсотків.`**

❌ **`Один кулон — це заряд приблизно 6,25 × 10¹⁸ електронів; таке число вголос ніхто не лічить.`** — `приблизно` mid-phrase awkward; `лічить` rare
✅ **`Один кулон — це сумарний заряд близько 6,25 × 10¹⁸ електронів. Зазвичай такими великими числами рідко оперують без потреби.`**

---

## 6. Technical precision

❌ **`Не кажіть «струм у точці X»: струм — це завжди швидкість.`** — `швидкість` alone reads as "speed"
✅ **`Не можна сказати «струм у точці X»: струм не буває в точці — він завжди тече крізь щось.`**

❌ **`перетворити струм на напругу`** (for a beginner chapter) — abstract concept without physics yet
✅ **`отримати напругу, пропорційну струму`** — describes what physically happens

❌ **Atomic caption**: `баланс +3/−2 порушується` — +3/−2 is the result, not what was broken
✅ **`баланс +3/−3 порушується, стаючи +3/−2`** — broken balance was the neutral state

---

## 7. Unit formatting and localization

❌ **Ladder labels**: `10 mA`, `15 A`, `30 kA`, `400 kV`, `10 kΩ` (English symbols in UK)
✅ **Always use `useUnitFormatter` → `мА`, `А`, `кА`, `кВ`, `кОм`**

❌ **`1.5 V`** in UK locale (period as decimal separator)
✅ **`1,5 В`** — use `formatNumber(n, locale)` from `src/lib/format.ts`

❌ **`datasheet`** untranslated in UK
✅ **`специфікація`** (or `технічний опис`)

❌ **Terms table**: `C (coulomb)`, `A (ampere)` — English scientist names
✅ **Localize**: `Кл (кулон)`, `А (ампер)`, `В (вольт)`, `Ом (ом)`

❌ **`Coulomb = К`** — collision with Kelvin
✅ **`Кл`** always

❌ **`<i>I</i>`** — italic capital I renders as `/` or `l` in sans-serif
✅ **`<var>I</var>`** — JSX renders through KaTeX math font with serifs

---

## 8. `Ви` capitalization (user-flagged)

❌ **`Ви`, `Ваш`, `Вас`, `Вам`** mid-sentence (capitalized)
✅ **`ви`, `ваш`, `вас`, `вам`** (lowercase)

Why: Ukrainian hobbyist/educational register uses lowercase `ви`. Capital `Ви` is a Russian-textbook convention and reads as stiff/old-fashioned on this project. Sentence-starting capitalization is still grammatical.

---

## 9. Physics consistency across metaphors

The chapter sometimes mixes metaphors (water-pipe, traffic, LED circuit). Keep each metaphor internally consistent, but don't let a wrong primary-metaphor word bleed into another section.

**Primary metaphor in Ch 1.1 = water.** Voltage = `тиск` (pressure). Do NOT call voltage `поштовх` (push/jolt) in the intro, because the water analogy immediately below says "pressure". The one section where `поштовх` remains legitimate is the traffic analogy (slope gravity).

Cross-check every quantity's description across sections for this kind of drift.

---

## 10. Diagram labels and captions

❌ `витрата` (for flow in water-pipe analogy) — reads as engineering jargon (water-consumption billing)
✅ `потік` — matches the prose (`Струм — це потік води`)

❌ Overcrowded diagram labels that force text to wrap behind an arrow or clip the viewBox
✅ **Shorten the label text**. Ukrainian is often ~20–30% longer than English; a label that fit in EN may clip in UK. When a label is going to be constrained by viewBox geometry, prefer shorter forms (`+3 протони, +2 електрони = +1`, not the full "сумарний заряд +1 одиниця").

---

## How this list grows

When the user flags something I missed, add it here verbatim with `❌ wrong → ✅ right → why`. This is the permanent record — each new chapter starts with this list loaded.
