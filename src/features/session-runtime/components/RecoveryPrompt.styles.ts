import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const styles = createSheet({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: lightColors.semantic.background,
    borderRadius: 20,
    padding: 24,
  },
  header: { alignItems: 'center', marginBottom: 24 },
  icon: { fontSize: 48, marginBottom: 12 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: lightColors.text.inverse,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: lightColors.text.muted },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.text.muted,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  options: { gap: 12 },
  optionCard: {
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: lightColors.semantic.border,
  },
  optionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  optionIcon: { fontSize: 24, marginRight: 12 },
  optionInfo: { flex: 1 },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text.inverse,
    marginBottom: 2,
  },
  optionDescription: { fontSize: 13, color: lightColors.text.muted },
  penaltyBadge: {
    backgroundColor: 'rgba(244,67,54,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  penaltyText: { fontSize: 12, color: lightColors.semantic.danger },
  abandonSection: { marginTop: 24, alignItems: 'center' },
  orText: { color: lightColors.text.muted, marginBottom: 12 },
  abandonButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: lightColors.semantic.danger,
    borderRadius: 8,
    alignItems: 'center',
  },
  abandonText: {
    color: lightColors.semantic.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  abandonPenalty: {
    fontSize: 12,
    color: lightColors.semantic.danger + '80',
    marginTop: 4,
  },
  helpText: {
    marginTop: 20,
    fontSize: 13,
    color: lightColors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
