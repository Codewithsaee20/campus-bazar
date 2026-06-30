# Campus Bazzar - Complete Technical Documentation

**Version:** 1.0.0  
**Last Updated:** June 25, 2026  
**Project Lead:** Codewithsaee20 & Contributors

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Frontend Architecture](#frontend-architecture)
8. [Authentication Flow](#authentication-flow)
9. [Key Features](#key-features)
10. [Installation & Setup](#installation--setup)
11. [Deployment](#deployment)
12. [Development Guidelines](#development-guidelines)
13. [Security Considerations](#security-considerations)

---

## Project Overview

**Campus Bazzar** is a peer-to-peer marketplace platform designed specifically for college students. It enables users to buy and sell second-hand books, study materials, and other campus-related items within their college community.

### Core Problem Solved
- Provides a centralized platform for campus item resale
- Creates a trusted marketplace within college networks
- Implements fair pricing algorithms based on market conditions
- Facilitates secure transactions with OTP-based handoff verification

### Target Users
- College students seeking to buy/sell textbooks
- Students looking for campus-specific items
- College administrations for platform management

### Key Business Metrics
- College-scoped marketplace isolation
- Dynamic pricing based on item condition and demand
- Multi-tier user ratings and reputation system
- Secure payment and handoff mechanisms

---

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React + Vite)                │
│  ┌─────────────────┬──────────────────┬────────────────┐    │
│  │  Landing Page   │  Marketplace UI  │  Seller Portal │    │
│  │  Auth Flows     │  Shopping Cart   │  Order Mgmt    │    │
│  └─────────────────┴──────────────────┴────────────────┘    │
│                         ↓ (HTTP/REST)                        │
├─────────────────────────────────────────────────────────────┤
│               Backend (Node.js + Express)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Auth Service │  │Order Service │  │Listing Svc   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │Rating Svc    │  │Interest Svc  │  │Report Svc    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                         ↓ (Driver)                           │
├─────────────────────────────────────────────────────────────┤
│              Database (MongoDB)                              │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐  │
│  │ Users        │ Listings     │ Orders       │ Books    │  │
│  │ Categories   │ Ratings      │ Interests    │ Reports  │  │
│  │ OTP Store    │              │              │          │  │
│  └──────────────┴──────────────┴──────────────┴──────────┘  │
│                                                              │
│    ┌─────────────────────────────────────────┐              │
│    │ File Storage (Cloudinary CDN)           │              │
│    │ Email Service (Nodemailer)              │              │
│    └─────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Patterns

#### 1. **Layered Architecture**
- **Controller Layer**: HTTP request handling & validation
- **Service Layer**: Business logic & data transformations
- **Model Layer**: Database schemas & validations
- **Middleware Layer**: Authentication, file uploads, error handling

#### 2. **State Management (Frontend)**
- **Zustand Stores**: Lightweight client-side state
  - `useAuthStore`: User authentication & profile
  - `useCartStore`: Shopping cart management
  - `useOrderStore`: Order history & status tracking

#### 3. **Authentication & Authorization**
- JWT-based token authentication
- OTP verification for registration & order handoff
- Role-based access control (User/Admin)
- Refresh token mechanism for session persistence

#### 4. **Data Flow Patterns**

**Listing Creation Flow:**
```
Form Input → Validation → Image Upload (Cloudinary)
→ Price Calculation → DB Insert → Response
```

**Order Transaction Flow:**
```
Add to Cart → Checkout → Order Creation (PENDING)
→ Seller Accept → OTP Generation → Handoff Verification (COMPLETED)
```

---

## Technology Stack

### Backend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Framework** | Express.js | 5.2.1 | Web application framework |
| **Database** | MongoDB | 9.2.4 (Mongoose) | NoSQL document database |
| **Authentication** | JWT | 9.0.3 | Token-based auth |
| **Security** | bcryptjs | 3.0.3 | Password hashing |
| **File Upload** | Multer | 2.1.1 | File parsing middleware |
| **File Storage** | Cloudinary | 2.9.0 | Cloud CDN for images |
| **Email** | Nodemailer | 8.0.5 | Email service |
| **Dev Tool** | Nodemon | 3.1.14 | Auto-reload server |
| **Environment** | Dotenv | 17.3.1 | Configuration management |
| **CORS** | cors | 2.8.6 | Cross-origin requests |

### Frontend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19.2.4 | UI library |
| **Build Tool** | Vite | 8.0.1 | Fast bundler |
| **Router** | React Router | 7.14.1 | Client-side routing |
| **State Mgmt** | Zustand | 5.0.12 | State management |
| **HTTP Client** | Axios | 1.15.0 | API communication |
| **Animation** | Framer Motion | 12.38.0 | Animation library |
| **3D Graphics** | Three.js | 0.183.2 | 3D rendering |
| **3D React** | @react-three/fiber | 9.5.0 | React Three.js |
| **Icons** | lucide-react | 0.577.0 | Icon library |
| **Intersection** | react-intersection-observer | 10.0.3 | Lazy loading |

### Infrastructure & Services
- **Deployment**: Environment-agnostic (AWS/Heroku/Docker ready)
- **File Storage**: Cloudinary CDN
- **Email Service**: SMTP-based (Nodemailer)
- **Database**: MongoDB Atlas (production) / Local MongoDB (development)

---

## Directory Structure

### Backend

```
campusBazzar-backend/
├── src/
│   ├── config/
│   │   └── dbconnection.js          # MongoDB connection setup
│   │
│   ├── models/                       # Mongoose schemas
│   │   ├── user.model.js            # User profile & auth
│   │   ├── listing.model.js         # Product listings
│   │   ├── order.model.js           # Purchase orders
│   │   ├── book.model.js            # Book metadata
│   │   ├── category.model.js        # Product categories
│   │   ├── rating.model.js          # User ratings
│   │   ├── interest.model.js        # Wishlist items
│   │   ├── report.model.js          # Abuse reports
│   │   └── otp.model.js             # OTP storage
│   │
│   ├── controllers/                 # Request handlers
│   │   ├── authController.js        # Auth endpoints
│   │   ├── listingController.js     # Listing operations
│   │   ├── orderController.js       # Order management
│   │   ├── categoryController.js    # Category operations
│   │   ├── ratingController.js      # Rating system
│   │   ├── interestController.js    # Wishlist management
│   │   ├── reportController.js      # Report handling
│   │   ├── bookController.js        # Book info
│   │   └── healthController.js      # Health checks
│   │
│   ├── services/                    # Business logic
│   │   ├── authService.js           # Auth operations
│   │   ├── listingService.js        # Listing operations
│   │   ├── orderService.js          # Order processing
│   │   ├── ratingService.js         # Rating calculations
│   │   ├── interestService.js       # Wishlist logic
│   │   ├── reportService.js         # Report processing
│   │   ├── categoryService.js       # Category management
│   │   ├── bookService.js           # Book data handling
│   │   └── authMemoryStore.js       # In-memory OTP store
│   │
│   ├── routes/                      # API route definitions
│   │   ├── authRoute.js             # /api/v1/auth
│   │   ├── listingRoute.js          # /api/v1/listings
│   │   ├── orderRoute.js            # /api/v1/orders
│   │   ├── categoryRoute.js         # /api/v1/categories
│   │   ├── ratingRoute.js           # /api/v1/ratings
│   │   ├── interestRoute.js         # /api/v1/interest
│   │   ├── reportRoute.js           # /api/v1/reports
│   │   ├── bookRoute.js             # /api/v1/books
│   │   └── healthCheckRoute.js      # /api/v1/health
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   └── uploadMiddleware.js      # File upload handling
│   │
│   ├── utils/
│   │   ├── asyncHandler.js          # Async error wrapper
│   │   ├── ApiResponse.js           # Standardized responses
│   │   ├── ApiError.js              # Error formatting
│   │   ├── pricing.js               # Price calculation logic
│   │   ├── emailValidator.js        # Email validation
│   │   └── bookId.js                # Book ID generation
│   │
│   ├── .env                         # Environment variables (local)
│   └── app.js                       # Express app initialization
│
├── server.js                        # Entry point
├── package.json                     # Dependencies
└── .gitignore
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Top navigation
│   │   ├── Hero.jsx                 # Landing hero section
│   │   ├── Features.jsx             # Features showcase
│   │   ├── Stats.jsx                # Statistics display
│   │   ├── CTA.jsx                  # Call-to-action
│   │   ├── FeaturedCarousel.jsx     # Product carousel
│   │   ├── ThreeScene.jsx           # 3D scene (Three.js)
│   │   ├── BookHeroAnimation.jsx    # Book animation
│   │   ├── ParticleField.jsx        # Particle effects
│   │   └── RouteGuards.jsx          # Auth route guards
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx          # "/" - Public landing
│   │   ├── AuthPhonePage.jsx        # Phone-based auth
│   │   ├── SignUpPage.jsx           # User registration
│   │   ├── OtpVerificationPage.jsx  # OTP entry
│   │   ├── OtpHandoffPage.jsx       # Order delivery OTP
│   │   │
│   │   ├── FeedPage.jsx             # Marketplace feed
│   │   ├── ListingDetailPage.jsx    # Single listing view
│   │   ├── ListingFormPage.jsx      # Create/edit listing
│   │   ├── MyListingsPage.jsx       # Seller's listings
│   │   │
│   │   ├── CartPage.jsx             # Shopping cart
│   │   ├── MarketplacePage.jsx      # Marketplace hub
│   │   ├── MarketplaceBookDetailPage.jsx  # Book detail
│   │   │
│   │   ├── CategoriesPage.jsx       # Browse categories
│   │   ├── BookDetailPage.jsx       # Book info
│   │   │
│   │   ├── MyOrdersPage.jsx         # Buyer's orders
│   │   ├── SellerOrdersPage.jsx     # Seller's orders
│   │   │
│   │   ├── ProfilePage.jsx          # User profile
│   │   ├── InterestsPage.jsx        # Wishlist/interests
│   │   └── SellPage.jsx             # Quick sell page
│   │
│   ├── store/                       # Zustand state stores
│   │   ├── useAuthStore.js          # Authentication state
│   │   ├── useCartStore.js          # Cart management
│   │   └── useOrderStore.js         # Order management
│   │
│   ├── utils/
│   │   ├── campusApi.js             # API client setup
│   │   └── ...other utilities
│   │
│   ├── App.jsx                      # Root component
│   ├── main.jsx                     # Entry point
│   └── index.css
│
├── public/
│   └── assets/                      # Static assets
│
├── package.json
├── vite.config.js
└── .gitignore
```

---

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String (required, indexed),
  email: String (required, unique, indexed),
  college: String (required),
  phone: String (required, validated: 10-15 digits),
  department: String (required),
  branch: String (required),
  profilePic: String (URL),
  role: String (enum: ["user", "admin"], default: "user"),
  isVerified: Boolean (default: false),
  rating: Number (average rating, default: 0),
  totalRatings: Number (count of ratings, default: 0),
  refreshToken: String (JWT token),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: For fast email lookups
- `college`: For college-scoped queries

### Listings Collection

```javascript
{
  _id: ObjectId,
  sellerId: ObjectId (ref: User, required),
  title: String (required, max 100 chars),
  bookId: String (required, trimmed),
  isbn: String (optional),
  description: String (required, max 1000 chars),
  categoryId: ObjectId (ref: Category, required),
  
  // Pricing
  mrp: Number (original price, required, min: 0),
  price: Number (resale price, server-calculated),
  suggestedPrice: Number (AI-suggested price),
  
  // Listing Details
  condition: String (enum: ["New", "Like New", "Good", "Worn"]),
  department: String,
  semester: String,
  subject: String,
   
  // Images (max 5)
  images: [
    {
      url: String (Cloudinary URL),
      public_id: String (Cloudinary ID)
    }
  ],
  
  // Status
  status: String (enum: ["Active", "Sold"], default: "Active"),
  college: String (inherited from seller),
  viewCount: Number (default: 0),
  
  // Flags
  flaggedForReview: Boolean (default: false),
  mrpLocked: Boolean (default: false),
  sourceOrderId: ObjectId (ref: Order, optional),
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Full-text search: `title`, `description`
- `categoryId`, `college`, `status`, `sellerId`, `price`, `bookId`

### Orders Collection

```javascript
{
  _id: ObjectId,
  buyerId: ObjectId (ref: User, required),
  sellerId: ObjectId (ref: User, required),
  listingId: ObjectId (ref: Listing, required),
  bookId: String (optional, indexed),
  
  // Listing Snapshot at purchase time
  listingSnapshot: {
    title: String,
    mrp: Number,
    price: Number
  },
  
  college: String (from buyer's profile),
  
  // Order Lifecycle
  status: String (enum: ["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"]),
  
  // OTP Handoff System
  otp: String (generated by seller at meetup),
  otpExpiresAt: Date,
  
  // Payment
  payoutReleased: Boolean (default: false),
  payoutId: String (optional),
  
  cancellationReason: String (optional),
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `buyerId`, `sellerId`
- Compound: `college`, `status`
- Partial unique: `(listingId, status)` for PENDING/ACCEPTED orders

### Ratings Collection

```javascript
{
  _id: ObjectId,
  raterId: ObjectId (ref: User, required),
  ratedUserId: ObjectId (ref: User, required),
  orderId: ObjectId (ref: Order, required),
  
  rating: Number (1-5 scale),
  comment: String (review text),
  
  createdAt: Date,
  updatedAt: Date
}
```

### Books Collection

```javascript
{
  _id: ObjectId,
  bookId: String (required, unique, indexed),
  isbn: String (optional),
  title: String (required),
  subject: String (required),
  department: String (required),
  college: String (required),
  originalMrp: Number (required, min: 0),
  
  // Market Stats
  totalResales: Number (default: 0),
  mrpLocked: Boolean (default: false),
  
  createdAt: Date,
  updatedAt: Date
}
```

### Interests Collection (Wishlist)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  listingId: ObjectId (ref: Listing, required),
  
  createdAt: Date,
  updatedAt: Date
}
```

### Reports Collection

```javascript
{
  _id: ObjectId,
  reportedBy: ObjectId (ref: User, required),
  reportedUser: ObjectId (ref: User, required),
  listingId: ObjectId (ref: Listing, optional),
  
  reason: String (enum: ["Fraud", "Offensive", "Spam", "Other"]),
  description: String,
  status: String (enum: ["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"]),
  
  createdAt: Date,
  updatedAt: Date
}
```

### OTP Collection

```javascript
{
  _id: ObjectId,
  email: String (required, indexed),
  otp: String (6-digit code),
  expiresAt: Date (TTL: 5 minutes),
  
  createdAt: Date (TTL index: 300 seconds)
}
```

---

## API Documentation

### Base URL
```
Production: https://api.campusbazzar.com/api/v1
Development: http://localhost:3000/api/v1
```

### Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <accessToken>
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Detailed error message"
  }
}
```

### Auth Endpoints

#### POST `/auth/register`
Register new user with college email.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@college.edu",
  "phone": "+919876543210",
  "department": "Computer Science",
  "branch": "CSE-A"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "message": "OTP sent to your college email",
    "userId": "user_id"
  }
}
```

#### POST `/auth/send-otp`
Send OTP to email for verification.

**Request:**
```json
{
  "email": "john@college.edu"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "message": "OTP sent to your college email"
  }
}
```

#### POST `/auth/verify-otp`
Verify OTP and complete registration.

**Request:**
```json
{
  "email": "john@college.edu",
  "otp": "123456"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@college.edu",
      "college": "IIT Bombay"
    }
  }
}
```

#### POST `/auth/refresh`
Refresh access token using refresh token.

**Request:** (Refresh token in HTTP-only cookie)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

#### GET `/auth/me` (Protected)
Get current user profile.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@college.edu",
      "college": "IIT Bombay",
      "phone": "+919876543210",
      "department": "Computer Science",
      "branch": "CSE-A",
      "rating": 4.5,
      "totalRatings": 12
    }
  }
}
```

#### POST `/auth/logout` (Protected)
Logout user and invalidate refresh token.

**Response:** 200 OK

### Listings Endpoints

#### GET `/listings`
Get all listings with filtering & pagination.

**Query Parameters:**
```
?college=IIT%20Bombay     # College filter
&status=Active            # Status filter
&condition=Good          # Condition filter
&minPrice=100            # Min price
&maxPrice=5000           # Max price
&category=books          # Category ID
&search=physics          # Full-text search
&sort=-createdAt         # Sort field
&page=1                  # Page number
&limit=20                # Results per page
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "listings": [...],
    "total": 145,
    "page": 1,
    "pages": 8
  }
}
```

#### POST `/listings` (Protected)
Create new listing.

**Request:** (FormData with file uploads)
```javascript
{
  "title": "Physics Textbook",
  "description": "Used for 2 semesters, condition is good",
  "categoryId": "cat_123",
  "mrp": 2000,
  "condition": "Good",
  "department": "Physics",
  "semester": "4",
  "subject": "Classical Mechanics",
  "images": [File, File, ...]  // Max 5 images
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "listing": {
      "_id": "listing_123",
      "title": "Physics Textbook",
      "price": 1200,
      "suggestedPrice": 1100,
      "condition": "Good"
    }
  }
}
```

#### GET `/listings/:id`
Get single listing details.

**Response:** 200 OK

#### PATCH `/listings/:id` (Protected)
Update listing (seller only).

**Request:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "price": 1500
}
```

#### DELETE `/listings/:id` (Protected)
Delete listing (seller only).

**Response:** 200 OK

### Orders Endpoints

#### POST `/orders` (Protected)
Create new order (buy listing).

**Request:**
```json
{
  "listingId": "listing_123"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_123",
      "status": "PENDING",
      "listingSnapshot": {...}
    }
  }
}
```

#### GET `/orders/my` (Protected)
Get buyer's orders.

**Query Parameters:**
```
?status=PENDING           # Filter by status
&sort=-createdAt         # Sort
&page=1                  # Pagination
```

#### GET `/orders/selling` (Protected)
Get seller's orders.

#### PATCH `/orders/:id/accept` (Protected)
Seller accepts order.

**Response:** 200 OK

#### PATCH `/orders/:id/otp` (Protected)
Seller generates OTP for handoff.

**Request:**
```json
{
  "otp": "123456"
}
```

**Response:** 200 OK

#### PATCH `/orders/:id/verify-otp` (Protected)
Buyer verifies OTP and completes order.

**Request:**
```json
{
  "otp": "123456"
}
```

**Response:** 200 OK

#### PATCH `/orders/:id/cancel` (Protected)
Cancel order.

**Request:**
```json
{
  "reason": "Changed my mind"
}
```

### Ratings Endpoints

#### POST `/ratings` (Protected)
Submit rating for completed order.

**Request:**
```json
{
  "orderId": "order_123",
  "rating": 5,
  "comment": "Great seller, smooth transaction"
}
```

**Response:** 201 Created

#### GET `/ratings/user/:userId`
Get user's ratings.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "ratings": [...],
    "averageRating": 4.5,
    "totalRatings": 12
  }
}
```

