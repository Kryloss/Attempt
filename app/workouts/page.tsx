import type { Metadata } from 'next'
import WorkoutsPageClient from './WorkoutsPageClient'

export const metadata: Metadata = {
    title: 'Workout Dashboard - gymNote',
    description: 'Track and manage your workouts with gymNote. Log exercises, monitor progress, and optimize your training routine for better results.',
}

export default function WorkoutsPage() {
    return <WorkoutsPageClient />
}
