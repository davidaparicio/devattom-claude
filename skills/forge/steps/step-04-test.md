---
name: step-04-test
description: Tests — linting, typecheck, tests unitaires, tests d'intégration Playwright
prev_step: ./step-03-execute.md
next_step: ./step-05-document.md
---

# Phase 4 : Tests

## RÈGLES :

- ✅ TOUJOURS exécuter linting + typecheck (peu importe les flags)
- ✅ Tests unitaires SI `-t` ou `-a` activé
- ✅ Tests Playwright SI `-play` activé
- ✅ Boucle de retry selon le budget
- 🛑 JAMAIS ignorer les erreurs de lint/typecheck

## ALLOCATION MODÈLE :

<critical>
Consulter `budget-profiles.md` :
- Runner (linting/typecheck/tests) : toujours Haiku (sous-agent test-runner)
- Analyse d'erreurs : Sonnet (mid) ou Opus (high)
- Retry max : low=1, mid=3, high=5
</critical>

## RESTAURATION CONTEXTE (mode resume) :

<critical>
Si chargé via resume :
1. Lire `{output_dir}/00-context.md` → flags
2. Lire `{output_dir}/03-execute.md` → ce qui a été implémenté
</critical>

---

## SÉQUENCE :

### 1. Init save (si save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "04" "test" "in_progress"
```

### 2. Linting et typecheck (TOUJOURS)

Lancer un sous-agent test-runner (model: haiku) :

```
Exécuter ces commandes et retourner UNIQUEMENT les erreurs :
1. Déterminer le package manager (chercher pnpm-lock.yaml, yarn.lock, bun.lockb, package-lock.json)
2. Exécuter le linting : {pm} run lint 2>&1 || true
3. Exécuter le typecheck : {pm} run typecheck 2>&1 || true
4. Parser la sortie et retourner UNIQUEMENT les erreurs structurées :
   - Fichier, ligne, message d'erreur
   - Nombre total d'erreurs
Si tout passe : retourner "✓ 0 erreurs"
```

**Si des erreurs sont trouvées :** → aller au step 4 (boucle de correction)

**Si tout passe :** → continuer au step 3 (tests unitaires)

### 3. Tests unitaires (si test_mode ou auto_mode)

**Si `{test_mode}` = false ET `{auto_mode}` = false :** sauter au step 5

**3a. Vérifier les tests existants**

Lancer un sous-agent (model: haiku, subagent_type: Explore) :
```
Trouver les fichiers de test liés aux fichiers modifiés :
{liste des fichiers modifiés en phase 3}
Retourner : chemins des tests existants, framework utilisé, patterns.
```

**3b. Créer les tests manquants**

Lancer un sous-agent (model: sonnet) :
```
Créer les tests pour les fonctions modifiées/créées :
{résumé des changements de phase 3}
Suivre les patterns de test existants : {patterns trouvés en 3a}
Framework : {framework détecté}
```

**3c. Exécuter les tests**

Lancer un sous-agent test-runner (model: haiku) :
```
Exécuter les tests : {pm} run test 2>&1 || true
Parser la sortie et retourner :
- Tests passés / échoués / skippés
- Pour chaque échec : fichier, test name, erreur
Si tout passe : retourner "✓ Tous les tests passent"
```

### 4. Boucle de correction (si erreurs)

<critical>
Nombre max de retries selon budget :
- low : 1 retry
- mid : 3 retries
- high : 5 retries
</critical>

Pour chaque retry :

**4a. Analyser les erreurs**

Lancer un sous-agent error-analyzer (model: sonnet) :
```
Analyser ces erreurs et proposer des corrections ciblées :
{erreurs structurées du test-runner}

Retourner pour chaque erreur :
- Fichier et ligne
- Cause probable
- Correction proposée (diff exact)
```

**4b. Appliquer les corrections**

Appliquer les corrections proposées via Edit/Write.

**4c. Re-exécuter les tests**

Relancer le test-runner. Si erreurs → retry.
Si toujours en échec après max retries :

```
⚠ Tests échoués après {max} tentatives.
Erreurs restantes :
{liste des erreurs}
```

**Si `{auto_mode}` = true :** continuer malgré les erreurs (les documenter)
**Sinon :** demander à l'utilisateur via AskUserQuestion

### 5. Tests d'intégration Playwright (si playwright_mode)

**Si `{playwright_mode}` = false :** sauter au step 6

<critical>
Les tests Playwright utilisent le MCP Playwright.
Vérifier que le MCP est disponible avant de continuer.
</critical>

**5a. Identifier les scénarios à tester**

Depuis le plan (phase 2), extraire les scénarios d'intégration :
- Parcours utilisateur principal
- Cas limites critiques

**5b. Écrire et exécuter les tests Playwright**

Utiliser les outils MCP Playwright pour :
1. Naviguer vers les pages concernées
2. Interagir avec les éléments
3. Vérifier les résultats attendus
4. Capturer les screenshots en cas d'échec

**5c. Boucle de correction Playwright**

Même logique que step 4 — retry selon budget.

### 6. Résumé des tests

```
**Tests terminés**

**Linting :** ✓ / ✗ ({count} erreurs)
**Typecheck :** ✓ / ✗ ({count} erreurs)
**Tests unitaires :** ✓ / ✗ ({passed}/{total})
**Playwright :** ✓ / ✗ / skipped
**Retries utilisés :** {count}/{max}
```

### 7. Save output (si save_mode)

Append à `{output_dir}/04-test.md`.

---

## NEXT STEP :

<critical>
PAS de session boundary — enchaîner directement vers la documentation.
</critical>

```
→ Si {branch_mode} = true, committer :
  git add -u && git diff --cached --quiet || git commit -m "forge({task_id}): phase 04 - test"

→ Si save_mode = true :
  bash {skill_dir}/scripts/update-progress.sh "{task_id}" "04" "test" "complete"

→ Charger ./step-05-document.md directement
```
