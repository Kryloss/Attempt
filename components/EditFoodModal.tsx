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
    proteinComplete?: number
    proteinIncomplete?: number
    carbsSimple?: number
    carbsComplex?: number
    fiber?: number
    fatsUnsaturated?: number
    fatsSaturated?: number
    fatsTrans?: number
    fdcId?: number
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
        notes: '',
        // Advanced subclasses
        fiber: '',
        fatsSaturated: '',
        fatsTrans: '',
        fatsUnsaturated: '',
        carbsSimple: '',
        carbsComplex: '',
        proteinComplete: '',
        proteinIncomplete: ''
    })

    const [advancedEnabled, setAdvancedEnabled] = useState(false)

    // Sync advanced setting
    useEffect(() => {
        const readSetting = () => {
            try {
                const stored = typeof window !== 'undefined' ? localStorage.getItem('advanced_nutrition_enabled') : null
                setAdvancedEnabled(stored === 'true')
            } catch { }
        }
        readSetting()
        const handler = () => readSetting()
        if (typeof window !== 'undefined') {
            window.addEventListener('advancedNutritionSettingChanged', handler)
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('advancedNutritionSettingChanged', handler)
            }
        }
    }, [])

    // Update form data when food prop changes
    useEffect(() => {
        if (food) {
            setFormData({
                name: food.name,
                calories: food.calories.toString(),
                carbs: food.carbs.toString(),
                protein: food.protein.toString(),
                fat: food.fat.toString(),
                notes: food.notes || '',
                fiber: food.fiber?.toString() || '',
                fatsSaturated: food.fatsSaturated?.toString() || '',
                fatsTrans: food.fatsTrans?.toString() || '',
                fatsUnsaturated: food.fatsUnsaturated?.toString() || '',
                carbsSimple: food.carbsSimple?.toString() || '',
                carbsComplex: food.carbsComplex?.toString() || '',
                proteinComplete: food.proteinComplete?.toString() || '',
                proteinIncomplete: food.proteinIncomplete?.toString() || ''
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
            notes: formData.notes.trim() || undefined,
            fiber: formData.fiber.trim() === '' ? undefined : Math.max(0, parseFloat(formData.fiber) || 0),
            fatsSaturated: formData.fatsSaturated.trim() === '' ? undefined : Math.max(0, parseFloat(formData.fatsSaturated) || 0),
            fatsTrans: formData.fatsTrans.trim() === '' ? undefined : Math.max(0, parseFloat(formData.fatsTrans) || 0),
            fatsUnsaturated: formData.fatsUnsaturated.trim() === '' ? undefined : Math.max(0, parseFloat(formData.fatsUnsaturated) || 0),
            carbsSimple: formData.carbsSimple.trim() === '' ? undefined : Math.max(0, parseFloat(formData.carbsSimple) || 0),
            carbsComplex: formData.carbsComplex.trim() === '' ? undefined : Math.max(0, parseFloat(formData.carbsComplex) || 0),
            proteinComplete: formData.proteinComplete.trim() === '' ? undefined : Math.max(0, parseFloat(formData.proteinComplete) || 0),
            proteinIncomplete: formData.proteinIncomplete.trim() === '' ? undefined : Math.max(0, parseFloat(formData.proteinIncomplete) || 0)
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
                notes: food.notes || '',
                fiber: food.fiber?.toString() || '',
                fatsSaturated: food.fatsSaturated?.toString() || '',
                fatsTrans: food.fatsTrans?.toString() || '',
                fatsUnsaturated: food.fatsUnsaturated?.toString() || '',
                carbsSimple: food.carbsSimple?.toString() || '',
                carbsComplex: food.carbsComplex?.toString() || '',
                proteinComplete: food.proteinComplete?.toString() || '',
                proteinIncomplete: food.proteinIncomplete?.toString() || ''
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
                className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-2">
                    <div className="mb-2">
                        <h2 className="text-base font-bold text-purple-800 dark:text-purple-200">Edit Food Item</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-1">
                        {/* Food Name */}
                        <div>
                            <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">
                                Food Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
                                placeholder="e.g., Grilled Chicken Breast"
                                required
                            />
                        </div>

                        {/* Calories */}
                        <div>
                            <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">
                                Calories
                            </label>
                            <input
                                type="number"
                                value={formData.calories}
                                onChange={(e) => handleInputChange('calories', e.target.value)}
                                className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
                                placeholder="0"
                                min="0"
                                step="1"
                            />
                        </div>

                        {/* Macros Row */}
                        <div className="grid grid-cols-3 gap-1">
                            {/* Carbs and subclasses */}
                            <div>
                                <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-0.5">
                                    Carbs (g)
                                </label>
                                <input
                                    type="number"
                                    value={formData.carbs}
                                    onChange={(e) => handleInputChange('carbs', e.target.value)}
                                    className="w-full px-1.5 py-1 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-green-700"
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                />
                                {advancedEnabled && (
                                    <div className="mt-0.5 space-y-0.5">
                                        <div className="grid grid-cols-3 gap-1">
                                            <div>
                                                <label className="block text-[10px] font-medium text-green-700 dark:text-green-300 mb-0.5">Simple</label>
                                                <input
                                                    type="number"
                                                    value={formData.carbsSimple}
                                                    onChange={(e) => handleInputChange('carbsSimple', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-[10px] border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-green-700"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-green-700 dark:text-green-300 mb-0.5">Complex</label>
                                                <input
                                                    type="number"
                                                    value={formData.carbsComplex}
                                                    onChange={(e) => handleInputChange('carbsComplex', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-[10px] border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-green-700"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-green-700 dark:text-green-300 mb-0.5">Fiber</label>
                                                <input
                                                    type="number"
                                                    value={formData.fiber}
                                                    onChange={(e) => handleInputChange('fiber', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-[10px] border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-green-700"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Protein and subclasses */}
                            <div>
                                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5">
                                    Protein (g)
                                </label>
                                <input
                                    type="number"
                                    value={formData.protein}
                                    onChange={(e) => handleInputChange('protein', e.target.value)}
                                    className="w-full px-1.5 py-1 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-700"
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                />
                                {advancedEnabled && (
                                    <div className="mt-0.5 space-y-0.5">
                                        <div className="grid grid-cols-2 gap-1">
                                            <div>
                                                <label className="block text-[10px] font-medium text-blue-700 dark:text-blue-300 mb-0.5">Complete</label>
                                                <input
                                                    type="number"
                                                    value={formData.proteinComplete}
                                                    onChange={(e) => handleInputChange('proteinComplete', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-[10px] border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-700"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5">Incomplete</label>
                                                <input
                                                    type="number"
                                                    value={formData.proteinIncomplete}
                                                    onChange={(e) => handleInputChange('proteinIncomplete', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-[10px] border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-700"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Fats and subclasses */}
                            <div>
                                <label className="block text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-0.5">
                                    Fat (g)
                                </label>
                                <input
                                    type="number"
                                    value={formData.fat}
                                    onChange={(e) => handleInputChange('fat', e.target.value)}
                                    className="w-full px-1.5 py-1 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-yellow-700"
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                />
                                {advancedEnabled && (
                                    <div className="mt-0.5">
                                        <div className="grid grid-cols-3 gap-1">
                                            <div>
                                                <label className="block text-[10px] font-medium text-yellow-700 dark:text-yellow-300 mb-0.5">Unsat</label>
                                                <input
                                                    type="number"
                                                    value={formData.fatsUnsaturated}
                                                    onChange={(e) => handleInputChange('fatsUnsaturated', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 text-[10px] border-yellow-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-yellow-700"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-yellow-700 dark:text-yellow-300 mb-0.5">Sat</label>
                                                <input
                                                    type="number"
                                                    value={formData.fatsSaturated}
                                                    onChange={(e) => handleInputChange('fatsSaturated', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 text-[10px] border-yellow-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-yellow-700"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-yellow-700 dark:text-yellow-300 mb-0.5">Trans</label>
                                                <input
                                                    type="number"
                                                    value={formData.fatsTrans}
                                                    onChange={(e) => handleInputChange('fatsTrans', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 text-[10px] border-yellow-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-yellow-700"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">
                                Notes (optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-purple-700"
                                placeholder="Any additional notes..."
                                rows={2}
                            />
                        </div>

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
                                className="flex-1 bg-purple-500 text-white py-1.5 px-3 rounded-lg hover:bg-purple-600 transition-colors font-medium text-xs dark:bg-purple-600 dark:hover:bg-purple-700"
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
