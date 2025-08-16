'use client'

interface SuccessMessageProps {
    email: string
    onReset: () => void
}

export default function SuccessMessage({ email, onReset }: SuccessMessageProps) {
    return (
        <div className="text-center space-y-8">
            {/* Success Icon with enhanced styling */}
            <div className="icon-container mx-auto animate-float glow-purple">
                <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>

            {/* Success Message with enhanced styling */}
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-purple-800 mb-4 font-display gradient-text">
                    Email Sent Successfully!
                </h2>
                <div className="space-y-3">
                    <p className="text-purple-700 text-lg">
                        We've sent a confirmation email to
                    </p>
                    <div className="inline-block bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 rounded-xl border border-purple-300">
                        <span className="font-semibold text-purple-800 text-lg">{email}</span>
                    </div>
                    <p className="text-purple-600 text-base mt-4">
                        Please check your inbox and spam folder
                    </p>
                </div>
            </div>

            {/* Action Button with enhanced styling */}
            <button
                onClick={onReset}
                className="btn-primary text-lg py-4 px-8 glow-purple hover:glow-purple"
            >
                <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span>Send Another Email</span>
                </div>
            </button>
        </div>
    )
}
