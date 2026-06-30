---
description: Perform minimal safe refactoring without changing intended behavior.
---

# /refactor

Goal: improve structure while keeping behavior stable.

Workflow:
1. Identify the smallest safe refactoring opportunity.
2. Preserve behavior, interfaces, and architecture.
3. Prefer existing patterns over new abstractions.
4. Validate the touched code path after editing.

Output:
- What was improved.
- Why the change is safe.
- What was intentionally left unchanged.
