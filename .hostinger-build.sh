#!/bin/bash
# Hostinger build script for frontend

echo "🚀 Starting frontend build..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Move build output to root dist for Hostinger
echo "📁 Preparing output..."
cd ..
mkdir -p dist-frontend
cp -r frontend/dist/* dist-frontend/

echo "✅ Frontend build complete!"
echo "📂 Output directory: dist-frontend/"
