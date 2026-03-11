---
name: step-03-execute
description: Exécution du plan avec dispatch intelligent selon complexité et budget
prev_step: ./step-02-plan.md
next_step: ./step-04-test.md
---

# Phase 3 : Exécution

## RÈGLES :

- 🛑 JAMAIS dévier du plan approuvé
- 🛑 JAMAIS ajouter de features hors plan (scope creep)
- 🛑 JAMAIS modifier un fichier sans le lire d'abord
- ✅ TOUJOURS suivre le plan fichier par fichier
- ✅ TOUJOURS lire les fichiers AVANT de les éditer
- ✅ TOUJOURS dispatcher au bon sous-agent selon la complexité
- 📋 TU ES UN CHEF D'ORCHESTRE qui dispatche aux sous-agents

## ALLOCATION MODÈLE :

<critical>
Consulter `budget-profiles.md` pour le dispatch selon `{budget}` :

Chaque tâche du plan est taguée [simple/moderate/complex].
Le dispatch dépend du tag ET du budget :

**Budget `low` :**
- simple → sous-agent snipper (model: sonnet, effort: faible)
- moderate → contexte principal (Sonnet faible)
- complex → contexte principal (Sonnet faible)

**Budget `mid` :**
- simple → sous-agent snipper (model: sonnet, effort: faible)
- moderate → sous-agent file-writer (model: sonnet, effort: élevé)
- complex → contexte principal (Sonnet effort élevé)

**Budget `high` :**
- simple → sous-agent snipper (model: sonnet, effort: faible)
- moderate → sous-agent file-writer (model: opus, effort: moyen)
- complex → contexte principal (Opus effort élevé)
</critical>

## RESTAURATION CONTEXTE (mode resume) :

<critical>
Si chargé via resume :
1. Lire `{output_dir}/00-context.md` → flags, task info
2. Lire `{output_dir}/02-plan.md` → le plan
3. `git diff --name-only` pour détecter le travail partiel
4. Croiser avec le plan → sauter les items déjà faits
</critical>

---

## SÉQUENCE :

### 1. Init save (si save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "03" "execute" "in_progress"
```

### 2. Git checkpoint (filet de sécurité)

```bash
git add -u && git commit --allow-empty -m "forge: checkpoint avant exécution ({task_id})"
```

### 3. Créer les todos depuis le plan

Convertir chaque changement du plan en todo avec son tag de complexité :

```
Plan entry:
#### `src/auth/handler.ts` [moderate]
- Ajouter `validateToken`
- Gérer l'erreur token expiré

Devient:
- [ ] [moderate] src/auth/handler.ts: Ajouter validateToken
- [ ] [moderate] src/auth/handler.ts: Gérer erreur token expiré
```

### 4. Exécuter fichier par fichier

Pour chaque todo, dispatcher selon la complexité :

**4a. Tâches `[simple]` → Sous-agent snipper**

Lancer un Agent avec :
```
model: sonnet
subagent_type: Snipper
prompt: "Modifier {file_path}:
  - {description exacte du changement}
  - Suivre le pattern de {reference_file}:{line}
  NE PAS ajouter de commentaires ou features supplémentaires."
```

Plusieurs tâches simples INDÉPENDANTES peuvent être lancées en parallèle.

**4b. Tâches `[moderate]` → Sous-agent file-writer OU contexte principal**

En budget `mid`/`high`, lancer un Agent avec :
```
model: sonnet (mid) ou opus (high)
prompt: "Implémenter dans {file_path}:
  - {description détaillée}
  - Patterns à suivre : {patterns de la recherche}
  - Lire le fichier avant de modifier.
  NE PAS ajouter de features hors scope."
```

En budget `low`, faire directement dans le contexte principal.

**4c. Tâches `[complex]` → Contexte principal**

Toujours exécuter dans le contexte principal :
1. Lire le fichier cible
2. Comprendre la structure existante
3. Implémenter selon le plan
4. Suivre les patterns documentés en phase 1

### 5. Gérer les blocages

**Si `{auto_mode}` = true :** décision raisonnable et continuer
**Sinon :** utiliser AskUserQuestion

### 6. Vérification rapide

```bash
# Vérification rapide — le linting/typecheck complet est en phase 4
git diff --stat
```

### 7. Résumé d'implémentation

```
**Implémentation terminée**

**Fichiers modifiés :**
- `src/auth/handler.ts` — ajouté validateToken, gestion erreurs
- `src/api/auth/route.ts` — intégré validation token

**Nouveaux fichiers :**
- `src/types/auth.ts` — définitions de types

**Todos :** {X}/{Y} complétés
**Sous-agents utilisés :** {count} snipper, {count} file-writer
```

### 8. Save output (si save_mode)

Append à `{output_dir}/03-execute.md`.

---

## NEXT STEP :

<critical>
PAS de session boundary ici — l'exécution enchaîne directement vers les tests.
</critical>

```
→ Si {branch_mode} = true, committer :
  git add -u && git diff --cached --quiet || git commit -m "forge({task_id}): phase 03 - execute"

→ Si save_mode = true :
  bash {skill_dir}/scripts/update-progress.sh "{task_id}" "03" "execute" "complete"

→ Charger ./step-04-test.md directement
```
