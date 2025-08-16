'use client'

import { useState } from 'react'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'
import { User } from '@/types/auth'

interface AuthContainerProps {
    onSuccess: (user: User) => void
}

export default function AuthContainer({ onSuccess }: AuthContainerProps) {
    const [isSignUp, setIsSignUp] = useState(false)

    const handleSwitchToSignUp = () => {
        setIsSignUp(true)
    }

    const handleSwitchToSignIn = () => {
        setIsSignUp(false)
    }

    return (
        <div className="w-full">
            {isSignUp ? (
                <SignUpForm
                    onSuccess={onSuccess}
                    onSwitchToSignIn={handleSwitchToSignIn}
                />
            ) : (
                <SignInForm
                    onSuccess={onSuccess}
                    onSwitchToSignUp={handleSwitchToSignUp}
                />
            )}
        </div>
    )
}
