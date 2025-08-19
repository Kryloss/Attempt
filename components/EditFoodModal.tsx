'use client'

import { useState, useEffect } from 'react'

interface Food {
    id: string
    name: string
    calories: number
    carbs: number
    protein: number
    fat: number
    notes?: string
}

interface EditFoodModalProps {
    isOpen: boolean
    food: Food | null
    onClose: () => void
    onSaveFood: (food: Food) => void
}

export default function EditFoodModal({ isOpen, food, onClose, onSaveFood }: EditFoodModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        calories: '',
        carbs: '',
        protein: '',
        fat: '',
        notes: ''
    })

    // Update form data when food prop changes
    useEffect(() => {
        if (food) {
            setFormData({
                name: food.name,
                calories: food.calories.toString(),
                carbs: food.carbs.toString(),
                protein: food.protein.toString(),
                fat: food.fat.toString(),
                notes: food.notes || ''
            })
        }
    }, [food])

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!food) return

        // Validate required fields
        if (!formData.name.trim()) {
            alert('Please enter a food name')
            return
        }

        const calories = parseInt(formData.calories) || 0
        const carbs = parseFloat(formData.carbs) || 0
        const protein = parseFloat(formData.protein) || 0
        const fat = parseFloat(formData.fat) || 0

        if (calories < 0 || carbs < 0 || protein < 0 || fat < 0) {
            alert('Values cannot be negative')
            return
        }

        const updatedFood: Food = {
            ...food,
            name: formData.name.trim(),
            calories,
            carbs,
            protein,
            fat,
            notes: formData.notes.trim() || undefined
        }

        onSaveFood(updatedFood)
        onClose()
    }

    const handleCancel = () => {
        // Reset form to original food data
        if (food) {
            setFormData({
                name: food.name,
                calories: food.calories.toString(),
                carbs: food.carbs.toString(),
                protein: food.protein.toString(),
                fat: food.fat.toString(),
                notes: food.notes || ''
            })
        }
        onClose()
    }

    if (!isOpen || !food) return null

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-2">
                    <div className="mb-2">
                        <h2 className="text-base font-bold text-purple-800">Edit Food Item</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-1">
                        {/* Food Name */}
                        <div>
                            <label className="block text-xs font-medium text-purple-700 mb-0.5">
                                Food Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                                placeholder="e.g., Grilled Chicken Breast"
                                required
                            />
                        </div>

                        {/* Calories */}
                        <div>
                            <label className="block text-xs font-medium text-purple-700 mb-0.5">
                                Calories
                            </label>
                            <input
                                type="number"
                                value={formData.calories}
                                onChange={(e) => handleInputChange('calories', e.target.value)}
                                className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                                placeholder="0"
                                min="0"
                                step="1"
                            />
                        </div>

                        {/* Macros Row */}
                        <div className="grid grid-cols-3 gap-1">
                            <div>
                                <label className="block text-xs font-medium text-green-700 mb-0.5">
                                    Carbs (g)
                                </label>
                                <input
                                    type="number"
                                    value={formData.carbs}
                                    onChange={(e) => handleInputChange('carbs', e.target.value)}
                                    className="w-full px-1.5 py-1 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs"
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-blue-700 mb-0.5">
                                    Protein (g)
                                </label>
                                <input
                                    type="number"
                                    value={formData.protein}
                                    onChange={(e) => handleInputChange('protein', e.target.value)}
                                    className="w-full px-1.5 py-1 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-yellow-700 mb-0.5">
                                    Fat (g)
                                </label>
                                <input
                                    type="number"
                                    value={formData.fat}
                                    onChange={(e) => handleInputChange('fat', e.target.value)}
                                    className="w-full px-1.5 py-1 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-xs"
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-medium text-purple-700 mb-0.5">
                                Notes (optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-xs"
                                placeholder="Any additional notes..."
                                rows={2}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-0.5">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 bg-gray-100 text-gray-700 py-1.5 px-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-purple-500 text-white py-1.5 px-3 rounded-lg hover:bg-purple-600 transition-colors font-medium text-xs"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
