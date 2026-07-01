// ╔══════════════════════════════════════════════════════════════╗
// ║           CampusBazaar — API Test Suite                      ║
// ║           Run with: node test.js                             ║
// ║           Requires: Node 18+ (built-in fetch)                ║
// ╚══════════════════════════════════════════════════════════════╝

// ─── CONFIG — change these to match your setup ──────────────────
const BASE_URL = "http://localhost:3000/api/v1";

// Two test users — must be different college email domains
// if your college check is domain-based
const USER_A = {
  name: "Test Seller",
  email: "seller@test.edu",       // ← change to a valid college email
  password: "Test@1234",
  year: 2,
  phone: "9876543210",
};

const USER_B = {
  name: "Test Buyer",
  email: "buyer@test.edu",        // ← change to a valid college email
  password: "Test@1234",
  year: 3,
  phone: "9876543211",
};
// ────────────────────────────────────────────────────────────────

// ─── STATE — shared across tests ────────────────────────────────
// These get filled in as tests run and reused by later tests
const state = {
  sellerToken: null,
  buyerToken: null,
  listingId: null,
  categoryId: null,
  sellerOtp: null,       // OTP received during register
  buyerOtp: null,
};

// ─── HELPERS ────────────────────────────────────────────────────

// Colour codes for terminal output
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";

// Counters
let passed = 0;
let failed = 0;

// Print a section header
function section(title) {
  console.log(`\n${CYAN}${BOLD}━━━ ${title} ${"━".repeat(50 - title.length)}${RESET}`);
}

// Log test result
function log(label, success, detail = "") {
  if (success) {
    passed++;
    console.log(`  ${GREEN}✓${RESET} ${label}`);
  } else {
    failed++;
    console.log(`  ${RED}✗${RESET} ${label}`);
    if (detail) console.log(`    ${RED}→ ${detail}${RESET}`);
  }
}

// Make an HTTP request and return { status, body }
async function request(method, path, { body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      // include cookies for refresh token
      credentials: "include",
    });

    const text = await res.text();

    // Safely parse JSON — some error responses might not be JSON
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    return { status: res.status, body: json };
  } catch (err) {
    // Network error — server probably not running
    console.log(`\n${RED}${BOLD}  ✗ Could not connect to ${BASE_URL}${RESET}`);
    console.log(`  ${RED}→ Is your server running? (npm run dev)${RESET}\n`);
    process.exit(1);
  }
}

// ─── TEST SUITES ─────────────────────────────────────────────────

// ── 1. Health Check ──────────────────────────────────────────────
async function testHealthCheck() {
  section("HEALTH CHECK");

  const { status, body } = await request("GET", "/health");
  log(
    "GET /health → server is up",
    status === 200,
    status !== 200 ? `Expected 200, got ${status}` : ""
  );
}

// ── 2. Auth — Register ───────────────────────────────────────────
async function testRegister() {
  section("AUTH — REGISTER");

  // Register seller
  const { status: s1, body: b1 } = await request("POST", "/auth/register", {
    body: {
      name: USER_A.name,
      email: USER_A.email,
      password: USER_A.password,
      phone: USER_A.phone,
    },
  });
  log(
    `POST /auth/register → seller registered (${USER_A.email})`,
    s1 === 201,
    s1 !== 201 ? `${s1} — ${b1?.error?.message || b1?.raw}` : ""
  );

  // Register buyer
  const { status: s2, body: b2 } = await request("POST", "/auth/register", {
    body: {
      name: USER_B.name,
      email: USER_B.email,
      password: USER_B.password,
      phone: USER_B.phone,
    },
  });
  log(
    `POST /auth/register → buyer registered (${USER_B.email})`,
    s2 === 201,
    s2 !== 201 ? `${s2} — ${b2?.error?.message || b2?.raw}` : ""
  );

  // Duplicate registration should fail
  const { status: s3 } = await request("POST", "/auth/register", {
    body: {
      name: USER_A.name,
      email: USER_A.email,
      password: USER_A.password,
      phone: USER_A.phone,
    },
  });
  log(
    "POST /auth/register → duplicate email rejected (409)",
    s3 === 409,
    s3 !== 409 ? `Expected 409, got ${s3}` : ""
  );

  // Missing fields should fail
  const { status: s4 } = await request("POST", "/auth/register", {
    body: { email: "incomplete@test.edu" },
  });
  log(
    "POST /auth/register → missing fields rejected (400)",
    s4 === 400,
    s4 !== 400 ? `Expected 400, got ${s4}` : ""
  );

  // ── MANUAL STEP ──────────────────────────────────────────────
  // OTPs are sent to email — you need to paste them here.
  // After running the script once, check your email/console logs
  // for the OTPs, then fill them in below and run again.
  // If your dev setup logs OTPs to the console, copy from there.

  console.log(`\n  ${YELLOW}⚠  OTP STEP — check your server logs or email inbox${RESET}`);
  console.log(`  ${YELLOW}   Fill in SELLER_OTP and BUYER_OTP at the top of this file${RESET}`);
  console.log(`  ${YELLOW}   then re-run: node test.js${RESET}\n`);

  // ← Paste your OTPs here after first run
  state.sellerOtp = process.env.SELLER_OTP || "000000";
  state.buyerOtp  = process.env.BUYER_OTP  || "000000";
}

