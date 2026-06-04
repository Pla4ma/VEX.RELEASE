import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const styles = createSheet({
  container: { flex: 1 },
  content: { padding: 16 },
  loadingText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: lightColors.text.muted,
  },
  statsCard: { padding: 16, marginBottom: 12 },
  statsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightColors.accent.blue,
  },
  statLabel: { fontSize: 12, color: lightColors.text.muted, marginTop: 2 },
  overallProgress: { marginTop: 8 },
  filterContainer: { marginBottom: 12 },
  filterContent: { gap: 8, paddingHorizontal: 4 },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: lightColors.surface.button,
  },
  filterTabActive: { backgroundColor: lightColors.accent.blue },
  filterText: { fontSize: 13, fontWeight: '500', color: lightColors.text.muted },
  filterTextActive: { color: lightColors.text.inverse },
  streakCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: lightColors.warning[50],
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakTitle: { fontSize: 16, fontWeight: '600' },
  streakDescription: {
    fontSize: 13,
    color: lightColors.text.muted,
    marginBottom: 12,
  },
  streakDays: { flexDirection: 'row', gap: 8 },
  streakDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightColors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDayCompleted: { backgroundColor: lightColors.semantic.warning },
  streakDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: lightColors.text.muted,
  },
  streakDayTextCompleted: { color: lightColors.text.inverse },
  listSection: { marginTop: 8 },
  listTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  emptyCard: { padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  emptyText: { fontSize: 14, color: lightColors.text.muted, textAlign: 'center' },
});
