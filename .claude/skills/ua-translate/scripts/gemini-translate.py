#!/usr/bin/env python3
"""Translate ch<N>_<M> i18n keys from EN to UA via Gemini Pro side-by-side.

Produces two translation candidates (Gemini 2.5 Pro vs 3.1 Pro) per batch
of keys so Claude/the user can compare and pick per key. Writes each
model's output to /tmp/gemini-section/<first-key>_<model>.json.

Usage:
    python3 .claude/skills/ua-translate/scripts/gemini-translate.py \
        <chapter_id> <key1> [<key2> ...]

Example:
    python3 .claude/skills/ua-translate/scripts/gemini-translate.py \
        ch1_6 sectionGeometry geometryIntro geometryVars

The script:
  1. Reads the EN source for each key from src/i18n/locales/en/ui.json
  2. Reads anchor keys (first paragraphs already translated in uk/ui.json)
     to give the model a style target matching the chapter's voice
  3. Calls Gemini 2.5 Pro and 3.1 Pro with a system prompt that embeds:
     - The project glossary (references/glossary.md) — canonical term list
     - The landmines catalogue (references/landmines.md) — patterns to
       avoid
     - Mechanical i18n requirements (NBSP, decimal comma, Cyrillic units,
       React tag preservation, curly apostrophe)
  4. Writes each model's JSON to /tmp/gemini-section/

Billing: Pro models require a paid Google Cloud tier (free tier quota = 0
for 2.5/3 Pro). Flash models work on free tier as a fallback.

Cost per chapter section (rough, 2026 prices):
  - Gemini 2.5 Pro: $1.25/M input + $10/M output  ≈ $0.11
  - Gemini 3.1 Pro: $2/M input + $12/M output     ≈ $0.14

Requires GEMINI_API_KEY in .env.local (repo root).
"""
import json
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

# ── Load API key silently from .env.local ─────────────────────────────
def load_api_key() -> str:
    env_file = Path('.env.local')
    if not env_file.exists():
        sys.exit('.env.local not found. Create it with GEMINI_API_KEY=... '
                 '(repo root, git-ignored).')
    for line in env_file.read_text().splitlines():
        if line.startswith('GEMINI_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"\'')
    sys.exit('GEMINI_API_KEY not found in .env.local')

# ── CLI ───────────────────────────────────────────────────────────────
if len(sys.argv) < 3:
    sys.exit(f'Usage: {sys.argv[0]} <chapter_id> <key1> [<key2> ...]')
chapter_id = sys.argv[1]
keys = sys.argv[2:]

if not re.match(r'^[A-Za-z][A-Za-z0-9_]*$', chapter_id):
    sys.exit(f'Invalid block id {chapter_id!r}. Expected an i18n top-level block name (e.g. ch1_6, welcome, hero).')

api_key = load_api_key()

# ── Load sources ──────────────────────────────────────────────────────
en_root = json.loads(Path('src/i18n/locales/en/ui.json').read_text())
uk_root = json.loads(Path('src/i18n/locales/uk/ui.json').read_text())

# EN content for glossary entries lives in src/features/glossary/glossary.ts,
# not en/ui.json (which only has glossary._names and glossary._ui). Run
# `node scripts/extract-glossary.mjs` to dump it to /tmp/glossary-en.json
# before translating any glossary terms.
if chapter_id == 'glossary':
    glossary_dump = Path('/tmp/glossary-en.json')
    if not glossary_dump.exists():
        sys.exit('Run `node scripts/extract-glossary.mjs` first to dump the '
                 'EN glossary defaults to /tmp/glossary-en.json.')
    en_block = json.loads(glossary_dump.read_text())
elif chapter_id not in en_root:
    sys.exit(f'Chapter {chapter_id!r} not found in en/ui.json')
else:
    en_block = en_root[chapter_id]
uk_block = uk_root.get(chapter_id, {})
if chapter_id == 'glossary':
    # uk_block has the glossary entries directly; strip _names/_ui meta.
    uk_block = {k: v for k, v in uk_block.items() if not k.startswith('_')}

missing = [k for k in keys if k not in en_block]
if missing:
    sys.exit(f'Keys not in en/{chapter_id}: {missing}')

source = {k: en_block[k] for k in keys}

# Anchor: already-translated intro keys, if present. These give the model
# a style target (same chapter voice, same terminology).
ANCHOR_KEY_CANDIDATES = ['intro', 'introPreview']
already_translated = {
    k: uk_block[k] for k in ANCHOR_KEY_CANDIDATES
    if k in uk_block and not any(en_block.get(k) == uk_block.get(k)
                                  for _ in [0])  # keep only if translated (UA differs from EN)
}
# Above filter kept all present — simpler: include if the UA key exists
# and is non-empty.
already_translated = {
    k: uk_block[k] for k in ANCHOR_KEY_CANDIDATES
    if k in uk_block and uk_block.get(k)
}

