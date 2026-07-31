---
name: UA playground-register placement verbs — never use for components/materials
description: In Ukrainian lab/procedural prose, "покладіть"/"поставте"/"висіти" on components are colloquial. Use розмістіть/помістіть/установіть/увімкніть; a wire end «залишається вільним», not «висить».
type: feedback
originSessionId: dae04b93-349b-4b3c-8804-ac218a0068a2
---
**Rule:** When translating EN lab/procedural prose into Ukrainian for the Radiopedia project, NEVER use the kitchen/playground verbs `покласти`/`покладіть`, `поставити`/`поставте`, or `висіти`/`висить` when the subject is a physical component (resistor, capacitor, inductor, wire, board, dielectric, plate) or a placement action.

Correct mappings:
- EN "put / place / lay X" → UA **`розмістіть` / `помістіть`** (not `покладіть`)
- EN "place / set X between Y and Z" → UA **`розмістіть` / `помістіть між Y і Z`**
- EN "put X in series" → UA **`увімкніть X послідовно`** or **`підʼєднайте X послідовно`** (not `поставте X послідовно`)
- EN "mount / install X" → UA **`установіть X`**
- EN "leave one end hanging / unconnected" → UA **`нехай один кінець залишається вільним`** / **`лишається неприєднаним`** (not `висіти`)
- EN "stand X facing each other" (for plates) → UA **`розмістіть X паралельно, одну навпроти одної`** (not «обличчям одна до одної» — that personifies metal)

**Why:** `покласти` in UA carries a strong kitchen/parenting connotation (put the spoon on the table, put the child to bed). `поставити` for components reads as placing objects on a shelf. `висіти` for a wire reads as a curtain hanging. None belong in a physics-lab procedural register.

**How to apply:** Before translating any EN imperative that places, mounts, or connects a component, pick the UA verb from the list above based on the action type (placement / connection / installation / disconnection). Default to `розмістіть` when uncertain. After writing any `labStep*` / `labComp*` / any lab-instruction prose, scan aloud for `поклад-`, `постав-`, `вис-` stems — if you find them, check whether the subject is a component or material, and if yes, replace.

User has flagged this class repeatedly across ch1.1–ch1.5. The mechanical linter rules (`forbidden.playground-placement`, `forbidden.postavte-component`, `forbidden.visity-wire` in `.claude/skills/ua-translate/scripts/lint-ua-translation.mjs`) catch the common patterns from ch1.5 onward — run `npm run check:uk` or `node .claude/skills/ua-translate/scripts/lint-ua-translation.mjs src/i18n/locales/uk/ui.json ch<N>_<M>` after every lab-section edit.

Related entries in `.claude/skills/ua-translate/references/landmines.md`: «Playground/childish verbs for PLACING/INSTALLING components» (row added ch1.5); the older «Playground/childish verbs on physical quantities» (from ch1.3) covers moving/oscillating quantities — this one is specifically for placement actions in procedural prose.
