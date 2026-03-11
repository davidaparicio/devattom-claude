---
name: forge
description: Token-efficient workflow in 5 phases (Research-Plan-Execute-Test-Document) with intelligent model allocation by budget. Optimized for Pro subscriptions.
argument-hint: "[-a] [-s] [-t] [-b] [-pr] [-play] [-w] [-i] [--budget low|mid|high] [-r <task-id>] <task description>"
---

<objective>
Execute structured implementation workflows with optimized token consumption. Forge uses a budget system (low/mid/high) to allocate the right model and effort level to each phase.
</objective>

<quick_start>
**Step-by-step mode (default):** Pauses after research and plan. Resume with `/forge -r`.

```bash
/forge add authentication middleware
# → Phase 1 (research) → pause
# → /forge -r 01-add-authentication-middleware
# → Phase 2 (plan) → pause
# → /forge -r 01-add-authentication-middleware
# → Phases 3-4-5 chain automatically
```

**Autonomous mode:** Everything chains without pause.

```bash
/forge -a implement user registration
```

**With tests and PR:**

```bash
/forge -a -t -pr add login page
```

**High budget (complex feature):**

```bash
/forge -a --budget high implement payment system
```

**Flags:**

- `-a` (auto): No pauses + enables unit tests
- `-t` (test): Create and run unit tests
- `-play` (playwright): Integration tests via MCP Playwright
- `-s` (save): Save outputs (auto-enabled in step-by-step mode)
- `-b` (branch): Verify/create git branch
- `-pr` (pull-request): Create PR at the end
- `-w` (team): Parallel agents on research phase
- `--budget`: Model allocation (low/mid/high, default: mid)

See `<parameters>` for the full list.
</quick_start>

<parameters>

<flags>
**Enable flags:**
| Short | Long | Description |
|-------|------|-------------|
| `-a` | `--auto` | Autonomous mode: no pauses, enables unit tests |
| `-s` | `--save` | Save outputs to `.claude/output/forge/` |
| `-t` | `--test` | Create and run unit tests |
| `-play` | `--playwright` | Integration tests via MCP Playwright |
| `-w` | `--team` | Parallel agents on research phase |
| `-r` | `--resume` | Resume a previous task |
| `-b` | `--branch` | Verify/create git branch |
| `-pr` | `--pull-request` | Create PR at the end (enables `-b`) |
| `-i` | `--interactive` | Interactive flag configuration |

**Disable flags:**
| Short | Long | Description |
|-------|------|-------------|
| `-A` | `--no-auto` | Disable auto mode |
| `-S` | `--no-save` | Disable save mode |
| `-T` | `--no-test` | Disable unit tests |
| `-PLAY` | `--no-playwright` | Disable Playwright |
| `-W` | `--no-team` | Disable team mode |
| `-B` | `--no-branch` | Disable branch mode |
| `-PR` | `--no-pull-request` | Disable PR creation |
| `-I` | `--no-interactive` | Disable interactive mode |

**Budget:**
| Flag | Description |
|------|-------------|
| `--budget low` | Haiku/Sonnet low — simple tasks, minimum tokens |
| `--budget mid` | Sonnet medium/high — quality/cost balance (default) |
| `--budget high` | Opus/Sonnet high — complex and critical features |
</flags>

<examples>
```bash
# Basic
/forge add auth middleware

# Autonomous (chains everything, unit tests included)
/forge -a add auth middleware

# With PR
/forge -a -pr add auth middleware

# High budget for complex feature
/forge -a --budget high implement payment system

# Playwright integration tests
/forge -a -play add checkout flow

# Parallel research (team)
/forge -w -a implement dashboard

# Resume a task
/forge -r 01-auth-middleware
/forge -r 01  # Partial match

# Resume with flag override
/forge -a -r 01

# Interactive configuration
/forge -i add auth middleware

# Minimal budget
/forge --budget low fix typo in header
```
</examples>

<parsing_rules>
**Flag parsing:**

1. Defaults loaded from `steps/step-00-init.md` `<defaults>` section
2. CLI flags override defaults (enable lowercase, disable UPPERCASE)
3. Flags removed from input, remainder = `{task_description}`
4. Task ID generated as `NN-kebab-case-description`

Detailed algorithm in `steps/step-00-init.md`.
</parsing_rules>

</parameters>

<output_structure>
**When `{save_mode}` = true:**

Outputs saved in the PROJECT directory:
```
.claude/output/forge/{task-id}/
├── 00-context.md       # Configuration, progress, state
├── 01-research.md      # Research findings
├── 02-plan.md          # Implementation plan
├── 03-execute.md       # Execution log
├── 04-test.md          # Test results
├── 05-document.md      # Generated documentation
└── 06-finish.md        # PR details (if -pr)
```
</output_structure>

