// src/contexts/ModalContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// TypeScript interfaces
export interface ModalData {
  id: string;
  title: string;
  content: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  isMinimized?: boolean;
  position?: { x: number; y: number };
  zIndex?: number;
}

interface ModalContextType {
  modals: ModalData[];
  openModal: (modal: Omit<ModalData, 'id' | 'zIndex'>) => string;
  closeModal: (id: string) => void;
  minimizeModal: (id: string) => void;
  maximizeModal: (id: string) => void;
  bringToFront: (id: string) => void;
}

// Create the context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Provider component
export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalData[]>([]);
  const [nextZIndex, setNextZIndex] = useState(3000);

  const openModal = (modalData: Omit<ModalData, 'id' | 'zIndex'>): string => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newModal: ModalData = {
      ...modalData,
      id,
      zIndex: nextZIndex + 2000,
      isMinimized: false,
      position: { x: 100 + (modals.length * 30), y: 100 + (modals.length * 30) }
    };
    
    setModals(prev => [...prev, newModal]);
    setNextZIndex(prev => prev + 1);
    return id;
  };

  const closeModal = (id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  };

  const minimizeModal = (id: string) => {
    setModals(prev => 
      prev.map(modal => 
        modal.id === id ? { ...modal, isMinimized: true } : modal
      )
    );
  };

  const maximizeModal = (id: string) => {
    setModals(prev => 
      prev.map(modal => 
        modal.id === id ? { ...modal, isMinimized: false } : modal
      )
    );
  };

  const bringToFront = (id: string) => {
    setModals(prev => 
      prev.map(modal => 
        modal.id === id ? { ...modal, zIndex: nextZIndex + 2000 } : modal
      )
    );
    setNextZIndex(prev => prev + 1);
  };

  const value: ModalContextType = {
    modals,
    openModal,
    closeModal,
    minimizeModal,
    maximizeModal,
    bringToFront
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

// Hook to use the modal context
export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};

export default ModalProvider;