// ── 3. Auth — Verify OTP ─────────────────────────────────────────
async function testVerifyOtp() {
  section("AUTH — VERIFY OTP");

  // Verify seller OTP
  const { status: s1, body: b1 } = await request("POST", "/auth/verify-otp", {
    body: { email: USER_A.email, otp: state.sellerOtp },
  });
  log(
    "POST /auth/verify-otp → seller account verified",
    s1 === 200,
    s1 !== 200 ? `${s1} — ${b1?.error?.message || "(wrong OTP?)"} ` : ""
  );

  // Verify buyer OTP
  const { status: s2, body: b2 } = await request("POST", "/auth/verify-otp", {
    body: { email: USER_B.email, otp: state.buyerOtp },
  });
  log(
    "POST /auth/verify-otp → buyer account verified",
    s2 === 200,
    s2 !== 200 ? `${s2} — ${b2?.error?.message || "(wrong OTP?)"}` : ""
  );

  // Wrong OTP should fail
  const { status: s3 } = await request("POST", "/auth/verify-otp", {
    body: { email: USER_A.email, otp: "000000" },
  });
  log(
    "POST /auth/verify-otp → wrong OTP rejected (400)",
    s3 === 400,
    s3 !== 400 ? `Expected 400, got ${s3}` : ""
  );
}

// ── 4. Auth — Login ──────────────────────────────────────────────
async function testLogin() {
  section("AUTH — LOGIN");

  // Seller login
  const { status: s1, body: b1 } = await request("POST", "/auth/login", {
    body: { email: USER_A.email, password: USER_A.password },
  });
  log(
    "POST /auth/login → seller logged in",
    s1 === 200 && b1?.data?.accessToken,
    s1 !== 200 ? `${s1} — ${b1?.error?.message}` : ""
  );
  if (b1?.data?.accessToken) {
    state.sellerToken = b1.data.accessToken;
  }

  // Buyer login
  const { status: s2, body: b2 } = await request("POST", "/auth/login", {
    body: { email: USER_B.email, password: USER_B.password },
  });
  log(
    "POST /auth/login → buyer logged in",
    s2 === 200 && b2?.data?.accessToken,
    s2 !== 200 ? `${s2} — ${b2?.error?.message}` : ""
  );
  if (b2?.data?.accessToken) {
    state.buyerToken = b2.data.accessToken;
  }

  // Wrong password
  const { status: s3 } = await request("POST", "/auth/login", {
    body: { email: USER_A.email, password: "wrongpassword" },
  });
  log(
    "POST /auth/login → wrong password rejected (401)",
    s3 === 401,
    s3 !== 401 ? `Expected 401, got ${s3}` : ""
  );

  // Non-existent user
  const { status: s4 } = await request("POST", "/auth/login", {
    body: { email: "ghost@test.edu", password: "Test@1234" },
  });
  log(
    "POST /auth/login → unknown email rejected (404)",
    s4 === 404,
    s4 !== 404 ? `Expected 404, got ${s4}` : ""
  );
}

