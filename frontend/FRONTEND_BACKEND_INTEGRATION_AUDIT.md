# CampusBazar Frontend Audit Report (Integration-Ready)

Date: 2026-04-18
Scope: Frontend architecture, pages, functions, routing, state connections, API contracts, user flows, and backend integration readiness.

---

## 1) Executive Summary

The frontend is a React + Vite SPA with client-side routing and Zustand persistence.

Current integration status:
- Authentication endpoints are integrated from frontend (`/auth/login`, `/auth/register`).
- Marketplace, sell, cart, and profile business flows are mostly demo/local-state driven and not yet connected to backend listing/order/payment APIs.
- There are backend response-shape and auth-payload inconsistencies that will block full integration unless normalized.

Primary blockers before full integration:
- Frontend currently uses static catalog data (`mockBooks`) instead of `/listings` API.
- Cart checkout creates local order records in Zustand instead of calling `/orders` and `/payments` APIs.
- Backend middleware token field mismatch (`JWT_SECRET` vs `ACCESS_TOKEN_SECRET`) and missing `college`/`role` fields in `req.user` can break protected listing/order routes.
- Several backend controllers instantiate `ApiResponse` with argument order inconsistent with class definition.

---

## 2) Frontend Technical Architecture

### Stack
- React 19
- Vite 8
- React Router DOM 7
- Zustand (persist middleware)
- Axios
- Framer Motion + Three.js scene components for UI

### Bootstrapping
- App is mounted in strict mode with `BrowserRouter`.
- Entry point: `src/main.jsx`

### Runtime Layers
- Routing Layer: `src/App.jsx`
- Page Layer: `src/pages/*`
- State Layer: Zustand stores in `src/store/*`
- Data Access Layer: Axios instance in `src/utils/api.js`
- UI Components: `src/components/*`

---

## 3) Route Inventory (Frontend)

Defined routes:
- `/` -> LandingPage
- `/login` -> LoginPage
- `/signup` -> SignUpPage
- `/marketplace` -> MarketplacePage
- `/browse` -> MarketplacePage (alias route)
- `/sell` -> SellPage
- `/cart` -> CartPage
- `/profile` -> ProfilePage

Observations:
- No protected-route wrapper exists. Unauthenticated users can directly open `/sell`, `/cart`, `/profile`.
- Route alias `/browse` is used by navbar links for authenticated users.

Recommendation:
- Introduce route guards with redirect logic:
  - Protected: `/marketplace`, `/browse`, `/sell`, `/cart`, `/profile`
  - Public-only: `/login`, `/signup` (redirect to `/marketplace` if already authenticated)

---

## 4) Page-by-Page Functional Audit

## 4.1 Landing Page (`/`)

Main purpose:
- Marketing and conversion into auth flow.

Rendered sections/components:
- Navbar
- Hero
- Features
- Stats
- CTA
- Particle background visuals

Functional entry points:
- Hero CTA -> `/login`
- CTA section button -> `/login`
- Navbar guest mode -> `/marketplace`, `/#stats`, `/login`

Backend coupling:
- None directly.

Integration implications:
- No backend dependencies here; safe as-is.

---

## 4.2 Login Page (`/login`)

State:
- `email`, `password`, `loading`, `error` local state.

Functions:
- `handleLogin(e)`:
  - POST `/auth/login` with `{ email, password }`
  - expects `response.data.data.user` and `response.data.data.accessToken`
  - persists via `useAuthStore.setAuth(user, accessToken)`
  - navigates to `/marketplace`
- `handleDemoLogin()`:
  - injects hardcoded demo user and demo token
  - navigates to `/marketplace`

Current backend expectation contract:
- HTTP 200
- payload shape:
  - `data.user`
  - `data.accessToken`

Error behavior:
- Reads `err.response?.data?.message`
- fallback message indicates backend unavailable and suggests demo mode.

Integration risks:
- Demo login can bypass real backend validation in production-like environments.

---

## 4.3 Signup Page (`/signup`)

State:
- `formData: { name, email, password, college }`
- `loading`, `error`

