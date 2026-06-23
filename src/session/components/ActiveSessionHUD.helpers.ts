import type { SessionPhase } from '../types';
import { lightColors } from '@/theme/tokens/colors';


export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getPhaseLabel = (phase: SessionPhase): string => {
  switch (phase) {
    case 'FOCUS':
      return '🔥 Focus Time';
    case 'SHORT_BREAK':
      return '☕ Short Break';
    case 'LONG_BREAK':
      return '🌴 Long Break';
    case 'PREPARATION':
      return '📝 Preparation';
    case 'REVIEW':
      return '✅ Review';
    default:
      return 'Session';
  }
};

export const getStatusColor = (
  isPaused: boolean,
  isActive: boolean,
): string => {
  if (isPaused) {return lightColors.semantic.warning;}
  if (isActive) {return lightColors.semantic.success;}
  return lightColors.text.muted;
};

export const getSessionStatusLabel = (
  isPaused: boolean,
  isActive: boolean,
): string => {
  if (isPaused) {return 'PAUSED';}
  if (isActive) {return 'ACTIVE';}
  return 'INACTIVE';
};
