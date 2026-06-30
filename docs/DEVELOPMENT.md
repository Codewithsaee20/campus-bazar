# Development Guide

## Prerequisites

- Node.js 16+ and npm
- Git
- Environment variables configured (see `.env` files)

## Backend Setup

```bash
cd backend
npm install
npm start
```

**Environment:** `backend/.env`
- Database connection
- API keys and secrets
- Port configuration (default: 5000)

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Environment:** `frontend/.env.example` → `frontend/.env`
- API base URL
- Feature flags
- Analytics keys

## Local Development Workflow

1. **Branch from `main`**: `git checkout -b feature/your-feature`
2. **Make changes**: Follow [CLAUDE.md](../.claude/CLAUDE.md) principles
3. **Test locally**: Run unit tests and manual testing
4. **Commit**: Use clear, focused commit messages
5. **Push and PR**: Reference related tickets in PR description

## Running Tests

### Backend
```bash
cd backend
npm test                          # Run all tests
npm run test:unit                 # Unit tests only
npm run test:integration          # Integration tests only
npm run test:coverage             # With coverage report
npm run test:watch                # Watch mode
```

### Frontend
```bash
cd frontend
npm run test                      # Run all tests
npm run test:watch                # Watch mode
npm run test:coverage             # With coverage report
npm run test:e2e                  # End-to-end tests
```

## Code Quality

- Linting: `npm run lint` (both frontend and backend)
- Formatting: Follow `.prettierrc` configuration
- Type checking: TypeScript or JSDoc comments where applicable

## Debugging

- **Backend**: Enable debug logging with `DEBUG=*`
- **Frontend**: Use browser DevTools and Vue/React DevTools extension
- **Database**: Use connection string with admin user for inspection

## Common Issues

### Port Already in Use
Kill the process: `lsof -i :5000` (backend) or `lsof -i :5173` (frontend)

### Module Not Found
Run `npm install` and clear cache: `npm cache clean --force`

### Database Connection Failed
Verify `.env` has correct connection string and database is running

## Getting Help

- Check existing tickets in `tickets/` for similar issues
- Review documentation in `docs/`
- Run the appropriate debugging commands for your component
