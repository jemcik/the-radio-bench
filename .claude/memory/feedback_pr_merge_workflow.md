---
name: feedback_pr_merge_workflow
description: "PR workflow boundaries — when opening a PR, flip chapter status to 'published' (never leave draft); and NEVER merge (gh pr merge / squash / auto-merge) — the user merges every PR himself. Claude's role ends at commit + push (+ open/update PR, watch CI)."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 302ab6e4-48fd-40e3-982b-d46a5f2dd860
---

Two corrections given right after opening PR #55 (chapter 4.1):

1. **Never leave a chapter `'draft'` when opening a PR.** «більше ніколи не залишай draft коли ми відкриваємо ПР!» When the work is done and we open the PR, flip `status: 'draft' → 'published'` in `src/data/chapters.ts` as part of it. (Earlier I kept it draft, over-applying the publish-permission guardrail plus a stale mid-proofread «лишити draft» — wrong for the PR-opening moment.)

2. **Never merge — the user merges every PR himself.** «я сам все мержу, ти тільки робиш коміти і пуші!» My role is `git commit` + `git push`, plus opening/updating the PR and (optionally) reporting CI status. Do NOT run `gh pr merge`, `--auto`, squash, or delete the branch. After the branch is pushed and the PR is ready, STOP and hand it back.

**Why:** merging is the user's decision gate; and a chapter behind a PR is meant to go live on merge, so shipping it as draft defeats the point.

**How to apply:** even when the user says «я готовий мержити, зроби» — the «зроби» means *prepare it* (flip to published + commit + push + open/update PR), NOT perform the merge. Do that, report it's green and ready, then stop. Builds on [[feedback_no_commits_without_ask]]: commit/push only on explicit ask, and merge is never mine even when the word «merge» appears — read it as «get it ready for me to merge».
