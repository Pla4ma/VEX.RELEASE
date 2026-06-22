import { MMKVStorageAdapter } from '../../../persistence/MMKVStorageAdapter';
import type { PersonalQuest, UserPatterns } from './quest-types';
import { PersonalQuestSchema } from './quest-types';
import {
  selectQuestType,
  generatePeakTimeQuest,
  generatePersonalBestQuest,
  generateNoPauseQuest,
  generateQualityQuest,
  generateBossQuest,
  generateRivalQuest,
  generateDefaultQuest,
} from './quest-generators';

const questStorage = new MMKVStorageAdapter('personal-quests');

function getQuestStorageKey(userId: string): string {
  return `daily:${userId}:${new Date().toISOString().slice(0, 10)}`;
}

export async function analyzeUserPatterns(
  _userId: string,
): Promise<UserPatterns> {
  return {
    peakFocusHour: 20,
    avgSessionDuration: 32,
    maxSessionDuration: 60,
    daysSinceNoPauseSession: 5,
    currentStreak: 7,
    lastQualityGrade: 'B',
    avgQualityScore: 75,
    sessionsThisWeek: 12,
    preferredSessionTimes: [8, 13, 20],
    commonPauseReasons: ['distraction', 'notification'],
    lastBossEncounter: Date.now() - 86400000,
    rivalStatus: 'BEHIND',
    squadContribution: 180,
  };
}

export function generateQuestFromPatterns(
  userId: string,
  patterns: UserPatterns,
): PersonalQuest {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const questType = selectQuestType(patterns);
  switch (questType) {
    case 'PEAK_TIME_FOCUS':
      return generatePeakTimeQuest(userId, patterns, endOfDay.getTime());
    case 'BEAT_PERSONAL_BEST':
      return generatePersonalBestQuest(userId, patterns, endOfDay.getTime());
    case 'NO_PAUSE_CHALLENGE':
      return generateNoPauseQuest(userId, patterns, endOfDay.getTime());
    case 'QUALITY_GRADE_TARGET':
      return generateQualityQuest(userId, patterns, endOfDay.getTime());
    case 'BOSS_DAMAGE_DEALT':
      return generateBossQuest(userId, patterns, endOfDay.getTime());
    case 'RIVAL_OUTFOCUS':
      return generateRivalQuest(userId, patterns, endOfDay.getTime());
    default:
      return generateDefaultQuest(userId, patterns, endOfDay.getTime());
  }
}

export function questToCoachMessage(
  quest: PersonalQuest,
  persona: 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT' = 'MENTOR',
): string {
  const introTexts: Record<string, string> = {
    MENTOR:
      "I've been reviewing your progress, and I have a personalized challenge for you today.",
    CHEERLEADER:
      "Hey champion! 🎉 I've got a SPECIAL challenge just for YOU today!",
    DRILL_SERGEANT: 'Your objective for today. Pay attention.',
  };
  return `${introTexts[persona]}

**${quest.title}**
${quest.description}

🏆 Reward: ${quest.rewardXp} XP (${Math.round(quest.rewardBonus * 100)}% bonus!)
⏰ Expires: Midnight

${quest.reasoning}`;
}

export function updateQuestProgress(
  quest: PersonalQuest,
  sessionData: {
    duration: number;
    qualityScore: number;
    pauses: number;
    damageDealt?: number;
    completedAt: number;
  },
): PersonalQuest {
  let newCurrent = quest.current;
  switch (quest.type) {
    case 'PEAK_TIME_FOCUS':
    case 'BEAT_PERSONAL_BEST':
    case 'NO_PAUSE_CHALLENGE':
      if (quest.type === 'NO_PAUSE_CHALLENGE' && sessionData.pauses === 0) {
        newCurrent = sessionData.duration;
      } else if (quest.type !== 'NO_PAUSE_CHALLENGE') {
        newCurrent = sessionData.duration;
      }
      break;
    case 'QUALITY_GRADE_TARGET':
      newCurrent = sessionData.qualityScore;
      break;
    case 'BOSS_DAMAGE_DEALT':
      newCurrent = sessionData.damageDealt || 0;
      break;
    case 'RIVAL_OUTFOCUS':
    case 'DURATION_MILESTONE':
      newCurrent += sessionData.duration;
      break;
  }
  const completed = newCurrent >= quest.target;
  return {
    ...quest,
    current: Math.min(newCurrent, quest.target),
    completedAt: completed ? sessionData.completedAt : null,
  };
}

export function isQuestCompleted(quest: PersonalQuest): boolean {
  return quest.current >= quest.target || quest.completedAt !== null;
}

export function formatQuestProgress(quest: PersonalQuest): string {
  const percent = Math.min(
    100,
    Math.round((quest.current / quest.target) * 100),
  );
  return `${quest.current}/${quest.target} ${quest.unit} (${percent}%)`;
}

export async function generateDailyQuest(
  userId: string,
): Promise<PersonalQuest> {
  const patterns = await analyzeUserPatterns(userId);
  const quest = generateQuestFromPatterns(userId, patterns);
  questStorage.setItemSync(getQuestStorageKey(userId), JSON.stringify(quest));
  return quest;
}

export async function getActiveQuest(
  userId: string,
): Promise<PersonalQuest | null> {
  const raw = questStorage.getItemSync(getQuestStorageKey(userId));
  if (!raw) {
    return null;
  }
  const parsed = PersonalQuestSchema.safeParse(JSON.parse(raw));
  if (!parsed.success || parsed.data.expiresAt <= Date.now()) {
    return null;
  }
  // Validated by Zod schema — safe assertion at parse boundary
  return parsed.data as PersonalQuest;
}

export type { PersonalQuest, UserPatterns, QuestType } from './quest-types';
