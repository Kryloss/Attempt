# Vercel Deployment Fixes for MongoDB Authentication

## Common Issues and Solutions

### 1. Environment Variables Not Set

**Problem**: MongoDB connection fails because `MONGODB_URI` is not set on Vercel.

**Solution**: 
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_MAX_POOL_SIZE=10
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
```

**Important**: Make sure to set the environment variable for all environments (Production, Preview, Development).

### 2. MongoDB Network Access

**Problem**: MongoDB Atlas blocks connections from Vercel's IP addresses.

**Solution**:
1. Go to MongoDB Atlas dashboard
2. Navigate to Network Access
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: This is less secure but necessary for Vercel
   - Alternative: Add Vercel's IP ranges if you can find them

### 3. MongoDB User Permissions

**Problem**: Database user doesn't have proper permissions.

**Solution**:
1. Go to MongoDB Atlas dashboard
2. Navigate to Database Access
3. Ensure your user has the following roles:
   - `readWrite` on your database
   - Or `dbAdmin` for full access

### 4. Connection String Format

**Problem**: Incorrect MongoDB connection string format.

**Solution**: Use this exact format:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Replace**:
- `username` with your MongoDB username
- `password` with your MongoDB password
- `cluster` with your cluster name
- `database` with your database name

### 5. Vercel Function Timeout

**Problem**: MongoDB connection takes too long and times out.

**Solution**: 
1. Increase timeout in your MongoDB connection options
2. Use connection pooling
3. Consider using MongoDB Atlas M0 (free tier) which has better performance

## Testing Your Setup

### 1. Test MongoDB Connection

Visit: `https://your-domain.vercel.app/api/test-mongodb`

This will show you:
- Whether MongoDB is connecting
- What environment variables are set
- Any connection errors

### 2. Check Vercel Logs

1. Go to your Vercel project dashboard
2. Navigate to Functions
3. Click on your function
4. Check the logs for detailed error messages

### 3. Environment Variable Debug

The updated API routes now include debugging information. Check your Vercel function logs to see:
- Which environment variables are set
- MongoDB connection status
- Detailed error messages

## Step-by-Step Deployment Checklist

- [ ] Set `MONGODB_URI` environment variable on Vercel
- [ ] Set `MONGODB_MAX_POOL_SIZE` environment variable on Vercel
- [ ] Set `MONGODB_SERVER_SELECTION_TIMEOUT_MS` environment variable on Vercel
- [ ] Allow MongoDB Atlas network access from anywhere (0.0.0.0/0)
- [ ] Ensure MongoDB user has proper permissions
- [ ] Test MongoDB connection using `/api/test-mongodb`
- [ ] Check Vercel function logs for errors
- [ ] Deploy and test authentication endpoints

## Quick Fix Commands

If you need to quickly test locally with the same environment variables:

```bash
# Create .env.local file
cp env.example .env.local

# Edit .env.local with your actual MongoDB URI
# Then test locally
npm run dev
```

## Common Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| "MongoDB not configured" | Set MONGODB_URI environment variable |
| "Connection timeout" | Check network access and increase timeout |
| "Authentication failed" | Check username/password in connection string |
| "Network error" | Allow MongoDB Atlas network access from anywhere |

## Need Help?

1. Check the `/api/test-mongodb` endpoint first
2. Review Vercel function logs
3. Verify environment variables are set correctly
4. Ensure MongoDB Atlas is accessible from external connections
