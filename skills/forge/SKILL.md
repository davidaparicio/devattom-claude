---
name: forge
description: Structured 5-phase implementation workflow (Research-Plan-Execute-Test-Document) with advisor-first token optimization. Uses Sonnet as executor and Opus advisor for scoping and architecture decisions.
argument-hint: "[--budget high] [-w] [--doc] <task description>"
---

<objective>
Execute structured implementation workflows with optimized token consumption. Forge uses Sonnet as executor and consults Opus advisor at key decision points: research scoping and architecture choices.
</objective>

<quick_start>
**Default (mid budget):**

```bash
/forge add authentication middleware
# → Research → validate → Plan → validate → Execute → Test → validate → done
```

**High budget (complex feature):**

```bash
/forge --budget high implement payment system
```

**With parallel research:**

```bash
/forge -w implement dashboard
```

**With external documentation:**

```bash
/forge --doc add authentication middleware
```

**Flags:**

- `--budget high`: Opus advisor with more usages, Opus for complex tasks (default: mid)
- `-w` / `--team`: Parallel codebase exploration during research
- `--doc`: Generate external documentation (Mermaid diagrams, markdown, README updates)
</quick_start>

<parameters>

<flags>
| Flag | Description |
|------|-------------|
| `--budget high` | High budget: Opus advisor max 4 uses, Opus for moderate/complex tasks |
| `-w` / `--team` | Parallel agents on research phase |
| `--doc` | Enable external documentation phase |
</flags>

<examples>
```bash
# Standard feature
/forge add user authentication

# Complex feature
/forge --budget high implement payment gateway

# Parallel research
/forge -w implement real-time notifications

# With external documentation
/forge --doc add REST API endpoints

# Complex with all options
/forge --budget high -w --doc refactor data pipeline
```
</examples>

<parsing_rules>
1. Defaults: `budget=mid`, `team_mode=false`, `doc_mode=false`
2. `--budget high` → `{budget}=high`
3. `-w` or `--team` → `{team_mode}=true`
4. `--doc` → `{doc_mode}=true`
5. Remainder after flags → `{task_description}`
6. Task ID: `bash {skill_dir}/scripts/generate-task-id.sh "{feature_name}"`
</parsing_rules>

</parameters>

<output_structure>
Outputs always saved in the PROJECT directory and cleaned up at end:

```
.claude/output/forge/{task-id}/
├── 00-context.md     # Configuration, progress, state
├── 01-research.md    # Research findings
├── 02-plan.md        # Implementation plan
├── 03-execute.md     # Execution log
├── 04-test.md        # Test results
└── 05-document.md    # External docs (only if --doc)
```
</output_structure>

<workflow>
**Flow:**

```
Init → Research → [validate] → Plan → [validate] → Execute → Test → [validate] → (Document if --doc) → End
```

**Validation prompt after Research, Plan, and Test:**

```
✓ Phase [X] complete
  → File: .claude/output/forge/{task-id}/0X-phase.md

Review and edit the file if needed.
Type "continue" to proceed to Phase [X+1], or type an instruction to add context for the next phase.
```

Execute chains directly into Test — no validation between them.
</workflow>

<state_variables>

| Variable | Type | Description |
|----------|------|-------------|
| `{task_description}` | string | What to implement |
| `{feature_name}` | string | Kebab-case name without number |
| `{task_id}` | string | Full identifier (e.g., `01-add-auth`) |
| `{acceptance_criteria}` | list | Success criteria inferred during research |
| `{team_mode}` | boolean | Parallel research agents |
| `{doc_mode}` | boolean | Enable documentation phase |
| `{budget}` | string | mid / high |
| `{output_dir}` | string | Path to output folder |
| `{reference_files}` | string | Path to reference document (optional) |
| `{advisor_uses_remaining}` | int | Remaining Opus advisor calls (2 or 4) |
| `{user_instruction}` | string | Instruction injected at validation (may be empty) |

</state_variables>

<entry_point>

**FIRST ACTION:** Load `steps/step-00-init.md`

</entry_point>

<step_files>

| Step | File | Purpose |
|------|------|---------|
| 00 | `steps/step-00-init.md` | Parse flags, create output folder, initialize state |
| 01 | `steps/step-01-research.md` | Advisor-first scoped research + find-docs + find-skills |
| 02 | `steps/step-02-plan.md` | File-by-file planning with Opus advisor on architecture |
| 03 | `steps/step-03-execute.md` | Plan execution with complexity-based dispatch |
| 04 | `steps/step-04-test.md` | Run tests via project forge.json config |
| 05 | `steps/step-05-document.md` | External documentation only (if --doc) |

</step_files>

<execution_rules>

- **Load one step at a time** — only the current step is in memory
- **Persist state variables** across all phases
- **Opus advisor budget** is shared across research and plan phases
- **Always write output files** — every phase deposits its file before validation
- **Model allocation** — consult `budget-profiles.md` for each phase

</execution_rules>
```
