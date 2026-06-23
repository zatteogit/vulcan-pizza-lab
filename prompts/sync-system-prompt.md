# Prompt: Sistema Sync bidirezionale Vulcan Cloud <-> Locale

> Copia tutto il contenuto sotto la linea e incollalo nella chat di un altro progetto Vulcan Cloud.

---

Implementa un sistema di sincronizzazione bidirezionale tra Vulcan Cloud e un ambiente di sviluppo locale (Cursor, Windsurf, VS Code, ecc.). Il sistema ha due componenti:

## 1. Componente browser: SyncTab (`src/app/components/sync-tab.tsx`)

Un componente React da integrare nell'app (come tab in una pagina DevTools, o come route standalone). Deve:

### 1.1 Scansione file del progetto

Usare `import.meta.glob` di Vite per caricare tutti i sorgenti come raw string:

```ts
const sourceGlobs = import.meta.glob(
  [
    "/src/app/**/*.{ts,tsx}",
    "/src/styles/**/*.css",
    "/src/main.tsx",
    "/src/imports/**/*.tsx",
  ],
  { query: "?raw", import: "default" },
) as Record<string, () => Promise<string>>;

const configGlobs = import.meta.glob(
  [
    "/vite.config.ts",
    "/tsconfig.json",
    "/index.html",
    "/postcss.config.mjs",
  ],
  { query: "?raw", import: "default" },
) as Record<string, () => Promise<string>>;
```

Pattern di esclusione configurabili (es. `/src/app/components/ui/` se hai shadcn dead code).

### 1.2 Hash djb2 (identico browser e CLI)

```ts
function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash =
      ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
```

### 1.3 Formato bundle JSON

```json
{
  "figma_sync": "1.0",
  "timestamp": "2026-03-14T...",
  "source": "cloud" | "local",
  "files": {
    "/src/app/App.tsx": { "hash": "a1b2c3d4", "lines": 42, "content": "..." }
  },
  "manifest": { "total_files": 25, "excluded": ["node_modules/", "dist/"] }
}
```

### 1.4 Diff engine con algoritmo LCS

Quando l'utente importa un bundle dal locale, il sistema:

1. Confronta hash dei file (Make vs bundle importato)
2. Per i file modificati, calcola un diff riga-per-riga basato su LCS (Longest Common Subsequence)
3. Genera un prompt ottimizzato per Claude in formato `fast_apply_tool`

**Algoritmo LCS per il diff:**

- Tabella DP O(n\*m) con backtracking per trovare le righe comuni
- Soglie di fallback automatico a "file intero":
  - File < 25 righe (overhead del diff non conviene)
  - File con > 65% righe diverse (e una riscrittura, non un patch)
  - File con prodotto righe old x new > 4M (troppo costoso in RAM)
- Hunks con 3 righe di contesto prima/dopo
- Merge automatico di hunks vicini (quando il gap e <= 6 righe)
- Output in formato `fast_apply_tool`: `// ... existing code ...` + righe cambiate + contesto

**Due modalita di prompt** selezionabili con toggle:

| Modalita                    | Strategia                                                      | Quando usarla                           |
| --------------------------- | -------------------------------------------------------------- | --------------------------------------- |
| **Diff compatto** (default) | Solo le righe cambiate con contesto, formato `fast_apply_tool` | Sempre (risparmia ~90-97% di token)     |
| **File interi**             | Contenuto completo di ogni file, formato `write_tool`          | Fallback se Claude non applica un patch |

**Formato prompt compatto:**

```
=== PATCH: /src/app/components/foo.tsx ===
Usa fast_apply_tool con questo change_str:

// ... existing code ...
const vecchiaRiga = "old";
const nuovaRiga = "new";
// ... existing code ...
```

**Formato prompt per file nuovi/eliminati:**

- Nuovi: `=== NUOVO FILE: path ===` + `Usa write_tool:` + contenuto
- Eliminati: `=== ELIMINA: path ===` + `Usa delete_tool.`

### 1.5 Stima token e turni

Mostrare nella UI:

- Token stimati: `Math.ceil(chars / 3.5)` (media conservativa per codice)
- Turni stimati: `Math.ceil(tokens / 25000)` (budget sicuro per turno)
- Percentuale di risparmio: confronto compatto vs file interi

### 1.6 UI del SyncTab

Struttura a sezioni con step numerati:

1. **Intro** con diagramma visuale del flusso (Vulcan Cloud -> JSON -> Locale e viceversa)
2. **"Prima volta?"** accordion collapsabile con setup guidato (prerequisiti, clone, install)
3. **Sezione "Portare il codice sul tuo PC"** (colore verde/successo):
   - Step 1: Bottone "Scansiona progetto" (chiama `loadAllFiles()`)
   - Step 2: "Copia Bundle JSON" (il bundle serializzato)
   - Step 3: Comandi terminale con selettore OS (macOS/Linux/Windows):
     - macOS: `pbpaste | node sync.mjs import`
     - Linux: `xclip -selection clipboard -o | node sync.mjs import`
     - Windows: `powershell -c "Get-Clipboard" | node sync.mjs import`
4. **Sezione "Riportare le modifiche qui dentro"** (colore arancione/warning):
   - Step 1: Comandi export dal locale con selettore OS
   - Step 2: Textarea per incollare il bundle + bottone "Analizza diff"
   - Step 3: Risultato diff con pills riepilogo (N modificati, N nuovi, N eliminati)
   - Step 4: Toggle modalita prompt (compatto/file interi) + metriche token/turni/risparmio + bottone "Copia prompt per Claude"
