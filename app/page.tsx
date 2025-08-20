'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to auth page by default
        router.push('/auth')
    }, [router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="perfect-circle circle-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <img src="/favicon.svg" alt="gymNote Logo" className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                    gymNote
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Redirecting...
                </p>
            </div>
        </div>
    )
}
