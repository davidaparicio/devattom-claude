---
name: step-00b-branch
description: Verify and setup git branch for Forge workflow
returns_to: step-00-init.md
---

# Step 0b: Branch Setup

## RULES:

- 🛑 NEVER commit directly to main/master when branch_mode enabled
- ✅ ALWAYS check current branch first
- ✅ ALWAYS store {branch_name} before returning

## SEQUENCE:

### 1. Check Current Branch

```bash
git branch --show-current
```

### 2. Evaluate

**If `main` or `master`:** → create a branch
**Otherwise:** → `{branch_name}` = current branch, return

### 3. Create Feature Branch

**If `{auto_mode}` = true:**
→ Auto-create: `feat/{task_id}`

**If `{auto_mode}` = false:**
```yaml
questions:
  - header: "Branch"
    question: "You're on {current_branch}. Create a new branch for this task?"
    options:
      - label: "Create feat/{task_id} (Recommended)"
        description: "Create and switch to new branch"
      - label: "Custom branch name"
        description: "Specify a custom branch name"
      - label: "Stay on {current_branch}"
        description: "Continue without creating a branch"
    multiSelect: false
```

### 4. Execute

```bash
git checkout -b feat/{task_id}
```

→ `{branch_name}` = `feat/{task_id}`

### 5. Return

→ Return to step-00-init.md with `{branch_name}` set
