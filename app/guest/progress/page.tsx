'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import ProgressTab from '@/components/ProgressTab'

export default function GuestProgressPage() {
    const [guestUser] = useState({
        id: 'guest',
        username: 'Guest',
        email: 'guest@example.com',
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
                <ProgressTab />
            </div>
        </AppLayout>
    )
}
