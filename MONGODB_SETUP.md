# MongoDB Atlas Setup

This project has been configured to use MongoDB Atlas as the database backend.

## What's Been Set Up

### 1. Dependencies Installed
- `mongodb` - Official MongoDB driver for Node.js
- `mongoose` - MongoDB object modeling tool
- `@types/mongodb` - TypeScript definitions

### 2. Database Connection
- **File**: `lib/mongodb.ts`
- **Purpose**: Manages MongoDB connection with connection pooling and caching
- **Features**: 
  - Connection caching to prevent multiple connections during development
  - Error handling for connection failures
  - Environment variable validation

### 3. Data Models
- **User Model** (`models/User.ts`): Stores user information
  - Fields: email, name, timestamps
  - Email validation and uniqueness constraints
  
- **Email Model** (`models/Email.ts`): Tracks email sending history
  - Fields: email, status, sentAt, messageId, error, service
  - Status tracking (sent/failed)
  - Error logging for failed emails

### 4. API Routes
- **`/api/test-db`**: Test database connection and basic CRUD operations
- **`/api/emails`**: Retrieve email statistics and history
- **`/api/send-email-gmail`**: Enhanced to store email records in MongoDB

### 5. Components
- **EmailDashboard**: Displays email statistics and recent email history
- **Integration**: Added to main page alongside email form

### 6. Utility Functions
- **`lib/db-utils.ts`**: Common database operations
  - Email statistics
  - User management
  - Data retrieval helpers

## Environment Variables

Make sure you have the following in your `.env.local` file:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_app_password
```

## MongoDB Atlas Connection String Format

Your connection string should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

## Testing the Setup

1. **Start your development server**: `npm run dev`
2. **Test database connection**: Visit `/api/test-db` in your browser
3. **Send a test email**: Use the email form on the homepage
4. **View dashboard**: Check the email statistics on the left side of the page

## Database Operations

### Creating Records
```typescript
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

await dbConnect();
const user = new User({ email: 'test@example.com', name: 'Test User' });
await user.save();
```

### Querying Records
```typescript
import dbConnect from '@/lib/mongodb';
import Email from '@/models/Email';

await dbConnect();
const emails = await Email.find({ status: 'sent' });
```

### Using Utility Functions
```typescript
import { getEmailStats, getRecentEmails } from '@/lib/db-utils';

const stats = await getEmailStats();
const recentEmails = await getRecentEmails(5);
```

## Features

- **Real-time Statistics**: Email success/failure rates
- **Email History**: Track all sent emails with timestamps
- **Error Logging**: Store failed email attempts with error details
- **Connection Management**: Efficient connection pooling and caching
- **Type Safety**: Full TypeScript support with proper interfaces

## Troubleshooting

### Connection Issues
1. Verify your `MONGODB_URI` is correct
2. Check if your IP is whitelisted in MongoDB Atlas
3. Ensure your database user has proper permissions

### Model Errors
1. Check if models are properly imported
2. Verify schema definitions match your data
3. Ensure database collections exist

### Performance Issues
1. Monitor connection pool usage
2. Check for slow queries
3. Verify indexes are properly set up

## Next Steps

Consider implementing:
- User authentication and sessions
- Email templates stored in database
- Advanced analytics and reporting
- Data backup and recovery procedures
- Rate limiting for email sending
