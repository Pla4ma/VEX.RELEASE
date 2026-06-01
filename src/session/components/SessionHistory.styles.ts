import { createSheet } from '@/shared/ui/create-sheet';


export const styles = createSheet({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  loadingText: {
    color: '#9e9e9e',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  statsHeader: { flexDirection: 'row', padding: 16, gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  statBoxLabel: { fontSize: 12, color: '#9e9e9e', marginTop: 4 },
  searchInput: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    color: '#fff',
    fontSize: 16,
  },
  filterRow: { marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  filterChipActive: { backgroundColor: '#e94560' },
  filterChipText: {
    color: '#9e9e9e',
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextActive: { color: '#fff' },
  list: { flex: 1 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#9e9e9e', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#666' },
});
