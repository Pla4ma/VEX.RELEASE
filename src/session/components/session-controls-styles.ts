/**
 * SessionControls — Shared styles.
 */

import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';

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
  startButton: { backgroundColor: launchColors.hex_4caf50 },
  resumeButton: { backgroundColor: launchColors.hex_4caf50 },
  pauseButton: { backgroundColor: launchColors.hex_ffa500 },
  abandonButton: { backgroundColor: launchColors.hex_e94560 },
  disabled: { opacity: 0.5 },
  buttonText: { color: launchColors.hex_fff, fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: launchColors.rgb_0_0_0_0_7,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: launchColors.hex_1a1a2e,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: launchColors.hex_e94560,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: launchColors.hex_9e9e9e,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: { flexDirection: 'column', gap: 12 },
  modalButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: launchColors.hex_4caf50,
  },
  cancelButtonText: {
    color: launchColors.hex_4caf50,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmAbandonButton: { backgroundColor: launchColors.hex_e94560 },
});
