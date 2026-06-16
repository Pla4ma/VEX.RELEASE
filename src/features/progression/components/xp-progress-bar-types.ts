export interface XpProgressBarProps {
  currentXp: number;
  threshold: number;
  level: number;
  totalXp: number;
  isAnimating?: boolean;
  xpJustAdded?: number;
  onLevelUp?: () => void;
}
