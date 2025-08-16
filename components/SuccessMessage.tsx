'use client'

interface SuccessMessageProps {
    email: string
    onReset: () => void
}

export default function SuccessMessage({ email, onReset }: SuccessMessageProps) {
    return (
        <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Email Sent Successfully!
                </h2>
                <p className="text-gray-600">
                    We've sent a confirmation email to{' '}
                    <span className="font-semibold text-primary-600">{email}</span>
                </p>
                <p className="text-gray-500 text-sm mt-2">
                    Please check your inbox and spam folder
                </p>
            </div>

            <button
                onClick={onReset}
                className="btn-primary"
            >
                Send Another Email
            </button>
        </div>
    )
}
