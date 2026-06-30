# CAMPUS BAZZAR - PRODUCTION ROADMAP

**Project:** Campus Bazzar - College P2P Book Marketplace  
**Target Audience:** 100-500 college students (Phase 1), 1000+ (Phase 2+)  
**Timeline:** 16 weeks (4 months)  
**Status:** Planning Phase

---

## Executive Summary

This roadmap outlines a systematic approach to bringing Campus Bazzar from **prototype to production-ready** status. The work is divided into 7 phases over 16 weeks, focusing on:

1. **Weeks 1-2:** Fix critical blockers (security, rate limiting)
2. **Weeks 3-4:** Architecture foundations (logging, error handling)
3. **Weeks 5-7:** Backend stabilization (pagination, validation, features)
4. **Weeks 8-10:** Frontend rebuild (UX, error states, performance)
5. **Weeks 11-12:** Security hardening (audit, penetration testing)
6. **Weeks 13-14:** Performance optimization (caching, database tuning)
7. **Week 15-16:** Deployment & launch (staging, QA, production setup)

**Total Estimated Effort:** 284 hours (~7 weeks of full-time work)

---

## PHASE 1: CRITICAL BUGS & SECURITY ISSUES (Weeks 1-2)

**Objective:** Fix blocking issues that prevent safe operation  
**Total Hours:** 48 hours  
**Team Size:** 2-3 developers

### P1.1: Rotate & Secure Credentials

| Aspect | Details |
|--------|---------|
| **Difficulty** | Easy |
| **Priority** | CRITICAL |
| **Dependencies** | None |
| **Estimated Hours** | 3 hours |
| **Expected Outcome** | All secrets rotated, .env removed from git history, credentials manager implemented |

**Tasks:**
- [ ] Identify all exposed credentials (MongoDB, JWT, email, Cloudinary, OAuth)
- [ ] Generate new MongoDB password and update connection string
- [ ] Generate new JWT secrets (use `openssl rand -base64 32`)
- [ ] Create new email app password (or OAuth2 token)
- [ ] Rotate Cloudinary API keys
- [ ] Remove .env from git history: `git filter-branch --tree-filter 'rm -f .env' HEAD`
- [ ] Create `.env.example` with placeholders
- [ ] Add `.env` to `.gitignore`
- [ ] Update deployment documentation with environment setup steps
- [ ] Brief team on credential management practices

**Success Criteria:**
- .env not in git history
- All credentials randomly generated (20+ char min)
- No credentials in code commits after this date
- .env.example has all required fields

---

### P1.2: Implement Rate Limiting

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | CRITICAL |
| **Dependencies** | P1.1 (new secrets) |
| **Estimated Hours** | 6 hours |
| **Expected Outcome** | Rate limiting on OTP, login, and API endpoints; DoS protection in place |

**Tasks:**
- [ ] Install `express-rate-limit` and `redis` (or in-memory fallback)
- [ ] Create rate limit middleware with configurable limits
- [ ] Configure OTP endpoint: 3 attempts per 15 minutes per email
- [ ] Configure login/register: 5 attempts per hour per IP
- [ ] Configure API endpoints: 100 requests/minute per token
- [ ] Add 429 (Too Many Requests) response with retry-after header
- [ ] Implement cleanup for expired rate limit records
- [ ] Add logging for rate limit violations
- [ ] Write tests for rate limiting behavior

**Rate Limiting Configuration:**
```
OTP Request: 3 attempts / 15 min / email
Verify OTP: 5 attempts / hour / email
Register: 2 registrations / hour / email
Order Create: 20 / hour / user
Listing Create: 50 / hour / user
API General: 100 / minute / token
```

**Success Criteria:**
- OTP endpoint rejects 4th attempt with 429
- Rate limit info in response headers
- Rate limits logged
- No false positives (different IPs not rate limited together)

---

### P1.3: Remove & Audit Git History for Secrets

| Aspect | Details |
|--------|---------|
| **Difficulty** | Easy |
| **Priority** | CRITICAL |
| **Dependencies** | P1.1 (all secrets rotated first) |
| **Estimated Hours** | 2 hours |
| **Expected Outcome** | No secrets in git history, git history clean |

**Tasks:**
- [ ] Run secret scanner: `git log -p | grep -i "password\|secret\|key\|token"`
- [ ] Use tool like `detect-secrets` or `git-secrets`
- [ ] Remove .env and any commits containing credentials
- [ ] Rewrite history: `git rebase -i` or `git filter-branch`
- [ ] Force push to main (after team coordination)
- [ ] Alert all developers to pull fresh copy
- [ ] Update documentation on secrets handling

**Success Criteria:**
- No credentials in any commit message or file
- Git history clean
- All developers have fresh clone

---

### P1.4: Add Input Validation Framework

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | CRITICAL |
| **Dependencies** | None |
| **Estimated Hours** | 8 hours |
| **Expected Outcome** | All endpoints validate input with consistent schema validation |

**Tasks:**
- [ ] Install `joi` (or `zod`) for schema validation
- [ ] Create validation schemas for all DTOs:
  - Auth (register, sendOTP, verifyOTP)
  - Listings (create, update)
  - Orders (create, cancel)
  - Ratings (create)
  - Interests (create)
  - Reports (create)
- [ ] Create validation middleware that applies schemas
- [ ] Update all controllers to use validation middleware
- [ ] Add detailed error messages for validation failures
- [ ] Test with invalid inputs (XSS, injection, etc.)

**Schema Examples:**
```javascript
const registerSchema = joi.object({
  name: joi.string().min(2).max(100).required(),
  email: joi.string().email().required(),
  phone: joi.string().regex(/^\+?[0-9]{10,15}$/).required(),
  department: joi.string().valid('CS', 'EC', 'ME', 'CE').required(),
  branch: joi.string().min(2).max(50).required(),
});
```

**Success Criteria:**
- All inputs validated before processing
- Invalid inputs rejected with 400 error
- No unvalidated data reaches database
- Validation tests passing

---

### P1.5: Security Headers & CORS Hardening

| Aspect | Details |
|--------|---------|
| **Difficulty** | Easy |
| **Priority** | HIGH |
| **Dependencies** | None |
| **Estimated Hours** | 4 hours |
| **Expected Outcome** | Proper CORS, security headers, no XSS/CSRF vulnerabilities |

**Tasks:**
- [ ] Install `helmet` middleware
- [ ] Configure CORS for specific origins only (not all localhost)
- [ ] Add CSRF token generation and validation
- [ ] Add security headers:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security: max-age=31536000
  - Content-Security-Policy: default-src 'self'
- [ ] Enable HTTPS only
- [ ] Implement SameSite cookie attribute
- [ ] Add CSRF middleware to all state-changing endpoints

**Success Criteria:**
- CORS only allows specific frontend origins
- Security headers present in all responses
- CSRF tokens required for POST/PUT/DELETE
- No warnings in security headers check

---

### P1.6: Move Tokens to HttpOnly Cookies

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P1.1 (secure token generation) |
| **Estimated Hours** | 5 hours |
| **Expected Outcome** | Tokens stored securely in httpOnly cookies, protected from XSS |

**Backend Tasks:**
- [ ] Update auth controller to set httpOnly cookies
- [ ] Set cookie options: `{ httpOnly: true, secure: true, sameSite: 'strict' }`
- [ ] Ensure refresh token also uses httpOnly
- [ ] Update logout to clear cookies
- [ ] Test cookie lifecycle

