/**
 * First Session Overlay Types
 */

export type TooltipTarget = 'timer' | 'quality' | 'boss';

export interface TooltipStep {
  target: TooltipTarget;
  title: string;
  description: string;
  icon: string;
}

export interface TooltipCardProps {
  step: TooltipStep;
  onNext: () => void;
  onDismiss: () => void;
  isLast: boolean;
}

export interface HighlightRingProps {
  visible: boolean;
  position?: { x: number; y: number };
}

export interface FirstSessionOverlayProps {
  currentStep: number;
  onNext: () => void;
  onDismiss: () => void;
  timerPosition?: { x: number; y: number };
  qualityPosition?: { x: number; y: number };
  bossPosition?: { x: number; y: number };
}

export interface UseFirstSessionOverlayResult {
  showOverlay: boolean;
  currentStep: number;
  advance: () => void;
  dismiss: () => void;
  markCompleted: () => void;
}
