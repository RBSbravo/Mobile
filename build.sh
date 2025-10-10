#!/bin/bash

# Custom build script for Vercel deployment
echo "🚀 Starting MITO Mobile PWA build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the mobile-app directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is available
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Create dist directory if it doesn't exist
mkdir -p dist

# Export web build
echo "🌐 Exporting web build..."
npx expo export --platform web --output-dir dist

# Check if export was successful
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Error: Export failed or dist directory is empty"
    exit 1
fi

# Copy PWA files to dist
echo "📱 Copying PWA files..."
cp -r public/* dist/ 2>/dev/null || true

echo "✅ Build completed successfully!"
echo "📁 Output directory: dist"
ls -la dist/
