import { createSheet } from '@/shared/ui/create-sheet';


export const styles = createSheet({
  container: { alignItems: 'center', paddingVertical: 24 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: { fontSize: 40 },
  stateCard: { width: '100%' },
  selectedCard: { borderWidth: 2, borderColor: '#3b82f6' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});
