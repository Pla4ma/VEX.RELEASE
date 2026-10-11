/**
 * ContentReviewScreen Styles
 * Extracted from ContentReviewScreen.tsx for maintainability.
 */

import { createSheet } from '@/shared/ui/create-sheet';
import { vexFire } from '@/theme/tokens/vex-fire';


export const styles = createSheet({
  container: { flex: 1, backgroundColor: vexFire.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: vexFire.cream,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: vexFire.textMuted },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: vexFire.textMuted },
  statusContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusLabel: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  statusDescription: {
    fontSize: 14,
    color: vexFire.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  hidden: { opacity: 0 },
  contentContainer: {
    backgroundColor: vexFire.background,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: vexFire.background,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: vexFire.background,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: vexFire.cream,
  },
  contentStats: { fontSize: 12, color: vexFire.textMuted },
  contentScroll: { maxHeight: 300 },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
    color: vexFire.textSecondary,
    padding: 16,
  },
  contentEditInput: {
    fontSize: 14,
    lineHeight: 22,
    color: vexFire.cream,
    padding: 16,
    minHeight: 300,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: vexFire.background,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: vexFire.background,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: vexFire.cream,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: vexFire.background,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: vexFire.textMuted,
  },
  saveButton: {
    flex: 1,
    backgroundColor: vexFire.ember,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: vexFire.cream,
  },
  generateButton: {
    backgroundColor: vexFire.ember,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  generateButtonDisabled: { opacity: 0.7 },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: vexFire.cream,
  },
  buttonSpinner: { marginRight: 8 },
  processingNote: { marginTop: 16, alignItems: 'center' },
  processingNoteText: { fontSize: 14, color: vexFire.textMuted },
  errorContainer: {
    backgroundColor: vexFire.danger + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: vexFire.danger + '40',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: vexFire.danger,
    marginBottom: 8,
  },
  errorText: { fontSize: 14, color: vexFire.danger },
  retryButton: {
    marginTop: 12,
    backgroundColor: vexFire.danger + '40',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: vexFire.cream,
  },
});