### Interest/Wishlist Endpoints

#### POST `/interest` (Protected)
Add listing to wishlist.

**Request:**
```json
{
  "listingId": "listing_123"
}
```

#### DELETE `/interest/:listingId` (Protected)
Remove from wishlist.

#### GET `/interest` (Protected)
Get user's wishlist.

### Reports Endpoints

#### POST `/reports` (Protected)
Report user or listing.

**Request:**
```json
{
  "reportedUserId": "user_id",
  "listingId": "listing_123",
  "reason": "Fraud",
  "description": "Detailed description of issue"
}
```

### Categories Endpoints

#### GET `/categories`
Get all categories.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "cat_1",
        "name": "Textbooks",
        "description": "Academic textbooks"
      }
    ]
  }
}
```

### Books Endpoints

#### GET `/books/search`
Search for books.

**Query Parameters:**
```
?title=Physics&department=Science&college=IIT%20Bombay
```

#### POST `/books` (Admin only)
Create book entry.

### Health Check

#### GET `/health`
Health check endpoint.

**Response:** 200 OK
```json
{
  "status": "OK",
  "timestamp": "2026-06-25T10:30:00Z"
}
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── LandingPage
│   ├── Navbar
│   ├── Hero
│   ├── ThreeScene (3D)
│   ├── Features
│   ├── Stats
│   ├── FeaturedCarousel
│   └── CTA
│
├── AuthPhonePage
│   └── Phone/Email input form
│
├── OtpVerificationPage
│   └── OTP input form
│
├── FeedPage
│   ├── FilterBar
│   └── ListingCard (mapped)
│
├── ListingDetailPage
│   ├── ImageGallery
│   ├── ListingInfo
│   ├── SellerCard
│   └── ActionButtons
│
├── ListingFormPage (Create/Edit)
│   ├── ImageUpload
│   ├── Form fields
│   └── PriceSuggestion
│
├── CartPage
│   ├── CartItems
│   └── Checkout
│
├── MyOrdersPage
│   └── OrdersList
│
├── SellerOrdersPage
│   └── SellerOrdersList
│
└── ProfilePage
    ├── UserInfo
    ├── RatingStats
    └── ActivityHistory
