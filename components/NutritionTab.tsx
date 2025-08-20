'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
    // Advanced subclasses
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
    const [targetMealId, setTargetMealId] = useState<string | null>(null)
    const [showEditFoodModal, setShowEditFoodModal] = useState(false)
    const [editingFood, setEditingFood] = useState<Food | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [advancedNutritionEnabled, setAdvancedNutritionEnabled] = useState<boolean>(false)
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

    // Sync advanced nutrition setting from localStorage
    useEffect(() => {
        const readSetting = () => {
            try {
                const stored = typeof window !== 'undefined' ? localStorage.getItem('advanced_nutrition_enabled') : null
                setAdvancedNutritionEnabled(stored === 'true')
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

    // Calculate daily totals
    const dailyTotals = useMemo(() => {
        return (meals || []).reduce((acc, meal) => {
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
    }, [meals])

    // Advanced totals (optional)
    const advancedTotals = useMemo(() => {
        return (meals || []).reduce((acc, meal) => {
            const foods = meal?.foods || []
            foods.forEach(food => {
                acc.proteinComplete += food.proteinComplete || 0
                acc.proteinIncomplete += food.proteinIncomplete || 0
                acc.carbsSimple += food.carbsSimple || 0
                acc.carbsComplex += food.carbsComplex || 0
                acc.fiber += food.fiber || 0
                acc.fatsUnsaturated += food.fatsUnsaturated || 0
                acc.fatsSaturated += food.fatsSaturated || 0
                acc.fatsTrans += food.fatsTrans || 0
            })
            return acc
        }, { proteinComplete: 0, proteinIncomplete: 0, carbsSimple: 0, carbsComplex: 0, fiber: 0, fatsUnsaturated: 0, fatsSaturated: 0, fatsTrans: 0 })
    }, [meals])

    // Show summary only when more than one meal has at least one food
    const mealsWithFoodsCount = (meals || []).filter(m => (m?.foods?.length || 0) > 0).length
    const showDailySummary = mealsWithFoodsCount > 1

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

    // Debounced auto-save nutrition data
    useEffect(() => {
        if (!currentNutrition) return

        const updatedNutrition = {
            ...currentNutrition,
            meals,
            foods
        }

        let timeoutId: ReturnType<typeof setTimeout> | null = null

        const triggerSave = () => {
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
        }

        timeoutId = setTimeout(triggerSave, 400)

        return () => {
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [meals, foods, currentNutrition, user, hasUnsavedChanges])

    // Update header with auto-save status (match Workout tab behavior)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const statusElement = document.getElementById('auto-save-status')
            if (statusElement && user && !user.guest) {
                let statusHTML = ''

                if (autoSaveStatus === 'saving') {
                    statusHTML = `
                        <div class="flex items-center space-x-2 text-xs sm:text-sm text-purple-500">
                            <div class="w-3 h-3 sm:w-4 sm:h-4 border-2 border-purple-300 border-t-purple-500 rounded-full animate-spin"></div>
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

        if (targetMealId) {
            // Add directly into the targeted meal
            setMeals(prev => prev.map(meal =>
                meal.id === targetMealId ? { ...meal, foods: [...meal.foods, newFood] } : meal
            ))
        } else {
            // No target meal: do nothing (Available Foods card removed)
        }
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
        // Fully delete: remove from the specified meal without adding to available foods
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

            {/* Daily Summary (visible only when more than one meal has foods) */}
            {showDailySummary && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-lg border border-purple-100 dark:border-gray-700">
                    <h3 className="text-base font-bold text-purple-800 dark:text-purple-200 mb-1 text-center"></h3>
                    <div className="grid grid-cols-4 gap-1">
                        <div className="rounded-lg p-1.5 text-center border-2 border-purple-300 bg-purple-500/5 shadow-[0_0_18px_rgba(168,85,247,0.25)]">
                            <div className="text-xs text-purple-500">Calories</div>
                            <div className="text-lg font-bold text-purple-500">{dailyTotals.calories}</div>
                        </div>
                        <div className="rounded-lg p-1.5 text-center border-2 border-green-300 bg-green-500/5 shadow-[0_0_18px_rgba(16,185,129,0.25)]">
                            <div className="text-xs text-green-500">Carbs</div>
                            <div className="text-lg font-bold text-green-600">{dailyTotals.carbs.toFixed(1)}g</div>
                            {advancedNutritionEnabled && (
                                <div className="mt-0.5 grid grid-cols-3 gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-green-600 leading-3 sm:leading-4 scale-90 sm:scale-100 origin-top">
                                    <div>
                                        <div className="text-[8px] sm:text-[9px] text-green-700/80">Simple</div>
                                        <div className="font-semibold">{advancedTotals.carbsSimple.toFixed(1)}g</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] sm:text-[9px] text-green-700/80">Fiber</div>
                                        <div className="font-semibold">{advancedTotals.fiber.toFixed(1)}g</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] sm:text-[9px] text-green-700/80">Complex</div>
                                        <div className="font-semibold">{advancedTotals.carbsComplex.toFixed(1)}g</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="rounded-lg p-1.5 text-center border-2 border-blue-300 bg-blue-500/5 shadow-[0_0_18px_rgba(59,130,246,0.25)]">
                            <div className="text-xs text-blue-500">Protein</div>
                            <div className="text-lg font-bold text-blue-600">{dailyTotals.protein.toFixed(1)}g</div>
                            {advancedNutritionEnabled && (
                                <div className="mt-0.5 grid grid-cols-2 gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-blue-600 leading-3 sm:leading-4 scale-90 sm:scale-100 origin-top">
                                    <div>
                                        <div className="text-[8px] sm:text-[9px] text-blue-700/80">Complete</div>
                                        <div className="font-semibold">{advancedTotals.proteinComplete.toFixed(1)}g</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] sm:text-[9px] text-blue-700/80">Incomplete</div>
                                        <div className="font-semibold">{advancedTotals.proteinIncomplete.toFixed(1)}g</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="rounded-lg p-1.5 text-center border-2 border-yellow-300 bg-yellow-500/5 shadow-[0_0_18px_rgba(234,179,8,0.25)]">
                            <div className="text-xs text-yellow-500">Fat</div>
                            <div className="text-lg font-bold text-yellow-600">{dailyTotals.fat.toFixed(1)}g</div>
                            {advancedNutritionEnabled && (
                                <div className="mt-0.5 grid grid-cols-3 gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-yellow-600 leading-3 sm:leading-4 scale-90 sm:scale-100 origin-top">
                                    <div>
                                        <div className="text-[8px] sm:text-[9px] text-yellow-700/80">Unsat</div>
                                        <div className="font-semibold">{advancedTotals.fatsUnsaturated.toFixed(1)}g</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] sm:text-[9px] text-yellow-700/80">Sat</div>
                                        <div className="font-semibold">{advancedTotals.fatsSaturated.toFixed(1)}g</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] sm:text-[9px] text-yellow-700/80">Trans</div>
                                        <div className="font-semibold">{advancedTotals.fatsTrans.toFixed(1)}g</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons moved under Existing Meals */}

            {/* Available Foods removed as per requirement */}

            {/* Meals List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-purple-100 dark:border-gray-700 text-center neon-surface light-surface">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-300 bg-purple-500/5 shadow-[0_0_16px_rgba(168,85,247,0.25)]">
                            <div className="w-6 h-6 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-purple-600 text-base">Loading nutrition data...</p>
                    </div>
                ) : meals.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-purple-100 dark:border-gray-700 text-center neon-surface light-surface">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-300 bg-purple-500/5 shadow-[0_0_16px_rgba(168,85,247,0.25)]">
                            <span className="text-2xl">🥗</span>
                        </div>
                        <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-2">No Meals Added Yet</h3>
                        <p className="text-purple-600 dark:text-purple-300 mb-4 text-sm">
                            Start by adding meals to track your daily nutrition and calories.
                        </p>
                        <button
                            onClick={() => {
                                setShowAddMealModal(true)
                                openModal('addMeal')
                            }}
                            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium dark:bg-purple-500/10 dark:text-purple-300 dark:border-2 dark:border-purple-400 dark:hover:bg-purple-500/15 dark:shadow-[0_0_16px_rgba(168,85,247,0.45)] dark:hover:shadow-[0_0_24px_rgba(168,85,247,0.65)]"
                        >
                            Add Your First Meal
                        </button>
                    </div>
                ) : (
                    <>
                        {meals.map((meal, index) => (
                            <div
                                key={meal.id}
                                onDragOver={(e) => {
                                    // Accept dragging of foods and meals onto meal body
                                    handleDragOver(e)
                                }}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    try {
                                        const mealTransfer = e.dataTransfer.getData('application/x-meal')
                                        if (mealTransfer) {
                                            const { fromIndex } = JSON.parse(mealTransfer)
                                            if (typeof fromIndex === 'number' && fromIndex !== index) {
                                                setMeals(prev => {
                                                    const updated = [...prev]
                                                    const [moved] = updated.splice(fromIndex, 1)
                                                    updated.splice(index, 0, moved)
                                                    return updated
                                                })
                                                setHasUnsavedChanges(true)
                                                return
                                            }
                                        }
                                    } catch { }
                                    // Fallback: treat as dropping a food item
                                    handleDrop(e, meal.id)
                                }}
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
                                    onOpenAddFood={(mealId: string) => {
                                        setTargetMealId(mealId)
                                        setShowAddFoodModal(true)
                                        openModal('addFood')
                                    }}
                                    dragHandleProps={{
                                        draggable: true,
                                        onDragStart: (e: React.DragEvent) => {
                                            // Mark that we are dragging a meal (not food)
                                            e.dataTransfer.setData('application/x-meal', JSON.stringify({ id: meal.id, fromIndex: index }))
                                            try { e.dataTransfer.setData('text/plain', meal.name || 'meal') } catch { }
                                            e.dataTransfer.effectAllowed = 'move'
                                        },
                                        onDragEnd: () => { }
                                    }}
                                    showAdvanced={advancedNutritionEnabled}
                                    showTotals={mealsWithFoodsCount === 1 && (meal?.foods?.length || 0) > 0}
                                />
                            </div>
                        ))}
                        <div className="pt-1 flex justify-center">
                            <button
                                onClick={() => {
                                    setShowAddMealModal(true)
                                    openModal('addMeal')
                                }}
                                className="bg-purple-500/90 text-white px-6 py-2 rounded-lg hover:bg-purple-600/90 transition-colors font-medium text-sm w-full max-w-xs dark:bg-purple-500/10 dark:text-purple-300 dark:border-2 dark:border-purple-400 dark:hover:bg-purple-500/15 dark:shadow-[0_0_16px_rgba(168,85,247,0.45)] dark:hover:shadow-[0_0_24px_rgba(168,85,247,0.65)]"
                            >
                                Add Meal
                            </button>
                        </div>
                    </>
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
                    setTargetMealId(null)
                }}
                onAddFood={(foodData) => {
                    handleAddFood(foodData)
                    setShowAddFoodModal(false)
                    closeModal('addFood')
                    setTargetMealId(null)
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
