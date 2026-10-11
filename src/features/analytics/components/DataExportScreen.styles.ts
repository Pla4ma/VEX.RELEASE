import { vexFire } from "@/theme/tokens/vex-fire";
import { createSheet } from '@/shared/ui/create-sheet';



export const styles = createSheet({
  container: { flex: 1, backgroundColor: vexFire.ember },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: vexFire.cream,
    borderBottomWidth: 1, borderBottomColor: vexFire.border,
  },
  closeButton: { padding: 8 },
  closeIcon: { fontSize: 20, color: vexFire.textMuted },
  headerTitle: { fontSize: 18, fontWeight: '600', color: vexFire.backgroundSoft },
  headerSpacer: { width: 40 },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: vexFire.textMuted, marginBottom: 12,
  },
  description: { fontSize: 14, color: vexFire.textMuted, lineHeight: 20 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionCard: {
    width: '48%', backgroundColor: vexFire.cream, borderRadius: 12,
    padding: 16, borderWidth: 2, borderColor: 'transparent', position: 'relative',
  },
  optionCardSelected: {
    borderColor: vexFire.ember, backgroundColor: vexFire.panelSoft,
  },
  optionIcon: { fontSize: 24, marginBottom: 8 },
  optionLabel: {
    fontSize: 14, fontWeight: '600', color: vexFire.textMuted, marginBottom: 4,
  },
  optionLabelSelected: { color: vexFire.ember },
  optionDescription: { fontSize: 12, color: vexFire.textMuted },
  checkmark: {
    position: 'absolute', top: 8, right: 8, width: 20, height: 20,
    borderRadius: 10, backgroundColor: vexFire.ember,
    justifyContent: 'center', alignItems: 'center',
  },
  checkmarkIcon: { color: vexFire.cream, fontSize: 12, fontWeight: '700' },
  formatRow: { flexDirection: 'row', gap: 12 },
  formatCard: {
    flex: 1, backgroundColor: vexFire.cream, borderRadius: 12,
    padding: 16, borderWidth: 2, borderColor: 'transparent',
  },
  formatCardSelected: {
    borderColor: vexFire.ember, backgroundColor: vexFire.panelSoft,
  },
  formatIcon: { fontSize: 24, marginBottom: 8 },
  formatLabel: {
    fontSize: 14, fontWeight: '600', color: vexFire.textMuted, marginBottom: 4,
  },
  formatLabelSelected: { color: vexFire.ember },
  formatDescription: { fontSize: 12, color: vexFire.textMuted },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: vexFire.cream, padding: 16, borderRadius: 12,
  },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 14, fontWeight: '500', color: vexFire.textMuted, marginBottom: 2 },
  optionSubtitle: { fontSize: 12, color: vexFire.textMuted },
  previewCard: { backgroundColor: vexFire.cream, borderRadius: 12, padding: 16 },
  previewRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: vexFire.ember,
  },
  previewLabel: { fontSize: 14, color: vexFire.textMuted },
  previewValue: { fontSize: 14, fontWeight: '500', color: vexFire.textMuted },
  exportButton: {
    backgroundColor: vexFire.ember, paddingVertical: 16,
    borderRadius: 12, alignItems: 'center', marginBottom: 24,
  },
  exportButtonText: { color: vexFire.cream, fontSize: 16, fontWeight: '600' },
  emptyExports: {
    backgroundColor: vexFire.cream, borderRadius: 12, padding: 24, alignItems: 'center',
  },
  emptyExportsText: { fontSize: 14, color: vexFire.textMuted },
  dangerSection: {
    backgroundColor: vexFire.panelSoft, borderRadius: 12, padding: 16,
    marginTop: 8, marginBottom: 32,
  },
  dangerTitle: { fontSize: 16, fontWeight: '600', color: vexFire.danger, marginBottom: 8 },
  dangerDescription: { fontSize: 14, color: vexFire.danger, marginBottom: 16 },
  dangerButton: {
    backgroundColor: vexFire.danger, paddingVertical: 12,
    borderRadius: 8, alignItems: 'center',
  },
  dangerButtonText: { color: vexFire.cream, fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalContent: {
    backgroundColor: vexFire.cream, borderRadius: 16,
    padding: 24, width: '100%', maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', color: vexFire.backgroundSoft,
    marginBottom: 12, textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14, color: vexFire.textMuted,
    textAlign: 'center', marginBottom: 24, lineHeight: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButtonSecondary: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: vexFire.ember, alignItems: 'center',
  },
  modalButtonSecondaryText: { color: vexFire.textMuted, fontSize: 14, fontWeight: '600' },
  modalButtonPrimary: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: vexFire.ember, alignItems: 'center',
  },
  modalButtonPrimaryText: { color: vexFire.cream, fontSize: 14, fontWeight: '600' },
});
