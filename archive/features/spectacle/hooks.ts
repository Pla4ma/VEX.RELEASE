/**
 * Spectacle Hooks
 *
 * React hooks for consuming spectacle events in UI components.
 * Provides real-time subscription to celebration events.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { spectacleService } from './service';
import {
  SpectacleEvent,
  SpectacleType,
  SpectacleState,
  TriggerSpectacleOptions,
  SpectaclePayloadMap,
} from './types';

/**
 * Hook to subscribe to all spectacle events
 * Returns the current spectacle event and control functions
 */
export function useSpectacle(): {
  currentEvent: SpectacleEvent | null;
  isPlaying: boolean;
  complete: () => void;
  skip: () => void;
} {
  const [state, setState] = useState<SpectacleState>(() => spectacleService.getState());

  useEffect(() => {
    const unsubscribe = spectacleService.subscribe(() => {
      setState(spectacleService.getState());
    });

    return unsubscribe;
  }, []);

  const complete = useCallback(() => {
    spectacleService.completeCurrent();
  }, []);

  const skip = useCallback(() => {
    spectacleService.skipCurrent();
  }, []);

  return {
    currentEvent: state.currentEvent,
    isPlaying: state.isPlaying,
    complete,
    skip,
  };
}

/**
 * Hook to trigger spectacle events
 * Returns a function to trigger spectacles
 */
export function useTriggerSpectacle(): <T extends SpectacleType>(
  type: T,
  payload: SpectaclePayloadMap[T],
  options?: TriggerSpectacleOptions
) => void {
  return useCallback(<T extends SpectacleType>(
    type: T,
    payload: SpectaclePayloadMap[T],
    options?: TriggerSpectacleOptions
  ) => {
    spectacleService.triggerSpectacle(type, payload, options);
  }, []);
}

/**
 * Hook to subscribe to a specific spectacle type
 * Only triggers when that specific type occurs
 */
export function useSpectacleType<T extends SpectacleType>(
  type: T
): SpectacleEvent | null {
  const [event, setEvent] = useState<SpectacleEvent | null>(null);
  const lastEventRef = useRef<SpectacleEvent | null>(null);

  useEffect(() => {
    const unsubscribe = spectacleService.subscribe((newEvent) => {
      if (newEvent.type === type) {
        lastEventRef.current = newEvent;
        setEvent(newEvent);
      }
    });

    return unsubscribe;
  }, [type]);

  return event;
}

/**
 * Hook to get spectacle playing state
 * Simple boolean for showing/hiding UI
 */
export function useIsSpectaclePlaying(): boolean {
  return useSyncExternalStore(
    (callback) => spectacleService.subscribe(callback),
    () => spectacleService.isPlaying()
  );
}

/**
 * Hook to get haptic control
 * Returns whether haptics are enabled and functions to control them
 */
export function useSpectacleHaptics(): {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  play: (pattern: import('./types').HapticPattern) => Promise<void>;
} {
  const [enabled, setEnabledState] = useState(true);

  const setEnabled = useCallback((value: boolean) => {
    spectacleService.setHapticEnabled(value);
    setEnabledState(value);
  }, []);

  const play = useCallback(async (pattern: import('./types').HapticPattern) => {
    await spectacleService.playHaptic(pattern);
  }, []);

  return { enabled, setEnabled, play };
}

/**
 * Hook that returns a function to check if spectacle should auto-dismiss
 */
export function useSpectacleAutoDismiss(): {
  shouldAutoDismiss: boolean;
  dismissDelay: number;
} {
  const state = useSyncExternalStore(
    (callback) => spectacleService.subscribe(callback),
    () => spectacleService.getState()
  );

  return {
    shouldAutoDismiss: state.currentEvent?.autoDismiss ?? false,
    dismissDelay: state.currentEvent?.dismissDelay ?? 5000,
  };
}

/**
 * Hook to track spectacle completion
 * Callback fires when current spectacle completes
 */
export function useOnSpectacleComplete(
  callback: () => void
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let wasPlaying = spectacleService.isPlaying();

    const unsubscribe = spectacleService.subscribe(() => {
      const isPlaying = spectacleService.isPlaying();
      if (wasPlaying && !isPlaying) {
        callbackRef.current();
      }
      wasPlaying = isPlaying;
    });

    return unsubscribe;
  }, []);
}

/**
 * Hook to get animation configuration for current spectacle
 */
export function useCurrentSpectacleAnimation(): {
  intensity: import('./types').AnimationIntensity;
  duration: number;
  delay: number;
  staggerDelay: number;
} | null {
  const state = useSyncExternalStore(
    (callback) => spectacleService.subscribe(callback),
    () => spectacleService.getState()
  );

  if (!state.currentEvent) {return null;}

  return {
    intensity: state.currentEvent.animation.intensity,
    duration: state.currentEvent.animation.duration,
    delay: state.currentEvent.animation.delay ?? 0,
    staggerDelay: state.currentEvent.animation.staggerDelay ?? 100,
  };
}

