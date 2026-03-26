---
name: step-01-research
description: Contextual research — explore what exists with ultra think
next_step: ./step-02-plan.md
---

# Phase 1: Research

## RULES:

- 🛑 NEVER plan or design — that's phase 2
- 🛑 NEVER create todos or implementation tasks
- ✅ ALWAYS focus on discovering WHAT EXISTS
- ✅ ALWAYS report findings with file paths and line numbers
- 📋 YOU ARE AN EXPLORER, not a planner
- 🧠 ULTRA THINK before launching agents

## TEAM MODE BRANCHING:

<critical>
IF {team_mode} = true:
  → Do NOT execute this file.
  → Load `./step-01b-team-research.md` instead.
</critical>

## CONTEXT RESTORATION (resume mode):

<critical>
If loaded via `/forge -r {task_id}`:
1. Read `{output_dir}/00-context.md` → restore flags, task info, criteria
2. Proceed normally
</critical>

---

## EXECUTION SEQUENCE:

### 1. Initialize Save Output (if save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "01" "research" "in_progress"
```

### 1b. Read Reference Documents (if any)

<critical>
If `{reference_files}` is not empty: read the reference file FIRST.
Extract: objective, design decisions, implementation details, constraints.
</critical>

### 2. ULTRA THINK: Analyze Complexity

```
Task: {task_description}

1. SCOPE: How many codebase areas are affected?
   - Single file/function → Low
   - Multiple related files → Medium
   - Cross-cutting concerns → High

2. LIBRARIES: Which external libraries?
   - None or well-known basics → Skip docs
   - Unfamiliar library → Need docs
   - Multiple interacting libraries → Multiple doc agents

3. PATTERNS: Do I need to understand existing patterns?
4. UNCERTAINTY: What am I unsure about?
```

### 3. Choose and Launch Agents

**Consult `budget-profiles.md` for agent count and type based on `{budget}`:**

**Budget `low` — 1 agent:**
```
Single Explore agent (Haiku) to find relevant files.
Return paths + signatures only.
```

**Budget `mid` — 2-3 parallel agents:**
```
Agent 1 (Haiku, subagent_type=Explore): Explore codebase
  → Return paths, signatures, patterns
Agent 2 (Haiku, subagent_type=Explore): Explore documentation
  → Condensed summary of relevant APIs
Agent 3 (Haiku, subagent_type=websearch): Best practices [optional]
  → Common approaches, pitfalls
```

**Budget `high` — 3-5 parallel agents + ultra think:**
```
Agent 1-2 (Sonnet, subagent_type=Explore): Deep codebase exploration
Agent 3 (Sonnet, subagent_type=explore-docs): Library docs via Context7
Agent 4 (Sonnet, subagent_type=websearch): Web research
Agent 5 (Sonnet, subagent_type=Explore): Existing test patterns [optional]
```

<critical>
LAUNCH ALL agents in ONE response (parallel).
Each agent MUST return a compact summary — NOT full file contents.
Expected return format: paths, signatures, one-line summaries.
</critical>

### 4. Synthesize Findings

```markdown
## Task Requirements

### Objective
{Clear 2-3 sentence description}

### Key Specifications
- {Specific technical requirement}
- {Schema/interface to implement}
- {Integration points}

### Reference
{Specification source}
```

```markdown
## Codebase Context

### Related Files Found
| File | Lines | Contains |
|------|-------|----------|
| `src/auth/login.ts` | 1-150 | Existing login implementation |

### Patterns Observed
- **Route pattern**: Uses Next.js App Router
- **Validation**: Zod schemas in `schemas/`

### Available Utilities
- `src/lib/auth.ts` — JWT functions

### Test Patterns
- Tests in `__tests__/`
- Uses vitest with testing-library
```

### 5. Infer Acceptance Criteria

```markdown
## Inferred Acceptance Criteria

- [ ] AC1: [specific measurable outcome]
- [ ] AC2: [specific measurable outcome]
- [ ] AC3: [specific measurable outcome]
```

**If `{save_mode}` = true:** Update AC in 00-context.md

### 6. Present Summary

```
**Research Complete**

**Files analyzed:** {count}
**Patterns identified:** {count}
**Utilities found:** {count}

**Key findings:**
- {relevant files summary}
- {patterns that will guide implementation}
```

<critical>
Do NOT ask for confirmation — follow session boundary logic directly.
</critical>

### 7. Complete Save Output (if save_mode)

Append findings to `{output_dir}/01-research.md`.

---

## NEXT STEP:

### Session Boundary

```
IF auto_mode = true:
  1. Distiller les findings dans {output_dir}/01-research.md
     Format compact (max 6000 tokens) — voir format dans design doc
     Inclure : Objective, Files to Modify/Create, Patterns Observed,
               Available Utilities, Key Constraints, Acceptance Criteria
  2. Mettre à jour le progress :
     bash {skill_dir}/scripts/update-progress.sh "{task_id}" "01" "research" "complete"
  3. Spawn Agent (general-purpose) avec ce prompt :
     """
     Tu es dans le skill Forge, Phase 2 (Plan).

     Variables critiques (déjà résolues — utilise ces valeurs directement) :
     - task_id: {task_id}
     - output_dir: {output_dir}
     - skill_dir: {skill_dir}
     - auto_mode: true
     - cleanup_mode: {cleanup_mode}

     Contexte de la tâche :
     [Coller ici le contenu complet de {output_dir}/00-context.md]

     Research findings :
     [Coller ici le contenu complet de {output_dir}/01-research.md]

     Instruction : Charge et exécute {skill_dir}/steps/step-02-plan.md
     """
  4. STOP. Session 1 terminée — Phase 2 s'exécute dans un contexte vierge.

IF auto_mode = false:
  1. Mettre à jour le progress (if save_mode) :
     bash {skill_dir}/scripts/update-progress.sh "{task_id}" "01" "research" "complete"
  2. Afficher :
     ╔══════════════════════════════════════════════════════╗
     ║  ✓ Research terminé — {task_id}                    ║
     ║  Prochaine phase : 02 — Plan                       ║
     ╠══════════════════════════════════════════════════════╣
     ║  [A] /forge -r {task_id}                           ║
     ║      Continuer dans cette session                   ║
     ║                                                     ║
     ║  [B] /clear  puis  /forge -r {task_id}             ║
     ║      Nouvelle session (recommandé ✓)               ║
     ║      Contexte vierge, meilleure qualité             ║
     ╚══════════════════════════════════════════════════════╝
  3. STOP.
```
