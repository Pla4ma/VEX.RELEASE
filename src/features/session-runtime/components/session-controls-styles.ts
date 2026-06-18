/**
 * SessionControls — Shared styles.
 */

import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const styles = createSheet({
  container: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: { backgroundColor: lightColors.semantic.success },
  resumeButton: { backgroundColor: lightColors.semantic.success },
  pauseButton: { backgroundColor: lightColors.semantic.warning },
  abandonButton: { backgroundColor: lightColors.semantic.danger },
  disabled: { opacity: 0.5 },
  buttonText: { color: lightColors.text.inverse, fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: lightColors.semantic.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: lightColors.semantic.danger,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: lightColors.text.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: { flexDirection: 'column', gap: 12 },
  modalButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: lightColors.semantic.success,
  },
  cancelButtonText: {
    color: lightColors.semantic.success,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmAbandonButton: { backgroundColor: lightColors.semantic.danger },
});
