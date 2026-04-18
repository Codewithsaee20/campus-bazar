# Backend-Frontend Requirements

## Purpose
This document defines the agreed contract between frontend and backend for user authentication and onboarding, including required fields, API payloads, validation rules, and screen flow.

## Scope
- Registration (college email based)
- OTP send and verify
- Login session setup
- Authenticated profile fetch
- COD order handoff between buyer and seller

## Current Backend Source of Truth
- User schema: `campusBazzar-backend/src/models/user.model.js`
- Auth controller: `campusBazzar-backend/src/controllers/authController.js`
- Auth service: `campusBazzar-backend/src/services/authService.js`
- Auth routes: `campusBazzar-backend/src/routes/authRoute.js`

## Data Contract: User Registration

### Required fields from frontend
The frontend must send these exact field names in `POST /api/v1/auth/register`:

1. `name`
2. `email`
3. `phone` (same as WhatsApp number)
4. `department`
5. `branch`

### Field definitions
1. `name`
- Type: string
- Required: yes
- Recommended UI label: Full Name
- Suggested constraints (frontend): 2-60 chars, trim whitespace

2. `email`
- Type: string
- Required: yes
- Must be valid email format
- Must be college domain email (validated by backend)
- Recommended UI label: College Email

3. `phone`
- Type: string
- Required: yes
- Stored as WhatsApp number
- Backend accepted format: optional `+` followed by 10-15 digits
- Regex compatible with backend: `^\+?[0-9]{10,15}$`
- Recommended UI label: WhatsApp Number

4. `department`
- Type: string
- Required: yes
- Recommended UI label: Department
- Suggested frontend: trim and non-empty validation

5. `branch`
- Type: string
- Required: yes
- Recommended UI label: Branch
- Suggested frontend: trim and non-empty validation

## API Requirements

Base URL (frontend):
- `http://localhost:3000/api/v1`

### 1) Register user
Endpoint:
- `POST /auth/register`

Request body:
```json
{
  "name": "Priya Sharma",
  "email": "priya@college.edu",
  "phone": "+919876543210",
  "department": "Engineering",
  "branch": "Computer Science"
}
```

Success response:
- HTTP `201`
- Message indicates OTP sent to college email
- Frontend should not expect login token here

Frontend action on success:
1. Show success message
2. Redirect to OTP verification screen
3. Prefill email on OTP screen

### 2) Send OTP
Endpoint:
- `POST /auth/send-otp`

Request body:
```json
{
  "email": "priya@college.edu"
}
```

Success response:
- HTTP `200`
- Message indicates OTP sent

Possible errors:
- Rate limit if requested too frequently

### 3) Verify OTP
Endpoint:
- `POST /auth/verify-otp`

Request body:
```json
{
  "email": "priya@college.edu",
  "otp": "123456"
}
```

Success response:
- HTTP `200`
- Returns authenticated `user`
- Returns `accessToken`
- Sets `refreshToken` cookie server-side

Frontend action on success:
1. Save `user` and `accessToken` in auth store
2. Mark `isAuthenticated = true`
3. Navigate to marketplace or dashboard

### 4) Logout
Endpoint:
- `POST /auth/logout`
- Requires authentication

Frontend action:
1. Clear auth store
2. Redirect to login

### 5) Refresh token
Endpoint:
- `POST /auth/refresh`
- Uses `refreshToken` cookie

Frontend action:
1. Replace expired access token in store
2. Retry protected request if needed

### 6) Get profile
Endpoint:
- `GET /auth/me`
- Requires authentication

Expected user fields in response:
1. `_id`
2. `name`
3. `email`
4. `phone`
5. `department`
6. `branch`
7. `college`
8. `profilePic`
9. `role`
10. `isVerified`

## COD Order Flow Requirements

### Business requirement
When a buyer places a book order, the seller must receive buyer details for cash-on-delivery coordination.

Seller must be able to view:
1. Buyer name
2. Buyer phone number (WhatsApp)
3. Buyer department
4. Buyer branch

### Seller notification requirement
When a buyer creates an order on a listing, seller must be notified that their listing is booked.

Notification channel (current implementation):
1. Email notification to seller registered email

