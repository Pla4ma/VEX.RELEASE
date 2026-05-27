import { SessionMode } from '../../session/modes';
import type { Lane } from '../lane-engine/types';
import type { RescuePlanInput } from './schemas';
import { LANE_RESCUE_COPY } from './rescue-copy';

export function clampDuration(seconds: number | undefined, lane: Lane): number {
  const defaultDuration = durationForLane(lane);
  return Math.max(5 * 60, Math.min(seconds ?? defaultDuration, 12 * 60));
}

export function durationForLane(lane: Lane): number {
  if (lane === 'student') return 8 * 60;
  if (lane === 'game_like') return 10 * 60;
  if (lane === 'deep_creative') return 7 * 60;
  return 5 * 60;
}

export function modeFor(lane: Lane): SessionMode {
  if (lane === 'student') return SessionMode.STUDY;
  if (lane === 'deep_creative') return SessionMode.CREATIVE;
  if (lane === 'game_like') return SessionMode.SPRINT;
  return SessionMode.RECOVERY;
}

export function taskFor(input: RescuePlanInput, lane: Lane): string {
  if (input.taskDescription) return input.taskDescription;
  return LANE_RESCUE_COPY[lane][input.reason];
}
