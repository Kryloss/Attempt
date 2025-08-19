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
        notes: ''
    })

    // USDA search states
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<USDAFood[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState('')
    const [showSearch, setShowSearch] = useState(true)
    const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null)
    const [detailedFoodData, setDetailedFoodData] = useState<USDAFood | null>(null) // Store detailed nutrition data
    const [servingSize, setServingSize] = useState(100) // Default 100g serving

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
            return { calories: 0, carbs: 0, protein: 0, fat: 0 }
        }

        // Try multiple nutrient names for better compatibility
        const calories = getNutrientValue(food, 'energy') ||
            getNutrientValue(food, 'calories') ||
            getNutrientValue(food, 'kcal')

        const carbs = getNutrientValue(food, 'carbohydrate') ||
            getNutrientValue(food, 'carbs') ||
            getNutrientValue(food, 'total carbohydrate')

        const protein = getNutrientValue(food, 'protein')

        const fat = getNutrientValue(food, 'fat') ||
            getNutrientValue(food, 'total fat') ||
            getNutrientValue(food, 'lipid')

        // Values in USDA are typically per 100g, scale to serving size
        const scaleFactor = servingGrams / 100

        return {
            calories: Math.round(Math.max(0, calories * scaleFactor)),
            carbs: Math.round(Math.max(0, carbs * scaleFactor) * 10) / 10,
            protein: Math.round(Math.max(0, protein * scaleFactor) * 10) / 10,
            fat: Math.round(Math.max(0, fat * scaleFactor) * 10) / 10
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
            // Get detailed nutrition info
            const detailedFood = await USDAClient.getFoodDetails(food.fdcId, 'full')
            setDetailedFoodData(detailedFood) // Store detailed data for serving size calculations

            const nutrition = calculateNutrition(detailedFood, servingSize)

            // Update form with food data
            setFormData({
                name: food.description || 'Unknown Food',
                calories: nutrition.calories.toString(),
                carbs: nutrition.carbs.toString(),
                protein: nutrition.protein.toString(),
                fat: nutrition.fat.toString(),
                notes: food.brandName ? `Brand: ${food.brandName}` : ''
            })

            setShowSearch(false)
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
                notes: food.brandName ? `Brand: ${food.brandName}` : ''
            })
            setShowSearch(false)
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
                fat: nutrition.fat.toString()
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

        const newFood = {
            name: formData.name.trim(),
            calories,
            carbs,
            protein,
            fat,
            notes: formData.notes.trim() || undefined
        }

        onAddFood(newFood)

        // Reset form
        setFormData({
            name: '',
            calories: '',
            carbs: '',
            protein: '',
            fat: '',
            notes: ''
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
            notes: ''
        })
        setSearchQuery('')
        setSearchResults([])
        setSelectedFood(null)
        setDetailedFoodData(null)
        setShowSearch(true)
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
            notes: ''
        })
        setSearchQuery('')
        setSearchResults([])
        setSelectedFood(null)
        setDetailedFoodData(null)
        setShowSearch(true)
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-purple-800">Add Food Item</h2>
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
                        {/* USDA Food Search */}
                        {showSearch && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-blue-800">🔍 Search USDA Food Database</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowSearch(false)}
                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                    >
                                        Enter manually
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 pr-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Search for food (e.g., chicken breast, apple, etc.)"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                {searchError && (
                                    <p className="text-red-600 text-xs mt-2">{searchError}</p>
                                )}

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="mt-3 max-h-60 overflow-y-auto border border-blue-200 rounded-lg">
                                        {searchResults.map((food) => (
                                            <button
                                                key={food.fdcId}
                                                type="button"
                                                onClick={() => handleFoodSelect(food)}
                                                className="w-full text-left p-3 hover:bg-blue-100 border-b border-blue-100 last:border-b-0 transition-colors"
                                            >
                                                <div className="font-medium text-blue-900 text-sm">{food.description}</div>
                                                {food.brandName && (
                                                    <div className="text-blue-600 text-xs mt-1">Brand: {food.brandName}</div>
                                                )}
                                                <div className="text-blue-500 text-xs mt-1">
                                                    {food.dataType} • FDC ID: {food.fdcId}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                    <p className="text-blue-600 text-xs mt-2">No foods found. Try a different search term.</p>
                                )}
                            </div>
                        )}

                        {/* Selected Food Info & Serving Size */}
                        {selectedFood && !showSearch && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-green-800">✅ Selected Food</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSearch(true)
                                            setSelectedFood(null)
                                            setDetailedFoodData(null)
                                            resetForm()
                                        }}
                                        className="text-green-600 hover:text-green-800 text-xs"
                                    >
                                        Change food
                                    </button>
                                </div>
                                <div className="text-green-900 font-medium text-sm mb-3">{selectedFood.description}</div>

                                {/* Serving Size Adjustment */}
                                <div className="flex items-center space-x-3">
                                    <label className="text-xs font-medium text-green-700">Serving Size:</label>
                                    <input
                                        type="number"
                                        value={servingSize}
                                        onChange={(e) => setServingSize(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-20 px-2 py-1 text-xs border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                        min="1"
                                    />
                                    <span className="text-xs text-green-600">grams</span>
                                </div>
                            </div>
                        )}

                        {/* Manual Entry Toggle */}
                        {!showSearch && !selectedFood && (
                            <div className="flex justify-center mb-4">
                                <button
                                    type="button"
                                    onClick={() => setShowSearch(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                                >
                                    🔍 Search USDA Database Instead
                                </button>
                            </div>
                        )}

                        {/* Food Name */}
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">
                                Food Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="e.g., Grilled Chicken Breast"
                                required
                                readOnly={!!selectedFood}
                            />
                        </div>

                        {/* Nutrition Values Note */}
                        {selectedFood && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-yellow-800 text-xs">
                                    💡 Nutrition values automatically calculated from USDA database for {servingSize}g serving.
                                    You can adjust the serving size above to recalculate values.
                                </p>
                            </div>
                        )}

                        {/* Calories */}
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">
                                Calories {selectedFood && <span className="text-xs text-purple-500">(auto-filled)</span>}
                            </label>
                            <input
                                type="number"
                                value={formData.calories}
                                onChange={(e) => handleInputChange('calories', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${selectedFood
                                    ? 'border-purple-200 bg-purple-50 text-purple-700'
                                    : 'border-purple-300 focus:ring-purple-500'
                                    }`}
                                placeholder="0"
                                min="0"
                                step="1"
                                readOnly={!!selectedFood}
                            />
                        </div>

                        {/* Macros Row */}
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-green-700 mb-2">
                                    Carbs (g) {selectedFood && <span className="text-xs text-green-500">(auto-filled)</span>}
                                </label>
                                <input
                                    type="number"
                                    value={formData.carbs}
                                    onChange={(e) => handleInputChange('carbs', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${selectedFood
                                        ? 'border-green-200 bg-green-50 text-green-700'
                                        : 'border-green-300 focus:ring-green-500'
                                        }`}
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                    readOnly={!!selectedFood}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-700 mb-2">
                                    Protein (g) {selectedFood && <span className="text-xs text-blue-500">(auto-filled)</span>}
                                </label>
                                <input
                                    type="number"
                                    value={formData.protein}
                                    onChange={(e) => handleInputChange('protein', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${selectedFood
                                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                                        : 'border-blue-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                    readOnly={!!selectedFood}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-yellow-700 mb-2">
                                    Fat (g) {selectedFood && <span className="text-xs text-yellow-500">(auto-filled)</span>}
                                </label>
                                <input
                                    type="number"
                                    value={formData.fat}
                                    onChange={(e) => handleInputChange('fat', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${selectedFood
                                        ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                        : 'border-yellow-300 focus:ring-yellow-500'
                                        }`}
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                    readOnly={!!selectedFood}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">
                                Notes (optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                placeholder="Any additional notes..."
                                rows={2}
                            />
                        </div>

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
                                className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors font-medium"
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
