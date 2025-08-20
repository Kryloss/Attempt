'use client'

import { useState } from 'react'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import { User } from '@/types/auth'
import { useRouter } from 'next/navigation'

interface AuthContainerProps {
    onSuccess: (user: User) => void
}

export default function AuthContainer({ onSuccess }: AuthContainerProps) {
    const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot-password'>('signin')
    const router = useRouter()

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
        // Redirect to guest workouts page
        router.push('/guest/workouts')
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
