#!/bin/bash
set -e

echo "=== Setup de la config Claude Code ==="
echo ""

# Portable sed -i (GNU/Linux vs BSD/macOS)
_sed_i() { if [[ "$OSTYPE" == darwin* ]]; then sed -i '' "$@"; else sed -i "$@"; fi; }

# 1. Identité Git
echo ">> Configuration de l'identité Git"
read -p "   Ton prénom et nom : " git_name
read -p "   Ton email : " git_email

_sed_i \
  -e "s/\"GIT_AUTHOR_NAME\": \"Your Name\"/\"GIT_AUTHOR_NAME\": \"$git_name\"/" \
  -e "s/\"GIT_COMMITTER_NAME\": \"Your Name\"/\"GIT_COMMITTER_NAME\": \"$git_name\"/" \
  -e "s/\"GIT_AUTHOR_EMAIL\": \"your@email.com\"/\"GIT_AUTHOR_EMAIL\": \"$git_email\"/" \
  -e "s/\"GIT_COMMITTER_EMAIL\": \"your@email.com\"/\"GIT_COMMITTER_EMAIL\": \"$git_email\"/" \
  "$HOME/.claude/settings.json"

echo "   OK - identite Git configuree : $git_name <$git_email>"
echo ""

# 2. Dépendances système pour la sandbox
echo ">> Installation des dépendances système"

MISSING_DEPS=()
command -v rg &>/dev/null    || MISSING_DEPS+=("ripgrep")
command -v bwrap &>/dev/null || MISSING_DEPS+=("bubblewrap")
command -v socat &>/dev/null || MISSING_DEPS+=("socat")

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
  echo "   Installation via apt : ${MISSING_DEPS[*]}"
  sudo apt-get install -y "${MISSING_DEPS[@]}"
else
  echo "   OK - ripgrep, bubblewrap, socat déjà présents"
fi

if ! npm list -g @anthropic-ai/sandbox-runtime &>/dev/null 2>&1; then
  echo "   Installation de @anthropic-ai/sandbox-runtime..."
  npm install -g @anthropic-ai/sandbox-runtime
else
  echo "   OK - @anthropic-ai/sandbox-runtime déjà installé"
fi

echo ""

# 3. Installation des plugins
echo ">> Installation des plugins Claude Code"

if ! command -v claude &> /dev/null; then
  echo "   ATTENTION : commande 'claude' introuvable, passe l'installation des plugins."
  echo "   Lance les commandes suivantes apres installation de Claude Code :"
  echo "     claude plugin marketplace add anthropics/claude-plugins-official"
  echo "     claude plugin marketplace add obra/superpowers-marketplace"
  echo "     puis : claude plugin install <nom>@<marketplace> pour chaque plugin"
else
  echo "   Enregistrement des marketplaces..."
  claude plugin marketplace add anthropics/claude-plugins-official || true
  claude plugin marketplace add obra/superpowers-marketplace || true

  echo "   Installation des plugins..."
  while IFS= read -r plugin || [[ -n "$plugin" ]]; do
    [[ -z "$plugin" || "$plugin" == \#* ]] && continue
    echo "   Installation de $plugin..."
    claude plugin install "$plugin" || echo "   AVERTISSEMENT : echec pour $plugin"
  done < "$HOME/.claude/plugins/plugins.list"
  echo "   OK - plugins installes"
fi

echo ""
echo "=== Setup termine ! Relance Claude Code pour appliquer les changements. ==="
