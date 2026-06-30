# Testing Guide

## Test Strategy

### Unit Tests
- Test individual functions and components in isolation
- Mock external dependencies
- Focus on business logic correctness
- Target: 80%+ coverage for critical paths

### Integration Tests
- Test module interactions and data flows
- Use test databases and fixtures
- Verify API endpoints with real requests
- Test authentication and authorization

### End-to-End Tests
- Test complete user workflows
- Run against staging environment
- Validate UI interactions and state management
- Priority: Critical user paths

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

## Test Structure

### Backend
```
backend/tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── fixtures/          # Test data
└── helpers/           # Test utilities
```

### Frontend
```
frontend/tests/
├── unit/              # Component unit tests
├── integration/       # Feature integration tests
├── e2e/               # End-to-end tests
└── fixtures/          # Mock data
```

## Test Conventions

### Naming
- Test files: `<module>.test.js` or `<module>.spec.js`
- Test cases: Describe what the function does: `should calculate total price correctly`
- Suites: Group related tests with `describe()`

### Structure
```javascript
describe('Module name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  });

  afterEach(() => {
    // Cleanup
  });
});
```

## Coverage Expectations

- **Critical Business Logic**: 90%+
- **API Endpoints**: 85%+
- **UI Components**: 80%+
- **Utilities**: 85%+
- **Database Models**: 90%+

## Debugging Tests

```bash
# Run single test file
npm test -- tests/unit/auth.test.js

# Run tests matching pattern
npm test -- --grep "auth"

# Debug with Node inspector
node --inspect-brk ./node_modules/.bin/jest
```

## CI/CD Integration

Tests run automatically on:
- Pull request creation
- Push to `main`
- Before deployment

Failing tests block deployment. Fix tests or revert changes.

## Best Practices

1. **Test behavior, not implementation** — Focus on what the code does
2. **Keep tests isolated** — No dependencies between tests
3. **Use meaningful assertions** — Clear failure messages
4. **Mock external dependencies** — API calls, database, timers
5. **Clean up after tests** — Prevent state leakage
6. **Use fixtures for data** — Reusable test data
7. **Test edge cases** — Boundary conditions, error states
8. **Avoid test duplication** — Use helpers and parameterized tests

## Common Issues

### Test Timeout
Increase timeout for slow tests:
```javascript
it('should complete slow operation', async () => {
  // test
}, 10000); // 10 second timeout
```

### Database Connection
Use test database fixtures or in-memory databases:
```javascript
beforeEach(() => {
  const testDB = new TestDatabase();
  // Use testDB for tests
});
```

### Flaky Tests
- Avoid time-dependent assertions
- Use deterministic fixtures
- Add explicit waits for async operations
- Check for race conditions

## Continuous Integration

All checks must pass before merge:
- Unit tests
- Integration tests
- Linting
- Type checking
- Coverage thresholds

See `.github/workflows/` for CI configuration.
