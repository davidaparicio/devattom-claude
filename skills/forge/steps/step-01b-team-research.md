---
name: step-01b-team-research
description: Recherche parallèle via Agent Teams — version team de la phase 1
next_step: ./step-02-plan.md
---

# Phase 1b : Recherche parallèle (Team Mode)

## RÈGLES :

- 🛑 JAMAIS planifier — phase 2
- ✅ LANCER tous les agents en UNE réponse
- ✅ Chaque agent retourne un RÉSUMÉ COMPACT
- 🧠 ULTRA THINK avant le lancement

## RESTAURATION CONTEXTE (mode resume) :

<critical>
Si chargé via resume : lire `{output_dir}/00-context.md` puis procéder.
</critical>

---

## SÉQUENCE :

### 1. Init save (si save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "01" "research" "in_progress"
```

### 2. Lire les documents de référence (si présents)

Si `{reference_files}` n'est pas vide : lire le fichier et extraire les spécifications.

### 3. ULTRA THINK : Évaluer la complexité et choisir les agents

Consulter `budget-profiles.md` pour le profil `{budget}`.

### 4. Lancer les agents en parallèle

**Agents à lancer selon budget :**

**Budget `mid` — 2-3 agents Haiku :**

```
Agent "explorer-codebase" (model: haiku, subagent_type: Explore):
  "Explorer le codebase pour : {task_description}
   Retourner UNIQUEMENT :
   1. Chemins de fichiers avec numéros de ligne
   2. Signatures de fonctions/classes pertinentes
   3. Patterns utilisés pour des features similaires
   NE PAS retourner le contenu complet des fichiers."

Agent "explorer-docs" (model: haiku, subagent_type: Explore):
  "Rechercher la documentation pour les bibliothèques liées à : {task_description}
   Retourner un résumé condensé :
   1. APIs pertinentes avec exemples courts
   2. Configuration nécessaire
   3. Pièges connus"

Agent "summarizer-web" (model: haiku, subagent_type: websearch) [optionnel]:
  "Rechercher les bonnes pratiques pour : {specific_question}
   Retourner les 3-5 points clés uniquement."
```

**Budget `high` — 3-5 agents Sonnet :**

```
Agent "explorer-codebase-deep" (model: sonnet, subagent_type: Explore):
  "Exploration approfondie du codebase pour : {task_description}
   Retourner : fichiers, patterns, architecture, dépendances."

Agent "explorer-codebase-tests" (model: sonnet, subagent_type: Explore):
  "Trouver les patterns de test existants pour le domaine : {domain}
   Retourner : frameworks, conventions, fixtures, mocks."

Agent "explorer-docs" (model: sonnet, subagent_type: explore-docs):
  "Documentation détaillée via Context7 pour : {libraries}
   Retourner : APIs, exemples, configuration, migration notes."

Agent "researcher-web" (model: sonnet, subagent_type: websearch):
  "Recherche approfondie : {specific_questions}
   Retourner : approches, comparaisons, pièges, patterns."

Agent "analyzer-architecture" (model: sonnet, subagent_type: Explore) [optionnel]:
  "Analyser l'architecture autour de : {integration_points}
   Retourner : dépendances, interfaces, contracts, contraintes."
```

<critical>
TOUS les agents lancés en UNE SEULE réponse.
Chaque prompt demande explicitement un RÉSUMÉ — pas de dump de fichiers.
</critical>

### 5. Agréger et synthétiser

Combiner les résultats des agents en un document structuré :
- Exigences de la tâche
- Contexte du codebase (fichiers, patterns, utilitaires)
- Documentation et recherche
- Critères d'acceptation inférés

### 6. Save et session boundary

Identique à step-01-research.md — append à `01-research.md`, puis :

```
SI auto_mode = true : charger ./step-02-plan.md
SI auto_mode = false : session boundary → STOP
```