**Frontend Tasks:**
- [ ] Remove token from localStorage
- [ ] Remove Authorization header setup in axios (cookies auto-sent)
- [ ] Update API interceptor to not use Bearer token
- [ ] Test authentication flow with new cookie-based approach

**Success Criteria:**
- Access token in httpOnly cookie
- Refresh token in httpOnly cookie
- Token not accessible from JavaScript (safe from XSS)
- Cookies auto-sent with requests
- Authentication still works

---

## PHASE 2: ARCHITECTURE IMPROVEMENTS (Weeks 3-4)

**Objective:** Build foundational systems for production operation  
**Total Hours:** 56 hours  
**Team Size:** 2 developers

### P2.1: Implement Structured Logging

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | None |
| **Estimated Hours** | 8 hours |
| **Expected Outcome** | All operations logged with structured format, sensitive data redacted |

**Tasks:**
- [ ] Install and configure `winston` logger
- [ ] Create logger configuration for development/production
- [ ] Add transport for console, file, and external service (Loggly/Papertrail)
- [ ] Create middleware to log all requests with:
  - Request ID (uuid)
  - Timestamp
  - HTTP method & path
  - Response status
  - Response time
  - User ID (if authenticated)
- [ ] Add error logging with stack traces
- [ ] Create sanitization middleware to redact:
  - Passwords
  - Tokens
  - API keys
  - Email addresses (optional)
  - Phone numbers (optional)
- [ ] Update all service/controller logging to use structured format
- [ ] Add performance logging for database queries

**Log Format Example:**
```json
{
  "timestamp": "2026-06-28T10:30:45.123Z",
  "level": "info",
  "requestId": "abc-123-def",
  "userId": "user-id",
  "method": "POST",
  "path": "/api/v1/listings",
  "statusCode": 201,
  "duration": 245,
  "message": "Listing created successfully"
}
```

**Success Criteria:**
- All requests logged
- No credentials in logs
- Error stack traces captured
- Request IDs for tracing
- Performance metrics logged

---

### P2.2: Create Error Tracking & Monitoring Setup

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P2.1 (logging system) |
| **Estimated Hours** | 6 hours |
| **Expected Outcome** | Real-time error alerts, crash reporting, uptime monitoring |

**Tasks:**
- [ ] Set up Sentry (free tier) for error tracking
- [ ] Install Sentry SDK in backend & frontend
- [ ] Configure Sentry to capture:
  - Unhandled exceptions
  - API errors
  - Frontend errors
  - Performance issues
- [ ] Set up error alerts (Slack/email)
- [ ] Add uptime monitoring (Pingdom/UptimeRobot)
- [ ] Create monitoring dashboard
- [ ] Document alert response procedures
- [ ] Set up on-call rotation (if multiple developers)

**Success Criteria:**
- Errors sent to Sentry
- Alerts triggered for critical errors
- Uptime monitoring active
- Dashboard accessible

---

### P2.3: Fix Database Connection & Implement Connection Pooling

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | None |
| **Estimated Hours** | 4 hours |
| **Expected Outcome** | Reliable database connection, connection pooling, graceful reconnection |

**Tasks:**
- [ ] Review current MongoDB connection in dbconnection.js
- [ ] Add connection pooling configuration:
  - `minPoolSize: 2`
  - `maxPoolSize: 10`
  - `maxIdleTimeMS: 45000`
