---
name: step-03-execute
description: Plan execution with intelligent dispatch based on complexity and budget
prev_step: ./step-02-plan.md
next_step: ./step-04-test.md
---

# Phase 3: Execute

## RULES:

- 🛑 NEVER deviate from the approved plan
- 🛑 NEVER add features not in the plan (scope creep)
- 🛑 NEVER modify a file without reading it first
- ✅ ALWAYS follow the plan file by file
- ✅ ALWAYS read files BEFORE editing them
- ✅ ALWAYS dispatch to the right sub-agent based on complexity
- 📋 YOU ARE AN ORCHESTRATOR dispatching to sub-agents

## MODEL ALLOCATION:

<critical>
Consult `budget-profiles.md` for dispatch based on `{budget}`:

Each plan task is tagged [simple/moderate/complex].
Dispatch depends on tag AND budget:

**Budget `low`:**
- simple → snipper sub-agent (model: sonnet, effort: low)
- moderate → main context (Sonnet low)
- complex → main context (Sonnet low)

**Budget `mid`:**
- simple → snipper sub-agent (model: sonnet, effort: low)
- moderate → file-writer sub-agent (model: sonnet, effort: high)
- complex → main context (Sonnet high effort)

**Budget `high`:**
- simple → snipper sub-agent (model: sonnet, effort: low)
- moderate → file-writer sub-agent (model: opus, effort: medium)
- complex → main context (Opus high effort)
</critical>

## CONTEXT RESTORATION (resume mode):

<critical>
If loaded via resume:
1. Read `{output_dir}/00-context.md` → flags, task info
2. Read `{output_dir}/02-plan.md` → the plan
3. `git diff --name-only` to detect partial work
4. Cross-reference with plan → skip already-completed items
</critical>

---

## SEQUENCE:

### 1. Init Save (if save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "03" "execute" "in_progress"
```

### 2. Git Checkpoint (safety net)

```bash
git add -u && git commit --allow-empty -m "forge: checkpoint before execute ({task_id})"
```

### 3. Create Todos from Plan

Convert each plan change into a todo with its complexity tag:

```
Plan entry:
#### `src/auth/handler.ts` [moderate]
- Add `validateToken`
- Handle expired token error

Becomes:
- [ ] [moderate] src/auth/handler.ts: Add validateToken
- [ ] [moderate] src/auth/handler.ts: Handle expired token error
```

### 4. Execute File by File

For each todo, dispatch based on complexity:

**4a. `[simple]` tasks → Snipper sub-agent**

Launch an Agent with:
```
model: sonnet
subagent_type: Snipper
prompt: "Modify {file_path}:
  - {exact change description}
  - Follow pattern from {reference_file}:{line}
  Do NOT add comments or extra features."
```

Multiple independent simple tasks CAN be launched in parallel.

**4b. `[moderate]` tasks → File-writer sub-agent OR main context**

In budget `mid`/`high`, launch an Agent with:
```
model: sonnet (mid) or opus (high)
prompt: "Implement in {file_path}:
  - {detailed description}
  - Patterns to follow: {patterns from research}
  - Read file before modifying.
  Do NOT add out-of-scope features."
```

In budget `low`, execute directly in main context.

**4c. `[complex]` tasks → Main context**

Always execute in main context:
1. Read the target file
2. Understand existing structure
3. Implement per plan
4. Follow patterns documented in phase 1

### 5. Handle Blockers

**If `{auto_mode}` = true:** make reasonable decision and continue
**Otherwise:** use AskUserQuestion

### 6. Quick Verification

```bash
# Quick check — full lint/typecheck is in phase 4
git diff --stat
```

### 7. Implementation Summary

```
**Implementation Complete**

**Files modified:**
- `src/auth/handler.ts` — added validateToken, error handling
- `src/api/auth/route.ts` — integrated token validation

**New files:**
- `src/types/auth.ts` — type definitions

**Todos:** {X}/{Y} completed
**Sub-agents used:** {count} snipper, {count} file-writer
```

### 8. Save Output (if save_mode)

Append to `{output_dir}/03-execute.md`.

---

## NEXT STEP:

<critical>
NO session boundary here — execution chains directly to tests.
</critical>

```
→ If {branch_mode} = true, commit:
  git add -u && git diff --cached --quiet || git commit -m "forge({task_id}): phase 03 - execute"

→ If save_mode = true:
  bash {skill_dir}/scripts/update-progress.sh "{task_id}" "03" "execute" "complete"

→ Load ./step-04-test.md directly
```
