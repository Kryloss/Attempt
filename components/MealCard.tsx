'use client'

import { useState } from 'react'

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

interface Meal {
    id: string
    name: string
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'brunch' | 'custom'
    foods: Food[]
}

interface MealCardProps {
    meal: Meal
    onDelete: (id: string) => void
    onUpdate: (id: string, updatedMeal: Partial<Meal>) => void
    onAddFood: (mealId: string, food: Food) => void
    onRemoveFood: (mealId: string, foodId: string) => void
    onMoveFood?: (fromMealId: string, toMealId: string, food: Food) => void
    onEditFood: (food: Food) => void
    onOpenAddFood?: (mealId: string) => void
    dragHandleProps?: {
        draggable?: boolean
        onDragStart?: (e: React.DragEvent) => void
        onDragEnd?: (e: React.DragEvent) => void
    }
    showAdvanced?: boolean
    showTotals?: boolean
}

export default function MealCard({ meal, onDelete, onUpdate, onAddFood, onRemoveFood, onMoveFood, onEditFood, onOpenAddFood, dragHandleProps, showAdvanced = false, showTotals = true }: MealCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [editingField, setEditingField] = useState<string | null>(null)
    const [editValue, setEditValue] = useState<string>('')

    // Calculate totals for the meal
    const totals = (meal?.foods || []).reduce((acc, food) => ({
        calories: acc.calories + (food?.calories || 0),
        carbs: acc.carbs + (food?.carbs || 0),
        protein: acc.protein + (food?.protein || 0),
        fat: acc.fat + (food?.fat || 0)
    }), { calories: 0, carbs: 0, protein: 0, fat: 0 })

    // Advanced subclass totals for the meal
    const advancedTotals = (meal?.foods || []).reduce((acc, food) => {
        acc.proteinComplete += food.proteinComplete || 0
        acc.proteinIncomplete += food.proteinIncomplete || 0
        acc.carbsSimple += food.carbsSimple || 0
        acc.carbsComplex += food.carbsComplex || 0
        acc.fiber += food.fiber || 0
        acc.fatsUnsaturated += food.fatsUnsaturated || 0
        acc.fatsSaturated += food.fatsSaturated || 0
        acc.fatsTrans += food.fatsTrans || 0
        return acc
    }, { proteinComplete: 0, proteinIncomplete: 0, carbsSimple: 0, carbsComplex: 0, fiber: 0, fatsUnsaturated: 0, fatsSaturated: 0, fatsTrans: 0 })

    const handleDelete = () => {
        onDelete(meal.id)
        setShowDeleteConfirm(false)
    }

    const startEditing = (field: string, currentValue: string) => {
        setEditingField(field)
        setEditValue(currentValue)
    }

    const saveEdit = () => {
        if (!editingField) {
            setEditingField(null)
            setEditValue('')
            return
        }

        if (editingField === 'name') {
            const newName = editValue.trim()
            if (newName !== '') {
                onUpdate(meal.id, { name: newName })
            }
        }

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

    const handleRemoveFood = (foodId: string) => {
        onRemoveFood(meal.id, foodId)
    }

    const handleFoodDragStart = (e: React.DragEvent, food: Food) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            ...food,
            sourceMealId: meal.id
        }))
        e.dataTransfer.effectAllowed = 'move'
    }

    const getMealTypeEmoji = (type: string) => {
        switch (type) {
            case 'breakfast': return '🥞'
            case 'lunch': return '🥗'
            case 'dinner': return '🍽️'
            case 'snack': return '🍎'
            case 'brunch': return '🥐'
            default: return '🍴'
        }
    }

    return (
        <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-gray-700 rounded-lg p-0 shadow-sm hover:shadow-md transition-all duration-200 hover:border-purple-300 dark:hover:border-gray-600 group relative">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    {/* Meal Header */}
                    <div className="pl-2 pr-1 pb-2 border-b border-purple-100 dark:border-gray-800">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">{getMealTypeEmoji(meal.type)}</span>
                            {editingField === 'name' ? (
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={saveEdit}
                                    onKeyDown={handleKeyPress}
                                    className="text-sm font-bold text-purple-800 dark:text-purple-200 bg-transparent focus:outline-none flex-1"
                                    autoFocus
                                />
                            ) : (
                                <h4
                                    className="text-sm font-bold text-purple-800 dark:text-purple-200 mb-0 break-words cursor-text flex-1"
                                    onClick={() => startEditing('name', meal.name)}
                                    title="Click to edit name"
                                >
                                    {meal.name}
                                </h4>
                            )}
                        </div>

                        {/* Meal Totals */}
                        {showTotals && (
                            <div className="grid grid-cols-4 gap-1 text-center">
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded px-2 py-1">
                                    <div className="text-sm font-bold text-purple-500">{totals.calories}</div>
                                    <div className="text-xs text-purple-500">Cal</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded px-2 py-1">
                                    <div className="text-sm font-bold text-green-500">{totals.carbs}g</div>
                                    <div className="text-xs text-green-500">Carbs</div>
                                    {showAdvanced && (
                                        <div className="mt-0.5 grid grid-cols-3 gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-green-500 leading-3 sm:leading-4 scale-90 sm:scale-100 origin-top">
                                            <div>
                                                <div className="text-[8px] sm:text-[9px] text-green-500/80">Simple</div>
                                                <div className="font-semibold">{advancedTotals.carbsSimple.toFixed(1)}g</div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] sm:text-[9px] text-green-500/80">Fiber</div>
                                                <div className="font-semibold">{advancedTotals.fiber.toFixed(1)}g</div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] sm:text-[9px] text-green-500/80">Complex</div>
                                                <div className="font-semibold">{advancedTotals.carbsComplex.toFixed(1)}g</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
                                    <div className="text-sm font-bold text-blue-500">{totals.protein}g</div>
                                    <div className="text-xs text-blue-500">Protein</div>
                                    {showAdvanced && (
                                        <div className="mt-0.5 grid grid-cols-2 gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-blue-500 leading-3 sm:leading-4 scale-90 sm:scale-100 origin-top">
                                            <div>
                                                <div className="text-[8px] sm:text-[9px] text-blue-500/80">Complete</div>
                                                <div className="font-semibold">{advancedTotals.proteinComplete.toFixed(1)}g</div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] sm:text-[9px] text-blue-500/80">Incomplete</div>
                                                <div className="font-semibold">{advancedTotals.proteinIncomplete.toFixed(1)}g</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded px-2 py-1">
                                    <div className="text-sm font-bold text-yellow-500">{totals.fat}g</div>
                                    <div className="text-xs text-yellow-500">Fat</div>
                                    {showAdvanced && (
                                        <div className="mt-0.5 grid grid-cols-3 gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-yellow-500 leading-3 sm:leading-4 scale-90 sm:scale-100 origin-top">
                                            <div>
                                                <div className="text-[8px] sm:text-[9px] text-yellow-500/80">Unsat</div>
                                                <div className="font-semibold">{advancedTotals.fatsUnsaturated.toFixed(1)}g</div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] sm:text-[9px] text-yellow-500/80">Sat</div>
                                                <div className="font-semibold">{advancedTotals.fatsSaturated.toFixed(1)}g</div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] sm:text-[9px] text-yellow-500/80">Trans</div>
                                                <div className="font-semibold">{advancedTotals.fatsTrans.toFixed(1)}g</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Foods List */}
                    <div className="px-2 py-2 space-y-1">
                        {(meal?.foods || []).length === 0 ? (
                            <p className="text-xs text-purple-400 dark:text-purple-300/70 italic text-center py-2">
                                No foods added yet. Drag foods here or use Add Food button.
                            </p>
                        ) : (
                            (meal?.foods || []).map((food) => (
                                <div
                                    key={food.id}
                                    draggable
                                    onDragStart={(e) => handleFoodDragStart(e, food)}
                                    className="flex items-center justify-between bg-purple-50 dark:bg-gray-800 rounded p-1.5 border border-purple-100 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-purple-800 dark:text-purple-200 truncate">{food.name}</div>
                                        <div className="text-xs text-purple-600 dark:text-purple-300">
                                            {food.calories}cal • {food.carbs}c • {food.protein}p • {food.fat}f
                                        </div>
                                        {showAdvanced && (
                                            <div className="mt-0.5">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-[10px]">
                                                    <div className="text-xs text-blue-700 dark:text-blue-300">
                                                        <span className="font-medium">Proteins:</span>
                                                        <span className="ml-1">Complete {food.proteinComplete ?? 0}g</span>
                                                        <span className="ml-1">Incomplete {food.proteinIncomplete ?? 0}g</span>
                                                    </div>
                                                    <div className="text-xs text-green-700 dark:text-green-300">
                                                        <span className="font-medium">Carbs:</span>
                                                        <span className="ml-1">Simple {food.carbsSimple ?? 0}g</span>
                                                        <span className="ml-1">Complex {food.carbsComplex ?? 0}g</span>
                                                        <span className="ml-1">Fiber {food.fiber ?? 0}g</span>
                                                    </div>
                                                    <div className="text-xs text-yellow-700 dark:text-yellow-300">
                                                        <span className="font-medium">Fats:</span>
                                                        <span className="ml-1">Unsat {food.fatsUnsaturated ?? 0}g</span>
                                                        <span className="ml-1">Sat {food.fatsSaturated ?? 0}g</span>
                                                        <span className="ml-1">Trans {food.fatsTrans ?? 0}g</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {food.notes && (
                                            <div className="text-xs text-purple-500 dark:text-purple-300 italic break-words whitespace-normal">{food.notes}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onEditFood(food)}
                                            className="perfect-circle bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 flex items-center justify-center transition-colors"
                                            style={{ '--circle-size': '24px' } as React.CSSProperties}
                                            title="Edit food"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleRemoveFood(food.id)}
                                            className="perfect-circle bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 flex items-center justify-center transition-colors"
                                            style={{ '--circle-size': '24px' } as React.CSSProperties}
                                            title="Delete food"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="absolute top-1 right-1 flex items-center space-x-1">
                    <button
                        onClick={() => onOpenAddFood && onOpenAddFood(meal.id)}
                        className="perfect-circle bg-purple-100 hover:bg-purple-200 text-purple-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-purple-300 flex items-center justify-center transition-colors"
                        style={{ '--circle-size': '28px' } as React.CSSProperties}
                        title="Add food"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
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
                {...(dragHandleProps || {})}
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
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200 mb-4">Delete Meal</h3>
                        <p className="text-purple-600 dark:text-purple-300 mb-6 text-sm sm:text-base">
                            Are you sure you want to delete "{meal.name}"? This action cannot be undone.
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