- [ ] Implement retry logic with exponential backoff
- [ ] Add health check on startup (can't start without DB)
- [ ] Implement graceful shutdown (close connections)
- [ ] Add connection monitoring/logging
- [ ] Test connection failure scenarios

**Success Criteria:**
- Server refuses to start without database
- Connections pooled properly
- Automatic reconnection on failure
- No connection leaks

---

### P2.4: Implement Health Check Endpoint

| Aspect | Details |
|--------|---------|
| **Difficulty** | Easy |
| **Priority** | HIGH |
| **Dependencies** | P2.3 (connection pooling) |
| **Estimated Hours** | 3 hours |
| **Expected Outcome** | Comprehensive health check endpoint, used by load balancers |

**Tasks:**
- [ ] Create comprehensive health check endpoint at `GET /health`
- [ ] Check components:
  - Database connectivity
  - API responsiveness
  - Cloudinary connectivity (optional ping)
  - Email service (check configuration)
  - Memory usage
  - Node version
- [ ] Return status object:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-06-28T10:30:45Z",
    "database": "connected",
    "uptime": 3600,
    "memory": "45MB",
    "components": {
      "api": "ok",
      "database": "ok",
      "email": "configured",
      "cloudinary": "ok"
    }
  }
  ```
- [ ] Add health check interval monitoring
- [ ] Document health check API

**Success Criteria:**
- Health endpoint returns comprehensive status
- Can be used by load balancers
- All critical components checked
- Useful for debugging

---

### P2.5: Implement Request/Response Middleware

| Aspect | Details |
|--------|---------|
| **Difficulty** | Easy |
| **Priority** | MEDIUM |
| **Dependencies** | P2.1 (logging) |
| **Estimated Hours** | 3 hours |
| **Expected Outcome** | Consistent request IDs, response time tracking, API metric collection |

**Tasks:**
- [ ] Add request ID middleware (uuid per request)
- [ ] Add request size validation middleware
- [ ] Add response time tracking
- [ ] Add request body/response body logging (for errors)
- [ ] Add API metric collection (endpoints, response times)
- [ ] Create middleware to attach request ID to logs

**Success Criteria:**
- Every request has unique ID
- Response times tracked
- Large requests rejected
- Metrics available

---

### P2.6: Create Database Backup Strategy

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P2.1 (logging) |
| **Estimated Hours** | 6 hours |
| **Expected Outcome** | Automated daily backups, recovery tested, backup integrity verified |

**Tasks:**
- [ ] If using MongoDB Atlas: enable automatic backups (M10+ cluster)
- [ ] If self-hosted MongoDB:
  - [ ] Set up automated mongodump daily
  - [ ] Store backups in S3 or cloud storage
  - [ ] Retain 30 days of backups
  - [ ] Set up backup rotation script
- [ ] Document backup/restore procedure
- [ ] Test backup restoration (dry run)
- [ ] Create disaster recovery runbook
- [ ] Set up backup monitoring (alerts if backup fails)

**Success Criteria:**
- Daily backups automated
- Backups stored securely
- Can restore from backup in < 1 hour
- Backup integrity verified

---

### P2.7: Fix .env Configuration Management

| Aspect | Details |
|--------|---------|
| **Difficulty** | Easy |
| **Priority** | HIGH |
| **Dependencies** | P1.1 (new secrets) |
| **Estimated Hours** | 2 hours |
| **Expected Outcome** | No .env in repo, configuration management best practices |

**Tasks:**
- [ ] Create `.env.example` with all required variables
- [ ] Update README with environment setup instructions
- [ ] Document each env variable and its purpose
- [ ] Create setup script for first-time developers
- [ ] Consider environment configuration management tool:
  - For production: use managed secrets (AWS Secrets Manager, Vault)
  - For development: local .env (in .gitignore)
  - For testing: test.env with safe values
- [ ] Update deployment documentation

**Success Criteria:**
- No .env in git
- .env.example guides setup
- All developers have local .env
- Production uses secure secret manager

---

## PHASE 3: BACKEND STABILIZATION (Weeks 5-7)

**Objective:** Complete backend features, add pagination, improve data consistency  
**Total Hours:** 56 hours  
**Team Size:** 2-3 developers

### P3.1: Implement Pagination Everywhere

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | CRITICAL |
| **Dependencies** | P2.1 (logging) |
| **Estimated Hours** | 8 hours |
| **Expected Outcome** | All list endpoints paginated, frontend handles pagination UI |

**Endpoints to Paginate:**
- GET /listings (default 20 items)
- GET /orders/my/buying
- GET /orders/my/selling
- GET /ratings/:userId
- GET /interest/my
- GET /interest/sent
- GET /categories (if many)
- GET /reports (admin)

**Implementation:**
- [ ] Add pagination helper function
- [ ] Add query parameters: `page` (default 1), `limit` (default 20, max 100)
- [ ] Return pagination metadata:
  ```json
  {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 543,
      "pages": 28,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```
- [ ] Add sorting parameter: `sort` (createdAt, price, rating)
- [ ] Update frontend to handle pagination
- [ ] Add "load more" or pagination UI

**Success Criteria:**
- All list endpoints paginated
- Default limit 20, max 100
- Pagination metadata in response
- Frontend shows page numbers or load more button
- No performance issues with large datasets

---

### P3.2: Complete Rating System (Update & Delete)

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P3.1 (pagination) |
| **Estimated Hours** | 6 hours |
| **Expected Outcome** | Full rating lifecycle (create, read, update, delete) |

**Tasks:**
- [ ] Implement missing `updateRating()` method on User model
- [ ] Create PUT endpoint: `/ratings/:ratingId` to update rating
  - [ ] Allow updating rating score and review text
  - [ ] Ensure only original reviewer can update
  - [ ] Recalculate user rating aggregate
- [ ] Create DELETE endpoint: `/ratings/:ratingId`
  - [ ] Only original reviewer can delete
  - [ ] Update user rating aggregate when deleted
- [ ] Update ratingService with update/delete logic
- [ ] Add validation (rating 1-5, review max 1000 chars)
- [ ] Use MongoDB aggregation pipeline for rating calculation:
  ```javascript
  User.aggregate([
    { $match: { _id: userId } },
    { $lookup: { from: 'ratings', localField: '_id', foreignField: 'toUserId', as: 'ratings' } },
    { $group: { _id: '$_id', avgRating: { $avg: '$ratings.rating' }, totalRatings: { $sum: 1 } } }
  ])
  ```

**Success Criteria:**
- Rating can be updated and deleted
- User rating aggregate correctly calculated
- Only original reviewer can modify
- Aggregation pipeline used (not in-memory)

---

### P3.3: Fix Book Search Endpoint (POST → GET)

| Aspect | Details |
|--------|---------|
| **Difficulty** | Easy |
| **Priority** | HIGH |
| **Dependencies** | P2.1 (logging) |
| **Estimated Hours** | 3 hours |
| **Expected Outcome** | Book search follows REST conventions |

**Tasks:**
- [ ] Change route from `POST /books/search` to `GET /books/search`
- [ ] Move search query from body to query parameter: `?q=search+term`
- [ ] Ensure text indexes created on books collection:
  ```javascript
  db.books.createIndex({ title: "text", subject: "text", department: "text" })
  ```
- [ ] Update frontend API call to use GET
- [ ] Add query parameter validation

**Success Criteria:**
- Search endpoint is GET not POST
- Query parameter works
- Text indexes created
- RESTful compliance

---

### P3.4: Implement Missing Order Features

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P3.1 (pagination), P2.7 (env config) |
| **Estimated Hours** | 8 hours |
| **Expected Outcome** | Complete order lifecycle, payout tracking, email notifications |

**Missing Features:**
- [ ] Order status tracking (PENDING → ACCEPTED → COMPLETED → PAID)
- [ ] Payout release logic after OTP verification
- [ ] Payout history tracking
- [ ] Email notifications for orders:
  - [ ] Buyer: Order placed confirmation
  - [ ] Seller: New order received
  - [ ] Seller: Buyer verified with OTP
  - [ ] Buyer: Order completion confirmation
- [ ] Order filtering by date range
- [ ] Order search by listing title

**Implementation:**
- [ ] Add `payoutStatus` field to Order
- [ ] Create `/orders/:id/payout` endpoint (admin)
- [ ] Add email queue (BullMQ or similar)
- [ ] Create email templates
- [ ] Implement email retry logic
- [ ] Track email delivery status

**Success Criteria:**
- Complete order lifecycle implemented
- Payouts tracked
- Email notifications sent
- Order history accessible
- Payout history accessible

---

### P3.5: Implement Admin Report Moderation Workflow

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P1.2 (rate limiting), P2.1 (logging) |
| **Estimated Hours** | 8 hours |
| **Expected Outcome** | Reports can be reviewed, investigated, and resolved with audit trail |

**Report Workflow:**
```
Open (New) → Reviewed (Admin read) → Resolved (Action taken)
                          ↓
                    Investigation notes added
```

**Tasks:**
- [ ] Add admin-only permission check to getAllReports
- [ ] Create PATCH endpoint: `/reports/:id` to update report status
- [ ] Add fields to Report model:
  - [ ] `status`: "open" → "reviewed" → "resolved"
  - [ ] `reviewedBy`: admin user ID
  - [ ] `reviewedAt`: timestamp
  - [ ] `investigationNotes`: admin comments
  - [ ] `action`: "no_action" | "warning" | "suspend" | "ban"
  - [ ] `actionTakenAt`: timestamp
- [ ] Create PATCH endpoint: `/users/:id/suspend` (admin only)
  - [ ] Add `suspendedUntil` field to User
  - [ ] Block suspended users from accessing platform
- [ ] Create audit log of all moderation actions
- [ ] Add email notification to reported user

**Success Criteria:**
- Reports workflow complete
- Admin-only access
- Suspension logic works
- Audit trail created
- Reported users notified

---

### P3.6: Complete User Profile Management

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | MEDIUM |
| **Dependencies** | P1.4 (input validation) |
| **Estimated Hours** | 6 hours |
| **Expected Outcome** | Users can fully manage profiles with validation |

**Tasks:**
- [ ] Create PUT endpoint: `/auth/profile` to update user profile
  - [ ] Allow updating: name, phone, department, branch, bio, profilePic
  - [ ] Validate all fields with joi schema
  - [ ] Don't allow changing email or college
- [ ] Implement profile picture upload to Cloudinary
  - [ ] Delete old picture when new one uploaded
  - [ ] Max 5MB, image types only
- [ ] Create GET endpoint: `/users/:id` for public profile
  - [ ] Return: name, college, department, rating, joined date
  - [ ] Don't return: email, phone, personal data
- [ ] Add profile completion % (helpful for users)
- [ ] Add profile visibility settings (optional)
- [ ] Create DELETE endpoint: `/auth/account` for account deletion
  - [ ] Anonymize user data
  - [ ] Keep order history for records
  - [ ] Don't delete listings (mark as archived)

**Success Criteria:**
- Profile update endpoint working
- Profile picture upload working
- Public profile accessible
- Account deletion safe
- All fields validated

---

### P3.7: Fix Listing Update Logic & Image Management

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P1.4 (validation), P3.1 (pagination) |
| **Estimated Hours** | 5 hours |
| **Expected Outcome** | Listing update fully implemented, image cleanup working |

**Current Issues:**
- [ ] Update listing logic not fully shown
- [ ] Image deletion when updating unclear
- [ ] Conflicting image limits (3 vs 5)

**Tasks:**
- [ ] Complete listingService.updateListing() method
- [ ] Fix image limit consistency (max 3 images per listing)
- [ ] Implement image swap logic:
  - [ ] Accept `newImages` and `imagesToDelete`
  - [ ] Delete old images from Cloudinary
  - [ ] Upload new images
  - [ ] Update listing with new image URLs
- [ ] Prevent editing sold listings
- [ ] Prevent editing old listings (if pricing locked)
- [ ] Add validation for price (can't increase above suggested)
- [ ] Track listing edit history (optional)

**Success Criteria:**
- Listing update fully working
- Images properly replaced
- Old images deleted from Cloudinary
- Image limit consistent (3)
- Can't edit sold listings

---

## PHASE 4: FRONTEND REDESIGN (Weeks 8-10)

**Objective:** Rebuild frontend with proper error handling, loading states, form validation  
**Total Hours:** 64 hours  
**Team Size:** 2-3 frontend developers

### P4.1: Add Global Error Boundary & Error Pages

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | None |
| **Estimated Hours** | 6 hours |
| **Expected Outcome** | App doesn't crash on errors, user-friendly error messages |

**Tasks:**
- [ ] Create ErrorBoundary component using React.Component
- [ ] Wrap App with ErrorBoundary
- [ ] Create error pages:
  - [ ] 404 Not Found page
  - [ ] 500 Server Error page
  - [ ] Network Error page
  - [ ] Timeout page
- [ ] Add error logging to Sentry
- [ ] Create error recovery UI (retry button, go home)
- [ ] Test error scenarios:
  - [ ] API down
  - [ ] Network timeout
  - [ ] Malformed response
  - [ ] Component render error

**Error Boundary Example:**
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    logErrorToSentry(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorPage error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Success Criteria:**
- App catches errors gracefully
- Error pages display
- User can recover from errors
- Errors logged to Sentry

---

### P4.2: Implement Loading States & Skeleton Loaders

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | None |
| **Estimated Hours** | 8 hours |
| **Expected Outcome** | Professional loading experience, no blank screens |

**Tasks:**
- [ ] Create reusable Skeleton component
- [ ] Create skeleton variants:
  - [ ] Text skeleton
  - [ ] Card skeleton
  - [ ] Image skeleton
  - [ ] List skeleton
- [ ] Replace loading text with skeleton loaders:
  - [ ] Listings page: show 6 skeleton cards while loading
  - [ ] Profile page: show skeleton for user info
  - [ ] Orders page: show skeleton for order cards
- [ ] Add loading spinners for modal actions
- [ ] Add progress bars for uploads
- [ ] Implement loading state management in stores

**Skeleton Component:**
```javascript
const Skeleton = ({ width = '100%', height = '20px', className }) => (
  <div 
    className={`skeleton ${className}`}
    style={{ width, height, backgroundColor: '#e0e0e0', borderRadius: '4px' }}
  />
);
```

**Success Criteria:**
- Skeleton loaders show while loading
- No blank screens
- Loading time feels shorter
- Professional appearance

---

### P4.3: Refactor Pages to Remove Duplicated Logic

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | MEDIUM |
| **Dependencies** | P4.1, P4.2 (error & loading components) |
| **Estimated Hours** | 10 hours |
| **Expected Outcome** | DRY code, easier maintenance, consistent behavior |

**Pages to Refactor:**
- [ ] FeedPage & MarketplacePage (merged logic)
- [ ] ListingDetailPage & MarketplaceBookDetailPage (similar)
- [ ] ProfilePage (normalize listing display)
- [ ] MyListingsPage (listing card reuse)
- [ ] MyOrdersPage & SellerOrdersPage (shared order card)

**Extracted Components:**
- [ ] ListingCard (reusable)
- [ ] OrderCard (reusable)
- [ ] ListingGrid (with pagination)
- [ ] FilterPanel (shared filter UI)
- [ ] ListingDetailView (shared detail view)

**Tasks:**
- [ ] Extract common listing card component
- [ ] Extract common order card component
- [ ] Create shared API hook (useListings, useOrders)
- [ ] Create shared filter logic
- [ ] Remove mock data integration (use API only)
- [ ] Consolidate duplicate normalization logic
- [ ] Update pages to use extracted components

**Success Criteria:**
- No significant code duplication
- Easier to maintain
- Consistent behavior across similar pages
- All functionality preserved

---

### P4.4: Implement Comprehensive Form Validation

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P1.4 (backend validation) |
| **Estimated Hours** | 8 hours |
| **Expected Outcome** | Forms validate before submission, helpful error messages |

**Forms to Validate:**
- [ ] Registration form
- [ ] Listing creation/update
- [ ] Profile update
- [ ] Report form
- [ ] Rating form
- [ ] Interest form

**Tasks:**
- [ ] Install `react-hook-form` and `zod` for validation
- [ ] Create validation schemas matching backend:
  ```javascript
  const listingSchema = z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(10).max(1000),
    price: z.number().min(0).max(50000),
    condition: z.enum(['New', 'Like New', 'Good', 'Worn']),
  });
  ```
- [ ] Add field-level validation with real-time feedback
- [ ] Show validation errors clearly (red text under field)
- [ ] Disable submit button until form valid
- [ ] Show required field indicators (*)
- [ ] Add loading state during submission
- [ ] Clear errors when user fixes field

**Success Criteria:**
- Forms validate before submission
- Helpful error messages
- Good UX (real-time feedback)
- Matches backend validation

---

### P4.5: Move Cart to Backend & Implement Sync

| Aspect | Details |
|--------|---------|
| **Difficulty** | Hard |
| **Priority** | MEDIUM |
| **Dependencies** | P3.1 (pagination), P4.3 (refactoring) |
| **Estimated Hours** | 12 hours |
| **Expected Outcome** | Cart synced across devices, persistent across sessions |

**Backend Tasks:**
- [ ] Create Cart model (user, items[], createdAt, updatedAt)
- [ ] Create POST `/cart` to add item
- [ ] Create DELETE `/cart/:itemId` to remove item
- [ ] Create PATCH `/cart/:itemId` to update quantity
- [ ] Create DELETE `/cart` to clear cart
- [ ] Create GET `/cart` to fetch current cart
- [ ] Add cart validation (item still exists, still available)
- [ ] Add cart cleanup on order creation

**Frontend Tasks:**
- [ ] Update useCartStore to use backend API
- [ ] Implement sync on app load
- [ ] Update add/remove/update cart functions
- [ ] Add loading state for cart operations
- [ ] Handle sync conflicts (server vs local)
- [ ] Show cart count in navbar

**Success Criteria:**
- Cart synced with backend
- Multi-device support
- Cart persists across sessions
- Validation on items
- Proper error handling

---

### P4.6: Implement Responsive Design

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P4.3 (refactoring), P4.4 (forms) |
| **Estimated Hours** | 10 hours |
| **Expected Outcome** | Works on mobile, tablet, desktop with consistent UX |

**Tasks:**
- [ ] Review current layout (mostly inline styles)
- [ ] Add CSS Grid/Flexbox for responsive layouts
- [ ] Mobile-first breakpoints:
  - [ ] Mobile: 0-640px
  - [ ] Tablet: 641-1024px
  - [ ] Desktop: 1025px+
- [ ] Components to adapt:
  - [ ] Navbar: hamburger menu on mobile
  - [ ] Listing grid: 1 col mobile, 2 tablet, 3+ desktop
  - [ ] Forms: single column on all sizes
  - [ ] Order cards: horizontal on desktop, vertical on mobile
  - [ ] Filter panel: drawer on mobile, sidebar on desktop
- [ ] Test on real devices
- [ ] Check touch targets (min 44px)
- [ ] Optimize images for mobile (responsive images)

**Success Criteria:**
- Mobile view functional
- Tablet view optimized
- Desktop view polished
- Touch friendly
- All features accessible on mobile

---

### P4.7: Add Accessibility (WCAG 2.1 AA Compliance)

| Aspect | Details |
|--------|---------|
| **Difficulty** | Hard |
| **Priority** | MEDIUM |
| **Dependencies** | P4.6 (responsive design) |
| **Estimated Hours** | 12 hours |
| **Expected Outcome** | App usable by people with disabilities |

**Tasks:**
- [ ] Add alt text to all images
- [ ] Add ARIA labels to interactive elements
- [ ] Implement keyboard navigation (Tab, Enter, Esc)
- [ ] Add focus indicators (visible outline)
- [ ] Check color contrast (minimum 4.5:1)
- [ ] Test with screen readers (NVDA/JAWS)
- [ ] Add semantic HTML (`<button>`, `<nav>`, `<main>`)
- [ ] Test with keyboard only (no mouse)
- [ ] Add skip-to-content link
- [ ] Implement focus management in modals
- [ ] Add live region for dynamic content updates

**Checklist Items:**
```
[ ] All images have alt text
[ ] All form fields labeled
[ ] All buttons have accessible names
[ ] Color not only means (also icon/text)
[ ] Keyboard navigation works
[ ] Focus visible on all interactive elements
[ ] Tab order logical
[ ] No keyboard traps
[ ] Screen reader announces changes
[ ] Links have purpose
```

**Success Criteria:**
- WCAG 2.1 AA compliance verified
- Screen reader functional
- Keyboard navigation complete
- Color contrast adequate
- Accessibility audit passed

---

### P4.8: Remove Mock Data & Use API Only

| Aspect | Details |
|--------|---------|
| **Difficulty** | Easy |
| **Priority** | HIGH |
| **Dependencies** | P4.3 (refactoring) |
| **Estimated Hours** | 3 hours |
| **Expected Outcome** | No mock data in production code, clean API integration |

**Tasks:**
- [ ] Remove mockBooks.js usage
- [ ] Remove hardcoded user fallbacks in ProfilePage
- [ ] Remove hardcoded stats in pages
- [ ] Ensure all data fetched from API
- [ ] Update build to exclude mock data
- [ ] Remove mock data from git (optional)

**Success Criteria:**
- No mock data in production
- All data from API
- No confusing fake users

---

## PHASE 5: SECURITY HARDENING (Weeks 11-12)

**Objective:** Comprehensive security improvements and external validation  
**Total Hours:** 40 hours  
**Team Size:** 1-2 developers + external security firm

### P5.1: Implement Advanced Authentication Features

| Aspect | Details |
|--------|---------|
| **Difficulty** | Hard |
| **Priority** | HIGH |
| **Dependencies** | P1.6 (httpOnly cookies), P3.4 (user suspension) |
| **Estimated Hours** | 8 hours |
| **Expected Outcome** | Enhanced security: device tracking, session management, login history |

**Tasks:**
- [ ] Implement login history tracking
  - [ ] Track IP, user agent, timestamp
  - [ ] Store last 10 logins per user
  - [ ] Endpoint: GET `/auth/login-history`
- [ ] Add device tracking
  - [ ] Generate device fingerprint (user agent + IP)
  - [ ] Track devices per user
  - [ ] Alert on new device login
- [ ] Implement session management
  - [ ] UUID for each session
  - [ ] Track active sessions
  - [ ] Allow logout from all devices
  - [ ] Limit concurrent sessions (3 per user)
- [ ] Add suspicious activity detection
  - [ ] Multiple login attempts from different IPs
  - [ ] Unusual login time
  - [ ] Automatic account lock on suspicious activity
- [ ] Implement refresh token rotation
  - [ ] New refresh token on each use
  - [ ] Detect token reuse (compromised token)

**Success Criteria:**
- Login history available
- Device tracking working
- Session management implemented
- Suspicious activity detected
- Refresh token rotation working

---

### P5.2: Implement Content Security Policy (CSP)

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P1.5 (security headers) |
| **Estimated Hours** | 4 hours |
| **Expected Outcome** | XSS attacks prevented, source validation |

**Tasks:**
- [ ] Configure CSP headers in app.js:
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' fonts.googleapis.com; connect-src 'self' api.campusbazzar.com sentry.io
  ```
