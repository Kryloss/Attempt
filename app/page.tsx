'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to authorization page
        router.push('/authorization')
    }, [router])

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </main>
    )
}
