import type { Metadata } from 'next'
import GuestProgressPageClient from './GuestProgressPageClient'

export const metadata: Metadata = {
    title: 'Progress Tracker - gymNote Guest',
    description: 'Track your fitness progress with gymNote. Monitor weight, measurements, and performance metrics to stay motivated and achieve your goals.',
}

export default function GuestProgressPage() {
    return <GuestProgressPageClient />
}