- [ ] Test CSP with inline scripts/styles
- [ ] Allow specific external resources (Cloudinary, Sentry, etc.)
- [ ] Use nonce for inline scripts (if needed)
- [ ] Monitor CSP violations
- [ ] Gradually tighten CSP

**Success Criteria:**
- CSP headers sent
- No CSP violations
- External resources loaded
- Inline scripts blocked (if CSP strict)

---

### P5.3: Implement Database Encryption & Field-Level Encryption

| Aspect | Details |
|--------|---------|
| **Difficulty** | Hard |
| **Priority** | MEDIUM |
| **Dependencies** | P1.1 (secrets), P3.6 (profile management) |
| **Estimated Hours** | 6 hours |
| **Expected Outcome** | Sensitive data encrypted at rest and in transit |

**Tasks:**
- [ ] Enable MongoDB encryption at rest (if self-hosted)
  - [ ] Configure KMIP/KMS key management
  - [ ] Enable database encryption
- [ ] Implement field-level encryption for:
  - [ ] Email addresses
  - [ ] Phone numbers
  - [ ] Profile information (optional)
- [ ] Use `mongoose-encryption` plugin or similar:
  ```javascript
  userSchema.plugin(mongooseEncryption, { 
    fields: ['email', 'phone'],
    secret: process.env.ENCRYPTION_KEY 
  });
  ```
