---
description: Systematically reproduce a bug, isolate the root cause, and apply the smallest verified fix.
---

# /debug

Goal: resolve a failure by tracing it to the narrowest responsible code path.

Workflow:
1. Reproduce the problem or identify the failing path.
2. Isolate the controlling code and form a local hypothesis.
3. Apply the smallest fix that tests the hypothesis.
4. Verify the result with the cheapest useful check.

Output:
- Root cause, not speculation.
- Minimal fix explanation.
- Validation result.
- Remaining risks if the issue is partially reproduced.
