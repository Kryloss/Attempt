import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = ['/auth', '/guest']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // If it's a public route, allow access
    if (isPublicRoute) {
        return NextResponse.next()
    }

    // For authenticated routes, check if user is authenticated
    // This is a basic check - you might want to implement more sophisticated auth logic
    if (pathname.startsWith('/workouts') || pathname.startsWith('/nutrition') || pathname.startsWith('/progress')) {
        // In a real app, you'd check for a valid session/token here
        // For now, we'll let the client-side handle the redirect
        return NextResponse.next()
    }

    // Default: allow access
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