- [ ] Add encryption key management
  - [ ] Rotate keys annually
  - [ ] Store keys in vault (AWS Secrets Manager)
- [ ] Ensure HTTPS in transit (TLS 1.2+)

**Success Criteria:**
- Sensitive data encrypted
- Encryption keys managed securely
- HTTPS configured
- Can decrypt data when needed

---

### P5.4: Implement SQL/NoSQL Injection Prevention

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P1.4 (input validation) |
| **Estimated Hours** | 4 hours |
| **Expected Outcome** | Injection attacks prevented through parameterized queries |

**Tasks:**
- [ ] Audit all database queries for injection risk
- [ ] Use mongoose/parameterized queries (already used)
- [ ] Add input sanitization layer:
  ```javascript
  function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/[{}$]/g, ''); // Remove mongo operators
  }
  ```
- [ ] Validate against operator injection:
  ```javascript
  // Bad: { department: { $ne: null } } bypasses filter
  // Good: validate department is in allowed list
  const validDepartments = ['CS', 'EC', 'ME', 'CE'];
  if (!validDepartments.includes(department)) throw Error;
  ```
- [ ] Test with injection payloads
- [ ] Add WAF rules (if using)

**Success Criteria:**
- No injection vulnerabilities found
- Input sanitized
- Operator injection prevented
- Tests passing

