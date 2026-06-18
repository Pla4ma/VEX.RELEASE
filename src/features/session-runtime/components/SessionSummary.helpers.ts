import { lightColors } from '@/theme/tokens/colors';


export { formatDuration } from '../../../utils/format-duration';

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
    return { letter: 'S', color: lightColors.semantic.vexGold };
  }
  if (score >= 800) {
    return { letter: 'A', color: lightColors.semantic.success };
  }
  if (score >= 700) {
    return { letter: 'B', color: lightColors.semantic.success };
  }
  if (score >= 600) {
    return { letter: 'C', color: lightColors.semantic.warning };
  }
  if (score >= 500) {
    return { letter: 'D', color: lightColors.semantic.warning };
  }
  return { letter: 'F', color: lightColors.semantic.danger };
};
