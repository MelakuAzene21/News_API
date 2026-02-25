# Swagger/OpenAPI Documentation

This document explains the Swagger/OpenAPI documentation implementation for the News API.

## Overview

The News API includes comprehensive Swagger documentation that provides interactive API documentation for all endpoints. The documentation is automatically generated from JSDoc comments in the route files and provides a complete reference for API consumers.

## Accessing Documentation

### Swagger UI
- **URL**: `http://localhost:3000/api-docs`
- **Format**: Interactive web interface
- **Features**: 
  - Try out endpoints directly from the browser
  - View request/response schemas
  - Authentication support
  - Parameter validation

### OpenAPI JSON
- **URL**: `http://localhost:3000/api-docs.json`
- **Format**: Raw OpenAPI 3.0 specification
- **Usage**: For integration with other tools

## Documentation Structure

### API Information
- **Title**: News API
- **Version**: 1.0.0
- **Description**: A comprehensive news API with analytics engine for article management and reader engagement tracking
- **License**: MIT
- **Contact**: API Support

### Servers
- **Development**: `http://localhost:3000`
- **Production**: `https://api.newsapp.com`

### Tags
Endpoints are organized into logical groups:

1. **Authentication** - User signup and login
2. **Articles - Public** - Public article access (no auth required)
3. **Articles - Author** - Author article management (auth + author role required)
4. **Dashboard** - Author dashboard and analytics

## Documented Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
- **Purpose**: Register a new user
- **Authentication**: None required
- **Request Body**: `SignupRequest`
- **Response**: `AuthResponse`
- **Status Codes**: 201, 400, 409

#### POST /api/auth/login
- **Purpose**: User login
- **Authentication**: None required
- **Request Body**: `LoginRequest`
- **Response**: `AuthResponse`
- **Status Codes**: 200, 400, 401

### Public Article Endpoints

#### GET /api/articles
- **Purpose**: Get published articles with filtering
- **Authentication**: Optional (guest or authenticated)
- **Query Parameters**: category, author, q, page, limit
- **Response**: `PaginatedResponse` with `Article` objects
- **Status Codes**: 200

#### GET /api/articles/{id}
- **Purpose**: Get specific article by ID
- **Authentication**: Optional (guest or authenticated)
- **Path Parameters**: id (UUID)
- **Response**: `BaseResponse` with `Article` + `readTracked` flag
- **Status Codes**: 200, 404, 429

### Author Article Endpoints

#### POST /api/author/articles
- **Purpose**: Create new article
- **Authentication**: Required (Bearer token + author role)
- **Request Body**: `CreateArticleRequest`
- **Response**: `BaseResponse` with `Article`
- **Status Codes**: 201, 400, 401, 403

#### GET /api/author/articles/me
- **Purpose**: Get author's articles
- **Authentication**: Required (Bearer token + author role)
- **Query Parameters**: page, limit, includeDeleted
- **Response**: `PaginatedResponse` with `Article` objects
- **Status Codes**: 200, 401, 403

#### PUT /api/author/articles/{id}
- **Purpose**: Update existing article
- **Authentication**: Required (Bearer token + author role)
- **Path Parameters**: id (UUID)
- **Request Body**: `UpdateArticleRequest`
- **Response**: `BaseResponse` with `Article`
- **Status Codes**: 200, 400, 401, 403, 404

#### DELETE /api/author/articles/{id}
- **Purpose**: Soft delete article
- **Authentication**: Required (Bearer token + author role)
- **Path Parameters**: id (UUID)
- **Response**: `BaseResponse` with `Article` (includes deletedAt)
- **Status Codes**: 200, 401, 403, 404

### Dashboard Endpoints

#### GET /api/author/dashboard
- **Purpose**: Get author dashboard with analytics
- **Authentication**: Required (Bearer token + author role)
- **Query Parameters**: page, limit
- **Response**: `PaginatedResponse` with `ArticleWithViews` objects
- **Status Codes**: 200, 401, 403

## Data Models

