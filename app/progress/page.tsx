import type { Metadata } from 'next'
import ProgressPageClient from './ProgressPageClient'

export const metadata: Metadata = {
    title: 'Progress Dashboard - gymNote',
    description: 'Track your fitness progress with gymNote. Monitor weight, measurements, performance metrics, and visualize your journey to success.',
}

export default function ProgressPage() {
    return <ProgressPageClient />
}
