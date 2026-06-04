/**
 * ContentReviewScreen Styles
 * Extracted from ContentReviewScreen.tsx for maintainability.
 */

import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const styles = createSheet({
  container: { flex: 1, backgroundColor: lightColors.semantic.obsidian },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: lightColors.text.inverse,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: lightColors.text.muted },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: lightColors.text.muted },
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
    color: lightColors.text.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  hidden: { opacity: 0 },
  contentContainer: {
    backgroundColor: lightColors.semantic.obsidian,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: lightColors.semantic.obsidian,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.semantic.obsidian,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text.inverse,
  },
  contentStats: { fontSize: 12, color: lightColors.text.muted },
  contentScroll: { maxHeight: 300 },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
    color: lightColors.border.light,
    padding: 16,
  },
  contentEditInput: {
    fontSize: 14,
    lineHeight: 22,
    color: lightColors.text.inverse,
    padding: 16,
    minHeight: 300,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.semantic.obsidian,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: lightColors.semantic.obsidian,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.text.inverse,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: lightColors.semantic.obsidian,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.text.muted,
  },
  saveButton: {
    flex: 1,
    backgroundColor: lightColors.accent.blue,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.text.inverse,
  },
  generateButton: {
    backgroundColor: lightColors.accent.blue,
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
    color: lightColors.text.inverse,
  },
  buttonSpinner: { marginRight: 8 },
  processingNote: { marginTop: 16, alignItems: 'center' },
  processingNoteText: { fontSize: 14, color: lightColors.text.muted },
  errorContainer: {
    backgroundColor: lightColors.semantic.danger + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: lightColors.semantic.danger + '40',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.semantic.danger,
    marginBottom: 8,
  },
  errorText: { fontSize: 14, color: lightColors.semantic.danger },
  retryButton: {
    marginTop: 12,
    backgroundColor: lightColors.semantic.danger + '40',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.text.inverse,
  },
});
