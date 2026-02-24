# News API

A robust, production-ready RESTful API for a news platform with authors, readers, and an analytics engine.

## Features

- User authentication with JWT
- Role-based access control (Author/Reader)
- Article management with soft delete
- Public news feed with filtering
- Read tracking and analytics
- Daily article view aggregation
- Author performance dashboard
- Rate limiting and security features

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Redis with Bull
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, rate limiting

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v7 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/news-api.git
   cd news-api