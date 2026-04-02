#!/bin/bash
# uv wrapper — auto-manages venv and dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

cd "$SKILL_DIR" && uv run python "$SCRIPT_DIR/${1:-gemini_analyze.py}" "${@:2}"
