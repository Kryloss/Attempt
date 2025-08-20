'use client'

import { User } from '@/types/auth'
import { useEffect, useRef, useState } from 'react'

interface SettingsMenuProps {
    user: User
    onSignOut: () => void
    onSignIn: () => void
    onClose: () => void
}

export default function SettingsMenu({ user, onSignOut, onSignIn, onClose }: SettingsMenuProps) {
    const modalRef = useRef<HTMLDivElement>(null)
    const [headerOffset, setHeaderOffset] = useState<number>(64)
    const [advancedNutrition, setAdvancedNutrition] = useState(false)

    // Load and persist Advanced Nutrition setting
    useEffect(() => {
        try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('advanced_nutrition_enabled') : null
            if (stored !== null) {
                setAdvancedNutrition(stored === 'true')
            }
        } catch { }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        const syncHeaderOffset = () => {
            const header = document.getElementById('app-header')
            if (header) {
                setHeaderOffset(header.offsetHeight)
            }
        }

        // Initial measure and on resize to avoid gaps
        syncHeaderOffset()
        window.addEventListener('resize', syncHeaderOffset)

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
            window.removeEventListener('resize', syncHeaderOffset)
        }
    }, [onClose])

    const handleSignOut = () => {
        onSignOut()
        onClose()
    }

    const handleSignIn = () => {
        onSignIn()
        onClose()
    }

    const toggleAdvancedNutrition = () => {
        setAdvancedNutrition(prev => {
            const next = !prev
            try {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('advanced_nutrition_enabled', String(next))
                    window.dispatchEvent(new Event('advancedNutritionSettingChanged'))
                }
            } catch { }
            return next
        })
    }

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
            {/* Backdrop (do not cover top navigation area) */}
            <div
                className="absolute left-0 right-0 bottom-0 bg-black bg-opacity-50 pointer-events-auto"
                style={{ top: headerOffset }}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative bg-white rounded-2xl shadow-2xl border border-purple-200 p-4 sm:p-8 min-w-80 max-w-sm sm:max-w-md w-full pointer-events-auto"
            >
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

                {/* Preferences */}
                <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-purple-800 text-sm sm:text-base">Advanced nutrition breakdown</h4>
                            <p className="text-purple-600 text-xs sm:text-sm">Show macros subclasses (protein, carbs, fats)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={advancedNutrition}
                                onChange={toggleAdvancedNutrition}
                                className="sr-only"
                            />
                            <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedNutrition ? 'bg-purple-600' : 'bg-purple-200'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedNutrition ? 'translate-x-6' : 'translate-x-1'}`} />
                            </span>
                        </label>
                    </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    {user.guest ? (
                        <button
                            onClick={handleSignIn}
                            className="w-full flex items-center justify-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 text-left text-green-600 hover:bg-green-50 rounded-xl transition-colors border-2 border-green-200 hover:border-green-300"
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
            </div>
        </div>
    )
}