// ── 5. Auth — Profile ────────────────────────────────────────────
async function testProfile() {
  section("AUTH — PROFILE");

  // Valid token
  const { status: s1, body: b1 } = await request("GET", "/auth/profile", {
    token: state.sellerToken,
  });
  log(
    "GET /auth/profile → returns seller profile",
    s1 === 200 && b1?.data?.email === USER_A.email,
    s1 !== 200 ? `${s1} — ${b1?.error?.message}` : ""
  );

  // No token
  const { status: s2 } = await request("GET", "/auth/profile");
  log(
    "GET /auth/profile → no token rejected (401)",
    s2 === 401,
    s2 !== 401 ? `Expected 401, got ${s2}` : ""
  );

  // Fake token
  const { status: s3 } = await request("GET", "/auth/profile", {
    token: "fake.token.here",
  });
  log(
    "GET /auth/profile → invalid token rejected (401)",
    s3 === 401,
    s3 !== 401 ? `Expected 401, got ${s3}` : ""
  );

  // Password should never be exposed
  const hasPassword =
    b1?.data?.password ||
    b1?.data?.passwordHash;
  log(
    "GET /auth/profile → passwordHash not exposed in response",
    !hasPassword,
    hasPassword ? "passwordHash is visible in response — FIX THIS" : ""
  );
}

// ── 6. Categories ────────────────────────────────────────────────
async function testCategories() {
  section("CATEGORIES");

  // Public GET — no token needed
  const { status: s1, body: b1 } = await request("GET", "/categories");
  log(
    "GET /categories → public access works",
    s1 === 200,
    s1 !== 200 ? `${s1} — ${b1?.error?.message}` : ""
  );

  // Create category — needs ADMIN token
  // Since you probably don't have an admin user in tests,
  // this will return 403 which is the CORRECT behaviour
  const { status: s2, body: b2 } = await request("POST", "/categories", {
    token: state.sellerToken,   // seller is not admin → should be 403
    body: {
      name: "Textbooks",
      slug: "textbooks",
      icon: "📚",
      suggestedMaxPrice: 800,
    },
  });
  log(
    "POST /categories → non-admin rejected (403)",
    s2 === 403,
    s2 !== 403 ? `Expected 403, got ${s2}` : ""
  );

  // If you have an ADMIN token, paste it here to test admin creation
  // const ADMIN_TOKEN = "paste_admin_token_here";
  // const { status: s3, body: b3 } = await request("POST", "/categories", {
  //   token: ADMIN_TOKEN,
  //   body: { name: "Textbooks", slug: "textbooks", icon: "📚", suggestedMaxPrice: 800 },
  // });
  // log("POST /categories → admin can create category (201)", s3 === 201);
  // if (b3?.data?._id) state.categoryId = b3.data._id;

  // For listing tests we need a categoryId — use first from GET response
  if (b1?.data?.length > 0) {
    state.categoryId = b1.data[0]._id;
    console.log(`  ${YELLOW}ℹ  Using existing category: "${b1.data[0].name}" for listing tests${RESET}`);
  } else {
    console.log(`  ${YELLOW}⚠  No categories found — listing creation tests may fail${RESET}`);
    console.log(`  ${YELLOW}   Seed a category via MongoDB directly or use admin token above${RESET}`);
  }
}

