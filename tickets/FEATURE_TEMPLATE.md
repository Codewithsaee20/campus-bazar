# Feature Template

> Use this for new features, enhancements, and significant product improvements.

## Metadata
- **ID**: FEATURE-###
- **Title**: [Feature name and brief value statement]
- **Status**: Backlog / Ready / In Progress / Review / Testing / Done
- **Priority**: Critical / High / Medium / Low
- **Assigned**: [Name or empty]
- **Epic**: [e.g., Authentication, Marketplace]
- **Created**: [YYYY-MM-DD]
- **Target Release**: [e.g., v1.2.0]

## Overview

### What
[Clear, concise description of what is being built]

### Why
[Problem statement and business value. Why are we building this?]

### Who
[Target user or stakeholder. Who benefits from this?]

## Requirements

### Functional
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Non-Functional
- [ ] Performance: [e.g., <500ms response time]
- [ ] Accessibility: [e.g., WCAG 2.1 AA compliance]
- [ ] Security: [e.g., Input validation, encryption]
- [ ] Scalability: [e.g., Handle 1000+ concurrent users]

## Acceptance Criteria

- [ ] Feature implemented per requirements
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests passed
- [ ] Manual testing in staging completed
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] No regressions detected

## Design & Technical Approach

[How will this be implemented? Include architecture decisions, key files, or design patterns.]

### Architecture Changes
- [ ] Database schema changes: [Details]
- [ ] API changes: [Endpoints or structure changes]
- [ ] Frontend components: [New or modified components]

### Proposed Implementation

```
[Pseudocode, component hierarchy, or architecture diagram]
```

## Dependencies

- Requires: [Link to prerequisite features/tickets]
- Blocked by: [Link to blocking items]
- Related: [Link to related features]

## Testing Strategy

### Unit Tests
- [ ] Test [component/function name]
- [ ] Test [edge case]

### Integration Tests
- [ ] Test [workflow]
- [ ] Test [API integration]

### Manual Testing
- [ ] Test [user workflow]
- [ ] Test in [browser]

### Regression Testing
- [ ] Existing features still work
- [ ] No performance degradation

## Success Metrics

- [ ] Metric 1: [Target value]
- [ ] Metric 2: [Target value]
- [ ] User feedback: [Success criteria]

## Timeline

- **Estimated Effort**: [X hours/days]
- **Start Date**: [YYYY-MM-DD]
- **Target Completion**: [YYYY-MM-DD]

## Notes

[Additional context, decisions, open questions, or risks]

## Subtasks

Breakdown into smaller, implementable tasks:
- [ ] [TICKET-### Task 1](./TICKET-###-task-1.md)
- [ ] [TICKET-### Task 2](./TICKET-###-task-2.md)

## References

- Design: [Link to wireframes, mockups]
- Documentation: [Link to design doc]
- Related Issues: [Link to related feature/bug]

---

## Lifecycle

### Planning
- [ ] Requirements finalized
- [ ] Design reviewed
- [ ] Effort estimated
- [ ] Dependencies identified

### Implementation
- [ ] Branch created
- [ ] Code implemented
- [ ] Tests written
- [ ] Self-reviewed

### Review
- [ ] PR submitted
- [ ] Code reviewed and approved
- [ ] Tests passing

### Testing
- [ ] Staging deployed
- [ ] QA testing complete
- [ ] No blockers found

### Done
- [ ] Merged to main
- [ ] Deployed to production (if applicable)
- [ ] Monitored for issues
- [ ] Documentation updated
