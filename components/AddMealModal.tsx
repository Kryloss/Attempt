'use client'

import { useState } from 'react'

interface Meal {
    id: string
    name: string
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'brunch' | 'custom'
    foods: any[]
}

interface AddMealModalProps {
    isOpen: boolean
    onClose: () => void
    onAddMeal: (meal: Omit<Meal, 'id' | 'foods'>) => void
}

const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', emoji: '🥞' },
    { id: 'lunch', label: 'Lunch', emoji: '🥗' },
    { id: 'dinner', label: 'Dinner', emoji: '🍽️' },
    { id: 'snack', label: 'Snack', emoji: '🍎' },
    { id: 'brunch', label: 'Brunch', emoji: '🥐' },
    { id: 'custom', label: 'Create Own', emoji: '🍴' }
]

export default function AddMealModal({ isOpen, onClose, onAddMeal }: AddMealModalProps) {
    const [selectedType, setSelectedType] = useState<string>('')
    const [customName, setCustomName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedType) {
            alert('Please select a meal type')
            return
        }

        let mealName = ''
        if (selectedType === 'custom') {
            if (!customName.trim()) {
                alert('Please enter a custom meal name')
                return
            }
            mealName = customName.trim()
        } else {
            const mealType = mealTypes.find(type => type.id === selectedType)
            mealName = mealType?.label || selectedType
        }

        const newMeal = {
            name: mealName,
            type: selectedType as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'brunch' | 'custom'
        }

        onAddMeal(newMeal)

        // Reset form
        setSelectedType('')
        setCustomName('')
        onClose()
    }

    const handleCancel = () => {
        // Reset form
        setSelectedType('')
        setCustomName('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-2">
                    <div className="mb-2">
                        <h2 className="text-base font-bold text-purple-800 dark:text-purple-200">Add Meal</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-1">
                        <div>
                            <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                                Choose Meal Type
                            </label>
                            <div className="grid grid-cols-2 gap-1">
                                {mealTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setSelectedType(type.id)}
                                        className={`p-1.5 rounded-lg border-2 transition-all duration-200 ${selectedType === type.id
                                            ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-600 dark:bg-purple-900/20 dark:text-purple-300'
                                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25 dark:border-gray-700 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-lg mb-0.5">{type.emoji}</div>
                                            <div className="text-xs font-medium text-gray-900 dark:text-gray-100">{type.label}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom meal name input */}
                        {selectedType === 'custom' && (
                            <div>
                                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">
                                    Custom Meal Name
                                </label>
                                <input
                                    type="text"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
                                    placeholder="Enter custom meal name"
                                    required
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-0.5">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 bg-gray-100 text-gray-700 py-1.5 px-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-purple-500 text-white py-1.5 px-3 rounded-lg hover:bg-purple-600 transition-colors font-medium text-xs"
                            >
                                Add Meal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
