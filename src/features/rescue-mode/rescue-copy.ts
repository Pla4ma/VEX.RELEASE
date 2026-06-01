import type { Lane } from '../lane-engine/types';
import type { RescueReason } from './schemas';

export const LANE_RESCUE_COPY: Record<Lane, Record<RescueReason, string>> = {
  student: {
    too_big: 'Open notes and review one weak section for 8 minutes.',
    tired: 'Review one page of notes. No pressure beyond that.',
    distracted: 'Put the phone away. One study block, 8 minutes.',
    anxious: 'Open your notes. Just look. No quiz. 8 minutes.',
    unclear: 'Open notes and review one weak section for 8 minutes.',
    no_time: 'Review one topic. 5 minutes. That is enough.',
  },
  game_like: {
    too_big: 'Recovery encounter: 10 clean minutes of focus.',
    tired: 'A short encounter. No targets. Just move for 10 minutes.',
    distracted: 'One encounter. 10 minutes. Turn everything else off.',
    anxious: 'Recovery encounter: 10 clean minutes of focus.',
    unclear: 'Recovery encounter: 10 clean minutes of focus.',
    no_time: 'Quick encounter. 5 minutes. Just one block.',
  },
  deep_creative: {
    too_big: 'Re-enter the project for 7 minutes. Only identify the next move.',
    tired: 'Open the project. Look at one file. 7 minutes max.',
    distracted:
      'Re-enter the project for 7 minutes. Only identify the next move.',
    anxious: 'Re-enter the project for 7 minutes. Only identify the next move.',
    unclear: 'Name the next concrete step. That is the session.',
    no_time: '7 minutes. Just the next move. Nothing else.',
  },
  minimal_normal: {
    too_big: 'Break it down. One small piece for 5 minutes.',
    tired: 'Rest is valid. If you start, 5 minutes is enough.',
    distracted: 'Close the extras. One small task for 5 minutes.',
    anxious: 'No pressure. Open the task and look for 5 minutes.',
    unclear: 'Name the simplest next step. 5 minutes on that.',
    no_time: 'Two minutes counts. Do what fits.',
  },
};
