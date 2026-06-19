/**
 * Loading Variants Styles
 *
 * Shared styles for loading variant components.
 */
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';

export const styles = createSheet({
  fullScreen: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  dotsContainer: { flexDirection: 'row', alignItems: 'center' },
  dot: { backgroundColor: lightColors.text.primary },
  pulse: { opacity: 0.3 },
});
