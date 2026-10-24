#!/bin/bash
# Avvio delle sessioni cloud di Claude Code: dipendenze per verify e build.
# Solo in remoto; idempotente; nessun segreto.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# npm install (non ci) sfrutta la cache del container fra una sessione e l'altra.
npm install --no-audit --no-fund
