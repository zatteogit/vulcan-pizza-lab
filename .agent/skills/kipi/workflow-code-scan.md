# Workflow: Code Scan & Document

## Purpose

Deep-scan the codebase in batches (by chapter/subfolder), write detailed chapter files using a consistent template, and update the index. Start with the areas the user identified as most important.

## Pre-flight Check

1. Load `{project-root}/knowledge/workflow-state.json`
2. Identify chapters with status `pending` or `outdated`
3. If all chapters are `completed`, inform the user and suggest using **Update Knowledge** instead
4. Present a summary of what needs scanning and the recommended order

## Step 1: Select Next Chapter

Choose the next chapter to scan based on:
1. **User-specified priority** (pizza-engine, recipe-flow first)
2. **Status** (`pending` before `outdated`)
3. **Dependency order** (foundational chapters before those that reference them)

Announce: "I'll scan **{chapter title}** next. This covers {N} files: {file list}. Proceed?"

**Wait for user confirmation.**

## Step 2: Deep Scan Files

For each source file in the chapter, perform a **deep scan**:

### Analysis Template (per file)

1. **File Identity**: path, lines of code, last modified
2. **Purpose**: one-paragraph description of what this file does and why it exists
3. **Exports**: all public exports with types/signatures
4. **Key Data Structures**: interfaces, types, enums, constants with documentation
5. **Core Logic**: main functions/components with:
   - Input/output description
   - Algorithm or flow description
   - Edge cases and invariants
   - Error handling patterns
6. **Dependencies**: what this file imports and why
7. **Dependents**: what imports this file (reverse dependency)
8. **Design Decisions**: any non-obvious architectural choices and their rationale
9. **Cross-references**: links to related chapters/files

### Batching Rules

- Scan **at most 3 files per batch** to maintain quality
- After each batch, present findings to the user
- Wait for approval before writing to the chapter file
- Track progress in `workflow-state.json` after each batch

## Step 3: Write Chapter Documentation

After scanning all files in the chapter, compile into the chapter's `README.md`:

```markdown
# {Chapter Title}

> Status: ✅ completed | Last scan: {date} | Files: {count}

## Summary

{2-3 paragraph overview of this domain, its role in the system, and key concepts}

## Table of Contents

- [Sub-chapter 1](#sub-chapter-1)
- [Sub-chapter 2](#sub-chapter-2)
- ...

## Source Files

| File | Lines | Purpose | Key Exports |
|------|-------|---------|-------------|
| [`filename.ts`](../../src/path/to/file.ts) | N | ... | ... |

---

## {Sub-chapter for each logical group}

### {File or concept name}

{Deep documentation following the analysis template}

#### Exports

| Export | Type | Description |
|--------|------|-------------|
| ... | ... | ... |

#### Data Flow

{Mermaid diagram if helpful}

#### Edge Cases & Invariants

- ...

---
```

**Present the full chapter draft to the user before writing.**

## Step 4: Update State

After user approval and writing:

1. Update the chapter's status to `completed` in `workflow-state.json`
2. Update `filesDocumented` list
3. Update `lastWorked` date
4. Update `knowledge/core_knowledge/index.md` coverage table
5. Update `coveragePercent` in workflow state

## Step 5: Continue or Complete

- If more chapters remain: "Chapter **{title}** complete. Next up: **{next chapter}**. Continue?"
- If all chapters done: "🎉 Full coverage achieved! {N} chapters, {M} files documented. Use **Update Knowledge** (UK) to keep docs in sync with code changes."
