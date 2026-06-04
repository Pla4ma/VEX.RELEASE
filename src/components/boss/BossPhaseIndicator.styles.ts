import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const styles = createSheet({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 16,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseName: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  enragedBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  enragedText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  progressSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.surface.pressed,
  },
  thresholds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  thresholdContainer: { alignItems: 'center' },
  thresholdDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: lightColors.surface.pressed,
  },
  thresholdDotActive: { backgroundColor: lightColors.text.tertiary },
  thresholdDotPhase: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: lightColors.text.tertiary,
  },
  thresholdLabel: {
    fontSize: 10,
    color: lightColors.text.disabled,
    marginTop: 4,
  },
  thresholdLabelActive: { color: lightColors.text.tertiary, fontWeight: '600' },
  healthBarContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  healthBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: lightColors.surface.pressed,
    borderRadius: 6,
    overflow: 'hidden',
  },
  healthBar: { height: '100%', borderRadius: 6 },
  healthPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: lightColors.text.tertiary,
    minWidth: 45,
  },
  nextPhaseText: {
    fontSize: 12,
    color: lightColors.text.muted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  descriptionSection: {
    padding: 16,
    backgroundColor: lightColors.semantic.background,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.surface.pressed,
  },
  description: {
    fontSize: 14,
    color: lightColors.text.tertiary,
    fontStyle: 'italic',
  },
  mechanicWarning: {
    backgroundColor: lightColors.error.light,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mechanicTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: lightColors.semantic.danger,
  },
  mechanicTimer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: lightColors.semantic.danger,
  },
  tipsSection: { padding: 16 },
  tipsHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: lightColors.text.muted,
    marginBottom: 8,
  },
  tip: {
    fontSize: 12,
    color: lightColors.text.tertiary,
    marginBottom: 4,
    lineHeight: 18,
  },
});
