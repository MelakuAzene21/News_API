#!/bin/bash

echo "🚀 Starting News API with Swagger Documentation..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Start the server
echo "🌐 Starting server..."
echo ""
echo "📚 API Documentation will be available at:"
echo "   http://localhost:3000/api-docs"
echo ""
echo "🔗 Other useful endpoints:"
echo "   Health Check: http://localhost:3000/health"
echo "   API Spec JSON: http://localhost:3000/api-docs.json"
echo ""
echo "🚀 Server starting on port 3000..."
echo "   Press Ctrl+C to stop"
echo ""

npm start
