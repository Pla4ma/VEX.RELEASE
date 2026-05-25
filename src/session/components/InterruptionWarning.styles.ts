import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';

export const styles = createSheet({
  overlay: {
    flex: 1,
    backgroundColor: launchColors.rgb_0_0_0_0_85,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: launchColors.hex_1a1a2e,
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
    color: launchColors.hex_fff,
    marginBottom: 8,
  },
  interruptionType: {
    fontSize: 16,
    color: launchColors.hex_9e9e9e,
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
    color: launchColors.hex_9e9e9e,
    marginTop: 4,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 4,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: 4 },
  actions: { width: '100%', gap: 12 },
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  resumeButton: { backgroundColor: launchColors.hex_4caf50 },
  streakSaveButton: { backgroundColor: launchColors.hex_ff6b35 },
  abandonButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: launchColors.hex_e94560,
  },
  buttonText: { color: launchColors.hex_fff, fontSize: 16, fontWeight: '600' },
  abandonButtonText: {
    color: launchColors.hex_e94560,
    fontSize: 16,
    fontWeight: '600',
  },
  penaltyWarning: {
    marginTop: 16,
    fontSize: 12,
    color: launchColors.hex_f44336,
    textAlign: 'center',
  },
});
