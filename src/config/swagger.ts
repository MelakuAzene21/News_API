import swaggerJsdoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'News API',
      version: '1.0.0',
      description: 'A comprehensive news API with analytics engine for article management and reader engagement tracking.',
      contact: {
        name: 'API Support',
        email: 'support@newsapi.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.newsapp.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['author', 'reader'],
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          },
          required: ['id', 'name', 'email', 'role', 'createdAt']
        },
        Article: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique article identifier'
            },
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 150,
              description: 'Article title'
            },
            content: {
              type: 'string',
              minLength: 50,
              description: 'Article content'
            },
            category: {
              type: 'string',
              enum: ['Politics', 'Tech', 'Sports', 'Health'],
              description: 'Article category'
            },
            status: {
              type: 'string',
              enum: ['Draft', 'Published'],
              description: 'Article publication status'
            },
            author: {
              $ref: '#/components/schemas/User'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Article creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Soft deletion timestamp'
            }
          },
          required: ['id', 'title', 'content', 'category', 'status', 'author', 'createdAt', 'updatedAt']
        },
        ArticleWithViews: {
          allOf: [
            { $ref: '#/components/schemas/Article' },
            {
              type: 'object',
              properties: {
                totalViews: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Total number of views for this article'
                }
              }
            }
          ]
        },
        CreateArticleRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 150,
              description: 'Article title',
              example: 'Breaking News: New Technology Released'
            },
            content: {
              type: 'string',
              minLength: 50,
              description: 'Article content (minimum 50 characters)',
              example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
            },
            category: {
              type: 'string',
              enum: ['Politics', 'Tech', 'Sports', 'Health'],
              description: 'Article category'
            },
            status: {
              type: 'string',
              enum: ['Draft', 'Published'],
              description: 'Article publication status (optional, defaults to Draft)'
            }
          },
          required: ['title', 'content', 'category']
        },
        UpdateArticleRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 150,
              description: 'Updated article title'
            },
            content: {
              type: 'string',
              minLength: 50,
              description: 'Updated article content'
            },
            category: {
              type: 'string',
              enum: ['Politics', 'Tech', 'Sports', 'Health'],
              description: 'Updated article category'
            },
            status: {
              type: 'string',
              enum: ['Draft', 'Published'],
              description: 'Updated article publication status'
            }
          }
        },
        SignupRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              pattern: '^[A-Za-z\\s]+$',
              description: 'Full name (letters and spaces only)',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)',
              example: 'Password123!'
            },
            role: {
              type: 'string',
              enum: ['author', 'reader'],
              description: 'User role'
            }
          },
          required: ['name', 'email', 'password', 'role']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              description: 'Password',
              example: 'Password123!'
            }
          },
          required: ['email', 'password']
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT authentication token'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          },
          required: ['token', 'user']
        },
        BaseResponse: {
          type: 'object',
          properties: {
            Success: {
              type: 'boolean',
              description: 'Operation success status'
            },
            Message: {
              type: 'string',
              description: 'Response message'
            },
            Object: {
              type: 'object',
              nullable: true,
              description: 'Response data'
            },
            Errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              nullable: true,
              description: 'Error messages if any'
            }
          },
          required: ['Success', 'Message', 'Object', 'Errors']
        },
        PaginatedResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                PageNumber: {
                  type: 'integer',
                  minimum: 1,
                  description: 'Current page number'
                },
                PageSize: {
                  type: 'integer',
                  minimum: 1,
                  description: 'Items per page'
                },
                TotalSize: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Total number of items'
                }
              },
              required: ['PageNumber', 'PageSize', 'TotalSize']
            }
          ]
        },
        ErrorResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              example: {
                Success: false,
                Message: 'Validation failed',
                Object: null,
                Errors: ['Title must be between 1 and 150 characters']
              }
            }
          ]
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Articles - Public',
        description: 'Public article access (no authentication required)'
      },
      {
        name: 'Articles - Author',
        description: 'Author article management (authentication + author role required)'
      },
      {
        name: 'Dashboard',
        description: 'Author dashboard and analytics'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
