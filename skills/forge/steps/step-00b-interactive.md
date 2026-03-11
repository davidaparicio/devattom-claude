---
name: step-00b-interactive
description: Interactively configure Forge workflow flags
returns_to: step-00-init.md
---

# Step 0b: Interactive Configuration

## SEQUENCE:

### 1. Display Current Configuration

```
**Forge Configuration:**

| Flag | Status | Description |
|------|--------|-------------|
| Auto (`-a`) | {auto_mode ? "✓ ON" : "✗ OFF"} | No pauses + unit tests |
| Save (`-s`) | {save_mode ? "✓ ON" : "✗ OFF"} | Save outputs |
| Test (`-t`) | {test_mode ? "✓ ON" : "✗ OFF"} | Unit tests |
| Playwright (`-play`) | {playwright_mode ? "✓ ON" : "✗ OFF"} | Integration tests |
| Team (`-w`) | {team_mode ? "✓ ON" : "✗ OFF"} | Parallel research |
| Branch (`-b`) | {branch_mode ? "✓ ON" : "✗ OFF"} | Git branch |
| PR (`-pr`) | {pr_mode ? "✓ ON" : "✗ OFF"} | Pull request |
| Budget | {budget} | Model allocation |
```

### 2. Ask for Flag Changes

```yaml
questions:
  - header: "Configure"
    question: "Select flags to TOGGLE:"
    options:
      - label: "Auto mode"
        description: "{auto_mode ? 'Disable' : 'Enable'} - no pauses + tests"
      - label: "Test mode"
        description: "{test_mode ? 'Disable' : 'Enable'} - unit tests"
      - label: "Playwright"
        description: "{playwright_mode ? 'Disable' : 'Enable'} - integration tests"
      - label: "Team mode"
        description: "{team_mode ? 'Disable' : 'Enable'} - parallel research"
      - label: "Branch mode"
        description: "{branch_mode ? 'Disable' : 'Enable'} - git branch"
      - label: "PR mode"
        description: "{pr_mode ? 'Disable' : 'Enable'} - create PR"
    multiSelect: true
```

### 3. Ask for Budget

```yaml
questions:
  - header: "Budget"
    question: "Budget level:"
    options:
      - label: "low — Minimum tokens"
        description: "Haiku/Sonnet low. For simple tasks."
      - label: "mid — Balance (default)"
        description: "Sonnet medium/high. Good quality/cost ratio."
      - label: "high — Maximum quality"
        description: "Opus/Sonnet high. Complex features."
    multiSelect: false
```

### 4. Apply and Display

Toggle selected flags. Special rules:
- PR mode enabled → branch mode auto-enabled

Show final configuration and return to step-00-init.md.
