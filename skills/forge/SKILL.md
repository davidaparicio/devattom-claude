---
name: forge
description: Workflow token-efficient en 5 phases (Research-Plan-Execute-Test-Document) avec allocation intelligente des modèles par budget. Optimisé pour les abonnements Pro.
argument-hint: "[-a] [-s] [-t] [-b] [-pr] [-play] [-w] [-i] [--budget low|mid|high] [-r <task-id>] <task description>"
---

<objective>
Exécuter des workflows d'implémentation structurés avec une consommation de tokens optimisée. Forge utilise un système de budget (low/mid/high) pour allouer le bon modèle et le bon niveau d'effort à chaque phase.
</objective>

<quick_start>
**Mode pas-à-pas (défaut) :** Pause après recherche et plan. Reprise avec `/forge -r`.

```bash
/forge add authentication middleware
# → Phase 1 (recherche) → pause
# → /forge -r 01-add-authentication-middleware
# → Phase 2 (plan) → pause
# → /forge -r 01-add-authentication-middleware
# → Phases 3-4-5 s'enchaînent
```

**Mode autonome :** Tout s'enchaîne sans pause.

```bash
/forge -a implement user registration
```

**Avec tests et PR :**

```bash
/forge -a -t -pr add login page
```

**Budget élevé (feature complexe) :**

```bash
/forge -a --budget high implement payment system
```

**Flags :**

- `-a` (auto) : Aucune pause + active les tests unitaires
- `-t` (test) : Crée et exécute les tests unitaires
- `-play` (playwright) : Tests d'intégration via MCP Playwright
- `-s` (save) : Sauvegarde outputs (auto-activé en mode pas-à-pas)
- `-b` (branch) : Vérifie/crée une branche git
- `-pr` (pull-request) : Crée une PR à la fin
- `-w` (team) : Agents parallèles sur la recherche
- `--budget` : Allocation modèle (low/mid/high, défaut: mid)

Voir `<parameters>` pour la liste complète.
</quick_start>

<parameters>

<flags>
**Enable flags (activer) :**
| Short | Long | Description |
|-------|------|-------------|
| `-a` | `--auto` | Mode autonome : aucune pause, active les tests unitaires |
| `-s` | `--save` | Sauvegarde outputs dans `.claude/output/forge/` |
| `-t` | `--test` | Crée et exécute les tests unitaires |
| `-play` | `--playwright` | Tests d'intégration via MCP Playwright |
| `-w` | `--team` | Agents parallèles sur la phase recherche |
| `-r` | `--resume` | Reprendre une tâche précédente |
| `-b` | `--branch` | Vérifie/crée une branche git |
| `-pr` | `--pull-request` | Crée une PR à la fin (active `-b`) |
| `-i` | `--interactive` | Configuration interactive des flags |

**Disable flags (désactiver) :**
| Short | Long | Description |
|-------|------|-------------|
| `-A` | `--no-auto` | Désactive le mode auto |
| `-S` | `--no-save` | Désactive la sauvegarde |
| `-T` | `--no-test` | Désactive les tests unitaires |
| `-PLAY` | `--no-playwright` | Désactive Playwright |
| `-W` | `--no-team` | Désactive le mode team |
| `-B` | `--no-branch` | Désactive le mode branche |
| `-PR` | `--no-pull-request` | Désactive la création PR |
| `-I` | `--no-interactive` | Désactive le mode interactif |

**Budget :**
| Flag | Description |
|------|-------------|
| `--budget low` | Haiku/Sonnet faible — tâches simples, minimum de tokens |
| `--budget mid` | Sonnet moyen/élevé — équilibre qualité/coût (défaut) |
| `--budget high` | Opus/Sonnet élevé — features complexes et critiques |
</flags>

<examples>
```bash
# Basique
/forge add auth middleware

# Autonome (tout s'enchaîne, tests unitaires inclus)
/forge -a add auth middleware

# Avec PR
/forge -a -pr add auth middleware

# Budget élevé pour feature complexe
/forge -a --budget high implement payment system

# Tests d'intégration Playwright
/forge -a -play add checkout flow

# Recherche parallèle (team)
/forge -w -a implement dashboard

# Reprendre une tâche
/forge -r 01-auth-middleware
/forge -r 01  # Match partiel

# Reprendre avec override de flag
/forge -a -r 01

# Configuration interactive
/forge -i add auth middleware

# Budget minimal
/forge --budget low fix typo in header
```
</examples>

<parsing_rules>
**Parsing des flags :**

1. Défauts chargés depuis `steps/step-00-init.md` section `<defaults>`
2. Flags CLI overrident les défauts (enable minuscule, disable MAJUSCULE)
3. Flags retirés de l'input, le reste = `{task_description}`
4. Task ID généré en `NN-kebab-case-description`

Algorithme détaillé dans `steps/step-00-init.md`.
</parsing_rules>

</parameters>

<output_structure>
**Quand `{save_mode}` = true :**

Outputs sauvegardés dans le répertoire PROJET :
```
.claude/output/forge/{task-id}/
├── 00-context.md       # Configuration, progression, état
├── 01-research.md      # Résultats de la recherche
├── 02-plan.md          # Plan d'implémentation
├── 03-execute.md       # Log d'exécution
├── 04-test.md          # Résultats des tests
├── 05-document.md      # Documentation générée
└── 06-finish.md        # Détails PR (si -pr)
```
</output_structure>

