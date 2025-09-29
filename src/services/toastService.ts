// Toast Service for Firebase Operations and General Notifications

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // milliseconds, 0 for persistent
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
}

export type ToastListener = (toasts: Toast[]) => void;

class ToastService {
  private static instance: ToastService;
  private toasts: Toast[] = [];
  private listeners: ToastListener[] = [];

  private constructor() {}

  static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    }
    return ToastService.instance;
  }

  // Show a toast notification
  show(toast: Omit<Toast, 'id' | 'timestamp'>): string {
    const newToast: Toast = {
      ...toast,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      duration: toast.duration ?? 4000, // Default 4 seconds
    };

    this.toasts.unshift(newToast);
    
    // Keep only last 5 toasts
    if (this.toasts.length > 5) {
      this.toasts = this.toasts.slice(0, 5);
    }

    this.notifyListeners();

    // Auto-dismiss if duration is set
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.dismiss(newToast.id);
      }, newToast.duration);
    }

    return newToast.id;
  }

  // Firebase-specific convenience methods
  showFirebaseSuccess(operation: string, entityType: string, entityName?: string): string {
    const message = entityName 
      ? `${entityType} "${entityName}" ${operation} successfully`
      : `${entityType} ${operation} successfully`;
    
    return this.show({
      title: 'Saved',
      message,
      type: 'success',
      icon: '✅',
      duration: 3000
    });
  }

  showFirebaseError(operation: string, entityType: string, error: string): string {
    return this.show({
      title: 'Save Failed',
      message: `Failed to ${operation} ${entityType}: ${error}`,
      type: 'error',
      icon: '❌',
      duration: 6000
    });
  }

  // Quick convenience methods
  success(title: string, message: string, duration?: number): string {
    return this.show({ title, message, type: 'success', duration });
  }

  error(title: string, message: string, duration?: number): string {
    return this.show({ title, message, type: 'error', duration });
  }

  info(title: string, message: string, duration?: number): string {
    return this.show({ title, message, type: 'info', duration });
  }

  warning(title: string, message: string, duration?: number): string {
    return this.show({ title, message, type: 'warning', duration });
  }

  // Dismiss a specific toast
  dismiss(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  // Dismiss all toasts
  dismissAll(): void {
    this.toasts = [];
    this.notifyListeners();
  }

  // Get current toasts
  getToasts(): Toast[] {
    return [...this.toasts];
  }

  // Subscribe to toast updates
  subscribe(listener: ToastListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getToasts()));
  }
}

export const toastService = ToastService.getInstance();
