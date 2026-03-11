# Forge — Profils Budget

Référence des allocations modèle/effort par niveau de budget.

## Profil `low` — Tâches simples (petit fix, renommage)

| Phase | Modèle | Effort | Agents |
|-------|--------|--------|--------|
| Recherche | Haiku | - | 1 agent solo |
| Plan | Haiku | faible | - |
| Exécution | Sonnet | faible | snipper uniquement |
| Tests | Haiku | - | run + parse |
| Documentation | Haiku | - | docstrings basiques |

**Retry max :** 1
**Parallélisme recherche :** non

## Profil `mid` (défaut) — Features standard

| Phase | Modèle | Effort | Agents |
|-------|--------|--------|--------|
| Recherche | Haiku | - | 2-3 agents parallèles |
| Plan | Sonnet | moyen | - |
| Exécution | Sonnet | élevé | snipper + file-writer |
| Tests | Haiku run + Sonnet analyse | moyen | - |
| Documentation | Sonnet | faible | docstrings + mise à jour docs |

**Retry max :** 3
**Parallélisme recherche :** oui (si `-w`)

## Profil `high` — Features complexes et critiques

| Phase | Modèle | Effort | Agents |
|-------|--------|--------|--------|
| Recherche | Sonnet | - | 3-5 agents parallèles + ultra think |
| Plan | Opus | moyen | - |
| Exécution | Opus | élevé | tous sous-agents disponibles |
| Tests | Haiku run + Opus analyse | élevé | - |
| Documentation | Sonnet | moyen | docstrings + markdown + schémas Mermaid |

**Retry max :** 5
**Parallélisme recherche :** oui (si `-w`)

## Sous-agents disponibles

| Agent | Modèle | Rôle | Phases |
|-------|--------|------|--------|
| `explorer-codebase` | Haiku | Trouve fichiers, retourne chemins + signatures | Recherche |
| `explorer-docs` | Haiku | Cherche docs, retourne résumé condensé | Recherche |
| `summarizer` | Haiku | Condense fichiers en résumés structurés | Recherche |
| `snipper` | Sonnet (faible) | Modifications simples (renommage, imports) | Exécution |
| `file-writer` | Sonnet (moyen-élevé) | Création de fichiers depuis spec | Exécution |
| `test-runner` | Haiku | Exécute commandes, parse erreurs | Tests |
| `error-analyzer` | Sonnet | Diagnostique erreurs, propose fixes ciblés | Tests |
| `doc-writer` | Sonnet | Rédige documentation depuis brief | Documentation |

## Dispatch exécution par complexité de tâche

Chaque tâche du plan est taguée avec une complexité qui détermine le sous-agent :

| Tag complexité | `low` | `mid` | `high` |
|----------------|-------|-------|--------|
| `simple` | snipper (Sonnet faible) | snipper (Sonnet faible) | snipper (Sonnet faible) |
| `moderate` | Sonnet faible | Sonnet élevé | Opus moyen |
| `complex` | Sonnet faible | Sonnet élevé | Opus élevé |
