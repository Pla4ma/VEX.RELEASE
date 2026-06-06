import type { MessageCategory } from '../types';

export const DEFAULT_MESSAGE_TEMPLATES: Record<MessageCategory, string[]> = {
  STREAK_RISK: [
    'Your {{currentStreak}}-day streak needs {{minutesNeeded}} minutes today. One short block protects it.',
    'One quick focus session today keeps your {{currentStreak}}-day rhythm alive.',
    'Small window still open. {{minutesNeeded}} minutes saves the chain.',
  ],
  SESSION_SUGGESTION: [
    'Your session history shows now is a reliable window. Start one clean block.',
    'Based on your rhythm, a {{suggestedDuration}}-minute session fits now.',
    'Previous sessions started cleaner around this time. One block is enough.',
  ],
  MILESTONE_HYPE: [
    '{{milestoneDays}} days of showing up. The pattern is real now.',
    '{{milestoneDays}} days is genuine consistency. That rhythm is yours.',
    'Your practice held for {{milestoneDays}} days. Evidence is in the sessions.',
  ],
  COMEBACK_SUPPORT: [
    'Welcome back. Your history shows one clean start rebuilds momentum.',
    'No penalty for the gap. A short session today counts fully.',
    'You returned. That proves the discipline is still there.',
  ],
  POST_FAILURE: [
    'That session did not go as planned. The data suggests a smaller block next time.',
    'One rough session does not undo the pattern. Adjust the target and try again.',
    'The next session starts cleaner. Keep the target small.',
  ],
  PROGRESS_REMINDER: [
    '{{percentToNextLevel}}% to Level {{nextLevel}}. Steady progress from real sessions.',
    '{{totalXp}} XP earned from completed blocks. It adds up.',
    'Level {{currentLevel}} is solid proof. Level {{nextLevel}} is the next small step.',
  ],
  DIFFICULTY_ADJUST: [
    'Based on recent sessions, a {{adjustmentDirection}} difficulty change may help.',
    'Your last few blocks suggest {{trend}} performance. A small difficulty tweak is available.',
    'Session data points to {{adjustmentDirection}} difficulty for better flow.',
  ],
  CHALLENGE_PROMPT: [
    '{{challengeName}} has {{hoursLeft}} hours. {{challengeProgress}}% complete — one session could close it.',
    'You are {{challengeProgress}}% through {{challengeName}}. One focused block finishes the goal.',
    '{{challengeName}} is near the deadline. Progress shows you can complete it.',
  ],
  MOTIVATION_BOOST: [
    'Your session count shows real effort. The next block builds on that.',
    'Consistent blocks add up. Your history proves it.',
    'The work you have logged is genuine. One more block extends the proof.',
  ],
  BREAK_SUGGESTION: [
    'You have put in several sessions. A short break now protects future focus.',
    'Recovery between blocks improves the next one. Evidence supports pacing.',
    'Quality holds better with space between sessions. Consider a reset.',
  ],
  OVERLOAD_WARNING: [
    'Session volume is high today. Pacing now keeps tomorrow available.',
    'Several blocks completed already. Recovery between sessions is part of the rhythm.',
    'Consistent, not constant. A break now protects the quality of the next block.',
  ],
};

export function getDefaultTemplate(
  category: MessageCategory,
  context: Record<string, unknown>,
): string | null {
  const templates = DEFAULT_MESSAGE_TEMPLATES[category];
  if (!templates || templates.length === 0) {
    return null;
  }
  const idx = Math.floor(Math.random() * templates.length);
  let template = templates[idx];
  if (!template) {
    return null;
  }
  Object.entries(context).forEach(([key, value]) => {
    template = template!.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });
  return template!;
}
