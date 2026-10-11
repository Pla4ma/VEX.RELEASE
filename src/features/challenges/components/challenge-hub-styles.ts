import { createSheet } from '@/shared/ui/create-sheet';
import { vexFire } from '@/theme/tokens/vex-fire';


export const styles = createSheet({
  container: { flex: 1 },
  content: { padding: 16 },
  loadingText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: vexFire.textMuted,
  },
  statsCard: { padding: 16, marginBottom: 12 },
  statsTitle: { color: vexFire.cream, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: vexFire.ember,
  },
  statLabel: { fontSize: 12, color: vexFire.textMuted, marginTop: 2 },
  overallProgress: { marginTop: 8 },
  filterContainer: { marginBottom: 12 },
  filterContent: { gap: 8, paddingHorizontal: 4 },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: vexFire.panel,
  },
  filterTabActive: { backgroundColor: vexFire.ember },
  filterText: { fontSize: 13, fontWeight: '500', color: vexFire.textMuted },
  filterTextActive: { color: vexFire.background },
  streakCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: vexFire.backgroundSoft,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakTitle: { color: vexFire.cream, fontSize: 16, fontWeight: '600' },
  streakDescription: {
    fontSize: 13,
    color: vexFire.textMuted,
    marginBottom: 12,
  },
  streakDays: { flexDirection: 'row', gap: 8 },
  streakDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: vexFire.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDayCompleted: { backgroundColor: vexFire.amber },
  streakDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: vexFire.textMuted,
  },
  streakDayTextCompleted: { color: vexFire.background },
  listSection: { marginTop: 8 },
  listTitle: { color: vexFire.cream, fontSize: 18, fontWeight: '600', marginBottom: 12 },
  emptyCard: { padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  emptyText: { fontSize: 14, color: vexFire.textMuted, textAlign: 'center' },
});
