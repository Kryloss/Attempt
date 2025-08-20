# Routing Structure

This document describes the routing structure implemented for the gymNote application using Next.js App Router.

## Overview

The application now uses a clean, organized routing structure that separates authenticated and guest user experiences.

## Route Structure

### Public Routes

- **`/`** - Root page that redirects to `/auth`
- **`/auth`** - Authentication page (sign in, sign up, forgot password)

### Guest Routes

- **`/guest/layout.tsx`** - Layout wrapper for guest pages
- **`/guest/workouts`** - Guest workout mode
- **`/guest/nutrition`** - Guest nutrition mode  
- **`/guest/progress`** - Guest progress mode

### Authenticated Routes

- **`/workouts`** - Main workout dashboard (requires authentication)
- **`/nutrition`** - Main nutrition dashboard (requires authentication)
- **`/progress`** - Main progress dashboard (requires authentication)

## Navigation

### Guest Mode
- Uses a dedicated layout with bottom tab navigation
- Shows "Guest Mode" in header
- Includes "Sign In" button to access full features
- Limited functionality (data not persisted)

### Authenticated Mode
- Uses `AppLayout` component with full features
- Bottom tab navigation between main sections
- User settings and sign out functionality
- Full data persistence and features

## Authentication Flow

1. User visits `/` → redirected to `/auth`
2. User signs in → redirected to `/workouts`
3. User can navigate between `/workouts`, `/nutrition`, `/progress`
4. User can sign out → redirected to `/auth`

## Guest Mode Flow

1. User visits `/auth` → clicks "Continue as Guest"
2. User redirected to `/guest/workouts`
3. User can navigate between guest pages
4. User can click "Sign In" to access full features

## Components

### Core Layout Components
- **`AppLayout.tsx`** - Main authenticated user layout
- **`GuestLayout.tsx`** - Guest user layout
- **`TabNavigation.tsx`** - Reusable tab navigation

### Page Components
- **`app/auth/page.tsx`** - Authentication page
- **`app/workouts/page.tsx`** - Workouts page
- **`app/nutrition/page.tsx`** - Nutrition page
- **`app/progress/page.tsx`** - Progress page
- **`app/guest/*/page.tsx`** - Guest mode pages

## State Management

- User authentication state stored in `localStorage`
- Guest users have limited access to features
- Authenticated users have full access to all features

## Middleware

- Basic route protection implemented
- Public routes (`/auth`, `/guest`) accessible to all
- Protected routes require authentication (handled client-side)

## Usage Examples

### Navigating to Workouts
```typescript
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/workouts')
```

### Checking Current Route
```typescript
import { usePathname } from 'next/navigation'

const pathname = usePathname()
const isWorkoutsPage = pathname === '/workouts'
```

### Guest Mode Access
```typescript
// Redirect to guest workouts
router.push('/guest/workouts')
```

## Future Enhancements

- Server-side authentication validation
- Route guards for better security
- Role-based access control
- Session management improvements