# ── Load glossary + landmines for the system prompt ───────────────────
skill_root = Path(__file__).parent.parent  # .claude/skills/ua-translate
glossary_md = (skill_root / 'references' / 'glossary.md').read_text()
# landmines.md is huge; include a curated summary of the most-fired rules
# rather than the full 700-line file (which would blow the context budget).

# ── System prompt ─────────────────────────────────────────────────────
SYSTEM_PROMPT = f"""You are a senior Ukrainian technical editor translating the Radiopedia ham-radio / electronics textbook from English to Ukrainian. Your output must read as if originally written in Ukrainian by a native technical writer. Zero calques. Zero English-leftover phrases. Zero "translated" feel.

═══════════════════════════════════════════════════════════════════
STYLE ANCHOR — ALREADY-TRANSLATED INTRO (match this chapter's voice)
═══════════════════════════════════════════════════════════════════

{json.dumps(already_translated, ensure_ascii=False, indent=2) if already_translated else '(no anchor available yet — translate in standard textbook UA)'}

═══════════════════════════════════════════════════════════════════
PROJECT GLOSSARY (canonical terminology — use these forms EXACTLY)
═══════════════════════════════════════════════════════════════════

{glossary_md}

═══════════════════════════════════════════════════════════════════
NON-NEGOTIABLE MECHANICAL REQUIREMENTS
═══════════════════════════════════════════════════════════════════

1. PRESERVE every React component tag EXACTLY as in the source:
   <strong>, <em>, <var>, </var>, <sub>, </sub>, <nowrap>, </nowrap>,
   and any glossary tags (<cap>, <coul>, <far>, <diel>, <elec>, <tc>,
   <coupl>, <bypass>, <multimeter>, <breadboard>, <deriv>, etc.).
   Replace only the UA text INSIDE them if appropriate; never rename
   tags.

2. Ukrainian unit symbols in Cyrillic: В, мВ, кВ, А, мА, мкА, Ом, кОм,
   МОм, Гц, кГц, МГц, ГГц, Ф, мкФ, нФ, пФ, Вт, Дж, Кл, с, мс, мкс, нс,
   дБ. NEVER Latin unit symbols in Cyrillic prose.

3. Non-breaking space (U+00A0) between number and unit: «1,5 В»,
   «100 мкФ», «50 Гц», «20 мс». Use the actual U+00A0 character, not a
   regular space.

4. Decimal separator is a COMMA: «1,5», «0,63», «99,3 %». Period
   reserved for section numbers («розділ 1.7»).

5. Apostrophe is the curly form '\u2019' (U+2019), never ASCII '.

6. Polite plural «ви», ALWAYS lowercase. NEVER capital «Ви» / «Ваш» /
   «Вам» mid-sentence. Sentence-initial capital is fine.

7. Guillemets «…» for quoted inline terms, not "…".

8. **Subscript identifiers stay in their source script.** Keep
   `V_in`, `f_c`, `V_0` in Latin — do NOT translate to `V_вх`, `f_зр`,
   `V_нач`.

9. **Polarity of poles/terminals — ALWAYS «позитивний / негативний»**,
   NEVER «додатний / від'ємний» for leads, plates, electrodes,
   terminals. The latter is reserved for scalar/math contexts
   («додатне число», «від'ємна півхвиля»). This is a hard lexical
   rule — gets enforced by the linter.

═══════════════════════════════════════════════════════════════════
TOP-FIRING LANDMINES — patterns that MUST NOT appear
═══════════════════════════════════════════════════════════════════

× «при + verbal noun» Russianism («при прикладенні», «при натисканні»,
  «при навантаженні»). Use «коли + verb», «під час + noun»,
  «за + instr», or «для + noun». «при кімнатній температурі» OK.

× «-ючий» active participles (Russianism): «підтягуючий»,
  «обмежуючий», «обеззброюючий», «зростаючий». Use «-льний» or a
  relative clause.

× «у N раза / разу» (Russism) → «у N рази» (2/3/4) or «у N разів» (5+).

× «домовленість» / «конвенція» for scientific convention → «правило»,
  «загальноприйняте правило», «вибір [особи]».

× Playground verbs on physical quantities: «гойдається», «танцює»,
  «стрибає», «бігає», «сидить», «ганяє». Use formal «коливається»,
  «періодично змінюється», «зростає», «спадає», «накопичується»,
  «знаходиться», «переміщує».

× Playground PLACEMENT verbs for components: «покладіть», «поставте»
  (for resistor/capacitor/dielectric), «висіти» (for a wire end).
  Use «розмістіть», «помістіть», «увімкніть послідовно/паралельно»,
  «підʼєднайте», «установіть». A loose wire end «лишається вільним».

× Anthropomorphic descriptors on quantities: «спокійна напруга»,
  «втомлений сигнал», «конденсатор любить / хоче», «шум бачить
  замикання», «електричне поле живе в діелектрику». Use neutral
  physics verbs: «стала напруга», «сигнал малої амплітуди»,
  «характеризується», «для шуму конденсатор являє собою короткe
  замикання».

× «обличчям одна до одної» for plates — wrong (personifies metal).
  Use «паралельно, одну навпроти одної».

× «брязкіт» (колоквіалізм) → «дрижання контактів».

× «міряти / поміряти / щупати» → «вимірювати / виміряти / торкатися
  щупами».

× «пару відсотків / секунд» (Russism) → «кілька відсотків / секунд».

× «точніше, ніж на X %» → «з точністю до X %» / «у межах X %».

× «підступ», «з підступом» (для EN "the catch / gotcha") →
  «нюанс», «застереження», «важливе обмеження».

× EN figurative nouns that don't carry: shelf→полиця (use «на
  практиці», «у продажу»); seam→шов; bin→бункер; can→банка (use
  «корпус»); brick→цеглина (сіbling «цеглинка» диминутив OK).

× Calques: «обеззброююче проста» → «на диво проста»; «стоять за
  кожним застосуванням» → «лежать в основі»; «інтуїтивний погляд
  на X» → «на інтуїтивному рівні розберемо X»; «виходить розмова» →
  «один крок до X» / «підводить до X»; «Корисна мнемоніка» — прибрати
  обрамлення, сформулювати прямо; «пройдемо тему» → «розглянемо».

× «виростає / вирощено» для оксидного шару → «формується / сформовано»
  (physics register).

× «сидить на 0 В» для сигналу → «з нульовою постійною складовою».

× «покладайтеся» is fine (= "rely on"); «покладіть» (= "put down")
  is the landmine.

× Bare comparative adjective on a component noun («менший конденсатор»,
  «більший резистор») — UA reads as physical size first. Use
  «конденсатор меншої ємності», «резистор з більшим опором».

× Bare generic noun («значення», «параметр», «рівень», «величина»)
  without a qualifier — add the domain noun («значення опору»,
  «рівень напруги», «номінал конденсатора»).

× «протилежне до X» без пояснення — завжди пояснюйте, у ЧОМУ саме
  протилежність.

× Raw `<` / `>` in i18n strings (renders as `&lt;/&gt;`) —
  replace with «менше за», «більше за», «не більше», etc.

× «Розв'язаний приклад» / «розібраний приклад» for EN "worked
  example" → «Приклад розрахунку».

═══════════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════

Return a JSON object whose keys are exactly the keys in the EN source
below. Each value is the Ukrainian translation. NO commentary, NO
markdown fences, NO explanations — ONLY the JSON object. Preserve all
component tags exactly.

If the input contains nested objects (e.g. a widget subtree), output the
same nested structure.
"""

