'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ModalContextType {
    openModals: Set<string>
    isAnyModalOpen: boolean
    openModal: (modalId: string) => void
    closeModal: (modalId: string) => void
    closeAllModals: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
    const [openModals, setOpenModals] = useState<Set<string>>(new Set())

    const openModal = (modalId: string) => {
        // Ensure only one modal is open at a time
        setOpenModals(new Set([modalId]))
    }

    const closeModal = (modalId: string) => {
        setOpenModals(prev => {
            const newSet = new Set(prev)
            newSet.delete(modalId)
            return newSet
        })
    }

    const closeAllModals = () => {
        setOpenModals(new Set())
    }

    const isAnyModalOpen = openModals.size > 0

    return (
        <ModalContext.Provider
            value={{
                openModals,
                isAnyModalOpen,
                openModal,
                closeModal,
                closeAllModals
            }}
        >
            {children}
        </ModalContext.Provider>
    )
}

export function useModal() {
    const context = useContext(ModalContext)
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider')
    }
    return context
}
