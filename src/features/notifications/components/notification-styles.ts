import { StyleSheet } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const styles = createSheet({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: lightColors.semantic.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.semantic.backgroundElevated,
  },
  title: { fontSize: 18, fontWeight: '700', color: lightColors.text.inverse },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: lightColors.semantic.backgroundElevated,
  },
  markAllText: {
    fontSize: 12,
    color: lightColors.text.muted,
    fontWeight: '600',
  },
  scrollView: { maxHeight: 400 },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.semantic.backgroundElevated,
    alignItems: 'flex-start',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: lightColors.semantic.danger,
    marginRight: 12,
    marginTop: 6,
  },
  readIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    marginRight: 12,
    marginTop: 6,
  },
  content: { flex: 1 },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text.inverse,
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: lightColors.text.muted,
    marginBottom: 8,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: { fontSize: 12, color: lightColors.text.muted },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  criticalBadge: {
    backgroundColor: lightColors.semantic.danger,
    color: lightColors.text.inverse,
  },
  highBadge: {
    backgroundColor: lightColors.semantic.warning,
    color: lightColors.text.primary,
  },
  actionButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: lightColors.semantic.danger,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: lightColors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: {
    fontSize: 16,
    color: lightColors.text.muted,
    textAlign: 'center',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: lightColors.semantic.backgroundElevated,
  },
  closeButtonText: {
    fontSize: 16,
    color: lightColors.text.inverse,
    fontWeight: '600',
  },
  dismissText: { color: lightColors.text.muted, fontSize: 18 },
});

export const priorityStyles = {
  critical: styles.criticalBadge,
  high: styles.highBadge,
  normal: {
    backgroundColor: lightColors.semantic.backgroundElevated,
    color: lightColors.text.inverse,
  },
  low: {
    backgroundColor: lightColors.semantic.background,
    color: lightColors.text.muted,
  },
};

export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${days}d ago`;
}
