import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const styles = createSheet({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: lightColors.semantic.background,
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
    color: lightColors.text.inverse,
    marginBottom: 8,
  },
  interruptionType: {
    fontSize: 16,
    color: lightColors.text.muted,
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
    color: lightColors.text.muted,
    marginTop: 4,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 4,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: 4 },
  actions: { width: '100%', gap: 12 },
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  resumeButton: { backgroundColor: lightColors.semantic.success },
  streakSaveButton: { backgroundColor: lightColors.semantic.warning },
  abandonButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: lightColors.semantic.danger,
  },
  buttonText: { color: lightColors.text.inverse, fontSize: 16, fontWeight: '600' },
  abandonButtonText: {
    color: lightColors.semantic.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  penaltyWarning: {
    marginTop: 16,
    fontSize: 12,
    color: lightColors.semantic.danger,
    textAlign: 'center',
  },
});