Notification content must include:
1. Listing/book title
2. Buyer name
3. Action hint to open selling orders and contact buyer for COD

### Seller-facing order APIs

### 1) List seller orders
Endpoint:
- `GET /orders/my/selling`

Response requirement:
- Each order must include populated `buyerId` object with:
1. `name`
2. `phone`
3. `department`
4. `branch`
5. `email`
6. `college`

### 2) Seller order details
Endpoint:
- `GET /orders/:id`

Response requirement:
- If requester is seller, order must include populated `buyerId` object with:
1. `name`
2. `phone`
3. `department`
4. `branch`
5. `email`
6. `college`

### COD handoff flow
1. Buyer places order with `POST /orders`.
2. Seller gets "listing booked" notification.
3. Seller opens selling orders and sees buyer contact and academic details.
4. Seller contacts buyer and coordinates meetup for COD.
5. Seller accepts order (`status = ACCEPTED`).
6. At handoff point, seller generates OTP.
7. Buyer verifies OTP to mark transaction as complete.

### Privacy and security rule
Buyer personal details are visible only to the seller of that specific order and only through authenticated endpoints.

## Frontend Screen and Flow Requirements

### Screen 1: Sign Up
Fields (required):
1. Full Name (`name`)
2. College Email (`email`)
3. WhatsApp Number (`phone`)
4. Department (`department`)
5. Branch (`branch`)

Primary action:
- Submit registration

On success:
- Move to OTP verification screen

### Screen 2: OTP Verification
Fields:
1. Email (prefilled from signup; editable if needed)
2. OTP (6 digits)

Actions:
1. Verify OTP
2. Resend OTP

On success:
- Login complete, go to protected area

### Screen 3: Authenticated App Entry
- Route user to marketplace/profile after OTP verification

## Frontend Validation Requirements

Apply before API call:
1. All signup fields required
2. Valid email format
3. Phone format: `^\+?[0-9]{10,15}$`
4. Trim string fields (`name`, `department`, `branch`)
5. Prevent duplicate submits while request is pending

## Error Handling Requirements (Frontend)

Frontend should display backend message where available.

Common scenarios:
1. Invalid college email domain
2. User already exists
3. OTP rate limit exceeded
4. OTP expired
5. Invalid OTP
6. Network/server failure

## Routing and Guards

Recommended auth routes:
1. `/signup`
2. `/verify-otp`
3. `/login`

Recommended protected routes:
1. `/marketplace`
2. `/profile`
3. `/sell`
4. `/cart`

Guard behavior:
1. Unauthenticated users cannot access protected routes
2. Authenticated users should be redirected away from `/signup` and `/login`

## State Management Requirements

Auth store should hold:
1. `user`
2. `token` (access token)
3. `isAuthenticated`

On verify OTP success:
1. Persist `user`
2. Persist `token`
3. Set `isAuthenticated = true`

On logout:
1. Clear all auth state

## Non-Functional Requirements

1. Loading states on all auth actions (`register`, `send OTP`, `verify OTP`)
2. Disable buttons during in-flight requests
3. Accessible labels and input error text
4. Mobile responsive auth screens
5. Do not log OTPs, tokens, or sensitive data in production

## QA Checklist

1. Register with valid college email succeeds and sends OTP
2. Register with non-college email is rejected
3. Missing any required field returns validation error
4. Phone outside 10-15 digits is rejected
5. OTP verify logs user in and stores auth state
6. Resend OTP respects rate limit behavior
7. Protected routes require authentication
8. Logout clears session and redirects correctly
9. Seller sees buyer `name`, `phone`, `department`, and `branch` in selling orders
10. Non-seller/non-buyer cannot view order details

## Example Frontend Payload Constants

```js
const registerPayload = {
  name: formData.name.trim(),
  email: formData.email.trim(),
  phone: formData.phone.trim(),
  department: formData.department.trim(),
  branch: formData.branch.trim(),
};

const verifyOtpPayload = {
  email: formData.email.trim(),
  otp: formData.otp.trim(),
};
```

## Versioning Note
If backend changes field names or response shape, this file must be updated in the same pull request to keep frontend and backend aligned.
