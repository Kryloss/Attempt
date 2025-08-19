'use client'

import DateCard from './DateCard'
import { User } from '@/types/auth'

interface NutritionTabProps {
    user?: User
}

export default function NutritionTab({ user }: NutritionTabProps) {
    return (
        <div className="space-y-2 sm:space-y-3">
            {/* Date Navigation */}
            <DateCard user={user} />

            {/* Nutrition Content */}
            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-purple-100 text-center">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <span className="text-2xl sm:text-4xl">🥗</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-purple-800 mb-3 sm:mb-4">Nutrition Tracking</h3>
                <p className="text-purple-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    Track your daily nutrition, calories, and macros to optimize your fitness journey.
                </p>
                <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-100">
                    <p className="text-purple-500 text-xs sm:text-sm">
                        🚧 Coming Soon - This feature is currently under development
                    </p>
                </div>
            </div>
        </div>
    )
}
