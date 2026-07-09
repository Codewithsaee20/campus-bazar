# Campus Bazzar

A full-stack peer-to-peer marketplace for engineering students to buy and sell **Books**, **Notes**, and **Stationery** within their campus community.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Pricing Model](#pricing-model)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## 📚 Project Overview

Campus Bazzar is a campus-only resale marketplace scoped for engineering students. Sellers list **Books**, **Notes**, and **Stationery** (lab coats, drafters, geometry boxes, etc.); buyers browse the feed, express interest, place orders, and complete the handoff with OTP-based verification. Transactions are currently **Cash on Delivery** and no payment gateway is integrated yet.

**Key Objective:** Make it easy and low-friction for engineering students to recirculate useful study material within their own campus instead of buying new or letting it go to waste.

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js v5.2.1
- **Database:** MongoDB with Mongoose ODM v9.2.4
- **Authentication:** JWT (JSON Web Tokens) with httpOnly cookies and OTP login/verification
- **File Upload:** Cloudinary for image storage
- **Email Service:** Nodemailer v8.0.5
- **Security:** bcryptjs for password hashing, `express-rate-limit` for abuse protection, CORS allowlisting
- **Middleware:** CORS, Cookie Parser
- **Development:** Nodemon for hot-reload

### Frontend
- **Framework:** React v19.2.4 with Vite v8.0.1
- **State Management:** Zustand v5.0.12
- **HTTP Client:** Axios v1.15.0
- **Routing:** React Router DOM v7.14.1
- **Animations:** Framer Motion v12.38.0
- **3D Graphics:** Three.js v0.183.2 with React Three Fiber and Drei
- **UI Icons:** Lucide React v0.577.0
- **Build Tool:** Vite with ESLint

---

## 📁 Project Structure

```
Campus_Bazzar/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers for each resource
│   │   ├── routes/          # API route definitions
│   │   ├── models/          # MongoDB schema definitions
│   │   ├── middleware/      # Auth, upload, and rate-limiting middleware
│   │   ├── services/        # Business logic services
│   │   ├── config/          # Database connection and category seeding
│   │   ├── scripts/         # One-off data migration scripts
│   │   └── utils/           # Helper utilities and error handling
│   ├── server.js            # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route-level views (Landing, Auth, Feed, Sell, Orders, Profile, etc.)
│   │   ├── components/      # Shared UI components (Navbar, cards, carousels, route guards)
│   │   ├── data/            # Static/fallback data (categories, mock listings)
│   │   ├── store/           # Zustand auth/app state
│   │   └── utils/           # API client and helpers
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ✨ Features

- **User Authentication:** Registration and login with email OTP verification, refresh tokens, and httpOnly cookies
- **Listing Management:** Create, update, and delete listings with image uploads for Books, Notes, and Stationery
- **Marketplace Feed:** Browse active listings and drill into listing/book detail views
- **Order System:** Place and manage orders with accept, deliver, confirm-delivery, cancel, and OTP handoff flows
- **Interest System:** Express interest in a listing and manage buyer-seller negotiation
- **Category Management:** Books / Notes / Stationery taxonomy backed by a database-driven `Category` collection (admin-managed)
- **Book Database:** Search and reuse existing book metadata to avoid duplicate listings
- **Ratings & Reviews:** User rating system for sellers
- **Report System:** Users can report inappropriate listings for admin review
- **Profile Management:** View account details, listings, orders, cart, and seller activity from the frontend
- **Rate Limiting:** Per-route limits on auth, OTP, uploads, listing creation, and global API traffic
- **Health Checks:** System health monitoring endpoint

---

## 💰 Pricing Model

Sellers enter the MRP of the item; the platform suggests a resale price automatically:

- First-time listing: **80% of MRP**
- Each additional completed resale of the same book: an extra **5% deduction**, down to a **floor of 50% of MRP**

There is currently **no platform commission** — sellers receive the full listing price. This is a deliberate early-stage decision to prioritize adoption; a revenue model (commission, ads, or a payment-gateway convenience fee) is planned once the platform has meaningful transaction volume. See [Roadmap](#roadmap).

---

## 🔌 API Endpoints

### Authentication (`/api/v1/auth`)
- **POST `/register`** - Register a new user account and trigger OTP delivery
- **POST `/send-otp`** - Send OTP to email for verification
- **POST `/verify-otp`** - Verify OTP, set auth cookies, and complete login
- **POST `/logout`** - Logout user (requires authentication)
- **POST `/refresh`** - Refresh JWT access token
- **GET `/me`** - Get current user profile (requires authentication)
- **GET `/profile`** - Alias for the current user profile endpoint (requires authentication)

### Listings (`/api/v1/listings`)
- **POST `/`** - Create new listing (requires auth, supports image upload)
- **GET `/`** - Fetch all available listings
- **GET `/:id`** - Get specific listing details by ID
- **GET `/my/:id`** - Get user's specific listing (requires auth)
- **PUT `/:id`** - Update listing details (requires auth, supports image upload)
- **DELETE `/:id`** - Delete a listing (requires auth)

### Orders (`/api/v1/orders`)
- **POST `/`** - Create new order (requires auth)
- **GET `/:id`** - Get order details by ID (requires auth)
- **GET `/my/buying`** - Get all orders where user is buyer (requires auth)
- **GET `/my/selling`** - Get all orders where user is seller (requires auth)
- **PATCH `/:id/accept`** - Accept an order request (requires auth)
- **PATCH `/:id/deliver`** - Mark an order as delivered by the seller (requires auth)
- **PATCH `/:id/confirm-delivery`** - Confirm delivery completion (requires auth)
- **PATCH `/:id/cancel`** - Cancel an order (requires auth)
- **POST `/:id/otp/verify`** - Verify OTP for secure transaction completion (requires auth)

### Interests (`/api/v1/interest`)
- **POST `/`** - Express interest in a listing (requires auth)
- **GET `/my/buying`** - Get interests received from buyers (requires auth)
- **GET `/my/selling`** - Get interests sent to sellers (requires auth)
- **PATCH `/:id/accept`** - Accept buyer's interest offer (requires auth)
- **PATCH `/:id/reject`** - Reject buyer's interest offer (requires auth)

### Ratings (`/api/v1/ratings`)
- **POST `/`** - Create rating for a seller (requires auth)
- **GET `/users/:id`** - Get all ratings for a specific user (public)

### Reports (`/api/v1/reports`)
- **POST `/`** - Report a listing or user (requires auth)
- **GET `/`** - Get all reports (requires auth, admin only)

### Categories (`/api/v1/categories`)
- **GET `/`** - Get all categories — Books, Notes, Stationery (public)
- **POST `/`** - Create new category (requires auth, admin only)
- **PUT `/:id`** - Update category (requires auth, admin only)
- **DELETE `/:id`** - Delete category (requires auth, admin only)

### Books (`/api/v1/books`)
- **POST `/search`** - Search for books by title/author (requires auth)
- **POST `/find-or-create`** - Find existing book or create new entry (requires auth)
- **GET `/:bookId`** - Get book details by ID (public)

### Health Check (`/api/v1/health`)
- **GET `/`** - Check server health and status (public)

---

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas cloud instance)
- npm
- Cloudinary account (for image uploads)
- SMTP credentials (for email/OTP notifications)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the required variables (see [Environment Configuration](#environment-configuration))

4. Start the server:
```bash
npm run dev
```
Default categories (Books, Notes, Stationery) are seeded automatically on first connection to an empty database — no manual step required.

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the API base URL:
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## ⚙️ Environment Configuration

### Backend `.env` File

```env
# Server
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/campusbazzar
# OR for MongoDB Atlas:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/campusbazzar

# JWT Secrets
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Auth / campus access
ALLOWED_COLLEGE_DOMAINS=vcet.edu.in
ALLOW_IP_ACCEPTANCE=true

# Cloudinary (Image Upload)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
FRONTEND_ORIGIN=http://localhost:5173
```

---

## ▶️ Running the Application

### Development Mode

**Backend:**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:3000`

**Frontend:**
```bash
cd frontend
npm run dev
```
Application runs on `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

### Testing

**Backend:**
```bash
cd backend
npm test
```

**Frontend lint:**
```bash
cd frontend
npm run lint
```

---

## ☁️ Deployment

No CI/CD pipeline is configured yet — deploy manually until one is added.

**Backend** — deploy as a standard Node.js service (e.g. Render, Railway, Fly.io):
- Build: `npm install`
- Start: `npm start`
- Set all variables from [Environment Configuration](#environment-configuration) in the host's environment settings — `MONGO_URI` should point at a production MongoDB Atlas cluster, and `CORS_ORIGIN`/`FRONTEND_ORIGIN` must match the deployed frontend's URL.

**Frontend** — deploy as a static build (e.g. Vercel, Netlify):
- Build: `npm run build` (output in `frontend/dist`)
- Set `VITE_API_BASE_URL` to the deployed backend's `/api/v1` URL.

**Before going live:**
- Rotate `JWT_SECRET`/`JWT_REFRESH_SECRET` to strong production values (never reuse dev secrets)
- Confirm `MONGO_URI` targets the production database, not a local/dev instance
- Verify Cloudinary and SMTP credentials are production-scoped
- Since this is Cash on Delivery only, make sure the buyer-seller handoff/OTP flow is clearly communicated in the UI before real users transact

---

## 🗺 Roadmap

- **PYQs (Previous Year Question Papers):** planned as a future category, not live yet
- **Payment integration:** move off Cash-on-Delivery once there's real transaction volume
- **Revenue model:** introduce a commission or convenience fee (currently zero — sellers keep 100% of the listing price) once payments are integrated
- **Ads:** monetization via on-site advertising once the user base justifies it

---

## 📄 License

ISC License - See LICENSE file for details

---

**Last Updated:** July 2026
