// src/hooks/useModal.tsx
import { ReactNode } from 'react';
import { useModalContext, ModalData } from '../contexts/ModalContext.tsx';

// Custom hook for easy modal management
export const useModal = () => {
  const { openModal, closeModal, minimizeModal, maximizeModal, bringToFront } = useModalContext();

  // Helper function to open a modal with common patterns
  const openTaskCreator = () => {
    return openModal({
      title: 'Create New Task',
      content: <div>Task Creator Content Goes Here</div>, // You'll replace this with your actual component
      size: 'xlarge'
    });
  };


  const openFamilySettings = () => {
    return openModal({
      title: 'Family Settings',
      content: <div>Family Settings Content Goes Here</div>, // You'll replace this with your actual component
      size: 'medium'
    });
  };

  const openTool = (toolName: string, toolContent: ReactNode, size: ModalData['size'] = 'large') => {
    return openModal({
      title: toolName,
      content: toolContent,
      size
    });
  };

  // Generic modal opener
  const open = (title: string, content: ReactNode, size: ModalData['size'] = 'medium') => {
    return openModal({
      title,
      content,
      size
    });
  };

  return {
    // Basic modal functions
    open,
    close: closeModal,
    minimize: minimizeModal,
    maximize: maximizeModal,
    bringToFront,
    
    // Specific modal openers for common use cases
    openTaskCreator,
    openFamilySettings,
    openTool
  };
};

export default useModal;