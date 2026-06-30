# Bug Template

> Use this for bug reports, defects, and issue fixes.

## Metadata
- **ID**: BUG-###
- **Title**: [Short description of the bug]
- **Status**: Backlog / Ready / In Progress / Review / Testing / Done
- **Priority**: Critical / High / Medium / Low
- **Assigned**: [Name or empty]
- **Created**: [YYYY-MM-DD]
- **Environment**: Development / Staging / Production

## Summary

[Brief, clear description of what's broken]

## Details

### Reproduction Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Expected result]
5. [Actual result]

### Environment

- **Browser/Client**: [e.g., Chrome 120, Safari 17]
- **OS**: [e.g., Windows 11, macOS 14]
- **Device**: [e.g., Desktop, iPhone 15]
- **Version**: [e.g., v1.0.5]
- **Database**: [e.g., Production, Staging]

### Frequency

- **Always**: Bug occurs every time
- **Often**: Bug occurs most of the time (~70%)
- **Sometimes**: Bug occurs occasionally (~30%)
- **Rare**: Bug occurs rarely (<5%)
- **One-time**: Only observed once

### Affected Users/Features

- Number of affected users: [e.g., 100, unknown]
- Affected features: [e.g., User login, Book search]
- Impact scope: [Single user, feature, service, system-wide]

## Root Cause Analysis

[Describe the suspected or confirmed root cause. Include error messages, logs, or code pointers if known.]

### Error Messages

```
[Paste full error messages or stack traces]
```

### Related Code

- File: [Path to relevant code]
- Line: [Line number if applicable]
- Function: [Function name]

## Solution

[Describe the proposed fix or approach to resolve the bug]

### Approach

1. [Fix step 1]
2. [Fix step 2]
3. [Validation step]

## Acceptance Criteria

- [ ] Bug is reproducible
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Fix does not introduce regressions
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing confirms resolution
- [ ] Code reviewed
- [ ] Fixed in [version/branch]

## Testing Strategy

### Reproduction Test

[Steps to verify the bug is fixed]

### Regression Tests

- [ ] Test existing functionality still works
- [ ] Test related features unaffected
- [ ] Test edge cases

## Timeline

- **Reported**: [YYYY-MM-DD]
- **Investigated**: [YYYY-MM-DD]
- **Priority Set**: [YYYY-MM-DD]
- **Target Fix**: [YYYY-MM-DD]

## Notes

[Additional context, workarounds for users, or observations]

### Workaround (if available)

[Temporary solution users can apply while waiting for fix]

## Related Issues

- Duplicate of: [Link if this is a duplicate]
- Related to: [Link to related bug or feature]
- Similar: [Link to similar bugs]

## Attachments

- Screenshot: [If visual bug, include screenshot or video]
- Logs: [Error logs or debug output]
- Data: [Example data that triggers the bug]

---

## Lifecycle

### Reported
- [ ] Bug clearly described
- [ ] Steps to reproduce provided
- [ ] Environment documented
- [ ] Severity assessed

### Investigating
- [ ] Attempted reproduction
- [ ] Root cause identified
- [ ] Impact assessed
- [ ] Solution planned

### Ready to Fix
- [ ] Root cause confirmed
- [ ] Fix approach agreed
- [ ] Assigned to developer
- [ ] Priority confirmed

### In Progress
- [ ] Branch created
- [ ] Fix implemented
- [ ] Tests written

### Testing
- [ ] Fix verified in staging
- [ ] Regression tests passing
- [ ] Manual testing complete
- [ ] Approved for deployment

### Done
- [ ] Deployed to production
- [ ] No new issues reported
- [ ] Monitored for regressions
- [ ] Release notes updated
