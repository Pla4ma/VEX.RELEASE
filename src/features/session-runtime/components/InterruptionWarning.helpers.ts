import { lightColors } from '@/theme/tokens/colors';


export type Severity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';

export interface InterruptionWarningProps {
  isVisible: boolean;
  severity: Severity;
  countdownSeconds: number;
  interruptionType: string;
  onResume: () => void;
  onAbandon: () => void;
  onUseStreakSave?: () => void;
  hasStreakSave?: boolean;
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
      return lightColors.semantic.danger;
    case 'MAJOR':
      return lightColors.semantic.warning;
    case 'MODERATE':
      return lightColors.semantic.warning;
    case 'MINOR':
      return lightColors.semantic.warning;
    default:
      return lightColors.text.muted;
  }
}

export function getSeverityMessage(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'Resume now to keep this session intact.';
    case 'MAJOR':
      return 'Big pause. You can still return cleanly.';
    case 'MODERATE':
      return 'Take a breath, then come back.';
    case 'MINOR':
      return 'Small pause. Keep the thread.';
    default:
      return 'Focus paused.';
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
