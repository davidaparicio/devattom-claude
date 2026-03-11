#!/bin/bash
# Forge — Génère un task_id unique avec numéro auto-incrémenté
#
# Usage: generate-task-id.sh "feature-name"
# Output: NN-feature-name (ex: 01-add-auth-middleware)

set -e

FEATURE_NAME="$1"

if [[ -z "$FEATURE_NAME" ]]; then
    echo "Error: feature name required" >&2
    exit 1
fi

PROJECT_ROOT=$(pwd)
FORGE_OUTPUT_DIR="${PROJECT_ROOT}/.claude/output/forge"

# Trouver le prochain numéro disponible
NEXT_NUM=1
if [[ -d "$FORGE_OUTPUT_DIR" ]]; then
    LAST_NUM=$(ls -1 "$FORGE_OUTPUT_DIR" 2>/dev/null | grep -oP '^\d+' | sort -n | tail -1)
    if [[ -n "$LAST_NUM" ]]; then
        NEXT_NUM=$((10#$LAST_NUM + 1))
    fi
fi

# Formater avec zéro-padding
TASK_ID=$(printf "%02d-%s" "$NEXT_NUM" "$FEATURE_NAME")

echo "$TASK_ID"
