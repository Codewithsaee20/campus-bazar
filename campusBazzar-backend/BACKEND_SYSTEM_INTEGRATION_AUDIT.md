# CampusBazar Backend Audit Report (Integration-Ready)

Date: 2026-04-18  
Scope: Backend architecture, APIs, controllers/services/models flow, auth/security, payments, data contracts, and frontend integration readiness.

---

## 1) Executive Summary

The backend is an Express + MongoDB monolith structured into routes, controllers, services, models, middleware, and shared response/error utilities.

Current integration status:
- Auth routes for register/login/profile are present and partially aligned with frontend expectations.
- Listings, orders, categories, and payments APIs exist at route level.
- Internal implementation has major controller/service contract drift and auth token/middleware inconsistencies that can block end-to-end commerce flows.

Primary blockers before reliable integration:
- Controller-service mismatch in listing/order domains (some controllers call non-existent service signatures).
- JWT signing and verification secret mismatch risk.
- `req.user` hydration does not include all fields required by business logic (especially college).
- Response constructor usage inconsistent in some controllers, causing unstable payload format.

---

## 2) Backend Technical Architecture

### Stack
- Node.js (ES modules)
- Express 5
- Mongoose
- JWT auth
- Cookie parser + CORS
- Razorpay SDK integration

### Runtime bootstrap
- Entry file: `server.js`
- App wiring: `src/app.js`
- DB init: `src/config/dbconnection.js`

### Module layers
- Routes: `src/routes/*`
- Controllers: `src/controllers/*`
- Services: `src/services/*`
- Models: `src/models/*`
- Middleware: `src/middleware/*`
- Utilities: `src/utils/*`

---

## 3) Request Lifecycle and Runtime Flow

1. `server.js` loads env and app, connects DB, then starts listener.
2. `src/app.js` configures CORS, JSON/urlencoded parsers, cookies.
3. Route prefixes mounted under `/api/v1/*`.
4. Route handlers call controllers.
5. Controllers call services (in intended architecture).
6. Services use models for DB operations and business rules.
7. Uncaught async errors bubble via `asyncHandler` to global error middleware.
8. Global error middleware emits standardized JSON error envelope.

Observed divergence:
- Some service files contain controller-style code (`req`, `res`, `ApiResponse`) instead of pure business functions, breaking intended layering consistency.

---

## 4) API Surface Inventory

