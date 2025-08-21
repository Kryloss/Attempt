'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useDateContext } from './DateContext'
import TrainingNameDropdown from './TrainingNameDropdown'
import { TrainingService, TrainingData, TrainingPresetData } from '@/lib/training-service'
import { User } from '@/types/auth'

interface Exercise {
    id: string
    name: string
    sets: number
    reps: number
    weight?: number
    notes?: string
}

interface Training {
    id: string
    name: string
    exercises: Exercise[]
    date: string
}

interface DateCardProps {
    user?: User
    showTrainingName?: boolean
    onTrainingNameChange?: (name: string) => void
    onTrainingNameSave?: (name: string) => Promise<void>
    onLoadPreset?: (preset: TrainingPresetData) => void
    onLoadTraining?: (training: TrainingData) => void
    onSaveAsPreset?: () => void
    trainingService?: TrainingService | null
    exercises?: Exercise[]
    workoutDate?: string
    // Optional external highlights for calendar dots (e.g., nutrition)
    highlightDates?: Set<string>
    highlightDotClassName?: string
    children?: ReactNode
}

export default function DateCard({
    user,
    showTrainingName = false,
    onTrainingNameChange,
    onTrainingNameSave,
    onLoadPreset,
    onLoadTraining,
    onSaveAsPreset,
    trainingService,
    exercises = [],
    workoutDate,
    highlightDates,
    highlightDotClassName,
    children
}: DateCardProps) {
    const {
        currentDate,
        setCurrentDate,
        navigateDate,
        isDateSwitchBlocked,
        dateSwitchDelay,
        showCalendar,
        setShowCalendar,
        calendarMonth,
        setCalendarMonth,
        workoutDates,
        setWorkoutDates
    } = useDateContext()

    const [trainingName, setTrainingName] = useState('')
    const [dropdownRefreshKey, setDropdownRefreshKey] = useState(0)
    const calendarRef = useRef<HTMLDivElement>(null)

    // Date switching delay state
    const [isDateSwitchBlockedLocal, setIsDateSwitchBlockedLocal] = useState(false)
    const [dateSwitchDelayLocal, setDateSwitchDelayLocal] = useState(0)
    const dateSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const dateSwitchStartTimeRef = useRef<number>(0)

    // Set training name when exercises change
    useEffect(() => {
        if (exercises.length > 0 && workoutDate) {
            const year = currentDate.getFullYear()
            const month = String(currentDate.getMonth() + 1).padStart(2, '0')
            const day = String(currentDate.getDate()).padStart(2, '0')
            const dateString = `${year}-${month}-${day}`

            if (dateString === workoutDate) {
                setTrainingName(`Workout ${dateString}`)
            }
        }
    }, [exercises, workoutDate, currentDate])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (dateSwitchTimeoutRef.current) {
                clearTimeout(dateSwitchTimeoutRef.current)
            }
        }
    }, [])

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false)
            }
        }

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showCalendar])

    // Sync calendar month with current date
    useEffect(() => {
        setCalendarMonth(currentDate)
    }, [currentDate, setCalendarMonth])

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isYesterday = (date: Date) => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return date.toDateString() === yesterday.toDateString()
    }

    const isTomorrow = (date: Date) => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return date.toDateString() === tomorrow.toDateString()
    }

    const getRelativeDayLabel = () => {
        if (isYesterday(currentDate)) return 'Yesterday'
        if (isToday(currentDate)) return 'Today'
        if (isTomorrow(currentDate)) return 'Tomorrow'
        return ''
    }

    const handleDateClick = () => {
        setShowCalendar(!showCalendar)
    }

    const handleDateSelect = (date: Date) => {
        setCurrentDate(date)
        // Keep calendar open for easier navigation
    }

    const generateCalendarDays = () => {
        const year = calendarMonth.getFullYear()
        const month = calendarMonth.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - firstDay.getDay())

        const days = []
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate)
            date.setDate(startDate.getDate() + i)
            days.push(date)
        }
        return days
    }

    const getMonthName = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.toDateString() === date2.toDateString()
    }

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === calendarMonth.getMonth()
    }

    const hasWorkoutOnDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateString = `${year}-${month}-${day}`

        // Prefer external highlights when provided (e.g., nutrition dates)
        if (highlightDates) {
            return highlightDates.has(dateString)
        }
        // Fallback to context workout dates
        return workoutDates.has(dateString)
    }

    const navigateCalendarMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(calendarMonth)
        if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1)
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1)
        }
        setCalendarMonth(newMonth)
    }

    const handleNavigateDate = (direction: 'prev' | 'next') => {
        // Check if date switching is blocked
        if (isDateSwitchBlocked || isDateSwitchBlockedLocal) {
            return
        }

        // Start date switch delay timer
        setIsDateSwitchBlockedLocal(true)
        setDateSwitchDelayLocal(0)
        dateSwitchStartTimeRef.current = Date.now()

        // Update delay every 100ms
        const delayInterval = setInterval(() => {
            const elapsed = Date.now() - dateSwitchStartTimeRef.current
            setDateSwitchDelayLocal(elapsed)

            // If delay exceeds 3 seconds, show red cross and allow switching
            if (elapsed >= 3000) {
                setIsDateSwitchBlockedLocal(false)
                clearInterval(delayInterval)
            }
        }, 100)

        // Navigate to the new date
        const newDate = new Date(currentDate)
        if (direction === 'prev') {
            newDate.setDate(newDate.getDate() - 1)
        } else {
            newDate.setDate(newDate.getDate() + 1)
        }
        setCurrentDate(newDate)

        // Clear date switch delay after navigation
        setTimeout(() => {
            setIsDateSwitchBlockedLocal(false)
            clearInterval(delayInterval)
        }, 100)
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 sm:p-3 shadow-lg border border-purple-100 dark:border-gray-700 relative z-10">
            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-0">
                <button
                    onClick={() => handleNavigateDate('prev')}
                    disabled={isDateSwitchBlocked || isDateSwitchBlockedLocal}
                    className={`perfect-circle circle-md flex items-center justify-center transition-colors ${(isDateSwitchBlocked || isDateSwitchBlockedLocal)
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'text-purple-500 border-2 border-purple-400 hover:border-purple-500 bg-purple-500/10 shadow-[0_0_18px_rgba(168,85,247,0.35)]'
                        }`}
                >
                    {(isDateSwitchBlocked || isDateSwitchBlockedLocal) && dateSwitchDelayLocal >= 3000 ? (
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    )}
                </button>

                <div className="text-center flex-1 px-2 relative">
                    <button
                        onClick={handleDateClick}
                        className="hover:bg-purple-50 dark:hover:bg-gray-800 rounded-lg px-2 py-0.5 transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center justify-center space-x-1">
                            <h2 className={`text-sm sm:text-base font-bold ${isToday(currentDate) ? 'text-purple-500/80 dark:text-purple-300/80' : 'text-purple-800/60 dark:text-purple-200/60'}`}>
                                {formatDate(currentDate)}
                            </h2>
                            <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </button>

                    {getRelativeDayLabel() && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-2 text-[10px] sm:text-xs font-medium text-purple-500 dark:text-purple-300 pointer-events-none z-20 whitespace-nowrap">
                            {getRelativeDayLabel()}
                        </div>
                    )}

                    {/* Calendar Popup */}
                    {showCalendar && (
                        <div
                            ref={calendarRef}
                            className="fixed left-1/2 top-24 sm:top-28 transform -translate-x-1/2 z-30 isolate pointer-events-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-purple-200 dark:border-gray-700 p-4 min-w-[280px]"
                        >
                            <div className="flex items-center justify-center mb-3">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => navigateCalendarMonth('prev')}
                                        className="p-1 hover:bg-purple-50 rounded transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <h3 className="text-sm font-semibold text-purple-500">{getMonthName(calendarMonth)}</h3>
                                    <button
                                        onClick={() => navigateCalendarMonth('next')}
                                        className="p-1 hover:bg-purple-50 rounded transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {generateCalendarDays().map((date, index) => {
                                    const year = date.getFullYear()
                                    const month = String(date.getMonth() + 1).padStart(2, '0')
                                    const day = String(date.getDate()).padStart(2, '0')
                                    const dateString = `${year}-${month}-${day}`
                                    const showDot = highlightDates ? highlightDates.has(dateString) : workoutDates.has(dateString)
                                    return (
                                        <div key={index} className="relative">
                                            <button
                                                onClick={() => handleDateSelect(date)}
                                                className={`w-8 h-8 text-xs rounded-full transition-colors flex items-center justify-center min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] ${isSameDay(date, currentDate)
                                                    ? 'bg-transparent text-purple-600 dark:text-purple-300 border-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                                                    : isSameDay(date, new Date())
                                                        ? 'bg-transparent text-gray-900 dark:text-white border-2 border-gray-400 dark:border-white/90 shadow-[0_0_10px_rgba(156,163,175,0.75)] dark:shadow-[0_0_10px_rgba(255,255,255,0.85)]'
                                                        : isCurrentMonth(date)
                                                            ? 'text-gray-800 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800'
                                                            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                {date.getDate()}
                                            </button>
                                            {/* Always compute dot visibility based on workoutDates */}
                                            {showDot && (
                                                <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full z-10 pointer-events-none ${highlightDotClassName ? highlightDotClassName : 'bg-purple-600/70 border-2 border-purple-600 shadow-[0_0_16px_rgba(168,85,247,1)]'}`}></div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}


                </div>

                <button
                    onClick={() => handleNavigateDate('next')}
                    disabled={isDateSwitchBlocked || isDateSwitchBlockedLocal}
                    className={`perfect-circle circle-md flex items-center justify-center transition-colors ${(isDateSwitchBlocked || isDateSwitchBlockedLocal)
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'text-purple-500 border-2 border-purple-400 hover:border-purple-500 bg-purple-500/10 shadow-[0_0_18px_rgba(168,85,247,0.35)]'
                        }`}
                >
                    {(isDateSwitchBlocked || isDateSwitchBlockedLocal) && dateSwitchDelayLocal >= 3000 ? (
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Training Name with Dropdown - Only show if requested */}
            {showTrainingName && (
                <div className="text-center">
                    <TrainingNameDropdown
                        key={dropdownRefreshKey}
                        trainingName={trainingName}
                        onNameChange={onTrainingNameChange || (() => { })}
                        onNameSave={onTrainingNameSave || (async () => { })}
                        onLoadPreset={onLoadPreset || (() => { })}
                        onLoadTraining={onLoadTraining || (() => { })}
                        onSaveAsPreset={onSaveAsPreset || (() => { })}
                        user={user}
                        trainingService={trainingService}
                        exercises={exercises}
                        workoutDate={workoutDate}
                    />
                </div>
            )}
            {children && (
                <div className="mt-3">
                    {children}
                </div>
            )}
        </div>
    )
}
