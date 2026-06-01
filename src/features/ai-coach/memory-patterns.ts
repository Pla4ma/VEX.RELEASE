import type { CoachMemory } from './memory-schemas';
import { storeMemory, getMemoriesByType } from './CoachMemory';

export async function storeStudyPattern(
  userId: string,
  pattern:
    | 'MORNING_PERSON'
    | 'NIGHT_OWL'
    | 'WEEKEND_WARRIOR'
    | 'CONSISTENT_DAILY'
    | 'BURST_LEARNER',
  confidence: number,
  evidence: string,
): Promise<CoachMemory> {
  return storeMemory(userId, 'STUDY_PATTERN', `Pattern: ${pattern}`, evidence, {
    pattern,
    confidence,
    detectedAt: Date.now(),
  });
}

export async function storePreferredTechnique(
  userId: string,
  technique: 'POMODORO' | 'FLOWTIME' | 'DEEP_WORK' | '52_17' | 'CUSTOM',
  effectivenessScore: number,
  context: string,
): Promise<CoachMemory> {
  return storeMemory(
    userId,
    'PREFERRED_TECHNIQUE',
    `Technique: ${technique}`,
    context,
    {
      technique,
      effectivenessScore,
      recordedAt: Date.now(),
    },
  );
}

export async function storeFailureMode(
  userId: string,
  failureType:
    | 'DISTRACTION'
    | 'FATIGUE'
    | 'OVERWHELM'
    | 'LACK_OF_MOTIVATION'
    | 'POOR_TIMING',
  context: string,
  suggestedIntervention: string,
): Promise<CoachMemory> {
  return storeMemory(
    userId,
    'FAILURE_MODE',
    `Challenge: ${failureType}`,
    context,
    {
      failureType,
      suggestedIntervention,
      occurredAt: Date.now(),
    },
  );
}

export async function storeOptimalFocusTime(
  userId: string,
  dayOfWeek: string,
  hourRange: string,
  averageQuality: number,
  sampleSize: number,
): Promise<CoachMemory> {
  return storeMemory(
    userId,
    'OPTIMAL_FOCUS_TIME',
    `Peak: ${dayOfWeek} ${hourRange}`,
    `You average ${averageQuality.toFixed(0)}% quality during this time`,
    {
      dayOfWeek,
      hourRange,
      averageQuality,
      sampleSize,
      recordedAt: Date.now(),
    },
  );
}

export async function storeDocumentMilestone(
  userId: string,
  documentId: string,
  documentName: string,
  milestoneType: 'STARTED' | 'HALFWAY' | 'COMPLETED',
  progressPercent: number,
): Promise<CoachMemory> {
  const titles: Record<string, string> = {
    STARTED: `Started: ${documentName}`,
    HALFWAY: `Halfway: ${documentName}`,
    COMPLETED: `Finished: ${documentName}`,
  };
  return storeMemory(
    userId,
    'DOCUMENT_MILESTONE',
    titles[milestoneType] ?? `Progress: ${documentName}`,
    `${documentName} \u2014 ${progressPercent}% complete`,
    { documentId, documentName, milestoneType, progressPercent },
  );
}

export async function getStudyPatterns(userId: string): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, 'STUDY_PATTERN');
}

export async function getPreferredTechniques(
  userId: string,
): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, 'PREFERRED_TECHNIQUE');
}

export async function getFailureModes(userId: string): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, 'FAILURE_MODE');
}

export async function getOptimalFocusTimes(
  userId: string,
): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, 'OPTIMAL_FOCUS_TIME');
}
