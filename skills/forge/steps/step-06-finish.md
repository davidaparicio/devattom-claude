---
name: step-06-finish
description: Finalization — create PR and summarize workflow
prev_step: ./step-05-document.md
---

# Phase 6: Finish

## RULES:

- ✅ Push the branch to remote
- ✅ Create the PR with a complete summary
- ✅ Include workflow summary in the description

## CONTEXT RESTORATION (resume mode):

<critical>
If loaded via resume:
1. Read `{output_dir}/00-context.md` → task info, branch_name
</critical>

---

## SEQUENCE:

### 1. Init Save (if save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "06" "finish" "in_progress"
```

### 2. Commit Remaining Changes

```bash
git add -u && git diff --cached --quiet || git commit -m "forge({task_id}): finalization"
```

### 3. Push the Branch

```bash
git push -u origin {branch_name}
```

### 4. Create the PR

Use `gh pr create` with a structured summary:

```bash
gh pr create --title "{short title based on task_description}" --body "$(cat <<'EOF'
## Summary

{1-3 bullet point summary of changes}

## Changes

**Modified files:**
{list of files with change summary}

**New files:**
{list of new files}

## Tests

- **Linting:** ✓
- **Typecheck:** ✓
- **Unit tests:** {✓/✗/skipped}
- **Playwright:** {✓/✗/skipped}

## Documentation

{Summary of documentation added}

---

🔨 Generated with [Forge](https://github.com) — token-efficient workflow
Budget: {budget} | Phases: 5/5
EOF
)"
```

### 5. Final Summary

```
═══════════════════════════════════════
  FORGE COMPLETE: {task_description}
═══════════════════════════════════════
  Budget: {budget}
  Phases completed: 5/5 + PR
  PR: {pr_url}
  Branch: {branch_name}
═══════════════════════════════════════
```

### 6. Save Output (if save_mode)

Append to `{output_dir}/06-finish.md`.

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "06" "finish" "complete"
```

Update state snapshot: `next_step: complete`
