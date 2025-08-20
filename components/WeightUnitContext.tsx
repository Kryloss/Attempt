'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type WeightUnit = 'kg' | 'lbs'

interface WeightUnitContextType {
    weightUnit: WeightUnit
    setWeightUnit: (unit: WeightUnit) => void
    convertWeight: (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit) => number
    formatWeight: (weight: number, unit?: WeightUnit) => string
}

const WeightUnitContext = createContext<WeightUnitContextType | undefined>(undefined)

export function WeightUnitProvider({ children }: { children: ReactNode }) {
    const [weightUnit, setWeightUnitState] = useState<WeightUnit>('kg')

    // Load weight unit from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('weight_unit')
            if (stored === 'kg' || stored === 'lbs') {
                setWeightUnitState(stored)
            }
        } catch {
            // Fallback to kg if localStorage is not available
        }
    }, [])

    const setWeightUnit = (unit: WeightUnit) => {
        setWeightUnitState(unit)
        try {
            localStorage.setItem('weight_unit', unit)
        } catch {
            // Ignore localStorage errors
        }
    }

    const convertWeight = (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
        if (fromUnit === toUnit) return weight

        if (fromUnit === 'kg' && toUnit === 'lbs') {
            return Number((weight * 2.20462).toFixed(2))
        } else if (fromUnit === 'lbs' && toUnit === 'kg') {
            return Number((weight / 2.20462).toFixed(2))
        }

        return weight
    }

    const formatWeight = (weight: number, unit?: WeightUnit): string => {
        const displayUnit = unit || weightUnit
        return `${weight}${displayUnit}`
    }

    return (
        <WeightUnitContext.Provider value={{
            weightUnit,
            setWeightUnit,
            convertWeight,
            formatWeight
        }}>
            {children}
        </WeightUnitContext.Provider>
    )
}

export function useWeightUnit() {
    const context = useContext(WeightUnitContext)
    if (context === undefined) {
        throw new Error('useWeightUnit must be used within a WeightUnitProvider')
    }
    return context
}