Functions:
- `handleChange(e)` updates field by `name`
- `handleSignUp(e)`:
  - POST `/auth/register` with full `formData`
  - expects same payload shape as login
  - stores auth + navigates `/marketplace`
- `handleDemoSignUp()` sets demo user/token and navigates `/marketplace`

Backend expectation contract:
- HTTP 201
- payload shape:
  - `data.user`
  - `data.accessToken`

Integration notes:
- Frontend sends `college` always; backend has fallback from email domain if absent.

---

## 4.4 Marketplace Page (`/marketplace`, `/browse`)

Current data source:
- Static `mockBooks` from `src/data/mockBooks.js`

State and actions:
- Filters: `search`, `category`, `condition`
- Toast notifications for add-to-cart
- Uses cart store:
  - `addToCart(book)`
  - `items` for in-cart checks

Functions:
- `filtered` computed list by search/category/condition
- `handleAdd(book)` -> cart add + success toast
- `isInCart(id)` boolean check

Navigation actions:
- “List a Book” -> `/sell`
- Cart -> `/cart`

Backend coupling status:
- Not coupled; no listings API consumption yet.

Integration gap:
- Needs migration to backend listing APIs (`GET /listings`, etc.) with server-side or hybrid filtering.

---

## 4.5 Sell Page (`/sell`)

State:
- `form` object with book details
- `submitted` boolean

Functions:
- `handleChange(e)`
- `handleSubmit(e)`:
  - currently local only
  - sets submitted success state
  - redirects to `/marketplace` after timeout

Backend coupling status:
- Not coupled.

Integration gap:
- Should call `POST /listings` with auth token and payload mapping.

Required backend request fields (proposed mapping):
- title <- form.title
- author <- form.author
- price <- Number(form.price)
- originalPrice <- Number(form.originalPrice)
- condition <- form.condition
- category <- form.category
- description <- form.description
- college <- form.college (if backend allows override; else infer from user)

---

## 4.6 Cart Page (`/cart`)

State/store usage:
- Pulls from cart store:
  - `items`, `removeFromCart`, `updateQuantity`, `getTotal`, `clearCart`
- Pulls from order store:
  - `placeOrder(cartItems, total)`
- local `orderPlaced`

Functions:
- `handlePlaceOrder()`:
  - if empty cart return
  - creates local order via Zustand
  - clears cart
  - redirects to `/profile` after success screen

Backend coupling status:
- Not coupled to order/payment APIs.

Integration gap:
- Should transform cart into backend order flow:
  - Create order(s) using `/orders`
  - Initiate payment `/payments/create-order`
  - Handle payment success/failure
  - Refresh order list from backend

---

## 4.7 Profile Page (`/profile`)

State/store usage:
- Auth store for `user`, `isAuthenticated`
- Order store for local `orders`
- local editable profile state (name/email/phone/college/bio)

Functions:
- `handleSave()` only toggles edit mode off (no API write)
- computes `totalSpent` from local orders

Tabs:
- Purchases (orders)
- Listings (placeholder empty state)
- Activity (derived from local orders)

Backend coupling status:
- No `/auth/profile`, `/orders/my/buying`, `/orders/my/selling`, `/listings` user-specific reads.

Integration gap:
- Needs profile fetch/update API integration and order/listing synchronization.

---

## 5) Global Component Logic Affecting Flow

## 5.1 Navbar Behavior

Auth-dependent rendering:
- Guest mode links:
  - `/marketplace`, `/#stats`, `/login`
- Authenticated mode links:
  - `/browse`, `/sell`, `/cart`, `/profile`
  - logout button calls `useAuthStore.logout()`

Important behavior:
- Logout only clears frontend persisted auth state.
- No backend logout endpoint call (if refresh-token invalidation is needed).

---

## 6) State Management Audit (Zustand)

## 6.1 `useAuthStore`

Persist key:
- `auth-storage`

State:
- `user`, `token`, `isAuthenticated`

Actions:
- `setAuth(user, token)`
- `logout()`

Integration notes:
- Token stored in localStorage and also sent as Bearer via Axios interceptor.
- Backend also sets cookies (`accessToken`, `refreshToken`), creating dual-auth strategy.

