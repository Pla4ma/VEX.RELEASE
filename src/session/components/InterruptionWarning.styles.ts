import { createSheet } from '@/shared/ui/create-sheet';


export const styles = createSheet({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIcon: { fontSize: 40 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  interruptionType: {
    fontSize: 16,
    color: '#9e9e9e',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  countdownContainer: { alignItems: 'center', marginBottom: 16 },
  countdown: { fontSize: 48, fontWeight: '700', fontVariant: ['tabular-nums'] },
  countdownLabel: {
    fontSize: 14,
    color: '#9e9e9e',
    marginTop: 4,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: 4 },
  actions: { width: '100%', gap: 12 },
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  resumeButton: { backgroundColor: '#4caf50' },
  streakSaveButton: { backgroundColor: '#ff6b35' },
  abandonButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  abandonButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
  penaltyWarning: {
    marginTop: 16,
    fontSize: 12,
    color: '#f44336',
    textAlign: 'center',
  },
});
