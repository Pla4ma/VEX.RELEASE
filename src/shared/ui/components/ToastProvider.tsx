import React, {
  useState,
  useRef,
  useCallback,
  createContext,
  useContext,
} from 'react';
import { ToastContainer } from './ToastContainer';
import type {
  ToastItem,
  ToastOptions,
  ToastContextValue,
  ToastProviderProps,
} from './Toast.types';

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 3,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);

  const show = useCallback(
    (options: ToastOptions): string => {
      const id = options.id || `toast-${++idCounter.current}-${Date.now()}`;
      setToasts((prev) => {
        const updated = [
          ...prev.filter(
            (t) => options.priority !== 'high' || t.priority !== 'high',
          ),
          { ...options, id, createdAt: Date.now() },
        ];
        if (options.priority === 'high') {
          const highCount = updated.filter((t) => t.priority === 'high').length;
          return highCount > maxToasts
            ? updated.slice(highCount - maxToasts)
            : updated;
        }
        return updated.slice(-maxToasts);
      });
      return id;
    },
    [maxToasts],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const update = useCallback((id: string, options: Partial<ToastOptions>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...options } : t)),
    );
  }, []);

  return (
    <ToastContext.Provider
      value={{ show, dismiss, dismissAll, update, toasts }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};