// ── 7. Listings — Create ─────────────────────────────────────────
async function testCreateListing() {
  section("LISTINGS — CREATE");

  if (!state.categoryId) {
    console.log(`  ${YELLOW}⚠  Skipping — no categoryId available${RESET}`);
    return;
  }

  // Valid creation
  const { status: s1, body: b1 } = await request("POST", "/listings", {
    token: state.sellerToken,
    body: {
      title: "Engineering Mathematics — S.K. Shah",
      description: "2nd year EM textbook, barely used",
      categoryId: state.categoryId,
      mrp: 500,
      condition: "Like New",
    },
  });
  log(
    "POST /listings → listing created (201)",
    s1 === 201,
    s1 !== 201 ? `${s1} — ${b1?.error?.message}` : ""
  );

  if (b1?.data?._id) {
    state.listingId = b1.data._id;
  }

  // ── Critical: pricing must be server-calculated ──
  if (b1?.data) {
    const listing = b1.data;

    // buyerPrice should be mrp*0.6 + 10
    const expectedBuyerPrice = Math.round(500 * 0.60) + 10; // 310
    log(
      `POST /listings → buyerPrice correctly calculated (expected ₹${expectedBuyerPrice})`,
      listing.buyerPrice === expectedBuyerPrice,
      listing.buyerPrice !== expectedBuyerPrice
        ? `Got ₹${listing.buyerPrice}, expected ₹${expectedBuyerPrice}`
        : ""
    );

    // price (sellerPrice) must NOT be exposed publicly
    log(
      "POST /listings → price (sellerPrice) not exposed in public response",
      listing.price === undefined,
      listing.price !== undefined ? `price = ${listing.price} is visible — FIX THIS` : ""
    );

    // platformFee must NOT be exposed
    log(
      "POST /listings → platformFee not exposed in public response",
      listing.platformFee === undefined,
      listing.platformFee !== undefined
        ? `platformFee = ${listing.platformFee} is visible — FIX THIS`
        : ""
    );

    // college should be set from token, not body
    log(
      "POST /listings → college set from token (not body)",
      listing.college !== undefined,
      !listing.college ? "college field missing from listing" : ""
    );
  }

  // Unauthenticated request must fail
  const { status: s2 } = await request("POST", "/listings", {
    body: { title: "Ghost listing", mrp: 100 },
  });
  log(
    "POST /listings → unauthenticated rejected (401)",
    s2 === 401,
    s2 !== 401 ? `Expected 401, got ${s2}` : ""
  );

  // Client sending price directly — server must ignore it
  const { status: s3, body: b3 } = await request("POST", "/listings", {
    token: state.sellerToken,
    body: {
      title: "Sneaky Listing",
      description: "Trying to set my own price",
      categoryId: state.categoryId,
      mrp: 500,
      condition: "Good",
      price: 1,          // ← attacker tries to set price to ₹1
      buyerPrice: 2,     // ← attacker tries to set buyerPrice too
      platformFee: 0,    // ← attacker tries to zero out fee
    },
  });
  if (b3?.data) {
    log(
      "POST /listings → client-sent price ignored, server recalculates",
      b3.data.buyerPrice !== 2,
      b3.data.buyerPrice === 2 ? "buyerPrice was accepted from client — SECURITY BUG" : ""
    );
  }
}

// ── 8. Listings — Read ───────────────────────────────────────────
async function testReadListings() {
  section("LISTINGS — READ");

  // Get all listings (college scoped)
  const { status: s1, body: b1 } = await request("GET", "/listings", {
    token: state.sellerToken,
  });
  log(
    "GET /listings → returns listings for college",
    s1 === 200 && Array.isArray(b1?.data?.listings),
    s1 !== 200 ? `${s1} — ${b1?.error?.message}` : ""
  );

  // Pagination fields present
  log(
    "GET /listings → pagination metadata present",
    b1?.data?.totalPages !== undefined && b1?.data?.currentPage !== undefined,
    !b1?.data?.totalPages ? "pagination fields missing from response" : ""
  );

  // Get with filters
  const { status: s2 } = await request(
    "GET",
    "/listings?condition=Like New&sortBy=buyerPrice&sortOrder=asc&page=1&limit=5",
    { token: state.sellerToken }
  );
  log(
    "GET /listings?condition=&sortBy=&page= → filters accepted",
    s2 === 200,
    s2 !== 200 ? `Expected 200, got ${s2}` : ""
  );

  // Get by ID
  if (state.listingId) {
    const { status: s3, body: b3 } = await request(
      "GET",
      `/listings/${state.listingId}`,
      { token: state.sellerToken }
    );
    log(
      "GET /listings/:id → returns single listing",
      s3 === 200 && b3?.data?._id === state.listingId,
      s3 !== 200 ? `${s3} — ${b3?.error?.message}` : ""
    );

    // viewCount should have incremented
    log(
      "GET /listings/:id → viewCount incremented",
      b3?.data?.viewCount >= 1,
      !b3?.data?.viewCount ? "viewCount is 0 or missing" : ""
    );

    // price must not be in single listing response either
    log(
      "GET /listings/:id → price not exposed",
      b3?.data?.price === undefined,
      b3?.data?.price !== undefined ? `price = ${b3.data.price} is visible — FIX THIS` : ""
    );
  }

  // Get my listings
  const { status: s4, body: b4 } = await request("GET", "/listings/my", {
    token: state.sellerToken,
  });
  log(
    "GET /listings/my → returns seller's own listings",
    s4 === 200 && Array.isArray(b4?.data),
    s4 !== 200 ? `${s4} — ${b4?.error?.message}` : ""
  );

  // Invalid ID format
  const { status: s5 } = await request("GET", "/listings/notanid", {
    token: state.sellerToken,
  });
  log(
    "GET /listings/:id → invalid ID format rejected (400/404)",
    s5 === 400 || s5 === 404,
    s5 !== 400 && s5 !== 404 ? `Expected 400 or 404, got ${s5}` : ""
  );

  // Unauthenticated
  const { status: s6 } = await request("GET", "/listings");
  log(
    "GET /listings → unauthenticated rejected (401)",
    s6 === 401,
    s6 !== 401 ? `Expected 401, got ${s6}` : ""
  );
}

