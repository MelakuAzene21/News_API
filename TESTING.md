# Testing Guide

This document explains the testing setup and how to run tests for the News API.

## Testing Framework

We use **Jest** with **Supertest** for HTTP endpoint testing and **mocked database** operations.

### Setup

The testing setup includes:

- **Jest**: Test runner with TypeScript support
- **Supertest**: HTTP assertion library for testing Express endpoints
- **Mocked Prisma**: All database operations are mocked to avoid hitting actual database
- **Mocked Redis**: Redis operations are mocked for rate limiting and caching
- **Mocked JWT**: JWT operations are mocked for authentication testing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

### Test Files

- `src/tests/auth.test.ts` - Authentication endpoints (signup, login)
- `src/tests/articles.test.ts` - Article management and public access
- `src/tests/dashboard.test.ts` - Author dashboard endpoints
- `src/tests/services.test.ts` - Business logic services

### Test Setup

All tests use the setup file `src/tests/setup.ts` which provides:

- Mocked database operations (Prisma)
- Mocked Redis operations
- Mocked JWT verification
- Test environment variables
- Exported mock objects for test customization

## Rate Limiting Enhancement

### Problem Solved

The original issue was that users could refresh the page multiple times and generate multiple ReadLog entries within seconds, artificially inflating view counts.

### Solution Implemented

**Dual-Layer Rate Limiting**:

1. **Request Rate Limiting** (existing): 5 reads per 10 seconds per user/IP
2. **Read Tracking Deduplication** (new): Only track one read per user per article per 60 seconds

### How It Works

```typescript
// Check if user has read this article recently (within 60 seconds)
const recentReadKey = `recent-read:${readerId || 'guest'}:${articleId}`;
const recentRead = await redis.get(recentReadKey);

if (recentRead) {
  // User has read this article recently, don't create another ReadLog
  return { tracked: false, reason: 'recent_read' };
}

// Mark as recent read with 60 second expiry
await redis.setex(recentReadKey, 60, '1');
```

### Benefits

- **Prevents Refresh Spam**: Multiple rapid refreshes won't create duplicate ReadLog entries
- **Accurate Analytics**: View counts reflect actual unique reads, not refresh spam
- **Performance**: Redis-based check is extremely fast
- **User-Friendly**: Still allows users to re-read articles after 60 seconds

## Test Coverage

### Authentication Tests

- ✅ User signup with valid data
- ✅ Duplicate email handling
- ✅ Input validation
- ✅ User login with valid credentials
- ✅ Invalid credentials handling
- ✅ Missing fields validation

### Article Management Tests

- ✅ Create article (authors only)
- ✅ Article validation (title length, content length, category)
- ✅ Get author's articles with pagination
- ✅ Update article (own articles only)
- ✅ Soft delete article (own articles only)
- ✅ Permission checks (can't modify other's articles)

### Public Article Access Tests

- ✅ Get published articles (excluding deleted)
- ✅ Category filtering
- ✅ Keyword search (title + content)
- ✅ Author name filtering (partial match)
- ✅ Pagination
- ✅ Get article by ID
- ✅ Deleted article handling
- ✅ Rate limiting enforcement
- ✅ Read tracking deduplication

### Dashboard Tests

- ✅ Get author dashboard with view counts
- ✅ Exclude deleted articles
- ✅ Pagination support
- ✅ Authentication requirement
- ✅ Author role requirement

### Service Layer Tests

- ✅ ArticleService CRUD operations
- ✅ Ownership validation
- ✅ AnalyticsService read tracking
- ✅ Recent read deduplication
- ✅ Dashboard data aggregation

## Mock Objects

### Available Mocks

```typescript
import { mockPrisma, mockRedis, mockAnalyticsQueue, mockJwt } from './setup';

// Use in tests to customize behavior
mockPrisma.article.create.mockResolvedValue(mockArticle);
mockRedis.get.mockResolvedValue(null);
mockJwt.verify.mockReturnValue({ sub: 'user-123', role: 'author' });
```

### Response Validation

Tests use custom matchers for consistent response validation:

```typescript
expect(response.body).toBeValidResponse();  // Checks response format
expect(response.body).toBeSuccessful();     // Checks Success: true
```

## Best Practices

### Test Organization

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear test descriptions
3. **Mock Cleanup**: Clear mocks in beforeEach
4. **Edge Cases**: Test both success and failure scenarios

### Mock Usage

1. **Consistent Mocking**: Use setup mocks for common operations
2. **Specific Behavior**: Override mocks for test-specific scenarios
3. **Realistic Data**: Use realistic mock data structures
4. **Error Simulation**: Mock errors for error handling tests

### Database Testing

1. **No Real Database**: All database operations are mocked
2. **Query Validation**: Verify correct query parameters
3. **Data Transformation**: Test data processing logic
4. **Error Scenarios**: Mock database errors

## Example Test

```typescript
describe('POST /api/author/articles', () => {
  it('should create a new article successfully', async () => {
    const articleData = {
      title: 'Test Article',
      content: 'This is a test article content that meets the minimum length requirement.',
      category: 'Tech',
      status: 'Draft'
    };

    // Arrange
    mockPrisma.article.create.mockResolvedValue(mockCreatedArticle);

    // Act
    const response = await request(app)
      .post('/api/author/articles')
      .set('Authorization', authToken)
      .send(articleData);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toBeValidResponse();
    expect(response.body.Success).toBe(true);
    expect(response.body.Object.title).toBe(articleData.title);
  });
});
```

## Coverage Reports

Run coverage reports to see test coverage:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML view
- `coverage/lcov.info` - LCOV format for CI/CD

## Continuous Integration

The tests are designed to run in CI/CD environments:
- No external dependencies required
- Fast execution with mocked operations
- Clear exit codes for pass/fail
- Coverage reporting integration
