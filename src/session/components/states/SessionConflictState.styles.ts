import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


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
  selectedCard: { borderWidth: 2, borderColor: lightColors.accent.blue },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: {
    color: lightColors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },
});
