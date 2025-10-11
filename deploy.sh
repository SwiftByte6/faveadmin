#!/bin/bash

# FaveAdmin Production Deployment Script
# This script helps deploy the dashboard to production

echo "🚀 FaveAdmin Production Deployment"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "🚀 Ready for production deployment!"
    echo ""
    echo "To start the production server:"
    echo "  npm start"
    echo ""
    echo "To deploy to Vercel:"
    echo "  npx vercel --prod"
    echo ""
    echo "To deploy to Docker:"
    echo "  docker build -t faveadmin ."
    echo "  docker run -p 3000:3000 faveadmin"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
