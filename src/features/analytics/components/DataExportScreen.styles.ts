import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const styles = createSheet({
  container: { flex: 1, backgroundColor: lightColors.surface.button },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: lightColors.text.inverse,
    borderBottomWidth: 1, borderBottomColor: lightColors.border.light,
  },
  closeButton: { padding: 8 },
  closeIcon: { fontSize: 20, color: lightColors.text.muted },
  headerTitle: { fontSize: 18, fontWeight: '600', color: lightColors.semantic.backgroundMuted },
  headerSpacer: { width: 40 },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: lightColors.text.muted, marginBottom: 12,
  },
  description: { fontSize: 14, color: lightColors.text.muted, lineHeight: 20 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionCard: {
    width: '48%', backgroundColor: lightColors.text.inverse, borderRadius: 12,
    padding: 16, borderWidth: 2, borderColor: 'transparent', position: 'relative',
  },
  optionCardSelected: {
    borderColor: lightColors.semantic.primary, backgroundColor: lightColors.primary[50],
  },
  optionIcon: { fontSize: 24, marginBottom: 8 },
  optionLabel: {
    fontSize: 14, fontWeight: '600', color: lightColors.text.muted, marginBottom: 4,
  },
  optionLabelSelected: { color: lightColors.semantic.primary },
  optionDescription: { fontSize: 12, color: lightColors.text.muted },
  checkmark: {
    position: 'absolute', top: 8, right: 8, width: 20, height: 20,
    borderRadius: 10, backgroundColor: lightColors.semantic.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  checkmarkIcon: { color: lightColors.text.inverse, fontSize: 12, fontWeight: '700' },
  formatRow: { flexDirection: 'row', gap: 12 },
  formatCard: {
    flex: 1, backgroundColor: lightColors.text.inverse, borderRadius: 12,
    padding: 16, borderWidth: 2, borderColor: 'transparent',
  },
  formatCardSelected: {
    borderColor: lightColors.semantic.primary, backgroundColor: lightColors.primary[50],
  },
  formatIcon: { fontSize: 24, marginBottom: 8 },
  formatLabel: {
    fontSize: 14, fontWeight: '600', color: lightColors.text.muted, marginBottom: 4,
  },
  formatLabelSelected: { color: lightColors.semantic.primary },
  formatDescription: { fontSize: 12, color: lightColors.text.muted },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: lightColors.text.inverse, padding: 16, borderRadius: 12,
  },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 14, fontWeight: '500', color: lightColors.text.muted, marginBottom: 2 },
  optionSubtitle: { fontSize: 12, color: lightColors.text.muted },
  previewCard: { backgroundColor: lightColors.text.inverse, borderRadius: 12, padding: 16 },
  previewRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: lightColors.surface.button,
  },
  previewLabel: { fontSize: 14, color: lightColors.text.muted },
  previewValue: { fontSize: 14, fontWeight: '500', color: lightColors.text.muted },
  exportButton: {
    backgroundColor: lightColors.semantic.primary, paddingVertical: 16,
    borderRadius: 12, alignItems: 'center', marginBottom: 24,
  },
  exportButtonText: { color: lightColors.text.inverse, fontSize: 16, fontWeight: '600' },
  emptyExports: {
    backgroundColor: lightColors.text.inverse, borderRadius: 12, padding: 24, alignItems: 'center',
  },
  emptyExportsText: { fontSize: 14, color: lightColors.text.muted },
  dangerSection: {
    backgroundColor: lightColors.error[50], borderRadius: 12, padding: 16,
    marginTop: 8, marginBottom: 32,
  },
  dangerTitle: { fontSize: 16, fontWeight: '600', color: lightColors.semantic.danger, marginBottom: 8 },
  dangerDescription: { fontSize: 14, color: lightColors.error.light, marginBottom: 16 },
  dangerButton: {
    backgroundColor: lightColors.semantic.danger, paddingVertical: 12,
    borderRadius: 8, alignItems: 'center',
  },
  dangerButtonText: { color: lightColors.text.inverse, fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalContent: {
    backgroundColor: lightColors.text.inverse, borderRadius: 16,
    padding: 24, width: '100%', maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', color: lightColors.semantic.backgroundMuted,
    marginBottom: 12, textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14, color: lightColors.text.muted,
    textAlign: 'center', marginBottom: 24, lineHeight: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButtonSecondary: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: lightColors.surface.button, alignItems: 'center',
  },
  modalButtonSecondaryText: { color: lightColors.text.muted, fontSize: 14, fontWeight: '600' },
  modalButtonPrimary: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: lightColors.semantic.primary, alignItems: 'center',
  },
  modalButtonPrimaryText: { color: lightColors.text.inverse, fontSize: 14, fontWeight: '600' },
});
