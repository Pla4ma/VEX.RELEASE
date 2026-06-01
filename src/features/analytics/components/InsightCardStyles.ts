import { createSheet } from '@/shared/ui/create-sheet';

export type SeverityLevel =
  | 'info'
  | 'positive'
  | 'warning'
  | 'critical'
  | 'celebration';

export const SEVERITY_CONFIG: Record<
  SeverityLevel,
  { color: string; bgColor: string; icon: string }
> = {
  info: {
    color: '#3b82f6',
    bgColor: '#dbeafe',
    icon: '',
  },
  positive: {
    color: '#10b981',
    bgColor: '#d1fae5',
    icon: '',
  },
  warning: {
    color: '#f59e0b',
    bgColor: '#fef3c7',
    icon: '',
  },
  critical: {
    color: '#ef4444',
    bgColor: '#fee2e2',
    icon: '',
  },
  celebration: {
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    icon: '',
  },
};

export function formatMetricName(metric: string): string {
  return metric
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (hours < 1) {
    return 'Just now';
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
}

export function formatActionLabel(actionType: string): string {
  const labels: Record<string, string> = {
    start_session: 'Start Session',
    view_progress: 'View Progress',
    check_challenges: 'Check Challenges',
    invite_friends: 'Invite Friends',
    upgrade_plan: 'Upgrade Plan',
    customize_settings: 'Settings',
  };
  return labels[actionType] || actionType;
}

export const styles = createSheet({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 12,
    borderLeftWidth: 4,
  },
  readContainer: { opacity: 0.8 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { fontSize: 20, marginRight: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12, fontWeight: '500' },
  date: { fontSize: 12, color: '#9ca3af' },
  actions: { flexDirection: 'row', marginTop: 12, gap: 12 },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dismissText: { fontWeight: '500', fontSize: 14 },
});
