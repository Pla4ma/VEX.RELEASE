import type { ProductTier, UserExperienceStage } from './feature-access-types';

export function getStage(totalCompletedSessions: number): UserExperienceStage {
  if (totalCompletedSessions <= 0) {return 'NEW_USER';}
  if (totalCompletedSessions < 3) {return 'ACTIVATING';}
  if (totalCompletedSessions < 10) {return 'ENGAGED';}
  return 'POWER_USER';
}

export function getProductTier(
  stage: UserExperienceStage,
  totalCompletedSessions: number,
): ProductTier {
  if (totalCompletedSessions >= 40) {return 'SOCIAL_DEPTH';}
  if (totalCompletedSessions >= 20) {return 'RPG_DEPTH';}
  if (totalCompletedSessions >= 10) {return 'STUDY_OS';}
  if (stage === 'ENGAGED') {return 'COACHING';}
  return 'CORE_EXECUTION';
}
