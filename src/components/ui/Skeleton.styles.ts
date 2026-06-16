import { createSheet } from '@/shared/ui/create-sheet';

export const skeletonStyles = createSheet({
  container: { width: '100%' },
  skeleton: { overflow: 'hidden' },
  card: { borderRadius: 12, padding: 16, marginVertical: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardHeaderText: { marginLeft: 12, gap: 4 },
  cardContent: { gap: 8 },
  list: { gap: 8 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  listItemContent: { flex: 1, gap: 4 },
});