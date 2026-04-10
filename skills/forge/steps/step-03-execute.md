---
name: step-03-execute
description: Plan execution with complexity-based dispatch and systematic docstrings
next_step: ./step-04-test.md
---

# Phase 3: Execute

## RULES:

- 🛑 NEVER deviate from the approved plan
- 🛑 NEVER add features not in the plan
- 🛑 NEVER modify a file without reading it first
- ✅ ALWAYS add docstrings/JSDoc to every function created or modified
- ✅ ALWAYS dispatch to the right sub-agent based on complexity tag
- 📋 YOU ARE AN ORCHESTRATOR

---

## EXECUTION SEQUENCE:

### 1. Init

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "03" "execute" "in_progress"
```

Read `{output_dir}/02-plan.md` to restore the plan.

If `{user_instruction}` is not empty: apply it as an additional constraint during execution.

### 2. Create Todos from Plan

Convert each file in the plan into a todo with its complexity tag:

```
Plan entry:
#### `src/auth/handler.ts` [moderate]
- Add `validateToken`
- Handle expired token error

Becomes:
- [ ] [moderate] src/auth/handler.ts: Add validateToken + docstring
- [ ] [moderate] src/auth/handler.ts: Handle expired token error
```

### 3. Execute File by File

Consult `budget-profiles.md` for dispatch based on `{budget}`.

**3a. `[simple]` tasks → Snipper sub-agent**

```
model: sonnet, effort: low
subagent_type: Snipper
prompt: "Modify {file_path}:
  - {exact change}
  - Add JSDoc/docstring to every modified function
  - Follow pattern from {reference_file}:{line}
  Do NOT add extra features or unrelated comments."
```

Multiple independent simple tasks CAN be launched in parallel.

**3b. `[moderate]` tasks**

Budget `mid`:
```
model: sonnet, effort: high
prompt: "Implement in {file_path}:
  - {detailed description}
  - Add JSDoc/docstring to every created or modified function
  - Patterns: {patterns from research}
  - Read file before modifying."
```

Budget `high`: same but `model: opus, effort: medium`.

**3c. `[complex]` tasks → Main context**

1. Read the target file
2. Understand existing structure
3. Implement per plan
4. Add JSDoc/docstring to every created or modified function

### 4. Docstring Standard

Every function or method created or modified MUST receive:

```typescript
/**
 * [One-line description of what it does]
 * @param paramName - [description]
 * @returns [description]
 * @throws [ErrorType] when [condition] (if applicable)
 */
```

For Python:
```python
def function(param: Type) -> ReturnType:
    """One-line description.

    Args:
        param: Description.

    Returns:
        Description.

    Raises:
        ErrorType: When condition.
    """
```

### 5. Handle Blockers

If an unexpected issue arises: make a reasonable decision, document it in the execution log, and continue.

### 6. Save Output

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "03" "execute" "complete"
```

Append to `{output_dir}/03-execute.md`:
- Files modified (with summaries)
- New files created
- Decisions made

**Then immediately load ./step-04-test.md** — no validation between execute and test.
