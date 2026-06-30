---
description: Review current changes for correctness, safety, maintainability, and regressions.
---

# /review

Goal: review the current diff or change set like a senior engineer.

Workflow:
1. Read the change set in context.
2. Check correctness, security, edge cases, performance, and readability.
3. Rank issues by severity.
4. Distinguish real defects from style preferences.

Output:
- Findings first, ordered by severity.
- File references for each issue.
- Short explanation of why it matters.
- Brief summary only after the findings.