```

### State Management (Zustand)

#### `useAuthStore`
```javascript
{
  token: String | null,
  user: User | null,
  isLoading: Boolean,
  authReady: Boolean,
  setAuth(user, token): void,
  logout(): void,
  setAuthReady(ready): void
}
```

#### `useCartStore`
```javascript
{
  items: CartItem[],
  addItem(listing): void,
  removeItem(listingId): void,
  clearCart(): void,
  getTotalPrice(): Number
}
```

#### `useOrderStore`
```javascript
{
  orders: Order[],
  setOrders(orders): void,
  updateOrder(id, data): void,
  getOrderById(id): Order
}
```

### Page Routes

| Path | Component | Auth | Purpose |
|------|-----------|------|---------|
| `/` | LandingPage | - | Public landing |
| `/auth/phone` | AuthPhonePage | Guest | Phone login |
| `/auth/verify-otp` | OtpVerificationPage | - | OTP verification |
| `/feed` | FeedPage | - | Browse listings |
| `/listings/:id` | ListingDetailPage | - | View listing |
| `/listings/new` | ListingFormPage | Protected | Create listing |
| `/listings/:id/edit` | ListingFormPage | Protected | Edit listing |
| `/my-listings` | MyListingsPage | Protected | Seller's listings |
| `/categories` | CategoriesPage | - | Browse categories |
| `/books/:id` | BookDetailPage | - | Book info |
| `/cart` | CartPage | Protected | Shopping cart |
| `/orders/my` | MyOrdersPage | Protected | Buyer orders |
| `/orders/selling` | SellerOrdersPage | Protected | Seller orders |
| `/orders/:id/handoff` | OtpHandoffPage | Protected | OTP verification |
| `/profile` | ProfilePage | Protected | User profile |
| `/interests` | InterestsPage | Protected | Wishlist |

### Key Frontend Features

1. **Responsive Design**: Mobile-first approach using CSS Grid/Flexbox
2. **Real-time Updates**: Cart & order updates via state management
3. **Image Upload**: Integration with Cloudinary CDN
4. **3D Animations**: Three.js for hero animations
5. **Search & Filter**: Real-time marketplace filtering
6. **Route Guards**: Protected and guest-only routes
7. **Error Boundaries**: Graceful error handling

---

## Authentication Flow

### User Registration Flow

```
User → Phone/Email Entry
    ↓
