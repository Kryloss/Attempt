# Email Confirmation Website (Gmail SMTP)

A modern, responsive website built with Next.js and Gmail SMTP that allows users to enter their email address and receive a confirmation email.

## Features

- ✨ Beautiful, modern UI with Tailwind CSS
- 📧 Email validation and form handling
- 🚀 Fast API routes with Next.js
- 📱 Responsive design for all devices
- ✅ Success/error state management
- 🔒 Secure email sending with Gmail SMTP

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Email Service**: Gmail SMTP
- **Deployment**: Vercel (recommended)

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (version 18 or higher)
2. **npm** or **yarn** package manager
3. **Gmail account with App Password**

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
# or
yarn install
```

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your Gmail credentials:
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_16_digit_app_password_here
   ```

### 3. Generate a Gmail App Password

1. Enable 2FA on your Google account
2. Go to App Passwords and create a new app password for Mail
3. Copy the 16-character password and paste it into `.env.local`

### 4. Configure Email Sender

Emails will be sent from your `GMAIL_USER` address via Gmail SMTP.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/send-email-gmail/
│   │   └── route.ts          # API endpoint for sending emails via Gmail SMTP
│   ├── globals.css           # Global styles with Tailwind
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Main page component
├── components/
│   ├── EmailForm.tsx         # Email input form
│   └── SuccessMessage.tsx    # Success state component
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## How It Works

1. **User Input**: User enters their email address in the form
2. **Validation**: Email format is validated on both client and server
3. **API Call**: Form submission triggers a POST request to `/api/send-email-gmail`
4. **Email Sending**: Gmail SMTP sends a beautifully formatted confirmation email
5. **Success State**: User sees a success message with their email address
6. **Reset**: User can send another email by clicking the reset button

## Customization

### Email Template

Edit the email template in `app/api/send-email-gmail/route.ts`:
- Modify the HTML content in the `html` field
- Update the plain text in the `text` field
- Change the subject line
- Customize styling and branding

### Styling

- Modify `tailwind.config.js` for theme customization
- Edit `app/globals.css` for custom CSS classes
- Update component styles in individual component files

### Form Validation

- Modify validation logic in `components/EmailForm.tsx`
- Add additional validation rules as needed
- Customize error messages

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Production

Make sure to set these in your production environment:
- `MONGODB_URI`: Your MongoDB connection string (if using email logging)
- `GMAIL_USER`: Your Gmail address
- `GMAIL_APP_PASSWORD`: Your Gmail app password

## Troubleshooting

### Common Issues

1. **"Failed to send email" error**
   - Check your Gmail credentials
   - Ensure 2FA is enabled and using an App Password
   - Review server logs for SMTP errors

2. **Emails not received**
   - Check spam/junk folder
   - Verify the `from` email address is correct
   - Ensure your domain is properly configured

3. **Build errors**
   - Make sure all dependencies are installed
   - Check TypeScript configuration
   - Verify Next.js version compatibility

### Getting Help

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
