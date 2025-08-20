import type { Metadata } from 'next'
import AuthPageClient from './AuthPageClient'

export const metadata: Metadata = {
    title: 'Sign In - gymNote',
    description: 'Sign in to gymNote to access your personalized fitness tracking dashboard. Track workouts, monitor nutrition, and track your progress.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function AuthPage() {
    return <AuthPageClient />
}
