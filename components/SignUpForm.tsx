'use client'

import { useState } from 'react'
import { User, AuthFormData } from '@/types/auth'

interface SignUpFormProps {
    onSuccess: (user: User) => void
    onSwitchToSignIn: () => void
    onGuestMode: () => void
}

export default function SignUpForm({ onSuccess, onSwitchToSignIn, onGuestMode }: SignUpFormProps) {
    const [formData, setFormData] = useState<AuthFormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

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
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed')
            }

            setSuccess(true)
            // Call onSuccess after a short delay to show the success message
            setTimeout(() => {
                onSuccess(data.user)
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'An error occurred during signup')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-200 mb-4 text-center">Create Account</h2>

            {error && (
                <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-3 p-2 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs sm:text-sm">Account created successfully! Check your email for confirmation. Redirecting...</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3" style={{ display: success ? 'none' : 'block' }}>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        minLength={3}
                        maxLength={30}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
                        placeholder="Enter username"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
                        placeholder="Enter email"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
                        placeholder="Enter password"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
                        placeholder="Confirm password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-xs sm:text-sm text-purple-500 dark:text-purple-300">
                    Already have an account?{' '}
                    <button
                        onClick={onSwitchToSignIn}
                        className="text-purple-800 font-semibold hover:underline focus:outline-none"
                    >
                        Sign In
                    </button>
                </p>

                <div className="mt-3 pt-3 border-t border-purple-200">
                    <button
                        onClick={onGuestMode}
                        className="w-full text-purple-500 dark:text-purple-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors border-2 border-purple-400 hover:border-purple-500 bg-purple-500/10 shadow-[0_0_16px_rgba(168,85,247,0.35)] text-sm sm:text-base"
                    >
                        Proceed as Guest
                    </button>
                </div>
            </div>
        </div>
    )
}