Send OTP Email → Store OTP (5 min TTL)
    ↓
User Verifies OTP
    ↓
Create User Record
    ↓
Issue JWT Tokens (Access + Refresh)
    ↓
Redirect to Marketplace
```

### Login Flow

```
User Email → Send OTP
    ↓
OTP Verification
    ↓
Validate against DB
    ↓
Issue JWT Tokens
    ↓
Persist in HttpOnly Cookies
    ↓
Redirect to Previous Page
```

### Token Management

**Access Token:**
- Validity: 15 minutes
- Payload: User ID, Email, Role
- Storage: In-memory (frontend)
- Usage: API request Authorization header

**Refresh Token:**
- Validity: 7 days
- Storage: HttpOnly Cookie (secure, same-site)
- Usage: Get new access token when expired
- Endpoint: `POST /auth/refresh`

### Session Persistence

```
App Mount
    ↓
Check if token in localStorage
    ↓
If yes, call /auth/refresh
    ↓
If refresh succeeds → Call /auth/me
    ↓
Update auth store with user data
    ↓
Mark authReady = true
```

### Protected Routes Logic

```javascript
<ProtectedRoute>
  ├─ Check auth store state
  ├─ If authReady = false → Show loader
  ├─ If not authenticated → Redirect to /auth/phone
  └─ If authenticated → Render component
