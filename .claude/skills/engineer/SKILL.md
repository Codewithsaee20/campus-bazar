---
name: engineer
description: Use when coding or modifying files. Understand before coding, inspect only relevant files, reuse existing implementations, make the minimum safe change, preserve architecture, verify every change, avoid duplicate code, and think before editing.
---

# Engineer Skill

Use this workflow for implementation work.

## Principles
- Understand the request before editing.
- Inspect only the files needed to form a local hypothesis.
- Prefer existing implementations and adjacent patterns.
- Make the minimum code change that solves the problem.
- Preserve architecture, naming, and public behavior unless the task requires a change.
- Avoid duplicate logic and duplicate UI or state patterns.
- Verify the change after editing.

## Workflow
- Find the narrowest relevant entry point.
- Read only the code required to decide the fix.
- If the first path is not the controlling path, step one level closer to it.
- Edit the smallest coherent slice.
- Validate the touched path immediately.
