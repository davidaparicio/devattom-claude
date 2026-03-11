---
name: step-02-plan
description: Planification — créer un plan d'implémentation fichier par fichier
prev_step: ./step-01-research.md
next_step: ./step-03-execute.md
---

# Phase 2 : Plan

## RÈGLES :

- 🛑 JAMAIS implémenter — c'est la phase 3
- 🛑 JAMAIS écrire ou modifier du code
- ✅ TOUJOURS structurer le plan par FICHIER, pas par feature
- ✅ TOUJOURS inclure les numéros de ligne de la recherche
- ✅ TOUJOURS mapper les critères d'acceptation aux changements
- ✅ TOUJOURS taguer chaque tâche avec sa complexité (simple/moderate/complex)
- 🚫 INTERDIT d'utiliser les outils Edit, Write, ou Bash

## ALLOCATION MODÈLE :

<critical>
Consulter `budget-profiles.md` pour le modèle/effort de cette phase :
- `low` : Haiku effort faible
- `mid` : Sonnet effort moyen
- `high` : Opus effort moyen
</critical>

## RESTAURATION CONTEXTE (mode resume) :

<critical>
Si chargé via resume :
1. Lire `{output_dir}/00-context.md` → flags, task info, critères
2. Lire `{output_dir}/01-research.md` → résultats de la recherche
3. Si référence doc → la lire aussi
</critical>

---

## SÉQUENCE :

### 1. Init save (si save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "02" "plan" "in_progress"
```

### 2. Designer la stratégie complète

Simulation mentale :
- Parcourir l'implémentation étape par étape
- Identifier TOUS les fichiers à modifier
- Déterminer l'ordre logique (dépendances d'abord)
- Considérer les cas limites
- Planifier la couverture de test

### 3. Clarifier les ambiguïtés

**Si `{auto_mode}` = true :** utiliser l'option recommandée
**Sinon :** utiliser AskUserQuestion avec les options

### 4. Créer le plan détaillé

**Structurer par FICHIER. Chaque tâche est taguée avec sa complexité :**

```markdown
## Plan d'implémentation : {task_description}

### Vue d'ensemble
[1-2 phrases : stratégie et approche]

### Prérequis
- [ ] Prérequis 1 (si applicable)

---

### Changements par fichier

#### `src/path/file1.ts` [moderate]
- Ajouter `functionName` qui gère X
- Extraire la logique de Y (suivre pattern `example.ts:45`)
- Gérer le cas d'erreur : [scénario spécifique]

#### `src/path/file2.ts` [simple]
- Mettre à jour les imports
- Appeler `functionName` dans le flow existant ligne ~42

#### `src/path/file3.ts` (NOUVEAU FICHIER) [complex]
- Créer l'utilitaire pour Z
- Exporter : `utilityFunction`, `HelperType`
- Pattern : Suivre la structure de `similar-util.ts`

---

### Stratégie de test
**Nouveaux tests :**
- `src/path/file1.test.ts` — tester functionName
**Tests existants à mettre à jour :**
- `src/path/existing.test.ts` — ajouter test pour le nouveau flow

---

### Mapping critères d'acceptation
- [ ] AC1 : Satisfait par `file1.ts`
- [ ] AC2 : Satisfait par `file2.ts`

---

### Risques et considérations
- Risque 1 : [problème potentiel et mitigation]
```

<critical>
Le tag de complexité [simple/moderate/complex] est OBLIGATOIRE pour chaque fichier.
Il détermine quel sous-agent exécutera la tâche en phase 3 :
- `simple` → sous-agent snipper (Sonnet faible)
- `moderate` → sous-agent file-writer (Sonnet moyen-élevé selon budget)
- `complex` → contexte principal (modèle selon budget)
</critical>

**Si `{save_mode}` = true :** Append le plan à 02-plan.md

### 5. Vérifier la complétude

Checklist :
- [ ] Tous les fichiers identifiés
- [ ] Ordre logique des dépendances
- [ ] Actions claires et actionnables
- [ ] Stratégie de test
- [ ] Pas de scope creep
- [ ] Critères d'acceptation mappés
- [ ] Complexité taguée pour chaque fichier

### 6. Présenter pour approbation

**Si `{auto_mode}` = true :** continuer directement
**Sinon :**

```yaml
questions:
  - header: "Plan"
    question: "Revoir le plan. Prêt à procéder ?"
    options:
      - label: "Approuver le plan (Recommandé)"
        description: "Le plan est bon, sauvegarder et terminer cette phase"
      - label: "Ajuster le plan"
        description: "Modifier certaines parties"
      - label: "Poser des questions"
        description: "Questions sur le plan"
      - label: "Recommencer"
        description: "Revoir le plan entièrement"
    multiSelect: false
```

### 7. Save output (si save_mode)

Append à `{output_dir}/02-plan.md`.

---

## NEXT STEP :

### Session Boundary

```
SI auto_mode = true :
  → Si save_mode = true :
    bash {skill_dir}/scripts/update-progress.sh "{task_id}" "02" "plan" "complete"
  → Charger ./step-03-execute.md directement

SI auto_mode = false :
  → Exécuter (si save_mode) :
    bash {skill_dir}/scripts/session-boundary.sh "{task_id}" "02" "plan" "{count} fichiers planifiés" "03-execute" "Exécution" "**02-plan:** {résumé une ligne}"
  → STOP. L'utilisateur doit lancer /forge -r {task_id}.
```

<critical>
L'approbation du plan NE SIGNIFIE PAS "lancer l'exécution".
La session boundary contrôle si on stop ou continue.
En auto_mode=false : TOUJOURS STOP après le resume command.
</critical>
