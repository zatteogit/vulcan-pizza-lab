# User Data

This directory is where you drop raw project-related files for Kipi to process.

## What to put here

- 📝 **Notes & specs** — design documents, meeting notes, requirement specs
- 📊 **Diagrams** — architecture diagrams, flow charts, wireframes
- 🎙️ **Transcripts** — meeting transcripts, interview notes
- 📄 **Config & data** — configuration files, database schemas, API specs
- 💻 **Code snippets** — reference implementations, examples

## How it works

1. **Drop files** here
2. **Run Kipi** and select **Process User Data** (PD)
3. Kipi will:
   - Classify each file by type and relevance
   - Extract structured knowledge into `ready-for-classify/`
   - Archive originals in `archive/`
   - Suggest which knowledge chapters to update

## Directory structure

```
user-data/
├── README.md            ← you are here
├── ready-for-classify/  ← processed knowledge cards (auto-created)
└── archive/             ← archived originals (auto-created)
```
