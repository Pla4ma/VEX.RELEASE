/**
 * Live Focusing Widget — shared types
 */

export interface LiveFocusingData {
  totalCount: number;
  friendsCount: number;
  squadCount: number;
  sampleAvatars?: Array<{ url?: string; initials: string }>;
  trend?: 'up' | 'down' | 'stable';
  trendPercent?: number;
}

export interface LiveFocusingWidgetProps {
  data: LiveFocusingData;
  onPress?: () => void;
  compact?: boolean;
  isLoading?: boolean;
}
