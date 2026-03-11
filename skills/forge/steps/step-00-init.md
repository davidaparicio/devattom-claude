---
name: step-00-init
description: Initialise le workflow Forge — parse flags, détecte la reprise, setup état
next_step: ./step-01-research.md
---

# Phase 0 : Initialisation

## RÈGLES D'EXÉCUTION :

- 🛑 JAMAIS sauter le parsing des flags
- ✅ TOUJOURS parser TOUS les flags avant toute action
- 📋 TU ES UN INITIALISEUR, pas un exécuteur
- 🚫 INTERDIT de charger step-01 avant la fin de l'init

## SÉQUENCE D'EXÉCUTION :

### 1. Parser les flags et l'input

**Step 1a : Charger les défauts**

```yaml
auto_mode: false
save_mode: false
test_mode: false
playwright_mode: false
team_mode: false
branch_mode: false
pr_mode: false
interactive_mode: false
budget: mid
```

**Step 1b : Parser l'input utilisateur et overrider les défauts :**

```
Enable flags (minuscule - activer) :
  -a ou --auto         → {auto_mode} = true
  -s ou --save         → {save_mode} = true
  -t ou --test         → {test_mode} = true
  -play ou --playwright → {playwright_mode} = true
  -w ou --team         → {team_mode} = true
  -b ou --branch       → {branch_mode} = true
  -pr ou --pull-request → {pr_mode} = true, {branch_mode} = true
  -i ou --interactive  → {interactive_mode} = true

Disable flags (MAJUSCULE - désactiver) :
  -A ou --no-auto           → {auto_mode} = false
  -S ou --no-save           → {save_mode} = false
  -T ou --no-test           → {test_mode} = false
  -PLAY ou --no-playwright  → {playwright_mode} = false
  -W ou --no-team           → {team_mode} = false
  -B ou --no-branch         → {branch_mode} = false
  -PR ou --no-pull-request  → {pr_mode} = false
  -I ou --no-interactive    → {interactive_mode} = false

Budget :
  --budget low   → {budget} = low
  --budget mid   → {budget} = mid
  --budget high  → {budget} = high

Autre :
  -r ou --resume → {resume_task} = <argument suivant>
  Reste          → {task_description}
```

**Step 1c : Auto-enable save_mode en mode pas-à-pas :**

```
SI {auto_mode} = false ET {save_mode} = false :
    {save_mode} = true
    (Requis pour la reprise entre sessions)
```

**Step 1d : Auto-enable test_mode en mode auto :**

```
SI {auto_mode} = true :
    {test_mode} = true
```

**Step 1e : Détecter les fichiers de référence dans l'input :**

```
Scanner {task_description} pour des tokens de chemin :
1. Un token est un chemin si :
   - Il contient au moins un '/'
   - ET se termine par .md, .txt, .json, .yaml, .yml
2. Si le fichier existe : {reference_files} = chemin, retirer du {task_description}
3. Si {task_description} vide : dériver la description du nom de fichier
4. Si pas de chemin détecté : {reference_files} = "" (mode normal)
```

**Step 1f : Générer feature_name et task_id :**

```
{feature_name} = kebab-case de la description (sans préfixe numérique)
Exemple : "add user authentication" → "add-user-authentication"
```

Générer `{task_id}` maintenant :

```bash
bash {skill_dir}/scripts/generate-task-id.sh "{feature_name}"
```

### 2. Vérifier le mode resume

<critical>
UNIQUEMENT exécuter cette section si {resume_task} est défini.
Sinon, sauter directement au step 3.
</critical>

**Si `{resume_task}` est défini :**

**Step 2a : Trouver le dossier correspondant :**

```bash
ls .claude/output/forge/ | grep "{resume_task}"
```

- **Match exact** : utiliser
- **Match partiel unique** : utiliser
- **Multiples matchs** : lister et demander
- **Aucun match** : lister les tâches disponibles

**Step 2b : Restaurer l'état depuis `00-context.md` :**

1. Lire `{output_dir}/00-context.md`
2. Restaurer TOUS les flags depuis la table Configuration
3. Restaurer task info : `{task_id}`, `{task_description}`, `{feature_name}`, `{branch_name}`
4. Restaurer `{reference_files}`
5. Restaurer les critères d'acceptation

**Step 2c : Appliquer les overrides de la commande courante :**

Les flags passés avec la commande resume overrident les valeurs stockées.

**Step 2d : Déterminer la cible de reprise :**

1. Lire `next_step` du State Snapshot
2. Si `next_step` = `complete` : vérifier les lignes Pending (ajoutées par override de flags). Sinon → "✓ Workflow terminé."
3. Si `next_step` pointe vers un step ✓ Terminé : fallback sur la table Progress
4. ⏳ En cours = crash → redémarrer ce step

**Step 2e : Afficher le résumé et charger le step cible**

Puis charger directement le step cible. NE PAS continuer avec les steps 3-5.

### 3. Pré-vérifications

```bash
# Vérifier que la description n'est pas vide
if [[ -z "{task_description}" ]]; then
  echo "Error: Pas de description"
  exit 1
fi

# Warning changements non-committés
if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  echo "⚠ Warning: Changements non-committés détectés"
fi
```

### 4. Sous-steps optionnels

```
SI {interactive_mode} = true :
  → Charger steps/step-00b-interactive.md
  → Retour avec flags mis à jour

SI {branch_mode} = true :
  → Charger steps/step-00b-branch.md
  → Retour avec {branch_name} défini
```

### 5. Créer la structure output (si save_mode)

**Si `{save_mode}` = true :**

```bash
bash {skill_dir}/scripts/setup-templates.sh \
  "{task_id}" \
  "{task_description}" \
  "{auto_mode}" \
  "{save_mode}" \
  "{test_mode}" \
  "{playwright_mode}" \
  "{team_mode}" \
  "{branch_mode}" \
  "{pr_mode}" \
  "{interactive_mode}" \
  "{budget}" \
  "{branch_name}" \
  "{original_input}" \
  "{reference_files}"
```

### 6. Marquer init terminé et continuer

**Si `{save_mode}` = true :**

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "00" "init" "complete"
```

Afficher le résumé COMPACT :

```
✓ FORGE: {task_description}

| Variable | Valeur |
|----------|--------|
| `{task_id}` | 01-kebab-name |
| `{budget}` | mid |
| `{auto_mode}` | true/false |
| `{save_mode}` | true/false |
| `{test_mode}` | true/false |
| `{playwright_mode}` | true/false |
| `{team_mode}` | true/false |
| `{branch_mode}` | true/false |
| `{pr_mode}` | true/false |
| `{reference_files}` | chemin ou vide |

→ Recherche en cours...
```

<critical>
GARDER L'OUTPUT MINIMAL :
- Une ligne header avec la tâche
- Une table avec TOUTES les variables
- Une ligne "→ Recherche en cours..." puis IMMÉDIATEMENT charger step-01
</critical>

**Puis charger directement step-01-research.md**