</ProtectedRoute>
```

---

## Key Features

### 1. College-Scoped Marketplace

**Implementation:**
- User's college automatically attached from registration
- Listings filtered by buyer's college
- Cross-college selling disabled (ensures community trust)

**Business Logic:**
```javascript
// Listing creation
listing.college = req.user.college; // From JWT

// Listing queries
const listings = Listing.find({ college: userCollege });
```

### 2. Dynamic Pricing Algorithm

**Factors:**
- Original MRP (seller input)
- Item condition (New, Like New, Good, Worn)
- Market demand (totalResales)
- Time since listing creation

**Calculation:**
```javascript
const calculatePrice = (mrp, condition, totalResales) => {
  const conditionFactors = {
    'New': 0.95,
    'Like New': 0.80,
    'Good': 0.60,
    'Worn': 0.40
  };
  
  const demandFactor = Math.max(0.8, 1 - (totalResales * 0.02));
  return Math.round(mrp * conditionFactors[condition] * demandFactor);
};
```

### 3. Order Management & OTP Handoff

**States:**
- **PENDING**: Order placed, awaiting seller acceptance
- **ACCEPTED**: Seller accepted, awaiting handoff
- **COMPLETED**: OTP verified, order completed
- **CANCELLED**: Either party cancelled

**OTP Handoff Flow:**
```
Buyer Places Order (PENDING)
    ↓
