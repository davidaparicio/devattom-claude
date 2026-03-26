---
name: step-02-plan
description: Planning — create a file-by-file implementation plan
prev_step: ./step-01-research.md
next_step: ./step-03-execute.md
---

# Phase 2: Plan

## RULES:

- 🛑 NEVER implement — that's phase 3
- 🛑 NEVER write or modify code
- ✅ ALWAYS structure the plan by FILE, not by feature
- ✅ ALWAYS include line numbers from research
- ✅ ALWAYS map acceptance criteria to changes
- ✅ ALWAYS tag each task with its complexity (simple/moderate/complex)
- 🚫 FORBIDDEN to use Edit, Write, or Bash tools

## MODEL ALLOCATION:

<critical>
Consult `budget-profiles.md` for this phase's model/effort:
- `low`: Haiku low effort
- `mid`: Sonnet medium effort
- `high`: Opus medium effort
</critical>

## CONTEXT RESTORATION:

<critical>
ALWAYS restore context when loaded by a sub-agent spawn (auto mode) OR via resume:
1. Read `{output_dir}/00-context.md` → flags, task info, criteria, cleanup_mode
2. Read `{output_dir}/01-research.md` → research findings
3. If reference doc exists → read it too
</critical>

---

## SEQUENCE:

### 1. Init Save (if save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "02" "plan" "in_progress"
```

### 2. Design the Complete Strategy

Mental simulation:
- Walk through the implementation step by step
- Identify ALL files to modify
- Determine logical order (dependencies first)
- Consider edge cases
- Plan test coverage

### 3. Clarify Ambiguities

**If `{auto_mode}` = true:** use recommended option
**Otherwise:** use AskUserQuestion with options

### 4. Create Detailed Plan

**Structure by FILE. Each task is tagged with its complexity:**

```markdown
## Implementation Plan: {task_description}

### Overview
[1-2 sentences: strategy and approach]

### Prerequisites
- [ ] Prerequisite 1 (if any)

---

### File Changes

#### `src/path/file1.ts` [moderate]
- Add `functionName` that handles X
- Extract logic from Y (follow pattern in `example.ts:45`)
- Handle error case: [specific scenario]

#### `src/path/file2.ts` [simple]
- Update imports
- Call `functionName` in existing flow at line ~42

#### `src/path/file3.ts` (NEW FILE) [complex]
- Create utility for Z
- Export: `utilityFunction`, `HelperType`
- Pattern: Follow `similar-util.ts` structure

---

### Testing Strategy
**New tests:**
- `src/path/file1.test.ts` — test functionName
**Existing tests to update:**
- `src/path/existing.test.ts` — add test for new flow

---

### Acceptance Criteria Mapping
- [ ] AC1: Satisfied by `file1.ts`
- [ ] AC2: Satisfied by `file2.ts`

---

### Risks and Considerations
- Risk 1: [potential issue and mitigation]
```

<critical>
The complexity tag [simple/moderate/complex] is MANDATORY for each file.
It determines which sub-agent executes the task in phase 3:
- `simple` → snipper sub-agent (Sonnet low)
- `moderate` → file-writer sub-agent (Sonnet medium-high per budget)
- `complex` → main context (model per budget)
</critical>

**If `{save_mode}` = true:** Append plan to 02-plan.md

### 5. Verify Completeness

Checklist:
- [ ] All files identified
- [ ] Logical dependency order
- [ ] Clear, actionable steps
- [ ] Test strategy
- [ ] No scope creep
- [ ] Acceptance criteria mapped
- [ ] Complexity tagged for each file

### 6. Present for Approval

**If `{auto_mode}` = true:** continue directly
**Otherwise:**

```yaml
questions:
  - header: "Plan"
    question: "Review the plan. Ready to proceed?"
    options:
      - label: "Approve plan (Recommended)"
        description: "Plan looks good, save and complete this phase"
      - label: "Adjust plan"
        description: "Modify specific parts"
      - label: "Ask questions"
        description: "Questions about the plan"
      - label: "Start over"
        description: "Revise the entire plan"
    multiSelect: false
```

### 7. Save Output (if save_mode)

Append to `{output_dir}/02-plan.md`.

---

## NEXT STEP:

### Session Boundary

```
IF auto_mode = true:
  1. Distiller le plan dans {output_dir}/02-plan.md
     Format compact (max 6000 tokens) — voir format dans design doc
     Inclure : Strategy, File Changes (avec tags complexity), Testing Strategy,
               Acceptance Criteria Mapping, Decisions Made
  2. Mettre à jour le progress :
     bash {skill_dir}/scripts/update-progress.sh "{task_id}" "02" "plan" "complete"
  3. Spawn Agent (general-purpose) avec ce prompt :
     """
     Tu es dans le skill Forge, Phase 3 (Execute).

     Variables critiques (déjà résolues — utilise ces valeurs directement) :
     - task_id: {task_id}
     - output_dir: {output_dir}
     - skill_dir: {skill_dir}
     - auto_mode: true
     - cleanup_mode: {cleanup_mode}

     Contexte de la tâche :
     [Coller ici le contenu complet de {output_dir}/00-context.md]

     Plan d'implémentation :
     [Coller ici le contenu complet de {output_dir}/02-plan.md]

     Instruction : Charge et exécute {skill_dir}/steps/step-03-execute.md
     """
  4. STOP. Session 2 terminée — Phase 3 s'exécute dans un contexte vierge.

IF auto_mode = false:
  1. Mettre à jour le progress (if save_mode) :
     bash {skill_dir}/scripts/update-progress.sh "{task_id}" "02" "plan" "complete"
  2. Afficher :
     ╔══════════════════════════════════════════════════════╗
     ║  ✓ Plan approuvé — {task_id}                       ║
     ║  Prochaine phase : 03 — Execute                    ║
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

<critical>
Plan approval does NOT mean "start executing".
The session boundary controls whether to stop or continue.
In auto_mode=false: ALWAYS STOP after displaying the options.
</critical>