5. **Comandi rapidi** CLI copiabili con un click

**Sotto-componenti interni:**

- `CopyBtn` — bottone copia con feedback "Copiato!" (2s timeout)
- `CmdCopy` — riga comando con `$` verde, testo mono, bottone copia inline
- `OsCommands` — selettore OS con tab macOS/Linux/Windows
- `StepNum` — cerchio numerato che si illumina quando lo step e completato
- `StatusBadge` — badge colorato per stato diff

**Clipboard:** sempre dual-path (navigator.clipboard.writeText + fallback textarea/execCommand per iframe).

### 1.7 Dipendenze

- `lucide-react` per le icone (Upload, Download, Copy, Check, FileText, FilePlus2, FileMinus2, FileEdit, AlertTriangle, RefreshCw, ClipboardPaste, ChevronDown, X, Monitor, Apple, Terminal, ArrowRight, ArrowDown, HelpCircle, BookOpen)
- `motion/react` per animazioni entrance (AnimatePresence, motion.div, motion.button)
- Nessun'altra dipendenza esterna

## 2. Script CLI: `sync.mjs` (root del progetto)

Script Node.js (ESM, `#!/usr/bin/env node`) con 4 comandi:

### Comandi

| Comando                            | Funzione                                                    |
| ---------------------------------- | ----------------------------------------------------------- |
| `node sync.mjs scan`               | Lista tutti i file tracciati con righe e hash               |
| `node sync.mjs export`             | Bundle JSON -> stdout (pipe a clipboard)                    |
| `node sync.mjs export bundle.json` | Bundle JSON -> file                                         |
| `node sync.mjs import`             | Legge bundle da stdin -> scrive file locali                 |
| `node sync.mjs import bundle.json` | Legge bundle da file -> scrive file locali                  |
| `node sync.mjs diff`               | Confronta locale vs ultimo snapshot (`.sync-snapshot.json`) |

### Configurazione

```js
const INCLUDE_DIRS = ["src/app", "src/styles", "src/imports", "src/main.tsx"];
const ROOT_FILES = ["vite.config.ts", "tsconfig.json", "index.html", "postcss.config.mjs", "package.json"];
const EXCLUDE_PATTERNS = ["node_modules/", "dist/", ".git/"];
```

Adatta `INCLUDE_DIRS`, `ROOT_FILES` e `EXCLUDE_PATTERNS` alla struttura del progetto corrente.

### Dettagli implementativi

- Hash: usa la stessa funzione `djb2` del browser (NON crypto.createHash) per confronto coerente
- Formato bundle: identico a quello del browser
- `export` salva anche uno snapshot in `.sync-snapshot.json` (gitignored) per il comando `diff`
- `import` confronta hash prima di scrivere (salta file invariati)
- Output colorato con codici ANSI
- Supporta sia pipe stdin/stdout che file come argomento
- Se nessun comando: mostra help con esempi per ogni OS

### Struttura del file

```
#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

// CONFIG (INCLUDE_DIRS, ROOT_FILES, EXCLUDE_PATTERNS)
// ANSI COLORS
// djb2 hash (identico al browser)
// File discovery (walk ricorsivo, filtro per estensione .ts/.tsx/.css/.mjs/.json/.html)
// buildBundle()
// cmdScan() — lista file
// cmdExport(outputFile?) — bundle -> stdout o file
// cmdImport(inputFile?) — stdin o file -> scrivi file locali
// cmdDiff(bundleFile?) — confronta locale vs snapshot
// MAIN: switch su process.argv[2]
```

## 3. Regole di stile

- Usa i token CSS del progetto per i colori (mai hex hardcoded)
- Animazioni con `motion/react`, transizioni spring (mai duration/ease per entrance)
- `active:scale-95` su `motion.button` per tap feedback (non `whileTap`)
- Mai `"transparent"` come valore CSS su elementi con `transition` — usa `rgba(0,0,0,0)`
- Mai `React.Fragment` o `<>...</>` — usa sempre un elemento concreto
- Lingua UI: italiano

## 4. Integrazione

Il SyncTab puo essere integrato come:

- Tab in una pagina DevTools (se il progetto ne ha una) — **preferito**: se il progetto ha gia una pagina DevTools o admin, integra il SyncTab come tab aggiuntivo
- Route standalone (es. `/sync`) — se non esiste una pagina DevTools, crea una route dedicata

Adatta i glob patterns (`import.meta.glob`) e le esclusioni alla struttura specifica del progetto. Se il progetto ha una directory di componenti UI inutilizzati (es. shadcn), escludila.

## 5. Setup gitignore

Aggiungi queste due voci al `.gitignore` del progetto (o crealo se non esiste). Se in Vulcan Cloud non hai accesso al `.gitignore`, includi una nota nel README o nei commenti del `sync.mjs`:

```
# Sync system
.sync-snapshot.json
sync.mjs
```

- `.sync-snapshot.json` e l'ultimo snapshot usato dal comando `diff` — e un artefatto locale, non va committato
- `sync.mjs` e lo script CLI che vive solo nell'ambiente locale — in Vulcan Cloud non serve (la logica equivalente e nel SyncTab browser-side)