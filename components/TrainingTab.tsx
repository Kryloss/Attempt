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
    const [showCalendar, setShowCalendar] = useState(false)
    const [calendarMonth, setCalendarMonth] = useState(new Date())
    const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set())

    // Date switching delay state
    const [isDateSwitchBlocked, setIsDateSwitchBlocked] = useState(false)
    const [dateSwitchDelay, setDateSwitchDelay] = useState(0)
    const dateSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const dateSwitchStartTimeRef = useRef<number>(0)
    const calendarRef = useRef<HTMLDivElement>(null)

    // Mobile drag and drop state
    const [isDragging, setIsDragging] = useState(false)
    const [dragStartY, setDragStartY] = useState(0)
    const [dragStartIndex, setDragStartIndex] = useState(-1)
    const [dragOverIndex, setDragOverIndex] = useState(-1)
    const [touchStartTime, setTouchStartTime] = useState(0)
    const [isLongPress, setIsLongPress] = useState(false)
    const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const touchStartYRef = useRef(0)
    const touchStartXRef = useRef(0)

    // Set preset name when modal opens
    useEffect(() => {
        if (showSavePresetModal && currentTraining) {
            setPresetName(currentTraining.name)
        }
    }, [showSavePresetModal, currentTraining])

    const trainingServiceRef = useRef<TrainingService | null>(null)

    // Helper function to check if training should be saved
    const shouldSaveTraining = (training: Training) => {
        // Always save if there are exercises
        if (training.exercises.length > 0) {
            return true
        }

        // For workouts without exercises, save if the name has been customized
        // (not the default "Workout YYYY-MM-DD" format)
        const isDefaultName = training.name.startsWith('Workout ') && /^\d{4}-\d{2}-\d{2}$/.test(training.name.replace('Workout ', ''))

        // If it's not a default name, it means the user has customized it, so save it
        if (!isDefaultName) {
            return true
        }

        // If it is a default name, don't save it (this prevents saving empty workouts)
        return false
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

    // Cleanup auto-save timeout and long press timeout on unmount
    useEffect(() => {
        return () => {
            if (trainingServiceRef.current) {
                trainingServiceRef.current.clearAutoSaveTimeout()
            }
            if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current)
            }
            if (dateSwitchTimeoutRef.current) {
                clearTimeout(dateSwitchTimeoutRef.current)
            }
            // Restore body styles
            document.body.style.overflow = ''
            document.body.style.touchAction = ''
        }
    }, [])

    // Cleanup scrolling when drag state changes
    useEffect(() => {
        if (!isDragging && !draggedExercise) {
            // Re-enable scrolling when drag ends
            document.body.style.overflow = ''
        }
    }, [isDragging, draggedExercise])

    // Auto-save training data
    useEffect(() => {
        if (currentTraining && user && !user.guest && trainingServiceRef.current) {
            // Only auto-save if training should be saved
            if (shouldSaveTraining(currentTraining)) {
                // Start date switch delay timer
                if (hasUnsavedChanges) {
                    setIsDateSwitchBlocked(true)
                    setDateSwitchDelay(0)
                    dateSwitchStartTimeRef.current = Date.now()

                    // Update delay every 100ms
                    const delayInterval = setInterval(() => {
                        const elapsed = Date.now() - dateSwitchStartTimeRef.current
                        setDateSwitchDelay(elapsed)

                        // If delay exceeds 3 seconds, show red cross and allow switching
                        if (elapsed >= 3000) {
                            setIsDateSwitchBlocked(false)
                            clearInterval(delayInterval)
                        }
                    }, 100)

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

                        // Clear date switch delay
                        setIsDateSwitchBlocked(false)
                        clearInterval(delayInterval)

                        // Trigger dropdown refresh to show updated training names
                        setDropdownRefreshKey(prev => prev + 1)
                    }).catch((error) => {
                        console.error('Auto-save error:', error)
                        setAutoSaveStatus('error')
                        setTimeout(() => setAutoSaveStatus('idle'), 3000)

                        // Clear date switch delay on error
                        setIsDateSwitchBlocked(false)
                        clearInterval(delayInterval)
                    })
                } else {
                    setAutoSaveStatus('idle')
                }
            } else {
                // Don't save trainings with default names and no exercises
                setAutoSaveStatus('idle')
                // Clear date switch delay if no changes to save
                setIsDateSwitchBlocked(false)
            }
        } else if (currentTraining) {
            // Guest mode - only save if training should be saved
            if (shouldSaveTraining(currentTraining)) {
                localStorage.setItem(`training_${currentTraining.date}`, JSON.stringify(currentTraining))
            }
            // Clear date switch delay for guest mode
            setIsDateSwitchBlocked(false)
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
        // Check if date switching is blocked
        if (isDateSwitchBlocked) {
            return
        }

        // If there are unsaved changes, try to save them before navigating
        if (hasUnsavedChanges && currentTraining && user && !user.guest && trainingServiceRef.current) {
            // Force save before navigating to ensure changes persist
            trainingServiceRef.current.saveTraining({
                id: currentTraining.id,
                name: currentTraining.name,
                exercises: currentTraining.exercises,
                date: currentTraining.date
            }).then(() => {
                setHasUnsavedChanges(false)
                // Now navigate to the new date
                const newDate = new Date(currentDate)
                if (direction === 'prev') {
                    newDate.setDate(newDate.getDate() - 1)
                } else {
                    newDate.setDate(newDate.getDate() + 1)
                }
                setCurrentDate(newDate)
            }).catch((error) => {
                console.error('Error saving before navigation:', error)
                // Still navigate even if save fails
                const newDate = new Date(currentDate)
                if (direction === 'prev') {
                    newDate.setDate(newDate.getDate() - 1)
                } else {
                    newDate.setDate(newDate.getDate() + 1)
                }
                setCurrentDate(newDate)
            })
        } else {
            // No unsaved changes, navigate immediately
            const newDate = new Date(currentDate)
            if (direction === 'prev') {
                newDate.setDate(newDate.getDate() - 1)
            } else {
                newDate.setDate(newDate.getDate() + 1)
            }
            setCurrentDate(newDate)
        }
    }

    const handleTrainingNameChange = (name: string) => {
        setTrainingName(name)
        // Don't update currentTraining or trigger auto-save during editing
        // This prevents interruption while typing
    }

    const handleTrainingNameSave = async (name: string) => {
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

            // Force immediate save for name changes to ensure they persist
            if (user && !user.guest && trainingServiceRef.current) {
                try {
                    setAutoSaveStatus('saving')
                    await trainingServiceRef.current.saveTraining({
                        id: updatedTraining.id,
                        name: updatedTraining.name,
                        exercises: updatedTraining.exercises,
                        date: updatedTraining.date
                    })
                    setAutoSaveStatus('saved')
                    setTimeout(() => setAutoSaveStatus('idle'), 2000)
                    setHasUnsavedChanges(false)

                    // Trigger dropdown refresh to show updated training names
                    setDropdownRefreshKey(prev => prev + 1)
                } catch (error) {
                    console.error('Error saving workout name change:', error)
                    setAutoSaveStatus('error')
                    setTimeout(() => setAutoSaveStatus('idle'), 3000)
                }
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

            // Update workout dates for calendar
            updateWorkoutDates(currentTraining.date, preset.exercises.length > 0)

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

            // Update workout dates for calendar
            updateWorkoutDates(currentTraining.date, currentTrainingData.exercises.length > 0)

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

            // Update workout dates for calendar
            if (currentTraining.exercises.length === 0) {
                updateWorkoutDates(currentTraining.date, true)
            }
        }
    }

    const handleDeleteExercise = (exerciseId: string) => {
        if (currentTraining) {
            const newExercises = currentTraining.exercises.filter(ex => ex.id !== exerciseId)
            setCurrentTraining({
                ...currentTraining,
                exercises: newExercises
            })
            setHasUnsavedChanges(true)

            // Update workout dates for calendar
            updateWorkoutDates(currentTraining.date, newExercises.length > 0)
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

    // Mobile-friendly drag and drop handlers
    const handleTouchStart = (e: React.TouchEvent, exercise: Exercise, index: number) => {
        e.preventDefault()
        const touch = e.touches[0]
        touchStartYRef.current = touch.clientY
        touchStartXRef.current = touch.clientX
        setTouchStartTime(Date.now())
        setDragStartIndex(index)

        // Prevent scrolling immediately when touching the exercise
        document.body.style.overflow = 'hidden'
        document.body.style.touchAction = 'none'

        // Start long press timer for mobile drag
        longPressTimeoutRef.current = setTimeout(() => {
            setIsLongPress(true)
            setIsDragging(true)
            setDraggedExercise(exercise)
            setDragStartY(touch.clientY)

            // Add haptic feedback for long press
            if ('vibrate' in navigator) {
                navigator.vibrate(50)
            }
        }, 300) // 300ms delay for long press
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !draggedExercise) return

        e.preventDefault() // Prevent page scrolling
        const touch = e.touches[0]
        const currentY = touch.clientY

        // Find the element under the touch point
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
        if (elementBelow) {
            const exerciseElement = elementBelow.closest('[data-exercise-index]')
            if (exerciseElement) {
                const targetIndex = parseInt(exerciseElement.getAttribute('data-exercise-index') || '0')
                if (targetIndex !== dragOverIndex && targetIndex !== dragStartIndex) {
                    setDragOverIndex(targetIndex)
                }
            }
        }

        // Add haptic feedback on mobile (if supported)
        if ('vibrate' in navigator && dragOverIndex !== -1) {
            navigator.vibrate(10)
        }
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        // Clear long press timer
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current)
            longPressTimeoutRef.current = null
        }

        // If we were dragging, handle the drop
        if (isDragging && draggedExercise && currentTraining && dragOverIndex !== -1) {
            const exercises = [...currentTraining.exercises]
            const draggedIndex = exercises.findIndex(ex => ex.id === draggedExercise.id)

            if (draggedIndex !== -1 && draggedIndex !== dragOverIndex) {
                exercises.splice(draggedIndex, 1)
                exercises.splice(dragOverIndex, 0, draggedExercise)

                setCurrentTraining({
                    ...currentTraining,
                    exercises
                })
                setHasUnsavedChanges(true)
            }
        }

        // Reset drag state
        setIsDragging(false)
        setIsLongPress(false)
        setDraggedExercise(null)
        setDragStartIndex(-1)
        setDragOverIndex(-1)

        // Restore page scrolling
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
    }

    const handleTouchCancel = () => {
        // Clear long press timer
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current)
            longPressTimeoutRef.current = null
        }

        // Reset drag state
        setIsDragging(false)
        setIsLongPress(false)
        setDraggedExercise(null)
        setDragStartIndex(-1)
        setDragOverIndex(-1)

        // Restore page scrolling
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
    }

    // Desktop drag and drop handlers (fallback)
    const handleDragStart = (exercise: Exercise) => {
        setDraggedExercise(exercise)
        // Disable scrolling while dragging
        document.body.style.overflow = 'hidden'
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
        // Re-enable scrolling after drag ends
        document.body.style.overflow = ''
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

            // Clear date switch delay after manual save
            setIsDateSwitchBlocked(false)
            setHasUnsavedChanges(false)

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

    const updateWorkoutDates = (date: string, hasWorkout: boolean) => {
        setWorkoutDates(prev => {
            const newSet = new Set(prev)
            if (hasWorkout) {
                newSet.add(date)
            } else {
                newSet.delete(date)
            }
            return newSet
        })
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

        // Check if this date has workouts
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
    }, [currentDate])

    // Load workout dates for calendar indicators
    useEffect(() => {
        const loadWorkoutDates = async () => {
            const dates = new Set<string>()

            if (!user || user.guest) {
                // For guest users, check localStorage
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    if (key && key.startsWith('training_')) {
                        const dateString = key.replace('training_', '')
                        try {
                            const training = JSON.parse(localStorage.getItem(key) || '{}')
                            if (training.exercises && training.exercises.length > 0) {
                                dates.add(dateString)
                            }
                        } catch (e) {
                            // Skip invalid entries
                        }
                    }
                }
            } else if (trainingServiceRef.current) {
                // For logged-in users, we could fetch workout dates from the database
                // For now, we'll just add the current training date if it has exercises
                if (currentTraining && currentTraining.exercises.length > 0) {
                    dates.add(currentTraining.date)
                }
            }

            setWorkoutDates(dates)
        }

        loadWorkoutDates()
    }, [user, currentTraining])

    return (
        <div className="space-y-2 sm:space-y-3">
            {/* Date Navigation */}
            <div className="bg-white rounded-2xl p-1 sm:p-2 shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-0">
                    <button
                        onClick={() => navigateDate('prev')}
                        disabled={isDateSwitchBlocked}
                        className={`perfect-circle circle-md flex items-center justify-center transition-colors ${isDateSwitchBlocked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                            }`}
                    >
                        {isDateSwitchBlocked && dateSwitchDelay >= 3000 ? (
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
                            className="hover:bg-purple-50 rounded-lg px-2 py-0.5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center justify-center space-x-1">
                                <h2 className={`text-sm sm:text-base font-bold ${isToday(currentDate) ? 'text-purple-600/70' : 'text-purple-800/60'}`}>
                                    {formatDate(currentDate)}
                                </h2>
                                <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>

                        </button>

                        {getRelativeDayLabel() && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-2 text-[10px] sm:text-xs font-medium text-purple-500 pointer-events-none z-20 whitespace-nowrap">
                                {getRelativeDayLabel()}
                            </div>
                        )}

                        {/* Calendar Popup */}
                        {showCalendar && (
                            <div
                                ref={calendarRef}
                                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-white rounded-lg shadow-xl border border-purple-200 p-4 min-w-[280px]"
                            >
                                <div className="flex items-center justify-center mb-3">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => navigateCalendarMonth('prev')}
                                            className="p-1 hover:bg-purple-50 rounded transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <h3 className="text-sm font-semibold text-purple-800">{getMonthName(calendarMonth)}</h3>
                                        <button
                                            onClick={() => navigateCalendarMonth('next')}
                                            className="p-1 hover:bg-purple-50 rounded transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-xs text-center text-gray-500 font-medium py-1">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {generateCalendarDays().map((date, index) => (
                                        <div key={index} className="relative">
                                            <button
                                                onClick={() => handleDateSelect(date)}
                                                className={`w-8 h-8 text-xs rounded-full transition-colors flex items-center justify-center min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] ${isSameDay(date, currentDate)
                                                    ? 'bg-purple-600 text-white'
                                                    : isSameDay(date, new Date())
                                                        ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                                                        : isCurrentMonth(date)
                                                            ? 'text-gray-800 hover:bg-purple-50'
                                                            : 'text-gray-400 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {date.getDate()}
                                            </button>
                                            {/* Purple dot indicator for dates with workouts */}
                                            {hasWorkoutOnDate(date) && (
                                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-600 rounded-full shadow-sm border border-white"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Date Switch Delay Indicator */}
                        {isDateSwitchBlocked && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
                                {dateSwitchDelay < 3000 ? (
                                    <div className="flex items-center space-x-1 text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                                        <div className="w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                                        <span>Saving... ({Math.ceil((3000 - dateSwitchDelay) / 1000)}s)</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-1 text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full border border-red-200">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>Can switch now</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigateDate('next')}
                        disabled={isDateSwitchBlocked}
                        className={`perfect-circle circle-md flex items-center justify-center transition-colors ${isDateSwitchBlocked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                            }`}
                    >
                        {isDateSwitchBlocked && dateSwitchDelay >= 3000 ? (
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
                        workoutDate={currentTraining?.date}
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
            <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-lg border border-purple-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 space-y-2.5 sm:space-y-0">
                    <h3 className="text-lg sm:text-xl font-bold text-purple-800">Exercises</h3>
                    <div className="flex items-center space-x-3">

                        <button
                            onClick={() => setShowAddExercise(true)}
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 sm:px-4 py-1 sm:py-1 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            <span className="flex items-center justify-center sm:justify-start space-x-2">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Add Exercise</span>
                            </span>
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-4 sm:py-6">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-purple-600 text-base sm:text-lg">Loading workout data...</p>
                    </div>
                ) : (
                    <>
                        {currentTraining?.exercises.length === 0 ? (
                            <div className="text-center py-4 sm:py-6">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-7 h-7 sm:w-9 sm:h-9 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-purple-600 text-base sm:text-lg">No exercises yet</p>
                                <p className="text-purple-400 text-sm sm:text-base">Add your first exercise to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-2.5">
                                {currentTraining?.exercises.map((exercise, index) => (
                                    <div
                                        key={exercise.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(exercise)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onTouchStart={(e) => handleTouchStart(e, exercise, index)}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                        onTouchCancel={handleTouchCancel}
                                        onContextMenu={(e) => e.preventDefault()}
                                        onTouchStartCapture={(e) => {
                                            // Immediately prevent scrolling when touching the exercise area
                                            e.preventDefault()
                                            document.body.style.overflow = 'hidden'
                                            document.body.style.touchAction = 'none'
                                        }}
                                        data-exercise-index={index}
                                        className={`cursor-move touch-manipulation drag-transition select-none ${isDragging && dragStartIndex === index
                                            ? 'opacity-50 scale-95 shadow-2xl z-50 dragging'
                                            : ''
                                            } ${dragOverIndex === index && isDragging && dragStartIndex !== index
                                                ? 'border-2 border-purple-400 border-dashed bg-purple-50'
                                                : ''
                                            } ${isLongPress && dragStartIndex === index && !isDragging
                                                ? 'ring-2 ring-purple-400 ring-opacity-50'
                                                : ''
                                            }`}
                                        style={{
                                            transform: isDragging && dragStartIndex === index ? 'rotate(2deg)' : 'none',
                                            zIndex: isDragging && dragStartIndex === index ? 1000 : 'auto'
                                        }}
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

            {/* Mobile Drag Mode Indicator */}
            {isLongPress && !isDragging && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg z-50 animate-pulse">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        <span className="text-sm font-medium">Drag mode active</span>
                    </div>
                </div>
            )}

            {/* Drag Preview Overlay */}
            {isDragging && draggedExercise && (
                <div className="fixed inset-0 pointer-events-none z-40">
                    <div className="absolute bottom-20 right-4 bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg">
                        <div className="text-sm font-medium">Dragging: {draggedExercise.name}</div>
                        <div className="text-xs opacity-75">Drop to reorder</div>
                    </div>
                </div>
            )}
        </div>
    )
}
