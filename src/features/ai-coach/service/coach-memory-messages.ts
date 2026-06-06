import type { CoachMemory } from './coach-memory-types';
import { getOrCreateMemory, getPersonalizedContext } from './coach-memory';

export function generatePersonalizedMessage(
  userId: string,
  baseMessage: string,
  category: string,
): string {
  const memory = getOrCreateMemory(userId);
  let personalized = baseMessage;
  if (personalized.includes('{{personalBestStreak}}')) {
    personalized = personalized.replace(
      /\{\{personalBestStreak\}\}/g,
      String(memory.longestStreak),
    );
  }
  if (personalized.includes('{{personalBestQuality}}')) {
    personalized = personalized.replace(
      /\{\{personalBestQuality\}\}/g,
      String(memory.bestSessionQuality),
    );
  }
  if (
    personalized.includes('{{productiveTimeOfDay}}') &&
    memory.mostProductiveTimeOfDay
  ) {
    personalized = personalized.replace(
      /\{\{productiveTimeOfDay\}\}/g,
      memory.mostProductiveTimeOfDay,
    );
  }
  if (personalized.includes('{{totalSessions}}')) {
    personalized = personalized.replace(
      /\{\{totalSessions\}\}/g,
      String(memory.totalSessionsCompleted),
    );
  }
  if (personalized.includes('{{totalFocusMinutes}}')) {
    personalized = personalized.replace(
      /\{\{totalFocusMinutes\}\}/g,
      String(memory.totalFocusMinutes),
    );
  }
  if (
    personalized.includes('{{lastBossDefeated}}') &&
    memory.lastBossDefeated
  ) {
    personalized = personalized.replace(
      /\{\{lastBossDefeated\}\}/g,
      memory.lastBossDefeated,
    );
  }
  if (personalized.includes('{{comebackCount}}')) {
    personalized = personalized.replace(
      /\{\{comebackCount\}\}/g,
      String(memory.comebackCount),
    );
  }
  return personalized;
}

export function getMemoryBasedSuggestions(
  userId: string,
  category:
    | 'STREAK_RISK'
    | 'MILESTONE_HYPE'
    | 'COMEBACK_SUPPORT'
    | 'PROGRESS_REMINDER',
): string[] {
  const memory = getOrCreateMemory(userId);
  const suggestions: string[] = [];
  switch (category) {
    case 'STREAK_RISK':
      if (memory.longestStreak > 0) {
        suggestions.push(
          `You had a ${memory.longestStreak}-day streak in the past. Let's beat that record!`,
          `Your personal best is ${memory.longestStreak} days. I know you can protect this one.`,
          `You've done ${memory.longestStreak} days before. This current streak could be even longer!`,
        );
      }
      break;
    case 'MILESTONE_HYPE':
      if (memory.bestSessionQuality > 90) {
        suggestions.push(
          `Your best session ever scored ${memory.bestSessionQuality}! That kind of focus is legendary.`,
          `Remember that ${memory.bestSessionQuality}-quality session? You're capable of incredible things!`,
        );
      }
      if (memory.totalSessionsCompleted > 50) {
        suggestions.push(
          `${memory.totalSessionsCompleted} total sessions! You're building something amazing.`,
          `Over ${Math.round(memory.totalFocusMinutes / 60)} hours of focused work. That's dedication!`,
        );
      }
      break;
    case 'COMEBACK_SUPPORT':
      if (memory.comebackCount > 0) {
        suggestions.push(
          `This is comeback #${memory.comebackCount} for you. Each one made you stronger.`,
          `You've bounced back ${memory.comebackCount} times before. This is just the next chapter.`,
          `Your ${memory.comebackCount} previous comebacks prove your resilience. Let's make this #${memory.comebackCount + 1}!`,
        );
      }
      if (memory.longestStreak > 7) {
        suggestions.push(
          `That ${memory.longestStreak}-day streak? You built that. You can build again.`,
          "You've done long streaks before. The ability is still there.",
        );
      }
      break;
    case 'PROGRESS_REMINDER':
      if (memory.mostProductiveTimeOfDay) {
        suggestions.push(
          `Your most productive time tends to be ${memory.mostProductiveTimeOfDay}s. Use that knowledge!`,
          `You've crushed sessions during ${memory.mostProductiveTimeOfDay} before. That's your power time!`,
        );
      }
      if (memory.mostUsedSessionDuration > 0) {
        suggestions.push(
          `${memory.mostUsedSessionDuration} minutes is your sweet spot. Stick with what works!`,
          `You've preferred ${memory.mostUsedSessionDuration}-minute sessions. Trust that pattern.`,
        );
      }
      break;
  }
  return suggestions;
}
