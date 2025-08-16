#!/bin/bash

echo "🚀 Preparing for Vercel deployment..."

# Clean up build artifacts
echo "🧹 Cleaning up build artifacts..."
rm -rf .next/
rm -rf out/
rm -rf build/
rm -rf dist/
rm -rf .vercel/

# Remove node_modules and reinstall
echo "📦 Reinstalling dependencies..."
rm -rf node_modules/
npm install

# Test build locally
echo "🔨 Testing build locally..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready for deployment."
    echo ""
    echo "📋 Next steps:"
    echo "1. Commit your changes: git add . && git commit -m 'Ready for deployment'"
    echo "2. Push to GitHub: git push origin main"
    echo "3. Deploy on Vercel: https://vercel.com/new"
    echo ""
    echo "⚠️  Remember to:"
    echo "- Set environment variables in Vercel dashboard"
    echo "- Never commit .env files"
    echo "- Check that .next/ is in .gitignore"
else
    echo "❌ Build failed! Please fix the errors before deploying."
    exit 1
fi
