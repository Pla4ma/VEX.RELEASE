import { useTheme } from '../../../theme/ThemeContext';

export interface SessionListItem {
  id: string;
  duration: number;
  qualityGrade: 'S' | 'A' | 'B' | 'C' | 'D';
  xpEarned: number;
  endedAt: string;
  interruptions: number;
}

export interface RecentSessionsListProps {
  sessions: SessionListItem[];
  onViewAll?: () => void;
  onSessionPress?: (sessionId: string) => void;
  isLoading?: boolean;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 5) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function getGradeColor(
  grade: SessionListItem['qualityGrade'],
  theme: ReturnType<typeof useTheme>['theme'],
): string {
  switch (grade) {
    case 'S':
      return theme.colors.accent.purple;
    case 'A':
      return theme.colors.success.DEFAULT;
    case 'B':
      return theme.colors.info.DEFAULT;
    case 'C':
      return theme.colors.text.tertiary;
    case 'D':
      return theme.colors.error.DEFAULT;
    default:
      return theme.colors.text.tertiary;
  }
}
