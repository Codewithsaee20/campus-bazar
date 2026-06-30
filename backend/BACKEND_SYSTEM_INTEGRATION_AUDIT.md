# CampusBazar Backend System Integration Audit (Refreshed v3)

Date: 2026-04-18
Scope: Backend runtime architecture, route/controller/service/model integrity, auth/session handling, listing image upload flow, and integration readiness.

---

## 1) Executive Summary

The backend is now materially more stable than the previous audit snapshot:

- OTP-only auth remains consistent.
- DB startup is fail-fast.
- Listing image upload is wired end-to-end.
- All mounted route modules now exist and load.
- Book controller and book service are now aligned on the same contract.
- Order creation now has both application-level and database-level protection against duplicate active orders.

Current readiness is good, with only medium-priority hardening items remaining.

---

## 2) Runtime Snapshot

### 2.1 Stack and Boot

- Runtime: Node.js + ES modules
- HTTP: Express
- DB: MongoDB via Mongoose
- Auth/session: JWT access + refresh cookie strategy
- Media: Cloudinary via `uploadMiddleware`

Boot flow:
1. `server.js` imports `app` and `connectDB()`.
2. `connectDB()` attempts Mongo connection.
3. On DB failure, connector logs and exits process with code 1.
4. On success, server listens.

### 2.2 Reliability of Startup

- DB failure no longer allows a half-alive server.
- Route imports currently resolve successfully.

---

## 3) Router Inventory (Current Code Reality)

### 3.1 Present Route Files

`src/routes` currently contains:

- `authRoute.js`
- `bookRoute.js`
- `categoryRoute.js`
- `healthCheckRoute.js`
- `interestRoute.js`
- `listingRoute.js`
- `orderRoute.js`
- `ratingRoute.js`
- `reportRoute.js`

### 3.2 Mounted in app.js

Mounted paths include:

- `/api/v1/health`
- `/api/v1/auth`
- `/api/v1/listings`
- `/api/v1/categories`
- `/api/v1/orders`
- `/api/v1/interest`
- `/api/v1/ratings`
- `/api/v1/reports`
- `/api/v1/books`

Result:
- Previous missing-route startup blocker is resolved.

---

## 4) Domain Assessment

### 4.1 Auth Domain

Status:
- OTP-first auth remains functional in service/controller flow.
- User schema is consistent with OTP-only approach.

Strengths:
- Proper `ApiError` usage in auth service.
- Refresh/logout/profile route behavior remains aligned.

Remaining notes:
- Cookie mode remains strict and may need deployment-specific review.

### 4.2 Listing Domain

Status:
- Listing create/update support image upload via middleware.
- Controller maps `req.uploadedImages` to listing payload.

Implemented upload chain:
1. `listingRoute` applies `uploadImages` on POST and PUT.
2. `uploadMiddleware` validates file type and uploads to Cloudinary.
3. Uploaded payload shape: `{ url, public_id }`.
4. `listingController` assigns `payload.images = req.uploadedImages`.
5. `listing.model` stores image objects.

Current gaps:
- Middleware max image count is 3 while schema allows 5.
- Frontend still needs to map card image source to `images[0]?.url` for backend-fed listings.

### 4.3 Book Domain

Status:
- `Book` model and `bookService` are present.
- `bookRoute` and `bookController` now exist and are mounted.
- `bookController.findOrCreateBook` and `bookService.findOrCreateBook` now share the same object-based contract.

Remaining note:
- Search fallback still exists in `bookController.searchBooks` for when text search is unavailable; this is acceptable and not a startup risk.

### 4.4 Order Domain

Status:
- `Order` schema uses `otpExpiresAt` and canonical status enum.
- `bookId` field is present in schema and indexed.
- `createOrder` now checks for existing active orders before creating a new one.
- A partial database index now provides a safety net against duplicate active orders.
- `cancelOrder` restores the listing to `Active`.

Remaining note:
- Resale counts now use the `bookId` business key path, so the previous `_id` mismatch risk has been removed.

---

## 5) Model Integrity

### 5.1 User Model

Resolved:
- Password hash hook removed.
- `comparePassword` removed.
- OTP-only schema is clean.

### 5.2 Listing Model

Updated:
- Includes `bookId`, `isbn`, `sourceOrderId`, `mrpLocked`, `flaggedForReview`, `department`, `semester`, `subject`.
- `images` uses `{ url, public_id }` object array.

### 5.3 Order Model

Updated:
- Status enum exactly: `PENDING`, `ACCEPTED`, `COMPLETED`, `CANCELLED`.
- Uses `otpExpiresAt`.
- Includes `bookId` field.
- Includes partial index for one active order per listing.

### 5.4 Book Model

Updated:
- Unique indexed `bookId`.
- Includes `originalMrp`, `totalResales`, and `mrpLocked`.

---

## 6) Error Contract and Service Layer Quality

Improved:
- `listingService`, `orderService`, and `bookService` largely use `ApiError` for domain failures.
- Book service/controller contract is now aligned.

Remaining service correctness issues:
1. No additional service-level blockers are currently identified from the latest code snapshot.

---

## 7) Findings by Severity (Current)

### Medium

1. Upload middleware limit (3) and schema limit (5) mismatch.
2. CORS origin remains hardcoded.
3. No request schema validation middleware for mutating routes.

---

## 8) What Is Fixed Since Previous Refresh

- Missing route module startup blocker resolved (all mounted routes now exist).
- `bookController` and `bookService` now share the same object-based contract.
- `Order` schema now includes indexed `bookId`.
- Order creation now checks for active orders before inserting.
- Database-level partial index added for one active order per listing.
- Cancelled orders now reactivate the listing.

---

## 9) Remediation Plan (Next)

### Phase 1: Correctness

1. Align image upload max count between middleware and schema.

### Phase 2: Consistency and Safety

1. Align image max count between middleware and schema.
2. Add request payload validation.

### Phase 3: Hardening

1. Move CORS origins to environment config.

---

## 10) Readiness Score (Refreshed v4)

Backend integration readiness: **8.4 / 10**

Rationale:
- Structural and startup blockers are resolved.
- Route wiring and upload flows are functional.
- Duplicate active order protection is in place at both app and DB levels.
- The previous resale lookup bug has been removed.
- Remaining issues are now mainly production-hardening items.

---

End of refreshed report.
