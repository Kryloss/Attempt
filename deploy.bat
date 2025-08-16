@echo off
echo 🚀 Preparing for Vercel deployment...

REM Clean up build artifacts
echo 🧹 Cleaning up build artifacts...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist .vercel rmdir /s /q .vercel

REM Remove node_modules and reinstall
echo 📦 Reinstalling dependencies...
if exist node_modules rmdir /s /q node_modules
npm install

REM Test build locally
echo 🔨 Testing build locally...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful! Ready for deployment.
    echo.
    echo 📋 Next steps:
    echo 1. Commit your changes: git add . ^&^& git commit -m "Ready for deployment"
    echo 2. Push to GitHub: git push origin main
    echo 3. Deploy on Vercel: https://vercel.com/new
    echo.
    echo ⚠️  Remember to:
    echo - Set environment variables in Vercel dashboard
    echo - Never commit .env files
    echo - Check that .next/ is in .gitignore
) else (
    echo ❌ Build failed! Please fix the errors before deploying.
    pause
    exit /b 1
)

pause
