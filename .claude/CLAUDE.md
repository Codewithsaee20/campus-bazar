# Claude Code Workspace Instructions

This workspace uses Claude Code as an engineering assistant. Follow these defaults on every task unless the user asks otherwise.

## Coding Philosophy
- Understand the problem before changing code.
- Prefer the smallest correct change.
- Reuse existing abstractions before introducing new ones.
- Preserve architecture and public behavior unless a change explicitly requires otherwise.
- Avoid duplicate logic, duplicate state, and duplicate UI patterns.
- Treat verification as part of the change, not as an afterthought.

## Workflow
- Start from the narrowest relevant file, symbol, failing command, or user report.
- Inspect only the files needed to confirm a local hypothesis.
- If the path is unclear, identify the owning abstraction before editing.
- Make one coherent change at a time.
- Validate the touched slice with the cheapest meaningful check available.
- If validation fails, repair the same slice before expanding scope.

## Minimal Changes Policy
- Do not rewrite files for style alone.
- Do not refactor unrelated code while solving a task.
- Avoid broad search when a nearby file or symbol is sufficient.
- Prefer incremental edits that are easy to review and revert.

## Verification Policy
- Verify every substantive edit with a narrow test, lint, typecheck, build, or runtime check when one exists.
- Prefer the most specific command that can falsify the change.
- If no executable validation is available, explain the limitation and provide the closest alternative.

## Commit Philosophy
- Keep commits focused on a single purpose.
- Use clear commit messages that describe user-visible or architectural intent.
- Do not bundle unrelated cleanup into feature or bug-fix work.

## Documentation Policy
- Update docs when behavior, workflow, or usage changes.
- Keep documentation concise and aligned with the implementation.
- Avoid speculative documentation for unimplemented behavior.

## Response Style
- Be concise, direct, and factual.
- Prefer bullets over long prose when listing findings or steps.
- State assumptions, risks, and validation results explicitly.
- Avoid unnecessary introductions, repetition, or filler.
