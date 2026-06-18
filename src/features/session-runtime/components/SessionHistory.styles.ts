import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const styles = createSheet({
  container: { flex: 1, backgroundColor: lightColors.semantic.background },
  loadingText: {
    color: lightColors.text.muted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  statsHeader: { flexDirection: 'row', padding: 16, gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: lightColors.text.inverse,
  },
  statBoxLabel: { fontSize: 12, color: lightColors.text.muted, marginTop: 4 },
  searchInput: {
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    color: lightColors.text.inverse,
    fontSize: 16,
  },
  filterRow: { marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  filterChipActive: { backgroundColor: lightColors.semantic.danger },
  filterChipText: {
    color: lightColors.text.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextActive: { color: lightColors.text.inverse },
  list: { flex: 1 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 18, color: lightColors.text.muted, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: lightColors.text.muted },
});
