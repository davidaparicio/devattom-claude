---
name: step-01-research
description: Advisor-first scoped research — scan, consult Opus, explore only what matters
next_step: ./step-02-plan.md
---

# Phase 1: Research

## RULES:

- 🛑 NEVER plan or design — that is phase 2
- 🛑 NEVER read full file contents during the scan — paths and signatures only
- ✅ ALWAYS consult Opus advisor before deep exploration
- ✅ ALWAYS check for relevant skills via find-skills
- 📋 YOU ARE AN EXPLORER, not a planner

---

## EXECUTION SEQUENCE:

### 1. Init

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "01" "research" "in_progress"
```

If `{reference_files}` is not empty: read the reference file first and extract objective, constraints, and design decisions.

### 2. Rapid Scan (Sonnet — paths and signatures only)

Run these in parallel:

**2a. Codebase scan** — use Glob and Grep only. Return:
- File paths matching the domain of the task
- Function/class signatures relevant to the task
- Patterns observed (frameworks, naming conventions)
- Do NOT read file contents at this stage

**2b. Skills discovery** — run:
```bash
npx skills find <domain-keywords-from-task>
```
Return: any installed or available skills relevant to the task.

### 3. Consult Opus Advisor (1 use)

Decrement `{advisor_uses_remaining}` by 1.

Submit to Opus advisor:

```
Task: {task_description}

Rapid scan findings:
[paste Glob/Grep results — file paths and signatures]

Available skills found:
[paste skills discovery results]

Questions:
1. Which of these files are actually relevant? List only the ones worth reading.
2. Are there external libraries involved that need documentation lookup via find-docs?
3. Is a web search useful for this task? If so, what specific query?
4. Should any of the found skills be invoked during execution?
```

Opus responds with a short scoping decision (~400-600 tokens). Use this response to drive all subsequent exploration.

### 4. Targeted Exploration (Sonnet)

Execute only what Opus prescribed. If `{team_mode}` = true, run these in parallel:

**4a. Read relevant files** — only the files Opus identified. Return content summaries (not full dumps).

**4b. find-docs** (if Opus flagged libraries) — invoke the `find-docs` skill for each library:
```bash
npx ctx7@latest library <library-name> "<task-specific query>"
npx ctx7@latest docs <library-id> "<task-specific query>"
```

**4c. Web search** (if Opus flagged it) — run a focused web search with the query Opus suggested.

### 5. Synthesize Findings

Write a structured summary:

```markdown
## Task Requirements

### Objective
{2-3 sentence description}

### Key Specifications
- {specific technical requirement}
- {integration points}

## Codebase Context

### Files to Modify / Create
| File | Lines | Contains |
|------|-------|----------|
| `src/auth/login.ts` | 1-150 | Existing login implementation |

### Patterns Observed
- **Route pattern**: Uses Next.js App Router
- **Validation**: Zod schemas in `schemas/`

### Available Utilities
- `src/lib/auth.ts` — JWT functions

### Skills Available
- {skill name} — {relevance to task}

### External Documentation
- {library}: {key APIs and patterns found}
```

### 6. Infer Acceptance Criteria

```markdown
## Acceptance Criteria

- [ ] AC1: [specific measurable outcome]
- [ ] AC2: [specific measurable outcome]
```

Update `{output_dir}/00-context.md` with the acceptance criteria.

### 7. Save and Validate

Append findings to `{output_dir}/01-research.md`.

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "01" "research" "complete"
```

Display validation prompt:

```
✓ Research complete
  → File: {output_dir}/01-research.md

Review and edit the file if needed.
Type "continue" to proceed to Plan, or type an instruction to add context for the Plan phase.
```

Store any user instruction in `{user_instruction}` (empty if user typed "continue").

**STOP and wait for user input. Then load ./step-02-plan.md.**
