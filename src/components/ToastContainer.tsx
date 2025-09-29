import React, { useState, useEffect } from 'react';
import { toastService } from '../services/toastService';
import type { Toast } from '../services/toastService';
import ToastItem from './ToastItem';
import './ToastContainer.css';

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Subscribe to toast updates
    const unsubscribe = toastService.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });

    // Get initial toasts
    setToasts(toastService.getToasts());

    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    toastService.dismiss(id);
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
