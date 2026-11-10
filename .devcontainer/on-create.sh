#!/usr/bin/env bash
# Runs inside the Codespaces prebuild. Keep slow, non-secret setup here.

set -euo pipefail

echo "==> Installing workshop dependencies"
npm ci --no-audit --no-fund

# Warm the preinstalled binary without making a failed version check break the
# whole prebuild if an upstream service is temporarily unavailable.
claude --version || true

echo "==> Prebuild setup complete"
