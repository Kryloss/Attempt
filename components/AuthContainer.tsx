'use client'

import { useState } from 'react'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import { User } from '@/types/auth'

interface AuthContainerProps {
    onSuccess: (user: User) => void
}

export default function AuthContainer({ onSuccess }: AuthContainerProps) {
    const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot-password'>('signin')

    const handleSwitchToSignUp = () => {
        setAuthMode('signup')
    }

    const handleSwitchToSignIn = () => {
        setAuthMode('signin')
    }

    const handleSwitchToForgotPassword = () => {
        setAuthMode('forgot-password')
    }

    const handleGuestMode = () => {
        const guestUser: User = {
            _id: 'guest',
            username: 'Guest User',
            email: 'guest@example.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            guest: true
        }
        onSuccess(guestUser)
    }

    return (
        <div className="w-full">
            <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-200 dark:border-gray-800 p-6">
                {authMode === 'signup' ? (
                    <SignUpForm
                        onSuccess={onSuccess}
                        onSwitchToSignIn={handleSwitchToSignIn}
                        onGuestMode={handleGuestMode}
                    />
                ) : authMode === 'forgot-password' ? (
                    <ForgotPasswordForm
                        onBackToSignIn={handleSwitchToSignIn}
                    />
                ) : (
                    <SignInForm
                        onSuccess={onSuccess}
                        onSwitchToSignUp={handleSwitchToSignUp}
                        onSwitchToForgotPassword={handleSwitchToForgotPassword}
                        onGuestMode={handleGuestMode}
                    />
                )}
            </div>
        </div>
    )
}
