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
| `розділи вище` when `розділ`=chapter in the app (ambiguous — chapters OR sections?) | `попередні частини` / `попередні підрозділи` | Application overloads `розділ` — use a different UA word when sub-chapter sections are meant. |
| `куди зникають X` (calque "where X disappear to") | `на що перетворюються X` | EN idiom is "become / end up as" (energy transformation); UA `куди зникають` = "where TO they vanish" reverses the meaning. |
| `X, такі як Y` (for "X such as Y") | `X на кшталт Y` / `X як-от Y` | `такі як` is accepted but anglicism-leaning; `на кшталт`/`як-от` is more native in expository prose. |
| `Вважайте це X` (calque "Think of this as X", stiff register) | `Уявіть це як X` | `Вважати + instrumental` is correct but formal; `Уявіть як` is conversational-register match for EN "think of as". |
| **Іон polarity — always `позитивний/негативний`** | `позитивний іон` / `негативний іон` (NEVER `додатний/від'ємний іон`) | Per native-speaker rule (user feedback): іони ALWAYS described as positive/negative, never додатний/від'ємний. This is a hard lexical convention — ion nomenclature in UA chemistry/physics literature is категорично `позитивний/негативний`. **Scope distinction**: CHARGE (the scalar quantity) can use `додатний/від'ємний` for scientific register (per glossary sweep). ION (particle) always uses `позитивний/негативний`. Battery terminals / circuit polarity: either form OK, usually `плюсовий/мінусовий` or `«+»/«−»`. |
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

## How this list grows

When the user flags something I missed, add it here verbatim with `❌ wrong → ✅ right → why`. This is the permanent record — each new chapter starts with this list loaded.