// ── 9. Listings — Update ─────────────────────────────────────────
async function testUpdateListing() {
  section("LISTINGS — UPDATE");

  if (!state.listingId) {
    console.log(`  ${YELLOW}⚠  Skipping — no listingId available${RESET}`);
    return;
  }

  // Valid update by owner
  const { status: s1, body: b1 } = await request(
    "PATCH",
    `/listings/${state.listingId}`,
    {
      token: state.sellerToken,
      body: { title: "Updated Title — EM Book", mrp: 600 },
    }
  );
  log(
    "PATCH /listings/:id → owner can update listing",
    s1 === 200,
    s1 !== 200 ? `${s1} — ${b1?.error?.message}` : ""
  );

  // When mrp changes, buyerPrice must be recalculated
  if (b1?.data) {
    const expectedBuyerPrice = Math.round(600 * 0.60) + 10; // 370
    log(
      `PATCH /listings/:id → buyerPrice recalculated after mrp change (expected ₹${expectedBuyerPrice})`,
      b1.data.buyerPrice === expectedBuyerPrice,
      b1.data.buyerPrice !== expectedBuyerPrice
        ? `Got ₹${b1.data.buyerPrice}, expected ₹${expectedBuyerPrice}`
        : ""
    );
  }

  // Non-owner (buyer) cannot update
  const { status: s2 } = await request(
    "PATCH",
    `/listings/${state.listingId}`,
    {
      token: state.buyerToken,
      body: { title: "Hijacked title" },
    }
  );
  log(
    "PATCH /listings/:id → non-owner rejected (403)",
    s2 === 403,
    s2 !== 403 ? `Expected 403, got ${s2}` : ""
  );

  // Trying to change college should be ignored
  const { status: s3, body: b3 } = await request(
    "PATCH",
    `/listings/${state.listingId}`,
    {
      token: state.sellerToken,
      body: { college: "hacker-college.edu" },
    }
  );
  log(
    "PATCH /listings/:id → college field cannot be changed",
    b3?.data?.college !== "hacker-college.edu",
    b3?.data?.college === "hacker-college.edu"
      ? "college was overwritten — SECURITY BUG"
      : ""
  );
}

