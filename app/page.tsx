import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'gymNote - Welcome to Your Fitness Journey',
    description: 'Start your fitness journey with gymNote. Track workouts, monitor nutrition, and achieve your goals with our comprehensive fitness tracking platform.',
    keywords: 'fitness, workout tracker, nutrition tracker, progress tracking, gym, exercise',
    openGraph: {
        title: 'gymNote - Welcome to Your Fitness Journey',
        description: 'Start your fitness journey with gymNote. Track workouts, monitor nutrition, and achieve your goals with our comprehensive fitness tracking platform.',
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'gymNote - Welcome to Your Fitness Journey',
        description: 'Start your fitness journey with gymNote. Track workouts, monitor nutrition, and achieve your goals with our comprehensive fitness tracking platform.',
    },
}

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Welcome to{' '}
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            gymNote
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                        Your comprehensive fitness companion for tracking workouts, monitoring nutrition, and achieving your fitness goals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/auth"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/guest/workouts"
                            className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-8 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-200"
                        >
                            Try Guest Mode
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Workout Tracking</h3>
                        <p className="text-gray-600 dark:text-gray-300">Log your exercises, track sets and reps, and monitor your progress over time.</p>
                    </div>

                    <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nutrition Monitoring</h3>
                        <p className="text-gray-600 dark:text-gray-300">Track your daily nutrition intake with comprehensive food databases and meal planning.</p>
                    </div>

                    <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Progress Analytics</h3>
                        <p className="text-gray-600 dark:text-gray-300">Visualize your fitness journey with detailed charts and progress tracking.</p>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Ready to Transform Your Fitness Journey?
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                        Join thousands of users who are already achieving their fitness goals with gymNote.
                    </p>
                    <Link
                        href="/auth"
                        className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-10 rounded-lg text-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Start Your Journey Today
                    </Link>
                </div>
            </div>
        </div>
    )
}
