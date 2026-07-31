# Project memory

Hard-won conventions for The Radio Bench: things that are true about this project
but not derivable from the code, and mistakes expensive enough that they must not
be repeated.

**This directory is the source of truth.** It used to live only in
`~/.claude/projects/<project>/memory/`, which meant a `git clone` on a second
machine started from nothing — every convention below had to be rediscovered the
hard way. Read it here, and write new entries here.

`MEMORY.md` is the index: one line per entry. Load it first, then read whichever
entries are relevant to the task at hand.

## What is in here

| Prefix | Meaning |
|---|---|
| `feedback_*` | Guidance on how to work — corrections and confirmed approaches, with the reason. 28 entries; most were written after something shipped broken. |
| `project_*` | Facts about the project not visible in the code — pipelines, traps, registers. |
| `reference_*` | Pointers to external material: the reference books, the Ukrainian regulator PDFs. Paths are under the owner's Google Drive. |
| `ua_translation_workflow` | The mandatory EN→UA pipeline. Not optional — the older Claude-only route produced prose that took thirty rounds to clean up. |

## Writing a new entry

One fact per file, with frontmatter:

```markdown
---
name: <short-kebab-case-slug>
description: <one line — this is what recall matches against>
metadata:
  type: user | feedback | project | reference
---

<the fact; for feedback/project add **Why:** and **How to apply:**>
```

Link related entries with `[[their-name]]`, add the one-line pointer to
`MEMORY.md`, and check for an existing file covering the same ground before
creating a new one — update that instead.

Do not record what the repository already states. Code structure, past fixes and
git history are not memory; `CLAUDE.md` and `TECH_DEBT.md` are not memory either.
If an entry turns out to be wrong, delete it — a stale rule is worse than none,
and one of these files spent weeks asserting a capitalisation rule that was
derived from a typo.
