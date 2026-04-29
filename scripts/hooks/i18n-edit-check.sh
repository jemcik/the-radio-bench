#!/usr/bin/env bash
# PostToolUse hook for Edit/Write/MultiEdit on i18n locale files.
#
# Reads the tool-call JSON from stdin, extracts tool_input.file_path,
# and — only when the path is one of the chapter ui.json files — runs
# the i18n parity check and the Ukrainian linter. The exit code matches
# the failing check (if any) so the model sees lint output as a
# system-reminder on the next turn and fixes it before continuing.
#
# Non-i18n edits exit 0 silently; the hook is a no-op for them.

set -u

# Resolve repo root from this script's location (scripts/hooks/ → ../..).
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# Read stdin JSON; tolerate empty/missing payload.
PAYLOAD="$(cat || true)"
FILE_PATH="$(printf '%s' "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)"

# Bail out silently for non-i18n edits.
case "$FILE_PATH" in
  */src/i18n/locales/en/ui.json|*/src/i18n/locales/uk/ui.json) ;;
  *) exit 0 ;;
esac

cd "$REPO_ROOT"

# Run both checks. Either failing means the hook reports non-zero so
# the model sees a system-reminder. -s suppresses npm's own progress noise.
npm run -s check:i18n || exit $?
npm run -s check:uk   || exit $?