// ── 10. Listings — Mark as Sold ──────────────────────────────────
async function testMarkAsSold() {
  section("LISTINGS — MARK AS SOLD");

  if (!state.listingId) {
    console.log(`  ${YELLOW}⚠  Skipping — no listingId available${RESET}`);
    return;
  }

  // Non-owner cannot mark as sold
  const { status: s1 } = await request(
    "PATCH",
    `/listings/${state.listingId}/sold`,
    { token: state.buyerToken }
  );
  log(
    "PATCH /listings/:id/sold → non-owner rejected (403)",
    s1 === 403,
    s1 !== 403 ? `Expected 403, got ${s1}` : ""
  );

  // Owner can mark as sold
  const { status: s2, body: b2 } = await request(
    "PATCH",
    `/listings/${state.listingId}/sold`,
    { token: state.sellerToken }
  );
  log(
    "PATCH /listings/:id/sold → owner can mark as sold",
    s2 === 200 && b2?.data?.status === "Sold",
    s2 !== 200 ? `${s2} — ${b2?.error?.message}` : ""
  );

  // Cannot mark an already-sold listing as sold again
  const { status: s3 } = await request(
    "PATCH",
    `/listings/${state.listingId}/sold`,
    { token: state.sellerToken }
  );
  log(
    "PATCH /listings/:id/sold → already-sold listing rejected (400)",
    s3 === 400,
    s3 !== 400 ? `Expected 400, got ${s3}` : ""
  );
}

// ── 11. Listings — Delete ────────────────────────────────────────
async function testDeleteListing() {
  section("LISTINGS — DELETE (soft)");

  // Create a fresh listing to delete
  // (we don't want to delete the one used in earlier tests)
  const { body: createBody } = await request("POST", "/listings", {
    token: state.sellerToken,
    body: {
      title: "Listing to be deleted",
      description: "Will be soft-deleted",
      categoryId: state.categoryId,
      mrp: 200,
      condition: "Worn",
    },
  });
  const deleteId = createBody?.data?._id;

  if (!deleteId) {
    console.log(`  ${YELLOW}⚠  Could not create listing for delete test${RESET}`);
    return;
  }

  // Non-owner cannot delete
  const { status: s1 } = await request("DELETE", `/listings/${deleteId}`, {
    token: state.buyerToken,
  });
  log(
    "DELETE /listings/:id → non-owner rejected (403)",
    s1 === 403,
    s1 !== 403 ? `Expected 403, got ${s1}` : ""
  );

  // Owner can delete
  const { status: s2 } = await request("DELETE", `/listings/${deleteId}`, {
    token: state.sellerToken,
  });
  log(
    "DELETE /listings/:id → owner can delete (200)",
    s2 === 200,
    s2 !== 200 ? `${s2}` : ""
  );

  // After deletion, listing should have status "Removed" not actually gone
  const { status: s3, body: b3 } = await request(
    "GET",
    `/listings/${deleteId}`,
    { token: state.sellerToken }
  );
  // Either 404 (not shown publicly) or 200 with status=Removed
  // Both are acceptable — depends on your implementation
  log(
    "DELETE /listings/:id → listing is soft-deleted (Removed or 404)",
    s3 === 404 || b3?.data?.status === "Removed",
    s3 !== 404 && b3?.data?.status !== "Removed"
      ? `Got ${s3} with status "${b3?.data?.status}" — expected 404 or Removed`
      : ""
  );
}

// ─── SUMMARY ─────────────────────────────────────────────────────
function printSummary() {
  const total = passed + failed;
  console.log(`\n${BOLD}${"═".repeat(55)}${RESET}`);
  console.log(`${BOLD}  RESULTS: ${GREEN}${passed} passed${RESET}${BOLD}, ${RED}${failed} failed${RESET}${BOLD}, ${total} total${RESET}`);
  console.log(`${BOLD}${"═".repeat(55)}${RESET}\n`);

  if (failed === 0) {
    console.log(`${GREEN}${BOLD}  All tests passed! 🎉${RESET}\n`);
  } else {
    console.log(`${RED}${BOLD}  ${failed} test(s) need attention above ↑${RESET}\n`);
  }
}

// ─── MAIN RUNNER ─────────────────────────────────────────────────
async function run() {
  console.log(`\n${BOLD}${CYAN}  CampusBazaar API Test Suite${RESET}`);
  console.log(`  Target: ${BASE_URL}\n`);

  await testHealthCheck();
  await testRegister();
  await testVerifyOtp();
  await testLogin();
  await testProfile();
  await testCategories();
  await testCreateListing();
  await testReadListings();
  await testUpdateListing();
  await testMarkAsSold();
  await testDeleteListing();

  printSummary();
}

run();