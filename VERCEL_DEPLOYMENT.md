# Vercel Deployment Guide

This guide will help you deploy your Next.js application to Vercel with proper MongoDB and Resend configuration.

## Prerequisites

1. **MongoDB Atlas Account**: You need a MongoDB Atlas cluster
2. **Resend Account**: You need a Resend account for sending emails
3. **Vercel Account**: You need a Vercel account for deployment

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier is fine)
3. Choose your preferred cloud provider and region

### 1.2 Create Database User
1. In your cluster, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username and password (save these!)
5. Set privileges to "Read and write to any database"

### 1.3 Get Connection String
1. In your cluster, click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with your desired database name

Your connection string should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

## Step 2: Set Up Resend

### 2.1 Create Resend Account
1. Go to [Resend](https://resend.com/)
2. Sign up for an account
3. Verify your email

### 2.2 Get API Key
1. In your Resend dashboard, go to "API Keys"
2. Create a new API key
3. Copy the API key (starts with `re_`)

### 2.3 Configure Domain
1. In your Resend dashboard, go to "Domains"
2. Add your domain (or use the provided test domain)
3. Copy the domain name

## Step 3: Configure Environment Variables

### 3.1 Local Development (.env.local)
Create a `.env.local` file in your project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
RESEND_API_KEY=re_your_api_key_here
RESEND_DOMAIN=your_domain.com
```

### 3.2 Vercel Environment Variables
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority` | Production, Preview, Development |
| `RESEND_API_KEY` | `re_your_api_key_here` | Production, Preview, Development |
| `RESEND_DOMAIN` | `your_domain.com` | Production, Preview, Development |

## Step 4: Deploy to Vercel

### 4.1 Connect Repository
1. In Vercel, click "New Project"
2. Import your GitHub repository
3. Select the repository

### 4.2 Configure Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 4.3 Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at the provided URL

## Step 5: Test Your Deployment

### 5.1 Test Database Connection
Visit: `https://your-app.vercel.app/api/test-db`

You should see:
```json
{
  "success": true,
  "message": "Database connection successful!",
  "userCount": 1,
  "users": [...]
}
```

### 5.2 Test Email Sending
1. Go to your app's homepage
2. Enter an email address
3. Click "Send Email"
4. Check if the email is received

### 5.3 Test Email Dashboard
Visit: `https://your-app.vercel.app/api/emails`

You should see email statistics and history.

## Troubleshooting

### Build Errors
- **TypeScript Errors**: Make sure all types are properly defined
- **Missing Dependencies**: Check `package.json` for all required packages
- **Environment Variables**: Ensure all required variables are set in Vercel

### Runtime Errors
- **Database Connection**: Verify `MONGODB_URI` is correct and accessible
- **Email Sending**: Check `RESEND_API_KEY` and `RESEND_DOMAIN`
- **IP Whitelist**: Ensure Vercel's IPs are whitelisted in MongoDB Atlas

### Common Issues

#### 1. "bad auth : authentication failed"
- Check username and password in `MONGODB_URI`
- Verify database user has correct permissions
- Ensure database name is correct

#### 2. "Email service not configured"
- Check `RESEND_API_KEY` is set
- Verify `RESEND_DOMAIN` is configured
- Ensure environment variables are deployed to Vercel

#### 3. "Database not configured"
- Verify `MONGODB_URI` is set in Vercel
- Check environment variable names (case-sensitive)
- Ensure variables are set for all environments

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use strong passwords** for database users
3. **Limit database user permissions** to only what's needed
4. **Rotate API keys** regularly
5. **Monitor usage** in both MongoDB Atlas and Resend dashboards

## Monitoring

### MongoDB Atlas
- Monitor connection count
- Check query performance
- Set up alerts for high usage

### Resend
- Monitor email delivery rates
- Check bounce and spam reports
- Track API usage

### Vercel
- Monitor build success rates
- Check function execution times
- Set up error alerts

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure analytics
3. Set up monitoring and alerts
4. Plan for scaling

## Support

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test database connection locally
4. Check MongoDB Atlas and Resend dashboards
5. Review this guide for common solutions
