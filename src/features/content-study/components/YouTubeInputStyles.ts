import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const styles = createSheet({
  container: { gap: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  clearButton: { padding: 4 },
  messageContainer: { gap: 4 },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  messageText: { fontSize: 13, flex: 1 },
  previewCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: lightColors.text.primary,
  },
  previewInfo: { padding: 12, gap: 4 },
  videoTitle: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  channelName: { fontSize: 13 },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  durationText: { fontSize: 12 },
  extractingContainer: { padding: 24, alignItems: 'center', gap: 12 },
  extractingText: { fontSize: 14 },
  extractionErrorContainer: { padding: 16, alignItems: 'center', gap: 8 },
  extractionErrorText: { fontSize: 14, textAlign: 'center' },
  helpText: { fontSize: 13, lineHeight: 18 },
});

import { formatDurationColon as formatDuration } from '../../../utils/format-duration';

export { formatDuration };
