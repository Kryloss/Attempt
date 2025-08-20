import type { Metadata } from 'next'
import GuestWorkoutsPageClient from './GuestWorkoutsPageClient'

export const metadata: Metadata = {
    title: 'Workout Tracker - gymNote Guest',
    description: 'Track your workouts and training sessions with gymNote. Log exercises, sets, reps, and monitor your fitness progress.',
}

export default function GuestWorkoutsPage() {
    return <GuestWorkoutsPageClient />
}
