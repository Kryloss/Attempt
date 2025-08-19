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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-green-800">Add Meal</h2>
                        <button
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-green-700 mb-3">
                                Choose Meal Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {mealTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setSelectedType(type.id)}
                                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${selectedType === type.id
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl mb-1">{type.emoji}</div>
                                            <div className="text-sm font-medium">{type.label}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom meal name input */}
                        {selectedType === 'custom' && (
                            <div>
                                <label className="block text-sm font-medium text-green-700 mb-2">
                                    Custom Meal Name
                                </label>
                                <input
                                    type="text"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter custom meal name"
                                    required
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
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
