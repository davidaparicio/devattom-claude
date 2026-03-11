---
name: step-01-research
description: Recherche contextuelle — explorer l'existant avec ultra think
next_step: ./step-02-plan.md
---

# Phase 1 : Recherche

## RÈGLES :

- 🛑 JAMAIS planifier ou designer — c'est la phase 2
- 🛑 JAMAIS créer de todos ou tâches d'implémentation
- ✅ TOUJOURS se concentrer sur la découverte de CE QUI EXISTE
- ✅ TOUJOURS reporter les résultats avec chemins de fichiers et numéros de ligne
- 📋 TU ES UN EXPLORATEUR, pas un planificateur
- 🧠 ULTRA THINK avant de lancer les agents

## BRANCHEMENT TEAM MODE :

<critical>
SI {team_mode} = true :
  → Ne PAS exécuter ce fichier.
  → Charger `./step-01b-team-research.md` à la place.
</critical>

## RESTAURATION CONTEXTE (mode resume) :

<critical>
Si chargé via `/forge -r {task_id}` :
1. Lire `{output_dir}/00-context.md` → restaurer flags, task info, critères
2. Procéder normalement
</critical>

---

## SÉQUENCE D'EXÉCUTION :

### 1. Initialiser save output (si save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "01" "research" "in_progress"
```

### 1b. Lire les documents de référence (si présents)

<critical>
Si `{reference_files}` n'est pas vide : lire le fichier de référence EN PREMIER.
Extraire : objectif, décisions de design, détails d'implémentation, contraintes.
</critical>

### 2. ULTRA THINK : Analyser la complexité

```
Tâche : {task_description}

1. SCOPE : Combien de zones du codebase sont affectées ?
   - Fichier/fonction unique → Faible
   - Plusieurs fichiers liés → Moyen
   - Préoccupations transversales → Élevé

2. BIBLIOTHÈQUES : Quelles libs externes ?
   - Aucune ou basiques connues → Skip docs
   - Lib inconnue → Besoin de docs
   - Multiples libs en interaction → Multiples agents docs

3. PATTERNS : Dois-je comprendre les patterns existants ?
4. INCERTITUDE : Sur quoi suis-je incertain ?
```

### 3. Choisir et lancer les agents

**Consulter `budget-profiles.md` pour le nombre et type d'agents selon `{budget}` :**

**Budget `low` — 1 agent :**
```
Un seul agent Explore (Haiku) pour trouver les fichiers pertinents.
Retourner chemins + signatures uniquement.
```

**Budget `mid` — 2-3 agents parallèles :**
```
Agent 1 (Haiku, subagent_type=Explore) : Explorer le codebase
  → Retourner chemins, signatures, patterns
Agent 2 (Haiku, subagent_type=Explore) : Explorer la documentation
  → Résumé condensé des APIs pertinentes
Agent 3 (Haiku, subagent_type=websearch) : Bonnes pratiques [optionnel]
  → Approches courantes, pièges
```

**Budget `high` — 3-5 agents parallèles + ultra think :**
```
Agent 1-2 (Sonnet, subagent_type=Explore) : Explorer codebase en profondeur
Agent 3 (Sonnet, subagent_type=explore-docs) : Documentation libs via Context7
Agent 4 (Sonnet, subagent_type=websearch) : Recherche web
Agent 5 (Sonnet, subagent_type=Explore) : Patterns de test existants [optionnel]
```

<critical>
LANCER TOUS les agents en UNE SEULE réponse (parallèle).
Chaque agent DOIT retourner un résumé compact — PAS les fichiers entiers.
Format de retour attendu : chemins, signatures, résumés d'une ligne.
</critical>

### 4. Synthétiser les résultats

```markdown
## Exigences de la tâche

### Objectif
{Description claire en 2-3 phrases}

### Spécifications clés
- {Exigence technique spécifique}
- {Schéma/interface à implémenter}
- {Points d'intégration}

### Référence
{Source de la spécification}
```

```markdown
## Contexte du codebase

### Fichiers pertinents trouvés
| Fichier | Lignes | Contenu |
|---------|--------|---------|
| `src/auth/login.ts` | 1-150 | Implémentation login existante |

### Patterns observés
- **Pattern route** : utilise Next.js App Router
- **Validation** : schémas zod dans `schemas/`

### Utilitaires disponibles
- `src/lib/auth.ts` — fonctions JWT

### Patterns de test
- Tests dans `__tests__/`
- Utilise vitest avec testing-library
```

### 5. Inférer les critères d'acceptation

```markdown
## Critères d'acceptation inférés

- [ ] AC1: [résultat mesurable spécifique]
- [ ] AC2: [résultat mesurable spécifique]
- [ ] AC3: [résultat mesurable spécifique]
```

**Si `{save_mode}` = true :** Mettre à jour les AC dans 00-context.md

### 6. Présenter le résumé

```
**Recherche terminée**

**Fichiers analysés :** {count}
**Patterns identifiés :** {count}
**Utilitaires trouvés :** {count}

**Résultats clés :**
- {résumé fichiers pertinents}
- {patterns qui guideront l'implémentation}
```

<critical>
Ne PAS demander de confirmation — suivre directement la logique de session boundary.
</critical>

### 7. Compléter save output (si save_mode)

Append les résultats à `{output_dir}/01-research.md`.

---

## NEXT STEP :

### Session Boundary

```
SI auto_mode = true :
  → Si save_mode = true :
    bash {skill_dir}/scripts/update-progress.sh "{task_id}" "01" "research" "complete"
  → Charger ./step-02-plan.md directement

SI auto_mode = false :
  → Exécuter (si save_mode) :
    bash {skill_dir}/scripts/session-boundary.sh "{task_id}" "01" "research" "Résultats : {count} fichiers, {count} patterns" "02-plan" "Plan (Planification)" "**01-research:** {résumé une ligne}"
  → Afficher le résultat à l'utilisateur
  → STOP. L'utilisateur doit lancer /forge -r {task_id} pour continuer.
```
