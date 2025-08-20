'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import TrainingTab from '@/components/TrainingTab'

export default function GuestWorkoutsPage() {
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
            activeTab="workouts"
            onTabChange={() => { }}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <TrainingTab user={guestUser} />
            </div>
        </AppLayout>
    )
}
