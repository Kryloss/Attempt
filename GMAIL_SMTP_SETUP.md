# 🚀 Gmail SMTP Setup Guide

This guide will help you set up Gmail SMTP for sending emails to different accounts on your website.

## ✨ **Features Available**

- ✅ **Send emails to ANY email provider** (Gmail, Yahoo, Outlook, company emails, etc.)
- ✅ **Send emails to ANY domain** (no domain ownership required)
- ✅ **Bulk email sending** to multiple recipients
- ✅ **Account system emails** (verification, password reset, welcome)
- ✅ **Completely free** with no monthly limits
- ✅ **Works with Vercel and MongoDB Atlas**

## 🔧 **Setup Steps**

### **Step 1: Enable 2-Factor Authentication**

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the steps to enable 2FA

### **Step 2: Generate App Password**

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Click "Generate"
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### **Step 3: Set Environment Variables**

Create a `.env.local` file in your project root:

```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_app_password

# MongoDB Configuration (for email logging)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Step 4: Test Configuration**

Visit `/api/test-gmail` to test your Gmail SMTP setup.

## 📧 **API Endpoints**

### **1. Single Email Sending**
```
POST /api/send-email-gmail
```

**Request Body:**
```json
{
  "email": "recipient@example.com",
  "subject": "Custom Subject",
  "html": "<p>Custom HTML content</p>",
  "text": "Custom text content",
  "emailType": "confirmation"
}
```

### **2. Bulk Email Sending**
```
POST /api/send-bulk-email
```

**Request Body:**
```json
{
  "emails": ["user1@example.com", "user2@example.com"],
  "subject": "Bulk Update",
  "html": "<p>Custom HTML content</p>",
  "text": "Custom text content",
  "emailType": "bulk"
}
```

### **3. Test Gmail Connection**
```
GET /api/test-gmail
```

## 🔐 **Future Account System Integration**

The Gmail SMTP service is designed to work seamlessly with future account system features:

### **Verification Emails**
```typescript
const gmailService = new GmailEmailService()
await gmailService.sendVerificationEmail(email, verificationToken)
```

### **Password Reset Emails**
```typescript
await gmailService.sendPasswordResetEmail(email, resetToken)
```

### **Welcome Emails**
```typescript
await gmailService.sendWelcomeEmail(email, username)
```

## ⚠️ **Important Notes**

### **Rate Limits**
- **Daily limit**: ~500 emails/day
- **Rate limiting**: Don't send too many emails too quickly
- **Best practice**: Spread emails over time

### **Security**
- **Never commit** your `.env.local` file to version control
- **App passwords** are more secure than regular passwords
- **2FA required** for app password generation

### **Vercel Deployment**
- Set environment variables in Vercel dashboard
- Gmail SMTP works perfectly with Vercel
- No additional configuration needed

### **MongoDB Atlas**
- Email logs are stored in MongoDB Atlas
- Tracks email delivery status

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Invalid credentials" error**
   - Check that 2FA is enabled
   - Verify app password is correct
   - Ensure GMAIL_USER is correct

2. **"Less secure app access" error**
   - Use app passwords instead of regular passwords
   - App passwords bypass this restriction

3. **Rate limiting errors**
   - Reduce email frequency
   - Spread emails over time
   - Monitor daily limits

### **Testing**

1. **Local testing**: Use `/api/test-gmail`
2. **Check logs**: Monitor console for errors
3. **Verify delivery**: Check recipient inbox
4. **Database logs**: Check MongoDB for email records

## 📊 **Monitoring & Analytics**

### **Email Tracking**
- All emails are logged in MongoDB
- Track success/failure rates
- Monitor which service was used
- Analyze email types and patterns

### **Performance Metrics**
- Delivery success rate
- Response times
- Error patterns

## 🔄 **Fallback Strategy**

Gmail SMTP is configured as the sole email provider in this project. If you need a fallback in the future, you can integrate an alternative service.

## 📞 **Support**

If you encounter issues:

1. Check the test endpoint: `/api/test-gmail`
2. Review environment variables
3. Check MongoDB logs
4. Verify Gmail account settings

---

**🎉 Congratulations!** You now have a robust email system that can send emails to different accounts without any domain requirements, works perfectly with Vercel and MongoDB Atlas, and is ready for your future account system!
