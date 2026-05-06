import { captureSilentFailure } from './silent-failure';
export type HapticFeedbackKind =
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy';

import * as Haptics from 'expo-haptics';

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

// ============================================================================
// Haptic Patterns (for complex sequences)
// ============================================================================

export type HapticPattern = HapticFeedbackKind[];

/**
 * Predefined haptic patterns for special events
 */
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

/**
 * Trigger a sequence of haptic feedback with delays
 */
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

// ============================================================================
// Named Haptic Functions (Phase 16 - Semantic Haptic Library)
// ============================================================================

/** Medium impact - session started */
export async function sessionStart(): Promise<void> {
  await triggerHaptic('impactMedium');
}

/** Success notification - session completed */
export async function sessionComplete(): Promise<void> {
  await triggerHaptic('success');
}

/** Light impact - session paused */
export async function sessionPause(): Promise<void> {
  await triggerHaptic('impactLight');
}

/** Light impact - session resumed */
export async function sessionResume(): Promise<void> {
  await triggerHaptic('impactLight');
}

/** Grade reveal haptics - varies by grade */
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

/** Level up - success + medium + medium (3 pulses) */
export async function levelUp(): Promise<void> {
  await triggerHapticPattern(['success', 'impactMedium', 'impactMedium'], 150);
}

/** Boss defeated - heavy + heavy + success + medium + medium + medium (dramatic) */
export async function bossDefeated(): Promise<void> {
  await triggerHapticPattern(
    ['impactHeavy', 'impactHeavy', 'success', 'impactMedium', 'impactMedium', 'impactMedium'],
    120
  );
}

/** Streak milestone - scales with days */
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

/** Chest open - scales with tier */
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

/** Achievement unlocked - success notification */
export async function achievementUnlocked(): Promise<void> {
  await triggerHaptic('success');
}

/** Button tap - selection feedback (lightest) */
export async function buttonTap(): Promise<void> {
  await triggerHaptic('selection');
}

/** Error - error notification */
export async function error(): Promise<void> {
  await triggerHaptic('error');
}

/** Wager won - success + medium + success (triple) */
export async function wagerWon(): Promise<void> {
  await triggerHapticPattern(['success', 'impactMedium', 'success'], 150);
}

/** Companion evolution - full pattern (rarest) */
export async function companionEvolution(): Promise<void> {
  await triggerHapticPattern(
    ['impactLight', 'impactMedium', 'impactHeavy', 'success', 'impactHeavy', 'success'],
    120
  );
}

// ============================================================================
// Enhanced Haptic Functions (Phase 17 - Premium UX)
// ============================================================================

/** Study plan generated - AI success pattern */
export async function studyPlanGenerated(): Promise<void> {
  await triggerHapticPattern(['impactLight', 'impactMedium', 'success'], 100);
}

/** Card selection - subtle feedback for list items */
export async function cardSelection(): Promise<void> {
  await triggerHaptic('impactLight');
}

/** Pull to refresh - subtle acknowledgment */
export async function pullToRefresh(): Promise<void> {
  await triggerHaptic('selection');
}

/** Step completed - onboarding/task progress */
export async function stepCompleted(): Promise<void> {
  await triggerHaptic('impactMedium');
}

/** AI thinking - subtle pulse while processing (single light impact) */
export async function aiThinkingPulse(): Promise<void> {
  await triggerHaptic('impactLight');
}

/** Tab switch - subtle feedback for navigation */
export async function tabSwitch(): Promise<void> {
  await triggerHaptic('selection');
}

/** Toggle switch - clear on/off feedback */
export async function toggleSwitch(enabled: boolean): Promise<void> {
  if (enabled) {
    await triggerHaptic('impactMedium');
  } else {
    await triggerHaptic('impactLight');
  }
}

/** Scroll snap - when list settles into position */
export async function scrollSnap(): Promise<void> {
  await triggerHaptic('selection');
}

/** Study progress milestone - smaller study milestones */
export async function studyProgressMilestone(progressPercent: number): Promise<void> {
  if (progressPercent >= 100) {
    await triggerHapticPattern(['impactMedium', 'success'], 100);
  } else if (progressPercent >= 50) {
    await triggerHaptic('impactMedium');
  } else {
    await triggerHaptic('impactLight');
  }
}

/** Deep link opened - navigation from external source */
export async function deepLinkOpened(): Promise<void> {
  await triggerHapticPattern(['impactLight', 'impactMedium'], 80);
}

/** Premium feature unlocked - celebration for gated features */
export async function featureUnlocked(): Promise<void> {
  await triggerHapticPattern(
    ['impactLight', 'impactMedium', 'impactHeavy', 'success'],
    120
  );
}

// ============================================================================
// React Hook for Component Use
// ============================================================================

import { useCallback } from 'react';

export function useHaptics() {
  const light = useCallback(() => triggerHaptic('impactLight'), []);
  const medium = useCallback(() => triggerHaptic('impactMedium'), []);
  const heavy = useCallback(() => triggerHaptic('impactHeavy'), []);
  const success = useCallback(() => triggerHaptic('success'), []);
  const warning = useCallback(() => triggerHaptic('warning'), []);
  const error = useCallback(() => triggerHaptic('error'), []);
  const selection = useCallback(() => triggerHaptic('selection'), []);
  const primaryAction = useCallback(() => triggerHaptic('impactMedium'), []);
  const pullToRefresh = useCallback(() => triggerHaptic('selection'), []);
  const tabSwitch = useCallback(() => triggerHaptic('selection'), []);

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    primaryAction,
    pullToRefresh,
    tabSwitch,
    trigger: triggerHaptic,
    pattern: triggerHapticPattern,
  };
}
