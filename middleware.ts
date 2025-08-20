import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const userAgent = request.headers.get('user-agent') || ''

    // Check if it's a bot (Googlebot, Bingbot, etc.)
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent)

    // Protected routes that require authentication
    const protectedRoutes = ['/workouts', '/nutrition', '/progress']

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // If it's a protected route and not a bot, redirect to auth
    if (isProtectedRoute && !isBot) {
        // Check for user authentication (you can implement your own logic here)
        // For now, we'll let the client-side handle the redirect
        return NextResponse.next()
    }

    // Allow all other requests to proceed
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
         * - public files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
