---
name: step-05-document
description: External documentation only — Mermaid diagrams, markdown files, README/CHANGELOG updates
---

# Phase 5: Document

## RULES:

- ✅ ONLY generate external documentation (diagrams, markdown files, README, CHANGELOG)
- 🛑 NEVER add docstrings — those were added during Execute (phase 3)
- 🛑 NEVER document things unrelated to the implemented feature
- ✅ Be concise — external docs should be useful to a reader, not exhaustive

---

## EXECUTION SEQUENCE:

### 1. Init

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "05" "document" "in_progress"
```

Read `{output_dir}/03-execute.md` to know what was implemented.

If `{user_instruction}` is not empty: apply it as focus or constraint.

### 2. Identify Documentation Targets

From phase 3 results:
- Is there an existing README section relevant to this feature? → update it
- Does a CHANGELOG exist? → add an entry
- Is this feature complex enough to warrant a dedicated doc file?
- Are there architecture relationships worth diagramming?

### 3. Generate Documentation

Launch a doc-writer sub-agent based on budget:

**Budget `mid` (Sonnet, effort: low):**
```
Write external documentation for the following feature:
{summary of what was implemented}

Produce:
- Mermaid architecture or sequence diagram if the feature involves non-trivial data flow
- Update README.md section: {relevant section} if applicable
- Add CHANGELOG entry if file exists

Be concise. Do not duplicate what is already in docstrings.
```

**Budget `high` (Sonnet, effort: medium):**
```
Write external documentation for the following feature:
{summary of what was implemented}

Produce:
- A dedicated markdown file at docs/{feature_name}.md with:
  - Overview (2-3 sentences)
  - Architecture diagram (Mermaid)
  - Data flow diagram (Mermaid sequence)
  - API reference (public functions/endpoints)
  - Configuration (env vars, options)
- Update README.md relevant section
- Add CHANGELOG entry if file exists
```

### 4. Save and Finish

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "05" "document" "complete"
```

Append to `{output_dir}/05-document.md`.

Display final summary:

```
═══════════════════════════════════════
  FORGE COMPLETE: {task_description}
═══════════════════════════════════════
  Budget: {budget}
  Advisor uses remaining: {advisor_uses_remaining}
  Phases completed: 5/5
  Files modified: {count}
  Tests: ✓/✗
  Docs: {files created/updated}
═══════════════════════════════════════
```

Clean up output folder:

```bash
rm -rf {output_dir}
```
