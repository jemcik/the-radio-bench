---
name: project_tech_debt_register
description: TECH_DEBT.md at the repo root is the register of accepted deferred quality work; each item is held green by a gate baseline so new work cannot add to it
metadata: 
  node_type: memory
  type: project
  originSessionId: 9612685c-dd07-42c7-a9b4-0147d5b16d01
  modified: 2026-07-26T14:03:07.542Z
---

Created 2026-07 during the ch 4.4 proofread. The user's instruction was explicit:
«ми маємо створити технічний борг і не забути потім виправити ці 18 розділів» —
record it durably rather than fixing 18 published chapters mid-review.

**The pattern to reuse.** When a new gate finds a pre-existing problem at scale:

1. Ship the gate and baseline every existing hit, **named individually** — never a
   blanket suppression. The gate then protects new work while the backlog waits.
2. Add a section to `TECH_DEBT.md` saying what the defect is, **why it was deferred**,
   how to work it off, and the per-chapter backlog table.
3. Make the gate print a pointer to `TECH_DEBT.md` on **both** the pass and fail paths,
   so the debt is discoverable from a green run and not only from a failure.
4. Clearing an item means deleting its section AND its baseline entries in one commit.

`CLAUDE.md` indexes the register under «Technical debt».

**Open as of 2026-07:**
- §1 widget/diagram strings restating neighbouring prose — 51 pairs in 18 chapters,
  gate `check:widget-prose-duplication`.
- §2 chapters 0.1–1.10 (15 of 27) never read by `beginner-review`; the skill landed
  2026-05-20 with ch 1.11. **No gate can cover this one** — the register is the only
  thing tracking it, which is the case for keeping the register at all.

Do not propose a mass sweep of a debt item during a proofread of something else; the
user has flagged that pattern before (see [[feedback_proofread_fast_minimal_fixes]]).
Offer it as its own piece of work.