---

### P5.5: Implement API Security Best Practices

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P1.2 (rate limiting), P1.4 (validation) |
| **Estimated Hours** | 6 hours |
| **Expected Outcome** | API secure against common attacks |

**Tasks:**
- [ ] Implement API versioning (already done: /v1/)
- [ ] Add API key support (optional, for external integrations)
- [ ] Implement request signing (optional)
- [ ] Add API usage limits per user
- [ ] Implement request timeout (already done: 10s)
- [ ] Add request size limits (already 100MB, reduce to 10MB)
- [ ] Validate content-type header
- [ ] Add API deprecation handling
- [ ] Document all APIs
- [ ] Regular security scans of APIs

**Success Criteria:**
- API security tested
- No unauthorized access possible
- Rate limiting working
- Request validation in place

---

### P5.6: Security Audit by External Firm

| Aspect | Details |
|--------|---------|
| **Difficulty** | N/A (External) |
| **Priority** | CRITICAL |
| **Dependencies** | P5.1-5.5 (security improvements) |
| **Estimated Hours** | 40 hours (external) + 8 hours (internal) |
| **Expected Outcome** | Third-party validation of security, identified vulnerabilities fixed |

**Tasks:**
- [ ] Contract external security firm (budget: $2-5k)
- [ ] Scope: web app penetration testing, code review, API security
- [ ] Provide test accounts and API access
- [ ] Receive security audit report
- [ ] Fix critical/high-severity issues (2 weeks)
- [ ] Follow up with firm on fixes
- [ ] Document security practices

**Expected Report Includes:**
- Vulnerability assessment
- Penetration test results
- Code review findings
- Recommendations
- Compliance status (OWASP Top 10)

**Success Criteria:**
- Audit completed
- No critical vulnerabilities
- Vulnerabilities fixed
- Clean report

---

### P5.7: Implement Compliance & Privacy Features

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | MEDIUM |
| **Dependencies** | P2.1 (logging), P3.6 (profile management) |
| **Estimated Hours** | 6 hours |
| **Expected Outcome** | GDPR/privacy compliant, user data rights respected |

**Tasks:**
- [ ] Add privacy policy page
- [ ] Add terms of service page
- [ ] Implement data export (GET `/auth/export` → JSON file)
- [ ] Implement data deletion (DELETE `/auth/account`)
- [ ] Add cookie consent banner
- [ ] Implement analytics opt-out
- [ ] Add user deletion without traces (anonymization)
- [ ] Document data retention policies
- [ ] Add audit logging for data access
- [ ] Implement right to be forgotten (auto-delete after period)

**Success Criteria:**
- Privacy policy in place
- Data export working
- Data deletion working
- GDPR compliant
- User consent collected

---

## PHASE 6: PERFORMANCE OPTIMIZATION (Weeks 13-14)

**Objective:** Optimize database, API, and frontend performance  
**Total Hours:** 40 hours  
**Team Size:** 2 developers

### P6.1: Database Query Optimization

| Aspect | Details |
|--------|---------|
| **Difficulty** | Hard |
| **Priority** | HIGH |
| **Dependencies** | P3.1 (pagination), P2.1 (logging) |
| **Estimated Hours** | 8 hours |
| **Expected Outcome** | Fast queries, no N+1 problems, proper indexing |

**Tasks:**
- [ ] Add query profiling to identify slow queries
  - [ ] Log query execution time
  - [ ] Alert on queries > 100ms
- [ ] Optimize common queries:
  - [ ] Listings with seller info (use $lookup)
  - [ ] Orders with user details (populate)
  - [ ] Ratings aggregation (use $group)
- [ ] Fix N+1 problems:
  - [ ] Use populate() to fetch related data in one query
  - [ ] Use aggregation pipeline for complex queries
- [ ] Verify all indexes created
- [ ] Add compound indexes:
  - [ ] listings: (college, status, createdAt)
  - [ ] orders: (buyerId, createdAt)
  - [ ] ratings: (toUserId, createdAt)
- [ ] Remove unused indexes
- [ ] Test query performance before/after

**Example Optimization:**
```javascript
// Before (N+1): fetch listing, then fetch seller
const listing = await Listing.findById(id);
const seller = await User.findById(listing.sellerId);

// After: use populate
const listing = await Listing.findById(id).populate('sellerId');
```

**Success Criteria:**
- Slow queries identified and fixed
- N+1 queries eliminated
- Indexes properly configured
- Query < 100ms for most operations

---

### P6.2: Implement Redis Caching Layer

| Aspect | Details |
|--------|---------|
| **Difficulty** | Hard |
| **Priority** | MEDIUM |
| **Dependencies** | P2.1 (logging), P3.1 (pagination) |
| **Estimated Hours** | 10 hours |
| **Expected Outcome** | Reduced database load, faster response times |

**Tasks:**
- [ ] Install Redis and Redis client
- [ ] Create cache middleware
- [ ] Cache frequently accessed data:
  - [ ] Categories (cache 1 hour)
  - [ ] User ratings (cache 10 minutes)
  - [ ] Listing counts (cache 5 minutes)
- [ ] Implement cache invalidation strategy:
  - [ ] TTL-based (automatic expiry)
  - [ ] Event-based (invalidate on update)
- [ ] Cache user sessions (move from memory)
- [ ] Add cache metrics (hit rate, memory usage)
- [ ] Handle cache failures gracefully

**Cache Config Example:**
```javascript
const cacheConfig = {
  categories: { ttl: 3600, key: 'categories' },
  userRatings: { ttl: 600, key: 'user-ratings:' },
  listingCounts: { ttl: 300, key: 'counts' },
};
```

**Success Criteria:**
- Redis running
- Cache hit rate > 60%
- Response time improved
- Cache invalidation working

---

### P6.3: Implement API Response Compression

| Aspect | Details |
|--------|---------|
| **Difficulty** | Easy |
| **Priority** | MEDIUM |
| **Dependencies** | None |
| **Estimated Hours** | 2 hours |
| **Expected Outcome** | Smaller response payloads, faster network transfer |

**Tasks:**
- [ ] Install `compression` middleware
- [ ] Enable gzip compression for responses
- [ ] Configure compression level (6)
- [ ] Test response sizes before/after
- [ ] Verify browser decompression

**Success Criteria:**
- Responses compressed 60-70%
- No performance issues
- Transparent to clients

---

### P6.4: Optimize Frontend Bundle Size

| Aspect | Details |
|--------|---------|
| **Difficulty** | Hard |
| **Priority** | HIGH |
| **Dependencies** | P4.3 (refactoring) |
| **Estimated Hours** | 8 hours |
| **Expected Outcome** | Smaller bundle, faster load time |

**Tasks:**
- [ ] Analyze bundle with `npm run build` and webpack-bundle-analyzer
- [ ] Identify large dependencies:
  - [ ] Three.js (large) → only load on landing page
  - [ ] Framer-motion (moderate) → load on demand
  - [ ] Axios (ok) → consider fetch API
