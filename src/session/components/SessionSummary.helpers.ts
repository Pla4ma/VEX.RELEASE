

export { formatDuration } from '../../utils/format-duration';

export type MoodType = 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | 'TERRIBLE' | null;

export const getMoodEmoji = (m: MoodType): string => {
  switch (m) {
    case 'GREAT':
      return '🤩';
    case 'GOOD':
      return '😊';
    case 'NEUTRAL':
      return '😐';
    case 'BAD':
      return '😕';
    case 'TERRIBLE':
      return '😫';
    default:
      return '🤔';
  }
};

export const getGrade = (score: number): { letter: string; color: string } => {
  if (score >= 900) {
    return { letter: 'S', color: '#ffd700' };
  }
  if (score >= 800) {
    return { letter: 'A', color: '#4caf50' };
  }
  if (score >= 700) {
    return { letter: 'B', color: '#8bc34a' };
  }
  if (score >= 600) {
    return { letter: 'C', color: '#ffc107' };
  }
  if (score >= 500) {
    return { letter: 'D', color: '#ff9800' };
  }
  return { letter: 'F', color: '#f44336' };
};
