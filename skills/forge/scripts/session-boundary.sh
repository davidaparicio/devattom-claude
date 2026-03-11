#!/bin/bash
# Forge — Handle session boundaries (pauses between phases)
#
# Usage: session-boundary.sh "task_id" "step_num" "step_name" "summary" "next_step" "next_description" "step_context" ["gotcha"] ["branch_mode"] ["commit"]

set -e

TASK_ID="$1"
STEP_NUMBER="$2"
STEP_NAME="$3"
SUMMARY="$4"
NEXT_STEP="$5"
NEXT_DESCRIPTION="$6"
STEP_CONTEXT="$7"
GOTCHA="${8:-}"
BRANCH_MODE="${9:-false}"
COMMIT_FLAG="${10:-}"

PROJECT_ROOT=$(pwd)
CONTEXT_FILE="${PROJECT_ROOT}/.claude/output/forge/${TASK_ID}/00-context.md"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$CONTEXT_FILE" ]]; then
    echo "Error: Context file not found: $CONTEXT_FILE" >&2
    exit 1
fi

# 1. Mark step as complete
bash "$SCRIPT_DIR/update-progress.sh" "$TASK_ID" "$STEP_NUMBER" "$STEP_NAME" "complete"

# 2. Update state snapshot (next_step + step context)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TEMP_FILE=$(mktemp)

awk -v next_step="$NEXT_STEP" \
    -v step_context="$STEP_CONTEXT" \
    -v gotcha="$GOTCHA" '
{
    # Update next_step
    if ($0 ~ /^\*\*next_step:\*\*/) {
        printf "**next_step:** %s\n", next_step
        next
    }

    # Add step context
    if ($0 ~ /^_Brief summaries added as steps complete_/) {
        print step_context
        next
    }
    if ($0 ~ /^### Step Context/) {
        print $0
        next
    }

    # Add gotcha if present
    if (gotcha != "" && $0 ~ /^_Surprises, workarounds/) {
        print gotcha
        next
    }

    print $0
}
' "$CONTEXT_FILE" > "$TEMP_FILE"

mv "$TEMP_FILE" "$CONTEXT_FILE"

# 3. Commit if branch_mode and requested
if [[ "$BRANCH_MODE" == "true" ]] && [[ "$COMMIT_FLAG" == "commit" ]]; then
    git add -u 2>/dev/null && git diff --cached --quiet 2>/dev/null || \
        git commit -m "forge(${TASK_ID}): phase ${STEP_NUMBER} - ${STEP_NAME}" 2>/dev/null || true
fi

# 4. Display session boundary
cat <<EOF

═══════════════════════════════════════
  PHASE ${STEP_NUMBER} COMPLETE: ${STEP_NAME}
═══════════════════════════════════════
  ${SUMMARY}
  Resume: /forge -r ${TASK_ID}
  Next: Phase ${NEXT_STEP} - ${NEXT_DESCRIPTION}
═══════════════════════════════════════

EOF

exit 0
