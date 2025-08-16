# Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account
- Node.js 18+ installed locally

## Step 1: Prepare Your Local Repository

### 1.1 Clean up build artifacts
```bash
# Remove existing build directories
rm -rf .next/
rm -rf out/
rm -rf build/
rm -rf dist/

# Remove node_modules and reinstall
rm -rf node_modules/
npm install
```

### 1.2 Verify .gitignore is properly configured
Ensure your `.gitignore` file includes:
- `.next/` (Next.js build output)
- `node_modules/`
- `.env*` files
- `.vercel/`

### 1.3 Test build locally
```bash
npm run build
```
If the build succeeds, you're ready to deploy.

## Step 2: GitHub Repository Setup

### 2.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Ready for Vercel deployment"
```

### 2.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name your repository (e.g., `resend-email-confirmation`)
4. Make it public or private as needed
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)

### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 3: Vercel Deployment

### 3.1 Connect Vercel to GitHub
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect it's a Next.js project

### 3.2 Configure Environment Variables
In Vercel dashboard, add these environment variables:
- `MONGODB_URI` - Your MongoDB connection string
- `RESEND_API_KEY` - Your Resend API key
- `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL

### 3.3 Deploy
1. Click "Deploy"
2. Vercel will automatically:
   - Install dependencies
   - Run `npm run build`
   - Deploy to production

## Step 4: Post-Deployment Verification

### 4.1 Check Build Logs
- Verify no warnings about `.next` directory
- Ensure all dependencies installed correctly
- Check that build completed successfully

### 4.2 Test Your Application
- Visit your Vercel URL
- Test email functionality
- Verify database connections

## Common Issues and Solutions

### Issue: "You should not upload the .next directory"
**Solution**: Ensure `.next/` is in your `.gitignore` file and remove any existing `.next` directory from your repository.

### Issue: Build failures
**Solutions**:
- Check environment variables are set in Vercel
- Verify all dependencies are in `package.json`
- Check build logs for specific error messages

### Issue: Environment variables not working
**Solution**: Ensure environment variables are set in Vercel dashboard, not just locally.

## Best Practices

1. **Never commit sensitive files**: Keep `.env` files out of Git
2. **Clean builds**: Always remove build artifacts before committing
3. **Test locally**: Run `npm run build` before pushing
4. **Monitor deployments**: Check Vercel logs for any issues
5. **Use preview deployments**: Test changes in preview before merging to main

## Automatic Deployments

Once connected, Vercel will automatically:
- Deploy on every push to main branch
- Create preview deployments for pull requests
- Rebuild on dependency updates

## Troubleshooting

### If deployment fails:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Test build locally with `npm run build`
4. Check for TypeScript errors with `npm run lint`

### If environment variables aren't working:
1. Verify they're set in Vercel dashboard
2. Check variable names match exactly
3. Redeploy after setting variables

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)