<resume_workflow>
**Resume mode (`-r {task-id}`):**

1. **Find folder:** `ls .claude/output/forge/ | grep {resume_task}`
2. **Restore state:** Read `00-context.md` → flags, task info, acceptance criteria
3. **Apply overrides:** Flags passed with `-r` override stored values
4. **Find target:** Read `next_step` from State Snapshot
5. **Load target step**

Supports partial matching (e.g., `-r 01` finds `01-add-auth-middleware`).
</resume_workflow>

<workflow>
**Standard flow:**
1. Parse flags and description
2. If `-r`: restore state and load target step
3. If `-s`: create output folder and 00-context.md
4. Phase 1 — Research (step-01-research.md) → **PAUSE**
5. Phase 2 — Plan (step-02-plan.md) → **PAUSE**
6. Phase 3 — Execute (step-03-execute.md) → chains
7. Phase 4 — Test (step-04-test.md) → chains
8. Phase 5 — Document (step-05-document.md) → chains
9. If `-pr`: Finish (step-06-finish.md)

**Sessions:**
- `auto_mode=false` (default): Pause after research and after plan. Phases 3-4-5 chain.
- `auto_mode=true` (`-a`): Everything chains without pause.
</workflow>

<state_variables>
**Persisted across all phases:**

| Variable | Type | Description |
|----------|------|-------------|
| `{task_description}` | string | What to implement |
| `{feature_name}` | string | Kebab-case name without number |
| `{task_id}` | string | Full identifier (e.g., `01-add-auth`) |
| `{acceptance_criteria}` | list | Success criteria |
| `{auto_mode}` | boolean | No pauses, enables unit tests |
| `{save_mode}` | boolean | Save outputs |
| `{test_mode}` | boolean | Create unit tests |
| `{playwright_mode}` | boolean | Playwright integration tests |
| `{team_mode}` | boolean | Parallel agents on research |
| `{branch_mode}` | boolean | Verify/create git branch |
| `{pr_mode}` | boolean | Create PR at the end |
| `{interactive_mode}` | boolean | Interactive config |
| `{budget}` | string | low / mid / high |
| `{next_step}` | string | Next phase to execute |
| `{reference_files}` | string | Path to reference document |
| `{resume_task}` | string | Task ID to resume |
| `{output_dir}` | string | Path to output folder |
| `{branch_name}` | string | Created branch name |
</state_variables>

<entry_point>

**FIRST ACTION:** Load `steps/step-00-init.md`

Step 00 handles:
- Flag parsing
- Resume mode detection
- Output folder creation (if save_mode)
- State variable initialization

After initialization, step-00 loads step-01-research.md.

</entry_point>

<step_files>
**Progressive loading — one step at a time:**

| Step | File | Purpose |
|------|------|---------|
| 00 | `steps/step-00-init.md` | Parse flags, create output, initialize state |
| 00b | `steps/step-00b-branch.md` | Branch verification/creation (if branch_mode) |
| 00b | `steps/step-00b-interactive.md` | Interactive config (if interactive_mode) |
| 01 | `steps/step-01-research.md` | Contextual research with ultra think |
| 01b | `steps/step-01b-team-research.md` | Parallel research (if team_mode) |
| 02 | `steps/step-02-plan.md` | File-by-file planning |
| 03 | `steps/step-03-execute.md` | Plan execution with intelligent dispatch |
| 04 | `steps/step-04-test.md` | Linting + typecheck + unit/integration tests |
| 05 | `steps/step-05-document.md` | Documentation (docstrings + markdown in high) |
| 06 | `steps/step-06-finish.md` | PR creation (if pr_mode) |
</step_files>

<execution_rules>

- **Load one step at a time** — only the current step is in memory
- **ULTRA THINK** during research phase (most important phase)
- **Persist state variables** across all phases
- **Follow next_step directive** at the end of each step
- **Save outputs** if `{save_mode}` = true
- **Model allocation by budget** — consult `budget-profiles.md` for each phase
- **Session boundary:** 2 pauses (after research and after plan) except in auto_mode
- **Per-step commits:** When `branch_mode=true`, code phases (03, 04) auto-commit
- **Specialized sub-agents:** Dispatch to the right model based on task complexity

</execution_rules>

<success_criteria>

- Each phase loaded progressively
- Model allocation respected per budget
- Linting/typecheck tests passing
- Unit tests passing (if enabled)
- Playwright tests passing (if enabled)
- Documentation generated
- Outputs saved (if save_mode)

</success_criteria>
