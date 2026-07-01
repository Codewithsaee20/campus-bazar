# Campus Bazzar

A modern, full-stack online book reselling platform designed for campus communities to buy, sell, and exchange books efficiently.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)

---

## 📚 Project Overview

Campus Bazzar is a peer-to-peer book reselling platform tailored for students and campus communities. It provides a seamless marketplace where users can list books for sale, browse available listings, manage orders, and rate sellers. The platform facilitates secure transactions with OTP-based verification and comprehensive book tracking features.

**Key Objective:** Enable efficient book sharing and resale within campus ecosystems with user-friendly interfaces and secure payment workflows.

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js v5.2.1
- **Database:** MongoDB with Mongoose ODM v9.2.4
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Cloudinary for image storage
- **Email Service:** Nodemailer v8.0.5
- **Security:** bcryptjs for password hashing
- **Middleware:** CORS, Cookie Parser
- **Development:** Nodemon for hot-reload

### Frontend
- **Framework:** React v19.2.4 with Vite v8.0.1
- **State Management:** Zustand v5.0.12
- **HTTP Client:** Axios v1.15.0
- **Routing:** React Router DOM v7.14.1
- **Animations:** Framer Motion v12.38.0
- **3D Graphics:** Three.js v0.183.2 with React Three Fiber
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
│   │   ├── middleware/      # Authentication and upload middleware
│   │   ├── services/        # Business logic services
│   │   ├── config/          # Database connection and seeding
│   │   └── utils/           # Helper utilities and error handling
│   ├── server.js            # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ✨ Features

- **User Authentication:** Secure registration and login with OTP verification
- **Listing Management:** Create, update, and delete book listings with image uploads
- **Order System:** Place and manage book orders with OTP-based handoff verification
- **Ratings & Reviews:** User rating system for sellers
- **Interest System:** Express interest in books and track buyer-seller interactions
- **Category Management:** Organize books by categories (Admin only)
- **Book Database:** Search and manage books with metadata
- **Report System:** Users can report inappropriate listings (Admin monitoring)
- **Profile Management:** View and manage user profiles
- **Health Checks:** System health monitoring endpoints

---

## 🔌 API Endpoints

### Authentication (`/api/v1/auth`)
- **POST `/register`** - Register a new user account
- **POST `/send-otp`** - Send OTP to email for verification
- **POST `/verify-otp`** - Verify OTP and complete registration
- **POST `/logout`** - Logout user (requires authentication)
- **POST `/refresh`** - Refresh JWT token
- **GET `/me`** - Get current user profile (requires authentication)
- **GET `/profile`** - Get user profile details (requires authentication)

### Listings (`/api/v1/listings`)
- **POST `/`** - Create new book listing (requires auth, supports image upload)
- **GET `/`** - Fetch all available book listings
- **GET `/:id`** - Get specific listing details by ID
- **GET `/my/:id`** - Get user's specific listing (requires auth)
- **PUT `/:id`** - Update listing details (requires auth, supports image upload)
- **DELETE `/:id`** - Delete a listing (requires auth)

### Orders (`/api/v1/orders`)
- **POST `/`** - Create new order (requires auth)
- **GET `/:id`** - Get order details by ID (requires auth)
- **GET `/my/buying`** - Get all orders where user is buyer (requires auth)
- **GET `/my/selling`** - Get all orders where user is seller (requires auth)
- **PATCH `/:id/cancel`** - Cancel an order (requires auth)
- **POST `/:id/otp/generate`** - Generate OTP for order handoff verification (requires auth)
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
- **GET `/`** - Get all book categories (public)
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
- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud instance)
- npm or yarn package manager
- Cloudinary account (for image uploads)
- SMTP credentials (for email notifications)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory with required variables (see [Environment Configuration](#environment-configuration))

4. Seed initial categories:
```bash
node src/config/seedCategories.js
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with API base URL:
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

# IP Acceptance (OTP Verification)
ALLOW_IP_ACCEPTANCE=true
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

---

## 📝 Key Features Implementation

### Authentication Flow
- Users register with email
- OTP sent to email for verification
- JWT tokens issued for authenticated sessions
- Refresh tokens for extended sessions

### Order & Transaction Flow
- User creates order/listing
- Buyer and seller exchange via Interest system
- OTP generated for final handoff verification
- Order completed after successful verification

### Security Features
- Password hashing with bcryptjs
- JWT-based authentication
- OTP verification for sensitive transactions
- CORS protection
- Role-based authorization (admin roles)

### Image Management
- Cloudinary integration for reliable image storage
- Support for multiple images per listing
- Automatic image optimization and delivery

---

## 📬 Support & Contact

For issues, suggestions, or queries, please refer to the project documentation or contact the development team at `nagesh.ghadge@gmail.com`.

---

## 📄 License

ISC License - See LICENSE file for details

---

**Last Updated:** July 2026
