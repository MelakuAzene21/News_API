# News API

A robust, production-ready RESTful API for a news platform with authors, readers, and an analytics engine.

## 🌟 Features

### Core Features
- **User Authentication** - JWT-based authentication with secure password hashing
- **Role-Based Access Control** - Author and Reader roles with different permissions
- **Article Management** - Full CRUD operations with soft delete functionality
- **Public News Feed** - Filterable and searchable article listing
- **Read Tracking** - Advanced analytics with rate limiting to prevent spam
- **Daily Analytics** - Automated view count aggregation using job queues
- **Author Dashboard** - Performance metrics and engagement statistics
- **Rate Limiting** - Multiple layers of protection against abuse
- **Comprehensive Testing** - Unit tests with database mocking
- **API Documentation** - Interactive Swagger/OpenAPI documentation

### Advanced Features
- **Soft Delete** - Articles are marked as deleted, not permanently removed
- **Analytics Engine** - Real-time and daily aggregated view statistics
- **Job Queue System** - Asynchronous processing with Bull and Redis
- **Rate Limiting Deduplication** - Prevents artificial view count inflation
- **Comprehensive Error Handling** - Structured error responses with validation
- **Security Hardening** - Helmet, CORS, input validation, SQL injection prevention

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Caching & Queues**: Redis 7+ with Bull
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: express-validator
- **Logging**: Winston with structured logging

### Development & Testing
- **Testing Framework**: Jest with Supertest
- **Test Coverage**: Database mocking with comprehensive unit tests
- **API Documentation**: Swagger/OpenAPI 3.0 with interactive UI
- **Type Safety**: Full TypeScript implementation
- **Code Quality**: ESLint and Prettier configuration

### Security & Performance
- **Security**: Helmet.js, CORS, rate limiting, input sanitization
- **Performance**: Redis caching, connection pooling, optimized queries
- **Monitoring**: Health checks, structured logging, error tracking

## 📋 Prerequisites

### Required Software
- **Node.js** v18 or higher
- **npm** v8 or higher
- **PostgreSQL** v14 or higher
- **Redis** v7 or higher

### Development Tools (Recommended)
- **Git** for version control
- **VS Code** or similar IDE with TypeScript support
- **Postman** or similar API testing tool
- **Docker** (optional) for containerized setup

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/news-api.git
cd news-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/newsdb"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Server
NODE_ENV="development"
PORT=3000
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 5. Start the Server
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start

# With Swagger documentation
npm run start:docs
```

### 6. Verify Installation
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Swagger Docs**: http://localhost:3000/api-docs

## 🏗 Project Structure

```
news-api/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Prisma database connection
│   │   └── redis.ts      # Redis and queue setup
│   ├── controllers/       # Request handlers
│   │   ├── authController.ts
│   │   ├── articleController.ts
│   │   ├── readerController.ts
│   │   └── dashboardController.ts
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts       # JWT authentication
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   ├── roleGuard.ts  # Role-based access
│   │   └── validation.ts
│   ├── routes/           # API route definitions
│   │   ├── authRoutes.ts
│   │   ├── articleRoutes.ts
│   │   ├── readerRoutes.ts
│   │   └── dashboardRoutes.ts
│   ├── services/         # Business logic
│   │   ├── authService.ts
│   │   ├── articleService.ts
│   │   ├── analyticsService.ts
│   │   └── queueService.ts
│   ├── utils/           # Utility functions
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── responseFormatter.ts
│   │   └── validators.ts
│   ├── tests/           # Unit tests
│   │   ├── auth.test.ts
│   │   ├── articles.test.ts
│   │   ├── dashboard.test.ts
│   │   ├── services.test.ts
│   │   └── setup.ts
│   ├── jobs/            # Background jobs
│   │   └── analyticsProcessor.ts
│   └── app.ts           # Express app setup
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── docs/               # Documentation
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🔌 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|---------|-----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | User login | No |

### Public Article Endpoints
| Method | Endpoint | Description | Auth Required |
|---------|-----------|-------------|---------------|
| GET | `/api/articles` | Get published articles with filtering | Optional |
| GET | `/api/articles/{id}` | Get specific article | Optional |

### Author Article Management
| Method | Endpoint | Description | Auth Required |
|---------|-----------|-------------|---------------|
| POST | `/api/author/articles` | Create new article | Author |
| GET | `/api/author/articles/me` | Get author's articles | Author |
| PUT | `/api/author/articles/{id}` | Update article | Author |
| DELETE | `/api/author/articles/{id}` | Soft delete article | Author |

### Dashboard Endpoints
| Method | Endpoint | Description | Auth Required |
|---------|-----------|-------------|---------------|
| GET | `/api/author/dashboard` | Get author dashboard with analytics | Author |

## 📊 Data Flow & Architecture

### User Registration & Authentication Flow
1. **User Registration**
   - POST `/api/auth/signup` with user details
   - Validate input (name, email, password, role)
   - Hash password with bcrypt
   - Create user in database
   - Return JWT token

2. **User Login**
   - POST `/api/auth/login` with credentials
   - Validate email/password
   - Generate JWT token with user ID and role
   - Return token and user info

### Article Management Flow
1. **Create Article** (Authors only)
   - POST `/api/author/articles` with article data
   - Validate input (title, content, category)
   - Associate with authenticated author
   - Save to database
   - Return created article

2. **Read Article** (Public)
   - GET `/api/articles/{id}`
   - Rate limiting check (5 reads per 10 seconds)
   - Check if article exists and not deleted
   - Track read asynchronously with deduplication
   - Return article with `readTracked` flag

