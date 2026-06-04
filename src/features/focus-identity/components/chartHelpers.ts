import type { FocusScoreHistoryPoint } from '../types';
import { lightColors } from '@/theme/tokens/colors';


export interface ChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function buildScaleX(
  historyLength: number,
  graphWidth: number,
  padding: ChartPadding,
): (index: number) => number {
  return (index: number): number =>
    padding.left + (index / (historyLength - 1 || 1)) * graphWidth;
}

export function buildScaleY(
  minScore: number,
  scoreRange: number,
  graphHeight: number,
  padding: ChartPadding,
): (score: number) => number {
  return (score: number): number =>
    padding.top + graphHeight - ((score - minScore) / scoreRange) * graphHeight;
}

export function buildPathD(
  history: FocusScoreHistoryPoint[],
  scaleX: (i: number) => number,
  scaleY: (s: number) => number,
): string {
  return history
    .map((point: FocusScoreHistoryPoint, i: number) => {
      const x = scaleX(i);
      const y = scaleY(point.score);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function buildAreaD(
  pathD: string,
  scaleX: (i: number) => number,
  historyLength: number,
  padding: ChartPadding,
  graphHeight: number,
): string {
  return `${pathD} L ${scaleX(historyLength - 1)} ${padding.top + graphHeight} L ${padding.left} ${padding.top + graphHeight} Z`;
}

export function getScoreColor(latestScore: number): string {
  if (latestScore >= 800) {return lightColors.semantic.vexGold;}
  if (latestScore >= 740) {return lightColors.text.disabled;}
  if (latestScore >= 670) {return lightColors.text.muted;}
  if (latestScore >= 580) {return lightColors.semantic.success;}
  if (latestScore >= 500) {return lightColors.semantic.success;}
  if (latestScore >= 420) {return lightColors.semantic.warning;}
  return lightColors.semantic.warning;
}

export function computeScoreBounds(
  history: FocusScoreHistoryPoint[],
): { minScore: number; maxScore: number; scoreRange: number } {
  const scores = history.map((h) => h.score);
  const minScore = Math.min(...scores, 300);
  const maxScore = Math.max(...scores, 850);
  const scoreRange = maxScore - minScore || 1;
  return { minScore, maxScore, scoreRange };
}
