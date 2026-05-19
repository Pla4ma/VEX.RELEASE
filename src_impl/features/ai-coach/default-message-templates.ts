import type { MessageCategory } from './types';

export const DEFAULT_MESSAGE_TEMPLATES: Record<MessageCategory, string[]> = {
  STREAK_RISK: [
    "Your streak is at risk! Your 7-day streak needs {{minutesNeeded}} more minutes today.",
    "Don't let your {{currentStreak}}-day streak slip away! One quick focus session will save it.",
    "Your streak needs you! A short session today keeps the momentum going.",
  ],
  SESSION_SUGGESTION: [
    "Perfect time for a session! Your focus data shows you concentrate best at this time.",
    "Ready to build momentum? A {{suggestedDuration}}-minute session would be ideal based on your patterns.",
    "Your optimal focus window is open! Based on your history, now is the time to maximize focus.",
  ],
  MILESTONE_HYPE: [
    "Incredible progress! {{milestoneDays}} days of consistency! Your data shows the effort is paying off.",
    "Milestone reached! {{milestoneDays}} days proves your commitment to the practice.",
    "Milestone crushed! {{milestoneDays}} days of focus data shows real growth.",
  ],
  COMEBACK_SUPPORT: [
    "Welcome back! Your history shows you can rebuild. Let's start fresh with a {{bonusMultiplier}}x XP boost.",
    "Missed a few days? No problem! Your comeback starts now with bonus rewards.",
    "Your focus record shows you had discipline before. Time to prove it again.",
  ],
  POST_FAILURE: [
    "That session didn't go as planned. Your patterns suggest adjusting the difficulty for next time.",
    "Every expert was once a beginner. Your data shows improvement is possible with small tweaks.",
    "Focus is a skill. Today's difficulty becomes tomorrow's strength. Analyze and adjust.",
  ],
  PROGRESS_REMINDER: [
    "You're {{percentToNextLevel}}% to Level {{nextLevel}}! Your session history shows you're close to a breakthrough.",
    "Your progress data shows {{totalXp}} XP earned so far. Keep the momentum going!",
    "Level {{currentLevel}} is solid! Ready to push for {{nextLevel}}? Your streak data suggests now is the time.",
  ],
  DIFFICULTY_ADJUST: [
    "Your recent sessions show a pattern. Let's adjust the challenge to match your current performance.",
    "Your focus sessions have been {{trend}}. Based on your data, consider {{adjustmentDirection}} the difficulty.",
    "Smart adaptation is key to growth. Your session history suggests a difficulty tweak now.",
  ],
  CHALLENGE_PROMPT: [
    "Challenge alert! {{challengeName}} expires in {{hoursLeft}} hours. Your progress shows you can complete it.",
    "Don't leave rewards on the table! {{challengeProgress}}% complete — your data suggests finishing strong.",
    "Your challenge data shows potential! One session could complete it.",
  ],
  MOTIVATION_BOOST: [
    "Your focus data shows capability for amazing results. Today's session creates tomorrow's achievement.",
    "Small steps compound into big results. Your session history proves consistency works.",
    "Your focus patterns show you have what it takes. Trust your data.",
  ],
  BREAK_SUGGESTION: [
    "You've been pushing hard! Your session frequency suggests you need a short break for recovery.",
    "Quality over quantity. Your recent performance data indicates a mindful break now will improve future sessions.",
    "Your focus data shows intensity. A reset now will help maintain long-term performance.",
  ],
  OVERLOAD_WARNING: [
    "High session volume detected! Your data shows you've completed many sessions today. Consider pacing for quality.",
    "Impressive dedication! Your session count suggests you may be approaching burnout. Balance intensity with recovery.",
    "You're pushing hard based on your activity data! Make sure to balance intensity with recovery.",
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
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });
  return template;
}