USER_PROMPT = f"""EN source to translate (chapter {chapter_id}):

{json.dumps(source, ensure_ascii=False, indent=2)}

Translate each value to Ukrainian per all rules above. Output only
the JSON object with the same keys (and same nested structure, if any)."""


def call_gemini(model: str) -> dict:
    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": USER_PROMPT}]}],
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.8,
            "maxOutputTokens": 16384,
            "responseMimeType": "application/json",
        },
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=240) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return {'error': e.read().decode('utf-8', errors='replace')}


MODELS = [
    ('gemini-2.5-pro',         '2.5 Pro'),
    ('gemini-3.1-pro-preview', '3.1 Pro'),
]

out_dir = Path('/tmp/gemini-section')
out_dir.mkdir(exist_ok=True)

# Tag output files by first key (for resuming / multi-batch runs)
section_id = keys[0]

for model_id, label in MODELS:
    print(f'→ {label} ({model_id}) …', flush=True)
    resp = call_gemini(model_id)
    if 'error' in resp:
        print(f'  ✗ {resp["error"][:200]}')
        continue
    try:
        text = resp['candidates'][0]['content']['parts'][0]['text']
        parsed = json.loads(text)
    except Exception as e:
        print(f'  ✗ parse: {e}')
        print('  raw:', json.dumps(resp, ensure_ascii=False)[:500])
        continue
    fn = out_dir / f'{section_id}_{label.replace(" ","_")}.json'
    fn.write_text(json.dumps(parsed, ensure_ascii=False, indent=2))
    print(f'  ✓ {fn}')

print()
print('Done. Compare the two outputs, pick per key, apply to uk/ui.json.')
print('After applying, always run:')
print(f'  node .claude/skills/ua-translate/scripts/lint-ua-translation.mjs '
      f'src/i18n/locales/uk/ui.json {chapter_id}')
