---
name: step-01b-team-research
description: Parallel research via Agent Teams — team version of phase 1
next_step: ./step-02-plan.md
---

# Phase 1b: Parallel Research (Team Mode)

## RULES:

- 🛑 NEVER plan — that's phase 2
- ✅ LAUNCH all agents in ONE response
- ✅ Each agent returns a COMPACT SUMMARY
- 🧠 ULTRA THINK before launching

## CONTEXT RESTORATION (resume mode):

<critical>
If loaded via resume: read `{output_dir}/00-context.md` then proceed.
</critical>

---

## SEQUENCE:

### 1. Init Save (if save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "01" "research" "in_progress"
```

### 2. Read Reference Documents (if any)

If `{reference_files}` is not empty: read and extract specifications.

### 3. ULTRA THINK: Evaluate Complexity and Choose Agents

Consult `budget-profiles.md` for the `{budget}` profile.

### 4. Launch Agents in Parallel

**Agents to launch by budget:**

**Budget `mid` — 2-3 Haiku agents:**

```
Agent "explorer-codebase" (model: haiku, subagent_type: Explore):
  "Explore the codebase for: {task_description}
   Return ONLY:
   1. File paths with line numbers
   2. Relevant function/class signatures
   3. Patterns used for similar features
   Do NOT return full file contents."

Agent "explorer-docs" (model: haiku, subagent_type: Explore):
  "Search documentation for libraries related to: {task_description}
   Return a condensed summary:
   1. Relevant APIs with short examples
   2. Required configuration
   3. Known pitfalls"

Agent "summarizer-web" (model: haiku, subagent_type: websearch) [optional]:
  "Search best practices for: {specific_question}
   Return the 3-5 key points only."
```

**Budget `high` — 3-5 Sonnet agents:**

```
Agent "explorer-codebase-deep" (model: sonnet, subagent_type: Explore):
  "Deep codebase exploration for: {task_description}
   Return: files, patterns, architecture, dependencies."

Agent "explorer-codebase-tests" (model: sonnet, subagent_type: Explore):
  "Find existing test patterns for domain: {domain}
   Return: frameworks, conventions, fixtures, mocks."

Agent "explorer-docs" (model: sonnet, subagent_type: explore-docs):
  "Detailed documentation via Context7 for: {libraries}
   Return: APIs, examples, configuration, migration notes."

Agent "researcher-web" (model: sonnet, subagent_type: websearch):
  "Deep research: {specific_questions}
   Return: approaches, comparisons, pitfalls, patterns."

Agent "analyzer-architecture" (model: sonnet, subagent_type: Explore) [optional]:
  "Analyze architecture around: {integration_points}
   Return: dependencies, interfaces, contracts, constraints."
```

<critical>
ALL agents launched in ONE response.
Each prompt explicitly requests a SUMMARY — no file dumps.
</critical>

### 5. Aggregate and Synthesize

Combine agent results into a structured document:
- Task requirements
- Codebase context (files, patterns, utilities)
- Documentation and research
- Inferred acceptance criteria

### 6. Save and Session Boundary

Same as step-01-research.md — append to `01-research.md`, then:

```
IF auto_mode = true: load ./step-02-plan.md
IF auto_mode = false: session boundary → STOP
```
