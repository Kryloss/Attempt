'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface TabNavigationProps {
    className?: string
}

export default function TabNavigation({ className = '' }: TabNavigationProps) {
    const pathname = usePathname()

    const tabs = [
        { id: 'workouts', label: 'Workout', icon: '💪', path: '/workouts' },
        { id: 'nutrition', label: 'Nutrition', icon: '🥗', path: '/nutrition' },
        { id: 'progress', label: 'Progress', icon: '📊', path: '/progress' }
    ]

    return (
        <nav className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-purple-200 dark:border-gray-800 shadow-lg transition-transform duration-300 neon-surface light-surface ${className}`}>
            <div className="px-4 sm:px-6 py-0.5">
                <div className="flex justify-around">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.path
                        return (
                            <Link
                                key={tab.id}
                                href={tab.path}
                                className={`flex flex-col items-center py-0.5 px-2 sm:px-4 transition-all duration-200 ${isActive
                                        ? 'text-purple-500 transform scale-110'
                                        : 'text-purple-400 hover:text-purple-500'
                                    }`}
                            >
                                <span className="mb-0.5 text-base sm:text-lg">{tab.icon}</span>
                                <span className="text-xs font-medium">{tab.label}</span>
                                {isActive && (
                                    <div className="w-3 sm:w-4 h-0.5 bg-purple-500 rounded-full mt-0.5 animate-pulse"></div>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
