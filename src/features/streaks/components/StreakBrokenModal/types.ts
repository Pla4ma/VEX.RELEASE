export interface StreakBrokenModalProps {
  visible: boolean;
  brokenStreakDays: number;
  lostMultiplier: number;
  longestStreak: number;
  comebackBonus: { xpMultiplier: number; duration: number };
  coachMessage: string;
  onStartFresh: () => void;
  onDismiss: () => void;
  userId: string;
  onRestoreStreak?: (costGems: number) => Promise<boolean>;
  gemsBalance?: number;
  onRestoreStart?: () => void;
}