Seller Accepts (ACCEPTED)
    ↓
Seller Generates OTP at Meetup Location
    ↓
Buyer Enters OTP to Verify Receipt
    ↓
Order Marked COMPLETED
    ↓
Release Payout to Seller
    ↓
Allow Both to Leave Ratings
```

### 4. Rating & Reputation System

**Features:**
- 1-5 star ratings with optional comments
- Only rate after order completion
- Rating affects seller visibility
- Prevents rating same user twice

**Implementation:**
```javascript
// Rating aggregation
const avgRating = await Rating.aggregate([
  { $match: { ratedUserId: userId } },
  { $group: {
      _id: null,
      average: { $avg: '$rating' },
      count: { $sum: 1 }
  }}
]);

// Update user
user.rating = avgRating[0].average;
user.totalRatings = avgRating[0].count;
```

### 5. Wishlist (Interests) Management

**Features:**
- Add/remove listings from wishlist
- Track price changes on wishlist items
- Bulk order from wishlist

**Database:**
```javascript
// Simple interest model
{
  userId: ObjectId,
  listingId: ObjectId,
  createdAt: Date
}
```

### 6. Report & Abuse Handling

**Report Types:**
- Fraud (misrepresentation)
- Offensive content
- Spam
- Other

**States:**
- OPEN: Initial state
- INVESTIGATING: Admin reviewing
- RESOLVED: Admin action taken
- CLOSED: Case closed

### 7. Image Management (Cloudinary)

**Features:**
- Upload to Cloudinary CDN
- Auto-resize & optimization
- Store public_id for deletion
- Max 5 images per listing

**Implementation:**
```javascript
// Upload
const result = await cloudinary.uploader.upload(file);

