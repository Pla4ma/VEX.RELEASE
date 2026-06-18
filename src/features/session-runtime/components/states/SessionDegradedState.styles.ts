import { createSheet } from '@/shared/ui/create-sheet';

export const styles = createSheet({
  container: { flex: 1, padding: 24 },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  warningIcon: { fontSize: 20, marginRight: 8, fontWeight: '700' },
  warningText: { fontSize: 16, fontWeight: '700' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  reason: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  featureIcon: { fontSize: 16, marginRight: 12, marginTop: 2, fontWeight: '700' },
  featureInfo: { flex: 1 },
  featureName: { fontSize: 15 },
  featureUnavailable: {
    textDecorationLine: 'line-through',
  },
  featureReason: { fontSize: 12, marginTop: 2 },
  actions: { gap: 12, marginBottom: 24 },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  endButton: { paddingVertical: 12, alignItems: 'center' },
  endButtonText: { fontSize: 14 },
  explanation: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
