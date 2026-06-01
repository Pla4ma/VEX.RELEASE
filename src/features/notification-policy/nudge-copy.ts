import type { NudgeDecision, NudgeType } from './schemas';
import type { Lane } from '../lane-engine/types';

export function laneToCategory(
  lane: Lane,
): 'study' | 'run' | 'project' | 'clean' {
  const map: Record<Lane, 'study' | 'run' | 'project' | 'clean'> = {
    student: 'study',
    game_like: 'run',
    deep_creative: 'project',
    minimal_normal: 'clean',
  };
  return map[lane];
}

export function copyFor(
  lane: Lane,
  type: NudgeType,
): Pick<NudgeDecision, 'body' | 'title'> {
  if (type === 'none') {return { title: null, body: null };}
  if (type === 'rescue') {
    const rescueCopy: Record<Lane, { title: string; body: string }> = {
      student: {
        title: 'Need a tiny start?',
        body: 'Review one weak section. 8 minutes. No pressure.',
      },
      game_like: {
        title: 'Need a recovery run?',
        body: 'Recovery run: 10 clean minutes. Just move.',
      },
      deep_creative: {
        title: 'Need a re-entry path?',
        body: 'Re-enter the project. 7 minutes to find the next move.',
      },
      minimal_normal: {
        title: 'Need a tiny start?',
        body: 'Do 5 minutes. Stop cleanly. That is enough.',
      },
    };
    return rescueCopy[lane];
  }
  if (type === 'study_deadline') {
    return {
      title: 'Small window',
      body: 'Your next study block fits: 15 minutes on one topic.',
    };
  }
  if (type === 'project_resume') {
    return {
      title: 'Next move',
      body: 'Your project thread is waiting at the next move.',
    };
  }
  if (type === 'run_continue') {
    return { title: 'One encounter', body: 'One clean block is enough today.' };
  }
  if (type === 'weekly_insight') {
    return {
      title: 'Your first weekly intelligence is ready',
      body: 'See what helped, what got in the way, and what is next.',
    };
  }
  const gentleReturnCopy: Record<Lane, { title: string; body: string }> = {
    student: {
      title: 'Study block waiting',
      body: 'Pick up with one focused study block. 15 minutes.',
    },
    game_like: {
      title: 'Your next run is ready',
      body: 'One clean block waiting. 15 minutes.',
    },
    deep_creative: {
      title: 'Project thread waiting',
      body: 'Your project is waiting at the next move.',
    },
    minimal_normal: {
      title: 'One clean block',
      body: 'One clean block is enough today.',
    },
  };
  return gentleReturnCopy[lane];
}
