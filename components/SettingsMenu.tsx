'use client'

import { User } from '@/types/auth'

interface SettingsMenuProps {
    user: User
    onSignOut: () => void
    onSignIn: () => void
    onClose: () => void
}

export default function SettingsMenu({ user, onSignOut, onSignIn, onClose }: SettingsMenuProps) {
    const handleSignOut = () => {
        onSignOut()
        onClose()
    }

    const handleSignIn = () => {
        onSignIn()
        onClose()
    }

    return (
        <>
            {/* Dark overlay - covers entire viewport */}
            <div
                className="fixed inset-0 bg-black bg-opacity-60 z-[9999]"
                onClick={onClose}
                style={{ width: '100vw', height: '100vh' }}
            />

            {/* Settings modal - positioned above overlay */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-purple-200 p-4 sm:p-8 min-w-80 max-w-sm sm:max-w-md w-full mx-4 z-[10000] animate-in slide-in-from-bottom-4 duration-300">
                <div className="text-center mb-4 sm:mb-6">
                    <div className="perfect-circle circle-lg bg-purple-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-purple-800">Settings</h3>
                    <p className="text-purple-600 mt-2 text-sm sm:text-base">Manage your account settings</p>
                </div>

                {/* User Information Section */}
                {!user.guest && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="text-center">
                            <div className="perfect-circle circle-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                <span className="text-white text-base sm:text-lg font-bold">
                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <h4 className="font-semibold text-purple-800 text-base sm:text-lg">{user.username}</h4>
                            <p className="text-purple-600 text-xs sm:text-sm">{user.email}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                    {user.guest ? (
                        <button
                            onClick={handleSignIn}
                            className="w-full flex items-center justify-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 text-left text-purple-600 hover:bg-purple-50 rounded-xl transition-colors border-2 border-purple-200 hover:border-purple-300"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-semibold text-base sm:text-lg">Sign In</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors border-2 border-red-200 hover:border-red-300"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-semibold text-base sm:text-lg">Sign Out</span>
                        </button>
                    )}
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 perfect-circle circle-md bg-purple-100 hover:bg-purple-200 text-purple-600 flex items-center justify-center transition-colors"
                >
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </>
    )
}
