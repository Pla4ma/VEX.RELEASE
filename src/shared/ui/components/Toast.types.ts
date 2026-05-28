import type { IconProps } from "../../../icons";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition = "top" | "bottom" | "center";

export interface ToastAction {
  label: string;
  onPress: () => void;
  variant?: "default" | "destructive";
}

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title: string;
  message?: string;
  icon?: IconProps["name"];
  duration?: number;
  position?: ToastPosition;
  action?: ToastAction;
  onDismiss?: () => void;
  persistent?: boolean;
  priority?: "low" | "normal" | "high";
}

export interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
}

export interface ToastContextValue {
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, options: Partial<ToastOptions>) => void;
  toasts: ToastItem[];
}

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
  index: number;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}
