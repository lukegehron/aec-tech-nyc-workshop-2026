#!/usr/bin/env bash
# Runs after a real attendee Codespace is created, when their secret is present.

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "${HOME}/.config/ai-coding-workshop"
install -m 600 \
  "${script_dir}/openrouter-env.sh" \
  "${HOME}/.config/ai-coding-workshop/openrouter-env.sh"

source_line='source "${HOME}/.config/ai-coding-workshop/openrouter-env.sh"'
for rc_file in "${HOME}/.bashrc" "${HOME}/.zshrc"; do
  touch "${rc_file}"
  if ! grep -Fqx "${source_line}" "${rc_file}"; then
    printf '\n%s\n' "${source_line}" >> "${rc_file}"
  fi
done

# Cline reads ~/.cline/data/ (providers, auto-approve, OpenRouter key). The
# extension does not reliably inherit an interactive shell's environment.
node "${script_dir}/setup-cline.mjs"