- [ ] Code splitting by route (React lazy)
- [ ] Remove unused dependencies
- [ ] Optimize Three.js (use only needed features)
- [ ] Minify and compress assets
- [ ] Test performance (Lighthouse)

**Example Code Splitting:**
```javascript
const FeedPage = lazy(() => import('./pages/FeedPage'));
const ListingFormPage = lazy(() => import('./pages/ListingFormPage'));

<Suspense fallback={<Loading />}>
  <FeedPage />
</Suspense>
```

**Success Criteria:**
- Bundle size < 300KB (gzipped)
- Lighthouse score > 80
- First load < 3 seconds
- Interactive < 5 seconds

---

### P6.5: Implement Image Optimization

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | MEDIUM |
| **Dependencies** | P3.7 (listing images) |
| **Estimated Hours** | 4 hours |
| **Expected Outcome** | Smaller image files, responsive images |

**Tasks:**
- [ ] Configure Cloudinary for automatic optimization
  - [ ] Auto format (WebP, AVIF)
  - [ ] Auto quality (70-80%)
  - [ ] Auto resize based on device
- [ ] Use responsive images:
  ```html
  <img 
    src="image-800w.jpg"
    srcset="image-400w.jpg 400w, image-800w.jpg 800w"
    sizes="(max-width: 500px) 100vw, 800px"
  />
  ```
- [ ] Lazy load images below fold
- [ ] Add image placeholders (LQIP)
- [ ] Monitor image performance

**Success Criteria:**
- Image file sizes 30-50% smaller
- Responsive images working
- Lazy loading working
- Good visual quality maintained

---

### P6.6: Implement Frontend Caching Strategy

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | MEDIUM |
| **Dependencies** | P6.2 (caching) |
| **Estimated Hours** | 4 hours |
| **Expected Outcome** | Offline support, faster page loads |

**Tasks:**
- [ ] Implement service worker for offline support
- [ ] Cache static assets (CSS, JS)
- [ ] Implement stale-while-revalidate strategy
- [ ] Cache API responses strategically
- [ ] Add update notifications (new version available)

**Success Criteria:**
- Service worker registered
- Offline pages load
- Stale content served while fetching fresh
- Update notification works

---

### P6.7: Database Indexing & Query Plan Analysis

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P6.1 (query optimization) |
| **Estimated Hours** | 4 hours |
| **Expected Outcome** | All queries use indexes, query plans optimized |

**Tasks:**
- [ ] Analyze MongoDB query plans (explain())
- [ ] Verify index usage:
  ```javascript
  db.listings.find({college: 'vcet', status: 'Active'}).explain('executionStats')
  ```
- [ ] Remove unused indexes (slow writes)
- [ ] Add missing compound indexes
- [ ] Monitor index usage in production
- [ ] Set up index monitoring alerts

**Index Checklist:**
```
[ ] email (unique)
[ ] college
[ ] status
[ ] (college, status)
[ ] (college, status, createdAt)
[ ] (buyerId, createdAt)
[ ] (sellerId, createdAt)
[ ] bookId (unique)
[ ] title (text)
```

**Success Criteria:**
- All queries using indexes
- No collection scans
- Query performance consistent

---

## PHASE 7: DEPLOYMENT & LAUNCH (Weeks 15-16)

**Objective:** Deploy to production, monitor, ensure success  
**Total Hours:** 32 hours  
**Team Size:** 2-3 developers + DevOps

### P7.1: Set Up Production Infrastructure

| Aspect | Details |
|--------|---------|
| **Difficulty** | Hard |
| **Priority** | CRITICAL |
| **Dependencies** | All previous phases |
| **Estimated Hours** | 12 hours |
| **Expected Outcome** | Production-grade infrastructure, auto-scaling, monitoring |

**Infrastructure Setup:**

**Backend:**
- [ ] Choose hosting (AWS, DigitalOcean, Heroku)
- [ ] Set up Node.js cluster mode (load balancing)
- [ ] Configure environment variables (CI/CD)
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up auto-scaling (if traffic spikes)
- [ ] Configure logging (CloudWatch, Papertrail)

**Database:**
- [ ] Use MongoDB Atlas M10+ cluster (recommended)
- [ ] Enable backups (daily, 30-day retention)
- [ ] Configure replica set for HA
- [ ] Set up monitoring
- [ ] Plan capacity for growth

**Frontend:**
- [ ] Choose CDN (CloudFront, Vercel, Netlify)
- [ ] Configure cache headers
- [ ] Enable compression
- [ ] Set up automatic builds/deploys
- [ ] Monitor frontend errors

**Other Services:**
- [ ] Cloudinary account configured
- [ ] SendGrid email service (upgrade from Gmail)
- [ ] Sentry error tracking
- [ ] UptimeRobot uptime monitoring
- [ ] AWS Secrets Manager for credentials

**Success Criteria:**
- Infrastructure documented
- Auto-scaling configured
- SSL/TLS working
- Monitoring in place

---

### P7.2: Implement CI/CD Pipeline

| Aspect | Details |
|--------|---------|
| **Difficulty** | Hard |
| **Priority** | HIGH |
| **Dependencies** | P7.1 (infrastructure) |
| **Estimated Hours** | 6 hours |
| **Expected Outcome** | Automated testing & deployment, faster releases |

**Tasks:**
- [ ] Choose CI/CD platform (GitHub Actions, GitLab CI, Jenkins)
- [ ] Create backend build pipeline:
  - [ ] Run lint
  - [ ] Run tests
  - [ ] Build Docker image
  - [ ] Push to registry
  - [ ] Deploy to staging
  - [ ] Run integration tests
  - [ ] Deploy to production (if manual approval)
- [ ] Create frontend build pipeline:
  - [ ] Run lint
  - [ ] Run tests
  - [ ] Build production bundle
  - [ ] Run Lighthouse
  - [ ] Deploy to CDN
- [ ] Set up notifications (Slack alerts on failure)
- [ ] Set up rollback strategy

**GitHub Actions Example:**
```yaml
name: Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - run: deploy.sh
```

**Success Criteria:**
- Pipeline automated
- No manual deploys needed
- Rollback available
- Slack notifications working

---

### P7.3: Create Staging Environment

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | HIGH |
| **Dependencies** | P7.1 (infrastructure), P7.2 (CI/CD) |
| **Estimated Hours** | 4 hours |
| **Expected Outcome** | Production replica for testing before launch |

**Tasks:**
- [ ] Create staging environment (identical to production)
- [ ] Use test data (not real user data)
- [ ] Configure monitoring (same as production)
- [ ] Set up automatic deploys from develop branch
- [ ] Create staging URL
- [ ] Document staging environment
- [ ] Set up staging database backups

**Success Criteria:**
- Staging environment running
- Accessible for testing
- Separate from production
- Automated deployments

---

### P7.4: Comprehensive Testing & QA

| Aspect | Details |
|--------|---------|
| **Difficulty** | Hard |
| **Priority** | CRITICAL |
| **Dependencies** | P7.3 (staging), all features complete |
| **Estimated Hours** | 8 hours |
| **Expected Outcome** | All features tested, bugs fixed, ready for launch |

**Testing Plan:**

**Functional Testing:**
- [ ] Test all features on staging
- [ ] User registration & login flow
- [ ] Listing CRUD operations
- [ ] Order lifecycle (place → accept → complete)
- [ ] Rating & interest systems
- [ ] Payment/payout flows
- [ ] Admin moderation

