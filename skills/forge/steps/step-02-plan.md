---
name: step-02-plan
description: File-by-file planning with Opus advisor on non-trivial architecture decisions
next_step: ./step-03-execute.md
---

# Phase 2: Plan

## RULES:

- 🛑 NEVER implement — that is phase 3
- 🛑 NEVER write or modify code
- ✅ ALWAYS structure the plan by FILE
- ✅ ALWAYS tag each file with complexity: [simple/moderate/complex]
- ✅ ALWAYS map acceptance criteria to changes
- 🚫 FORBIDDEN to use Edit, Write, or Bash tools

---

## EXECUTION SEQUENCE:

### 1. Init

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "02" "plan" "in_progress"
```

Read `{output_dir}/01-research.md` to restore research findings.

If `{user_instruction}` is not empty: incorporate it into the planning approach.

### 2. Design Strategy

Mental simulation:
- Walk through the implementation step by step
- Identify ALL files to modify or create
- Determine logical dependency order
- Consider edge cases

### 3. Consult Opus Advisor on Architecture (optional, 1 use)

If a non-trivial architectural decision arises (e.g., where to locate a new abstraction, how to split responsibilities, which pattern fits best):

Check `{advisor_uses_remaining}`. If > 0: decrement by 1 and consult Opus:

```
I am planning: {task_description}

Research context: [brief summary from 01-research.md]

I face this architectural decision:
[describe the two or three options]

Which approach is most coherent with the existing patterns?
```

Use Opus's answer to finalize the plan. If `{advisor_uses_remaining}` = 0: make the best decision and document the reasoning.

### 4. Write the Plan

Structure by FILE. Each file tagged with complexity:

```markdown
## Implementation Plan: {task_description}

### Overview
[1-2 sentences: strategy and approach]

### Prerequisites
- [ ] Prerequisite (if any)

---

### File Changes

#### `src/path/file1.ts` [moderate]
- Add `functionName` that handles X
- Handle error case: [specific scenario]

#### `src/path/file2.ts` [simple]
- Update imports
- Call `functionName` in existing flow at line ~42

#### `src/path/file3.ts` (NEW FILE) [complex]
- Create utility for Z
- Export: `utilityFunction`, `HelperType`

---

### Testing Strategy
**New tests:**
- `src/path/file1.test.ts` — test functionName with [specific scenarios]
**Existing tests to verify:**
- `src/path/existing.test.ts` — should still pass after changes

---

### Acceptance Criteria Mapping
- [ ] AC1: Satisfied by `file1.ts`
- [ ] AC2: Satisfied by `file2.ts`
```

The complexity tag `[simple/moderate/complex]` is MANDATORY — it determines which sub-agent executes the task in phase 3.

### 5. Save and Validate

Append plan to `{output_dir}/02-plan.md`.

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "02" "plan" "complete"
```

Display validation prompt:

```
✓ Plan complete
  → File: {output_dir}/02-plan.md

Review and edit the file if needed.
Type "continue" to proceed to Execute, or type an instruction to add context for the Execute phase.
```

Store any user instruction in `{user_instruction}` (empty if user typed "continue").

**STOP and wait for user input. Then load ./step-03-execute.md.**
