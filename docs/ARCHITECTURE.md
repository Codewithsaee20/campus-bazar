# System Architecture

## Overview

Campus Bazzar is a full-stack marketplace application built with:
- **Backend**: Node.js with Express
- **Frontend**: React (Vite)
- **Database**: MongoDB
- **Authentication**: JWT-based with OTP verification

## System Design

```
┌─────────────────────┐
│   Frontend (React)  │
│   - UI Components   │
│   - State Mgmt      │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌─────────────────────┐
│  Backend (Node.js)  │
│  - API Routes       │
│  - Controllers      │
│  - Business Logic   │
│  - Middleware       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  MongoDB Database   │
│  - Collections      │
│  - Indexes          │
└─────────────────────┘
```

## Backend Structure

### Core Modules
- **Controllers**: Handle HTTP requests, request validation
- **Models**: MongoDB schemas and data validation
- **Routes**: API endpoint definitions
- **Middleware**: Authentication, error handling, validation
- **Services**: Business logic, external integrations
- **Config**: Database and environment configuration

### Key Features
- Authentication & Authorization (JWT, OTP)
- Book/Listing Management
- User Profiles & Ratings
- Order Processing
- Interest/Wishlist System
- Reporting & Moderation

## Frontend Structure

- **Components**: Reusable UI building blocks
- **Pages**: Full-page views
- **Services**: API client, data fetching
- **State Management**: Context API or Zustand
- **Styles**: CSS/SCSS, responsive design

## Data Models

### Core Entities
- **Users**: Profiles, authentication, preferences
- **Books/Listings**: Product catalog with metadata
- **Orders**: Purchase transactions and history
- **Ratings**: User feedback and reviews
- **Categories**: Product classification
- **Interests**: Wishlist and saved items

## API Pattern

All endpoints follow REST conventions:
- `GET /api/resource` — List or fetch
- `POST /api/resource` — Create
- `PUT /api/resource/:id` — Update
- `DELETE /api/resource/:id` — Delete

## Authentication Flow

1. User registers or logs in
2. OTP sent to email/phone
3. OTP verified → JWT issued
4. JWT used for subsequent requests
5. Token refresh mechanism for extended sessions

## Deployment Architecture

- **Development**: Local machines
- **Staging**: Pre-production environment
- **Production**: Live user environment
- Each environment has separate database and configuration

See [DEPLOYMENT.md](./DEPLOYMENT.md) for environment specifics.
