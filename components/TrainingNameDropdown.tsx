'use client'

import { useState, useEffect, useRef } from 'react'
import { TrainingData, TrainingPresetData } from '@/lib/training-service'

interface TrainingNameDropdownProps {
    trainingName: string
    onNameChange: (name: string) => void
    onNameSave: (name: string) => void
    onLoadPreset: (preset: TrainingPresetData) => void
    onLoadTraining: (training: TrainingData) => void
    onSaveAsPreset: () => void
    user?: any
    trainingService?: any
    exercises?: any[]
}

export default function TrainingNameDropdown({
    trainingName,
    onNameChange,
    onNameSave,
    onLoadPreset,
    onLoadTraining,
    onSaveAsPreset,
    user,
    trainingService,
    exercises = []
}: TrainingNameDropdownProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [presets, setPresets] = useState<TrainingPresetData[]>([])
    const [trainingHistory, setTrainingHistory] = useState<TrainingData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showScrollToTop, setShowScrollToTop] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Helper function to check if training should be saved
    const shouldSaveTraining = (name: string, exercises: any[]) => {
        const isDefaultName = name.startsWith('Workout ') && name.length <= 20
        const hasExercises = exercises.length > 0
        return !isDefaultName || hasExercises
    }

    // Load presets and training history
    useEffect(() => {
        const loadData = async () => {
            if (!user || user.guest || !trainingService) return

            setIsLoading(true)
            try {
                const [presetsData, historyData] = await Promise.all([
                    trainingService.loadPresets(),
                    trainingService.loadTrainingHistory()
                ])

                // Debug logging to see what's happening with training history
                console.log('Raw training history:', historyData)
                const filteredHistory = historyData.filter((training: TrainingData) => training.exercises.length > 0)
                console.log('Filtered training history (with exercises):', filteredHistory)

                setPresets(presetsData)
                setTrainingHistory(historyData)
            } catch (error) {
                console.error('Error loading presets/history:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [user, trainingService])

    // Refresh data when dropdown opens to get latest information
    useEffect(() => {
        if (isDropdownOpen && user && !user.guest && trainingService) {
            const refreshData = async () => {
                try {
                    const [presetsData, historyData] = await Promise.all([
                        trainingService.loadPresets(),
                        trainingService.loadTrainingHistory()
                    ])
                    setPresets(presetsData)
                    setTrainingHistory(historyData)
                } catch (error) {
                    console.error('Error refreshing presets/history:', error)
                }
            }

            refreshData()
        }
    }, [isDropdownOpen, user, trainingService])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handle scroll events to show/hide scroll-to-top button
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        // Prevent scroll event from bubbling up to parent page
        e.stopPropagation()

        if (scrollContainerRef.current) {
            const { scrollTop } = scrollContainerRef.current
            setShowScrollToTop(scrollTop > 100)
        }
    }

    const scrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            })
        }
    }

    // Helper function to format date correctly (fixes timezone issues)
    const formatTrainingDate = (dateString: string) => {
        try {
            // If the date string is already in YYYY-MM-DD format, return it as is
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return dateString
            }

            // Parse the date string and create a Date object
            const date = new Date(dateString)

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                return dateString // Return original string if parsing fails
            }

            // Use UTC methods to avoid timezone conversion issues
            const year = date.getUTCFullYear()
            const month = String(date.getUTCMonth() + 1).padStart(2, '0')
            const day = String(date.getUTCDate()).padStart(2, '0')

            return `${year}-${month}-${day}`
        } catch (error) {
            console.error('Error formatting date:', error)
            return dateString // Return original string if there's an error
        }
    }

    const handleNameSave = () => {
        if (trainingName.trim()) {
            onNameSave(trainingName.trim())
            setIsEditing(false)
        }
    }

    const handleLoadPreset = (preset: TrainingPresetData) => {
        onLoadPreset(preset)
        setIsDropdownOpen(false)
    }

    const handleLoadTraining = (training: TrainingData) => {
        onLoadTraining(training)
        setIsDropdownOpen(false)
    }

    const handleSaveAsPreset = () => {
        onSaveAsPreset()
        setIsDropdownOpen(false)
    }

    const handleDeletePreset = async (presetId: string, presetName: string) => {
        if (!user || user.guest || !trainingService) return

        // Confirm deletion
        if (window.confirm(`Are you sure you want to delete the preset "${presetName}"?`)) {
            try {
                // Call the delete preset method from training service
                await trainingService.deletePreset(presetId)

                // Remove the preset from local state
                setPresets(prevPresets => prevPresets.filter(preset => preset.id !== presetId))
            } catch (error) {
                console.error('Error deleting preset:', error)
                alert('Failed to delete preset. Please try again.')
            }
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-center space-x-2">
                {isEditing ? (
                    <div className="flex items-center justify-center space-x-2">
                        <input
                            type="text"
                            value={trainingName}
                            onChange={(e) => onNameChange(e.target.value)}
                            onBlur={handleNameSave}
                            onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
                            maxLength={20}
                            className="text-lg sm:text-2xl font-bold text-purple-800 bg-transparent border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none text-center w-full max-w-xs"
                            autoFocus
                        />
                        <button
                            onClick={handleNameSave}
                            className="text-purple-600 hover:text-purple-700 flex-shrink-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-lg sm:text-2xl font-bold text-purple-800 hover:text-purple-600 transition-colors break-words"
                        >
                            {trainingName || 'Workout'}
                        </button>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="text-purple-600 hover:text-purple-700 transition-colors flex-shrink-0"
                        >
                            <svg
                                className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 max-h-[28rem] bg-white rounded-lg shadow-xl border border-purple-200 z-50 overflow-hidden isolate dropdown-container">
                    <div className="p-4">
                        <div className="flex items-center justify-center mb-3">
                            <button
                                onClick={handleSaveAsPreset}
                                disabled={!shouldSaveTraining(trainingName, exercises)}
                                className={`px-12 py-2 rounded-lg transition-colors ${!shouldSaveTraining(trainingName, exercises)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                                    }`}
                            >
                                Save Preset
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-4">
                                <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                                <p className="text-sm text-purple-600 mt-2">Loading...</p>
                            </div>
                        ) : (
                            <div
                                ref={scrollContainerRef}
                                onWheel={(e) => {
                                    // Prevent wheel events from bubbling up to parent page
                                    e.stopPropagation()
                                }}
                                onTouchMove={(e) => {
                                    // Prevent touch move events from bubbling up to parent page
                                    e.stopPropagation()
                                }}
                                className="space-y-3 max-h-96 overflow-y-auto preset-scrollbar dropdown-scroll-container pb-4"
                            >
                                {/* Presets Section */}
                                {presets.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                            Presets
                                        </h4>
                                        <div className="space-y-2">
                                            {presets.map((preset) => (
                                                <div key={preset.id} className="relative group">
                                                    <button
                                                        onClick={() => handleLoadPreset(preset)}
                                                        className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                                                    >
                                                        <div className="font-medium text-purple-800 group-hover:text-purple-900">
                                                            {preset.name}
                                                        </div>
                                                        <div className="text-xs text-purple-600 mt-1">
                                                            {preset.exercises.length} exercises
                                                        </div>
                                                    </button>

                                                    {/* Delete button - appears on hover */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            if (preset.id) {
                                                                handleDeletePreset(preset.id, preset.name)
                                                            }
                                                        }}
                                                        className="absolute top-1/2 right-2 transform -translate-y-1/2 perfect-circle bg-red-100 hover:bg-red-200 text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg"
                                                        style={{ '--circle-size': '28px' } as React.CSSProperties}
                                                        title={`Delete preset "${preset.name}"`}
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Workout History Section - Clicking copies the workout to the current date */}
                                {trainingHistory.filter(training => training.exercises.length > 0).length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center" title="Click to copy workout to current date">
                                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                            Previous Workouts
                                        </h4>
                                        <div className="space-y-2">
                                            {trainingHistory
                                                .filter(training => training.exercises.length > 0)
                                                .slice(0, 10)
                                                .map((training) => {
                                                    const isDefaultName = training.name.startsWith('Workout ') && /^\d{4}-\d{2}-\d{2}$/.test(training.name.replace('Workout ', ''))
                                                    return (
                                                        <button
                                                            key={training.id}
                                                            onClick={() => handleLoadTraining(training)}
                                                            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                                                        >
                                                            <div className="font-medium text-blue-800 group-hover:text-blue-900">
                                                                {isDefaultName ? formatTrainingDate(training.date) : training.name}
                                                            </div>
                                                            <div className="text-xs text-blue-600 mt-1">
                                                                {training.exercises.length} exercises{isDefaultName ? '' : ` • ${formatTrainingDate(training.date)}`}
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                        </div>
                                    </div>
                                )}

                                {presets.length === 0 && trainingHistory.filter(training => training.exercises.length > 0).length === 0 && (
                                    <div className="text-center py-4 text-gray-500">
                                        <p className="text-sm">No presets or workouts with exercises found</p>
                                        <p className="text-xs mt-1">Create your first workout with exercises to get started!</p>
                                    </div>
                                )}



                                {/* Extra bottom spacing to ensure last item is visible */}
                                <div className="h-4"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
