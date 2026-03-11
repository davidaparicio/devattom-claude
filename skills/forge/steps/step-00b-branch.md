---
name: step-00b-branch
description: Vérifie et setup la branche git pour le workflow Forge
returns_to: step-00-init.md
---

# Step 0b : Branch Setup

## RÈGLES :

- 🛑 JAMAIS committer sur main/master quand branch_mode est activé
- ✅ TOUJOURS vérifier la branche courante d'abord
- ✅ TOUJOURS stocker {branch_name} avant de retourner

## SÉQUENCE :

### 1. Vérifier la branche courante

```bash
git branch --show-current
```

### 2. Évaluer

**Si `main` ou `master` :** → créer une branche
**Sinon :** → `{branch_name}` = branche courante, retourner

### 3. Créer la branche

**Si `{auto_mode}` = true :**
→ Créer `feat/{task_id}` automatiquement

**Si `{auto_mode}` = false :**
```yaml
questions:
  - header: "Branche"
    question: "Vous êtes sur {current_branch}. Créer une branche ?"
    options:
      - label: "Créer feat/{task_id} (Recommandé)"
        description: "Créer et basculer sur la branche"
      - label: "Nom personnalisé"
        description: "Spécifier un nom de branche"
      - label: "Rester sur {current_branch}"
        description: "Continuer sans créer de branche"
    multiSelect: false
```

### 4. Exécuter

```bash
git checkout -b feat/{task_id}
```

→ `{branch_name}` = `feat/{task_id}`

### 5. Retourner

→ Retour à step-00-init.md avec `{branch_name}` défini
