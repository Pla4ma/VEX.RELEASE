import type { ViewStyle } from "react-native";

export type StepStatus =
  | "pending"
  | "active"
  | "completed"
  | "error"
  | "disabled";

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  status: StepStatus;
  errorMessage?: string;
  disabled?: boolean;
}

export interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "numbers" | "dots";
  showDescriptions?: boolean;
  allowClick?: boolean;
  onStepPress?: (stepIndex: number, step: Step) => void;
  style?: ViewStyle;
}

export interface StepIndicatorProps {
  status: StepStatus;
  index: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "numbers" | "dots";
  icon?: string;
  title?: string;
  description?: string;
  showDescription?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}
