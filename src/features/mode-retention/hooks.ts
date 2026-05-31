import { useMemo } from 'react';
import type { Lane } from '../lane-engine/types';
import {
  getModeReturnHook,
  getModeRescueCopy,
  getModeNotificationCopy,
  getModePremiumBridge,
  getModeDayCopy,
  scoreModeRetention,
} from './service';
import type { RetentionScoreInput } from './service';
import type {
  ModeReturnHook,
  ModeDayCopy,
  ModeRescueCopy,
  ModeNotificationCopy,
  ModePremiumBridge,
  ModeRetentionScore,
} from './schemas';

export function useModeReturnHook(input: { lane: Lane }): ModeReturnHook {
  return useMemo(() => getModeReturnHook(input.lane), [input.lane]);
}

export function useModeDayCopy(input: {
  lane: Lane;
  day: number;
}): ModeDayCopy {
  return useMemo(
    () => getModeDayCopy(input.lane, input.day),
    [input.lane, input.day],
  );
}

export function useModeRescueCopy(input: { lane: Lane }): ModeRescueCopy {
  return useMemo(() => getModeRescueCopy(input.lane), [input.lane]);
}

export function useModeNotificationCopy(input: {
  lane: Lane;
}): ModeNotificationCopy {
  return useMemo(() => getModeNotificationCopy(input.lane), [input.lane]);
}

export function useModePremiumBridge(input: {
  lane: Lane;
}): ModePremiumBridge {
  return useMemo(() => getModePremiumBridge(input.lane), [input.lane]);
}

export function useModeRetentionScore(
  input: RetentionScoreInput,
): ModeRetentionScore {
  return useMemo(() => scoreModeRetention(input), [input]);
}
