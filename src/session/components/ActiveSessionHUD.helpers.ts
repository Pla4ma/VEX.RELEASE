import type { SessionPhase } from '../types';


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
  if (isPaused) {return '#ffa500';}
  if (isActive) {return '#4caf50';}
  return '#9e9e9e';
};
