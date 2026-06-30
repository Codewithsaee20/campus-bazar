# API Documentation

## Base URL

- **Development**: `http://localhost:5000/api`
- **Staging**: `https://staging-api.campusbazzar.com/api`
- **Production**: `https://api.campusbazzar.com/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response (2xx)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed"
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "error": "Error code",
  "message": "Human-readable error message"
}
```

## Core Endpoints

### Authentication
- `POST /auth/register` — Register new user
- `POST /auth/login` — User login with OTP
- `POST /auth/verify-otp` — Verify OTP
- `POST /auth/refresh-token` — Refresh JWT token
- `POST /auth/logout` — Logout user

### Users
- `GET /users/profile` — Get current user profile
- `GET /users/:id` — Get user by ID
- `PUT /users/profile` — Update user profile
- `GET /users/:id/ratings` — Get user ratings

### Books/Listings
- `GET /books` — List all books (paginated, filterable)
- `GET /books/:id` — Get book details
- `POST /books` — Create new listing (authenticated)
- `PUT /books/:id` — Update listing
- `DELETE /books/:id` — Delete listing

### Orders
- `GET /orders` — List user orders
- `POST /orders` — Create new order
- `GET /orders/:id` — Get order details
- `PUT /orders/:id/status` — Update order status

### Categories
- `GET /categories` — List all categories
- `GET /categories/:id/books` — Books in category

### Ratings & Reviews
- `POST /ratings` — Submit rating/review
- `GET /books/:id/ratings` — Get ratings for book
- `GET /users/:id/ratings` — Get ratings by user

### Interests/Wishlist
- `GET /interests` — Get user's interests
- `POST /interests` — Add to wishlist
- `DELETE /interests/:id` — Remove from wishlist

### Reports
- `POST /reports` — Report listing or user
- `GET /reports` — List reports (admin only)

## Error Codes

- `400` — Bad Request (validation error)
- `401` — Unauthorized (missing/invalid token)
- `403` — Forbidden (insufficient permissions)
- `404` — Not Found (resource doesn't exist)
- `409` — Conflict (duplicate, state violation)
- `500` — Server Error (unexpected issue)

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authenticated requests: 1000/hour
- Unauthenticated requests: 100/hour

## Pagination

List endpoints support pagination:
```
GET /api/books?page=1&limit=20&sort=-createdAt
```

Query parameters:
- `page` — Page number (default: 1)
- `limit` — Results per page (default: 20, max: 100)
- `sort` — Sort field (prefix with `-` for descending)

## Filtering

List endpoints support filtering by field:
```
GET /api/books?category=textbooks&minPrice=10&maxPrice=50
```

Available filters documented in endpoint-specific sections.

## Integration Guide

1. Get API credentials from admin dashboard
2. Implement token refresh logic for long sessions
3. Handle rate limiting with exponential backoff
4. Log all API errors for debugging
5. Use consistent error handling across your application

See [DEVELOPMENT.md](./DEVELOPMENT.md) for local setup.
