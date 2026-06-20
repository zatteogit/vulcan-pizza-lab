# Workflow: Repository Initialize

## Purpose

Scan the repository structure, propose a knowledge folder layout (chapters/categories tailored to the project), and create an `index.md` with placeholders after user approval.

## Pre-flight Check

1. Load `{project-root}/knowledge/workflow-state.json`
2. If the knowledge base already has chapters with status `completed`, inform the user:
   - "The knowledge base already has N chapters at X% coverage. Running Repository Initialize will **not** overwrite existing documentation — it will only propose new chapters for undocumented areas or restructure if explicitly approved."
3. If no `workflow-state.json` exists, this is a fresh start.

## Step 1: Scan Repository Structure

Scan the entire project tree, focusing on:

- `src/` — all source code files (`.ts`, `.tsx`, `.js`, `.jsx`)
- `public/` — static assets
- `docs/` — existing documentation
- Configuration files at root (`vite.config.ts`, `tsconfig.json`, `package.json`)

Build a mental map of:
- **Directories** and their logical groupings
- **Key files** by size and import count (larger files = more critical)
- **Domain boundaries** (e.g., engine vs. UI vs. data vs. routing)

## Step 2: Propose Chapter Layout

Based on the scan, propose a chapter structure. Each chapter should:

- Cover a **logical domain** of the codebase (not just a directory)
- Have a descriptive `id` (kebab-case) and `title`
- List the key files it will document
- Note any cross-chapter dependencies

Present the proposal as a table:

| ID | Title | Key Files | Est. Complexity |
|----|-------|-----------|-----------------|
| ... | ... | ... | Low/Med/High |

**Priority order**: Place chapters for priority areas (pizza engine, recipe flow) first.

## Step 3: Wait for User Approval

**STOP.** Present the proposal and ask:
- "Does this chapter structure look right?"
- "Would you like to add, remove, or rename any chapters?"
- "Should I proceed with creating the directory structure and index?"

**Do not create any files until the user explicitly approves.**

## Step 4: Create Directory Structure

After approval, for each chapter:

1. Create `knowledge/core_knowledge/{chapter-id}/` directory
2. Create `knowledge/core_knowledge/{chapter-id}/README.md` with template:

```markdown
# {Chapter Title}

> Status: 🔲 pending | Last scan: never

## Summary

_Pending deep scan._

## Table of Contents

_Will be populated after code scan._

## Source Files

| File | Lines | Purpose |
|------|-------|---------|
| ... | ... | ... |
```

3. Create/update `knowledge/core_knowledge/index.md` with the full chapter table
4. Create/update `knowledge/workflow-state.json` with all chapters in `pending` status

## Step 5: Report

Summarize what was created:
- Number of chapter directories
- Files created
- Next recommended action: "Run **Code Scan & Document** (CS) to begin documenting chapters"

Update `workflow-state.json` with the current state.