/**
 * Hook for boss defeated spectacle
 * Convenience hook for boss defeat ceremonies
 */
export function useBossDefeatedSpectacle(): {
  event: import('./types').BossDefeatedPayload | null;
  isActive: boolean;
  dismiss: () => void;
} {
  const { currentEvent, isPlaying, complete } = useSpectacle();

  const isBossDefeated = currentEvent?.type === SpectacleType.BOSS_DEFEATED;

  return {
    event: isBossDefeated
      ? (currentEvent?.payload as import('./types').BossDefeatedPayload)
      : null,
    isActive: isBossDefeated && isPlaying,
    dismiss: complete,
  };
}

/**
 * Hook for streak milestone spectacle
 */
export function useStreakMilestoneSpectacle(): {
  event: import('./types').StreakMilestonePayload | null;
  isActive: boolean;
  dismiss: () => void;
} {
  const { currentEvent, isPlaying, complete } = useSpectacle();

  const isStreakMilestone = currentEvent?.type === SpectacleType.STREAK_MILESTONE;

  return {
    event: isStreakMilestone
      ? (currentEvent?.payload as import('./types').StreakMilestonePayload)
      : null,
    isActive: isStreakMilestone && isPlaying,
    dismiss: complete,
  };
}

/**
 * Hook for level up spectacle
 */
export function useLevelUpSpectacle(): {
  event: import('./types').LevelUpPayload | null;
  isActive: boolean;
  dismiss: () => void;
} {
  const { currentEvent, isPlaying, complete } = useSpectacle();

  const isLevelUp = currentEvent?.type === SpectacleType.LEVEL_UP;

  return {
    event: isLevelUp
      ? (currentEvent?.payload as import('./types').LevelUpPayload)
      : null,
    isActive: isLevelUp && isPlaying,
    dismiss: complete,
  };
}

/**
 * Hook for loot drop spectacle
 */
export function useLootDropSpectacle(): {
  event: import('./types').LootDropPayload | null;
  isActive: boolean;
  isLegendary: boolean;
  dismiss: () => void;
} {
  const { currentEvent, isPlaying, complete } = useSpectacle();

  const isLootDrop =
    currentEvent?.type === SpectacleType.RARE_LOOT_DROP ||
    currentEvent?.type === SpectacleType.LEGENDARY_LOOT_DROP;

  return {
    event: isLootDrop
      ? (currentEvent?.payload as import('./types').LootDropPayload)
      : null,
    isActive: isLootDrop && isPlaying,
    isLegendary: currentEvent?.type === SpectacleType.LEGENDARY_LOOT_DROP,
    dismiss: complete,
  };
}

/**
 * Hook for perfect session spectacle
 */
export function usePerfectSessionSpectacle(): {
  event: import('./types').PerfectSessionPayload | null;
  isActive: boolean;
  dismiss: () => void;
} {
  const { currentEvent, isPlaying, complete } = useSpectacle();

  const isPerfectSession = currentEvent?.type === SpectacleType.PERFECT_SESSION;

  return {
    event: isPerfectSession
      ? (currentEvent?.payload as import('./types').PerfectSessionPayload)
      : null,
    isActive: isPerfectSession && isPlaying,
    dismiss: complete,
  };
}

/**
 * Hook for squad war victory spectacle
 */
export function useSquadWarVictorySpectacle(): {
  event: import('./types').SquadWarVictoryPayload | null;
  isActive: boolean;
  dismiss: () => void;
} {
  const { currentEvent, isPlaying, complete } = useSpectacle();

  const isSquadWarWon = currentEvent?.type === SpectacleType.SQUAD_WAR_WON;

  return {
    event: isSquadWarWon
      ? (currentEvent?.payload as import('./types').SquadWarVictoryPayload)
      : null,
    isActive: isSquadWarWon && isPlaying,
    dismiss: complete,
  };
}

/**
 * Hook for mastery rank up spectacle
 */
export function useMasteryRankUpSpectacle(): {
  event: import('./types').MasteryRankUpPayload | null;
  isActive: boolean;
  dismiss: () => void;
  unlockedFeatures: string[];
} {
  const { currentEvent, isPlaying, complete } = useSpectacle();

  const isMasteryRankUp = currentEvent?.type === SpectacleType.MASTERY_RANK_UP;
  const payload = isMasteryRankUp
    ? (currentEvent?.payload as import('./types').MasteryRankUpPayload)
    : null;

  return {
    event: payload,
    isActive: isMasteryRankUp && isPlaying,
    dismiss: complete,
    unlockedFeatures: payload?.unlockedFeatures ?? [],
  };
}

