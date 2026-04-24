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
| `найчесніше взяти нову деталь` | `краще взяти нову` | "The honest move is to…" — EN idiom where "honest" means "pragmatic/sensible," not morally honest. UA `найчесніше` literally asks the reader "is it morally dishonest to keep the old one?" — nonsense. Collapse to `краще`. ch1_5.typesElectrolyticCallout fix. Claude-authored, not Gemini. |
| `одне число, що задає…` | `повністю визначає…` / drop hedge | "A single number that sets…" — EN idiom emphasising scalar-ness. UA `одне число` reads as a bare quantifier and invites "why one, not two?" If the author's point is «this alone captures everything», say so: «τ повністю визначає швидкість…». If the scalar emphasis adds nothing, drop the hedge entirely. Past fix: `glossary.time constant.tip` (EN + UA). |
| `на X спадає напруга Y` (engineer-jargon idiom for voltage drop across component) | `на X є напруга Y` / `напруга на X дорівнює Y` / `Y припадає на X` | `спадати` literally means «to fall / decrease». For beginners «спадає більша напруга» parses as «a larger voltage decreases» — opposite of the intended «there is a larger voltage across the component». The noun `падіння напруги` is the accepted technical term, but the verb form `спадає` is ambiguous without establishing vocabulary. Prefer plain «напруга на» or «припадає на». Past fix: `ch1_5.keyTakeaway3` «на конденсаторі з меншою ємністю спадає більша напруга» → «що менша ємність конденсатора, то більша напруга на ньому». |
| `чим X, тим Y` (Russianism of comparative clause) | `що X, то Y` | «Чим … тим» is marked as a Russianism in modern UA style guides («чем … тем»); native form uses «що … то». Both are understood, but in pedagogical text prefer the native one. Past fix: same `ch1_5.keyTakeaway3` edit. |
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
| `стати у пригоді` / `стануть у пригоді` / `знадобляться у пригоді` | `стати у нагоді` / `стануть у нагоді` | **Hard error** — not an alternate idiom, just a confusion between `пригода` (adventure/incident) and `нагода` (occasion/need/use). The canonical UA idiom for "come in handy / be useful" is `стати в нагоді`. A native reader parses `стати у пригоді` as "turn into an adventure" → nonsense. This slipped past 5 critics on Ch 0.2 because it sounds *almost* right; mechanical linter rule now enforces. |
| `<tag>ABBR (Full form in parens)</tag>` — glossary tag wraps both the abbreviation AND its expansion | `<tag>ABBR</tag> (Full form in parens)` — wrap only the abbreviation; leave the parenthetical as plain text | Two issues, both real: (a) the reader sees the full underlined stretch as "two separate terms" because the inline span wraps across a line break, and (b) Radix popper's bounding-rect measurement on a multi-line inline trigger puts the tooltip hundreds of px away from the term. Fix by trimming the glossary tag to just the abbreviation. If the parenthetical contains punctuation that's grammatically glued to a compound (e.g. UK `ЧМ-мовлення (FM)`), restructure so the compound stays intact outside the tag. |
| `урятує вам вечір від розчарування` (and similar `X від Y` constructions where Y is an abstract feeling/quality) | Either rephrase with a clause («когось врятує, коли щось піде не так») or replace the `від Y` with an attribute (`зіпсованого вечора`) | **Calque pattern** — EN "a frustrating evening" becomes "an evening FROM frustration" in literal translation. UA doesn't use `від + abstract-noun` to mean "characterised by" — only to mean "caused by" or "against". So `вечір від розчарування` reads as "an evening [that came] from disappointment" = nonsense. **Rule**: if the EN source has "an X of/from Y" where Y is an abstract feeling, reach for an attributive adjective (`зіпсований/втомлений/виснажливий`) or a subordinate clause (`коли Y`) instead. |
| `урятує/заощадить вам X` (dative benefactor with `рятувати`) | `урятує вас від зіпсованого X` or `врятує ваш X` | In UA, `рятувати` takes accusative (person or thing being saved), not dative "for someone". `Врятує вас від чогось` or `врятує ваш вечір` reads natively; `врятує вам щось` is calqued EN "save you an X". |
| `зворотне питання` / `зворотна операція` (for math inverse) | `обернене питання` / `обернена операція` | `зворотний` in UA = feedback/return (as in `зворотний зв'язок`). For math inverse use `обернений`. Frequent trap in tutorial prose about logarithms, square roots, Ohm's-law rearrangements. |
| `Розв'язок — обрати X` (for EN "the fix/solution is to") | `Рішення — обрати X` / `Вихід — обрати X` | `розв'язок` in UA is specifically *the answer to an equation*. For generic "the fix/solution" in prose, use `рішення` or `вихід`. |
| `Конвенція` (for scientific convention) | `Правило` / `Прийняте правило` | Same family as the `домовленість` landmine — `конвенція` reads as political/diplomatic agreement in UA, not scientific choice. |
| `тихцем вбудовує / робить X` | `непомітно / приховано` | `тихцем` = on the sly, furtive (negative connotation). For EN "quietly bakes in" / "quietly does X" use neutral `непомітно` or `приховано`. |
| `дисципліна X` (as academic field) | `галузь X` / `сфера X` | `дисципліна` in UA tilts toward "subject taught at university". EN "discipline" in "engineering discipline / signal-chain discipline" = `галузь`/`сфера`. |
| `сидять у макетній платі` / `сидять у роз'ємі` (components seated) | `щільно встановлені` / `вставлені` | Same family as `сиділа в рівнянні` landmine. Components don't `сидіти` in UA — they `встановлені` or `вставлені`. |
| `слідкуйте за цим` (for "watch out for") | `стережіться цього` | `слідкувати за N` = monitor, keep track of. For "be wary of / guard against" use `стерегтися`. |
| `розділення 10·log / 20·log` (for "distinction") | `розрізнення` / `чим відрізняються` | `розділення` = physical splitting; for a conceptual distinction use `розрізнення`. |
| `безнадійно вигнутою` / `безнадійно + technical adjective` | Neutral intensifier (`сильно`, `дуже`) or rephrase | `безнадійно` reads emotionally dramatic; EN "hopelessly bent" is hyperbole acceptable in EN, flattens in UA. |
| EN "X stops being free" / "X is no longer free" with abstract X (e.g. `лінійність перестане даватися задарма` / `перестане бути безкоштовною`) | Rewrite concretely: `проста лінійна залежність уже не виконуватиметься` / `лінійна модель уже не працюватиме` / `не можна буде просто припускати X`. | EN "free" in the sense of "by default / without extra modelling / as the automatic assumption" doesn't carry over when you apply it to an abstract UA noun — `X дається задарма/безкоштовно` reads as a literal price on an object, and the reader loses the whole point. Say what physically happens instead: the simple model stops holding, the assumption fails, the relationship is no longer linear. Same trap fires for "comes for free", "no longer free", "free of charge" in any abstract sense. |
| `Розібраний приклад` (for EN "a worked example") | `Приклад` / `Наочний приклад` / `Приклад із розрахунком` — or restructure with `Розглянемо приклад` / `Візьмімо` | `Розібраний` literally = "taken apart / dismantled" and reads bizarre/unnatural as a qualifier on `приклад`. The user flagged this specifically. EN "worked" implies "fully solved step-by-step"; UA either drops the qualifier (context makes it clear the example is solved below) or uses `наочний` ("illustrative"). Pair with a verbal opener: `Візьмімо …` / `Розглянемо …` reads most native. |
| `ват` with double `тт` (`ватт`, `ватта`, `ваттом` …) for the UNIT | Single `т`: `ват`, `вата`, `ватом` (genitive pl. `ват`). Double `тт` is reserved for the SCIENTIST's surname: `Джеймс Ватт`, `на честь Джеймса Ватта`. | Standard UA orthography splits the unit from the eponym: the unit follows Ukrainian single-consonant convention (`ват`, as with `ом`, `ньютон`, `джоуль`), while the personal name preserves the Germanic double-consonant spelling (`Ватт`). Mixing them — writing the unit as `ватт` — is a straight spelling error the user has flagged. Linter rule would catch `ватт`/`Ватт` followed by anything other than a genitive personal-name ending (`-а`, `-ові`, `-е`, `-ом` with capital). |
| `Ці три числа пов'язує X` (or "these three numbers / values") when only 1–2 numbers have been written so far | `Напруга, сила струму й потужність пов'язані формулою X` (or whichever quantities — name them) | EN handily says "these three numbers are tied together" even if only two have been stated and the third is about to be derived. UA readers count the actual numerals on the page and get confused when the text claims "three". Fix: name the QUANTITIES (`напруга`, `сила струму`, `потужність`) explicitly, not the "numbers". Same trap for "these two values", "these four quantities" — match the pronoun to what's actually visible. |
| Dangling possessive pronoun `свій` with the noun elided (`а в аматорській апаратурі — свій` for EN "every piece of hobby gear earns one too") | Repeat the noun or use dash-elision of the VERB, keeping the noun in both clauses (`а кожен аматорський пристрій — запобіжник на вході`) | EN happily elides the object noun after a possessive ("earns one", "has its own"). UA does NOT tolerate bare `свій` as a standalone predicate — the reader is left asking `свій що?`. The fix in parallel constructions is to elide the VERB (via dash) and keep the noun explicit in the second clause: `X має Y, а A — B` (where A parallels X, B parallels Y). You can also restate the noun with an epithet (`свій власний запобіжник на вході`). Never leave bare `— свій` dangling. |
| Handwavy predicate pronouns `те саме` / `таке саме` / `це все` / `для неї` / `для нього` when the antecedent is even slightly ambiguous (example: `і ще одне рівняння робить те саме для неї` — what "same"? for whom? `неї` competes between `потужність` and `величину`) | Name the verb and the partners explicitly: `і друге рівняння однозначно визначить її через напругу та струм`. Mirror the structure of the parallel clause, but with concrete nouns, not back-references. | EN handily uses "the same", "it", "this" with loose pronoun resolution — readers fill in the antecedent from world knowledge. UA gendered pronouns + predicate pronouns DEMAND that the antecedent be unambiguously the closest matching-gender noun, and any competition breaks the reading. **This is a recurring class of error the user has flagged multiple times** — re-read every translated sentence and mentally substitute the pronoun: if more than one noun of the right gender fits, or if the verb phrase is vague ("робить те саме", "так само діє", "так влаштоване"), rewrite concretely. Say WHAT the equation does, not that it "does the same thing". Name the partners (через що, між чим, з чим), not "для неї". A textbook has to work sentence by sentence without the reader rewinding. |
| Em-dash `—` immediately before a math variable or formula (`У другому — <var>P</var> = <var>V</var> · <var>I</var>`) — reads visually as a unary minus (`−P = V · I`) because the long em-dash + italic P are typographically indistinguishable from a minus sign on a signed quantity | Replace the em-dash with an explicit verb (`У другому з’явилося <var>P</var>…`, `У другому ми отримали <var>P</var>…`) or a colon (`У другому: <var>P</var>…`). Only keep the em-dash if there's clear text between it and the math variable. | This is a visual/typographic landmine unique to UA prose where em-dashes elide verbs — a construction that works for prose nouns (`<strong>Напруга</strong> — тиск.`) but fails when the noun is rendered as KaTeX italic math, because the font change makes the dash+letter read as sign+variable. User has flagged this; the fix is always restructure, never "put a space in front of the em-dash" — the rendering is still ambiguous. Related rule: **in a paragraph that contains any math variables, minimise em-dash usage overall** — 2+ em-dashes visually clutter and slow reading even when none are adjacent to a math var. |
| Bare generic nouns without a qualifying domain noun: `зі значенням, яке…` / `цей рівень вище / нижче`  / `зміна цього параметра` — reader asks "value of WHAT?", "level of WHAT?", "which parameter?" | Always qualify: `зі значенням опору`, `цей рівень напруги`, `зміна цього номіналу`. Name the physical quantity or specification the noun refers to. | Same family as "три числа" and "handwavy pronouns" landmines — EN happily says "values above this threshold" because "values" is generic and the context carries the meaning; UA readers expect the noun to be specific. Without the qualifier, the sentence reads like the translator didn't know what to call the thing. **Rule**: when `значення` / `рівень` / `параметр` / `величина` appears alone in a UA sentence and the reader has to infer what kind, add the qualifier explicitly — resistance, voltage, current, rating, etc. |
| `не менше за X` when `більше за X` carries the meaning clearly | `більше за X` for the "strictly above" reading, or `від X і вище` for the inclusive boundary case | EN "at or above X" translates faithfully to UA `не менше за X`, but in prose contexts where the boundary case (R = R_min exactly, sitting at the edge of the rating) isn't physically desirable anyway, the stricter `більше за` reads more naturally and matches the spoken register. User prefers the crisper form. Keep `не менше за` only when the inclusive boundary is physically the intended claim. |
| Bare comparative adjective directly on a component noun: `менший резистор` / `більший конденсатор` / `менша лампа` — UA parses these as **physical size** first, not "smaller value" | Name the quantity being compared: `резистор з меншим опором` / `резистор зі значенням опору, меншим за X` / `конденсатор з більшою ємністю` / `лампа більшої потужності` | EN "a smaller resistor" is idiomatic for "a resistor of smaller resistance value" because English uses the same word for size and value with context. UA is stricter: `менший резистор` defaults to "physically smaller resistor" (which is active misdirection when a resistor ratings ladder is on the same page — 1⁄16 W SMD is the physically smallest AND the lowest-rated). The reader lands on the wrong mental model. Fix: always attach the comparative to the actual quantity (`опір`, `ємність`, `індуктивність`, `потужність`, `напруга`, `номінал`), not the component. Same rule for `вищий/нижчий` with voltages or `сильніший/слабший` with signals. |
| `<var>X</var> вище` as a textual back-reference to a quantity introduced earlier (`<var>R</var><sub>min</sub> вище — це теоретичний поріг`) | Name the SOURCE of the quantity instead: `Калькулятор дає <var>R</var><sub>min</sub>…` / `Формула вище дає <var>R</var><sub>min</sub>…` / `Обчислене калькулятором значення <var>R</var><sub>min</sub>…` — and then state what it IS. | `вище` as a locative adverb works on textual nouns (`формула вище`, `рисунок вище`, `таблиця вище`) because those things DO sit on a page. For quantities/values, `вище` reads as a value comparison ("higher than what?"). The reader stalls trying to find the comparator. EN "the X above" works because English `above` is freely both locative and comparative; UA requires you to disambiguate by naming the source of the value (widget, formula, earlier calculation) rather than referring to its textual position. |
| `акуратно` for EN "carefully" in engineering / math-calculation context (`застосоване акуратно`, `виконайте розрахунок акуратно`) | `ретельно` (meticulously) / `ретельне застосування` (noun phrase) / `з розумом` (conversational) / `сумлінно` (conscientiously) / `грамотно` (competently) | `акуратно` in UA defaults to "neatly / tidily" — like handwriting kept on the line, or a desk kept orderly. It does NOT carry the "done with due care and thought" sense that EN "carefully" has in engineering context. Reader parses `застосоване акуратно` as "applied tidily" which is meaningless for an equation. Pick a word that actually names the mental attitude: `ретельно` (thoroughly, with attention to detail), `сумлінно` (conscientiously), or restructure as a noun phrase (`ретельне застосування одного з цих рівнянь`). |
| `що робить / що роблять [unit]` as a rhetorical-catchy section title (`Потужність — що роблять вати` for EN "Power — what the watts do") | Use a UA-native rhetorical hook or a descriptive phrase: `куди діваються [unit]` ("where do the [unit]s go" — hint at dissipation/consumption), `для чого потрібні [unit]` ("what are the [unit]s for"), or drop the rhetorical frame entirely and go descriptive: `[quantity] — [unit] і [phenomenon]`. | EN's "what does X do" is a playful rhetorical hook that works because English treats abstract subjects (watts, electrons, signals) as agents. UA doesn't animate units this way — "що роблять вати" reads as a flat question rather than a hook, and native speakers hear the literal translation seams. The native equivalents either anthropomorphise motion in a UA-idiomatic way (`куди діваються` — they go somewhere, dissipate, disappear) or flatten into a noun phrase (`Потужність — ват і тепло`). Same rule for "what the voltage does / what the current does" etc. |
| Service-register verbs (`обслуговує`, `керує`, `обробляє`) attached to an abstract law, formula, or principle (`Закон Ома обслуговує один резистор`) | Use descriptive / epistemic verbs: `описує`, `визначає`, `стосується`, `застосовується до`, `зв'язує` (if the law links quantities), `діє для` (if scope is being stated) | `обслуговує` in UA reads as "services / maintains" (like a technician services an appliance). Applied to a natural law or formula, it creates an agent-role mismatch: laws don't service, technicians do. This is a calque of EN "X handles / serves / covers" which in English is a common idiom for "this rule applies to these cases". UA needs descriptive verbs that name the law's epistemic role (describing, relating, defining) rather than a service role. Same trap for `керує` ("controls") or `обробляє` ("processes") attached to laws. |
| Unneeded scope qualifiers in law statements — `на одному джерелі живлення`, `при одному навантаженні`, `на одному проводі` when the law is actually universal for any such element | Drop the superfluous qualifier or replace with a true scope statement (`для одного резистора` if that's the actual constraint) | EN sometimes pads a rule's applicability with a redundant clause ("Ohm's law handles a single resistor on a single supply") for rhythm. In UA, such an added clause invites the reader to ask "does it fail with two sources? what about AC?" — they look for a reason, find none, and stall. Only keep a scope qualifier that reflects a REAL constraint of the law. Ohm's law works for one resistor regardless of how many sources are in the surrounding circuit; stating "на одному джерелі" is misleading. |
| SVO ambiguity when subject and direct object are both masculine inanimate singular (`Закон Ома описує один резистор` — both `закон` and `резистор` look identical in nom. and acc., verb `описує` takes accusative, so the reader can't tell which is subject) | Pick a verb whose object takes a NON-accusative case — genitive (`стосується одного резистора`, `зводиться до одного резистора`), dative (`відповідає одному резистору`), prepositional + preposition (`діє для одного резистора`, `застосовується до одного резистора`) — OR use instrumental passive (`одним резистором описується закон Ома` is contrived but grammatically unambiguous) OR an overt scope word (`Для одного резистора закон Ома дає…`) | Masculine inanimate nouns in UA have identical nominative and accusative forms; when a transitive verb sits between two of them, the reader genuinely cannot tell who is doing what to whom. EN avoids this via strict word order, UA allows flexible order but requires case marking to disambiguate. In Ch 1.2 this surfaced in `Закон Ома описує один резистор` — the user asked "who is describing whom?". Genitive-taking verbs (`стосується + gen.`, `зводиться до + gen.`) solve it structurally: only one role can fit the case marker, so direction is unambiguous no matter the word order. |
| Asymmetric negation for a conservation / symmetry principle (`Енергія не виникає з нічого` — implies "nor disappears" but doesn't state it, reader asks "а чи зникає?") | Make the negation symmetric (`не виникає і не зникає`) OR rewrite positively to describe the conserved quantity (`заряд повертається у ту саму точку з тією самою енергією`, `кількість руху зберігається`) OR appeal to the named conservation law (`це наслідок збереження енергії`) | UA readers expect conservation statements to state BOTH halves — "energy neither arises nor disappears" — or to be framed positively via what IS conserved. EN can rely on "not created" as a convention for "conserved" in the same way "conservation of energy" is a set phrase, but UA doesn't have that shorthand. Half-statements like `не виникає з нічого` leave the reader hunting for the missing half. Rewrite as: a named law (`закон збереження енергії`), a positive picture (`заряд повертається з тією самою енергією`), or a symmetric pair (`не виникає і не зникає`). Same rule for charge conservation (`заряд не накопичується` is fine because it's a single-sided claim about what DOESN'T happen to ONE specific thing; `заряд не виникає з нічого` would need symmetry). |
| Net-zero conservation claim that hides the actual energy flow (`заряд повертається з тією самою енергією` — sounds like NO energy was spent, contradicting heat dissipation on resistors) | State explicitly that energy is exchanged both WAYS along the loop, and specify WHICH elements take and which give: `заряд віддає енергію на резисторах (вона перетворюється на тепло) і отримує рівно стільки ж від джерела, тож повертається без сумарної зміни` | Physically accurate UA that also dodges a contradiction in the reader's head. KVL is a NET statement ("sum of rises and drops = 0"), not a statement that no energy is transferred. If the UA translation says "returns with the same energy" without acknowledging the lost-and-replenished cycle, attentive readers spot the gap ("but the resistor heated up — where did THAT energy come from?") and lose trust. Same caution applies for any net-zero formulation: always name the positive and negative contributions before summing to zero. |
| Imperfective passive participles as adjectives (`марнована енергія`, `рахована годинами` and similar `-ован-ий/ана/ане` from imperfective verbs) | Use the PERFECTIVE form: `змарнована`, `порахована` etc. | UA passive participles are canonically formed from perfective verbs. Imperfective bases yield forms that sound incomplete or non-standard to native ears (some textbooks even flag them as ungrammatical). The user's specific catch: `марнована енергія` — there's no neat imperfective passive-participle slot in UA for `марнувати`; use `змарнована` (from perfective `змарнувати`). Same pattern: `рахований` → `порахований`, `робочий` (from `робити`, imperf.) as a passive reading → `зроблений` (perf.). When in doubt, check: does the verb have a perfective pair with `з-`, `по-`, `за-`, `с-` prefix? Use the prefixed form's participle. |
| `пахнути` for unpleasant / burning / alarm-smells (`резистор починає пахнути`) | `з'являється запах гарі` / `відчувається запах горілого` / `смердить горілим` / `чути запах гарі` | `пахнути` in UA defaults to *pleasant* smell — flowers, coffee, bread. A burning resistor does NOT pleasantly smell; using `пахнути` for the alarm-smell of hot electronics creates a register mismatch that sounds absurd to a native speaker (as if the component had a nice aroma). Switch to a noun-construction naming the burnt/scorched smell (`запах гарі`, `запах горілого`) or the pejorative verb `смердіти`. For electronics-specific alarms the idiomatic UA is `з'являється запах гарі` — compact and widely recognised. |
| Intensifier + adverb word order reversed (`швидко дуже нагрівається` for EN "very fast") | Intensifier first: `дуже швидко нагрівається` | EN tolerates both "very fast" and "fast very" in rare contexts; UA canonically puts the intensifier BEFORE the adverb it modifies. `дуже швидко` (very fast), `дуже сильно` (very strongly), `зовсім близько` (very close). Reversing the order reads as broken UA even when individually both words are right. Same rule for `надто`, `занадто`, `сильно`, `трохи` as intensifiers. |
| `чиста пряма` (for "clean line") | `рівна пряма` | `чиста` collocates with dirt/cleanliness; `рівна` is the geometric evenness UA wants. |
| `відчули, що X = Y` (for abstract logical equivalence) | `переконалися, що X = Y` | EN "you experienced that" works abstractly; UA `відчули` is thin for an intellectual realisation. |
| `сприймається повніше` (for "lands more fully") | `набуває повного сенсу` / `стає зрозумілішим` | `сприйматися повно` isn't a native collocation. |
| `подобаються більші числа` (tone match for "love bigger numbers") | `обожнюють більші числа` | Match the knowing tone of EN "manufacturers love". `подобаються` is too neutral. |
| `миттєво розпізнавати` (for "pattern-match at a glance") | `впізнавати з першого погляду` | `з першого погляду` is the established UA idiom for "at a glance". |
| `1 міліват` (as word, inconsistently with `мВт` elsewhere) | `1 мВт` | When the same chapter uses the symbol `мВт` in prose, don't introduce the full word form — pick one and stick. |
| HF ham-radio band rendering | `КХ` (короткі хвилі) — NOT `ВЧ` | For the 3–30 MHz ham-radio band specifically, UA ham-radio register uses `КХ` (short waves). `ВЧ` in UA is ambiguous — it either means "high frequency" in a broad scientific sense OR the HF band. In HAM contexts, always use `КХ`. General "RF" contexts (RF filters, RF chokes, RF signals) can remain `ВЧ` or `РЧ`. |
| `10·log / 20·log` unspaced (inside prose) | `10 · log / 20 · log` spaced | Consistency with formal math typesetting; matches `dbm.detail` and Ch 0.3 formula conventions. |
| Bare Latin letter in UA prose as symbol / ref designator (`Позначається R.`, `Коло з літерою V`, `R = 4 Ом` outside a formula) | Wrap with `<var>…</var>`: `Позначається <var>R</var>.`, `літерою <var>V</var>`, `<var>R</var> = 4 Ом` | KaTeX math serif marks it as a symbol; bare Latin in sans-serif reads as an English-letter intrusion in Cyrillic prose. Applies to math vars (I/V/R/E/Q/f/t) AND schematic reference designators (R/C/L/D/Q). Needs matching `<Trans>` + `var: <MathVar />` mapping in the chapter JSX; if the description field currently renders via plain `t(...)`, convert it first. |
| `Коло з літерою X` (describing the voltmeter/ammeter circle symbol) | `Кружок з літерою <var>X</var>` | In an electronics chapter, `коло` = circuit — reader parses "коло з літерою V всередині" as "a circuit with V inside". Use `кружок` for the geometric circle shape; reserve `коло` for circuits. |
| `перевірте прохідність` (for continuity test) | `перевірте неперервність кола` / `перевірте прозвонкою` | `прохідність` in UA colloquially = airway patency (medical). For electrical continuity use `неперервність кола` (formal) or `прозвонка` (ham slang). |
| `фізичний ґрунт` (for electrical earth) | `земля` / `заземлення` | `ґрунт` = soil (agricultural). Electrical earth = `земля`. |
| `база 0 В` (for reference point) | `точка відліку 0 В` | `база` is reserved for transistor base (BJT); using it for "reference" clashes with the immediate context of a schematics chapter. |
| `видавати напругу` (for battery voltage output) | `давати напругу` / `мати напругу` / `напруга на батарейці становить X` | `видавати` colloquially = issue/hand out. Batteries `дають` voltage or `мають` it. |
| `контракт` (for author-reader metaphor) | `угода` / `договір` | `контракт` reads as business/legal document in UA; use the more generic `угода`. |
| `стовпчик` (for breadboard column — if Ch 0.2 uses `стовпець`) | `стовпець` | Align across chapters — pick one form and stick. Ch 0.2 uses `стовпець`. |
| `на перехресті` (for wire crossing) | `на перетині` | Parallel with the verb `перетинаються` used in adjacent rules; `перехрестя` has road-junction connotation. |
| `перевели X в Y` / `переклали X на Y` (for "translated X into Y" metaphor) | `зібрали Y за X` / `втілили X у Y` / `отримали Y зі X` | EN "translated" is a dead metaphor from code / communication theory. UA `перевести/перекласти` is literal (transfer/translate language); the metaphor doesn't carry over. For schematic → circuit specifically: `зібрали робоче коло за схемою`. |
| `завершується збиранням того, що було прочитано` (passive + nominalisation chain) | `завершується її складанням` / `закінчується тим, що збираєте прочитане` | Passive `було прочитано` + `збиранням того, що` stacks three noun phrases. UA is more verbal — use pronoun referencing or a plain `тим, що`-clause. |
| Categorical "every X does Y" from EN, where reality is "most X" or "X with Z" | Soften with `зі схемою`, `якщо є схема`, `більшість`, etc. | EN happily writes "every lab begins with …" as a rhetorical frame. When that's factually not true (some labs in the project don't have schematics), UA readers pattern-match on the "every" and notice the gap. Translator should add the restrictive clause. |
| `Схема — це контракт` / `Схема — це угода` (for "schematic is the contract") | **Domain-specific metaphor recall**: `формальна мова спілкування автора з читачем` / `спільний код автора і читача` | Generic UA words for "contract" (контракт=legal, угода=generic, домовленість=interpersonal — all technically possible) read as flat metaphors. Stronger: callback to a metaphor introduced earlier in the same chapter (`схема — це код`, `схема — це формальна мова`). Creates cohesion and avoids the "business document" connotation. |
| `при + verbal noun` (Russianism): «при проходженні струму», «при прикладенні напруги», «при переведенні метрів», «при натисканні PTT», «при збереженні частоти» | `коли + verb` / `під час + verbal noun` / `за + instrumental` / adverbial participle | EN "when X-ing" / "under X-ing" renders in UA as one of several native forms — NOT `при + nominalisation` which is Russian. Standard physics/scientific collocations are OK (`при кімнатній температурі`, `при умові`, `при тому/цьому`). Everything else should be rewritten. Linter rule `forbidden.pry-verbal-noun` catches the most common forms (-анні/-енні/-інні/-онні/-янні). |
| `струмообмежуючого резистора` (double landmine) | `обмежувального резистора` | Stacked error: verbose `струмо-` prefix (project prefers `обмежувальний`) AND `-уючий` Russianism participle. Linter rule `forbidden.strumobmezuvalnyi` now catches both `-вальн-` and `-юч-` forms. |
| `позитивна/негативна` (as polarity noun in formal / glossary register) | `додатна/від'ємна` (formal scientific) | Both understood; `додатний/від'ємний` reads as canonical scientific register in UA glossary/formal contexts. `плюсовий/мінусовий` is colloquial/practical. `позитивний/негативний` leans toward anglicism influence. For glossary definitions, use `додатний/від'ємний`. |
| `ДЦХ` (non-standard UA abbreviation, observed in ch0_2, chapterSubtitles, glossary) | `ДМХ` (дециметрові хвилі) or `УВЧ` | UHF band = ДМХ / УВЧ in standard UA. `ДЦХ` is a typo/invention that crept in and compounded across entries. Always standardise. |
| `ДВЧ (300 МГц – 3 ГГц)` (UHF band) | `ДМХ (UHF, 300 МГц – 3 ГГц)` or `УВЧ` | `ДВЧ` literally = "very high frequencies" = VHF (30–300 MHz). Using it for UHF (300 MHz – 3 GHz) is a direct terminology swap. Cross-check every band reference: ВЧ/КХ = HF, ДВЧ/УКХ = VHF, ДМХ/УВЧ = UHF. |
| Physics-value error: `Для діапазону 20 метрів (14 МГц) це приблизно 5 м загальної довжини дроту` | `≈ 10 м загальної довжини (по ~5 м на кожне плече)` | Dipole total length = 2 × λ/4. Translator saw "each leg ~5 m" in one entry and reused for "total length" in another — plausible EN→UA slip that should NOT pass technical review. Always run the arithmetic in the glossary, not just the prose. |
| Open-source **hardware** rendered as "open-source code" | `з відкритою апаратною специфікацією` / `з відкритою схемотехнікою` | Arduino is open-source HARDWARE; `плата з відкритим кодом` is semantically wrong (a board isn't code). Distinguish EN "open-source" (applies to code OR hardware OR docs) from UA `відкритий код` (applies only to software). |
| Meter "applies voltage 0.5–0.7 V" to diode | Restructure: "Meter applies voltage sufficient to forward-bias (typically 2–3 V open-circuit), displays the forward drop (~0.6 V Si)" | EN "applies a small voltage (typically 0.5–0.7 V)" conflates source voltage with displayed reading. The meter's open-circuit is much higher than the eventual Vf drop. Technical reviewer must verify every quantitative claim. |
| Modulation-abbreviation mixed scripts (`АМ, SSB, ЧМ` / `CW, SSB, ЧМ`) | Keep ALL modulation acronyms Latin per glossary: `AM, SSB, FM` / `CW, SSB, FM` | Ch subtitles sometimes Cyrillicize AM/FM (Soviet-era textbook register) while leaving CW/SSB/DX Latin. Glossary locks: `QSO, CW, SSB, AM, FM, DX → keep Latin uppercase`. Never mix scripts in one modulation list. |
| Band abbreviations mixed (`КХ-стрибок, VHF/UHF`) | All Cyrillic when any is Cyrillic: `КХ-стрибок, УКХ/ДМХ` | Same inconsistency trap. Pick one script system per context. |
| `сайт` as project self-reference (guidedTour, welcome) | `курс` | Brand identity rule: project self-reference is always `курс`, never `сайт`/`книга`/`посібник`. Linter rule `forbidden.sajt-self-ref` enforces. Also posibник — EN "handbook" must become `курс` in UA self-reference. |
| `посібник` for project self-reference | `курс` | Same rule — `hero.keepLearning` had «до кінця цього посібника»; must be `курсу`. |
| `vs` (Latin) in UK prose / subtitle | `проти` / em-dash `—` / `чи` | Latin `vs` never belongs in UA prose. Observed in chapterTitles.2-3 and chapterSubtitles.1-7. |
| `ви у правильному місці` (calque "you're in the right place") | `ви потрапили за адресою` / `вам сюди` | EN idiom → UA native idiom. |
| `навіть близько` (calque "not even close") | `зовсім` / `жодної` | UA doesn't use `близько` this way as intensifier. |
| `торкатися формул` (calque "touch a formula") | `переходити до формул` | `торкатися` is physical touch; abstract sense doesn't carry in UA. |
| `погратися з числами` (calque, too childlike) | `поекспериментувати з числами` / `попідставляти власні числа` | Register match — readers aren't kids playing with blocks. |
| `отримати повний навчальний досвід` (HR-speak calque) | `пройти курс повноцінно` / `засвоїти весь матеріал` | `навчальний досвід` is bureaucratic/HR; UA hobbyist learning doesn't frame it as "experience". |
| `здача тесту` (calque "take a test") | `скласти тест` / `скласти іспит` | `здача` for test-taking is Russianism; UA verb is `скласти`. |
| `перекладено вашою мовою` (instrumental: "translated BY your language") | `перекладено на вашу мову` | Russianism case collocation — UA uses `на + accusative`. |
| `Зворотний зв'язок` as UI label "Contact / Get in touch" | `Напишіть нам` | `Зворотний зв'язок` is bureaucratic calque for "feedback loop"; warmer UI: direct imperative. |
| `Перевірка` (for EN "Check recall") | `Закріплення` / `Перевірка знань` | Loses `recall` nuance entirely; pedagogy suffers in a 2-word sub-label. |
| `робота` (generic) for ham on-air operating | `робота в ефірі` | Context-disambiguating. `робота` = work/labour in general; ham readers miss the on-air-procedures sense. |
| `розділи вище` / `наступний розділ` / `у попередньому розділі` when `розділ`=chapter in the app (ambiguous — chapters OR sub-chapter sections?) | For same-chapter back-references: `вище`, `далі в цьому розділі`, `побачимо нижче`, `раніше в цьому розділі`, `у попередньому підрозділі`. For cross-chapter references: use the explicit chapter number (`у розділі 1.4`, `Chapter 1.7`). | **Systemic overload.** The project's UI calls top-level units «Розділ 1.3», «Розділ 1.4» — so when the UA prose says «в наступному розділі», the reader parses it as «in the next Chapter (= Chapter 1.4: Resistors in Practice)» rather than «in the next section of THIS chapter». User-flagged on ch1.3 `sourcesWhy` where «в наступному розділі» meant the next sub-section, not Chapter 1.4. **Rule**: never write bare «наступний/попередній розділ» in UK prose — always either (a) say `далі/раніше в цьому розділі` for same-chapter, or (b) name the explicit chapter number for cross-chapter. EN tolerates «next section» because English distinguishes section/chapter; UA does not. |
| `куди зникають X` (calque "where X disappear to") | `на що перетворюються X` | EN idiom is "become / end up as" (energy transformation); UA `куди зникають` = "where TO they vanish" reverses the meaning. |
| `X, такі як Y` (for "X such as Y") | `X на кшталт Y` / `X як-от Y` | `такі як` is accepted but anglicism-leaning; `на кшталт`/`як-от` is more native in expository prose. |
| `Вважайте це X` (calque "Think of this as X", stiff register) | `Уявіть це як X` | `Вважати + instrumental` is correct but formal; `Уявіть як` is conversational-register match for EN "think of as". |
| **Polarity of POLES/TERMINALS — always `позитивний/негативний`** | `позитивний вивід / полюс / клема / термінал` / `негативний вивід` (NEVER `додатний/від'ємний вивід` — applies to battery terminals, capacitor leads, power-supply rails, plug tips, anything spoken of as a "pole") | **User-flagged on ch1.5 (stricter refinement of the earlier ion-polarity rule).** Previously this row said "Battery terminals / circuit polarity: either form OK". The user has clarified: for **poles / terminals / leads** in any physical-polarity context, UA must use `позитивний / негативний`, never `додатний / від'ємний`. The latter is reserved for **scalar/math contexts**: `додатне число`, `від'ємне значення`, `додатна півхвиля синусоїди`, `√ від'ємного числа` — all fine. The tell for the wrong use: `додатний` followed by a noun that names a physical terminal / lead / plate / wire / pin (`вивід`, `полюс`, `клема`, `обкладка`, `електрод`, `анод`, `катод`, `провід`). Same rule for ions (per the earlier row). Mechanically enforceable: look for `(додатн|від['’]ємн)\S*\s+(вивід|полюс|клем|обкладк|електрод|терміналь|заряд\S*\s+на\s+пласт\S*|прово)` — catches capacitor leads, battery terminals, electrode labels. |
| `Опір — те, з якою силою/як/наскільки X` (verbless predicate, subordinate clause as predicate) | `Опір — **міра того**, з якою силою/як/наскільки X` | Classic EN-to-UA calque. EN tolerates "Resistance is how hard X pushes back"; UA needs a noun head. Add `міра` / `показник` / `ступінь того`. |
| `Поверніть мультиметр у режим X` (for "set back to mode X") | `Перемкніть мультиметр у режим X` | `Поверніть` = physically return/turn; for switching modes UA says `перемкніть`. Consistency across all labSteps. |
| `штовхає` (transitive verb without object) | `штовхає Y` (add an object) OR restructure | EN "Voltage pushes." works as rhetorical fragment; UA `штовхати` is transitive and requires an object. |
| `Приблизно X` at sentence start when parallel sibling has `Близько X` | `Близько X` (match the parallel) | When quiz options / sibling sentences use `Близько` for approximation before a quantity, don't break parallelism with `Приблизно`. |
| `(overload, перевантаження)` — English stem inside UA gloss | `(перевантаження)` or `(від overload — перевантаження)` | Don't leave bare English word when you already provided the UA translation in the same parenthetical. |
| `амперів тече` / `вольтів стоїть` (units flowing/standing) | `тече струм у X амперів` / `напруга становить X вольтів` | Units don't flow — current flows (measured in amperes), voltage exists (measured in volts). EN idiom "a wire carrying 5 amps" is shorthand; UA technical register wants the quantity as subject. |
| `часточка кулона` (for "fraction of a coulomb") | `частка кулона` / `мала частка кулона` | `часточка` = particle (diminutive of particle), NOT fraction. For "fraction" use `частка` / `частина`. |
| `результуючий/дрейфуючий` (adjectival `-ючий` participle as technical term) | `сумарний/підсумковий/вислідний` / `що дрейфує` | Soft Russianism — widely used in modern UA technical writing but strict purists flag. Alternatives are native-purist options; `результуючий` may stay if consistent with project corpus. |
| `швидкість` as rate-of-flow near drift-speed context | `інтенсивність` / `кількість за одиницю часу` | `швидкість` defaults to kinematic speed (mm/s) in UA. When a sentence says "current is the speed at which charge flows" RIGHT BEFORE "drift speed is 0.1 mm/s", the reader conflates. Avoid `швидкість` for rate in early physics chapters. |
| **`<var>X</var>` wrapping — only works in `<Trans>`-rendered contexts** | — | Technical constraint: `<var>` needs `<Trans i18nKey="..." components={{ var: <MathVar /> }} />` to render via KaTeX. If the chapter code renders the string via plain `t(...)` (e.g. `caption={t(...)}` on Circuit, `widget.hint` as plain children, Quiz's `explanation: string` field), `<var>` will display literally. Before adding `<var>` to an i18n key, verify the render path accepts ReactNode OR convert `t(...)` → `<Trans>`. Keys with string-only rendering: Circuit `caption`, Quiz `explanation`, widget `hint` in many widgets. Keys that already accept ReactNode: LabActivity `expectedResult`, LabActivity step `text`. |
| `вода летить стрімко` | `вода тече стрімко` | Water flows, doesn't fly |
| `електрони пролітають повз точку` | `електрони проходять повз точку` | At drift-velocity speeds, electrons don't fly |
| `струмінь, що виливається` | `струмінь з труби` / `струмінь, що ллється` | `виливатися` = spill/leak (problem), not designed flow |
| `вода котиться за інерцією` | `вода тече / продовжує текти за інерцією` | Water doesn't roll in UA idiom — it `тече` / `ллється` / `рухається`. Similar to `вода летить` landmine; add any physical-motion verb that's not native for water (`повзе`, `скотиться`, etc.). Linter rule `forbidden.voda-letit` now catches this family. |
| Two EN time clauses collapsed into one UA clause | Preserve both trigger-events explicitly | **Meta-pattern.** When EN has `X when A, and Y when B` (two distinct temporal triggers), UA translators often drop one prepositional phrase and attach both predicates to a single `коли …`. Result: wrong cause-and-effect. Example from Ch 1.1 `waterBreaks`: EN `it drags when it starts and coasts when you close the valve` became UA `рушає з місця і котиться за інерцією, коли ви перекриваєте клапан` — tied BOTH events to closing the valve (physically wrong: water drags when you OPEN the valve, coasts when you CLOSE it). Fluency-critic rule: **re-read every sentence with two temporal clauses and verify each one still has its own trigger**. |
| `ворушаться електрони` | `рухаються електрони` | `ворушитися` is too colloquial for physics |
| `втомлена батарейка` | `розряджена батарейка` | "Tired battery" is an English idiom |
| `шматочок опору навмисної величини` | `елемент із точно заданим опором` | "A piece of resistance" is English wordplay; in UA it's nonsense — resistance is a quantity |
| `вибір, навмисна величина` — noun + abstract English wordplay | Rephrase to describe the function directly | |
| `сиділа в кожній схемі` | `укорінилася в кожній схемі` | `сидіти` is too colloquial |
| `іменні пам'ятки` (for "namesakes") | `вчених` (with implicit "named after") | `пам'ятка` = monument/memorial |
| `Точніше, …` as sentence-opener refining earlier claim | Often redundant — just start the sentence | |
| `Проміжний випадок, і — що головне — …` (fragmented) | Restructure as proper subject + verb | Fragmented calque |
| `у N раза` / `у N разу` — multiplier form with `раза` (gen. sg.) or `разу` (any case sg.) | `у N рази` (nom. pl. `рази`) for factors 2/3/4 / non-integer factors near them; `у N разів` (gen. pl.) for 5+ | **Hard Russianism.** Russian uses `в 2 раза` / `в 3 раза` (gen. sg. after 2/3/4); Ukrainian uses `у 2 рази` / `у 3 рази` / `у √2 рази` (nominative plural `рази`, as in «два рази», «три рази»). For cardinals 5 and above, Ukrainian switches to the genitive plural `разів` (`у 5 разів`). The singular forms `раза` / `разу` never appear as multiplier forms in standard Ukrainian — they are Russian imports that slip past because they LOOK like a genitive. User-flagged on ch1.3 (`у √2 раза більший` → `у √2 рази більший`). Linter rule `forbidden.raza-multiplier` catches `(у|в) \\S+ раза\\b` and `(у|в) \\S+ разу\\b`. |
| `були одним числом` / `кожна величина — одне число` (literal rendering of EN "a single number" as an abstract framing for time-invariance) | `були сталою в часі величиною` / `були незмінною сталою величиною` / `мали стале значення, що не залежало від часу` | **Framing calque.** EN "until now every X has been a single number" works as a rhetorical hook because English tolerates abstract scalar framing without explanation — the reader fills in "scalar, not a function of time". UA reader parses `були одним числом` literally: "were a single number — as opposed to two? three?" The abstraction doesn't carry. Fix by naming what the English framing was really about: **time-invariance** — the quantity didn't change as time passed. Use `сталою величиною` (physics standard for "constant quantity") or expand explicitly: `не залежали від часу`, `не змінювались, поки ми їх вимірювали`. User-flagged on ch1.3 intro. |
| **Playground/childish verbs for PLACING/INSTALLING components** (extended ch1.5 pushback) — `покладіть між ними ізолятор`, `поставте резистор послідовно`, `поставте обкладки одна до одної`, `залиште один кінець висіти`, `покладіть конденсатор на плату` | `розмістіть між ними ізолятор` / `помістіть між ними ізолятор`; `увімкніть резистор послідовно` / `підʼєднайте резистор послідовно`; `розмістіть обкладки паралельно, одну навпроти одної`; `нехай один кінець залишається вільним` / `один кінець лишається неприєднаним`; `установіть конденсатор на плату` | **User-flagged repeatedly on ch1.5.** Placing / connecting / mounting a component in Ukrainian lab prose does NOT use the bare kitchen/playground verbs `покласти`, `поставити`. Nor can a wire end «висіти». The technical register for each action: **placement** → `розмістити / помістити / установити`; **series/parallel connection** → `увімкнути послідовно/паралельно` / `підʼєднати`; **loose / unconnected wire** → `залишатися вільним` / `лишатися неприєднаним`. The EN verb "put" / "place" / "set" / "leave hanging" maps to DIFFERENT UA verbs depending on whether the action is mounting, wiring, or leaving disconnected — do NOT use `покласти` or `поставити` as defaults just because they translate literally. Linter rules: `forbidden.playground-placement`, `forbidden.postavte-component`, `forbidden.visity-wire` (all WARN as of ch1.5). |
| **Playground/childish verbs on physical quantities** — `напруга гойдається`, `струм танцює`, `сигнал стрибає`, `електрони бігають`, `електрони ворушаться`, `крива скаче`, `синусоїда гойдається вгору-вниз` | `напруга коливається` / `періодично змінюється`; `сигнал зростає до піка` / `відхиляється від нульової лінії`; `симетрично коливається відносно нуля`; `періодично змінює напрямок` | **User-flagged as a CLASS on ch1.3.** EN verbs like "swing / oscillate / bob / sway / dance / jump / run" are used in English physics prose for rhythm and readability; mapped 1:1 to UA they collapse the register to a children's-book voice. A university physics textbook voice uses formal verbs: `коливатися`, `періодично змінюватися`, `зростати / спадати`, `відхилятися`, `набувати значення`, `проходити через нуль`. **Rule of thumb**: if the UA verb could describe a child on a swing, a dog running, or dancers on a stage — reject it for a physical-quantity subject. Linter rule `forbidden.playground-verbs` catches the common offenders. |
| **Colloquial / register-downgrading verbs for measurement** — `міряти`, `поміряти`, `Поміряйте`, `міряє`, `щупати`, `щупаєте` | Formal: `вимірювати`, `виміряти`, `Виміряйте`, `вимірює`; for the action of touching probes to a node: `торкатися щупами`, `торкніться щупами` | **User-flagged on ch1.3 and extended to ch1.1 / 1.2 voice.** The verb pair `міряти` (impf.) / `поміряти` (pf.) exists in Ukrainian but carries conversational register — what a parent says to a child, not what an instrument manual says. The formal register for lab/physics uses `вимірювати` (impf.) / `виміряти` (pf.) — this is the register ch1.1 and ch1.2 already established. `щупати` as a verb means to feel something tactilely (like checking a bruise); it does NOT mean "take a reading with a multimeter probe". Use either the noun phrase `торкатися щупами` (for the physical act) or `вимірювати` (for the measurement). Linter rule `forbidden.miryaty-measure` + `forbidden.shchupaty-measure`. |
| **Anthropomorphic / emotional descriptors on physical quantities** — `спокійна напруга`, `втомлений сигнал`, `поводяться режими`, `електроніка спокійна`, `сигнал любить / хоче`, `показання стрибають`, `приймач забирає AC` | Descriptive physics verbs: `стала / незмінна напруга`, `режими показують / працюють`, `сигнал досягає / проходить`, `показання хаотично змінюються`, `приймач отримує AC з антени` | **User-flagged on ch1.3.** EN allows subtle personification ("the signal settles down", "the meter behaves", "real electronics rarely holds still") — UA readers parse these literally and the register jars. Two specific sub-patterns to watch: (a) **emotion/state adjectives** on quantities (`спокійна`, `втомлена`, `нервова`); (b) **volition verbs** on quantities (`хоче`, `любить`, `надає перевагу`, `поводиться`). Use descriptive/epistemic verbs instead. Linter rule `forbidden.personify-quantity` covers the specific «спокійна» case; broader audits need the dedicated `critiques/register.md` agent. |
| **Colloquial approximators** — `щось близько 2,5 В`, `десь на 64 %`, `приблизно десь`, `якось так`, `приблизно близько` | Concrete: `приблизно 2,5 В`, `близько 64 %`, `~2,5 В`, `у межах 64 %` | **User-flagged on ch1.3.** EN often uses loose "somewhere around" for approximations; UA technical writing uses one precise approximator per instance: `приблизно` (≈), `близько` (∼), or the math symbol `~`/`≈`. Stacking two (`щось близько`, `приблизно десь`, `близько приблизно`) breaks register. |
| **`слід`** as the line on an oscilloscope screen or a plotted curve (EN «trace») | `крива` / `графік` / `синусоїда` / `прямокутний сигнал` — name either the curve generically or the specific waveform | **Wrong word for the concept.** EN «trace» is an established oscilloscope-engineering term for the line drawn by the electron beam; UA «слід» means «footprint / track / trail» and does NOT carry this meaning. A native reader parses «слід розтягується» as «a footprint is stretching» — reads as bizarre nonsense. User-flagged on ch1.3 `sineWaveExplorerIntro`. |
| **«Межа»** for an abstract conceptual distinction (EN `the boundary between them` / `line between X and Y`) | `різниця між ними` / `відмінність між ними` / `чим вони відрізняються` / `як саме вони відрізняються` | **Wrong word for the concept.** `межа` in UA is a physical boundary — a line between territories, a state frontier, a jurisdictional border. Applied to two abstract types (DC and AC, two operating modes, two signal families), it creates a vivid but wrong mental image (as if one could draw a line on the floor where DC stops and AC begins). EN `boundary` works abstractly in physics pedagogy; UA `межа` does not. **Class**: wrong word for the concept — grammatically fine, not a known calque, not childish register, just lexically off. User-flagged on ch1.3 `sourcesBridge` after 6 critics + native-reader audit all missed it. |
| **Using a technical term before the chapter defines it** (in UK prose — `чисту синусоїду` in introPreview, before the `sine wave — what it is` section) | In intro/preview prose, describe the concept generically (`найпростіша форма змінного сигналу`, `плавна повторювана хвиля`) OR signal that it will be introduced (`синусоїда (з якою познайомимося в §X)`). Only use the term freely AFTER the section that defines it. | **Systemic user complaint.** Radiopedia's pedagogical philosophy: every concept / symbol / term is defined before it is used. A lead paragraph that says «describe any pure sine wave» gives the reader a term (and an adjective, `чиста`, which has its own technical meaning) for a concept they haven't met yet. Fix by rephrasing the intro descriptively — the section below will introduce the term properly. Also applies to: RMS, амплітуда, період, фаза, розмах, коефіцієнт форми, пульсації, коефіцієнт заповнення — each should appear first inside its defining section, not earlier. Cross-reference CLAUDE.md `feedback_first_mention_explicitness.md`. |
| **Rhetorical capstone metaphors** — `Не вистачало вісі часу; цей розділ її повертає` / `Бракувало X — ось він` / `ця деталь, якої не було, з'являється` (calque of EN "X is what was missing; now we add it" / "X that was missing") | Name what literally happens: `Усе це — функції часу. Цей розділ уводить час як повноправну змінну.` / `У попередніх розділах часу як змінної не було — у цьому він з'являється.` / `Цей розділ додає N в наші розрахунки.` | **User-flagged on ch1.3 intro.** EN rhetorical closers that personify a missing concept (the chapter "puts it back", the axis "was missing", the variable "returns") don't carry in UA — the reader asks «кому не вистачало? звідки повертає?» and the abstraction breaks. Rewrite literally: name what was absent (time as a variable), name what the chapter does (adds / introduces it). No metaphor. Same class as the `одним числом` landmine — EN tolerates abstract narrative framings that UA technical prose does not. |

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

## 11. Stating a physical law — keep it short, don't bury it under a derivation

❌ **`KVL — у контурі сума напруг = 0. Заряд віддає енергію на резисторах (це тепло) і отримує рівно стільки ж від джерела живлення, тож повертається до початкової точки без сумарної зміни енергії.`** (розгорнута енергетична деривація замість твердження про напруги)
❌ **`KVL — у контурі сума напруг = 0. Скільки напруги джерело живлення піднімає, стільки пасивні елементи в цьому контурі її разом і спускають.`** (конструкція `Скільки X, стільки Y` звучить як калька з EN `whatever X, that much Y`; а `піднімає / спускає` для напруги — буквалізм)
✅ **`KVL — у контурі сума напруг = 0. Підйом напруги, який створює джерело живлення, компенсується усіма спадами напруги на інших елементах контуру.`**

Why: The law is a statement about **voltages**. The energy-conservation derivation is how the law is *justified*, not what the law *says*. KCL in the same callout got one crisp consequence sentence (`Заряд не накопичується в точці.`) — KVL deserves the same treatment, in the same grammatical shape. The reader at this moment wants the *rule*, not the proof.

**The broader pattern:** when stating a named law, theorem, or definition:
1. State the law in one sentence, using the vocabulary the law is actually about (KVL ↔ voltage, KCL ↔ current, Ohm ↔ V/I/R, power ↔ V·I).
2. Add at most ONE consequence sentence in the same vocabulary.
3. Do NOT chain-translate "here's a one-sentence derivation of why this is true" — that belongs in a proof/derivation section, not in the law statement.

Also: the pedagogically tempting energy framing (charge moves round a loop and comes back with the same energy) invites the follow-up *"but doesn't the charge LOSE energy to the resistor heat?"* — which the user has now flagged twice. The loss IS real; the reason net-zero holds is that the source replenishes it. Every time you describe a conservation law, ask: *does my sentence accidentally imply there's no loss anywhere?* If yes, rewrite — or just drop the energy framing and state the law in its native vocabulary.

---

## 12. `заглянемо в X` / `зазирнемо в X` for abstract concepts — lobotomic calque from EN "peek at X"

❌ **`наприкінці заглянемо в ефективність`** (translating EN "end with a peek at efficiency")
❌ **`заглянемо в калібрування осцилографа`** / **`зазирнемо в принцип роботи фільтра`**
✅ **`наприкінці коротко торкнемось ефективності`** (genitive-taking `торкнутися`)
✅ **`наприкінці розглянемо ефективність`** (parallel to other action verbs: побудуємо / розрахуємо / визначимо / розглянемо)
✅ **`завершимо темою ефективності`**
✅ **`познайомимося з ефективністю`** (instrumental)

Why:
- In Ukrainian, you physically `заглядаєте / зазираєте` **в приміщення / у вікно / у шафу** — a concrete container with a visible interior. Abstract concepts (efficiency, calibration, a principle) have no "inside" to peek into, so the preposition `в / у` + accusative-of-abstract-noun reads as a mechanical word-for-word translation of EN "peek at / look into".
- The EN "peek at" also conveys a **brief / cursory preview** — don't lose that nuance. Use `коротко торкнутися`, `кинути погляд на` (literal but metaphorically established), `коротко ознайомимося`, or simply `розглянемо` if the preview-nuance isn't load-bearing.
- Watch the case: `торкнутися` takes genitive (`торкнутися ефективності`), `розглянути` takes accusative (`розглянемо ефективність`), `познайомитися` takes instrumental (`познайомимося з ефективністю`). If the sentence continues with a dash-introduced apposition (`— те єдине число…` → `— того єдиного числа…`), remember to align the case of the appositive noun phrase too.
- The broader family — **avoid physical-space metaphors for abstractions unless Ukrainian has already established them**. `заглянути в майбутнє` works (established idiom). `заглянути в ефективність / у калібрування / у принцип` does not.

---

## 13. Word-order & sentence-structure calques (ch1.4 pushback cluster)

A recurring class of feedback across ch1.1–1.4 has been: the translation is grammatically correct AND passes the mechanical linter AND uses the right terminology — but the sentence is structured like English. Re-reading aloud reveals it. These fixes were applied during ch1.4 review; every one is a pattern that repeats across chapters.

### 13.1. Pronoun-elision calque: EN "one/ones" as a bare adjective

❌ **`перетворює будь-яке фіксоване джерело на менше`** (EN: "turns any fixed supply into a smaller one")
✅ **`отримує меншу напругу з будь-якого фіксованого джерела`**

Why: EN "one" is a pronoun standing in for "supply". UA doesn't elide the noun after an adjective — the bare «менше» grammatically attaches to the nearest neuter noun («джерело»), and now the sentence literally says "turns a supply into a smaller supply", which is both physically wrong (a divider doesn't shrink the supply, it produces a smaller output voltage) and linguistically unnatural.

**Rule**: whenever EN has "a smaller/larger/different ONE", ask what noun "one" is standing in for, and restate that noun explicitly in UA. Never leave a bare adjective as a predicate in UA where EN had "one" as a pronoun.

### 13.2. Comparative adjective attached to the wrong noun

❌ **`Конденсатори зазвичай гірші за резистори`** (EN: "Capacitors are normally worse than resistors" — in a tolerance paragraph)
✅ **`У конденсаторів допуск зазвичай ширший, ніж у резисторів`**

Why: EN idiomatic "X is worse than Y" relies on context to specify what's being compared. UA readers take the adjective literally: «гірші конденсатори» reads as "bad components", which is nonsense. Same family as landmine 149 («менший резистор» → «резистор з меншим опором»).

**Rule**: name the quality being compared («допуск», «опір», «ємність», «точність», «стабільність»), attach the comparative to it, not to the component noun. Prefer concrete descriptors over abstract value judgments: «ширший допуск» beats «гірший допуск» because it says WHAT is wider.

### 13.3. Adjective stacking order — EN pre-noun → UA post-noun genitive

❌ **`прямокутні піщаного кольору чипи`** (EN: "rectangular sandy-coloured chips")
✅ **`прямокутні чипи піщаного кольору`**

Why: EN stacks adjectives before the noun freely. UA keeps structural adjectives (shape, size, number) before the noun and moves descriptive ones (colour, material, origin) to a post-noun genitive / instrumental phrase. Literal EN order sounds like a checklist instead of prose.

**Rule**: when an EN noun phrase has ≥2 adjectives where one is structural and another is descriptive (colour, material, country-of-origin, age), put the structural one before, the descriptive one after with genitive/instrumental: `прямокутні чипи піщаного кольору`, `керамічна підкладка білого кольору`, `мідний провід діаметром 0,5 мм`, `деталі вітчизняного виробництва`.

### 13.4. Chained past-participle + prepositional-phrase descriptions

❌ **`пластинка або плівка резистивного матеріалу, підігнана до заданого R, з виводами або торцевими контактами для підключення до схеми`** (EN: "a slab or film of resistive material, trimmed to the target R, with leads or end-caps to connect it into the circuit")
✅ Split into two sentences + replace past participle with adjectival phrase: **`Усередині — пластинка або плівка резистивного матеріалу із заданим опором R. До схеми її приєднують виводами або торцевими контактами.`**

Why: EN tolerates 3+ comma-separated modifier phrases in one sentence («past-participle, with-phrase, for-purpose»). UA grammar makes each phrase work harder — past participles need case agreement that's often ambiguous, prepositional phrases stack heavily, and the reader has to hold the subject in memory across the whole chain.

**Rule**: after translating any EN sentence with 3+ comma-separated descriptor phrases, read it aloud. If it feels heavy:
  1. Split into two sentences at the logical break (verb/function vs. property);
  2. Convert past participles to adjective phrases («підігнана до X» → «із заданим X»);
  3. OR use a relative clause («який/яка/яке…») to unstack the modifiers.

### 13.5. Canonical technical term in pedagogical prose without gloss

❌ **`схема зміщення`** / **`зміщення транзисторів`** (in a beginner chapter on resistors, before transistors are introduced)
✅ **`каскад задавання робочої точки транзистора`** / **`для задавання робочої точки транзисторів`**

**Mechanically enforced** via `style.unglossed-canonical-term` rule in `scripts/lint-ua-translation.mjs` as of ch1.4 post-mortem. The rule maintains a registry of jargon terms paired with `safeFromChapter` thresholds. A term appearing in a chapter below its threshold without being wrapped in any `<tag>…</tag>` AND without an immediate parenthetical gloss fires a WARN. Each new user catch of unglossed jargon must add a row to that registry.

Current registry (as of ch1.4): `атенюатор` (safe from ch3+), `адмітанс` (ch1.6+), `гістерезис` (ch2+), `каскад` (ch1.8+), `трансивер` (ch2+), `гетеродин` (ch3.1+), `зміщення` (ch1.10+), `ВЧ` (ch2+), `КХ` (ch4.1+), `реактивний опір` (ch1.5+).

**Extension rule**: whenever the user pushes back on an unglossed technical term, add a row to the REGISTRY in the lint script, don't just add it to landmines.md prose.

Why: «зміщення» IS the canonical UA electronics term for biasing (used in every datasheet, Ohm's-law textbook, diode/op-amp theory). BUT its everyday meaning is "displacement/shift", which gives the wrong mental image for a first-time reader. Pedagogical prose should either paraphrase descriptively OR include both forms on first use.

Same class:
  - «корпус» (component package) — its everyday meaning is "body/torso". First-time reader in a resistor chapter sees «корпусами резисторів» and pictures a resistor's torso. Prefer the general noun («типи резисторів») in intro paragraphs and let the section itself introduce the technical term with context.
  - «адмітанс» (in a ch1.6 intro before chapter defines AC impedance) — use «провідність у колах змінного струму» until it's formally defined.
  - «гістерезис» (in a digital-electronics intro before the Schmitt-trigger section) — use «поріг із запасом» or similar descriptive phrase.

**Rule**: before using a UA engineering term in a beginner chapter, check whether the concept has been introduced EARLIER in the book. If not, either paraphrase with the descriptive form, OR use both («зміщення (задавання робочої точки) транзисторів») on first appearance.

### 13.6. Jargon in intro/preview paragraphs before the section defines it

❌ **`Ми познайомимося з основними <surface>корпусами</surface> резисторів`** (intro preview — packages section hasn't run yet)
✅ **`Ми познайомимося з основними типами резисторів`** (general word in intro; specific term introduced in-section)

Why: intro/preview paragraphs summarise the chapter for a reader who's about to START reading. Using a term they'll meet in section 2 as if they already know it is bad pedagogy. EN tolerates it (reader fills in); UA readers are stricter.

**Rule**: audit intro/preview paragraphs for technical terms. If a term is formally introduced in a later section with its own glossary tag, use a general paraphrase in the intro. Apply equally to EN source — if the EN preview uses jargon, fix both locales.

### 13.7. English borrowings where UA Wikipedia has a native term — «декада» vs «десяток»

❌ **`логарифмічно у межах кожної декади`** / **`кількість номіналів на декаду`** (resistor E-series context)
✅ **`логарифмічно у межах кожного десятка`** / **`кількість номіналів на десяток`**

Why: UA Wikipedia on «Ряди номіналів радіоелементів» uses «десяток» (ten-fold interval) exclusively for resistor preferred-value context. «Декада» is a borrowing that IS acceptable in frequency-response contexts (Bode-plot rolloff «на декаду»), but for resistor values the native UA term wins. The `decade.detail` glossary entry (line ~2157 of uk/ui.json) explicitly flags «декада» as «синонім, запозичений з англійської» in that context too.

**Rule**: before using a Latin-derived UA term (decadа, toleransia, precisiyа, attenuaciya), check UA Wikipedia for the same concept. If Wikipedia uses a native Slavic root, use that. Borrowings are acceptable only where Wikipedia itself uses them.

Known domain-by-domain preferences:
  - Resistor E-series: **десяток** (not декада). Frequency rolloff: **порядок** (декада OK as synonym).
  - Divider: **подільник напруги** (not дільник).
  - Bias: **зміщення** in datasheets and theory; **задавання робочої точки** in beginner pedagogy.
  - Tolerance: **допуск**; «толеранс» is a calque in engineering contexts.
  - Precision (resistor grade): **точний** / **прецизійний** (both OK, prefer «прецизійний» for the 5-band grade).

### 13.8. Metaphor-carry-over failure — words that are figurative in EN but literal in UA

❌ **`на шві виходить крихітне перекриття, і разом два бункери покривають`** (EN: "there is a tiny overlap at the seam and the two bins together cover …", about tolerance windows of adjacent E-series values)
✅ **`на межі між цими двома вікнами виходить крихітне перекриття, і разом вони накривають`** — continuing the «вікно» metaphor the paragraph already established

Why: EN engineering prose routinely uses vivid figurative nouns — `seam` (boundary), `bin` (sorting category), `shelf` (parts-drawer), `rail` (power line), `spine` (backplane), `hood` (shroud), `bucket` (batch), `neck` (narrow part), `anchor` (reference point) — and English readers parse them metaphorically without conscious effort. In UA these same words translate to their LITERAL meanings: `шов` = stitched seam on a garment, `бункер` = grain silo / fuel bunker, `полиця` = bookshelf, `рейка` = railway track, `хребет` = human spine, `капот` = car bonnet, `відро` = water bucket, `шия` = anatomical neck, `якір` = ship's anchor. The reader asks «який шов? який бункер? який якір?» and loses the thread.

**Rule**: for every figurative noun in the EN source, ask:
  1. Does the literal UA translation CARRY the metaphorical extension? (e.g. «вузьке місце» DOES carry "bottleneck"; «бункер» does NOT carry "manufacturing value-bin")
  2. Has the SAME paragraph already established a metaphor that would continue naturally? (if yes, reuse it — the ch1.4 `eSeriesWhy` had `вікно` established two sentences earlier; I should have continued with `вікна перекриваються`, not introduced new metaphors)
  3. If the metaphor doesn't carry and no UA-native one fits, describe directly: say what physically happens without trying to preserve the figure.

**Recurring non-carrying metaphors to watch for**:
  - `seam` (boundary between categories) → `межа` / `стик` / «на границі між»
  - `bin` (sorting category) → `інтервал` / `категорія` / `діапазон` / just reuse `вікно`
  - `shelf` (parts inventory) → `асортимент` / `каталог` / `набір номіналів`
  - `rail` (power-supply line) → `шина` / `лінія живлення` — but `шина` works because UA already uses it for this!
  - `spine` (connecting backbone) → `основа` / `стрижень` (careful — `стрижень` is literal "rod", often works)
  - `bucket` (bulk container of same-type items) → `партія` / `група`
  - `hood` (protective cover) → `кожух` / `оболонка`
  - `anchor` (fixed reference point) → `опора` / `опорна точка`
  - `seam`, `bin`, `bucket`, `hood` in engineering prose almost NEVER carry to UA; the others sometimes do (`spine`, `rail`, `anchor`).

### 13.10. Section-heading calque: EN "What to take away" → «Що взяти з собою»

Flagged by user ch 1.4: «"Що взяти з собою" про що мова в цьому заголовку? куди взяти? чи це знову просто калька, якої я просив уникати?»

The English heading "What to take away" is an idiom (≈ "the key points worth remembering"). Literal UA «взяти з собою» preserves only the *verb of motion* — «взяти» implies physical possession or carrying something with you. A reader cannot literally «взяти з собою» a concept, so the heading reads as nonsense: "take where?"

- ❌ «Що взяти з собою» → ✅ «Головне» (shortest, most idiomatic; ch1.2, ch1.4 use this)
- ❌ «Що винести з розділу» → ✅ «Підсумки» / «Ключове»
- ❌ «Що треба забрати з собою» → ✅ «Що варто запам’ятати» (ch1.3)

**Rule:** for section-summary headings, prefer a noun («Головне», «Підсумки», «Ключове») or a soft-modal construction with a memory verb («Що варто запам’ятати»), never a verb of physical motion/possession («взяти», «забрати», «понести»).

**Register note on modals:** «Що треба запам’ятати» is grammatically correct but reads as imperative («you have to remember»). «Що варто запам’ятати» («what's worth remembering») is the softer, more reader-friendly variant — prefer it when using this construction.

**Anti-over-correction:** the fix is per-heading, NOT a book-wide consolidation. Different chapters may use different heading variants («Головне», «Підсумки», «Що варто запам’ятати») as long as each one is idiomatic. Do NOT bulldoze existing idiomatic UA headings into matching some other chapter for the sake of consistency alone. The linter targets only the physical-motion calque; other variants are fine.

**Enforcement:** mechanically caught by `forbidden.take-away-calque` in the linter.

### 13.11. Bare parenthetical «(завжди більше)» / «(завжди менше)» — calque of EN "(always larger/smaller)"

Flagged by user ch 1.4 keyTakeaway4: «що означають "завжди більше" і "завжди менше"? виглядає як калька і незрозуміло про що мова».

English summary bullets use short parentheticals — "(always larger)" / "(always smaller)" — that rely on the reader silently supplying the subject (*the resistance* is larger) and the comparison target (*than either resistor*). The literal UA rendering «(завжди більше)» / «(завжди менше)» fails on both counts:

1. **Grammatical subject mismatch.** Neuter «більше/менше» attaches to the nearest neuter noun by default («з'єднання»), producing "the connection is always larger" — nonsense. In EN the parenthetical floats; in UA it cannot.
2. **Missing comparison target.** «Більше за що?» has no anchor in the UA sentence. EN gets away with it because follow-up prose fills in; UA needs it stated inside the parenthetical or the sentence.

- ❌ «Послідовне: <var>R</var> = <var>R</var><sub>1</sub> + <var>R</var><sub>2</sub> (завжди більше).»
- ✅ «Послідовне з'єднання: <var>R</var> = <var>R</var><sub>1</sub> + <var>R</var><sub>2</sub> — сумарний опір більший за кожен із резисторів окремо.»
- ❌ «Паралельне: <var>R</var> = … (завжди менше).»
- ✅ «Паралельне з'єднання: <var>R</var> = … — сумарний опір менший за кожен із них.»

**Rule:** in UA, every comparative adjective («більший», «менший», «вищий», «нижчий», «коротший», «довший») in prose MUST have:
  - an explicit grammatical subject (not elided), AND
  - an explicit comparison target (`за Х`, `від Х`, `ніж Х`).

Bare parentheticals like «(завжди більше)», «(значно менше)», «(трохи вище)» fail both tests and read as translation debris.

**Same class** — flag and rewrite any of:
  - «(значно нижче)», «(помітно більше)», «(завжди вищий)» without an anchor
  - «значення тут менше» → «опір тут менший за номінальний»
  - «частота стає вищою» → «частота стає вищою за резонансну»

**Enforcement:** mechanically caught by `forbidden.bare-zavzhdy-comparative` in the linter (narrow pattern: parentheticals `(завжди + comparative)`). Broader cases — bare comparatives in full sentences — still need the read-aloud pass (13.9).

**Source-side discipline:** when writing the EN original, prefer "(total is larger than either resistor)" over "(always larger)". The more explicit EN survives translation without re-seeding this calque.


### 13.12. Case government of «торкнутися» — instrument goes instrumental, not genitive

Flagged by user ch 1.4 labStep2: «"Спочатку торкніться щупів один до одного" має бути "торкніться щупами"».

**The rule.** The Ukrainian verb «торкнутися» («to touch») has two argument slots with different cases:

- **Object** being touched → **genitive** case: «торкнутися руки», «торкнутися аркуша», «торкнутися виводів резистора»
- **Instrument** used to touch → **instrumental** case: «торкнутися рукою столу» (touched the table with the hand), «торкнутися щупами виводів» (touched the leads with the probes)

When the only noun mentioned is a tool (probe, finger, screwdriver, stylus) being used to make contact, that noun is the **instrument**, not the object — so it takes instrumental case.

- ❌ «торкніться щупів один до одного» — treats the probes as the object-being-touched (genitive «щупів»)
- ✅ «торкніться щупами один до одного» — probes as the instrument (instrumental «щупами»), reciprocal phrase «один до одного» implies they touch each other

**The trap.** English «touch the probes» is simply transitive — "touch" is a two-place verb with a direct object. The translator calques the English valency onto «торкнутися» and picks genitive (because UA «торкнутися» governs genitive) without noticing that the genitive slot in UA is for the OBJECT, while the probes are actually the INSTRUMENT. The English syntax doesn't distinguish, the UA case system does.

**Audit list** when editing lab steps and any procedural text:
- «щуп» (probe) — almost always an instrument → instrumental
- «палець» (finger) in measurement context — usually instrument → instrumental
- «викрутка», «пінцет», «скальпель» — instruments → instrumental
- «вивід», «контакт», «клема», «нога» (of a component) — usually the OBJECT being touched → genitive is correct

**Alternative phrasings** that avoid the ambiguity:
- «зімкніть щупи між собою» — "close the probes against each other"
- «замкніть щупи» — "short the probes" (electrician's idiom)
- «з'єднайте щупи» — "join the probes"

**Enforcement:** narrow rule `forbidden.torknutysya-schupiv` catches «торкн*» + «щупів». Extend the pattern when a new instrument noun gets flagged.

### 13.13. «Точніше, ніж на X відсотків» — margin-comparator calque of EN "to within X percent"

Flagged by user ch 1.4 labStep5: «"Вони мають збігатися точніше, ніж на пару відсотків" звучить криво, це знову калька?»

English uses a comparative construction for agreement/tolerance margins: "to within X percent", "better than X percent", "no more than X off". The UA translator calques this onto the comparative «точніше, ніж на X» — grammatically valid, semantically wrong: UA expresses margin/tolerance with completely different constructions.

- ❌ «Вони мають збігатися точніше, ніж на пару відсотків»
- ✅ «Значення мають збігатися з точністю до кількох відсотків»
- ✅ «Розбіжність має бути в межах кількох відсотків»
- ✅ «Похибка не повинна перевищувати кількох відсотків»

**Rule:** never translate "to within X" / "better than X" / "no more than X off" with the comparative «точніше/більше/менше, ніж на X». For tolerance/margin use one of:

| EN pattern                    | UA idiom                                      |
|-------------------------------|-----------------------------------------------|
| "agree to within X percent"   | «збігатися з точністю до X %»                 |
| "accurate to within X"        | «з точністю до X»                             |
| "within X of the target"      | «у межах X від цільового значення»            |
| "better than X percent"       | «з похибкою не більше X %»                    |
| "no more than X off"          | «відхилення не більше X»                      |

**Enforcement:** mechanically caught by `forbidden.tochnishe-nizh-na-calque` for the «точніше, ніж на» form. Other comparator verbs (швидше/більше/менше, ніж на X) would need their own rules if they show up.

### 13.14. «Пару відсотків / герц / хвилин» — russism for "a few" in measurement register

Flagged in the same ch 1.4 sentence. «Пара» in Ukrainian fundamentally means "pair" (two of something): «пара черевиків», «пара резисторів». The extended sense of "a small number, a few" is a **russism** (from ru. «пару процентов», «пару минут») and reads as colloquial at best, informal-inappropriate in technical writing at worst.

- ❌ «на пару відсотків»  → ✅ «на кілька відсотків»
- ❌ «зачекайте пару хвилин»  → ✅ «зачекайте кілька хвилин» / «декілька хвилин»
- ❌ «похибка лише пару герц»  → ✅ «похибка лише в кілька герц»

**Legitimate «пара» uses** (NOT flagged):
- «пара резисторів» — literal pair of two
- «пара контактів» — literal pair
- «у мене на столі пара мультиметрів» — literal pair

The tell for the russism is ACCUSATIVE «пару» (not nominative «пара») followed by a plural-genitive measurement unit. The pair-of-two sense uses nominative «пара» + plural-genitive noun («пара резисторів», nominative subject of a clause).

**Enforcement:** mechanically caught by `forbidden.paru-units-russism` for «пар[уи]» + technical unit (відсотк, процент, герц, вольт, ампер, ват, ом, децибел, хвилин, секунд, мілісекунд, мікросекунд, хвиль, канал, розділ). Extend the unit list when new measurements appear.

### 13.15. «Статичні факти» — calque of EN "static facts"

Flagged by user ch 1.4 labConnection: «Ця лабораторна пов'язує статичні факти кольорового коду з поведінкою резисторів усередині робочої схеми … звучить неприродно, схоже на кальку».

English "static facts" = "table-of-values, bookkeeping data that doesn't change". It's idiomatic English academic register. UA «статичний» has a much narrower meaning: **physically motionless** (статична електрика, статичне поле, статична напруга). Applied to «факти» it's semantically empty — facts are never moving anyway — so the adjective sits dead in the sentence.

- ❌ «статичні факти кольорового коду»  → ✅ «теорія кольорового коду», «значення з таблиці», «табличні дані», «довідкові знання»
- ❌ «статичні дані датчика»  → ✅ «табличні дані», «довідкові значення» (or if truly "not-changing", use «незмінні», «сталі»)

**Rule:** the EN word "static" used to mean "reference / lookup / table-of-values" MUST NOT be translated as «статичний» in UA. Either rephrase around «теорія → практика», «з таблиці — у реальність», or use the concrete UA noun («табличні дані», «довідкові знання»).

**Related calque at the same site:** «усередині робочої схеми» — literal "inside a working circuit". UA natural: «в реальній схемі», «у зібраній схемі», «на робочій платі». Not mechanically enforced (too broad to pattern-match safely) but covered by the read-aloud pass.

**Enforcement:** caught by `forbidden.statychni-fakty-calque` in the linter.

### 13.16. «Мотивує теорему / закон / підхід / …» — academic-English "motivates" calque

Flagged by user ch 1.4 labConnection: «"а це мотивує теорему Тевенена" до чого тут мотивація?».

English academic prose uses "X motivates Y" constantly: "this experiment motivates the theorem", "the result motivates the need for a new approach". It means "provides the rationale for / creates the need for Y". In Ukrainian, **«мотивувати» is ONLY used for motivating a PERSON** — «мотивує студентів», «мотивує команду», «мотивує працівників». Applied to a theorem, law, formula, method, or discussion, it's semantically broken: a theorem has no agency to be motivated.

Native UA equivalents for "X motivates Y" (academic sense):

| EN pattern                    | UA replacement                                                                  |
|-------------------------------|----------------------------------------------------------------------------------|
| "this motivates theorem Y"    | «саме тут стає в нагоді теорема Y», «саме для цього потрібна теорема Y»          |
| "X motivates the need for Y"  | «X робить потрібним Y», «через X нам знадобиться Y»                              |
| "this motivates the approach" | «саме тому ми оберемо такий підхід», «через це ми введемо такий підхід»          |
| "motivates the discussion"    | «саме це ми обговоримо у Розділі N», «для цього потрібне обговорення»            |

**Related lazy-verb calque at the same site:** «теорема, якою ми займемося» — "the theorem we'll occupy ourselves with". «Займатися + instrumental» for a theorem/formula/law is a generic deflection. Use the concrete verb: «яку ми розглянемо», «яку ми виведемо», «з якою ми познайомимося», «яку будемо вивчати». Not mechanically enforced (too broad — «займатися» has many legitimate uses) but covered by the read-aloud pass.

**Enforcement:** `forbidden.motyvuye-abstract-calque` catches any form of «мотивує/мотивують/мотивував…» followed within ~40 chars by an abstract target noun (теорем-/закон-/підхід-/метод-/формул-/правил-/обговоренн-/дискус-/висновок-/результат-/рівнянн-). Human-object cases («мотивує студентів», «мотивує команду») are deliberately not flagged — add to the target-noun list if a new abstract class slips through.

### 13.17. English "DC" in a frequency-range spec — dimension clash when calqued as «постійний струм»

Flagged by user ch 0.2 vnaHobby: «"Популярні сучасні моделі … працюють від постійного струму до 1,5–3 ГГц" чому йде мова про струм, а вказана частота?».

**The dual meaning of "DC" in English RF/filter engineering.** The abbreviation carries two distinct senses in English technical writing:

1. **"Direct current"** — a current TYPE (flows in one direction only). Dimension: amperes.
2. **"Zero frequency"** — a point on the frequency axis. Used in filter and analyser specs: "DC-to-X Hz" means "from 0 Hz up to X Hz". Dimension: hertz.

English readers pick the sense from context: "this amp draws 2 A of DC" (sense 1) vs "this VNA covers DC to 3 GHz" (sense 2). Same abbreviation, different dimension.

**The trap.** UA «постійний струм» literally translates only sense 1 — a current type. When sense 2 is calqued as «постійний струм», the phrase «від постійного струму до 3 ГГц» reads as a nonsensical cross-dimensional range: "from CURRENT to FREQUENCY".

**The fix.** In a frequency-range spec, name the lower bound in frequency units:

- ❌ «працюють від постійного струму до 1,5–3 ГГц»  → ✅ «працюють у діапазоні від 0 Гц до 1,5–3 ГГц»
- ❌ «фільтр пропускає від постійного струму до 10 кГц»  → ✅ «фільтр пропускає від 0 Гц до 10 кГц»
- ❌ «смуга пропускання — від постійного струму до 500 МГц»  → ✅ «смуга пропускання — від 0 Гц до 500 МГц»

If you want to preserve the RF-engineering flavor, use a gloss:  «від 0 Гц (постійний струм) до X Гц». Most contexts don't need it.

**Sense 1 uses are unaffected** (not flagged by the linter):
- «споживає 2 А постійного струму» — current draw of a load
- «постійний струм у колі — 1,5 А» — current magnitude
- «лінійний блок живлення видає постійний струм до 5 А» — "up to 5 A" is a current limit, not a frequency range

The tell for the dimension clash is **«постійн* струм*» within ~30 chars of «до» + a frequency unit (Гц/кГц/МГц/ГГц/ТГц)**. Current-magnitude uses end in an ampere unit (А/мА/кА), never a hertz unit — so the linter's window is unambiguous.

**Enforcement:** mechanically caught by `forbidden.dc-to-freq-dimension-clash`.

**Source-side note:** the EN source keeps "DC to X GHz" because it's idiomatic English RF-speak and English readers parse it correctly. Translation asymmetry is fine — what matters is that each language communicates the same content via its own idiom.

### 13.9. Meta-rule: the «read-aloud» pass

The critiques caught many of these earlier in the session, but several slipped through because they pass every mechanical check (no forbidden words, correct apostrophes, decimal commas, `<var>` wrapping, none of the catalogued landmines 1–12) AND they're grammatically correct — they just feel translated.

**Discipline for future chapters**: after the full critique + lint pass, before presenting to the user, the translator must re-read the ENTIRE BLOCK once more, sentence by sentence, asking:
  1. **Is the word order natural UA?** (color/material after the noun; structural adjectives before; comparative attached to the right noun)
  2. **Are there 3+ modifier phrases in one sentence?** (if yes, consider splitting)
  3. **Is the grammatical subject the RIGHT subject?** (not «конденсатори гірші» when the real subject is their допуск; not «джерело менше» when the real subject is the output voltage)
  4. **Does each UA pronoun have exactly one plausible antecedent?** (no floating «це/той/такий/менше» that attaches to the nearest noun by default when the intended referent is further away)
  5. **Would a UA reader who doesn't know the EN source parse this sentence the way I intended?**

If any answer is "no" or "maybe", rewrite. This pass costs minutes and saves hours of round-trip.

---

## How this list grows

When the user flags something I missed, add it here verbatim with `❌ wrong → ✅ right → why`. This is the permanent record — each new chapter starts with this list loaded.
