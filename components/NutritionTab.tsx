'use client'

export default function NutritionTab() {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🥗</span>
            </div>
            <h3 className="text-2xl font-bold text-purple-800 mb-4">Nutrition Tracking</h3>
            <p className="text-purple-600 mb-6">
                Track your daily nutrition, calories, and macros to optimize your fitness journey.
            </p>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <p className="text-purple-500 text-sm">
                    🚧 Coming Soon - This feature is currently under development
                </p>
            </div>
        </div>
    )
}
