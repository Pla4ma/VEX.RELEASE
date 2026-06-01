const QUEST_ICONS: Record<string, string> = {
  PEAK_TIME_FOCUS: '🎯',
  BEAT_PERSONAL_BEST: '🏆',
  NO_PAUSE_CHALLENGE: '🧘',
  STREAK_PROTECTION: '🛡️',
  QUALITY_GRADE_TARGET: '⭐',
  DURATION_MILESTONE: '⏱️',
  BOSS_DAMAGE_DEALT: '⚔️',
  RIVAL_OUTFOCUS: '🏁',
  SQUAD_SUPPORT: '🛡️',
};

export function getQuestIcon(type: string): string {
  return QUEST_ICONS[type] || '📋';
}

export function formatTimeRemaining(expiresAt: number | undefined): string {
  const now = Date.now();
  const expires = expiresAt || now;
  const hoursRemaining = Math.max(
    0,
    Math.ceil((expires - now) / (1000 * 60 * 60)),
  );
  return hoursRemaining > 1 ? `${hoursRemaining} hours` : 'Less than 1 hour';
}
