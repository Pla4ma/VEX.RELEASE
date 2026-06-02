/**
 * SessionControls — Shared styles.
 */

import { createSheet } from '@/shared/ui/create-sheet';


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
  startButton: { backgroundColor: '#4caf50' },
  resumeButton: { backgroundColor: '#4caf50' },
  pauseButton: { backgroundColor: '#ffa500' },
  abandonButton: { backgroundColor: '#e94560' },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e94560',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#9e9e9e',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: { flexDirection: 'column', gap: 12 },
  modalButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  cancelButtonText: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmAbandonButton: { backgroundColor: '#e94560' },
});
