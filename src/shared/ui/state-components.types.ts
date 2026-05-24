import type React from "react";
import type { ViewStyle } from "react-native";

export interface StateComponentProps {
  style?: ViewStyle;
  testID?: string;
}
export interface LoadingStateProps extends StateComponentProps {
  message?: string;
  submessage?: string;
  progress?: number;
  showProgress?: boolean;
  size?: "small" | "large";
  variant?: "spinner" | "skeleton" | "progress";
  skeletonItems?: number;
}
export interface EmptyStateProps extends StateComponentProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}
export interface ErrorStateProps extends StateComponentProps {
  error: Error | string;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  showDetails?: boolean;
}
export interface SuccessStateProps extends StateComponentProps {
  icon?: string;
  title: string;
  subtitle?: string;
  autoDismiss?: boolean;
  dismissDelay?: number;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}
export type SkeletonWidth = number | `${number}%`;
export interface SkeletonProps extends StateComponentProps {
  variant?: "card" | "list" | "text" | "avatar" | "chip";
  count?: number;
  width?: SkeletonWidth;
  height?: number;
  circle?: boolean;
  animated?: boolean;
}
export interface DisabledStateProps extends StateComponentProps {
  reason?: string;
  overlay?: boolean;
  children: React.ReactNode;
}
export interface StateWrapperProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  isSuccess?: boolean;
  loadingProps?: Omit<LoadingStateProps, "testID">;
  emptyProps?: Omit<EmptyStateProps, "testID">;
  errorProps?: Omit<ErrorStateProps, "error" | "testID">;
  successProps?: Omit<SuccessStateProps, "testID">;
  children: React.ReactNode;
  testID?: string;
}
