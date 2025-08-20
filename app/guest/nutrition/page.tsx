'use client'

import { useState } from 'react'
import NutritionTab from '@/components/NutritionTab'

// Create a guest user object
const guestUser: any = {
    id: 'guest',
    username: 'Guest',
    email: 'guest@example.com',
    guest: true
}

export default function GuestNutritionPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                    Guest Nutrition Mode
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Try out the nutrition features. Sign in to save your data.
                </p>
            </div>

            <NutritionTab />
        </div>
    )
}
