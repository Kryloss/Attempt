'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import ProgressTab from '@/components/ProgressTab'

export default function GuestProgressPageClient() {
    const [guestUser] = useState({
        _id: 'guest',
        id: 'guest',
        username: 'Guest',
        email: 'guest@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        guest: true
    })

    const handleSignOut = () => {
        // For guest users, redirect to auth page
        window.location.href = '/auth'
    }

    return (
        <AppLayout
            user={guestUser}
            onSignOut={handleSignOut}
            activeTab="progress"
            onTabChange={() => { }}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">

                </h1>
                <ProgressTab />
            </div>
        </AppLayout>
    )
}
