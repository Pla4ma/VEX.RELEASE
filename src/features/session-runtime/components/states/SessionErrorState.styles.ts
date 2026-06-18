import { createSheet } from '@/shared/ui/create-sheet';

export const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  errorDetails: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorCode: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorHint: { fontSize: 12, marginTop: 4 },
  actions: { width: '100%', gap: 12, marginBottom: 32 },
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
  supportButton: { paddingVertical: 12, alignItems: 'center' },
  supportButtonText: { fontSize: 14 },
  recoveryInfo: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1,
  },
  recoveryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recoveryText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
