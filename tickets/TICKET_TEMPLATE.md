# Ticket Template

> Generic ticket for general work, subtasks, or smaller items. For features, bugs, audits, or sprints, use the specific template instead.

## Metadata
- **ID**: TICKET-###
- **Title**: [Clear, concise description]
- **Type**: Task / Subtask / Documentation
- **Status**: Backlog / Ready / In Progress / Review / Testing / Done
- **Priority**: Critical / High / Medium / Low
- **Assigned**: [Name or empty]
- **Created**: [YYYY-MM-DD]
- **Updated**: [YYYY-MM-DD]

## Description

[Write a clear summary of what needs to be done. Include context if not obvious.]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Subtasks

If this is a parent ticket:
- [ ] [Subtask 1](./TICKET-###-subtask-1.md)
- [ ] [Subtask 2](./TICKET-###-subtask-2.md)

## Dependencies

- Blocked by: [Link to blocking ticket]
- Blocks: [Link to blocked ticket]
- Related: [Link to related tickets]

## Notes

[Additional context, decisions, or findings relevant to this work]

## References

- Documentation: [Link]
- Code: [File path or line number if applicable]
- External: [Link to external resource]

---

## Lifecycle

### When Ready
Ensure:
- [ ] Requirements are clear
- [ ] Acceptance criteria are testable
- [ ] Dependencies identified
- [ ] Estimated effort realistic

### When Starting
- [ ] Update Status to "In Progress"
- [ ] Create branch for code changes
- [ ] Link PR to this ticket

### When Complete
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Status set to "Done"
- [ ] Archive if needed
