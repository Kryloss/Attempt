'use client'

import { useState, useEffect } from 'react'
import { USDAClient, USDAFood } from '@/lib/usda-service'

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

interface AddFoodModalProps {
    isOpen: boolean
    onClose: () => void
    onAddFood: (food: Omit<Food, 'id'>) => void
}

export default function AddFoodModal({ isOpen, onClose, onAddFood }: AddFoodModalProps) {
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

    // USDA search states
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<USDAFood[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState('')

    const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null)
    const [detailedFoodData, setDetailedFoodData] = useState<USDAFood | null>(null) // Store detailed nutrition data
    const [servingSize, setServingSize] = useState(100) // Default 100g serving
    const [isAutoCalculated, setIsAutoCalculated] = useState(false)
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

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Search for foods using USDA API
    const searchFoods = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        setSearchError('')

        try {
            const response = await USDAClient.searchFoods({
                query: query.trim(),
                pageSize: 10,
                dataType: ['Branded', 'Foundation', 'SR Legacy']
            })
            setSearchResults(response.foods)
        } catch (error) {
            console.error('Search error:', error)
            setSearchError('Failed to search foods. Please try again.')
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                searchFoods(searchQuery)
            } else {
                setSearchResults([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Get nutrition value by nutrient name
    const getNutrientValue = (food: USDAFood, nutrientName: string): number => {
        if (!food.foodNutrients || !Array.isArray(food.foodNutrients)) return 0

        const nutrient = food.foodNutrients.find(n =>
            n?.nutrient?.name?.toLowerCase()?.includes(nutrientName.toLowerCase())
        )
        return nutrient?.amount || 0
    }

    // Calculate nutrition values based on serving size
    const calculateNutrition = (food: USDAFood, servingGrams: number) => {
        if (!food || !servingGrams || servingGrams <= 0) {
            return { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, fatsSaturated: 0, fatsTrans: 0, fatsUnsaturated: 0, carbsSimple: 0, carbsComplex: 0, proteinComplete: 0, proteinIncomplete: 0 }
        }

        // Try multiple nutrient names for better compatibility
        let calories = getNutrientValue(food, 'energy') ||
            getNutrientValue(food, 'calories') ||
            getNutrientValue(food, 'kcal')

        let carbs = getNutrientValue(food, 'carbohydrate') ||
            getNutrientValue(food, 'carbs') ||
            getNutrientValue(food, 'total carbohydrate')

        let protein = getNutrientValue(food, 'protein')

        let fat = getNutrientValue(food, 'fat') ||
            getNutrientValue(food, 'total fat') ||
            getNutrientValue(food, 'lipid')

        // Subclasses
        let fiber = getNutrientValue(food, 'fiber') || getNutrientValue(food, 'dietary fiber')
        let fatsSaturated = getNutrientValue(food, 'saturated fat')
        let fatsTrans = getNutrientValue(food, 'trans fat')
        let sugars = getNutrientValue(food, 'sugars') || getNutrientValue(food, 'sugar')

        // Fallback to labelNutrients (for Branded foods)
        const label: any = (food as any).labelNutrients
        if (label) {
            const lnCalories = label.calories?.value ?? label.energyKcal?.value
            const lnCarbs = label.carbohydrates?.value
            const lnProtein = label.protein?.value
            const lnFat = label.fat?.value
            const lnFiber = label.fiber?.value
            const lnSat = label.saturatedFat?.value
            const lnTrans = label.transFat?.value
            const lnSugars = label.sugars?.value

            // If servingSize is in grams we can normalize to per 100g
            const declaredServing = (food as any).servingSize
            const unit = (food as any).servingSizeUnit
            let toPer100 = 1
            if (typeof declaredServing === 'number' && declaredServing > 0 && typeof unit === 'string' && unit.toLowerCase() === 'g') {
                toPer100 = 100 / declaredServing
            }

            if (!calories && lnCalories) calories = lnCalories * toPer100
            if (!carbs && lnCarbs) carbs = lnCarbs * toPer100
            if (!protein && lnProtein) protein = lnProtein * toPer100
            if (!fat && lnFat) fat = lnFat * toPer100
            if (!fiber && lnFiber) fiber = lnFiber * toPer100
            if (!fatsSaturated && lnSat) fatsSaturated = lnSat * toPer100
            if (!fatsTrans && lnTrans) fatsTrans = lnTrans * toPer100
            if (!sugars && lnSugars) sugars = lnSugars * toPer100
        }

        // Values in USDA are typically per 100g, scale to serving size
        const scaleFactor = servingGrams / 100

        return {
            calories: Math.round(Math.max(0, calories * scaleFactor)),
            carbs: Math.round(Math.max(0, carbs * scaleFactor) * 10) / 10,
            protein: Math.round(Math.max(0, protein * scaleFactor) * 10) / 10,
            fat: Math.round(Math.max(0, fat * scaleFactor) * 10) / 10,
            fiber: Math.round(Math.max(0, fiber * scaleFactor) * 10) / 10,
            fatsSaturated: Math.round(Math.max(0, fatsSaturated * scaleFactor) * 10) / 10,
            fatsTrans: Math.round(Math.max(0, fatsTrans * scaleFactor) * 10) / 10,
            fatsUnsaturated: Math.max(0, Math.round(((fat - fatsSaturated - fatsTrans) * scaleFactor) * 10) / 10),
            carbsSimple: Math.round(Math.max(0, sugars * scaleFactor) * 10) / 10,
            carbsComplex: Math.max(0, Math.round(((carbs - sugars - fiber) * scaleFactor) * 10) / 10),
            // Protein completeness is complex; heuristic: 0 for now (client could allow manual edit later)
            proteinComplete: 0,
            proteinIncomplete: Math.round(Math.max(0, protein * scaleFactor) * 10) / 10
        }
    }

    // Handle food selection from search results
    const handleFoodSelect = async (food: USDAFood) => {
        if (!food || !food.fdcId) {
            console.error('Invalid food data:', food)
            return
        }

        setSelectedFood(food)
        setSearchResults([])
        setSearchQuery('')

        try {
            // Get detailed nutrition info (try full, then abridged)
            let detailedFood = await USDAClient.getFoodDetails(food.fdcId, 'full')
            let nutrition = calculateNutrition(detailedFood, servingSize)

            // If "full" returns no usable macros, fallback to "abridged"
            if ((nutrition.calories + nutrition.carbs + nutrition.protein + nutrition.fat) === 0) {
                try {
                    const abridged = await USDAClient.getFoodDetails(food.fdcId, 'abridged')
                    detailedFood = abridged
                    nutrition = calculateNutrition(abridged, servingSize)
                } catch { /* ignore, we'll fall back to search result below */ }
            }

            setDetailedFoodData(detailedFood)

            // Update form with food data
            setFormData({
                name: food.description || 'Unknown Food',
                calories: nutrition.calories.toString(),
                carbs: nutrition.carbs.toString(),
                protein: nutrition.protein.toString(),
                fat: nutrition.fat.toString(),
                notes: food.brandName ? `Brand: ${food.brandName}` : '',
                fiber: nutrition.fiber ? nutrition.fiber.toString() : '',
                fatsSaturated: nutrition.fatsSaturated ? nutrition.fatsSaturated.toString() : '',
                fatsTrans: nutrition.fatsTrans ? nutrition.fatsTrans.toString() : '',
                fatsUnsaturated: nutrition.fatsUnsaturated ? nutrition.fatsUnsaturated.toString() : '',
                carbsSimple: nutrition.carbsSimple ? nutrition.carbsSimple.toString() : '',
                carbsComplex: nutrition.carbsComplex ? nutrition.carbsComplex.toString() : '',
                proteinComplete: nutrition.proteinComplete ? nutrition.proteinComplete.toString() : '',
                proteinIncomplete: nutrition.proteinIncomplete ? nutrition.proteinIncomplete.toString() : ''
            })
            // Mark auto if any values present
            setIsAutoCalculated((nutrition.calories + nutrition.carbs + nutrition.protein + nutrition.fat) > 0)
        } catch (error) {
            console.error('Error getting food details:', error)
            // Fallback to basic info from search result
            setDetailedFoodData(food) // Store what we have for serving size calculations

            const nutrition = calculateNutrition(food, servingSize)
            setFormData({
                name: food.description || 'Unknown Food',
                calories: nutrition.calories.toString(),
                carbs: nutrition.carbs.toString(),
                protein: nutrition.protein.toString(),
                fat: nutrition.fat.toString(),
                notes: food.brandName ? `Brand: ${food.brandName}` : '',
                fiber: nutrition.fiber ? nutrition.fiber.toString() : '',
                fatsSaturated: nutrition.fatsSaturated ? nutrition.fatsSaturated.toString() : '',
                fatsTrans: nutrition.fatsTrans ? nutrition.fatsTrans.toString() : '',
                fatsUnsaturated: nutrition.fatsUnsaturated ? nutrition.fatsUnsaturated.toString() : '',
                carbsSimple: nutrition.carbsSimple ? nutrition.carbsSimple.toString() : '',
                carbsComplex: nutrition.carbsComplex ? nutrition.carbsComplex.toString() : '',
                proteinComplete: nutrition.proteinComplete ? nutrition.proteinComplete.toString() : '',
                proteinIncomplete: nutrition.proteinIncomplete ? nutrition.proteinIncomplete.toString() : ''
            })
            setIsAutoCalculated((nutrition.calories + nutrition.carbs + nutrition.protein + nutrition.fat) > 0)
        }
    }

    // Update nutrition when serving size changes
    useEffect(() => {
        if (detailedFoodData && selectedFood) {
            console.log('Recalculating nutrition for serving size:', servingSize)
            console.log('Using detailed food data:', detailedFoodData.description)
            console.log('Food nutrients available:', detailedFoodData.foodNutrients?.length || 0)

            const nutrition = calculateNutrition(detailedFoodData, servingSize)
            console.log('Calculated nutrition:', nutrition)

            setFormData(prev => ({
                ...prev,
                calories: nutrition.calories.toString(),
                carbs: nutrition.carbs.toString(),
                protein: nutrition.protein.toString(),
                fat: nutrition.fat.toString(),
                fiber: nutrition.fiber ? nutrition.fiber.toString() : prev.fiber,
                fatsSaturated: nutrition.fatsSaturated ? nutrition.fatsSaturated.toString() : prev.fatsSaturated,
                fatsTrans: nutrition.fatsTrans ? nutrition.fatsTrans.toString() : prev.fatsTrans,
                fatsUnsaturated: nutrition.fatsUnsaturated ? nutrition.fatsUnsaturated.toString() : prev.fatsUnsaturated,
                carbsSimple: nutrition.carbsSimple ? nutrition.carbsSimple.toString() : prev.carbsSimple,
                carbsComplex: nutrition.carbsComplex ? nutrition.carbsComplex.toString() : prev.carbsComplex,
                proteinComplete: nutrition.proteinComplete ? nutrition.proteinComplete.toString() : prev.proteinComplete,
                proteinIncomplete: nutrition.proteinIncomplete ? nutrition.proteinIncomplete.toString() : prev.proteinIncomplete
            }))
        }
    }, [servingSize, detailedFoodData, selectedFood])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

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

        const newFood: Omit<Food, 'id'> = {
            name: formData.name.trim(),
            calories,
            carbs,
            protein,
            fat,
            notes: formData.notes.trim() || undefined
        }

        // If USDA data exists, enrich with subclasses and FDC id
        if (selectedFood && detailedFoodData && isAutoCalculated) {
            const nutrition = calculateNutrition(detailedFoodData, servingSize)
                ; (newFood as any).fiber = nutrition.fiber
                ; (newFood as any).fatsSaturated = nutrition.fatsSaturated
                ; (newFood as any).fatsTrans = nutrition.fatsTrans
                ; (newFood as any).fatsUnsaturated = nutrition.fatsUnsaturated
                ; (newFood as any).carbsSimple = nutrition.carbsSimple
                ; (newFood as any).carbsComplex = nutrition.carbsComplex
                ; (newFood as any).proteinComplete = nutrition.proteinComplete
                ; (newFood as any).proteinIncomplete = nutrition.proteinIncomplete
                ; (newFood as any).fdcId = selectedFood.fdcId
        } else if (advancedEnabled) {
            // Use manual inputs if provided
            const parseOrUndefined = (v: string) => v.trim() === '' ? undefined : Math.max(0, parseFloat(v) || 0)
                ; (newFood as any).fiber = parseOrUndefined(formData.fiber)
                ; (newFood as any).fatsSaturated = parseOrUndefined(formData.fatsSaturated)
                ; (newFood as any).fatsTrans = parseOrUndefined(formData.fatsTrans)
                ; (newFood as any).fatsUnsaturated = parseOrUndefined(formData.fatsUnsaturated)
                ; (newFood as any).carbsSimple = parseOrUndefined(formData.carbsSimple)
                ; (newFood as any).carbsComplex = parseOrUndefined(formData.carbsComplex)
                ; (newFood as any).proteinComplete = parseOrUndefined(formData.proteinComplete)
                ; (newFood as any).proteinIncomplete = parseOrUndefined(formData.proteinIncomplete)
        }

        onAddFood(newFood)

        // Reset form
        setFormData({
            name: '',
            calories: '',
            carbs: '',
            protein: '',
            fat: '',
            notes: '',
            fiber: '',
            fatsSaturated: '',
            fatsTrans: '',
            fatsUnsaturated: '',
            carbsSimple: '',
            carbsComplex: '',
            proteinComplete: '',
            proteinIncomplete: ''
        })

        onClose()
    }

    const handleCancel = () => {
        // Reset form and search state
        setFormData({
            name: '',
            calories: '',
            carbs: '',
            protein: '',
            fat: '',
            notes: '',
            fiber: '',
            fatsSaturated: '',
            fatsTrans: '',
            fatsUnsaturated: '',
            carbsSimple: '',
            carbsComplex: '',
            proteinComplete: '',
            proteinIncomplete: ''
        })
        setSearchQuery('')
        setSearchResults([])
        setSelectedFood(null)
        setDetailedFoodData(null)

        setServingSize(100)
        setSearchError('')
        onClose()
    }

    const resetForm = () => {
        setFormData({
            name: '',
            calories: '',
            carbs: '',
            protein: '',
            fat: '',
            notes: '',
            fiber: '',
            fatsSaturated: '',
            fatsTrans: '',
            fatsUnsaturated: '',
            carbsSimple: '',
            carbsComplex: '',
            proteinComplete: '',
            proteinIncomplete: ''
        })
        setSearchQuery('')
        setSearchResults([])
        setSelectedFood(null)
        setDetailedFoodData(null)

        setServingSize(100)
        setSearchError('')
    }

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            resetForm()
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm shadow-2xl max-h-[75vh] overflow-y-auto neon-surface light-surface"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-1.5">
                    <div className="mb-1">
                        <h2 className="text-base font-bold text-purple-800 dark:text-purple-200">Add Food Item</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-0.5">
                        {/* Search Food Database */}
                        <div>
                            <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5">
                                Search Food Database *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-2 py-1 pr-8 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-blue-700"
                                    placeholder="Search for food..."
                                />
                                {isSearching && (
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                        <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            {searchError && (
                                <p className="text-red-600 text-xs mt-0.5">{searchError}</p>
                            )}

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mt-0.5 max-h-32 overflow-y-auto border border-blue-300 dark:border-gray-700 rounded-lg" style={{ scrollbarColor: '#3b82f6 #dbeafe', scrollbarWidth: 'thin' }}>
                                    {searchResults.map((food) => (
                                        <button
                                            key={food.fdcId}
                                            type="button"
                                            onClick={() => handleFoodSelect(food)}
                                            className="w-full text-left p-1 hover:bg-blue-100 dark:hover:bg-gray-800 border-b border-blue-100 dark:border-gray-700 last:border-b-0 transition-colors"
                                        >
                                            <div className="font-medium text-blue-900 dark:text-blue-200 text-xs">{food.description}</div>
                                            {food.brandName && (
                                                <div className="text-blue-600 dark:text-blue-300 text-xs mt-0.5">Brand: {food.brandName}</div>
                                            )}
                                            <div className="text-blue-500 dark:text-blue-300 text-xs mt-0.5">
                                                {food.dataType} • FDC ID: {food.fdcId}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                <p className="text-blue-600 text-xs mt-0.5">No foods found. Try a different search term.</p>
                            )}
                        </div>

                        {/* Selected Food Info & Serving Size */}
                        {selectedFood && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-gray-700 rounded-lg p-0.5">
                                {/* Serving Size Adjustment */}
                                <div className="flex items-center space-x-1">
                                    <label className="text-[10px] font-medium text-blue-700 dark:text-blue-300">Serving:</label>
                                    <input
                                        type="number"
                                        value={servingSize}
                                        onChange={(e) => setServingSize(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-14 h-5 px-1 py-0 text-[10px] leading-none border border-blue-300 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-700 no-spinner input-compact dark:bg-gray-800 dark:text-gray-100"
                                        min="1"
                                    />
                                    <span className="text-[10px] text-blue-600 dark:text-blue-300">g</span>
                                </div>
                            </div>
                        )}

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
                                readOnly={!!selectedFood}
                            />
                        </div>

                        {/* Nutrition Values Note */}
                        {selectedFood && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-gray-700 rounded-lg p-1">
                                <p className="text-yellow-800 dark:text-yellow-300 text-xs">
                                    💡 Values auto-calculated for {servingSize}g serving.
                                </p>
                            </div>
                        )}

                        {/* Calories */}
                        <div>
                            <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">
                                Calories {selectedFood && <span className="text-xs text-purple-500">(auto)</span>}
                            </label>
                            <input
                                type="number"
                                value={formData.calories}
                                onChange={(e) => handleInputChange('calories', e.target.value)}
                                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-xs ${(selectedFood && isAutoCalculated)
                                    ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                                    : 'border-purple-300 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-purple-700'
                                    }`}
                                placeholder="0"
                                min="0"
                                step="1"
                                readOnly={!!selectedFood && isAutoCalculated}
                            />
                        </div>

                        {/* Macros Row */}
                        <div className="grid grid-cols-3 gap-1">
                            {/* Carbs and subclasses */}
                            <div>
                                <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-0.5">
                                    Carbs (g) {selectedFood && <span className="text-xs text-green-500">(auto)</span>}
                                </label>
                                <input
                                    type="number"
                                    value={formData.carbs}
                                    onChange={(e) => handleInputChange('carbs', e.target.value)}
                                    className={`w-full px-1.5 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-xs ${(selectedFood && isAutoCalculated)
                                        ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300'
                                        : 'border-green-300 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-green-700'
                                        }`}
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                    readOnly={!!selectedFood && isAutoCalculated}
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
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-green-700 text-[10px] border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                    readOnly={!!selectedFood && isAutoCalculated}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-green-700 dark:text-green-300 mb-0.5">Complex</label>
                                                <input
                                                    type="number"
                                                    value={formData.carbsComplex}
                                                    onChange={(e) => handleInputChange('carbsComplex', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-green-700 text-[10px] border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                    readOnly={!!selectedFood && isAutoCalculated}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-green-700 dark:text-green-300 mb-0.5">Fiber</label>
                                                <input
                                                    type="number"
                                                    value={formData.fiber}
                                                    onChange={(e) => handleInputChange('fiber', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-green-700 text-[10px] border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                    readOnly={!!selectedFood && isAutoCalculated}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Protein and subclasses */}
                            <div>
                                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5">
                                    Protein (g) {selectedFood && <span className="text-xs text-blue-500">(auto)</span>}
                                </label>
                                <input
                                    type="number"
                                    value={formData.protein}
                                    onChange={(e) => handleInputChange('protein', e.target.value)}
                                    className={`w-full px-1.5 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-xs ${(selectedFood && isAutoCalculated)
                                        ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                        : 'border-blue-300 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-700'
                                        }`}
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                    readOnly={!!selectedFood && isAutoCalculated}
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
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-700 text-[10px] border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                    readOnly={!!selectedFood && isAutoCalculated}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-blue-700 dark:text-blue-300 mb-0.5">Incomplete</label>
                                                <input
                                                    type="number"
                                                    value={formData.proteinIncomplete}
                                                    onChange={(e) => handleInputChange('proteinIncomplete', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-700 text-[10px] border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                    readOnly={!!selectedFood && isAutoCalculated}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Fats and subclasses */}
                            <div>
                                <label className="block text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-0.5">
                                    Fat (g) {selectedFood && <span className="text-xs text-yellow-500">(auto)</span>}
                                </label>
                                <input
                                    type="number"
                                    value={formData.fat}
                                    onChange={(e) => handleInputChange('fat', e.target.value)}
                                    className={`w-full px-1.5 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-xs ${(selectedFood && isAutoCalculated)
                                        ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                                        : 'border-yellow-300 focus:ring-yellow-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-yellow-700'
                                        }`}
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                    readOnly={!!selectedFood && isAutoCalculated}
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
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 dark:focus:ring-yellow-700 text-[10px] border-yellow-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                    readOnly={!!selectedFood && isAutoCalculated}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-yellow-700 dark:text-yellow-300 mb-0.5">Sat</label>
                                                <input
                                                    type="number"
                                                    value={formData.fatsSaturated}
                                                    onChange={(e) => handleInputChange('fatsSaturated', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 dark:focus:ring-yellow-700 text-[10px] border-yellow-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                    readOnly={!!selectedFood && isAutoCalculated}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-yellow-700 dark:text-yellow-300 mb-0.5">Trans</label>
                                                <input
                                                    type="number"
                                                    value={formData.fatsTrans}
                                                    onChange={(e) => handleInputChange('fatsTrans', e.target.value)}
                                                    className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 dark:focus:ring-yellow-700 text-[10px] border-yellow-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.1"
                                                    readOnly={!!selectedFood && isAutoCalculated}
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
                                className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-purple-700"
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
                                className="flex-1 bg-purple-500 text-white py-1.5 px-3 rounded-lg hover:bg-purple-600 transition-colors font-medium text-xs dark:bg-purple-500/10 dark:text-purple-300 dark:border-2 dark:border-purple-400 dark:hover:bg-purple-500/15 dark:shadow-[0_0_16px_rgba(168,85,247,0.45)] dark:hover:shadow-[0_0_24px_rgba(168,85,247,0.65)]"
                            >
                                Add Food
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
