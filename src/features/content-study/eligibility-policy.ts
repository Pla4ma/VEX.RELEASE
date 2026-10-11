const MIN_COMPLETED_SESSIONS = 3;
const MIN_STUDY_USAGE_RATIO = 0.35;

function getStudyUsageRatio(completedCount: number, studyCount: number): number {
  const safeCompletedCount = Math.max(0, completedCount);
  const safeStudyCount = Math.max(0, Math.min(studyCount, safeCompletedCount));
  return safeCompletedCount === 0 ? 0 : safeStudyCount / safeCompletedCount;
}

function hasStudyIntent(
  goal: string | null,
  motivationStyle: string | null,
  studyRatio: number,
): boolean {
  const normalizedGoal = goal?.trim().toUpperCase();
  const normalizedStyle = motivationStyle?.trim().toLowerCase();
  return (
    normalizedGoal === 'STUDY' ||
    normalizedGoal === 'LEARNING' ||
    normalizedStyle === 'study_focused' ||
    normalizedStyle === 'student' ||
    studyRatio >= MIN_STUDY_USAGE_RATIO
  );
}

export function isStudyContentUploadUnlocked(
  completedSessionCount: number,
  studySessionCount: number,
  goal: string | null,
  motivationStyle: string | null,
): boolean {
  const safeCompletedCount = Math.max(0, completedSessionCount);
  const studyRatio = getStudyUsageRatio(safeCompletedCount, studySessionCount);
  const isStudyFocused = hasStudyIntent(goal, motivationStyle, studyRatio);

  return (
    isStudyFocused &&
    (safeCompletedCount >= MIN_COMPLETED_SESSIONS ||
      studyRatio >= MIN_STUDY_USAGE_RATIO)
  );
}

export function getStudyContentUploadRestriction(
  completedSessionCount: number,
  studySessionCount: number,
  goal: string | null,
  motivationStyle: string | null,
): string | null {
  if (
    isStudyContentUploadUnlocked(
      completedSessionCount,
      studySessionCount,
      goal,
      motivationStyle,
    )
  ) {
    return null;
  }

  const studyRatio = getStudyUsageRatio(completedSessionCount, studySessionCount);
  const isStudyFocused = hasStudyIntent(goal, motivationStyle, studyRatio);

  return isStudyFocused
    ? 'Start with a study target and a few focused blocks. Content tools unlock as your study path takes shape.'
    : 'Choose a study goal and complete a focused study block to unlock content tools.';
}
