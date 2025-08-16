'use client'

import { useState } from 'react'
import EmailForm from '@/components/EmailForm'
import SuccessMessage from '@/components/SuccessMessage'

export default function Home() {
    const [isSuccess, setIsSuccess] = useState(false)
    const [email, setEmail] = useState('')

    const handleSuccess = (userEmail: string) => {
        setEmail(userEmail)
        setIsSuccess(true)
    }

    const handleReset = () => {
        setIsSuccess(false)
        setEmail('')
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Email Confirmation
                    </h1>
                    <p className="text-gray-600">
                        Enter your email to receive a confirmation message
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {!isSuccess ? (
                        <EmailForm onSuccess={handleSuccess} />
                    ) : (
                        <SuccessMessage email={email} onReset={handleReset} />
                    )}
                </div>

                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>Powered by <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Resend</a></p>
                </div>
            </div>
        </main>
    )
}
