---
name: context-manager
description: Use when optimizing token consumption by loading only relevant files, summarizing findings, avoiding whole-repository reads, forgetting irrelevant context, never repeating visible code, and keeping responses concise.
---

# Context Manager Skill

Use this workflow to control context size.

## Principles
- Load only files that help answer the current question.
- Avoid reading the entire repository when a local slice is enough.
- Summarize findings before moving on.
- Drop irrelevant context once it is no longer needed.
- Never repeat code that is already visible.
- Keep responses dense and concise.

## Workflow
- Start from a concrete anchor.
- Read the narrowest set of files needed.
- Summarize what those files prove.
- Discard unrelated paths and continue only if necessary.
