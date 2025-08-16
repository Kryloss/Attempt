'use client'

import { useState } from 'react'

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
            onAdd(formData)
        }
    }

    const handleInputChange = (field: keyof Exercise, value: string | number | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl p-3 sm:p-5 w-full max-w-xs sm:max-w-sm mx-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-purple-800">Add New Exercise</h3>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Exercise Name */}
                    <div>
                        <label className="block text-sm font-medium text-purple-700 mb-1">
                            Exercise Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                            placeholder="e.g., Bench Press, Squats"
                            required
                        />
                    </div>

                    {/* Sets and Reps */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">
                                Sets *
                            </label>
                            <input
                                type="number"
                                value={formData.sets}
                                onChange={(e) => handleInputChange('sets', parseInt(e.target.value) || 0)}
                                min="1"
                                max="99"
                                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">
                                Reps *
                            </label>
                            <input
                                type="number"
                                value={formData.reps}
                                onChange={(e) => handleInputChange('reps', parseInt(e.target.value) || 0)}
                                min="1"
                                max="999"
                                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Weight */}
                    <div>
                        <label className="block text-sm font-medium text-purple-700 mb-1">
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            value={formData.weight || ''}
                            onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                            min="0"
                            step="0.5"
                            className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                            placeholder="Optional"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-purple-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm"
                            placeholder="Any additional notes about the exercise..."
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:flex-1 bg-purple-100 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!formData.name.trim() || formData.sets <= 0 || formData.reps <= 0}
                            className="w-full sm:flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-sm"
                        >
                            Add Exercise
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
