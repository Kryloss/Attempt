# Routing Structure

This application uses Next.js App Router for navigation and routing.

## Main Routes

### `/` (Root)
- Redirects to `/auth` by default

### `/auth`
- Authentication page with sign in, sign up, and forgot password forms
- Guest mode option available
- Redirects to `/workouts` after successful authentication

### `/workouts`
- Main workouts/training page for authenticated users
- Requires authentication (redirects to `/auth` if not authenticated)

### `/nutrition`
- Nutrition tracking page for authenticated users
- Requires authentication (redirects to `/auth` if not authenticated)

### `/progress`
- Progress tracking page for authenticated users
- Requires authentication (redirects to `/auth` if not authenticated)

## Guest Routes

### `/guest/workouts`
- Guest mode workouts page
- No authentication required
- Limited functionality for guest users

### `/guest/nutrition`
- Guest mode nutrition page
- No authentication required
- Limited functionality for guest users

### `/guest/progress`
- Guest mode progress page
- No authentication required
- Limited functionality for guest users

## Navigation

- Navigation tabs are displayed in the header for easy switching between sections
- Tabs automatically adjust based on whether the user is in guest mode or authenticated mode
- Active tab is highlighted based on current route

## Authentication Flow

1. User visits any protected route
2. If not authenticated, redirected to `/auth`
3. User can sign in, sign up, or use guest mode
4. After successful authentication, redirected to `/workouts`
5. User can navigate between tabs using the navigation bar

## Guest Mode

- Accessible from the auth page
- Provides limited functionality without requiring account creation
- Redirects to appropriate guest routes
- Can be upgraded to full account by signing in/signing up
