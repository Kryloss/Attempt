'use client'

import { useState } from 'react'
import { useWeightUnit } from './WeightUnitContext'

interface Exercise {
    name: string
    sets: number
    reps: number
    weight?: number
    notes?: string
}

interface AddExerciseModalProps {
    onClose: () => void
    onAdd: (exercise: Exercise) => void
}

export default function AddExerciseModal({ onClose, onAdd }: AddExerciseModalProps) {
    const { weightUnit, convertWeight } = useWeightUnit()
    const [formData, setFormData] = useState<Exercise>({
        name: '',
        sets: 3,
        reps: 10,
        weight: undefined,
        notes: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.name.trim() && formData.sets > 0 && formData.reps > 0) {
            // Convert weight from display unit to kg for storage if weight is provided
            const exerciseData = { ...formData }
            if (exerciseData.weight !== undefined && weightUnit === 'lbs') {
                exerciseData.weight = convertWeight(exerciseData.weight, 'lbs', 'kg')
            }
            onAdd(exerciseData)
        }
    }

    const handleInputChange = (field: keyof Exercise, value: string | number | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-2">
                    <div className="mb-2">
                        <h2 className="text-base font-bold text-purple-800 dark:text-purple-200">Add New Exercise</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-1">
                        {/* Exercise Name */}
                        <div>
                            <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">
                                Exercise Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
                                placeholder="e.g., Bench Press, Squats"
                                required
                            />
                        </div>

                        {/* Sets and Reps */}
                        <div className="grid grid-cols-2 gap-1">
                            <div>
                                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">
                                    Sets *
                                </label>
                                <input
                                    type="number"
                                    value={formData.sets}
                                    onChange={(e) => handleInputChange('sets', parseInt(e.target.value.slice(0, 4)) || 0)}
                                    min="1"
                                    max="99"
                                    maxLength={4}
                                    inputMode="numeric"
                                    className="w-full px-1.5 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">
                                    Reps *
                                </label>
                                <input
                                    type="number"
                                    value={formData.reps}
                                    onChange={(e) => handleInputChange('reps', parseInt(e.target.value.slice(0, 4)) || 0)}
                                    min="1"
                                    max="999"
                                    maxLength={4}
                                    inputMode="numeric"
                                    className="w-full px-1.5 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
                                    required
                                />
                            </div>
                        </div>

                        {/* Weight */}
                        <div>
                            <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">
                                Weight ({weightUnit})
                            </label>
                            <input
                                type="text"
                                value={formData.weight || ''}
                                onChange={(e) => {
                                    let value = e.target.value

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

                                    // Store the raw string value temporarily, will be converted to number on submit
                                    setFormData(prev => ({
                                        ...prev,
                                        weight: value ? parseFloat(value) : undefined
                                    }))
                                }}
                                maxLength={7}
                                inputMode="decimal"
                                className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-500"
                                placeholder="Optional"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">
                                Notes (optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={2}
                                className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
                                placeholder="Any additional notes about the exercise..."
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-0.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-100 text-gray-700 py-1.5 px-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!formData.name.trim() || formData.sets <= 0 || formData.reps <= 0}
                                className="flex-1 bg-purple-500 text-white py-1.5 px-3 rounded-lg hover:bg-purple-600 transition-colors font-medium text-xs dark:bg-purple-500/10 dark:text-purple-300 dark:border-2 dark:border-purple-400 dark:hover:bg-purple-500/15 dark:shadow-[0_0_16px_rgba(168,85,247,0.45)] dark:hover:shadow-[0_0_24px_rgba(168,85,247,0.65)]"
                            >
                                Add Exercise
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
