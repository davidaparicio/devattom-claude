---
name: step-00b-interactive
description: Configuration interactive des flags Forge
returns_to: step-00-init.md
---

# Step 0b : Configuration interactive

## SÉQUENCE :

### 1. Afficher la configuration courante

```
**Configuration Forge :**

| Flag | Statut | Description |
|------|--------|-------------|
| Auto (`-a`) | {auto_mode ? "✓ ON" : "✗ OFF"} | Aucune pause + tests unitaires |
| Save (`-s`) | {save_mode ? "✓ ON" : "✗ OFF"} | Sauvegarder les outputs |
| Test (`-t`) | {test_mode ? "✓ ON" : "✗ OFF"} | Tests unitaires |
| Playwright (`-play`) | {playwright_mode ? "✓ ON" : "✗ OFF"} | Tests d'intégration |
| Team (`-w`) | {team_mode ? "✓ ON" : "✗ OFF"} | Recherche parallèle |
| Branch (`-b`) | {branch_mode ? "✓ ON" : "✗ OFF"} | Branche git |
| PR (`-pr`) | {pr_mode ? "✓ ON" : "✗ OFF"} | Pull request |
| Budget | {budget} | Allocation modèle |
```

### 2. Demander les changements de flags

```yaml
questions:
  - header: "Configurer"
    question: "Sélectionner les flags à BASCULER :"
    options:
      - label: "Auto mode"
        description: "{auto_mode ? 'Désactiver' : 'Activer'} - aucune pause + tests"
      - label: "Test mode"
        description: "{test_mode ? 'Désactiver' : 'Activer'} - tests unitaires"
      - label: "Playwright"
        description: "{playwright_mode ? 'Désactiver' : 'Activer'} - tests intégration"
      - label: "Team mode"
        description: "{team_mode ? 'Désactiver' : 'Activer'} - recherche parallèle"
      - label: "Branch mode"
        description: "{branch_mode ? 'Désactiver' : 'Activer'} - branche git"
      - label: "PR mode"
        description: "{pr_mode ? 'Désactiver' : 'Activer'} - créer PR"
    multiSelect: true
```

### 3. Demander le budget

```yaml
questions:
  - header: "Budget"
    question: "Niveau de budget :"
    options:
      - label: "low — Minimum de tokens"
        description: "Haiku/Sonnet faible. Pour tâches simples."
      - label: "mid — Équilibre (défaut)"
        description: "Sonnet moyen/élevé. Bon rapport qualité/coût."
      - label: "high — Qualité maximale"
        description: "Opus/Sonnet élevé. Features complexes."
    multiSelect: false
```

### 4. Appliquer et afficher

Basculer les flags sélectionnés. Règles spéciales :
- PR mode activé → branch mode activé automatiquement

Afficher la configuration finale et retourner à step-00-init.md.
