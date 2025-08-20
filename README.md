# GymNote - Your Ultimate Fitness Companion

A modern, responsive fitness tracking application built with Next.js that helps you track workouts, nutrition, and progress. GymNote is your personal workout tracker and fitness companion.

## Features

- 💪 **Workout Tracking**: Log exercises, sets, reps, and weights
- 🥗 **Nutrition Monitoring**: Track meals, calories, and macronutrients
- 📊 **Progress Analytics**: Visualize your fitness journey over time
- 🎯 **Training Presets**: Save and reuse your favorite workout routines
- 📱 **Responsive Design**: Works perfectly on all devices
- 🔒 **User Authentication**: Secure login and registration system
- 📧 **Email Integration**: Gmail SMTP for notifications and confirmations

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: Custom auth system
- **Email Service**: Gmail SMTP
- **Deployment**: Vercel (recommended)

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (version 18 or higher)
2. **npm** or **yarn** package manager
3. **MongoDB database** (local or cloud)
4. **Gmail account with App Password** (for email features)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/yourusername/gymnote.git
cd gymnote

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

2. Edit `.env.local` and add your configuration:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_16_digit_app_password_here
   ```

### 3. Generate a Gmail App Password

1. Enable 2FA on your Google account
2. Go to App Passwords and create a new app password for Mail
3. Copy the 16-character password and paste it into `.env.local`

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/                  # API endpoints
│   │   ├── auth/            # Authentication routes
│   │   ├── nutrition/       # Nutrition tracking
│   │   ├── training/        # Workout management
│   │   └── emails/          # Email functionality
│   ├── authorization/       # Login/signup page
│   ├── workouts/            # Workout tracking interface
│   ├── nutrition/           # Nutrition tracking interface
│   ├── progress/            # Progress analytics
│   └── layout.tsx           # Root layout
├── components/               # Reusable UI components
├── models/                   # Database models
├── lib/                      # Utility functions and services
└── types/                    # TypeScript type definitions
```

## Key Features

### Workout Tracking
- Log exercises with sets, reps, and weights
- Create custom exercise presets
- Track workout history and progress
- Set personal records and goals

### Nutrition Management
- Log meals and snacks
- Track calories and macronutrients
- Search food database (USDA and CNF)
- Monitor daily nutrition goals

### Progress Analytics
- Visualize workout progress over time
- Track strength improvements
- Monitor body composition changes
- Set and achieve fitness milestones

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Production

Make sure to set these in your production environment:
- `MONGODB_URI`: Your MongoDB connection string
- `GMAIL_USER`: Your Gmail address
- `GMAIL_APP_PASSWORD`: Your Gmail app password

## Contributing

We welcome contributions to make GymNote even better! Please feel free to submit issues, feature requests, or pull requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you have any questions or need help with GymNote, please open an issue on GitHub or contact our team.

---

**GymNote** - Your ultimate workout tracker and fitness companion. Start your fitness journey today! 💪