// Response
{
  url: result.secure_url,
  public_id: result.public_id
}

// Delete
await cloudinary.uploader.destroy(public_id);
```

### 8. Email Notifications

**Triggers:**
- OTP verification emails
- Order confirmation
- Seller notifications
- Payout notifications

**Using Nodemailer:**
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- Cloudinary account
- SMTP email service

### Backend Setup

1. **Clone & Navigate**
```bash
cd campusBazzar-backend
npm install
```

2. **Environment Configuration** (`.env`)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/campusbazzar

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=15m
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRE=7d

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
FRONTEND_ORIGIN=http://localhost:5173
```

3. **Start Server**
```bash
npm run dev      # Development with auto-reload
npm start        # Production
```

Server runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate & Install**
```bash
cd frontend
npm install
```

2. **Environment Configuration** (`.env.local`)
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=5000
```

3. **Start Dev Server**
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### Database Initialization

**Create indexes (recommended for production):**
```javascript
// Run in MongoDB shell
db.users.createIndex({ email: 1 }, { unique: true });
db.listings.createIndex({ title: "text", description: "text" });
db.listings.createIndex({ college: 1, status: 1 });
db.listings.createIndex({ categoryId: 1 });
db.orders.createIndex({ buyerId: 1 });
db.orders.createIndex({ sellerId: 1 });
db.orders.createIndex({ college: 1, status: 1 });
db.otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## Deployment

### Backend Deployment (Heroku/AWS)

**1. Prepare for Production**
```bash
# Set NODE_ENV
export NODE_ENV=production

# Use production MongoDB URI
export MONGODB_URI=mongodb+srv://...
```

**2. Heroku Deployment**
```bash
# Install Heroku CLI
heroku login
heroku create campus-bazzar-api
git push heroku main
```

**3. AWS EC2 Deployment**
```bash
# SSH into EC2
ssh -i key.pem ec2-user@instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash
sudo yum install -y nodejs

# Clone & setup
git clone repo-url
cd campusBazzar-backend
npm install
npm start &
```

### Frontend Deployment (Vercel/Netlify)

**1. Build for Production**
```bash
npm run build
```

**2. Vercel Deployment**
```bash
npm install -g vercel
vercel
```

**3. Netlify Deployment**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

**Build & Run:**
```bash
docker build -t campus-bazzar-api .
docker run -p 3000:3000 \
  -e MONGODB_URI=... \
  -e JWT_SECRET=... \
  campus-bazzar-api
```

---

## Development Guidelines

### Code Structure Best Practices

1. **Controllers**
   - Handle HTTP requests/responses
   - Validate input
   - Call services for business logic
   - Return standardized responses

