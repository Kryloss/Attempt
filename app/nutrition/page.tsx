import type { Metadata } from 'next'
import NutritionPageClient from './NutritionPageClient'

export const metadata: Metadata = {
    title: 'Nutrition Dashboard - gymNote',
    description: 'Manage your nutrition and food intake with gymNote. Track calories, macros, and nutrients to optimize your fitness performance.',
}

export default function NutritionPage() {
    return <NutritionPageClient />
}
