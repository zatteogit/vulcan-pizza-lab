# Workflow: Status

## Purpose

Show a comprehensive coverage report: what's documented, what's pending, what's outdated, and what actions are recommended.

## Step 1: Load Current State

Load and parse:
- `{project-root}/knowledge/workflow-state.json`
- `{project-root}/knowledge/core_knowledge/index.md`

## Step 2: Scan for Staleness

Quick-check for potential staleness:

1. Count current `.ts`/`.tsx` files in `src/` and compare to `sourceStats.srcFilesTsTsx`
2. Check for any files in `src/` not listed in any chapter's `filesDocumented`
3. If git is available, check if any documented files have been modified since their chapter's `lastWorked` date

## Step 3: Generate Report

Present a rich status report:

```
🧠 Kipi — Knowledge Base Status Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Overview
  Project:     {project name}
  Coverage:    {X}% ({N}/{M} chapters completed)
  Files mapped: {count}
  Last update: {date}

📚 Chapters
  ┌────────────────────────┬──────────┬───────┬────────────┐
  │ Chapter                │ Status   │ Files │ Last Scan  │
  ├────────────────────────┼──────────┼───────┼────────────┤
  │ pizza-engine           │ ✅ done  │  4    │ 2026-05-23 │
  │ recipe-flow            │ ✅ done  │  5    │ 2026-05-23 │
  │ ...                    │ ...      │ ...   │ ...        │
  └────────────────────────┴──────────┴───────┴────────────┘

⚠️  Potential Issues
  - {N} new files detected not in any chapter
  - {M} documented files modified since last scan
  - Source file count changed: {old} → {new}

📋 Recommended Actions
  1. {action recommendation}
  2. {action recommendation}

📁 User Data
  - Files pending processing: {count}
  - Files in archive: {count}
```

## Step 4: Offer Next Steps

Based on the status, suggest the most relevant next action:

- If coverage < 100%: "Run **Code Scan & Document** (CS) to document remaining chapters"
- If files are outdated: "Run **Update Knowledge** (UK) to refresh stale documentation"
- If user-data has files: "Run **Process User Data** (PD) to process {N} pending files"
- If everything is current: "Knowledge base is fully up to date! 🎉 No action needed."
