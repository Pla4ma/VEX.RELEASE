import { captureSilentFailure } from './silent-failure';

type ExpoHapticsModule = {
  selectionAsync?: () => Promise<void>;
  notificationAsync?: (type: string) => Promise<void>;
  impactAsync?: (style: string) => Promise<void>;
  NotificationFeedbackType?: {
    Success: string;
    Warning: string;
    Error: string;
  };
  ImpactFeedbackStyle?: {
    Light: string;
    Medium: string;
    Heavy: string;
  };
};

export type HapticFeedbackKind =
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy';

export type HapticPattern = HapticFeedbackKind[];

export const HapticPatterns: Record<string, HapticPattern> = {
  LEGENDARY_SEQUENCE: [
    'impactHeavy',
    'impactHeavy',
    'impactHeavy',
    'impactHeavy',
    'impactHeavy',
    'success',
  ],
  LEVEL_UP_SEQUENCE: ['impactMedium', 'impactHeavy', 'success'],
  BOSS_DEFEATED_SEQUENCE: ['impactHeavy', 'impactHeavy', 'success'],
};

function getHaptics(): ExpoHapticsModule | null {
  try {
    return require('expo-haptics') as ExpoHapticsModule;
  } catch {
    return null;
  }
}

export async function triggerHaptic(kind: HapticFeedbackKind): Promise<void> {
  try {
    const Haptics = getHaptics();
    if (!Haptics) {
      return;
    }

    if (kind === 'selection') {
      await Haptics.selectionAsync?.();
      return;
    }

    if (kind === 'success' || kind === 'warning' || kind === 'error') {
      const feedbackType = kind === 'success'
        ? Haptics.NotificationFeedbackType?.Success
        : kind === 'warning'
          ? Haptics.NotificationFeedbackType?.Warning
          : Haptics.NotificationFeedbackType?.Error;
      if (feedbackType) {
        await Haptics.notificationAsync?.(feedbackType);
      }
      return;
    }

    const impactStyle = kind === 'impactHeavy'
      ? Haptics.ImpactFeedbackStyle?.Heavy
      : kind === 'impactLight'
        ? Haptics.ImpactFeedbackStyle?.Light
        : Haptics.ImpactFeedbackStyle?.Medium;
    if (impactStyle) {
      await Haptics.impactAsync?.(impactStyle);
    }
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'utils',
      operation: 'ui-fallback',
      type: 'ui',
    });
  }
}

export async function triggerHapticPattern(
  pattern: HapticPattern,
  delayMs = 100,
): Promise<void> {
  for (const kind of pattern) {
    await triggerHaptic(kind);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