Risk:
- Divergence between cookie token and local token can cause ambiguous auth behavior.

## 6.2 `useCartStore`

Persist key:
- `cart-storage`

State:
- `items[]`

Actions:
- `addToCart(product)` (id uniqueness check)
- `removeFromCart(productId)`
- `updateQuantity(productId, quantity)` (enforces min 1)
- `getTotal()`
- `getItemCount()`
- `clearCart()`

Integration note:
- All cart data client-side only, no backend persistence.

## 6.3 `useOrderStore`

Persist key:
- `order-storage`

State:
- `orders[]`

Actions:
- `placeOrder(cartItems, total)` creates synthetic order:
  - id: `Date.now()`
  - date: ISO string
  - status: `Confirmed`

Integration note:
- This is a local simulation store and must be replaced/augmented with backend order APIs.

---

## 7) API Layer Audit (Frontend)

Axios instance config:
- baseURL: `http://localhost:3000/api/v1`
- `withCredentials: true`
- Request interceptor:
  - reads `auth-storage` from localStorage
  - if token exists, sets `Authorization: Bearer <token>`

Current API usage in pages:
- `POST /auth/login` (LoginPage)
- `POST /auth/register` (SignUpPage)

No current calls for:
- listings
- orders
- payments
- categories
- profile read/update

---

## 8) Backend-Frontend Endpoint Mapping

## 8.1 Implemented and Aligned

- Frontend `POST /auth/login` <-> backend route exists
- Frontend `POST /auth/register` <-> backend route exists

Expected auth response shape used by frontend:
- `data.user`
- `data.accessToken`

This appears compatible with auth controller implementation.

## 8.2 Available in Backend but Unused by Frontend

- `GET /auth/profile` (protected)
- `GET /listings`
- `GET /listings/:id`
- `POST /listings` (protected)
- `PUT /listings/:id` (protected)
- `DELETE /listings/:id` (protected)
- `POST /orders` (protected)
- `GET /orders/my/buying` (protected)
- `GET /orders/my/selling` (protected)
- `GET /orders/:id` (protected)
- `PATCH /orders/:id/cancel` (protected)
- `POST /orders/:id/otp/generate` (protected)
- `POST /orders/:id/otp/verify` (protected)
- `POST /payments/create-order` (protected)

---

## 9) Integration Risks and Contract Mismatches

## 9.1 Critical

1. Token verification secret mismatch risk
- Auth service signs token using `ACCESS_TOKEN_SECRET`.
- Middleware verifies using `JWT_SECRET`.
- If env vars differ, all protected routes fail with 401.

2. `req.user` incomplete for listing/order logic
- Middleware sets only `_id` and `role`.
- Listing/order controllers use `req.user.college`.
- This will be undefined and can break college-scoped logic.

3. Listing controller import bug
- `listingService` is used but not imported correctly.
- Could throw runtime `listingService is not defined` when listing routes are hit.

## 9.2 High

4. Inconsistent `ApiResponse` constructor usage in some controllers
- Class signature is `(statusCode, data, message)`.
- Some controllers call `(statusCode, 'message', data)` causing swapped payload semantics.

5. `GET /listings` currently reads `req.user.college` but route is public
- Route does not use auth middleware.
- Accessing `req.user.college` can fail for guest requests.

6. Payment controller uses `req.user.id` while middleware sets `_id`
- `req.user.id` may be undefined.

## 9.3 Medium

7. Dual auth transport strategy not fully normalized
- Cookies + Bearer both used.
- No refresh-token handling on frontend.
- No explicit logout API to invalidate refresh token.

8. No frontend route guarding
- Users can access protected UX pages without auth and hit failures later.

---

## 10) End-to-End Flow Audit (Current vs Target)

## 10.1 Current Flow (As Built)

1) User lands on `/`
2) Clicks login/signup CTA
3) Auth API call succeeds or user enters demo mode
4) User enters marketplace with static books
5) Adds books to local cart
6) Checkout creates local order only
7) Profile reads local orders only

Nature: Hybrid demo flow with real auth + simulated commerce.

