---
name: debugger
description: Use when reproducing failures, isolating root cause, and creating the smallest verified fix.
---

# Debugger Skill

Use this workflow when something is failing.

## Principles
- Reproduce the failure before changing code.
- Isolate the root cause with a local hypothesis.
- Prefer the smallest fix that proves the hypothesis.
- Verify the fix with a targeted check.
- Explain the cause instead of guessing.

## Workflow
- Reproduce or confirm the failing path.
- Inspect the nearest controlling code path.
- Identify the cheapest check that can disconfirm the hypothesis.
- Make the smallest possible fix.
- Re-run the same check before expanding scope.
