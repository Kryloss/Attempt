import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'gymNote - Welcome to Your Fitness Journey',
    description: 'Start your fitness journey with gymNote. Track workouts, monitor nutrition, and achieve your goals with our comprehensive fitness tracking platform.',
}

export default function Home() {
    // Redirect to auth page by default
    redirect('/auth')
}
