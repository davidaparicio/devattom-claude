---
name: step-04-test
description: Testing — linting, typecheck, unit tests, Playwright integration tests
prev_step: ./step-03-execute.md
next_step: ./step-05-document.md
---

# Phase 4: Test

## RULES:

- ✅ ALWAYS run linting + typecheck (regardless of flags)
- ✅ Unit tests IF `-t` or `-a` enabled
- ✅ Playwright tests IF `-play` enabled
- ✅ Retry loop based on budget
- 🛑 NEVER ignore lint/typecheck errors

## MODEL ALLOCATION:

<critical>
Consult `budget-profiles.md`:
- Runner (linting/typecheck/tests): always Haiku (test-runner sub-agent)
- Error analysis: Sonnet (mid) or Opus (high)
- Max retries: low=1, mid=3, high=5
</critical>

## CONTEXT RESTORATION (resume mode):

<critical>
If loaded via resume:
1. Read `{output_dir}/00-context.md` → flags
2. Read `{output_dir}/03-execute.md` → what was implemented
</critical>

---

## SEQUENCE:

### 1. Init Save (if save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "04" "test" "in_progress"
```

### 2. Linting and Typecheck (ALWAYS)

Launch a test-runner sub-agent (model: haiku):

```
Run these commands and return ONLY errors:
1. Detect package manager (look for pnpm-lock.yaml, yarn.lock, bun.lockb, package-lock.json)
2. Run linting: {pm} run lint 2>&1 || true
3. Run typecheck: {pm} run typecheck 2>&1 || true
4. Parse output and return ONLY structured errors:
   - File, line, error message
   - Total error count
If everything passes: return "✓ 0 errors"
```

**If errors found:** → go to step 4 (fix loop)

**If all passes:** → continue to step 3 (unit tests)

### 3. Unit Tests (if test_mode or auto_mode)

**If `{test_mode}` = false AND `{auto_mode}` = false:** skip to step 5

**3a. Check existing tests**

Launch a sub-agent (model: haiku, subagent_type: Explore):
```
Find test files related to the modified files:
{list of files modified in phase 3}
Return: existing test paths, framework used, patterns.
```

**3b. Create missing tests**

Launch a sub-agent (model: sonnet):
```
Create tests for modified/created functions:
{summary of phase 3 changes}
Follow existing test patterns: {patterns found in 3a}
Framework: {detected framework}
```

**3c. Run tests**

Launch a test-runner sub-agent (model: haiku):
```
Run tests: {pm} run test 2>&1 || true
Parse output and return:
- Tests passed / failed / skipped
- For each failure: file, test name, error
If all pass: return "✓ All tests pass"
```

### 4. Fix Loop (if errors)

<critical>
Max retries based on budget:
- low: 1 retry
- mid: 3 retries
- high: 5 retries
</critical>

For each retry:

**4a. Analyze errors**

Launch an error-analyzer sub-agent (model: sonnet):
```
Analyze these errors and propose targeted fixes:
{structured errors from test-runner}

Return for each error:
- File and line
- Probable cause
- Proposed fix (exact diff)
```

**4b. Apply fixes**

Apply proposed fixes via Edit/Write.

**4c. Re-run tests**

Relaunch test-runner. If errors → retry.
If still failing after max retries:

```
⚠ Tests failed after {max} attempts.
Remaining errors:
{error list}
```

**If `{auto_mode}` = true:** continue despite errors (document them)
**Otherwise:** ask user via AskUserQuestion

### 5. Playwright Integration Tests (if playwright_mode)

**If `{playwright_mode}` = false:** skip to step 6

<critical>
Playwright tests use the MCP Playwright.
Verify MCP availability before continuing.
</critical>

**5a. Identify scenarios to test**

From the plan (phase 2), extract integration scenarios:
- Main user journey
- Critical edge cases

**5b. Write and run Playwright tests**

Use MCP Playwright tools to:
1. Navigate to relevant pages
2. Interact with elements
3. Verify expected results
4. Capture screenshots on failure

**5c. Playwright fix loop**

Same logic as step 4 — retry based on budget.

### 6. Test Summary

```
**Tests Complete**

**Linting:** ✓ / ✗ ({count} errors)
**Typecheck:** ✓ / ✗ ({count} errors)
**Unit tests:** ✓ / ✗ ({passed}/{total})
**Playwright:** ✓ / ✗ / skipped
**Retries used:** {count}/{max}
```

### 7. Save Output (if save_mode)

Append to `{output_dir}/04-test.md`.

---

## NEXT STEP:

<critical>
NO session boundary — chain directly to documentation.
</critical>

```
→ If {branch_mode} = true, commit:
  git add -u && git diff --cached --quiet || git commit -m "forge({task_id}): phase 04 - test"

→ If save_mode = true:
  bash {skill_dir}/scripts/update-progress.sh "{task_id}" "04" "test" "complete"

→ Load ./step-05-document.md directly
```
