'use client'

import { useState } from 'react'
import { User, AuthFormData } from '@/types/auth'

interface SignInFormProps {
    onSuccess: (user: User) => void
    onSwitchToSignUp: () => void
    onSwitchToForgotPassword: () => void
}

export default function SignInForm({ onSuccess, onSwitchToSignUp, onSwitchToForgotPassword }: SignInFormProps) {
    const [formData, setFormData] = useState<AuthFormData>({
        emailOrUsername: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('') // Clear error when user types
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Sign in failed')
            }

            onSuccess(data.user)
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign in')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Sign In</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="emailOrUsername" className="block text-sm font-medium text-purple-700 mb-1">
                        Email or Username
                    </label>
                    <input
                        type="text"
                        id="emailOrUsername"
                        name="emailOrUsername"
                        value={formData.emailOrUsername}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter email or username"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-purple-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter password"
                    />
                    <div className="mt-2 text-right">
                        <button
                            type="button"
                            onClick={() => onSwitchToForgotPassword()}
                            className="text-sm text-purple-600 hover:underline focus:outline-none"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-purple-600">
                    Don't have an account?{' '}
                    <button
                        onClick={onSwitchToSignUp}
                        className="text-purple-800 font-semibold hover:underline focus:outline-none"
                    >
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    )
}
