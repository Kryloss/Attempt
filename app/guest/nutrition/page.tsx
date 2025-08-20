import type { Metadata } from 'next'
import GuestNutritionPageClient from './GuestNutritionPageClient'

export const metadata: Metadata = {
    title: 'Nutrition Tracker - gymNote Guest',
    description: 'Track your nutrition and food intake with gymNote. Monitor calories, macros, and nutrients to support your fitness goals.',
}

export default function GuestNutritionPage() {
    return <GuestNutritionPageClient />
}