3. **Analytics Processing**
   - Read events queued in Redis
   - Background job processes reads
   - Creates ReadLog entries
   - Aggregates to DailyAnalytics
   - Updates author dashboard metrics

### Rate Limiting & Anti-Spam
1. **Request Rate Limiting**
   - 5 article reads per 10 seconds per user/IP
   - Prevents rapid refresh spam
   - Returns 429 status when exceeded

2. **Read Tracking Deduplication**
   - Redis key: `recent-read:{userId|guest}:{articleId}`
   - 60-second expiry window
   - Only one ReadLog per user per article per minute
   - Prevents artificial view count inflation

## 🧪 Testing

### Test Suite Overview
The project includes comprehensive unit tests with 40+ test cases covering:

- **Authentication Tests** - Signup, login, validation
- **Article Tests** - CRUD operations, permissions, filtering
- **Dashboard Tests** - Analytics, pagination, authorization
- **Service Tests** - Business logic, edge cases

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure
- **Database Mocking** - All database operations mocked
- **Redis Mocking** - Queue and caching operations mocked
- **JWT Mocking** - Authentication mocked for tests
- **API Testing** - HTTP endpoints tested with Supertest

### Coverage Reports
Coverage reports are generated in `coverage/` directory:
- `coverage/lcov-report/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI/CD

## 📚 API Documentation

### Swagger/OpenAPI Documentation
The API includes comprehensive interactive documentation:

**Access Points:**
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

**Features:**
- Interactive endpoint testing
- Request/response schema exploration
- Authentication support
- Parameter validation examples
- Error response documentation

### Documentation Structure
1. **Authentication** - User signup and login
2. **Articles - Public** - Public article access
3. **Articles - Author** - Author management
4. **Dashboard** - Analytics and metrics

### Using the Documentation
1. Browse endpoints by category
2. Click "Try it out" to test
3. Fill parameters and execute requests
4. View responses and status codes
5. Use "Authorize" button for authenticated endpoints

## 🔧 Development

### Environment Variables
Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/newsdb"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Server Configuration
NODE_ENV="development"
PORT=3000

# Optional: Logging Level
LOG_LEVEL="info"
```

### Database Schema
The application uses PostgreSQL with the following main entities:

- **Users** - Author and reader accounts
- **Articles** - News articles with soft delete
- **ReadLogs** - Individual article read events
- **DailyAnalytics** - Aggregated daily view counts

### Key Business Logic
1. **Soft Delete** - Articles marked with `deletedAt` timestamp
2. **Role-Based Access** - Authors can manage own articles only
3. **Analytics Aggregation** - Daily job processes read logs
4. **Rate Limiting** - Multiple layers prevent abuse

## 🚀 Deployment

### Production Setup
1. **Environment Setup**
   ```env
   NODE_ENV="production"
   DATABASE_URL="postgresql://prod-user:pass@prod-host:5432/proddb"
   REDIS_URL="redis://prod-host:6379"
   JWT_SECRET="production-jwt-secret"
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Database Migration**
   ```bash
   npm run prisma:migrate
   ```

4. **Start Services**
   ```bash
   # API Server
   npm start

   # Analytics Worker (separate process)
   npm run queue:worker
   ```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens** - Secure, stateless authentication
- **Password Hashing** - bcrypt with salt rounds
- **Role-Based Access** - Authors vs Readers permissions
- **Token Expiration** - Configurable JWT expiry

### Input Validation & Sanitization
- **Request Validation** - express-validator for all inputs
- **SQL Injection Prevention** - Prisma ORM parameterized queries
- **XSS Protection** - Input sanitization and Helmet.js
- **Rate Limiting** - Multiple layers of protection

### Data Protection
- **Soft Delete** - Data retention with deletion tracking
- **Error Handling** - No sensitive data in error messages
- **CORS Configuration** - Cross-origin request control
- **Security Headers** - Helmet.js protection

## 📈 Monitoring & Logging

### Logging Strategy
- **Structured Logging** - Winston with JSON format
- **Log Levels** - Error, warn, info, debug
- **Request Logging** - HTTP requests with metadata
- **Error Tracking** - Comprehensive error logging

### Health Monitoring
- **Health Endpoint** - `/health` for service checks
- **Database Health** - Connection status monitoring
- **Redis Health** - Cache and queue status
- **Graceful Shutdown** - Clean process termination

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Ensure all tests pass
5. Submit pull request

### Code Quality Standards
- **TypeScript** - Strong typing throughout
- **ESLint** - Code linting and formatting
- **Testing** - Unit tests for all new features
- **Documentation** - Update Swagger docs for changes

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues & Solutions

**Database Connection Issues**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

**Redis Connection Issues**
- Verify Redis is running
- Check REDIS_URL format
- Test Redis connection: `redis-cli ping`

**Authentication Issues**
- Verify JWT_SECRET is set
- Check token expiration
- Validate token format

**Rate Limiting Issues**
- Check Redis connection for rate limiting
- Verify rate limit configuration
- Monitor Redis key expiration

### Getting Help
- Check the comprehensive test suite for usage examples
- Review Swagger documentation for endpoint details
- Examine error logs for debugging information
- Refer to the TESTING.md and SWAGGER.md files for detailed guides

---

**🎉 Congratulations!** You now have a complete understanding of the News API with all its features, setup instructions, and development workflows. The API is production-ready with comprehensive testing, documentation, and security features.