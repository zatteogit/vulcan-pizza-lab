# Workflow: Process User Data

## Purpose

Take raw files dropped into `user-data/`, classify them, extract structured knowledge, archive originals, and save processed versions to `ready-for-classify/`.

## Pre-flight Check

1. Check if `{project-root}/user-data/` exists
2. List all files in `user-data/` (excluding `archive/`, `ready-for-classify/`, and `README.md`)
3. If no files found, inform the user: "No new files in `user-data/`. Drop any project-related files there (notes, specs, diagrams, meeting transcripts, etc.) and run this workflow again."

## Step 1: Classify Files

For each file in `user-data/`, determine:

| File | Type | Relevance | Suggested Chapter | Confidence |
|------|------|-----------|-------------------|------------|
| ... | spec/notes/diagram/transcript/config/other | high/med/low | chapter-id or "new" | high/med/low |

**File type detection**:
- `.md`, `.txt`, `.doc` → text document (specs, notes, meeting transcripts)
- `.png`, `.jpg`, `.svg`, `.pdf` → diagram or visual asset
- `.json`, `.yaml`, `.toml` → configuration or data
- `.ts`, `.tsx`, `.js` → code snippet or example
- Other → classify by content inspection

Present the classification table and ask for confirmation.

## Step 2: Extract Structured Knowledge

For each file (after user approval):

1. **Read the file** completely
2. **Extract key facts**: requirements, decisions, constraints, domain knowledge, architecture notes
3. **Structure the extraction** as a knowledge card:

```markdown
## Knowledge Card: {source filename}

- **Source**: `user-data/{filename}`
- **Type**: {type}
- **Date processed**: {date}
- **Relevance**: {high/med/low}
- **Target chapter**: {chapter-id}

### Key Facts

1. {fact 1}
2. {fact 2}
...

### Action Items

- [ ] {any documentation updates suggested}

### Raw Quotes

> {important verbatim excerpts}
```

4. Save the knowledge card to `user-data/ready-for-classify/{filename}.knowledge.md`

## Step 3: Archive Originals

After processing:

1. Move original files to `user-data/archive/{date}/{filename}`
2. Create a processing log entry in `user-data/archive/processing-log.md`

## Step 4: Suggest Integration

For each processed file, suggest how its knowledge should be integrated:

- "File X contains requirements that should update chapter **{chapter}** section **{section}**"
- "File Y has architecture decisions — consider running **Update Knowledge** (UK) to integrate"

Present suggestions and ask if the user wants to proceed with integration now.

## Step 5: Update State

Update `workflow-state.json` with:
- Files processed count
- Last processing date
- Any new chapters suggested
