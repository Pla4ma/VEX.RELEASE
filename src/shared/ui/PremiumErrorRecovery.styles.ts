import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const styles = createSheet({
  container: { padding: 16 },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  icon: { fontSize: 30 },
  content: { alignItems: 'center', marginBottom: 20 },
  wittyMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  errorDetail: { fontSize: 13, textAlign: 'center', marginBottom: 8 },
  retryStatus: { fontSize: 12, marginTop: 4 },
  countdown: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  actions: { gap: 10 },
  retryButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  retryButtonText: {
    color: lightColors.text.inverse,
    fontSize: 15,
    fontWeight: '700',
  },
  fallbackButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  fallbackText: { fontSize: 14, fontWeight: '600' },
  dismissButton: { paddingVertical: 8, alignItems: 'center' },
  dismissText: { fontSize: 13 },
  successCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIcon: { fontSize: 20, fontWeight: '700', marginRight: 12 },
  successText: { fontSize: 14, fontWeight: '600', flex: 1 },
});
