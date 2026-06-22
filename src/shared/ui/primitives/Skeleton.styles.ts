import { createSheet } from '@/shared/ui/create-sheet';

export const skeletonStyles = createSheet({
  container: { overflow: 'hidden' },
  skeleton: { overflow: 'hidden', position: 'relative' },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    width: 100,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cardContent: { flex: 1, marginLeft: 16, gap: 8 },
  cardTitle: { marginBottom: 8 },
  list: { gap: 12 },
  listItem: { marginBottom: 8 },
  chart: { borderRadius: 12, padding: 16 },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
});
