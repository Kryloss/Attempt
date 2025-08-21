'use client'

import { memo, useState } from 'react'
import { useWeightUnit } from './WeightUnitContext'

interface Exercise {
    id: string
    name: string
    sets: number
    reps: number
    weight?: number
    notes?: string
}

interface ExerciseCardProps {
    exercise: Exercise
    onDelete: (id: string) => void
    onUpdate: (id: string, updatedExercise: Partial<Exercise>) => void
    orderIndex?: number
    showOrderBadge?: boolean
}

function ExerciseCard({ exercise, onDelete, onUpdate, orderIndex, showOrderBadge = false }: ExerciseCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [editingField, setEditingField] = useState<string | null>(null)
    const [editValue, setEditValue] = useState<string>('')
    const { weightUnit, convertWeight, formatWeight } = useWeightUnit()

    const handleDelete = () => {
        onDelete(exercise.id)
        setShowDeleteConfirm(false)
    }

    const startEditing = (field: string, currentValue: string | number) => {
        setEditingField(field)
        setEditValue(String(currentValue))
    }

    const saveEdit = () => {
        if (!editingField) {
            setEditingField(null)
            setEditValue('')
            return
        }

        // Name: allow empty? If empty, keep old value (no-op)
        if (editingField === 'name') {
            const newName = editValue.trim()
            if (newName !== '') {
                onUpdate(exercise.id, { name: newName })
            }
            setEditingField(null)
            setEditValue('')
            return
        }

        // Notes: allow empty string to clear the note
        if (editingField === 'notes') {
            const newNotes = editValue.trim()
            onUpdate(exercise.id, { notes: newNotes })
            setEditingField(null)
            setEditValue('')
            return
        }

        // For other fields, require non-empty and validate numbers
        if (editValue.trim() === '') {
            setEditingField(null)
            setEditValue('')
            return
        }

        let parsedValue: string | number = editValue.trim()

        // Parse numeric values
        if (editingField === 'sets' || editingField === 'reps') {
            const numValue = parseInt(editValue)
            if (!isNaN(numValue) && numValue > 0) {
                parsedValue = numValue
            } else {
                setEditingField(null)
                setEditValue('')
                return // Don't save invalid numbers
            }
        } else if (editingField === 'weight') {
            const numValue = parseFloat(editValue)
            if (!isNaN(numValue) && numValue >= 0) {
                // Convert from display unit to kg for storage
                parsedValue = convertWeight(numValue, weightUnit, 'kg')
            } else {
                setEditingField(null)
                setEditValue('')
                return // Don't save invalid numbers
            }
        }

        onUpdate(exercise.id, { [editingField]: parsedValue })
        setEditingField(null)
        setEditValue('')
    }

    const cancelEdit = () => {
        setEditingField(null)
        setEditValue('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveEdit()
        } else if (e.key === 'Escape') {
            cancelEdit()
        }
    }

    const renderEditableValue = (field: string, value: string | number, label: string, unit?: string) => {
        if (editingField === field) {
            return (
                <div className="text-center">
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => {
                            const maxLen = field === 'weight' ? 7 : 4
                            let value = e.target.value

                            // Allow decimal input for weight field
                            if (field === 'weight') {
                                // Allow only numbers and one decimal point
                                value = value.replace(/[^0-9.]/g, '')
                                // Ensure only one decimal point
                                const parts = value.split('.')
                                if (parts.length > 2) {
                                    value = parts[0] + '.' + parts.slice(1).join('')
                                }

                                // Limit to max 4 digits before decimal and 2 after
                                if (parts.length === 2) {
                                    const beforeDecimal = parts[0].slice(0, 4)
                                    const afterDecimal = parts[1].slice(0, 2)
                                    value = beforeDecimal + '.' + afterDecimal
                                } else if (parts.length === 1) {
                                    value = parts[0].slice(0, 4)
                                }
                            }

                            setEditValue(value.slice(0, maxLen))
                        }}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyPress}
                        maxLength={field === 'weight' ? 7 : 4}
                        inputMode={field === 'weight' ? 'decimal' : 'numeric'}
                        className={`text-lg font-bold text-purple-500 bg-purple-50 border border-purple-300 rounded px-1 py-0.5 text-center ${field === 'weight' ? 'w-20' : 'w-16'} focus:outline-none focus:border-purple-500`}
                        autoFocus
                    />
                    <div className="text-sm text-purple-500 font-medium">{label}</div>
                </div>
            )
        }

        return (
            <div className="text-center" onClick={() => {
                if (field === 'weight' && exercise.weight) {
                    // Convert from kg to display unit for editing
                    const displayWeight = convertWeight(exercise.weight, 'kg', weightUnit)
                    startEditing(field, displayWeight)
                } else {
                    startEditing(field, value)
                }
            }}>
                <div className="inline-block rounded px-5 py-0.5 cursor-pointer hover:bg-purple-50 transition-colors">
                    <div className="text-lg font-bold text-purple-500">
                        {field === 'weight' && exercise.weight ? convertWeight(exercise.weight, 'kg', weightUnit) : value || '-'}
                    </div>
                    <div className="text-sm text-purple-500 font-medium">{label}</div>
                </div>
            </div>
        )
    }

    const renderEditableNotes = () => {
        if (editingField === 'notes') {
            return (
                <div className="p-0">
                    <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyPress}
                        className="w-full text-sm text-purple-700 bg-transparent resize-none focus:outline-none whitespace-pre-wrap break-words"
                        rows={1}
                        placeholder="Add notes..."
                        autoFocus
                    />
                </div>
            )
        }

        return (
            <div
                className="cursor-pointer pl-2 pr-1"
                onClick={() => startEditing('notes', exercise.notes || '')}
            >
                {exercise.notes ? (
                    <p className="text-sm text-purple-700 whitespace-pre-wrap break-words">{exercise.notes}</p>
                ) : (
                    <p className="text-sm text-purple-400 italic break-words">Tap to add notes...</p>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-gray-700 rounded-lg p-0 shadow-sm hover:shadow-md transition-all duration-200 hover:border-purple-300 dark:hover:border-gray-600 group relative neon-surface light-surface">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="pl-2 pr-1 relative">
                        {showOrderBadge && typeof orderIndex === 'number' && (
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 select-none border-2 border-purple-400 text-purple-600 bg-transparent shadow-[0_0_10px_rgba(168,85,247,0.45)] dark:text-purple-300 dark:border-purple-400">
                                {orderIndex}
                            </div>
                        )}
                        {editingField === 'name' ? (
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={handleKeyPress}
                                className="text-sm font-bold text-purple-800 dark:text-purple-200 bg-transparent focus:outline-none w-full"
                                autoFocus
                            />
                        ) : (
                            <h4
                                className={`text-sm font-bold text-purple-800 dark:text-purple-200 mb-0 break-words cursor-text ${showOrderBadge ? 'pl-6' : ''}`}
                                onClick={() => startEditing('name', exercise.name)}
                                title="Click to edit name"
                            >
                                {exercise.name}
                            </h4>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-0.5 mb-0">
                        {renderEditableValue('sets', exercise.sets, 'Sets')}
                        {renderEditableValue('reps', exercise.reps, 'Reps')}
                        {renderEditableValue('weight', exercise.weight || 0, weightUnit.toUpperCase(), weightUnit)}
                    </div>

                    <div className="px-0">
                        <div className="w-full">
                            {renderEditableNotes()}
                        </div>
                    </div>
                </div>

                <div className="absolute top-1 right-1 flex flex-col items-end">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="perfect-circle bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 flex items-center justify-center transition-colors"
                        style={{ '--circle-size': '28px' } as React.CSSProperties}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Drag Handle */}
            <div
                className="mt-0 pt-0 border-t border-purple-100 dark:border-gray-800 flex items-center justify-center touch-manipulation select-none cursor-grab active:cursor-grabbing"
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="flex space-x-1.5 py-0.5">
                    <div className="w-1.5 h-1.5 bg-purple-300/60 dark:bg-purple-700/60 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-purple-300/60 dark:bg-purple-700/60 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-purple-300/60 dark:bg-purple-700/60 rounded-full"></div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200 mb-4">Delete Exercise</h3>
                        <p className="text-purple-600 dark:text-purple-300 mb-6 text-sm sm:text-base">
                            Are you sure you want to delete "{exercise.name}"? This action cannot be undone.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="w-full sm:flex-1 bg-purple-100 text-purple-700 dark:bg-gray-800 dark:text-purple-300 py-2 px-4 rounded-lg hover:bg-purple-200 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full sm:flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default memo(ExerciseCard)
