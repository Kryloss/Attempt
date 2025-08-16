'use client'

import { useState, useEffect, useRef } from 'react'
import ExerciseCard from './ExerciseCard'
import AddExerciseModal from './AddExerciseModal'
import { TrainingService, TrainingData } from '@/lib/training-service'
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
    const [isEditingName, setIsEditingName] = useState(false)
    const [trainingName, setTrainingName] = useState('')
    const [draggedExercise, setDraggedExercise] = useState<Exercise | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

    const trainingServiceRef = useRef<TrainingService | null>(null)

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
            const dateString = currentDate.toISOString().split('T')[0]
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
                    } else {
                        // Create new training for this date
                        const newTraining: Training = {
                            id: Date.now().toString(),
                            name: `Training ${dateString}`,
                            exercises: [],
                            date: dateString
                        }
                        setCurrentTraining(newTraining)
                        setTrainingName(newTraining.name)
                    }
                } else {
                    // Guest mode - use localStorage
                    const existingTraining = localStorage.getItem(`training_${dateString}`)
                    if (existingTraining) {
                        const parsed = JSON.parse(existingTraining)
                        setCurrentTraining(parsed)
                        setTrainingName(parsed.name)
                    } else {
                        const newTraining: Training = {
                            id: Date.now().toString(),
                            name: `Training ${dateString}`,
                            exercises: [],
                            date: dateString
                        }
                        setCurrentTraining(newTraining)
                        setTrainingName(newTraining.name)
                    }
                }
            } catch (error) {
                console.error('Error loading training data:', error)
                // Fallback to creating new training
                const newTraining: Training = {
                    id: Date.now().toString(),
                    name: `Training ${dateString}`,
                    exercises: [],
                    date: dateString
                }
                setCurrentTraining(newTraining)
                setTrainingName(newTraining.name)
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
            // Auto-save to database
            setAutoSaveStatus('saving')
            trainingServiceRef.current.autoSave({
                id: currentTraining.id,
                name: currentTraining.name,
                exercises: currentTraining.exercises,
                date: currentTraining.date
            }).then(() => {
                setAutoSaveStatus('saved')
                setTimeout(() => setAutoSaveStatus('idle'), 2000)
            }).catch((error) => {
                console.error('Auto-save error:', error)
                setAutoSaveStatus('error')
                setTimeout(() => setAutoSaveStatus('idle'), 3000)
            })
        } else if (currentTraining) {
            // Guest mode - save to localStorage
            localStorage.setItem(`training_${currentTraining.date}`, JSON.stringify(currentTraining))
        }
    }, [currentTraining, user])

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)
        if (direction === 'prev') {
            newDate.setDate(newDate.getDate() - 1)
        } else {
            newDate.setDate(newDate.getDate() + 1)
        }
        setCurrentDate(newDate)
    }

    const handleTrainingNameSave = () => {
        if (currentTraining && trainingName.trim()) {
            setCurrentTraining({
                ...currentTraining,
                name: trainingName.trim()
            })
            setIsEditingName(false)
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
            setShowAddExercise(false)
        }
    }

    const handleDeleteExercise = (exerciseId: string) => {
        if (currentTraining) {
            setCurrentTraining({
                ...currentTraining,
                exercises: currentTraining.exercises.filter(ex => ex.id !== exerciseId)
            })
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
            }
        }
        setDraggedExercise(null)
    }

    const handleManualSave = async () => {
        if (!currentTraining || !user || user.guest || !trainingServiceRef.current) {
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
            setAutoSaveStatus('saved')
            setTimeout(() => setAutoSaveStatus('idle'), 2000)
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

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Date Navigation */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigateDate('prev')}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="text-center flex-1 px-2">
                        <h2 className={`text-lg sm:text-xl font-bold ${isToday(currentDate) ? 'text-purple-600' : 'text-purple-800'}`}>
                            {formatDate(currentDate)}
                        </h2>
                        {isToday(currentDate) && (
                            <span className="text-xs sm:text-sm text-purple-500 font-medium">Today</span>
                        )}
                    </div>

                    <button
                        onClick={() => navigateDate('next')}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Training Name */}
                <div className="text-center">
                    {isEditingName ? (
                        <div className="flex items-center justify-center space-x-2">
                            <input
                                type="text"
                                value={trainingName}
                                onChange={(e) => setTrainingName(e.target.value)}
                                onBlur={handleTrainingNameSave}
                                onKeyPress={(e) => e.key === 'Enter' && handleTrainingNameSave()}
                                className="text-lg sm:text-2xl font-bold text-purple-800 bg-transparent border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none text-center w-full max-w-xs"
                                autoFocus
                            />
                            <button
                                onClick={handleTrainingNameSave}
                                className="text-purple-600 hover:text-purple-700 flex-shrink-0"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditingName(true)}
                            className="text-lg sm:text-2xl font-bold text-purple-800 hover:text-purple-600 transition-colors break-words"
                        >
                            {currentTraining?.name || 'Training'}
                        </button>
                    )}

                    {/* Auto-save Status Indicator */}
                    {user && !user.guest && (
                        <div className="mt-2 flex items-center justify-center space-x-2">
                            {autoSaveStatus === 'saving' && (
                                <div className="flex items-center space-x-2 text-xs sm:text-sm text-purple-600">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </div>
                            )}
                            {autoSaveStatus === 'saved' && (
                                <div className="flex items-center space-x-2 text-xs sm:text-sm text-green-600">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Saved</span>
                                </div>
                            )}
                            {autoSaveStatus === 'error' && (
                                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-red-600">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>Save failed</span>
                                    </div>
                                    <button
                                        onClick={() => handleManualSave()}
                                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                            {autoSaveStatus === 'idle' && (
                                <div className="text-xs text-gray-500">
                                    Auto-save enabled
                                </div>
                            )}
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
                        <p className="text-purple-600 text-base sm:text-lg">Loading training data...</p>
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
                                        onDragStart={() => handleDragStart(exercise)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        className="cursor-move"
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
        </div>
    )
}
