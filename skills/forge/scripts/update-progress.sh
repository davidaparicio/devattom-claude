#!/bin/bash
# Forge — Update progress table in 00-context.md

set -e

TASK_ID="$1"
STEP_NUMBER="$2"
STEP_NAME="$3"
STATUS="$4"  # "in_progress", "complete", or "skip"

if [[ -z "$TASK_ID" ]] || [[ -z "$STEP_NUMBER" ]] || [[ -z "$STEP_NAME" ]] || [[ -z "$STATUS" ]]; then
    echo "Usage: $0 <task_id> <step_number> <step_name> <status>"
    exit 1
fi

PROJECT_ROOT=$(pwd)
CONTEXT_FILE="${PROJECT_ROOT}/.claude/output/forge/${TASK_ID}/00-context.md"

if [[ ! -f "$CONTEXT_FILE" ]]; then
    echo "Error: Context file not found: $CONTEXT_FILE" >&2
    exit 1
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [[ "$STATUS" == "in_progress" ]]; then
    STATUS_SYMBOL="⏳ In Progress"
elif [[ "$STATUS" == "complete" ]]; then
    STATUS_SYMBOL="✓ Complete"
elif [[ "$STATUS" == "skip" ]]; then
    STATUS_SYMBOL="⏭ Skip"
else
    echo "Error: Invalid status. Use 'in_progress', 'complete', or 'skip'" >&2
    exit 1
fi

TEMP_FILE=$(mktemp)

awk -v step="${STEP_NUMBER}-${STEP_NAME}" \
    -v status="$STATUS_SYMBOL" \
    -v timestamp="$TIMESTAMP" '
BEGIN { in_table = 0; found = 0 }
{
    if ($0 ~ /^## Progress/) {
        in_table = 1
        print $0
        next
    }

    if (in_table && $0 ~ /^## /) {
        in_table = 0
    }

    if (in_table && $0 ~ "\\| " step " \\|") {
        printf "| %s | %s | %s |\n", step, status, timestamp
        found = 1
        next
    }

    print $0
}
END {
    if (!found) {
        print "Warning: Step not found in progress table" > "/dev/stderr"
    }
}
' "$CONTEXT_FILE" > "$TEMP_FILE"

mv "$TEMP_FILE" "$CONTEXT_FILE"

echo "✓ Progress: ${STEP_NUMBER}-${STEP_NAME} → ${STATUS_SYMBOL}"
exit 0
