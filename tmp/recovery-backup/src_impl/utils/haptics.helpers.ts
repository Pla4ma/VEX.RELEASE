
import * as Haptics from 'expo-haptics';
import { captureSilentFailure } from './silent-failure';

export async function triggerHaptic(type: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType): Promise<void> {
  try {
    if (Object.values(Haptics.ImpactFeedbackStyle).includes(type as any)) {
      await Haptics.impactAsync(type as Haptics.ImpactFeedbackStyle);
    } else {
      await Haptics.notificationAsync(type as Haptics.NotificationFeedbackType);
    }
  } catch (error) { captureSilentFailure(error, { feature: 'utils', operation: 'safe-fallback', type: 'haptics' });
  }
}

export async function triggerHapticPattern(pattern: (Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType | number)[]): Promise<void> {
  try {
    for (const step of pattern) {
      if (typeof step === 'number') {
        await new Promise(resolve => setTimeout(resolve, step));
      } else {
        await triggerHaptic(step);
      }
    }
  } catch (error) { captureSilentFailure(error, { feature: 'utils', operation: 'safe-fallback', type: 'haptics' });
  }
}
