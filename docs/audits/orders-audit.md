# Orders Audit

## Module Overview

The orders module covers order creation, seller and buyer views, OTP handoff verification, cancellation, and order state transitions.

## Files Involved

- [backend/src/controllers/orderController.js](../../backend/src/controllers/orderController.js)
- [backend/src/routes/orderRoute.js](../../backend/src/routes/orderRoute.js)
- [backend/src/models/order.model.js](../../backend/src/models/order.model.js)
- [backend/src/services/orderService.js](../../backend/src/services/orderService.js)
- [frontend/src/pages/CartPage.jsx](../../frontend/src/pages/CartPage.jsx)
- [frontend/src/pages/MyOrdersPage.jsx](../../frontend/src/pages/MyOrdersPage.jsx)
- [frontend/src/pages/SellerOrdersPage.jsx](../../frontend/src/pages/SellerOrdersPage.jsx)
- [frontend/src/pages/OtpHandoffPage.jsx](../../frontend/src/pages/OtpHandoffPage.jsx)

## Manual Testing Checklist

- [ ] Create an order from a valid listing.
- [ ] Confirm buyer and seller views show the order correctly.
- [ ] Verify OTP handoff works with valid and invalid values.
- [ ] Cancel an order and confirm the state changes everywhere.
- [ ] Confirm order history is accurate after state updates.

## Code Review Checklist

- [ ] State transitions are explicit and guarded.
- [ ] Handoff OTP validation is strict.
- [ ] Order creation is idempotent or safely repeated.
- [ ] Seller and buyer access checks are correct.
- [ ] Failure paths do not leave inconsistent order state.

## Production Readiness Checklist

- [ ] Order events are logged with enough context for support.
- [ ] Expired or invalid OTPs are handled cleanly.
- [ ] Notification failures do not silently break order flow.
- [ ] Concurrency hazards are documented and mitigated.
- [ ] Production metrics or alerts exist for failed completions.

## Bugs Found

- The engineering audit flags missing idempotency for order creation.
- OTP handoff validation and expiry cleanup require review.
- Payout release logic is referenced but not clearly surfaced.

## Notes

This audit should be read together with the interests, ratings, and reports audit because the flows overlap.

## Final Status

Draft - audit document created; detailed verification is still required.
