#!/usr/bin/env bash
# Cheap, per-attach checks. A welcome message must never block the Codespace.

set -uo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Re-run the cheap, idempotent setup so existing Codespaces self-heal after a
# workshop configuration update as well as after a secret change.
bash "${script_dir}/setup-user.sh" || true

echo ""
echo "  AI Coding Workshop"
echo "  ───────────────────────────────────────────────"

if [ -z "${OPENROUTER_API_KEY:-}" ]; then
  echo "  ⚠  No OpenRouter key found."
  echo ""
  echo "     This usually means the Codespace was made with the green"
  echo "     'Create codespace' button instead of 'New with options'."
  echo ""
  echo "     Fastest fix:"
  echo "       1. Go to github.com/settings/codespaces"
  echo "       2. Create a secret named exactly OPENROUTER_API_KEY"
  echo "       3. Paste the sk-or- key and grant this repository access"
  echo "       4. Stop this Codespace, then reopen it"
  echo ""
  echo "     Or delete it and recreate it with Code > Codespaces >"
  echo "     New with options. Ask a facilitator if you get stuck."
elif [[ "${OPENROUTER_API_KEY}" != sk-or-* ]]; then
  echo "  ⚠  The loaded key does not start with sk-or-."
  echo "     Check that you pasted an OpenRouter key, then restart the Codespace."
else
  echo "  ✓  OpenRouter key loaded"
  echo "  ✓  Cline configured — click its icon in the left sidebar"
  echo "  ✓  Start the app: type npm run dev, then open port 3000 in Ports"
  echo ""
  echo "     Beginner: open Cline (stay in Act) and paste the nametag prompt"
  echo "     Advanced: run claude in a terminal (also uses OpenRouter)"
fi

echo "  ───────────────────────────────────────────────"
echo ""
