'use client'

import { useState } from 'react'

interface ForgotPasswordFormProps {
    onBackToSignIn: () => void
}

export default function ForgotPasswordForm({ onBackToSignIn }: ForgotPasswordFormProps) {
    const [step, setStep] = useState<'email' | 'code'>('email')
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send verification code')
            }

            setSuccess('Verification code sent successfully! Check your email.')
            setStep('code')
        } catch (err: any) {
            setError(err.message || 'An error occurred while sending the code')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long')
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code, newPassword }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password')
            }

            setSuccess('Password reset successfully! You can now sign in with your new password.')
            setTimeout(() => {
                onBackToSignIn()
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'An error occurred while resetting the password')
        } finally {
            setIsLoading(false)
        }
    }

    if (step === 'code') {
        return (
            <div className="w-full">
                <h2 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4 text-center">Reset Password</h2>

                {success && (
                    <div className="mb-3 p-2 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-3">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-purple-700 mb-1">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            maxLength={6}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                            placeholder="Enter 6-digit code"
                        />
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-purple-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-700 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                    >
                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => setStep('email')}
                        className="text-sm text-purple-600 hover:underline focus:outline-none"
                    >
                        ← Back to email input
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4 text-center">Forgot Password</h2>

            <p className="text-xs sm:text-sm text-gray-600 mb-4 text-center">
                Enter your email address and we'll send you a verification code to reset your password.
            </p>

            {error && (
                <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSendCode} className="space-y-3">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-purple-700 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter your email address"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                    {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <button
                    onClick={onBackToSignIn}
                    className="text-sm text-purple-600 hover:underline focus:outline-none"
                >
                    ← Back to Sign In
                </button>
            </div>
        </div>
    )
}
