#!/bin/bash
# =============================================================================
# Vulcan Pizza Lab — GitHub Issues Setup Script
# Crea le label con colori corretti, le applica a tutte le issue,
# e chiude le 6 issue storiche (VPL-C01 → VPL-C06).
#
# Requisiti: gh cli autenticato (gh auth login)
# Uso: chmod +x docs/setup-github-issues.sh && ./docs/setup-github-issues.sh
# =============================================================================

REPO="zatteogit/vulcan-pizza-lab"

echo "============================================"
echo "  Vulcan Pizza Lab — Setup GitHub Issues"
echo "============================================"
echo ""

# --- 1. CREARE LABEL (con upsert: se esiste aggiorna colore) ---
echo ">>> Creazione/aggiornamento label..."

declare -A LABELS=(
  ["bug"]="d73a4a:Comportamento errato o regressione"
  ["enhancement"]="a2eeef:Nuova funzionalita o miglioramento"
  ["accessibility"]="0075ca:Accessibilita (a11y, WCAG)"
  ["refactor"]="e4e669:Refactoring senza cambio di comportamento"
  ["cleanup"]="f9d0c4:Rimozione codice morto o artefatti"
  ["performance"]="fbca04:Ottimizzazione prestazioni"
  ["engine"]="5319e7:Motore scientifico pizza-engine.ts"
  ["devops"]="0e8a16:Build, CI/CD, infrastruttura"
  ["documentation"]="c5def5:Documentazione e KB"
  ["priority:high"]="b60205:Priorita alta"
  ["priority:medium"]="e99695:Priorita media"
  ["priority:low"]="f9d0c4:Priorita bassa"
)

for label in "${!LABELS[@]}"; do
  IFS=':' read -r color desc <<< "${LABELS[$label]}"
  # Tenta create, se esiste fa edit
  if gh label create "$label" --color "$color" --description "$desc" --repo "$REPO" 2>/dev/null; then
    echo "  + Creata: $label"
  else
    gh label edit "$label" --color "$color" --description "$desc" --repo "$REPO" 2>/dev/null
    echo "  ~ Aggiornata: $label"
  fi
done

echo ""
echo ">>> Applicazione label alle issue..."

# --- 2. APPLICARE LABEL A TUTTE LE 23 ISSUE ---
# Formato: issue_number "label1,label2,label3"

declare -A ISSUE_LABELS=(
  [1]="bug,accessibility,priority:medium"
  [2]="bug,enhancement,priority:low"
  [3]="bug,enhancement,priority:medium"
  [4]="cleanup,priority:low"
  [5]="refactor,enhancement,priority:medium"
  [6]="refactor,priority:low"
  [7]="performance,priority:low"
  [8]="accessibility,priority:low"
  [9]="accessibility,priority:low"
  [10]="enhancement,priority:high"
  [11]="enhancement,priority:medium"
  [12]="enhancement,engine,priority:medium"
  [13]="enhancement,engine,priority:low"
  [14]="devops,priority:high"
  [15]="enhancement,devops,priority:low"
  [16]="documentation,priority:medium"
  [17]="documentation,priority:medium"
  [18]="bug,engine"
  [19]="bug,engine"
  [20]="bug,engine"
  [21]="bug,engine"
  [22]="bug,engine"
  [23]="bug,engine"
)

for issue_num in $(seq 1 23); do
  labels="${ISSUE_LABELS[$issue_num]}"
  # gh issue edit accetta --add-label con virgole
  gh issue edit "$issue_num" --add-label "$labels" --repo "$REPO"
  echo "  #$issue_num <- $labels"
done

echo ""
echo ">>> Chiusura issue storiche (VPL-C01 → VPL-C06)..."

# --- 3. CHIUDERE LE 6 ISSUE STORICHE ---
for issue_num in 18 19 20 21 22 23; do
  gh issue close "$issue_num" --reason completed --repo "$REPO"
  echo "  #$issue_num chiusa (completed)"
done

echo ""
echo "============================================"
echo "  Fatto! Riepilogo:"
echo "  - 12 label create/aggiornate"
echo "  - 23 issue etichettate"
echo "  - 6 issue storiche chiuse"
echo "============================================"
echo ""
echo "Verifica: https://github.com/$REPO/issues"