2. **Services**
   - Contain business logic
   - Database operations
   - External API calls
   - Transactions

3. **Models**
   - Define schemas
   - Add validations
   - Create indexes
   - Add helper methods

4. **Middleware**
   - Authentication/Authorization
   - Request validation
   - Error handling
   - CORS & logging

### Git Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature
```

2. **Commit Messages**
```
feat: Add listing search functionality
fix: Fix OTP expiration bug
docs: Update API documentation
refactor: Improve pricing calculation
test: Add order tests
```

3. **Create Pull Request**
- Describe changes clearly
- Reference related issues
- Test locally before pushing

### Testing

**Run Tests:**
```bash
npm test
```

**Test Structure:**
```
tests/
├── unit/
│   ├── services/
│   ├── controllers/
│   └── utils/
└── integration/
    ├── auth.test.js
    ├── listings.test.js
    └── orders.test.js
```

### Naming Conventions

**Files:**
- Controllers: `camelCase.controller.js`
- Services: `camelCase.service.js`
- Models: `camelCase.model.js`
- Routes: `camelCase.route.js`

**Functions:**
- Async operations: `async function doSomething()`
- Boolean checks: `isActive()`, `hasPermission()`

**Variables:**
- Constants: `CONSTANT_NAME`
- Classes: `PascalCase`
- Instances: `camelCase`

---

## Security Considerations

### Authentication & Authorization

- **JWT Validation**: Verify token expiry & signature
- **HTTPS**: Enforce in production
- **HttpOnly Cookies**: Store refresh tokens securely
- **CORS**: Whitelist allowed origins
- **CSRF Protection**: Use SameSite cookies

### Data Protection

- **Password Hashing**: bcryptjs (rounds: 10+)
- **Email Validation**: Verify college email domain
- **Input Validation**: Sanitize all user inputs
- **SQL Injection**: Use Mongoose ORM (parameterized)
- **XSS Prevention**: Escape user-generated content

### API Security

- **Rate Limiting**: Implement per user/IP
- **Request Size**: Limit to 100MB for images
- **Timeout**: 30s per request
- **Error Messages**: Avoid leaking sensitive info
- **API Versioning**: Use `/api/v1/` prefix

### File Upload Security

- **Cloudinary**: Offload image storage (no server disk)
- **File Type**: Validate MIME types
- **Virus Scan**: Enable Cloudinary malware detection
- **Size Limits**: 5MB per image, max 5 per listing

### Environment Security

- **Secrets**: Store in `.env` files (never commit)
- **No Hardcoding**: All config via environment
- **Key Rotation**: Regularly rotate secrets
- **Access Control**: Restrict admin endpoints

### Database Security

- **Connection**: Use MongoDB Atlas with IP whitelisting
- **Authentication**: Strong passwords
- **Backups**: Regular automated backups
- **Encryption**: Enable MongoDB encryption at rest

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
```
Solution: Check CORS_ORIGIN in .env matches frontend URL
```

**2. OTP Not Received**
```
Solution: Verify SMTP credentials in .env
Check email spam folder
Ensure email service allows SMTP
```

**3. Image Upload Fails**
```
Solution: Verify Cloudinary API credentials
Check image file size < 5MB
Ensure proper MIME type
```

**4. MongoDB Connection**
```
Solution: Verify MONGODB_URI in .env
Check IP whitelist in MongoDB Atlas
Ensure network connectivity
```

**5. Token Expired**
```
Solution: Frontend should call /auth/refresh
Implement retry logic for failed requests
```

---

## Future Enhancements

1. **Payment Gateway**: Integrate Razorpay/Stripe for cashless transactions
2. **Real-time Notifications**: WebSocket for order updates
3. **Recommendation Engine**: ML-based listing recommendations
4. **Admin Dashboard**: Analytics & moderation tools
5. **Mobile App**: Native iOS/Android applications
6. **Messaging System**: In-app buyer-seller chat
7. **Delivery Integration**: Partner with local delivery services
8. **Analytics**: Detailed seller insights & trends

---

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following guidelines
4. Submit pull request
5. Await review & approval

---

## License & Support

- **License**: ISC
- **Support**: Reach out to development team
- **Issues**: Report via GitHub issues tracker

---

**Last Updated:** June 25, 2026  
**Documentation Version:** 1.0.0  
**Maintained By:** Development Team

For additional information, contact: codewithsaee20@github.com
