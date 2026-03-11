#!/bin/bash
# Forge — Initialize output structure from templates
#
# Usage: setup-templates.sh "task-id" "description" "auto" "save" "test" "playwright" "team" "branch" "pr" "interactive" "budget" "branch_name" "original_input" "reference_file"

set -e

INPUT_NAME="$1"
TASK_DESCRIPTION="$2"
AUTO_MODE="${3:-false}"
SAVE_MODE="${4:-false}"
TEST_MODE="${5:-false}"
PLAYWRIGHT_MODE="${6:-false}"
TEAM_MODE="${7:-false}"
BRANCH_MODE="${8:-false}"
PR_MODE="${9:-false}"
INTERACTIVE_MODE="${10:-false}"
BUDGET="${11:-mid}"
BRANCH_NAME="${12:-}"
ORIGINAL_INPUT="${13:-}"
REFERENCE_FILE="${14:-}"

if [[ -z "$INPUT_NAME" ]] || [[ -z "$TASK_DESCRIPTION" ]]; then
    echo "Error: task-id and description required" >&2
    exit 1
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
PROJECT_ROOT=$(pwd)
FORGE_OUTPUT_DIR="${PROJECT_ROOT}/.claude/output/forge"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$FORGE_OUTPUT_DIR"

# Parse input: full task_id (e.g., "01-add-auth") or feature name only
if [[ "$INPUT_NAME" =~ ^([0-9]+)-(.+)$ ]]; then
    TASK_ID="$INPUT_NAME"
    FEATURE_NAME="${BASH_REMATCH[2]}"
else
    FEATURE_NAME="$INPUT_NAME"
    TASK_ID=$("$SCRIPT_DIR/generate-task-id.sh" "$FEATURE_NAME")
fi

OUTPUT_DIR="${FORGE_OUTPUT_DIR}/${TASK_ID}"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE_DIR="${SKILL_DIR}/templates"

mkdir -p "$OUTPUT_DIR"

# Escape special characters for sed replacement strings
escape_sed_replacement() {
    printf '%s' "$1" | sed -e 's/[\\&|]/\\&/g'
}

# Determine conditional statuses
test_status="⏭ Skip"
[[ "$TEST_MODE" == "true" ]] && test_status="⏸ Pending"

playwright_status="⏭ Skip"
[[ "$PLAYWRIGHT_MODE" == "true" ]] && playwright_status="⏸ Pending"

pr_status="⏭ Skip"
[[ "$PR_MODE" == "true" ]] && pr_status="⏸ Pending"

# Build reference docs content
reference_docs_content="_No reference documents provided._"
if [[ -n "$REFERENCE_FILE" ]]; then
    reference_docs_content="**MUST READ before planning/execution:** \`${REFERENCE_FILE}\`"
fi

render_template() {
    local template_file="$1"
    local output_file="$2"

    local safe_task_desc safe_original_input safe_branch_name safe_reference_docs
    safe_task_desc=$(escape_sed_replacement "$TASK_DESCRIPTION")
    safe_original_input=$(escape_sed_replacement "$ORIGINAL_INPUT")
    safe_branch_name=$(escape_sed_replacement "$BRANCH_NAME")
    safe_reference_docs=$(escape_sed_replacement "$reference_docs_content")

    sed -e "s|{{task_id}}|${TASK_ID}|g" \
        -e "s|{{task_description}}|${safe_task_desc}|g" \
        -e "s|{{timestamp}}|${TIMESTAMP}|g" \
        -e "s|{{auto_mode}}|${AUTO_MODE}|g" \
        -e "s|{{save_mode}}|${SAVE_MODE}|g" \
        -e "s|{{test_mode}}|${TEST_MODE}|g" \
        -e "s|{{playwright_mode}}|${PLAYWRIGHT_MODE}|g" \
        -e "s|{{team_mode}}|${TEAM_MODE}|g" \
        -e "s|{{branch_mode}}|${BRANCH_MODE}|g" \
        -e "s|{{pr_mode}}|${PR_MODE}|g" \
        -e "s|{{interactive_mode}}|${INTERACTIVE_MODE}|g" \
        -e "s|{{budget}}|${BUDGET}|g" \
        -e "s|{{branch_name}}|${safe_branch_name}|g" \
        -e "s|{{feature_name}}|${FEATURE_NAME}|g" \
        -e "s|{{original_input}}|${safe_original_input}|g" \
        -e "s|{{test_status}}|${test_status}|g" \
        -e "s|{{playwright_status}}|${playwright_status}|g" \
        -e "s|{{pr_status}}|${pr_status}|g" \
        -e "s|{{reference_docs}}|${safe_reference_docs}|g" \
        "$template_file" > "$output_file"
}

# Always create base files
render_template "${TEMPLATE_DIR}/00-context.md" "${OUTPUT_DIR}/00-context.md"
render_template "${TEMPLATE_DIR}/01-research.md" "${OUTPUT_DIR}/01-research.md"
render_template "${TEMPLATE_DIR}/02-plan.md" "${OUTPUT_DIR}/02-plan.md"
render_template "${TEMPLATE_DIR}/03-execute.md" "${OUTPUT_DIR}/03-execute.md"
render_template "${TEMPLATE_DIR}/04-test.md" "${OUTPUT_DIR}/04-test.md"
render_template "${TEMPLATE_DIR}/05-document.md" "${OUTPUT_DIR}/05-document.md"

# Conditional
if [[ "$PR_MODE" == "true" ]]; then
    render_template "${TEMPLATE_DIR}/06-finish.md" "${OUTPUT_DIR}/06-finish.md"
fi

echo "TASK_ID=${TASK_ID}"
echo "OUTPUT_DIR=${OUTPUT_DIR}"
echo "✓ Forge templates initialized: ${OUTPUT_DIR}"
exit 0
