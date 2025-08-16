# Email Confirmation Website with Resend

A modern, responsive website built with Next.js and Resend that allows users to enter their email address and receive a confirmation email.

## Features

- ✨ Beautiful, modern UI with Tailwind CSS
- 📧 Email validation and form handling
- 🚀 Fast API routes with Next.js
- 📱 Responsive design for all devices
- ✅ Success/error state management
- 🔒 Secure email sending with Resend

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Email Service**: Resend
- **Deployment**: Vercel (recommended)

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (version 18 or higher)
2. **npm** or **yarn** package manager
3. **Resend account** - [Sign up here](https://resend.com)

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

2. Edit `.env.local` and add your Resend API key:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

### 3. Get Your Resend API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `re_`)
4. Paste it in your `.env.local` file

### 4. Configure Sending Domain

**Option A: Use Resend's default domain (for testing)**
- Update the `from` field in `app/api/send-email/route.ts`:
  ```typescript
  from: 'onboarding@resend.dev', // Resend's default domain
  ```

**Option B: Use your own domain (recommended for production)**
1. Add and verify your domain in [Resend Dashboard](https://resend.com/domains)
2. Update the `from` field in `app/api/send-email/route.ts`:
   ```typescript
   from: 'noreply@yourdomain.com', // Your verified domain
   ```

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
│   ├── api/send-email/
│   │   └── route.ts          # API endpoint for sending emails
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
3. **API Call**: Form submission triggers a POST request to `/api/send-email`
4. **Email Sending**: Resend API sends a beautifully formatted confirmation email
5. **Success State**: User sees a success message with their email address
6. **Reset**: User can send another email by clicking the reset button

## Customization

### Email Template

Edit the email template in `app/api/send-email/route.ts`:
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
- `RESEND_API_KEY`: Your Resend API key

## Troubleshooting

### Common Issues

1. **"Failed to send email" error**
   - Check your Resend API key is correct
   - Ensure your domain is verified (if using custom domain)
   - Check Resend dashboard for any account issues

2. **Emails not received**
   - Check spam/junk folder
   - Verify the `from` email address is correct
   - Ensure your domain is properly configured

3. **Build errors**
   - Make sure all dependencies are installed
   - Check TypeScript configuration
   - Verify Next.js version compatibility

### Getting Help

- [Resend Documentation](https://resend.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
