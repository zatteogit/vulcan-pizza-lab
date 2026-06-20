# Workflow: Update Knowledge

## Purpose

Analyze recent code changes or new information, propose specific updates to existing knowledge files, and apply only after user approval. This is the primary workflow for keeping documentation in sync with the codebase.

## Pre-flight Check

1. Load `{project-root}/knowledge/workflow-state.json`
2. Verify all chapters have status `completed` (warn if some are still `pending`)
3. Note the `lastWorked` date for each chapter

## Step 1: Detect Changes

Scan for changes since the last documentation update:

### Method A: Git-based detection (preferred)

```bash
git diff --name-only HEAD~{N} -- src/
git log --oneline -20 -- src/
```

Compare changed files against `filesDocumented` in each chapter's state to identify:
- **Modified files**: files that have changed since last scan
- **New files**: files not present in any chapter
- **Deleted files**: documented files that no longer exist

### Method B: Timestamp-based detection (fallback)

If git is not available, compare file modification times against `lastWorked` dates in `workflow-state.json`.

### Present Findings

| Change Type | File | Affected Chapter | Impact |
|-------------|------|------------------|--------|
| Modified | `src/app/components/pizza-engine.ts` | pizza-engine | High — core engine |
| New | `src/app/components/new-feature.tsx` | ? | Needs classification |
| Deleted | `src/app/components/old-thing.ts` | routing-shell | Remove docs |

**Wait for user to confirm which changes to process.**

## Step 2: Analyze Changed Files

For each confirmed change:

1. **Read the current file** completely
2. **Compare against existing documentation** in the relevant chapter
3. **Identify specific deltas**:
   - New exports or removed exports
   - Changed function signatures
   - Modified data structures
   - New logic branches or removed ones
   - Updated dependencies

4. **Draft update proposal** showing:
   - What section of the chapter needs updating
   - The specific text to add/modify/remove
   - Rationale for the change

## Step 3: Propose Updates

Present all proposed updates as a grouped diff:

```
Chapter: {chapter-title}

Section: {section-name}
- REMOVE: "{old text}"
+ ADD: "{new text}"

Reason: {why this change is needed}
```

**STOP. Wait for user approval.** The user may:
- Approve all changes
- Approve selectively
- Request modifications
- Reject changes

## Step 4: Apply Updates

After approval:

1. Update the relevant chapter `README.md` files
2. Update `knowledge/core_knowledge/index.md` if metrics changed
3. Handle new files:
   - Classify into existing chapter OR propose a new chapter
   - Deep-scan and document following the Code Scan template
4. Handle deleted files:
   - Remove documentation sections
   - Update file tables
   - Note the removal in the chapter's changelog

## Step 5: Update State

Update `workflow-state.json`:
- Set `lastWorked` to current date for all affected chapters
- Update `filesDocumented` lists
- Update `sourceStats` if file counts changed
- Update `coveragePercent`
- Set `nextRecommendedScan` to null if fully up-to-date
