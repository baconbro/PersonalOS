import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast } from '../services/toastService';
import './Toast.css';

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const getIcon = () => {
    if (toast.icon) return toast.icon;
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={16} />;
      case 'error':
        return <XCircle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'info':
      default:
        return <Info size={16} />;
    }
  };

  const getTypeClass = () => {
    switch (toast.type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      case 'info':
      default:
        return 'toast-info';
    }
  };

  return (
    <div className={`toast-item ${getTypeClass()} ${isVisible ? 'toast-visible' : 'toast-hidden'}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon()}
        </div>
        <div className="toast-text">
          <div className="toast-title">{toast.title}</div>
          <div className="toast-message">{toast.message}</div>
        </div>
        {toast.action && (
          <button
            className="toast-action-button"
            onClick={toast.action.onClick}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        className="toast-dismiss-button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default ToastItem;
