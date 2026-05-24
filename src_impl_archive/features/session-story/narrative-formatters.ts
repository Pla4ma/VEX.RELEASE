import type { NarrativeBeat, SessionNarrative, FinalStats } from './narrative-schemas';

export function generateClosingLine(
  narrative: SessionNarrative,
  stats: FinalStats,
): string {
  if (!stats.bossDefeated) {
    return "The battle continues. You'll return stronger tomorrow.";
  }
  if (narrative.theme === 'comeback') {
    return 'Against all odds, you emerged victorious. Legendary!';
  }
  if (narrative.theme === 'mastery') {
    return 'Pure mastery on display. The boss never stood a chance.';
  }
  if (narrative.totalInterruptions > 3) {
    return `Victory through perseverance. You overcame ${narrative.totalInterruptions} interruptions to claim victory!`;
  }
  return 'Victory! Your focus was unbreakable.';
}

export function generateShareableSummary(
  narrative: SessionNarrative,
  stats: FinalStats,
): string {
  const parts: string[] = [];
  if (stats.duration > 0) {
    parts.push(`${Math.floor(stats.duration / 60)} minute session`);
  }
  if (narrative.totalInterruptions > 0) {
    parts.push(`fought through ${narrative.totalInterruptions} interruptions`);
  }
  if (narrative.longestPureStreak > 300) {
    parts.push(`${Math.floor(narrative.longestPureStreak / 60)} min pure focus streak`);
  }
  if (stats.bossDefeated) {
    parts.push('boss defeated');
  }
  return parts.join(', ') + '.';
}

export function addBeatToNarrative(
  narratives: Map<string, SessionNarrative>,
  sessionId: string,
  beat: NarrativeBeat,
): void {
  const narrative = narratives.get(sessionId);
  if (!narrative) {return;}
  narrative.beats.push(beat);
}
