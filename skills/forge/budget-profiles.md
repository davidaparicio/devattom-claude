# Forge — Budget Profiles

Reference for model/effort allocation per budget level.

## Profile `low` — Simple tasks (small fix, rename)

| Phase | Model | Effort | Agents |
|-------|-------|--------|--------|
| Research | Haiku | - | 1 solo agent |
| Plan | Haiku | low | - |
| Execute | Sonnet | low | snipper only |
| Test | Haiku | - | run + parse |
| Document | Haiku | - | basic docstrings |

**Max retries:** 1
**Research parallelism:** no

## Profile `mid` (default) — Standard features

| Phase | Model | Effort | Agents |
|-------|-------|--------|--------|
| Research | Haiku | - | 2-3 parallel agents |
| Plan | Sonnet | medium | - |
| Execute | Sonnet | high | snipper + file-writer |
| Test | Haiku run + Sonnet analysis | medium | - |
| Document | Sonnet | low | docstrings + update existing docs |

**Max retries:** 3
**Research parallelism:** yes (if `-w`)

## Profile `high` — Complex and critical features

| Phase | Model | Effort | Agents |
|-------|-------|--------|--------|
| Research | Sonnet | - | 3-5 parallel agents + ultra think |
| Plan | Opus | medium | - |
| Execute | Opus | high | all available sub-agents |
| Test | Haiku run + Opus analysis | high | - |
| Document | Sonnet | medium | docstrings + markdown + Mermaid diagrams |

**Max retries:** 5
**Research parallelism:** yes (if `-w`)

## Available Sub-Agents

| Agent | Model | Role | Phases |
|-------|-------|------|--------|
| `explorer-codebase` | Haiku | Find files, return paths + signatures | Research |
| `explorer-docs` | Haiku | Search docs, return condensed summary | Research |
| `summarizer` | Haiku | Condense files into structured summaries | Research |
| `snipper` | Sonnet (low) | Simple modifications (rename, imports) | Execute |
| `file-writer` | Sonnet (medium-high) | Create files from spec | Execute |
| `test-runner` | Haiku | Run commands, parse errors | Test |
| `error-analyzer` | Sonnet | Diagnose errors, propose targeted fixes | Test |
| `doc-writer` | Sonnet | Write documentation from brief | Document |

## Execution Dispatch by Task Complexity

Each plan task is tagged with a complexity that determines the sub-agent:

| Complexity tag | `low` | `mid` | `high` |
|----------------|-------|-------|--------|
| `simple` | snipper (Sonnet low) | snipper (Sonnet low) | snipper (Sonnet low) |
| `moderate` | Sonnet low | Sonnet high | Opus medium |
| `complex` | Sonnet low | Sonnet high | Opus high |
