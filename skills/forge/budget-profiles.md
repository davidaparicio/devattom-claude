# Forge — Budget Profiles

## Profile `mid` (default) — Standard features

| Phase | Model | Notes |
|-------|-------|-------|
| Research | Sonnet | Glob/Grep scan, then Opus advisor scopes what to explore |
| Plan | Sonnet | Opus advisor consulted on architecture decisions |
| Opus advisor total | Opus | **max 2 uses** shared across research + plan |
| Execute `simple` | Sonnet low | Snipper sub-agent |
| Execute `moderate` | Sonnet high | Sub-agent or main context |
| Execute `complex` | Sonnet high | Main context |
| Test error-analyzer | Sonnet | Max 3 retries |
| Document | Sonnet low | External docs only (if --doc) |

## Profile `high` — Complex and critical features

| Phase | Model | Notes |
|-------|-------|-------|
| Research | Sonnet | Glob/Grep scan, then Opus advisor scopes what to explore |
| Plan | Sonnet | Opus advisor consulted on architecture decisions |
| Opus advisor total | Opus | **max 4 uses** shared across research + plan |
| Execute `simple` | Sonnet low | Snipper sub-agent |
| Execute `moderate` | Opus medium | Sub-agent |
| Execute `complex` | Opus high | Main context |
| Test error-analyzer | Sonnet | Max 5 retries |
| Document | Sonnet medium | External docs only (if --doc) |

## Advisor Tool

The advisor tool uses the Anthropic beta header `advisor-tool-2026-03-01`.

Tool configuration in API requests:

```json
{
  "type": "advisor_20260301",
  "name": "advisor",
  "model": "claude-opus-4-6",
  "max_uses": 2
}
```

Set `max_uses` to 2 for `mid`, 4 for `high`. The budget is shared across both research and plan phases — track remaining uses in `{advisor_uses_remaining}`.

Opus advisor is used at exactly two decision points:
1. **End of research scan** — Sonnet submits findings, Opus defines exact scope and decides if find-docs or web search is needed
2. **During planning** — when Sonnet encounters a non-trivial architectural choice

## Complexity Dispatch Table

| Tag | `mid` | `high` |
|-----|-------|--------|
| `simple` | Snipper (Sonnet low) | Snipper (Sonnet low) |
| `moderate` | Sonnet high | Opus medium |
| `complex` | Sonnet high | Opus high |
