import {
  FocusModeCardSchema,
  LaneSessionBriefSchema,
  type FocusModeCard,
  type LaneSessionBrief,
} from './schemas';
import { SessionMode } from '../../session/modes';
import type { Lane, LaneProfile } from '../lane-engine/types';
import { getOfflineSessionStartMessage } from './setup-helpers';

function laneBriefCopy(
  lane: Lane,
): Pick<
  LaneSessionBrief,
  'body' | 'ctaLabel' | 'sessionMode' | 'title' | 'userFacingModeName'
> {
  if (lane === 'student')
    {return {
      body: 'Review the next useful target before new material piles up.',
      ctaLabel: 'Start study block',
      sessionMode: SessionMode.STUDY,
      title: 'Study block ready',
      userFacingModeName: 'Study',
    };}
  if (lane === 'game_like')
    {return {
      body: 'One clean run. Focus on momentum, not perfection.',
      ctaLabel: 'Start clean run',
      sessionMode: SessionMode.SPRINT,
      title: 'Run ready',
      userFacingModeName: 'Run',
    };}
  if (lane === 'deep_creative')
    {return {
      body: 'Resume the thread and protect the next concrete move.',
      ctaLabel: 'Resume project block',
      sessionMode: SessionMode.CREATIVE,
      title: 'Project block ready',
      userFacingModeName: 'Project',
    };}
  return {
    body: 'Name one action. Start. Stop when the timer ends. No noise.',
    ctaLabel: 'Start clean action',
    sessionMode: SessionMode.LIGHT_FOCUS,
    title: 'One action ready',
    userFacingModeName: 'Clean',
  };
}

export function buildLaneSessionBrief(input: {
  durationSeconds?: number | null;
  isOffline?: boolean;
  isRescue?: boolean;
  lane?: Lane;
  laneProfile?: LaneProfile;
  subjectOrTask?: string | null;
  deadlineSeconds?: number | null;
  weakTopic?: string | null;
  projectTitle?: string | null;
}): LaneSessionBrief {
  const lane = input.laneProfile?.primaryLane ?? input.lane ?? 'minimal_normal';
  const base = laneBriefCopy(lane);
  const rescueDuration = Math.max(
    5 * 60,
    Math.min(input.durationSeconds ?? 10 * 60, 12 * 60),
  );
  const normalDuration = Math.max(
    15 * 60,
    Math.min(input.durationSeconds ?? 25 * 60, 90 * 60),
  );
  const suggestedDurationSeconds = input.isRescue
    ? rescueDuration
    : normalDuration;

  const rescueSuccessByLane: Record<Lane, string> = {
    student: 'Complete five honest study minutes.',
    game_like: 'Start one clean next move.',
    deep_creative: 'Make one concrete project edit.',
    minimal_normal: 'Stay focused for five minutes.',
  };
  const successCondition = input.isRescue
    ? rescueSuccessByLane[lane]
    : 'Finish the named block without adding scope.';

  return LaneSessionBriefSchema.parse({
    ...base,
    afterCompletion: 'VEX will use the finish signal to tune the next action.',
    focusStrategyLoadout: [
      'Phone away',
      'One tab',
      'Notes open',
      'Do not pause',
      '5-minute rescue allowed',
    ],
    friction: input.isRescue
      ? { level: 'soft', reason: 'Short rescue block lowers start friction.' }
      : null,
    lane,
    offlineMessage: getOfflineSessionStartMessage(Boolean(input.isOffline)),
    risk: input.isRescue
      ? { label: 'Avoidance is active; start smaller.', type: 'avoidance' }
      : null,
    successCondition,
    suggestedDurationSeconds,
    userFacingModeName: base.userFacingModeName,
  });
}

export function buildFocusModeCards(input: {
  streakDays: number;
}): FocusModeCard[] {
  const streakCopy =
    input.streakDays > 0
      ? `Protect day ${input.streakDays} without opening the whole dashboard.`
      : 'Create the first real proof point before the app asks for more.';
  return [
    [
      'sprint-15',
      'SPRINT',
      'Sprint',
      'Fastest path to a real completion and a tomorrow promise.',
      'Start sprint',
      15,
    ],
    [
      'light-focus-25',
      'LIGHT_FOCUS',
      'Light Focus',
      streakCopy,
      'Protect streak',
      25,
    ],
    [
      'study-25',
      'STUDY',
      'Study',
      'Use when the work has material, notes, or review attached.',
      'Start study',
      25,
    ],
    [
      'recovery-10',
      'RECOVERY',
      'Recovery',
      'For messy days: count something truthful instead of disappearing.',
      'Recover today',
      10,
    ],
  ].map(([id, mode, title, body, ctaLabel, minutes]) =>
    FocusModeCardSchema.parse({
      accessibilityHint: `Opens setup with a ${String(title).toLowerCase()} preset`,
      accessibilityLabel: `Start ${minutes} minute ${String(title).toLowerCase()} session`,
      body,
      ctaLabel,
      durationSeconds: Number(minutes) * 60,
      id,
      mode,
      title,
    }),
  );
}
