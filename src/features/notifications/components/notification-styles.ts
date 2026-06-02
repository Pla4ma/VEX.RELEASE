import { StyleSheet } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';


export const styles = createSheet({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a2e',
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
    borderBottomColor: '#2a2a4e',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2a2a4e',
  },
  markAllText: {
    fontSize: 12,
    color: '#9e9e9e',
    fontWeight: '600',
  },
  scrollView: { maxHeight: 400 },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
    alignItems: 'flex-start',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e94560',
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
    color: '#fff',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#9e9e9e',
    marginBottom: 8,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: { fontSize: 12, color: '#666' },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  criticalBadge: {
    backgroundColor: '#e94560',
    color: '#fff',
  },
  highBadge: {
    backgroundColor: '#f5a623',
    color: '#000',
  },
  actionButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e94560',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: {
    fontSize: 16,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  dismissText: { color: '#666', fontSize: 18 },
});

export const priorityStyles = {
  critical: styles.criticalBadge,
  high: styles.highBadge,
  normal: {
    backgroundColor: '#2a2a4e',
    color: '#fff',
  },
  low: {
    backgroundColor: '#1a1a2e',
    color: '#666',
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
