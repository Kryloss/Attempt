'use client'

import { useState, useEffect, useRef } from 'react'
import { useDateContext } from './DateContext'
import DateCard from './DateCard'
import MealCard from './MealCard'
import AddMealModal from './AddMealModal'
import AddFoodModal from './AddFoodModal'
import EditFoodModal from './EditFoodModal'
import { User } from '@/types/auth'
import { useModal } from './ModalContext'
import { NutritionService } from '@/lib/nutrition-service'

interface Food {
    id: string
    name: string
    calories: number
    carbs: number
    protein: number
    fat: number
    notes?: string
}

interface Meal {
    id: string
    name: string
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'brunch' | 'custom'
    foods: Food[]
}

interface NutritionData {
    id: string
    date: string
    meals: Meal[]
    foods: Food[]
}

interface NutritionTabProps {
    user?: User
}

export default function NutritionTab({ user }: NutritionTabProps) {
    const { currentDate } = useDateContext()
    const { openModal, closeModal, openModals } = useModal()

    const [currentNutrition, setCurrentNutrition] = useState<NutritionData | null>(null)
    const [meals, setMeals] = useState<Meal[]>([])
    const [foods, setFoods] = useState<Food[]>([])
    const [showAddMealModal, setShowAddMealModal] = useState(false)
    const [showAddFoodModal, setShowAddFoodModal] = useState(false)
    const [showEditFoodModal, setShowEditFoodModal] = useState(false)
    const [editingFood, setEditingFood] = useState<Food | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const nutritionServiceRef = useRef<NutritionService | null>(null)

    // Initialize nutrition service
    useEffect(() => {
        if (user && !user.guest) {
            const userId = NutritionService.getUserId(user)
            if (userId) {
                nutritionServiceRef.current = new NutritionService(userId)
            }
        } else {
            nutritionServiceRef.current = null
        }
    }, [user])

    // Calculate daily totals
    const dailyTotals = (meals || []).reduce((acc, meal) => {
        // Ensure meal.foods exists and is an array
        const foods = meal?.foods || []
        const mealTotals = foods.reduce((mealAcc, food) => ({
            calories: mealAcc.calories + (food?.calories || 0),
            carbs: mealAcc.carbs + (food?.carbs || 0),
            protein: mealAcc.protein + (food?.protein || 0),
            fat: mealAcc.fat + (food?.fat || 0)
        }), { calories: 0, carbs: 0, protein: 0, fat: 0 })

        return {
            calories: acc.calories + mealTotals.calories,
            carbs: acc.carbs + mealTotals.carbs,
            protein: acc.protein + mealTotals.protein,
            fat: acc.fat + mealTotals.fat
        }
    }, { calories: 0, carbs: 0, protein: 0, fat: 0 })

    // Initialize nutrition data for current date
    useEffect(() => {
        const loadNutritionData = async () => {
            // Use timezone-safe date formatting to avoid date shifts
            const year = currentDate.getFullYear()
            const month = String(currentDate.getMonth() + 1).padStart(2, '0')
            const day = String(currentDate.getDate()).padStart(2, '0')
            const dateString = `${year}-${month}-${day}`
            setIsLoading(true)

            try {
                if (user && !user.guest && nutritionServiceRef.current) {
                    // Load from server for logged-in users
                    const dbNutrition = await nutritionServiceRef.current.loadNutrition(dateString)
                    if (dbNutrition) {
                        const loaded: NutritionData = {
                            id: dbNutrition.id || Date.now().toString(),
                            date: dbNutrition.date,
                            meals: dbNutrition.meals || [],
                            foods: dbNutrition.foods || []
                        }
                        setCurrentNutrition(loaded)
                        setMeals(loaded.meals)
                        setFoods(loaded.foods)
                        setHasUnsavedChanges(false)
                    } else {
                        // Try migrating any existing local data for this date
                        const localKey = `nutrition_${user._id || 'guest'}_${dateString}`
                        const existingLocal = typeof window !== 'undefined' ? localStorage.getItem(localKey) : null
                        if (existingLocal) {
                            try {
                                const parsed = JSON.parse(existingLocal)
                                const migrated: NutritionData = {
                                    id: parsed.id || Date.now().toString(),
                                    date: dateString,
                                    meals: parsed.meals || [],
                                    foods: parsed.foods || []
                                }
                                setCurrentNutrition(migrated)
                                setMeals(migrated.meals)
                                setFoods(migrated.foods)
                                setHasUnsavedChanges(false)
                                // Persist migrated data to server
                                await nutritionServiceRef.current.saveNutrition({
                                    id: migrated.id,
                                    date: migrated.date,
                                    meals: migrated.meals,
                                    foods: migrated.foods
                                })
                            } catch {
                                const newNutrition: NutritionData = {
                                    id: Date.now().toString(),
                                    date: dateString,
                                    meals: [],
                                    foods: []
                                }
                                setCurrentNutrition(newNutrition)
                                setMeals([])
                                setFoods([])
                                setHasUnsavedChanges(false)
                            }
                        } else {
                            const newNutrition: NutritionData = {
                                id: Date.now().toString(),
                                date: dateString,
                                meals: [],
                                foods: []
                            }
                            setCurrentNutrition(newNutrition)
                            setMeals([])
                            setFoods([])
                            setHasUnsavedChanges(false)
                        }
                    }
                } else {
                    // Guest mode: load from localStorage
                    const userId = user?._id || 'guest'
                    const storageKey = `nutrition_${userId}_${dateString}`
                    const existingNutrition = localStorage.getItem(storageKey)
                    if (existingNutrition) {
                        const parsed = JSON.parse(existingNutrition)
                        setCurrentNutrition(parsed)
                        setMeals(parsed.meals || [])
                        setFoods(parsed.foods || [])
                        setHasUnsavedChanges(false)
                    } else {
                        const newNutrition: NutritionData = {
                            id: Date.now().toString(),
                            date: dateString,
                            meals: [],
                            foods: []
                        }
                        setCurrentNutrition(newNutrition)
                        setMeals([])
                        setFoods([])
                        setHasUnsavedChanges(false)
                    }
                }
            } catch (error) {
                console.error('Error loading nutrition data:', error)
                // Fallback to creating new nutrition data
                const newNutrition: NutritionData = {
                    id: Date.now().toString(),
                    date: dateString,
                    meals: [],
                    foods: []
                }
                setCurrentNutrition(newNutrition)
                setMeals([])
                setFoods([])
                setHasUnsavedChanges(false) // Reset change tracking for fallback nutrition data
            } finally {
                setIsLoading(false)
            }
        }

        loadNutritionData()
    }, [currentDate, user])

    // Auto-save nutrition data
    useEffect(() => {
        if (!currentNutrition) return

        const updatedNutrition = {
            ...currentNutrition,
            meals,
            foods
        }

        if (user && !user.guest && nutritionServiceRef.current) {
            if (hasUnsavedChanges) {
                setAutoSaveStatus('saving')
                nutritionServiceRef.current.autoSave({
                    id: updatedNutrition.id,
                    date: updatedNutrition.date,
                    meals: updatedNutrition.meals,
                    foods: updatedNutrition.foods
                }).then(() => {
                    setAutoSaveStatus('saved')
                    setTimeout(() => setAutoSaveStatus('idle'), 2000)
                }).catch(() => {
                    setAutoSaveStatus('error')
                    setTimeout(() => setAutoSaveStatus('idle'), 3000)
                })
            }
        } else {
            // Guest: save to localStorage
            const userId = user?._id || 'guest'
            const storageKey = `nutrition_${userId}_${currentNutrition.date}`
            localStorage.setItem(storageKey, JSON.stringify(updatedNutrition))
            if (hasUnsavedChanges) {
                setAutoSaveStatus('saving')
                setTimeout(() => {
                    setAutoSaveStatus('saved')
                    setTimeout(() => setAutoSaveStatus('idle'), 2000)
                }, 500)
            }
        }
    }, [meals, foods, currentNutrition, user])

    // Update header with auto-save status (match Workout tab behavior)
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
    }, [autoSaveStatus, currentNutrition, user])

    const handleManualSave = async () => {
        if (!currentNutrition) {
            setAutoSaveStatus('error')
            setTimeout(() => setAutoSaveStatus('idle'), 3000)
            return
        }

        setAutoSaveStatus('saving')
        try {
            const updatedNutrition = {
                ...currentNutrition,
                meals,
                foods
            }
            if (user && !user.guest && nutritionServiceRef.current) {
                await nutritionServiceRef.current.saveNutrition({
                    id: updatedNutrition.id,
                    date: updatedNutrition.date,
                    meals: updatedNutrition.meals,
                    foods: updatedNutrition.foods
                })
            } else {
                const userId = user?._id || 'guest'
                const storageKey = `nutrition_${userId}_${currentNutrition.date}`
                localStorage.setItem(storageKey, JSON.stringify(updatedNutrition))
            }
            if (hasUnsavedChanges) {
                setAutoSaveStatus('saved')
                setTimeout(() => setAutoSaveStatus('idle'), 2000)
            } else {
                setAutoSaveStatus('idle')
            }
            setHasUnsavedChanges(false)
        } catch (error) {
            console.error('Manual save failed:', error)
            setAutoSaveStatus('error')
            setTimeout(() => setAutoSaveStatus('idle'), 3000)
        }
    }

    // Keep local modal states in sync with global modal context (exclusive modals)
    useEffect(() => {
        if (!openModals.has('addFood') && showAddFoodModal) {
            setShowAddFoodModal(false)
        }
        if (!openModals.has('addMeal') && showAddMealModal) {
            setShowAddMealModal(false)
        }
        if (!openModals.has('editFood') && showEditFoodModal) {
            setShowEditFoodModal(false)
            setEditingFood(null)
        }
    }, [openModals])

    const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

    const handleAddMeal = (mealData: Omit<Meal, 'id' | 'foods'>) => {
        const newMeal: Meal = {
            ...mealData,
            id: generateId(),
            foods: []
        }
        setMeals(prev => [...prev, newMeal])
        setHasUnsavedChanges(true)
    }

    const handleDeleteMeal = (id: string) => {
        setMeals(prev => prev.filter(meal => meal.id !== id))
        setHasUnsavedChanges(true)
    }

    const handleUpdateMeal = (id: string, updatedMeal: Partial<Meal>) => {
        setMeals(prev => prev.map(meal =>
            meal.id === id ? { ...meal, ...updatedMeal } : meal
        ))
        setHasUnsavedChanges(true)
    }

    const handleAddFood = (foodData: Omit<Food, 'id'>) => {
        const newFood: Food = {
            ...foodData,
            id: generateId()
        }
        setFoods(prev => [...prev, newFood])
        setHasUnsavedChanges(true)
    }

    const handleDeleteFood = (foodId: string) => {
        setFoods(prev => prev.filter(food => food.id !== foodId))
        setHasUnsavedChanges(true)
    }

    const handleEditFood = (food: Food) => {
        setEditingFood(food)
        setShowEditFoodModal(true)
        openModal('editFood')
    }

    const handleSaveEditedFood = (updatedFood: Food) => {
        // Update food in available foods list
        setFoods(prev => prev.map(food =>
            food.id === updatedFood.id ? updatedFood : food
        ))

        // Update food in all meals that contain it
        setMeals(prev => prev.map(meal => ({
            ...meal,
            foods: meal.foods.map(food =>
                food.id === updatedFood.id ? updatedFood : food
            )
        })))

        setHasUnsavedChanges(true)
        setShowEditFoodModal(false)
        closeModal('editFood')
        setEditingFood(null)
    }

    const handleAddFoodToMeal = (mealId: string, food: Food) => {
        setMeals(prev => prev.map(meal =>
            meal.id === mealId
                ? { ...meal, foods: [...meal.foods, food] }
                : meal
        ))
        setHasUnsavedChanges(true)
    }

    const handleRemoveFoodFromMeal = (mealId: string, foodId: string) => {
        // Find the food being removed and add it back to available foods
        const mealWithFood = meals.find(meal => meal.id === mealId)
        const foodToRemove = mealWithFood?.foods.find(food => food.id === foodId)

        if (foodToRemove) {
            // Clean the food data to remove any meal-specific properties
            const cleanFood: Food = {
                id: foodToRemove.id,
                name: foodToRemove.name,
                calories: foodToRemove.calories,
                carbs: foodToRemove.carbs,
                protein: foodToRemove.protein,
                fat: foodToRemove.fat,
                notes: foodToRemove.notes
            }
            // Add back to available foods
            setFoods(prev => [...prev, cleanFood])
        }

        // Remove from meal
        setMeals(prev => prev.map(meal =>
            meal.id === mealId
                ? { ...meal, foods: meal.foods.filter(food => food.id !== foodId) }
                : meal
        ))
        setHasUnsavedChanges(true)
    }

    const handleDragStart = (e: React.DragEvent, food: Food) => {
        // Provide multiple mime types for broader browser support
        e.dataTransfer.setData('application/json', JSON.stringify(food))
        // Some browsers (Safari/iOS) require a plain text payload to initiate DnD
        try { e.dataTransfer.setData('text/plain', food.name || 'food') } catch { }
        // Make the intent explicit
        e.dataTransfer.effectAllowed = 'move'
        // Improve drag image fidelity
        const element = e.currentTarget as HTMLElement
        if (element && e.dataTransfer.setDragImage) {
            e.dataTransfer.setDragImage(element, element.clientWidth / 2, element.clientHeight / 2)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e: React.DragEvent, mealId: string) => {
        e.preventDefault()
        try {
            const foodData = JSON.parse(e.dataTransfer.getData('application/json'))

            // Check if this food is being moved from another meal
            if (foodData.sourceMealId && foodData.sourceMealId !== mealId) {
                // Move food from one meal to another - extract clean food data
                const { sourceMealId, ...cleanFoodData } = foodData
                const foodToMove: Food = cleanFoodData as Food
                handleMoveFoodBetweenMeals(foodData.sourceMealId, mealId, foodToMove)
            } else if (!foodData.sourceMealId) {
                // This is a food being moved from the available foods list
                const foodToMove: Food = foodData as Food

                // Add to meal
                handleAddFoodToMeal(mealId, foodToMove)

                // Remove from available foods
                setFoods(prev => prev.filter(food => food.id !== foodToMove.id))
                setHasUnsavedChanges(true)
            }
            // If sourceMealId === mealId, do nothing (dropping on same meal)
        } catch (error) {
            console.error('Error dropping food:', error)
        }
    }

    const handleMoveFoodBetweenMeals = (fromMealId: string, toMealId: string, food: Food) => {
        // Remove food from source meal and add to target meal
        setMeals(prev => prev.map(meal => {
            if (meal.id === fromMealId) {
                // Remove from source meal
                return { ...meal, foods: meal.foods.filter(f => f.id !== food.id) }
            } else if (meal.id === toMealId) {
                // Add to target meal
                return { ...meal, foods: [...meal.foods, food] }
            }
            return meal
        }))
        setHasUnsavedChanges(true)
    }

    return (
        <div className="space-y-2 sm:space-y-3">
            {/* Date Navigation */}
            <DateCard user={user} />

            {/* Daily Summary */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-purple-100">
                <h3 className="text-lg font-bold text-purple-800 mb-3 text-center">Daily Summary</h3>
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-purple-600">{dailyTotals.calories}</div>
                        <div className="text-sm text-purple-500">Calories</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-600">{dailyTotals.carbs.toFixed(1)}g</div>
                        <div className="text-sm text-green-500">Carbs</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-blue-600">{dailyTotals.protein.toFixed(1)}g</div>
                        <div className="text-sm text-blue-500">Protein</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-yellow-600">{dailyTotals.fat.toFixed(1)}g</div>
                        <div className="text-sm text-yellow-500">Fat</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
                <button
                    onClick={() => {
                        setShowAddFoodModal(true)
                        openModal('addFood')
                    }}
                    className="bg-purple-500/90 text-white px-4 py-2 rounded-lg hover:bg-purple-600/90 transition-colors font-medium text-sm flex-1"
                >
                    Add Food
                </button>
                <button
                    onClick={() => {
                        setShowAddMealModal(true)
                        openModal('addMeal')
                    }}
                    className="bg-purple-500/90 text-white px-4 py-2 rounded-lg hover:bg-purple-600/90 transition-colors font-medium text-sm flex-1"
                >
                    Add Meal
                </button>
            </div>

            {/* Available Foods (for dragging) - Only show if foods exist */}
            {foods.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-purple-800">Available Foods</h3>
                        <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            {foods.length} {foods.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                    <p className="text-xs text-purple-600 mb-3 italic">
                        Drag foods to meals, hover to delete, or remove from meals to return them here
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {foods.map((food) => (
                            <div
                                key={food.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, food)}
                                className="bg-purple-50 border border-purple-200 rounded-lg p-3 hover:bg-purple-100 transition-colors relative group cursor-grab active:cursor-grabbing select-none"
                            >
                                <div>
                                    <div className="font-medium text-purple-800 text-sm pr-6">{food.name}</div>
                                    <div className="text-xs text-purple-600">
                                        {food.calories}cal • {food.carbs}c • {food.protein}p • {food.fat}f
                                    </div>
                                    {food.notes && (
                                        <div className="text-xs text-purple-500 italic mt-1 break-words whitespace-normal">{food.notes}</div>
                                    )}
                                </div>
                                <div className="absolute top-1/2 right-2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                    <button
                                        onClick={() => handleEditFood(food)}
                                        className="perfect-circle bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center"
                                        style={{ '--circle-size': '28px' } as React.CSSProperties}
                                        title="Edit food"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFood(food.id)}
                                        className="perfect-circle bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center"
                                        style={{ '--circle-size': '28px' } as React.CSSProperties}
                                        title="Delete food"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Meals List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="w-6 h-6 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-purple-600 text-base">Loading nutrition data...</p>
                    </div>
                ) : meals.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🥗</span>
                        </div>
                        <h3 className="text-xl font-bold text-purple-800 mb-2">No Meals Added Yet</h3>
                        <p className="text-purple-600 mb-4 text-sm">
                            Start by adding meals to track your daily nutrition and calories.
                        </p>
                        <button
                            onClick={() => {
                                setShowAddMealModal(true)
                                openModal('addMeal')
                            }}
                            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
                        >
                            Add Your First Meal
                        </button>
                    </div>
                ) : (
                    meals.map((meal) => (
                        <div
                            key={meal.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, meal.id)}
                            className="relative"
                        >
                            <MealCard
                                meal={meal}
                                onDelete={handleDeleteMeal}
                                onUpdate={handleUpdateMeal}
                                onAddFood={handleAddFoodToMeal}
                                onRemoveFood={handleRemoveFoodFromMeal}
                                onMoveFood={handleMoveFoodBetweenMeals}
                                onEditFood={handleEditFood}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            <AddMealModal
                isOpen={showAddMealModal}
                onClose={() => {
                    setShowAddMealModal(false)
                    closeModal('addMeal')
                }}
                onAddMeal={(mealData) => {
                    handleAddMeal(mealData)
                    setShowAddMealModal(false)
                    closeModal('addMeal')
                }}
            />

            <AddFoodModal
                isOpen={showAddFoodModal}
                onClose={() => {
                    setShowAddFoodModal(false)
                    closeModal('addFood')
                }}
                onAddFood={(foodData) => {
                    handleAddFood(foodData)
                    setShowAddFoodModal(false)
                    closeModal('addFood')
                }}
            />

            <EditFoodModal
                isOpen={showEditFoodModal}
                food={editingFood}
                onClose={() => {
                    setShowEditFoodModal(false)
                    closeModal('editFood')
                    setEditingFood(null)
                }}
                onSaveFood={handleSaveEditedFood}
            />
        </div>
    )
}