### User Schema
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string (email)",
  "role": "author|reader",
  "createdAt": "string (ISO 8601)"
}
```

### Article Schema
```json
{
  "id": "string (UUID)",
  "title": "string (1-150 chars)",
  "content": "string (min 50 chars)",
  "category": "Politics|Tech|Sports|Health",
  "status": "Draft|Published",
  "author": "User",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "deletedAt": "string (ISO 8601) | null"
}
```

### Response Schemas

#### BaseResponse
```json
{
  "Success": "boolean",
  "Message": "string",
  "Object": "object | null",
  "Errors": "string[] | null"
}
```

#### PaginatedResponse
```json
{
  "Success": "boolean",
  "Message": "string",
  "Object": "object[]",
  "PageNumber": "integer",
  "PageSize": "integer",
  "TotalSize": "integer",
  "Errors": "string[] | null"
}
```

## Authentication

### Bearer Token Authentication
Protected endpoints require JWT authentication:

1. **Get Token**: Use `/api/auth/login` to obtain JWT token
2. **Include Token**: Add `Authorization: Bearer <token>` header
3. **Token Format**: JWT with user ID and role claims

### Role-Based Access
- **Author Role**: Required for article management and dashboard
- **Reader Role**: Can access public endpoints
- **Guest Access**: Public endpoints work without authentication

## Using Swagger UI

### 1. Browse Endpoints
- Navigate through tagged endpoint groups
- View detailed descriptions and parameters
- Check required vs optional parameters

### 2. Try Endpoints
- Click "Try it out" button
- Fill in required parameters
- Click "Execute" to make request
- View response and status code

### 3. Authentication
- Click "Authorize" button (top right)
- Enter `Bearer <your-jwt-token>`
- Click "Authorize" to apply token to all requests

### 4. Schema Reference
- Click on schema names to view detailed structure
- See examples and field descriptions
- Understand data requirements

## Error Handling

### Standard Error Response
```json
{
  "Success": false,
  "Message": "Error description",
  "Object": null,
  "Errors": ["Specific error messages"]
}
```

### Common Status Codes
- **400**: Validation error or bad request
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **409**: Conflict (duplicate resource)
- **429**: Rate limit exceeded

## Rate Limiting

### Article Reading
- **Limit**: 5 reads per 10 seconds per user/IP
- **Purpose**: Prevent abuse and ensure fair usage
- **Response**: 429 status with error message

### Read Tracking
- **Deduplication**: Only one read tracked per user per article per 60 seconds
- **Purpose**: Prevent artificial view count inflation
- **Behavior**: Returns `readTracked: false` for duplicate reads

## Development

### Adding New Endpoints

1. **Add Route**: Implement endpoint in appropriate route file
2. **Add Documentation**: Include JSDoc comments with `@swagger` annotation
3. **Define Schemas**: Add new schemas to `swagger.ts` if needed
4. **Test**: Verify documentation appears correctly in Swagger UI

### Documentation Format
Use standard OpenAPI 3.0 format in JSDoc comments:

```javascript
/**
 * @swagger
 * /api/endpoint:
 *   method:
 *     tags: [Tag]
 *     summary: Brief description
 *     description: Detailed description
 *     security:
 *       - bearerAuth: []
 *     parameters: []
 *     requestBody: {}
 *     responses: {}
 */
```

### Schema Definition
Add new schemas to `swagger.ts` in the `components.schemas` section:

```typescript
NewSchema: {
  type: 'object',
  properties: {
    field: {
      type: 'string',
      description: 'Field description'
    }
  },
  required: ['field']
}
```

## Best Practices

1. **Comprehensive Documentation**: Document all parameters, responses, and errors
2. **Examples**: Provide realistic request/response examples
3. **Schema Reuse**: Use `$ref` to reference common schemas
4. **Security**: Clearly document authentication requirements
5. **Validation**: Include validation rules and constraints
6. **Error Cases**: Document all possible error responses

## Integration

### Client SDK Generation
The OpenAPI specification can be used to generate client SDKs:
- **JavaScript**: `openapi-generator-cli generate -i api-docs.json -g javascript -o ./client`
- **TypeScript**: `openapi-generator-cli generate -i api-docs.json -g typescript-axios -o ./client`
- **Other Languages**: See OpenAPI Generator documentation

### API Testing
Use the specification for automated testing:
- **Postman**: Import OpenAPI spec
- **Insomnia**: Import OpenAPI spec
- **Automated Tests**: Generate test cases from specification

### Monitoring
Monitor API usage through the documented endpoints:
- Track endpoint usage patterns
- Monitor error rates
- Analyze response times
- Review authentication failures

The Swagger documentation provides a complete, interactive API reference that makes the News API easy to understand, test, and integrate with.