<resume_workflow>
**Mode reprise (`-r {task-id}`) :**

1. **Trouver le dossier :** `ls .claude/output/forge/ | grep {resume_task}`
2. **Restaurer l'état :** Lire `00-context.md` → flags, task info, critères d'acceptation
3. **Appliquer overrides :** Les flags passés avec `-r` overrident les valeurs stockées
4. **Trouver la cible :** Lire `next_step` du State Snapshot
5. **Charger le step cible**

Support du match partiel (ex: `-r 01` trouve `01-add-auth-middleware`).
</resume_workflow>

<workflow>
**Flux standard :**
1. Parse flags et description
2. Si `-r` : restaurer état et charger step cible
3. Si `-s` : créer dossier output et 00-context.md
4. Phase 1 — Recherche (step-01-research.md) → **PAUSE**
5. Phase 2 — Plan (step-02-plan.md) → **PAUSE**
6. Phase 3 — Exécution (step-03-execute.md) → enchaîne
7. Phase 4 — Tests (step-04-test.md) → enchaîne
8. Phase 5 — Documentation (step-05-document.md) → enchaîne
9. Si `-pr` : Finish (step-06-finish.md)

**Sessions :**
- `auto_mode=false` (défaut) : Pause après recherche et après plan. Phases 3-4-5 s'enchaînent.
- `auto_mode=true` (`-a`) : Tout s'enchaîne sans pause.
</workflow>

<state_variables>
**Persistent à travers toutes les phases :**

| Variable | Type | Description |
|----------|------|-------------|
| `{task_description}` | string | Ce qu'il faut implémenter |
| `{feature_name}` | string | Nom kebab-case sans numéro |
| `{task_id}` | string | Identifiant complet (ex: `01-add-auth`) |
| `{acceptance_criteria}` | list | Critères de succès |
| `{auto_mode}` | boolean | Aucune pause, active tests unitaires |
| `{save_mode}` | boolean | Sauvegarder les outputs |
| `{test_mode}` | boolean | Créer les tests unitaires |
| `{playwright_mode}` | boolean | Tests d'intégration Playwright |
| `{team_mode}` | boolean | Agents parallèles sur la recherche |
| `{branch_mode}` | boolean | Vérifier/créer branche git |
| `{pr_mode}` | boolean | Créer PR à la fin |
| `{interactive_mode}` | boolean | Config interactive |
| `{budget}` | string | low / mid / high |
| `{next_step}` | string | Prochaine phase à exécuter |
| `{reference_files}` | string | Chemin vers doc de référence |
| `{resume_task}` | string | Task ID à reprendre |
| `{output_dir}` | string | Chemin vers le dossier output |
| `{branch_name}` | string | Nom de la branche créée |
</state_variables>

<entry_point>

**PREMIÈRE ACTION :** Charger `steps/step-00-init.md`

Step 00 gère :
- Parsing des flags
- Détection du mode resume
- Création du dossier output (si save_mode)
- Initialisation des variables d'état

Après initialisation, step-00 charge step-01-research.md.

</entry_point>

<step_files>
**Chargement progressif — un seul step à la fois :**

| Step | Fichier | Objectif |
|------|---------|----------|
| 00 | `steps/step-00-init.md` | Parse flags, crée output, initialise état |
| 00b | `steps/step-00b-branch.md` | Vérification/création branche (si branch_mode) |
| 00b | `steps/step-00b-interactive.md` | Config interactive (si interactive_mode) |
| 01 | `steps/step-01-research.md` | Recherche contextuelle avec ultra think |
| 01b | `steps/step-01b-team-research.md` | Recherche parallèle (si team_mode) |
| 02 | `steps/step-02-plan.md` | Planification fichier par fichier |
| 03 | `steps/step-03-execute.md` | Exécution du plan avec dispatch intelligent |
| 04 | `steps/step-04-test.md` | Linting + typecheck + tests unitaires/intégration |
| 05 | `steps/step-05-document.md` | Documentation (docstrings + markdown en high) |
| 06 | `steps/step-06-finish.md` | Création PR (si pr_mode) |
</step_files>

<execution_rules>

- **Charger un step à la fois** — seul le step courant est en mémoire
- **ULTRA THINK** en phase recherche (phase la plus importante)
- **Persister les variables d'état** à travers toutes les phases
- **Suivre la directive next_step** à la fin de chaque step
- **Sauvegarder les outputs** si `{save_mode}` = true
- **Allocation modèle par budget** — consulter `budget-profiles.md` pour chaque phase
- **Session boundary :** 2 pauses (après recherche et après plan) sauf en auto_mode
- **Per-step commits :** Quand `branch_mode=true`, les phases code (03, 04) commitent automatiquement
- **Sous-agents spécialisés :** Dispatcher au bon modèle selon la complexité de la tâche

</execution_rules>

<success_criteria>

- Chaque phase chargée progressivement
- Allocation modèle respectée selon le budget
- Tests de linting/typecheck passants
- Tests unitaires passants (si activés)
- Tests Playwright passants (si activés)
- Documentation générée
- Outputs sauvegardés (si save_mode)

</success_criteria>
