'use client'

import { useState, useEffect, useRef } from 'react'
import ExerciseCard from './ExerciseCard'
import AddExerciseModal from './AddExerciseModal'
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

interface TrainingTabProps {
    user?: User
}

export default function TrainingTab({ user }: TrainingTabProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [currentTraining, setCurrentTraining] = useState<Training | null>(null)
    const [showAddExercise, setShowAddExercise] = useState(false)
    const [trainingName, setTrainingName] = useState('')
    const [draggedExercise, setDraggedExercise] = useState<Exercise | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [showSavePresetModal, setShowSavePresetModal] = useState(false)
    const [presetName, setPresetName] = useState('')
    const [dropdownRefreshKey, setDropdownRefreshKey] = useState(0)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // Set preset name when modal opens
    useEffect(() => {
        if (showSavePresetModal && currentTraining) {
            setPresetName(currentTraining.name)
        }
    }, [showSavePresetModal, currentTraining])

    const trainingServiceRef = useRef<TrainingService | null>(null)

    // Helper function to check if training should be saved
    const shouldSaveTraining = (training: Training) => {
        const isDefaultName = training.name.startsWith('Workout ') && training.name.length <= 20
        const hasExercises = training.exercises.length > 0
        return !isDefaultName || hasExercises
    }

    // Initialize training service and load data
    useEffect(() => {
        if (user && !user.guest) {
            const userId = TrainingService.getUserId(user)
            if (userId) {
                trainingServiceRef.current = new TrainingService(userId)
            }
        }
    }, [user])

    // Initialize training for current date
    useEffect(() => {
        const loadTrainingData = async () => {
            // Use timezone-safe date formatting to avoid date shifts
            const year = currentDate.getFullYear()
            const month = String(currentDate.getMonth() + 1).padStart(2, '0')
            const day = String(currentDate.getDate()).padStart(2, '0')
            const dateString = `${year}-${month}-${day}`
            setIsLoading(true)

            try {
                if (user && !user.guest && trainingServiceRef.current) {
                    // Try to load from database first
                    const dbTraining = await trainingServiceRef.current.loadTraining(dateString)

                    if (dbTraining) {
                        const training: Training = {
                            id: dbTraining.id || Date.now().toString(),
                            name: dbTraining.name,
                            exercises: dbTraining.exercises,
                            date: dateString
                        }
                        setCurrentTraining(training)
                        setTrainingName(training.name)
                        setHasUnsavedChanges(false) // Reset change tracking when loading existing data
                    } else {
                        // Create new workout for this date
                        const newTraining: Training = {
                            id: Date.now().toString(),
                            name: `Workout ${dateString}`,
                            exercises: [],
                            date: dateString
                        }
                        setCurrentTraining(newTraining)
                        setTrainingName(newTraining.name)
                        setHasUnsavedChanges(false) // Reset change tracking for new workout
                    }
                } else {
                    // Guest mode - use localStorage
                    const existingTraining = localStorage.getItem(`training_${dateString}`)
                    if (existingTraining) {
                        const parsed = JSON.parse(existingTraining)
                        setCurrentTraining(parsed)
                        setTrainingName(parsed.name)
                        setHasUnsavedChanges(false) // Reset change tracking when loading existing data
                    } else {
                        const newTraining: Training = {
                            id: Date.now().toString(),
                            name: `Workout ${dateString}`,
                            exercises: [],
                            date: dateString
                        }
                        setCurrentTraining(newTraining)
                        setTrainingName(newTraining.name)
                        setHasUnsavedChanges(false) // Reset change tracking for new workout
                    }
                }
            } catch (error) {
                console.error('Error loading workout data:', error)
                // Fallback to creating new workout
                const newTraining: Training = {
                    id: Date.now().toString(),
                    name: `Workout ${dateString}`,
                    exercises: [],
                    date: dateString
                }
                setCurrentTraining(newTraining)
                setTrainingName(newTraining.name)
                setHasUnsavedChanges(false) // Reset change tracking for fallback workout
            } finally {
                setIsLoading(false)
            }
        }

        loadTrainingData()
    }, [currentDate, user])

    // Cleanup auto-save timeout on unmount
    useEffect(() => {
        return () => {
            if (trainingServiceRef.current) {
                trainingServiceRef.current.clearAutoSaveTimeout()
            }
        }
    }, [])

    // Auto-save training data
    useEffect(() => {
        if (currentTraining && user && !user.guest && trainingServiceRef.current) {
            // Only auto-save if training should be saved
            if (shouldSaveTraining(currentTraining)) {
                // Auto-save to database
                setAutoSaveStatus('saving')
                trainingServiceRef.current.autoSave({
                    id: currentTraining.id,
                    name: currentTraining.name,
                    exercises: currentTraining.exercises,
                    date: currentTraining.date
                }).then(() => {
                    if (hasUnsavedChanges) {
                        setAutoSaveStatus('saved')
                        setTimeout(() => setAutoSaveStatus('idle'), 2000)
                    } else {
                        setAutoSaveStatus('idle')
                    }

                    // Trigger dropdown refresh to show updated training names
                    setDropdownRefreshKey(prev => prev + 1)
                }).catch((error) => {
                    console.error('Auto-save error:', error)
                    setAutoSaveStatus('error')
                    setTimeout(() => setAutoSaveStatus('idle'), 3000)
                })
            } else {
                // Don't save trainings with default names and no exercises
                setAutoSaveStatus('idle')
            }
        } else if (currentTraining) {
            // Guest mode - only save if training should be saved
            if (shouldSaveTraining(currentTraining)) {
                localStorage.setItem(`training_${currentTraining.date}`, JSON.stringify(currentTraining))
            }
        }
    }, [currentTraining, user])

    // Update header with auto-save status
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const statusElement = document.getElementById('auto-save-status')
            if (statusElement && user && !user.guest) {
                let statusHTML = ''

                if (autoSaveStatus === 'saving') {
                    statusHTML = `
                        <div class="flex items-center space-x-2 text-xs sm:text-sm text-purple-600">
                            <div class="w-3 h-3 sm:w-4 sm:h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                            <span>Saving...</span>
                        </div>
                    `
                } else if (autoSaveStatus === 'saved') {
                    statusHTML = `
                        <div class="flex items-center space-x-2 text-xs sm:text-sm text-green-600">
                            <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>Saved</span>
                        </div>
                    `
                } else if (autoSaveStatus === 'error') {
                    statusHTML = `
                        <div class="flex items-center space-x-2 text-xs sm:text-sm text-red-600">
                            <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            <span>Save failed</span>
                            <button id="retry-save-btn" class="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors">
                                Retry
                            </button>
                        </div>
                    `

                    // Add retry button functionality after a short delay to ensure DOM is updated
                    setTimeout(() => {
                        const retryBtn = document.getElementById('retry-save-btn')
                        if (retryBtn) {
                            retryBtn.addEventListener('click', handleManualSave)
                        }
                    }, 100)
                } else if (autoSaveStatus === 'idle') {
                    statusHTML = `
                        <div class="text-xs ${hasUnsavedChanges ? 'text-green-600' : 'text-gray-400'}">
                            ✓
                        </div>
                    `
                }

                statusElement.innerHTML = statusHTML
            } else if (statusElement && user?.guest) {
                statusElement.innerHTML = `
                    <div class="text-xs text-yellow-600">
                        Log in to save changes
                    </div>
                `
            } else if (statusElement) {
                statusElement.innerHTML = ''
            }
        }
    }, [autoSaveStatus, currentTraining, user])

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)
        if (direction === 'prev') {
            newDate.setDate(newDate.getDate() - 1)
        } else {
            newDate.setDate(newDate.getDate() + 1)
        }
        setCurrentDate(newDate)
    }

    const handleTrainingNameChange = (name: string) => {
        setTrainingName(name)
        // Don't update currentTraining or trigger auto-save during editing
        // This prevents interruption while typing
    }

    const handleTrainingNameSave = (name: string) => {
        if (currentTraining) {
            // Update the current training with the new name
            const updatedTraining = {
                ...currentTraining,
                name: name
            }
            setCurrentTraining(updatedTraining)
            setTrainingName(name)
            setHasUnsavedChanges(true)

            // If this is an existing workout (not a new one), ensure we keep the original ID
            // This prevents creating duplicate workouts when editing names
            if (currentTraining.id && currentTraining.id !== Date.now().toString()) {
                // Keep the existing ID to ensure we're updating, not creating
                console.log('Updating existing workout:', currentTraining.id, 'with new name:', name)
            }
        }
    }

    const handleLoadPreset = async (preset: TrainingPresetData) => {
        if (currentTraining) {
            // Create a new training for the current date with the preset data
            const updatedTraining = {
                ...currentTraining,
                name: preset.name,
                exercises: [...preset.exercises]
            }

            setCurrentTraining(updatedTraining)
            setTrainingName(preset.name)

            // Auto-save the new training to persist it
            if (user && !user.guest && trainingServiceRef.current) {
                try {
                    await trainingServiceRef.current.saveTraining({
                        id: updatedTraining.id,
                        name: updatedTraining.name,
                        exercises: updatedTraining.exercises,
                        date: updatedTraining.date
                    })

                    // Trigger dropdown refresh to show updated training names
                    setDropdownRefreshKey(prev => prev + 1)
                } catch (error) {
                    console.error('Error saving training after loading preset:', error)
                }
            }
        }
    }

    // Load a previous workout and apply it to the current date (like copying a preset)
    const handleLoadTraining = async (training: TrainingData) => {
        if (currentTraining) {
            // Always load the most current version of the training from the database
            let currentTrainingData = training

            if (user && !user.guest && trainingServiceRef.current) {
                try {
                    // Fetch the latest version of this training from the database
                    const latestTraining = await trainingServiceRef.current.loadTraining(training.date)
                    if (latestTraining) {
                        currentTrainingData = latestTraining
                    }
                } catch (error) {
                    console.error('Error loading latest training data:', error)
                    // Fallback to the training data from history
                }
            }

            // IMPORTANT: Apply the previous workout to the CURRENT date (like presets do)
            // This allows users to copy workouts from other dates to today
            const updatedTraining = {
                ...currentTraining, // Keep current date and ID
                name: currentTrainingData.name,
                exercises: [...currentTrainingData.exercises]
            }

            setCurrentTraining(updatedTraining)
            setTrainingName(currentTrainingData.name)

            // Auto-save the updated training to persist it
            if (user && !user.guest && trainingServiceRef.current) {
                try {
                    await trainingServiceRef.current.saveTraining({
                        id: updatedTraining.id,
                        name: updatedTraining.name,
                        exercises: updatedTraining.exercises,
                        date: updatedTraining.date
                    })

                    // Trigger dropdown refresh to show updated training names
                    setDropdownRefreshKey(prev => prev + 1)
                } catch (error) {
                    console.error('Error saving training after loading from history:', error)
                }
            }
        }
    }

    const handleSaveAsPreset = async () => {
        if (!currentTraining || !user || user.guest || !trainingServiceRef.current) {
            return
        }

        // Only allow saving as preset if training should be saved
        if (!shouldSaveTraining(currentTraining)) {
            console.error('Cannot save default training as preset')
            return
        }

        try {
            const newPresetName = presetName || currentTraining.name

            // Save the preset
            await trainingServiceRef.current.savePreset({
                name: newPresetName,
                exercises: currentTraining.exercises
            })

            // Update the current training name to match the preset name
            if (newPresetName !== currentTraining.name) {
                const updatedTraining = {
                    ...currentTraining,
                    name: newPresetName
                }
                setCurrentTraining(updatedTraining)
                setTrainingName(newPresetName)

                // Save the updated training to persist the name change
                await trainingServiceRef.current.saveTraining({
                    id: updatedTraining.id,
                    name: updatedTraining.name,
                    exercises: updatedTraining.exercises,
                    date: updatedTraining.date
                })

                // Trigger dropdown refresh to show updated training names
                setDropdownRefreshKey(prev => prev + 1)
            }

            setShowSavePresetModal(false)
            setPresetName('')
        } catch (error) {
            console.error('Error saving preset:', error)
        }
    }

    const handleAddExercise = (exercise: Omit<Exercise, 'id'>) => {
        if (currentTraining) {
            const newExercise: Exercise = {
                ...exercise,
                id: Date.now().toString()
            }
            setCurrentTraining({
                ...currentTraining,
                exercises: [...currentTraining.exercises, newExercise]
            })
            setHasUnsavedChanges(true)
            setShowAddExercise(false)
        }
    }

    const handleDeleteExercise = (exerciseId: string) => {
        if (currentTraining) {
            setCurrentTraining({
                ...currentTraining,
                exercises: currentTraining.exercises.filter(ex => ex.id !== exerciseId)
            })
            setHasUnsavedChanges(true)
        }
    }

    const handleUpdateExercise = (exerciseId: string, updatedExercise: Partial<Exercise>) => {
        if (currentTraining) {
            setCurrentTraining({
                ...currentTraining,
                exercises: currentTraining.exercises.map(ex =>
                    ex.id === exerciseId ? { ...ex, ...updatedExercise } : ex
                )
            })
            setHasUnsavedChanges(true)
        }
    }

    const handleDragStart = (exercise: Exercise) => {
        setDraggedExercise(exercise)
    }

    const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault()
        if (draggedExercise && currentTraining) {
            const exercises = [...currentTraining.exercises]
            const draggedIndex = exercises.findIndex(ex => ex.id === draggedExercise.id)

            if (draggedIndex !== -1) {
                exercises.splice(draggedIndex, 1)
                exercises.splice(targetIndex, 0, draggedExercise)

                setCurrentTraining({
                    ...currentTraining,
                    exercises
                })
                setHasUnsavedChanges(true)
            }
        }
        setDraggedExercise(null)
    }

    const handleManualSave = async () => {
        if (!currentTraining || !user || user.guest || !trainingServiceRef.current) {
            return
        }

        // Only save if training should be saved
        if (!shouldSaveTraining(currentTraining)) {
            setAutoSaveStatus('error')
            setTimeout(() => setAutoSaveStatus('idle'), 3000)
            return
        }

        setAutoSaveStatus('saving')
        try {
            await trainingServiceRef.current.saveTraining({
                id: currentTraining.id,
                name: currentTraining.name,
                exercises: currentTraining.exercises,
                date: currentTraining.date
            })
            if (hasUnsavedChanges) {
                setAutoSaveStatus('saved')
                setTimeout(() => setAutoSaveStatus('idle'), 2000)
            } else {
                setAutoSaveStatus('idle')
            }

            // Trigger dropdown refresh to show updated training names
            setDropdownRefreshKey(prev => prev + 1)
        } catch (error) {
            console.error('Manual save failed:', error)
            setAutoSaveStatus('error')
            setTimeout(() => setAutoSaveStatus('idle'), 3000)
        }
    }

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

    return (
        <div className="space-y-2 sm:space-y-3">
            {/* Date Navigation */}
            <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-1">
                    <button
                        onClick={() => navigateDate('prev')}
                        className="perfect-circle circle-md bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="text-center flex-1 px-2 relative">
                        <h2 className={`text-sm sm:text-base font-bold ${isToday(currentDate) ? 'text-purple-600/70' : 'text-purple-800/60'}`}>
                            {formatDate(currentDate)}
                        </h2>
                        {isToday(currentDate) && (
                            <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs text-purple-500 font-medium">Today</span>
                        )}
                        {isYesterday(currentDate) && (
                            <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs text-purple-500 font-medium">Yesterday</span>
                        )}
                        {isTomorrow(currentDate) && (
                            <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs text-purple-500 font-medium">Tomorrow</span>
                        )}
                    </div>

                    <button
                        onClick={() => navigateDate('next')}
                        className="perfect-circle circle-md bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Training Name with Dropdown */}
                <div className="text-center">
                    <TrainingNameDropdown
                        key={dropdownRefreshKey}
                        trainingName={trainingName}
                        onNameChange={handleTrainingNameChange}
                        onNameSave={handleTrainingNameSave}
                        onLoadPreset={handleLoadPreset}
                        onLoadTraining={handleLoadTraining}
                        onSaveAsPreset={() => setShowSavePresetModal(true)}
                        user={user}
                        trainingService={trainingServiceRef.current}
                        exercises={currentTraining?.exercises || []}
                    />

                    {/* Auto-save Status Indicator - Moved to header */}
                    {user && !user.guest && (
                        <div className="mt-1 flex items-center justify-center space-x-2">
                            {/* Status is now displayed in the header */}
                        </div>
                    )}
                </div>
            </div>

            {/* Exercises Section */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-purple-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                    <h3 className="text-lg sm:text-xl font-bold text-purple-800">Exercises</h3>
                    <button
                        onClick={() => setShowAddExercise(true)}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        <span className="flex items-center justify-center sm:justify-start space-x-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Exercise</span>
                        </span>
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-8 sm:py-12">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-purple-600 text-base sm:text-lg">Loading workout data...</p>
                    </div>
                ) : (
                    <>
                        {currentTraining?.exercises.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-purple-600 text-base sm:text-lg">No exercises yet</p>
                                <p className="text-purple-400 text-sm sm:text-base">Add your first exercise to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {currentTraining?.exercises.map((exercise, index) => (
                                    <div
                                        key={exercise.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(exercise)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onTouchStart={(e) => {
                                            // Prevent default to avoid conflicts
                                            e.preventDefault();
                                            handleDragStart(exercise);
                                        }}
                                        onTouchMove={(e) => {
                                            e.preventDefault();
                                            // Handle touch move for mobile drag
                                            const touch = e.touches[0];
                                            if (touch) {
                                                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                                                if (elementBelow) {
                                                    const exerciseElement = elementBelow.closest('[data-exercise-index]');
                                                    if (exerciseElement) {
                                                        const targetIndex = parseInt(exerciseElement.getAttribute('data-exercise-index') || '0');
                                                        if (targetIndex !== index) {
                                                            handleDrop(e as any, targetIndex);
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                        onTouchEnd={(e) => {
                                            e.preventDefault();
                                            setDraggedExercise(null);
                                        }}
                                        data-exercise-index={index}
                                        className="cursor-move touch-manipulation"
                                    >
                                        <ExerciseCard
                                            exercise={exercise}
                                            onDelete={handleDeleteExercise}
                                            onUpdate={handleUpdateExercise}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Exercise Modal */}
            {showAddExercise && (
                <AddExerciseModal
                    onClose={() => setShowAddExercise(false)}
                    onAdd={handleAddExercise}
                />
            )}

            {/* Save as Preset Modal */}
            {showSavePresetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-purple-800 mb-4">Save as Preset</h3>
                        <input
                            type="text"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="Enter preset name"
                            className="w-full p-3 border border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none mb-4"
                            autoFocus
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowSavePresetModal(false)}
                                className="flex-1 px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAsPreset}
                                disabled={!presetName.trim()}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
