import type { ViewStyle, TextStyle } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';

export const COMPANION_SIZE = 260;
export const PARTICLE_COUNT = 12;

export const companionStyles = createSheet({
  container: {
    width: COMPANION_SIZE,
    height: COMPANION_SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,
  glowContainer: {
    position: 'absolute',
    opacity: 0.3,
  } satisfies ViewStyle,
  companionContainer: {
    zIndex: 10,
  } satisfies ViewStyle,
  statusContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  } satisfies ViewStyle,
  moodText: {
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  } satisfies TextStyle,
  phaseText: {
    opacity: 0.6,
    marginTop: 4,
  } satisfies TextStyle,
});
