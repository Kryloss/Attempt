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

    return (
        <div className="w-full">
            {authMode === 'signup' ? (
                <SignUpForm
                    onSuccess={onSuccess}
                    onSwitchToSignIn={handleSwitchToSignIn}
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
                />
            )}
        </div>
    )
}
