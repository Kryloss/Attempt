'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface DateContextType {
    currentDate: Date
    setCurrentDate: (date: Date) => void
    navigateDate: (direction: 'prev' | 'next') => void
    isDateSwitchBlocked: boolean
    dateSwitchDelay: number
    showCalendar: boolean
    setShowCalendar: (show: boolean) => void
    calendarMonth: Date
    setCalendarMonth: (date: Date) => void
    workoutDates: Set<string>
    setWorkoutDates: (dates: Set<string> | ((prev: Set<string>) => Set<string>)) => void
}

const DateContext = createContext<DateContextType | undefined>(undefined)

export function DateProvider({ children }: { children: ReactNode }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [isDateSwitchBlocked, setIsDateSwitchBlocked] = useState(false)
    const [dateSwitchDelay, setDateSwitchDelay] = useState(0)
    const [showCalendar, setShowCalendar] = useState(false)
    const [calendarMonth, setCalendarMonth] = useState(new Date())
    const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set())

    const handleSetWorkoutDates = (dates: Set<string> | ((prev: Set<string>) => Set<string>)) => {
        if (typeof dates === 'function') {
            setWorkoutDates(dates)
        } else {
            setWorkoutDates(dates)
        }
    }

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)
        if (direction === 'prev') {
            newDate.setDate(newDate.getDate() - 1)
        } else {
            newDate.setDate(newDate.getDate() + 1)
        }
        setCurrentDate(newDate)
    }

    const value: DateContextType = {
        currentDate,
        setCurrentDate,
        navigateDate,
        isDateSwitchBlocked,
        dateSwitchDelay,
        showCalendar,
        setShowCalendar,
        calendarMonth,
        setCalendarMonth,
        workoutDates,
        setWorkoutDates: handleSetWorkoutDates
    }

    return (
        <DateContext.Provider value={value}>
            {children}
        </DateContext.Provider>
    )
}

export function useDateContext(): DateContextType {
    const context = useContext(DateContext)
    if (context === undefined) {
        throw new Error('useDateContext must be used within a DateProvider')
    }
    return context
}
