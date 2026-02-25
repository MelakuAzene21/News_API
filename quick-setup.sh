#!/bin/bash

# News API Quick Setup Script
# This script automates the complete setup process

echo "🚀 News API Quick Setup"
echo "======================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
print_status "Node.js version: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm v8 or higher."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q &> /dev/null; then
    print_warning "PostgreSQL might not be running. Please ensure PostgreSQL is installed and running."
fi

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    print_warning "Redis might not be running. Please ensure Redis is installed and running."
fi

echo ""
print_info "Step 1: Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""
print_info "Step 2: Setting up environment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_info "Creating .env file with default values..."
    cat > .env << EOL
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/newsdb"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
NODE_ENV="development"
PORT=3000

# Optional: Logging Level
LOG_LEVEL="info"
EOL
    print_status ".env file created"
    print_warning "Please update the .env file with your actual database credentials"
else
    print_status ".env file already exists"
fi

echo ""
print_info "Step 3: Setting up database..."

# Generate Prisma client
npm run prisma:generate
if [ $? -eq 0 ]; then
    print_status "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

# Run database migrations
npm run prisma:migrate
if [ $? -eq 0 ]; then
    print_status "Database migrations completed"
else
    print_warning "Database migrations might have failed. Please check your database connection."
fi

echo ""
print_info "Step 4: Building application..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Application built successfully"
else
    print_error "Failed to build application"
    exit 1
fi

echo ""
print_info "Step 5: Running tests..."
npm test
if [ $? -eq 0 ]; then
    print_status "All tests passed!"
else
    print_warning "Some tests might have failed. Check the test output above."
fi

echo ""
print_info "Setup completed! 🎉"
echo ""
echo "Next steps:"
echo "1. Update your .env file with actual database credentials"
echo "2. Start the development server: npm run dev"
echo "3. Or start with documentation: npm run start:docs"
echo "4. Visit http://localhost:3000/api-docs for API documentation"
echo ""
echo "Useful URLs:"
echo "- API: http://localhost:3000"
echo "- Health Check: http://localhost:3000/health"
echo "- Swagger Docs: http://localhost:3000/api-docs"
echo "- Test Coverage: npm run test:coverage"
echo ""
print_status "News API is ready to use! 🚀"