Mounted from `src/app.js`:
- `GET /api/v1/health`
- Auth:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/profile` (protected)
- Listings:
  - `POST /api/v1/listings` (protected)
  - `GET /api/v1/listings`
  - `GET /api/v1/listings/:id`
  - `PUT /api/v1/listings/:id` (protected)
  - `DELETE /api/v1/listings/:id` (protected)
- Categories:
  - `GET /api/v1/categories`
  - `POST /api/v1/categories` (admin)
  - `PUT /api/v1/categories/:id` (admin)
  - `DELETE /api/v1/categories/:id` (admin)
- Orders (all protected by router-level middleware):
  - `GET /api/v1/orders/my/buying`
  - `GET /api/v1/orders/my/selling`
  - `POST /api/v1/orders`
  - `GET /api/v1/orders/:id`
  - `PATCH /api/v1/orders/:id/cancel`
  - `POST /api/v1/orders/:id/otp/generate`
  - `POST /api/v1/orders/:id/otp/verify`
- Payments:
  - `POST /api/v1/payments/create-order` (protected)

---

## 5) Route-to-Controller Audit

## 5.1 Health

- Route: `src/routes/healthCheckRoute.js`
- Controller: `src/controllers/healthController.js`

Behavior:
- Returns healthy response envelope.

Quality:
- Simple and stable.

## 5.2 Auth

- Route: `src/routes/authRoute.js`
- Controller: `src/controllers/authController.js`
- Service: `src/services/authService.js`

Register flow:
- Validates required fields.
- Creates user.
- Generates access/refresh tokens.
- Sets both tokens in cookies.
- Returns user + accessToken in JSON payload.

Login flow:
- Validates credentials.
- Sets cookie tokens and returns user + accessToken.

Profile flow:
- Uses `verifyToken` middleware and returns current user profile.

Strengths:
- Frontend currently uses this successfully for login/signup.

Critical notes:
- Token payload construction in `authService` uses `User.college` (model property), not actual user college instance value.
- Access token signed with `ACCESS_TOKEN_SECRET`, but middleware verification uses `JWT_SECRET`.

## 5.3 Categories

- Route: `src/routes/categoryRoute.js`
- Controller: `src/controllers/categoryController.js`
- Service: `src/services/categroryService.js`

Behavior:
- Read all active categories.
- Soft delete by setting `isActive=false`.
- Admin-only write operations through role middleware.

Quality:
- Service layer reasonably clean and aligned.

Issue:
- Some controller `ApiResponse` constructor arguments appear in reversed data/message order.

## 5.4 Listings

- Route: `src/routes/listingRoute.js`
- Controller: `src/controllers/listingController.js`
- Service file exists: `src/services/listingService.js`

Observed implementation conflict:
- `listingController.js` imports `{}` from service but later references `listingService.*` functions.
- `listingService.js` is currently implemented as controller-style route handlers using `req`, `res`, and `ApiResponse`, not as reusable pure service functions.

Impact:
- The route-controller-service chain is structurally inconsistent and likely fails at runtime once listing endpoints are exercised.

## 5.5 Orders

- Route: `src/routes/orderRoute.js`
- Controller: `src/controllers/orderController.js`
- Service: `src/services/orderSerivce.js`

Observed implementation conflict:
- `orderController.js` expects service methods with payload-style signatures, for example `orderService.createOrder({ listingId, buyerId, ... })`.
- `orderSerivce.js` defines functions with `(req, res)` controller signatures and returns HTTP responses directly.
- Exported method names also differ (`getOrderbyId` vs controller call `getOrderById`, `generateOrderOtp` vs controller call `generateOtp`).

Impact:
- High likelihood of broken order flows even if routes resolve.

## 5.6 Payments

- Route: `src/routes/paymentRoute.js`
- Controller: `src/controllers/paymentController.js`
- Service: `src/services/paymentService.js`

Behavior intent:
- Validate ownership of pending order.
- Create Razorpay order.
- Save `razorpayOrderId` in order record.
- Return key/order metadata to frontend.

Issue:
- Controller reads `req.user.id` while middleware sets `_id`.
- `ApiResponse` in payment controller appears to use wrong constructor argument order.

---

## 6) Service Layer Audit

## 6.1 authService

Capabilities:
- register user
- login user
- fetch user profile
- generate tokens

Key issue:
- Token payload currently includes `college: User.college` (from model class), not actual user doc field.

Recommended shape for token payload:
- `id`
- `college`
- `role`

## 6.2 categroryService

Capabilities:
- list active categories
- create category with unique slug check
- update category
- soft delete category

Status:
- Relatively stable.

## 6.3 listingService

Current status:
- Contains advanced filtering, pagination, and ownership logic.
- But coded in controller-style with `req/res` and API response emission, not service abstraction.

Risk:
- Architectural mismatch with controller expectations.

## 6.4 orderSerivce

Current status:
- Includes business logic for create/cancel/orders/OTP verification.
- Also controller-style implementation with `req/res` and inconsistent symbols.

Notable defects:
- Uses `ListingId` and `listingID` key variants inconsistently.
- Status checks use values not matching listing schema enum casing (`ACTIVE` vs `Active`).
- `verifyOtp` references `orderId` symbol that is undefined in scope.
- OTP field naming mismatches (`otpExpiry` vs schema uses `otpExpiresAt`).

## 6.5 paymentService

Strengths:
- Validates Razorpay config availability.
- Validates ownership and pending status before creating payment order.

Risk:
- Amount source uses listing snapshot `price`; business rule may need `buyerPrice` depending platform fee collection model.

---

## 7) Data Model Audit

## 7.1 User (`src/models/user.model.js`)

Fields:
- name, email, password, college, profilePic, phone, role, isVerified, refreshToken

Hooks:
- pre-save password hashing

Methods:
- `comparePassword`

Strengths:
- Good basic constraints and defaults.

## 7.2 Category (`src/models/category.model.js`)

Fields:
- name, slug, icon, suggestedMaxPrice, isActive

Strengths:
- Supports soft delete via `isActive`.

## 7.3 Listing (`src/models/listing.model.js`)

Fields:
- sellerId, title, description, categoryId, mrp, price, buyerPrice, platformFee, condition, images, status, college, viewCount

Indexes:
- text index for search
- category/seller/college/status/buyerPrice indexes

Strengths:
- Supports campus scoping and list filtering.

## 7.4 Order (`src/models/order.model.js`)

Fields:
- buyerId, sellerId, listingId, listing snapshot, college, status lifecycle
- payment refs: razorpayOrderId/razorpayPaymentId
- OTP fields, payout tracking, cancellation reason

Strengths:
- Good base lifecycle model for campus handoff commerce.

Mismatch risks:
- Service layer sometimes writes fields with names that do not exactly match schema keys.

---

## 8) Auth, Security, and Session Audit

## 8.1 Current auth transport model

- Cookies are set for access and refresh token.
- Frontend also sends bearer token from local storage.

Result:
- Hybrid dual transport with no explicit reconciliation strategy.

## 8.2 Middleware behavior

`verifyToken` currently:
- reads bearer or cookie token
- verifies with `JWT_SECRET`
- hydrates `req.user` with `_id` and `role`

Issues:
- If token signed with a different secret, all protected endpoints fail.
- Business logic expects `req.user.college` in listing/order flows.

## 8.3 Role authorization

`authorizeRoles` depends on `req.user.role`, but token payload likely does not include role reliably today.

---

## 9) Response and Error Contract Audit

## 9.1 Standard wrappers

- `ApiResponse`: `(statusCode, data, message)`
- `ApiError`: supports multiple legacy invocation styles

## 9.2 Consistency issues

Some controllers instantiate response as `(statusCode, message, data)` which can invert response semantics consumed by frontend.

Priority:
- Normalize all response construction to exact same order.

---

## 10) Backend-Frontend Contract Alignment

Frontend currently depends on:
- auth login/register returning `data.user` + `data.accessToken`

Backend availability for future frontend work:
- Listings, orders, payments, categories endpoints exist at route level

Main blockers for consuming those endpoints safely:
- Listing controller/service contract mismatch
- Order controller/service contract mismatch
- Auth middleware claim hydration gaps (`college`)
- Token secret mismatch
- Inconsistent response payload construction

---

## 11) Critical Findings (Severity Ordered)

## 11.1 Critical

1. Controller-service contract break in listings domain.
2. Controller-service contract break in orders domain.
3. JWT sign/verify secret mismatch risk (`ACCESS_TOKEN_SECRET` vs `JWT_SECRET`).
4. Missing `college` in `req.user` while listing/order logic requires it.

## 11.2 High

5. Token payload built with model static property (`User.college`) instead of user value.
6. Payment controller expects `req.user.id` but middleware sets `_id`.
7. Response constructor argument order inconsistent in some controllers.
8. Enum/value casing mismatches in order-listing status checks.

## 11.3 Medium

9. Dual cookie+bearer strategy without refresh/logout lifecycle endpoint.
10. Naming inconsistencies and typos (`orderSerivce`, `categroryService`, field key variants) increase maintenance risk.

---

## 12) Recommended Refactor Plan

## Phase 1: Contract Stabilization (highest priority)

1. Unify JWT secret usage for sign and verify.
2. Standardize JWT claims to include `id`, `college`, `role`.
3. Update middleware to populate canonical `req.user` object with all required fields.
4. Normalize all `ApiResponse` constructor call order.

## Phase 2: Layer Realignment

1. Convert `listingService` into pure functions without `req/res`.
2. Convert `orderSerivce` into pure functions without `req/res`.
3. Ensure controller function signatures and service exports match exactly.
4. Resolve naming mismatches and typos while preserving route behavior.

## Phase 3: Commerce Reliability

1. Validate all status transitions against enum values.
2. Align payment amount source (`price` vs `buyerPrice`) with business rule.
3. Add explicit payment success webhook/verification flow.
4. Add logout + refresh token lifecycle endpoints if required by auth strategy.

---

## 13) API Contract Recommendations for Frontend Integration

### 13.1 Standard success envelope

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "success": true
}
```

