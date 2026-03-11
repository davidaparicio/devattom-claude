---
name: step-06-finish
description: Finalisation — créer la PR et résumer le workflow
prev_step: ./step-05-document.md
---

# Phase 6 : Finish

## RÈGLES :

- ✅ Pousser la branche vers le remote
- ✅ Créer la PR avec un résumé complet
- ✅ Inclure le résumé du workflow dans la description

## RESTAURATION CONTEXTE (mode resume) :

<critical>
Si chargé via resume :
1. Lire `{output_dir}/00-context.md` → task info, branch_name
</critical>

---

## SÉQUENCE :

### 1. Init save (si save_mode)

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "06" "finish" "in_progress"
```

### 2. Committer les changements restants

```bash
git add -u && git diff --cached --quiet || git commit -m "forge({task_id}): finalisation"
```

### 3. Pousser la branche

```bash
git push -u origin {branch_name}
```

### 4. Créer la PR

Utiliser `gh pr create` avec un résumé structuré :

```bash
gh pr create --title "{titre court basé sur task_description}" --body "$(cat <<'EOF'
## Résumé

{Résumé en 1-3 bullet points des changements}

## Changements

**Fichiers modifiés :**
{liste des fichiers avec résumé des changements}

**Nouveaux fichiers :**
{liste des nouveaux fichiers}

## Tests

- **Linting :** ✓
- **Typecheck :** ✓
- **Tests unitaires :** {✓/✗/skipped}
- **Playwright :** {✓/✗/skipped}

## Documentation

{Résumé de la documentation ajoutée}

---

🔨 Généré avec [Forge](https://github.com) — workflow token-efficient
Budget : {budget} | Phases : 5/5
EOF
)"
```

### 5. Résumé final

```
═══════════════════════════════════════
  FORGE TERMINÉ : {task_description}
═══════════════════════════════════════
  Budget : {budget}
  Phases complétées : 5/5 + PR
  PR : {pr_url}
  Branche : {branch_name}
═══════════════════════════════════════
```

### 6. Save output (si save_mode)

Append à `{output_dir}/06-finish.md`.

```bash
bash {skill_dir}/scripts/update-progress.sh "{task_id}" "06" "finish" "complete"
```

Mettre à jour le state snapshot : `next_step: complete`
