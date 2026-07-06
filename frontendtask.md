# Frontend Redesign — Task Breakdown

Goal: more responsive, smoother, more polished UI across `frontend/src`, without breaking auth flow or the order status machine (PENDING → ACCEPTED → DELIVERY_MARKED → DELIVERY_CONFIRMED → COMPLETED).

Each task below is scoped to be a single working session/feature. Work top to bottom — later tasks depend on earlier ones. Check off as completed.

---

## 0. Baseline
- [ ] Screenshot all 20 pages at mobile / tablet / desktop widths (reference for before/after comparison)
- [ ] Decide scope: token/polish refresh vs. full visual identity change
- [ ] Decide CSS scoping approach going forward: CSS Modules vs. stricter naming convention (no new UI framework dependency assumed unless decided otherwise)

## 1. Design token & breakpoint system
- [ ] Extend existing `:root` / `:root[data-theme='dark']` CSS variables in `src/index.css` into a full token set: spacing scale, type scale, radii, shadow scale, z-index scale, motion durations/easings
- [ ] Define a mobile-first breakpoint scale (sm/md/lg/xl) to replace the current 3 ad hoc breakpoints
- [ ] Apply new breakpoints/tokens to `src/App.css` and `src/index.css` structure (no page-level changes yet)

## 2. Shared components hardening
- [ ] Navbar — responsive/token pass
- [ ] Hero + BookHeroAnimation + ParticleField + ThreeScene — responsive/token pass
- [ ] CTA, Features, Stats — responsive/token pass
- [ ] FeaturedCarousel — responsive/token pass, verify touch/swipe on mobile
- [ ] RouteGuards — no visual change expected, verify no regression

## 3. Tier A pages (low risk — marketing/browse)
- [ ] LandingPage
- [ ] FeedPage
- [ ] CategoriesPage
- [ ] MarketplacePage
- [ ] MarketplaceBookDetailPage
- [ ] BookDetailPage
- [ ] ListingDetailPage
- [ ] InterestsPage

## 4. Tier B pages (auth flow — verify redirects/state after restyle)
- [ ] LoginPage
- [ ] SignUpPage
- [ ] AuthPhonePage
- [ ] OtpVerificationPage
- [ ] OtpHandoffPage
- [ ] ProfilePage

## 5. Tier C pages (transactional)
- [ ] CartPage
- [ ] SellPage
- [ ] ListingFormPage
- [ ] MyListingsPage

## 6. Tier D pages (order-state-machine driven — highest care)
- [ ] MyOrdersPage — restyle status badges/steps sourced from `useOrderStore.js` state values, do not hardcode labels/colors
- [ ] SellerOrdersPage — same care as above

## 7. Motion & interaction polish
- [ ] Page transitions (framer-motion)
- [ ] Hover/press states on interactive elements
- [ ] Loading/skeleton states
- [ ] Reduce layout thrash / verify no motion applied before layout is stable

## 8. Validation
- [ ] Re-screenshot all pages at same breakpoints, diff against baseline
- [ ] Manually walk order flow end-to-end on MyOrdersPage + SellerOrdersPage, confirm status mapping still correct
- [ ] Manually walk auth flow (login/signup/OTP/handoff), confirm no redirect/state regressions
- [ ] Confirm no CSS class collisions introduced across pages (monolithic `index.css`/`App.css` risk)

---

**Notes**
- No test suite confirmed in `frontend/` — validation is manual/visual per above.
- Existing theme mechanism (`utils/theme.js`, `hooks/useTheme.js`) stays; extend tokens, don't replace the mechanism.
- Order-status logic lives in `store/useOrderStore.js` — treat as source of truth for any status-driven UI.
