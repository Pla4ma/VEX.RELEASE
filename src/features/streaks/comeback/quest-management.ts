/**
 * Comeback Quest Management
 *
 * Functions to create, update, and manage comeback quests.
 */

import { createDebugger } from '../../../utils/debug';
import { checkComebackEligibility } from './eligibility';
import { ComebackQuestSchema, type ComebackQuest } from './schemas';
import {
  fetchExistingComebackQuest,
  insertComebackQuest,
} from '../repository/comeback';

const debug = createDebugger('streaks:comeback-quest');

export async function createComebackQuest(
  userId: string,
): Promise<ComebackQuest | null> {
  try {
    const eligibility = await checkComebackEligibility(userId);

    if (!eligibility.eligible) {
      return null;
    }

    const existingQuest = await fetchExistingComebackQuest(userId);

    if (existingQuest) {
      return existingQuest;
    }

    const newQuest = await insertComebackQuest(
      userId,
      eligibility.daysAbsent,
      eligibility.streakBeforeBreak,
    );

    debug.info('Created comeback quest', {
      userId,
      daysAbsent: eligibility.daysAbsent,
    });

    return newQuest;
  } catch (error) {
    debug.error(
      'Error creating comeback quest',
      error instanceof Error ? error : undefined,
    );
    return null;
  }
}
