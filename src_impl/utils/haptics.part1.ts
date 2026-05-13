import { captureSilentFailure } from "./silent-failure";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";


export async function triggerHaptic(kind: HapticFeedbackKind): Promise<void> {


  try {
    if (kind === 'selection') {
      await Haptics.selectionAsync();
      return;
    }

    if (kind === 'success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (kind === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (kind === 'error') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const impactStyle =
      kind === 'impactHeavy'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : kind === 'impactLight'
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium;

    await Haptics.impactAsync(impactStyle);
  } catch (error) { captureSilentFailure(error, { feature: 'utils', operation: 'ui-fallback', type: 'ui' });
    // Haptics are optional at runtime.
  }
}

export const HapticPatterns: Record<string, HapticPattern> = {
  /** Legendary loot: 5 heavy pulses with success finale */
  LEGENDARY_SEQUENCE: [
    'impactHeavy',
    'impactHeavy',
    'impactHeavy',
    'impactHeavy',
    'impactHeavy',
    'success',
  ],
  /** Level up celebration: medium + heavy + success */
  LEVEL_UP_SEQUENCE: ['impactMedium', 'impactHeavy', 'success'],
  /** Boss defeated: heavy double + success */
  BOSS_DEFEATED_SEQUENCE: ['impactHeavy', 'impactHeavy', 'success'],
};

export async function triggerHapticPattern(
  pattern: HapticPattern,
  delayMs: number = 150
): Promise<void> {
  for (let i = 0; i < pattern.length; i++) {
    await triggerHaptic(pattern[i]);
    // Don't delay after the last item
    if (i < pattern.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function sessionStart(): Promise<void> {
  await triggerHaptic('impactMedium');
}

export async function sessionComplete(): Promise<void> {
  await triggerHaptic('success');
}

export async function sessionPause(): Promise<void> {
  await triggerHaptic('impactLight');
}

export async function sessionResume(): Promise<void> {
  await triggerHaptic('impactLight');
}

export async function gradeReveal(grade: 'S' | 'A' | 'B' | 'C' | 'D'): Promise<void> {
  switch (grade) {
    case 'S':
      await triggerHapticPattern(['impactHeavy', 'success'], 100);
      break;
    case 'A':
      await triggerHapticPattern(['impactMedium', 'success'], 100);
      break;
    case 'B':
      await triggerHaptic('impactMedium');
      break;
    case 'C':
      await triggerHaptic('impactLight');
      break;
    case 'D':
      await triggerHaptic('error');
      break;
  }
}

export async function levelUp(): Promise<void> {
  await triggerHapticPattern(['success', 'impactMedium', 'impactMedium'], 150);
}

export async function bossDefeated(): Promise<void> {
  await triggerHapticPattern(
    ['impactHeavy', 'impactHeavy', 'success', 'impactMedium', 'impactMedium', 'impactMedium'],
    120
  );
}

export async function streakMilestone(days: number): Promise<void> {
  if (days >= 100) {
    // Full epic pattern for 100+ days
    await triggerHapticPattern(
      ['impactHeavy', 'impactHeavy', 'impactHeavy', 'success', 'success', 'impactMedium'],
      100
    );
  } else if (days >= 30) {
    // Heavy + heavy + success for 30 days
    await triggerHapticPattern(['impactHeavy', 'impactHeavy', 'success'], 150);
  } else if (days >= 7) {
    // Medium + success for 7 days
    await triggerHapticPattern(['impactMedium', 'success'], 150);
  } else {
    // Simple success for smaller milestones
    await triggerHaptic('success');
  }
}

export async function chestOpen(tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): Promise<void> {
  switch (tier) {
    case 'legendary':
      await triggerHapticPattern(['impactHeavy', 'impactHeavy', 'success', 'success'], 100);
      break;
    case 'epic':
      await triggerHapticPattern(['impactHeavy', 'success', 'impactMedium'], 120);
      break;
    case 'rare':
      await triggerHapticPattern(['impactMedium', 'success'], 150);
      break;
    case 'uncommon':
      await triggerHaptic('impactMedium');
      break;
    case 'common':
    default:
      await triggerHaptic('impactLight');
      break;
  }
}

export async function achievementUnlocked(): Promise<void> {
  await triggerHaptic('success');
}

export async function buttonTap(): Promise<void> {
  await triggerHaptic('selection');
}

export async function error(): Promise<void> {
  await triggerHaptic('error');
}

export async function wagerWon(): Promise<void> {
  await triggerHapticPattern(['success', 'impactMedium', 'success'], 150);
}