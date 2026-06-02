import { createSheet } from '@/shared/ui/create-sheet';


export const styles = createSheet({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  closeButton: { padding: 8 },
  closeIcon: { fontSize: 20, color: '#6b7280' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  headerSpacer: { width: 40 },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12,
  },
  description: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionCard: {
    width: '48%', backgroundColor: '#ffffff', borderRadius: 12,
    padding: 16, borderWidth: 2, borderColor: 'transparent', position: 'relative',
  },
  optionCardSelected: {
    borderColor: '#6366f1', backgroundColor: '#eef2ff',
  },
  optionIcon: { fontSize: 24, marginBottom: 8 },
  optionLabel: {
    fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4,
  },
  optionLabelSelected: { color: '#6366f1' },
  optionDescription: { fontSize: 12, color: '#9ca3af' },
  checkmark: {
    position: 'absolute', top: 8, right: 8, width: 20, height: 20,
    borderRadius: 10, backgroundColor: '#6366f1',
    justifyContent: 'center', alignItems: 'center',
  },
  checkmarkIcon: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  formatRow: { flexDirection: 'row', gap: 12 },
  formatCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 12,
    padding: 16, borderWidth: 2, borderColor: 'transparent',
  },
  formatCardSelected: {
    borderColor: '#6366f1', backgroundColor: '#eef2ff',
  },
  formatIcon: { fontSize: 24, marginBottom: 8 },
  formatLabel: {
    fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4,
  },
  formatLabelSelected: { color: '#6366f1' },
  formatDescription: { fontSize: 12, color: '#9ca3af' },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ffffff', padding: 16, borderRadius: 12,
  },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 2 },
  optionSubtitle: { fontSize: 12, color: '#9ca3af' },
  previewCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16 },
  previewRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  previewLabel: { fontSize: 14, color: '#6b7280' },
  previewValue: { fontSize: 14, fontWeight: '500', color: '#374151' },
  exportButton: {
    backgroundColor: '#6366f1', paddingVertical: 16,
    borderRadius: 12, alignItems: 'center', marginBottom: 24,
  },
  exportButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  emptyExports: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 24, alignItems: 'center',
  },
  emptyExportsText: { fontSize: 14, color: '#9ca3af' },
  dangerSection: {
    backgroundColor: '#fef2f2', borderRadius: 12, padding: 16,
    marginTop: 8, marginBottom: 32,
  },
  dangerTitle: { fontSize: 16, fontWeight: '600', color: '#ef4444', marginBottom: 8 },
  dangerDescription: { fontSize: 14, color: '#f87171', marginBottom: 16 },
  dangerButton: {
    backgroundColor: '#ef4444', paddingVertical: 12,
    borderRadius: 8, alignItems: 'center',
  },
  dangerButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff', borderRadius: 16,
    padding: 24, width: '100%', maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', color: '#111827',
    marginBottom: 12, textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14, color: '#6b7280',
    textAlign: 'center', marginBottom: 24, lineHeight: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButtonSecondary: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: '#f3f4f6', alignItems: 'center',
  },
  modalButtonSecondaryText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
  modalButtonPrimary: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: '#6366f1', alignItems: 'center',
  },
  modalButtonPrimaryText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
});
