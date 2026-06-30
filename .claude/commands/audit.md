---
description: Analyze the repository for bugs, dead code, security issues, and other prioritized findings.
---

# /audit

Goal: perform a focused repository audit and return the highest-value findings first.

Workflow:
1. Identify the most relevant entry points for the requested area.
2. Inspect only the code needed to verify actual behavior.
3. Look for correctness, security, performance, maintainability, and API consistency issues.
4. Validate findings against the implementation instead of guessing.

Output:
- Prioritized findings with severity labels.
- File references for each finding.
- Brief rationale and practical impact.
- Note any residual risk if coverage is incomplete.
