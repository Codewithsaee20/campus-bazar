# Listings Audit

## Module Overview

The listings module covers create, read, update, delete operations for book listings, including image upload, seller-owned listing views, and listing detail rendering.

## Files Involved

- [backend/src/controllers/listingController.js](../../backend/src/controllers/listingController.js)
- [backend/src/routes/listingRoute.js](../../backend/src/routes/listingRoute.js)
- [backend/src/models/listing.model.js](../../backend/src/models/listing.model.js)
- [backend/src/services/listingService.js](../../backend/src/services/listingService.js)
- [backend/src/middleware/uploadMiddleware.js](../../backend/src/middleware/uploadMiddleware.js)
- [backend/src/utils/pricing.js](../../backend/src/utils/pricing.js)
- [frontend/src/pages/ListingFormPage.jsx](../../frontend/src/pages/ListingFormPage.jsx)
- [frontend/src/pages/ListingDetailPage.jsx](../../frontend/src/pages/ListingDetailPage.jsx)
- [frontend/src/pages/MarketplaceBookDetailPage.jsx](../../frontend/src/pages/MarketplaceBookDetailPage.jsx)
- [frontend/src/pages/MyListingsPage.jsx](../../frontend/src/pages/MyListingsPage.jsx)

## Manual Testing Checklist

- [ ] Create a listing with valid metadata and images.
- [ ] Edit a listing and confirm changes persist.
- [ ] Delete a listing and verify it disappears from seller views.
- [ ] Open listing detail pages with valid and invalid IDs.
- [ ] Confirm upload limits and validation errors are surfaced.

## Code Review Checklist

- [ ] Listing ownership checks are enforced on updates and deletes.
- [ ] Upload middleware and schema limits are consistent.
- [ ] Pricing helpers are deterministic and tested.
- [ ] Listing queries are bounded or paginated.
- [ ] Frontend forms validate required data before submit.

## Production Readiness Checklist

- [ ] File upload failures do not create partial listings.
- [ ] Listing edit and delete permissions are locked to owners.
- [ ] Listing responses are consistent for public and owner views.
- [ ] API errors are mapped to user-friendly messages.
- [ ] Image upload/storage limits are documented.

## Bugs Found

- The engineering audit notes a mismatch between upload limits in config and schema expectations.
- Pagination is missing in at least one listing retrieval path.
- College isolation is enforced by filtering rather than stronger access control.

## Notes

Listing behavior also affects marketplace discovery and order flows.

## Final Status

Draft - audit document created; confirm against runtime behavior before closing.
