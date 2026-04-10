---
name: step-04-test
description: Run tests via project forge.json config — regression check, new tests, re-run
next_step: ./step-05-document.md
---

# Phase 4: Test

## RULES:

- ✅ ALWAYS run existing tests first (regression check)
- ✅ ALWAYS write new tests for modified/created functions
- ✅ ALWAYS re-run tests after writing new ones
- ✅ Lint/typecheck is handled by project PostToolUse hooks — do NOT run it manually
- 🛑 NEVER skip the regression check

---

## EXECUTION SEQUENCE:

### 1. Init

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "04" "test" "in_progress"
```

Read `{output_dir}/03-execute.md` to know which files were modified.

### 2. Read Test Command

```bash
cat .claude/forge.json 2>/dev/null || echo "{}"
```

Extract the `test` key. If the file does not exist or the key is absent:

```
⚠ No test command configured.
  Create .claude/forge.json with: { "test": "<your test command>" }
  Skipping test phase.
```

Then skip to step 6.

### 3. Regression Check — Run Existing Tests

Run the test command from forge.json:

```bash
{test_command} 2>&1
```

Parse output: tests passed / failed / errors.

**If tests fail:**
→ Go to the fix loop (step 5).

**If tests pass:**
→ Continue to step 4.

### 4. Write New Tests

Launch a sub-agent (Sonnet) to write tests for functions created or modified in phase 3:

```
Write tests for the following functions:
{list of created/modified functions with file paths and signatures}

Follow existing test patterns found in: {test patterns from research}
Framework: {detected framework}
Cover: happy path, edge cases, error cases.
```

### 5. Re-run Tests After Writing New Ones

```bash
{test_command} 2>&1
```

Parse output.

**If tests fail:** → Fix loop.

**If tests pass:** → Continue to step 6.

### Fix Loop

Max retries: `mid` = 3, `high` = 5.

For each retry:

**a. Analyze errors** — launch error-analyzer sub-agent (Sonnet):
```
Analyze these test failures and propose targeted fixes:
{structured errors}

Return for each error:
- File and line
- Probable cause
- Exact fix (diff format)
```

**b. Apply fixes** via Edit/Write.

**c. Re-run** `{test_command}`.

If still failing after max retries:
```
⚠ Tests failed after {max} attempts.
Remaining failures:
{error list}
```
Continue and document the failures.

### 6. Save and Validate

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "04" "test" "complete"
```

Append to `{output_dir}/04-test.md`:
- Test command used
- Regression results
- New tests written
- Final results

Display validation prompt:

```
✓ Test phase complete
  → File: {output_dir}/04-test.md

Review and edit the file if needed.
[Enter]                   Continue to next phase
[Instruction + Enter]     Add an instruction for the next phase
```

Store any user instruction in `{user_instruction}`.

**STOP and wait for user input.**

Then:
- If `{doc_mode}` = true → load `./step-05-document.md`
- If `{doc_mode}` = false → display final summary and clean up:

```
═══════════════════════════════════════
  FORGE COMPLETE: {task_description}
═══════════════════════════════════════
  Budget: {budget}
  Advisor uses remaining: {advisor_uses_remaining}
  Phases completed: 4/4
  Files modified: {count}
  Tests: ✓/✗
═══════════════════════════════════════
```

```bash
rm -rf {output_dir}
```
