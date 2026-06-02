import type { Theme } from '../../../theme/types';

type DisplayState = { label: string; color: string };

export function getGradeDisplay(
  score: number,
  theme: Theme,
): DisplayState & { letter: string } {
  if (score >= 900) {
    return {
      letter: 'S',
      label: 'Legendary Run',
      color: theme.colors.warning.light,
    };
  }
  if (score >= 800) {
    return {
      letter: 'A',
      label: 'Dominant Focus',
      color: theme.colors.success.light,
    };
  }
  if (score >= 700) {
    return {
      letter: 'B',
      label: 'Sharp Session',
      color: theme.colors.success.DEFAULT,
    };
  }
  if (score >= 600) {
    return {
      letter: 'C',
      label: 'Solid Work',
      color: theme.colors.warning.DEFAULT,
    };
  }
  if (score >= 500) {
    return {
      letter: 'D',
      label: 'Still Progress',
      color: theme.colors.error.light,
    };
  }
  return {
    letter: 'F',
    label: 'Come Back Stronger',
    color: theme.colors.error.DEFAULT,
  };
}

export function getPurityDisplay(score: number, theme: Theme): DisplayState {
  if (score >= 90) {
    return { label: 'Elite Focus', color: theme.colors.warning.light };
  }
  if (score >= 70) {
    return { label: 'Good Focus', color: theme.colors.success.DEFAULT };
  }
  return { label: 'Distracted', color: theme.colors.error.light };
}
