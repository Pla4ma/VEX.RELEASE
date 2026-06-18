import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


const styles = createSheet({
  container: {
    backgroundColor: lightColors.semantic.background,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.3)',
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: lightColors.semantic.danger,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { color: lightColors.text.inverse, fontSize: 12, fontWeight: '600' },
  timerContainer: { alignItems: 'center', marginVertical: 24 },
  timer: {
    fontSize: 64,
    fontWeight: '200',
    color: lightColors.text.inverse,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: { fontSize: 14, color: lightColors.text.muted, marginTop: 4 },
  progressContainer: { marginVertical: 16 },
  progressBar: {
    height: 8,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: {
    fontSize: 12,
    color: lightColors.text.muted,
    textAlign: 'center',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: lightColors.semantic.backgroundElevated,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: lightColors.text.inverse },
  statLabel: { fontSize: 12, color: lightColors.text.muted, marginTop: 4 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: { backgroundColor: lightColors.semantic.success },
  secondaryButton: { backgroundColor: lightColors.semantic.warning },
  dangerButton: { backgroundColor: lightColors.semantic.danger },
  buttonText: { color: lightColors.text.inverse, fontSize: 16, fontWeight: '600' },
  loadingText: {
    color: lightColors.text.muted,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: lightColors.semantic.danger,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: lightColors.text.muted,
    fontSize: 18,
    textAlign: 'center',
  },
  emptySubtext: {
    color: lightColors.text.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default styles;
