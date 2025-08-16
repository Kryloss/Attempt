# Deployment Checklist

## ✅ Pre-Deployment Checklist

### Local Setup
- [ ] `.gitignore` file includes `.next/`, `node_modules/`, and `.env*` files
- [ ] No `.next` directory exists in your project
- [ ] No `.env` files are committed to Git
- [ ] `package.json` has all required dependencies
- [ ] Local build succeeds (`npm run build`)

### Environment Variables
- [ ] `MONGODB_URI` is ready (MongoDB connection string)
- [ ] `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set (Gmail SMTP)
- [ ] `NEXT_PUBLIC_APP_URL` will be set to your Vercel URL

### Git Repository
- [ ] Repository is initialized (`git init`)
- [ ] All files are committed (`git add . && git commit -m "Initial commit"`)
- [ ] GitHub repository is created
- [ ] Code is pushed to GitHub (`git push -u origin main`)

## 🚀 Deployment Steps

### Step 1: Clean and Prepare
```bash
# Run the deployment script (Windows)
deploy.bat

# Or manually:
# Remove build artifacts
rm -rf .next/ out/ build/ dist/ .vercel/
# Reinstall dependencies
rm -rf node_modules/
npm install
# Test build
npm run build
```

### Step 2: GitHub Setup
1. Go to [GitHub](https://github.com)
2. Create new repository
3. **DO NOT** initialize with README, .gitignore, or license
4. Copy repository URL
5. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Vercel Deployment
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js

### Step 4: Environment Variables
In Vercel dashboard, add:
- `MONGODB_URI` = Your MongoDB connection string
- `GMAIL_USER` = Your Gmail address
- `GMAIL_APP_PASSWORD` = Your Gmail app password
- `NEXT_PUBLIC_APP_URL` = Your Vercel URL (after first deploy)

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Copy your Vercel URL
4. Update `NEXT_PUBLIC_APP_URL` with your Vercel URL
5. Redeploy

## 🔍 Post-Deployment Verification

### Build Logs Check
- [ ] No warnings about `.next` directory
- [ ] All dependencies installed successfully
- [ ] Build completed without errors
- [ ] Environment variables loaded correctly

### Application Testing
- [ ] Homepage loads correctly
- [ ] Email form is functional
- [ ] Database connection works
- [ ] Email sending works
- [ ] API endpoints respond correctly

### Environment Variables Test
- [ ] MongoDB connection established
- [ ] Gmail SMTP working
- [ ] App URL correctly set

## ❌ Common Issues & Solutions

### "You should not upload the .next directory"
**Solution**: Ensure `.next/` is in `.gitignore` and remove any existing `.next` directory.

### Build Failures
**Check**: Environment variables, dependencies, TypeScript errors.

### Environment Variables Not Working
**Solution**: Set in Vercel dashboard, not just locally.

### Database Connection Issues
**Check**: MongoDB URI format, network access, user permissions.

## 📱 Final Steps

- [ ] Test all functionality on deployed site
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring and alerts
- [ ] Share your deployed URL
- [ ] Document any deployment-specific notes

## 🆘 Need Help?

- Check Vercel build logs
- Verify environment variables
- Test locally first
- Check this checklist again
- Review VERCEL_DEPLOYMENT.md for detailed steps