## 10.2 Target Integrated Flow (Recommended)

1) Auth:
- signup/login with backend
- token/cookie management unified
- route guard active

2) Marketplace:
- fetch listings from backend
- filter client-side or query backend
- add cart item includes listing id and seller id

3) Checkout:
- call `/orders` per listing or consolidated payload design
- call `/payments/create-order`
- run payment capture/verification
- refresh backend order state

4) Profile:
- fetch `/auth/profile`
- fetch `/orders/my/buying`
- fetch `/orders/my/selling`
- fetch user listings

5) Order completion:
- seller generates OTP
- buyer verifies OTP
- status transitions reflected in UI

---

## 11) Integration Implementation Checklist

## 11.1 Frontend Tasks

1. Add route guards and auth redirects.
2. Replace `mockBooks` rendering with `GET /listings`.
3. Replace Sell local submit with `POST /listings`.
4. Replace local checkout with backend order + payment flow.
5. Replace profile local order list with backend order queries.
6. Add loading/error/empty states for all async pages.
7. Decide auth source of truth:
   - cookie-first OR bearer-first
   - add token refresh strategy if bearer-first
8. Add logout API call (if backend supports token invalidation).

## 11.2 Backend Tasks (to unblock frontend)

1. Unify JWT signing and verification secret usage.
2. Ensure middleware populates `req.user` with required fields:
   - `_id`
   - `college`
   - `role`
3. Fix listing service import/usage in listing controller.
4. Standardize `ApiResponse` argument ordering in all controllers.
5. Ensure public listing endpoints do not read undefined `req.user`.
6. Fix payment controller user-id field consistency.

---

## 12) Contract Reference for Frontend Team

Auth success expected shape:
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "college": "...",
      "role": "user"
    },
    "accessToken": "..."
  },
  "message": "User logged in successfully",
  "success": true
}
```

Suggested listing item shape (for marketplace/cart compatibility):
```json
{
  "id": "listingId",
  "title": "Data Structures & Algorithms",
  "author": "...",
  "price": 320,
  "originalPrice": 650,
  "condition": "Like New",
  "category": "Engineering",
  "college": "IIT Bombay",
  "seller": "Rahul Sharma",
  "sellerId": "userId",
  "image": "https://...",
  "description": "..."
}
```

Suggested order summary shape (for profile/cart transitions):
```json
{
  "id": "orderId",
  "items": [
    {
      "listingId": "...",
      "title": "...",
      "author": "...",
      "quantity": 1,
      "price": 320,
      "image": "..."
    }
  ],
  "total": 320,
  "status": "Confirmed",
  "date": "2026-04-18T12:00:00.000Z"
}
```

---

## 13) Testing Coverage Recommendations for Integration

Minimum API integration tests (frontend):
- Login success/failure and token persistence
- Signup success/failure and profile hydration
- Marketplace fetch + filter + add-to-cart with real listing ids
- Sell form submission and post-submit list refresh
- Cart checkout success/failure rollback behavior
- Profile orders tab loads from backend and handles empty/error
- Protected route access behavior for unauthenticated users

Minimum backend contract tests:
- Auth payload shape matches frontend expectation
- Protected routes accept same token strategy as frontend
- Listings route returns fields used by UI cards/cart/profile
- Order creation and retrieval include required display metadata
- Payment route uses correct user id extraction

---

## 14) Final Integration Readiness Score

Current readiness for full commerce integration: 4.5 / 10

Scoring rationale:
- Strong UI structure and clear UX flows
- Good auth start (login/register integration exists)
- But business-critical marketplace/order/payment layers still local/demo-driven
- Backend contract issues likely to block secure protected-route integrations

---

## 15) Priority Plan (Suggested Sprint Order)

Sprint 1:
- Fix backend auth/middleware/response-shape inconsistencies
- Add frontend route guards
- Integrate real listing fetch/render

Sprint 2:
- Integrate create listing flow
- Integrate order creation + order fetch
- Replace local order store with server-backed state

Sprint 3:
- Integrate payment initiation and result handling
- Integrate OTP handoff flow
- Add profile sync and edit APIs

---

End of Report.
