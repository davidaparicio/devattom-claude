#!/bin/bash
# Forge — Initialize output structure from templates
#
# Usage: setup-templates.sh "task-id" "description" "budget" "team_mode" "doc_mode" "original_input" "reference_file"

set -e

INPUT_NAME="$1"
TASK_DESCRIPTION="$2"
BUDGET="${3:-mid}"
TEAM_MODE="${4:-false}"
DOC_MODE="${5:-false}"
ORIGINAL_INPUT="${6:-}"
REFERENCE_FILE="${7:-}"

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

# Add .claude/output/ to .gitignore if not already present
GITIGNORE_FILE="${PROJECT_ROOT}/.gitignore"
GITIGNORE_ENTRY=".claude/output/"
if [[ -f "$GITIGNORE_FILE" ]]; then
    if ! grep -qF "$GITIGNORE_ENTRY" "$GITIGNORE_FILE"; then
        printf '\n# Forge — temporary output files\n%s\n' "$GITIGNORE_ENTRY" >> "$GITIGNORE_FILE"
        echo "✓ Added ${GITIGNORE_ENTRY} to .gitignore"
    fi
else
    printf '# Forge — temporary output files\n%s\n' "$GITIGNORE_ENTRY" > "$GITIGNORE_FILE"
    echo "✓ Created .gitignore with ${GITIGNORE_ENTRY}"
fi

# Escape special characters for sed replacement strings
escape_sed_replacement() {
    printf '%s' "$1" | sed -e 's/[\\&|]/\\&/g'
}

# Advisor uses by budget
ADVISOR_USES="2"
[[ "$BUDGET" == "high" ]] && ADVISOR_USES="4"

# Doc phase status
DOC_STATUS="⏭ Skip"
[[ "$DOC_MODE" == "true" ]] && DOC_STATUS="⏸ Pending"

# Build reference docs content
REFERENCE_DOCS_CONTENT="_No reference documents provided._"
if [[ -n "$REFERENCE_FILE" ]]; then
    REFERENCE_DOCS_CONTENT="**MUST READ before planning/execution:** \`${REFERENCE_FILE}\`"
fi

render_template() {
    local template_file="$1"
    local output_file="$2"

    local safe_task_desc safe_original_input safe_reference_docs
    safe_task_desc=$(escape_sed_replacement "$TASK_DESCRIPTION")
    safe_original_input=$(escape_sed_replacement "$ORIGINAL_INPUT")
    safe_reference_docs=$(escape_sed_replacement "$REFERENCE_DOCS_CONTENT")

    sed -e "s|{{task_id}}|${TASK_ID}|g" \
        -e "s|{{task_description}}|${safe_task_desc}|g" \
        -e "s|{{timestamp}}|${TIMESTAMP}|g" \
        -e "s|{{budget}}|${BUDGET}|g" \
        -e "s|{{team_mode}}|${TEAM_MODE}|g" \
        -e "s|{{doc_mode}}|${DOC_MODE}|g" \
        -e "s|{{advisor_uses_remaining}}|${ADVISOR_USES}|g" \
        -e "s|{{feature_name}}|${FEATURE_NAME}|g" \
        -e "s|{{original_input}}|${safe_original_input}|g" \
        -e "s|{{doc_status}}|${DOC_STATUS}|g" \
        -e "s|{{reference_docs}}|${safe_reference_docs}|g" \
        "$template_file" > "$output_file"
}

# Create all output files
render_template "${TEMPLATE_DIR}/00-context.md" "${OUTPUT_DIR}/00-context.md"
render_template "${TEMPLATE_DIR}/01-research.md" "${OUTPUT_DIR}/01-research.md"
render_template "${TEMPLATE_DIR}/02-plan.md" "${OUTPUT_DIR}/02-plan.md"
render_template "${TEMPLATE_DIR}/03-execute.md" "${OUTPUT_DIR}/03-execute.md"
render_template "${TEMPLATE_DIR}/04-test.md" "${OUTPUT_DIR}/04-test.md"
render_template "${TEMPLATE_DIR}/05-document.md" "${OUTPUT_DIR}/05-document.md"

echo "TASK_ID=${TASK_ID}"
echo "OUTPUT_DIR=${OUTPUT_DIR}"
echo "✓ Forge templates initialized: ${OUTPUT_DIR}"
exit 0
