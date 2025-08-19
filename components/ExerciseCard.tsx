'use client'

import { useState } from 'react'

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
}

export default function ExerciseCard({ exercise, onDelete, onUpdate }: ExerciseCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [editingField, setEditingField] = useState<string | null>(null)
    const [editValue, setEditValue] = useState<string>('')

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
                parsedValue = numValue
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
                            setEditValue(e.target.value.slice(0, maxLen))
                        }}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyPress}
                        maxLength={field === 'weight' ? 7 : 4}
                        inputMode="numeric"
                        className={`text-lg font-bold text-purple-600 bg-purple-50 border border-purple-300 rounded px-1 py-0.5 text-center ${field === 'weight' ? 'w-20' : 'w-16'} focus:outline-none focus:border-purple-500`}
                        autoFocus
                    />
                    <div className="text-sm text-purple-500 font-medium">{label}</div>
                </div>
            )
        }

        return (
            <div className="text-center" onClick={() => startEditing(field, value)}>
                <div className="inline-block rounded px-5 py-0.5 cursor-pointer hover:bg-purple-50 transition-colors">
                    <div className="text-lg font-bold text-purple-600">
                        {field === 'weight' && value ? `${value}${unit || 'kg'}` : value || '-'}
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
        <div className="bg-white border border-purple-200 rounded-lg p-0 shadow-sm hover:shadow-md transition-all duration-200 hover:border-purple-300 group relative">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="pl-2 pr-1">
                        {editingField === 'name' ? (
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={handleKeyPress}
                                className="text-sm font-bold text-purple-800 bg-transparent focus:outline-none w-full"
                                autoFocus
                            />
                        ) : (
                            <h4
                                className="text-sm font-bold text-purple-800 mb-0 break-words cursor-text"
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
                        {renderEditableValue('weight', exercise.weight || 0, 'Weight', 'kg')}
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
                        className="perfect-circle bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
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
                className="mt-0 pt-0 border-t border-purple-100 flex items-center justify-center touch-manipulation select-none cursor-grab active:cursor-grabbing"
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="flex space-x-1.5 py-0.5">
                    <div className="w-1.5 h-1.5 bg-purple-300/60 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-purple-300/60 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-purple-300/60 rounded-full"></div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-purple-800 mb-4">Delete Exercise</h3>
                        <p className="text-purple-600 mb-6 text-sm sm:text-base">
                            Are you sure you want to delete "{exercise.name}"? This action cannot be undone.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="w-full sm:flex-1 bg-purple-100 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors text-sm sm:text-base"
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
