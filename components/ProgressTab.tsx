'use client'

export default function ProgressTab() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-8 shadow-lg border border-purple-100 dark:border-gray-700 text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-purple-300 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
                <span className="text-2xl sm:text-4xl">📊</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-200 mb-3 sm:mb-4">Progress Tracking</h3>
            <p className="text-purple-600 dark:text-purple-300 mb-4 sm:mb-6 text-sm sm:text-base">
                Monitor your fitness progress with detailed charts, measurements, and goal tracking.
            </p>
            <div className="bg-purple-500/5 dark:bg-gray-800 rounded-lg p-3 sm:p-4 border-2 border-purple-300 dark:border-gray-700 shadow-[0_0_16px_rgba(168,85,247,0.25)]">
                <p className="text-purple-500 dark:text-purple-300 text-xs sm:text-sm">
                    🚧 Coming Soon - This feature is currently under development
                </p>
            </div>
        </div>
    )
}
