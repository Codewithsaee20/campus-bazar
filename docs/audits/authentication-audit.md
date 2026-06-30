# Authentication Audit

## Module Overview

Authentication covers registration, OTP delivery and verification, token issuance and refresh, logout, and protected user access across the backend and frontend.

## Files Involved

- [backend/src/controllers/authController.js](../../backend/src/controllers/authController.js)
- [backend/src/routes/authRoute.js](../../backend/src/routes/authRoute.js)
- [backend/src/middleware/authMiddleware.js](../../backend/src/middleware/authMiddleware.js)
- [backend/src/models/user.model.js](../../backend/src/models/user.model.js)
- [backend/src/models/otp.model.js](../../backend/src/models/otp.model.js)
- [backend/src/services/authService.js](../../backend/src/services/authService.js)
- [backend/src/services/authMemoryStore.js](../../backend/src/services/authMemoryStore.js)
- [backend/server.js](../../backend/server.js)
- [frontend/src/App.jsx](../../frontend/src/App.jsx)
- [frontend/src/components/RouteGuards.jsx](../../frontend/src/components/RouteGuards.jsx)

## Manual Testing Checklist

- [ ] Register a new account with valid data.
- [ ] Request OTP and verify it with a valid code.
- [ ] Confirm invalid or expired OTP values are rejected.
- [ ] Confirm protected routes block unauthenticated users.
- [ ] Confirm refresh token flow restores an expired access token.
- [ ] Confirm logout clears session state.

## Code Review Checklist

- [ ] OTP generation and storage are not predictable.
- [ ] Token expiry, refresh, and logout flows are consistent.
- [ ] Input validation exists on all public auth endpoints.
- [ ] Authorization middleware is used on protected routes.
- [ ] Sensitive secrets and environment values are handled safely.

## Production Readiness Checklist

- [ ] Rate limiting is defined for OTP and login requests.
- [ ] Secrets are strong and stored outside the repository.
- [ ] Session expiration and refresh behavior are documented.
- [ ] Auth errors are observable in logs without exposing sensitive data.
- [ ] CORS and cookie behavior are correct in production.

## Bugs Found

- Weak token and OTP hardening concerns were noted in the engineering audit.
- OTP rate limiting is limited and should be reviewed.
- College/domain validation is narrow and may not cover future institutions.

## Notes

This module has dedicated audit coverage in [tickets/epics/authentication/AUDIT-001-authentication-authorization-and-session-audit.md](../../tickets/epics/authentication/AUDIT-001-authentication-authorization-and-session-audit.md).

## Final Status

Draft - audit document created; remediation status depends on the audit findings.