**Performance Testing:**
- [ ] Load test with 100 concurrent users
- [ ] Measure response times
- [ ] Check database performance
- [ ] Monitor server resources

**Security Testing:**
- [ ] SQL/NoSQL injection tests
- [ ] XSS attack tests
- [ ] CSRF attack tests
- [ ] Authentication bypass tests
- [ ] Authorization bypass tests

**Browser/Device Testing:**
- [ ] Chrome, Firefox, Safari, Edge
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Tablets & mobile devices

**Regression Testing:**
- [ ] Test all features still work
- [ ] Check for visual regressions
- [ ] Test with different data states

**Success Criteria:**
- All features working
- No critical bugs
- Performance acceptable
- Security tested

---

### P7.5: Set Up Monitoring & Alerts

| Aspect | Details |
|--------|---------|
| **Difficulty** | Medium |
| **Priority** | CRITICAL |
| **Dependencies** | P2.2 (error tracking), P7.1 (infrastructure) |
| **Estimated Hours** | 4 hours |
| **Expected Outcome** | Proactive issue detection, fast incident response |

**Monitoring Setup:**

**Application Monitoring:**
- [ ] Sentry for error tracking
- [ ] Datadog/New Relic for APM
- [ ] Custom metrics for business logic
- [ ] Real user monitoring (RUM)

**Infrastructure Monitoring:**
- [ ] CPU, memory, disk usage
- [ ] Network traffic
- [ ] Database connections
- [ ] Server uptime

**Alert Configuration:**
- [ ] Error rate > 1%
- [ ] Response time > 1 second
- [ ] Database down
- [ ] Memory usage > 80%
- [ ] Disk usage > 85%
- [ ] Failed deployments

**Dashboards:**
- [ ] Main dashboard (status overview)
- [ ] Performance dashboard
- [ ] Error dashboard
- [ ] Business metrics dashboard

**Success Criteria:**
- Monitoring active
- Alerts configured
- Dashboards accessible
- On-call team notified

---

### P7.6: Create Runbooks & Documentation

| Aspect | Details |
|--------|---------|
| **Difficulty** | Easy |
| **Priority** | HIGH |
| **Dependencies** | All previous phases |
| **Estimated Hours** | 4 hours |
| **Expected Outcome** | Team can operate platform independently |

**Documentation:**

**Operational Runbooks:**
- [ ] Incident response procedures
- [ ] Common troubleshooting steps
- [ ] Database backup/restore
- [ ] Scaling procedures
- [ ] Security incident response
- [ ] Communication templates

**API Documentation:**
- [ ] Swagger/OpenAPI documentation
- [ ] Example requests/responses
- [ ] Error codes explained
- [ ] Rate limiting details
- [ ] Authentication guide

**Deployment Guide:**
- [ ] Environment setup
- [ ] Database migrations
- [ ] Rollback procedures
- [ ] Secrets management
- [ ] Monitoring setup

**Team Documentation:**
- [ ] Team structure
- [ ] On-call schedule
- [ ] Communication channels
- [ ] Decision-making process

**Success Criteria:**
- Documentation complete
- Team trained
- Runbooks tested
- Accessible and maintained

---

### P7.7: Launch & Post-Launch Support

| Aspect | Details |
|--------|---------|
| **Difficulty** | High |
| **Priority** | CRITICAL |
| **Dependencies** | All previous phases |
| **Estimated Hours** | 4 hours (launch week) + ongoing |
| **Expected Outcome** | Smooth launch, user adoption, stable platform |

**Pre-Launch (Week 15):**
- [ ] Final security audit
- [ ] Load test with 50+ concurrent users
- [ ] Staging environment approved
- [ ] Communication plan to college
- [ ] Marketing materials ready
- [ ] Support team trained

**Launch Day (Week 16):**
- [ ] Deploy to production
- [ ] Monitor closely (first 2 hours)
- [ ] Have rollback plan ready
- [ ] Support team on standby
- [ ] Communicate to users

**Post-Launch (Week 16+):**
- [ ] Monitor metrics hourly for 1 week
- [ ] Fix critical bugs immediately
- [ ] Gather user feedback
- [ ] Plan next improvements
- [ ] Document lessons learned

**Success Criteria:**
- Successful deployment
- No critical outages
- Performance acceptable
- Users adopting platform

---

## TIMELINE SUMMARY

```
Week 1-2:   Phase 1 - Critical Bugs & Security (48h)
Week 3-4:   Phase 2 - Architecture Improvements (56h)
Week 5-7:   Phase 3 - Backend Stabilization (56h)
Week 8-10:  Phase 4 - Frontend Redesign (64h)
Week 11-12: Phase 5 - Security Hardening (40h)
Week 13-14: Phase 6 - Performance Optimization (40h)
Week 15-16: Phase 7 - Deployment & Launch (32h)

Total: 336 hours (~8 weeks full-time work)
```

---

## RESOURCE REQUIREMENTS

### Team Composition
- **Backend Developers:** 2-3
- **Frontend Developers:** 2-3
- **DevOps/Infrastructure:** 1
- **QA/Tester:** 1
- **Security Consultant:** 1 (weeks 11-12)
- **Project Manager:** 1

**Total: 8-9 people for 4 months**

### Budget Estimate
- **Salaries:** $80k-120k (team of 8 for 4 months)
- **Infrastructure:** $500-1000/month (ongoing)
- **Services:** $200/month (Sentry, monitoring, etc.)
- **Security Audit:** $3k-5k
- **External Contractors:** $5k-10k (if needed)

**Total: $130k-150k for launch + $800/month ongoing**

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Team member absence | High | Cross-training, documentation |
| Scope creep | High | Stick to roadmap, change control |
| Performance issues | High | Regular testing, monitoring setup |
| Security vulnerabilities | Critical | External audit, rate limiting early |
| Database issues | High | Backups, replica set, monitoring |
| Frontend performance | Medium | Bundle analysis, testing in phase 6 |
| Integration issues | Medium | Staging environment, testing |
| Launch day issues | High | Monitoring, rollback plan, on-call team |

---

## Success Metrics

### Week 1 (Post-Launch)
- ✓ No critical security vulnerabilities
- ✓ 99% uptime
- ✓ Response time < 500ms (p95)
- ✓ < 1% error rate
- ✓ 50+ active users

### Month 1 (Post-Launch)
- ✓ 200+ active users
- ✓ 100+ listings
- ✓ 50+ transactions completed
- ✓ < 2% error rate
- ✓ 99.5% uptime
- ✓ User satisfaction > 4/5

### Month 3 (Post-Launch)
- ✓ 500+ active users
- ✓ 1000+ listings
- ✓ 500+ transactions completed
- ✓ Profitable (positive unit economics)
- ✓ 99.9% uptime
- ✓ Ready to scale to multiple colleges

---

## Approval & Sign-Off

This roadmap requires approval from:
- [ ] Project Lead
- [ ] Tech Lead
- [ ] Product Manager
- [ ] College Administration

**Document Version:** 1.0  
**Last Updated:** June 28, 2026  
**Next Review:** Weekly during execution

---

**END OF PRODUCTION ROADMAP**

This roadmap provides a clear path to production deployment in 16 weeks. Success depends on disciplined execution, regular monitoring, and team coordination. Adjust timelines based on actual team size and capacity.