### 13.2 Standard error envelope

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### 13.3 Minimum listing payload for frontend compatibility

```json
{
  "id": "listingId",
  "title": "...",
  "description": "...",
  "category": "Engineering",
  "condition": "Like New",
  "mrp": 650,
  "price": 320,
  "buyerPrice": 330,
  "college": "IIT Bombay",
  "seller": {
    "id": "...",
    "name": "..."
  },
  "images": ["..."],
  "status": "Active"
}
```

### 13.4 Minimum order payload for profile/cart compatibility

```json
{
  "id": "orderId",
  "status": "PENDING_PAYMENT",
  "createdAt": "2026-04-18T12:00:00.000Z",
  "listing": {
    "id": "...",
    "title": "...",
    "image": "..."
  },
  "buyer": { "id": "...", "name": "..." },
  "seller": { "id": "...", "name": "..." },
  "listingSnapShot": {
    "buyerPrice": 330,
    "price": 320,
    "platformFee": 10
  }
}
```

---

## 14) Testing and Verification Recommendations

## Backend unit/integration tests

- Auth:
  - register/login token claims include id/college/role
  - middleware verification succeeds with same secret
- Listings:
  - create/read/update/delete ownership and college scoping
  - filter + pagination behavior
- Orders:
  - create order from active listing only
  - self-purchase blocked
  - status transitions valid
  - OTP generate/verify happy and failure paths
- Payments:
  - pending-payment guard
  - unauthorized buyer blocked
  - Razorpay order id persistence
- Contract:
  - all success responses follow same envelope shape

## Smoke tests (integration with frontend)

- login -> marketplace fetch listings -> add to cart -> create order -> payment init -> profile order visible

---

## 15) Backend Readiness Score

Current backend readiness for full frontend integration: 4.8 / 10

Scoring rationale:
- Route surface and domain modeling are in place.
- Core commerce capabilities are designed.
- But internal implementation consistency is not production-safe yet due to contract and layering mismatches.

---

## 16) Priority Sprint Plan

Sprint 1:
- Fix auth claims + secret consistency + middleware user hydration
- Normalize ApiResponse usage across controllers
- Repair listing route-controller-service chain

Sprint 2:
- Repair order route-controller-service chain
- Fix status/value/key mismatches in order service
- Validate end-to-end order lifecycle via tests

Sprint 3:
- Harden payment orchestration (verification/webhook)
- Add refresh/logout lifecycle APIs
- Final contract freeze for frontend integration

---

End of Report.
