# Tickets & Work Management

This directory contains all work items (features, bugs, audits, sprints) organized by epic.

## Quick Start

1. **Create a new ticket**: Copy the appropriate template below
2. **Follow naming**: Use `[TYPE]-###-short-description.md` (e.g., `FEATURE-001-user-auth.md`)
3. **Link to epics**: File in relevant epic folder (e.g., `epics/authentication/FEATURE-001-user-auth.md`)
4. **Update status**: Use Status field to track progress

## Templates

Use the relevant template when creating new work:

- **[TICKET_TEMPLATE.md](./TICKET_TEMPLATE.md)** — General work items, subtasks
- **[FEATURE_TEMPLATE.md](./FEATURE_TEMPLATE.md)** — New features and enhancements
- **[BUG_TEMPLATE.md](./BUG_TEMPLATE.md)** — Bug reports and fixes
- **[AUDIT_TEMPLATE.md](./AUDIT_TEMPLATE.md)** — Code reviews, audits, assessments
- **[SPRINT_TEMPLATE.md](./SPRINT_TEMPLATE.md)** — Sprint planning and tracking
- **[CHANGELOG_TEMPLATE.md](./CHANGELOG_TEMPLATE.md)** — Release notes and changes

## Epic Structure

Tickets are organized by epic (major feature area):

```
epics/
├── authentication/          # User auth, OTP, JWT
├── marketplace/             # Buying/selling, listings
├── user-profiles/           # User management, profiles
├── analytics/               # Tracking, reporting
├── infrastructure/          # DevOps, deployment, monitoring
└── [add-as-needed]/        # New epics created dynamically
```

## Ticket Status

- **Backlog** — Not started, awaiting capacity
- **Ready** — Refined, ready to implement
- **In Progress** — Currently being worked on
- **Review** — Code review in progress
- **Testing** — QA validation
- **Done** — Complete, merged to main

## Priority Levels

- **Critical** — Blocks other work or affects production
- **High** — Important, should be done soon
- **Medium** — Normal priority work
- **Low** — Nice to have, can be deferred

## Linking & References

Use these formats for linking:
- Internal: `[Link text](./epics/folder/TICKET-###-name.md)`
- Pull Request: Reference in PR description with ticket number
- Related: `Related: ../other-folder/FEATURE-##.md`

## Archiving

Completed tickets can be archived:
1. Move to `_archive/` folder
2. Keep searchable copy in history
3. Link to merged PR for reference

## Examples

- `epics/authentication/FEATURE-001-otp-verification.md`
- `epics/marketplace/BUG-015-listing-price-validation.md`
- `epics/infrastructure/AUDIT-003-performance-review.md`

---

For organization-wide tracking and sprint management, see `SPRINT_TEMPLATE.md`.
