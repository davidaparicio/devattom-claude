---
name: step-00-init
description: Initialize Forge workflow — parse flags, detect resume, setup state
next_step: ./step-01-research.md
---

# Phase 0: Initialization

## EXECUTION RULES:

- 🛑 NEVER skip flag parsing
- ✅ ALWAYS parse ALL flags before any other action
- 📋 YOU ARE AN INITIALIZER, not an executor
- 🚫 FORBIDDEN to load step-01 until init is complete

## EXECUTION SEQUENCE:

### 1. Parse Flags and Input

**Step 1a: Load defaults**

```yaml
auto_mode: false
save_mode: false
test_mode: false
playwright_mode: false
team_mode: false
branch_mode: false
pr_mode: false
interactive_mode: false
budget: mid
```

**Step 1b: Parse user input and override defaults:**

```
Enable flags (lowercase - turn ON):
  -a or --auto         → {auto_mode} = true
  -s or --save         → {save_mode} = true
  -t or --test         → {test_mode} = true
  -play or --playwright → {playwright_mode} = true
  -w or --team         → {team_mode} = true
  -b or --branch       → {branch_mode} = true
  -pr or --pull-request → {pr_mode} = true, {branch_mode} = true
  -i or --interactive  → {interactive_mode} = true

Disable flags (UPPERCASE - turn OFF):
  -A or --no-auto           → {auto_mode} = false
  -S or --no-save           → {save_mode} = false
  -T or --no-test           → {test_mode} = false
  -PLAY or --no-playwright  → {playwright_mode} = false
  -W or --no-team           → {team_mode} = false
  -B or --no-branch         → {branch_mode} = false
  -PR or --no-pull-request  → {pr_mode} = false
  -I or --no-interactive    → {interactive_mode} = false

Budget:
  --budget low   → {budget} = low
  --budget mid   → {budget} = mid
  --budget high  → {budget} = high

Other:
  -r or --resume → {resume_task} = <next argument>
  Remainder      → {task_description}
```

**Step 1c: Auto-enable save_mode in step-by-step mode:**

```
IF {auto_mode} = false AND {save_mode} = false:
    {save_mode} = true
    (Required for resume between sessions)
```

**Step 1d: Auto-enable test_mode in auto mode:**

```
IF {auto_mode} = true:
    {test_mode} = true
```

**Step 1e: Detect reference files in input:**

```
Scan {task_description} for file path tokens:
1. A token is a file path if:
   - It contains at least one '/'
   - AND ends with a known extension (.md, .txt, .json, .yaml, .yml)
2. If the file exists: {reference_files} = path, remove from {task_description}
3. If {task_description} is now empty: derive description from filename
4. If no file paths detected: {reference_files} = "" (normal mode)
```

**Step 1f: Generate feature_name and task_id:**

```
{feature_name} = kebab-case of description (no number prefix)
Example: "add user authentication" → "add-user-authentication"
```

Generate `{task_id}` now:

```bash
bash {skill_dir}/scripts/generate-task-id.sh "{feature_name}"
```

### 2. Check Resume Mode

<critical>
ONLY execute this section if {resume_task} is set.
Otherwise, skip directly to step 3.
</critical>

**If `{resume_task}` is set:**

**Step 2a: Find matching task folder:**

```bash
ls .claude/output/forge/ | grep "{resume_task}"
```

- **Exact match**: use it
- **Single partial match**: use it
- **Multiple matches**: list and ask user to specify
- **No match**: list available tasks, ask user

**Step 2b: Restore state from `00-context.md`:**

1. Read `{output_dir}/00-context.md`
2. Restore ALL flags from Configuration table
3. Restore task info: `{task_id}`, `{task_description}`, `{feature_name}`, `{branch_name}`
4. Restore `{reference_files}`
5. Restore acceptance criteria

**Step 2c: Apply flag overrides from current command:**

Flags passed with the resume command override stored values.

**Step 2d: Determine resume target step:**

1. Read `next_step` from State Snapshot
2. If `next_step` = `complete`: check for Pending rows (flag overrides). Otherwise → "✓ Workflow already complete."
3. If `next_step` points to a ✓ Complete step: fallback to Progress table
4. ⏳ In Progress = crash → restart that step

**Step 2e: Show resume summary and load target step**

Then load the target step directly. Do NOT continue with fresh init steps 3-5.

### 3. Pre-flight Checks

```bash
# Check task description is not empty
if [[ -z "{task_description}" ]]; then
  echo "Error: No task description provided"
  exit 1
fi

# Warn about uncommitted changes
if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  echo "⚠ Warning: Uncommitted changes detected"
fi
```

### 4. Run Optional Sub-Steps

```
IF {interactive_mode} = true:
  → Load steps/step-00b-interactive.md
  → Return with updated flags

IF {branch_mode} = true:
  → Load steps/step-00b-branch.md
  → Return with {branch_name} set
```

### 5. Create Output Structure (if save_mode)

**If `{save_mode}` = true:**

```bash
bash {skill_dir}/scripts/setup-templates.sh \
  "{task_id}" \
  "{task_description}" \
  "{auto_mode}" \
  "{save_mode}" \
  "{test_mode}" \
  "{playwright_mode}" \
  "{team_mode}" \
  "{branch_mode}" \
  "{pr_mode}" \
  "{interactive_mode}" \
  "{budget}" \
  "{branch_name}" \
  "{original_input}" \
  "{reference_files}"
```

### 6. Mark Init Complete and Proceed

**If `{save_mode}` = true:**

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "00" "init" "complete"
```

Show COMPACT summary:

```
✓ FORGE: {task_description}

| Variable | Value |
|----------|-------|
| `{task_id}` | 01-kebab-name |
| `{budget}` | mid |
| `{auto_mode}` | true/false |
| `{save_mode}` | true/false |
| `{test_mode}` | true/false |
| `{playwright_mode}` | true/false |
| `{team_mode}` | true/false |
| `{branch_mode}` | true/false |
| `{pr_mode}` | true/false |
| `{reference_files}` | path or empty |

→ Researching...
```

<critical>
KEEP OUTPUT MINIMAL:
- One header line with the task
- One table with ALL variables
- One line "→ Researching..." then IMMEDIATELY load step-01
</critical>

**Then proceed directly to step-01-research.md**
