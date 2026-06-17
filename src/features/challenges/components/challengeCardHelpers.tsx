import { Badge } from '../../../components/Badge';
import { createSheet } from '@/shared/ui/create-sheet';
import type { UserChallengeSummary } from '../schemas';

export function getStatusBadge(
  status: UserChallengeSummary['status'],
): React.ReactNode {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="success">Ready to Claim</Badge>;
    case 'CLAIMED':
      return <Badge variant="secondary">Claimed</Badge>;
    case 'EXPIRED':
      return <Badge variant="error">Expired</Badge>;
    case 'REROLLED':
      return <Badge variant="secondary">Rerolled</Badge>;
    default:
      return null;
  }
}

export function getDifficultyVariant(
  difficulty: string,
): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'success';
    case 'medium':
      return 'primary';
    case 'hard':
      return 'warning';
    case 'expert':
      return 'error';
    default:
      return 'default';
  }
}

export { formatDurationFromMs as formatDuration } from '../../../utils/format-duration';

export const challengeCardStyles = createSheet({
  container: { padding: 16, marginHorizontal: 16, marginBottom: 12 },
  expiredContainer: { opacity: 0.6 },
  header: { marginBottom: 12 },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 14 },
  progressSection: { marginBottom: 12 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: { fontSize: 14, fontWeight: '500' },
  progressPercent: { fontSize: 14, fontWeight: '600' },
  progressBarTrack: { height: 8, borderRadius: 4 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  expiresText: { fontSize: 12, marginTop: 4 },
  rewardRow: { paddingTop: 12, borderTopWidth: 1 },
  rewardText: { fontSize: 14, fontWeight: '500' },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: { flex: 1 },
  rerollButton: { padding: 4 },
});
