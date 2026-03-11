# Forge Task: {{task_id}}

**Créé :** {{timestamp}}
**Tâche :** {{task_description}}

---

## Configuration

| Flag | Valeur |
|------|--------|
| Auto (`-a`) | {{auto_mode}} |
| Save (`-s`) | {{save_mode}} |
| Test (`-t`) | {{test_mode}} |
| Playwright (`-play`) | {{playwright_mode}} |
| Team (`-w`) | {{team_mode}} |
| Branch (`-b`) | {{branch_mode}} |
| PR (`-pr`) | {{pr_mode}} |
| Interactive (`-i`) | {{interactive_mode}} |
| Budget | {{budget}} |
| Branche | {{branch_name}} |

---

## Requête utilisateur

```
{{original_input}}
```

## Documents de référence

{{reference_docs}}

---

## Progression

| Phase | Statut | Timestamp |
|-------|--------|-----------|
| 00-init | ⏸ Pending | |
| 01-research | ⏸ Pending | |
| 02-plan | ⏸ Pending | |
| 03-execute | ⏸ Pending | |
| 04-test | ⏸ Pending | |
| 05-document | ⏸ Pending | |
| 06-finish | {{pr_status}} | |

---

## State Snapshot

**feature_name:** {{feature_name}}
**next_step:** 01

### Critères d'acceptation

_Définis pendant la phase 01-research_

### Step Context

_Brief summaries added as steps complete_

### Gotchas

_Surprises, workarounds, and deviations discovered during execution_

### Choix utilisateur

_Décisions enregistrées aux points de transition interactifs_
