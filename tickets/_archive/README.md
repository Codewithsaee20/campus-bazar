# Completed Tickets Archive

This directory contains completed tickets that have been archived but kept for historical reference.

## Structure

Completed tickets are organized by type:
- `features/` — Completed features
- `bugs/` — Fixed bugs  
- `audits/` — Completed audits
- `tasks/` — Completed tasks

## How to Archive

When a ticket is complete and merged:
1. Copy the ticket file to `_archive/[type]/`
2. Update the filename to include completion date: `TICKET-###-short-desc_COMPLETED-YYYY-MM-DD.md`
3. Delete from active epic folder
4. Keep link in epic README if needed for reference

## Example

```
_archive/
├── features/
│   └── FEATURE-001-user-auth_COMPLETED-2024-01-15.md
├── bugs/
│   └── BUG-042-login-error_COMPLETED-2024-01-20.md
└── audits/
    └── AUDIT-005-security-review_COMPLETED-2024-01-25.md
```

## Searching Archives

To find historical information:
1. Check by ticket ID in git history
2. Look for merged PR with ticket number
3. Search documentation for reference
4. Check commit messages for context
