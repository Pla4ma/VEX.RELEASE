import { z } from 'zod';

import { spendCurrency } from '../economy/service';
import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import {
  CompanionMood,
  CompanionPhase,
  CompanionSessionEvent,
  CompanionState,
  EVOLUTION_THRESHOLDS,
} from './types';

const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  mood: z.enum(['happy', 'neutral', 'sad', 'starving']),
  level: z.number().min(1),
  xp: z.number().min(0),
  lastFedAt: z.number(),
  lastPettedAt: z.number().nullable(),
  specialAbilityCharge: z.number().min(0),
  equippedItems: z.array(z.string()),
  unlockedAbilities: z.array(
    z.enum(['xp_boost_5pct', 'coin_boost_10pct', 'streak_protection']),
  ),
});

type CompanionProfile = z.infer<typeof profileSchema>;
type PersistOptions = { skipSyncEnqueue?: boolean };

const storage = getDefaultStorageAdapter();

function profileKey(userId: string): string {
  return `companion_profile_${userId}`;
}

function getMoodFromFeedTime(lastFedAt: number): CompanionProfile['mood'] {
  const hours = (Date.now() - lastFedAt) / (1000 * 60 * 60);
  if (hours < 12) {return 'happy';}
  if (hours < 24) {return 'neutral';}
  if (hours < 48) {return 'sad';}
  return 'starving';
}

function getDefaultProfile(userId: string): CompanionProfile {
  const lastFedAt = Date.now();
  return {
    id: `companion_${userId}`,
    name: 'Vexling',
    type: 'focus_wisp',
    mood: 'happy',
    level: 1,
    xp: 0,
    lastFedAt,
    lastPettedAt: null,
    specialAbilityCharge: 0,
    equippedItems: [],
    unlockedAbilities: [],
  };
}

async function loadProfile(userId: string): Promise<CompanionProfile> {
  const raw = await storage.getItem(profileKey(userId));
  if (!raw) {return getDefaultProfile(userId);}
  const parsed = profileSchema.parse(JSON.parse(raw));
  return { ...parsed, mood: getMoodFromFeedTime(parsed.lastFedAt) };
}

async function saveProfile(
  userId: string,
  profile: CompanionProfile,
): Promise<CompanionProfile> {
  const next = { ...profile, mood: getMoodFromFeedTime(profile.lastFedAt) };
  await storage.setItem(profileKey(userId), JSON.stringify(next));
  return next;
}

function getAbilityUnlocks(
  level: number,
): CompanionProfile['unlockedAbilities'] {
  return [
    ...(level >= 5 ? (['xp_boost_5pct'] as const) : []),
    ...(level >= 10 ? (['coin_boost_10pct'] as const) : []),
    ...(level >= 20 ? (['streak_protection'] as const) : []),
  ];
}

export async function getCompanion(userId: string): Promise<CompanionProfile> {
  return loadProfile(userId);
}

export async function levelUpCompanion(
  userId: string,
): Promise<CompanionProfile> {
  const current = await loadProfile(userId);
  const nextLevel = Math.max(1, Math.floor(current.xp / 500) + 1);
  return saveProfile(userId, {
    ...current,
    level: nextLevel,
    unlockedAbilities: getAbilityUnlocks(nextLevel),
  });
}

export async function feedCompanion(
  userId: string,
  options: PersistOptions = {},
): Promise<CompanionProfile> {
  await spendCurrency({
    userId,
    currency: 'COINS',
    amount: 10,
    sink: 'UPGRADE',
    description: 'Feed companion',
  });
  const current = await loadProfile(userId);
  const updated = await saveProfile(userId, {
    ...current,
    xp: current.xp + 50,
    lastFedAt: Date.now(),
    mood: 'happy',
  });
  const leveled = await levelUpCompanion(userId);
  void options.skipSyncEnqueue;
  return { ...leveled, mood: updated.mood };
}

export async function getCompanionBonus(userId: string): Promise<{
  xpMultiplier: number;
  coinMultiplier: number;
  streakProtection: boolean;
  mood: CompanionProfile['mood'];
}> {
  const companion = await loadProfile(userId);
  const moodMultiplier = { happy: 1.1, neutral: 1, sad: 0.95, starving: 0.9 }[
    companion.mood
  ];
  return {
    xpMultiplier:
      moodMultiplier *
      (companion.unlockedAbilities.includes('xp_boost_5pct') ? 1.05 : 1),
    coinMultiplier: companion.unlockedAbilities.includes('coin_boost_10pct')
      ? 1.1
      : 1,
    streakProtection: companion.unlockedAbilities.includes('streak_protection'),
    mood: companion.mood,
  };
}

export class CompanionService {
  private state: CompanionState | null = null;
  private eventListeners: Array<(event: CompanionSessionEvent) => void> = [];
  private lastMilestone = 0;
  private currentStreakSeconds = 0;

  constructor(initialState?: CompanionState) {
    if (initialState) {this.state = { ...initialState };}
  }

  startSession(_sessionDurationMinutes?: number): void {
    if (!this.state) {return;}
    this.state.currentMood = 'SLEEPY';
    this.state.sessionProgress = 0;
    this.state.energyLevel = 50;
    this.lastMilestone = 0;
    this.currentStreakSeconds = 0;
    this.emitEvent({
      type: 'MOOD_SHIFT',
      timestamp: Date.now(),
      data: { mood: 'SLEEPY', message: 'Your companion awakens...' },
    });
  }

  tick(
    elapsedSeconds: number,
    totalDurationSeconds: number,
    purityScore: number,
    isPaused: boolean,
  ): void {
    if (!this.state) {return;}
    const progress = (elapsedSeconds / totalDurationSeconds) * 100;
    this.state.sessionProgress = progress;
    this.state.purityScore = purityScore;
    if (!isPaused) {
      this.state.energyLevel = Math.max(
        0,
        Math.min(
          100,
          this.state.energyLevel +
            (purityScore > 80 ? 0.2 : purityScore > 50 ? 0.1 : -0.3),
        ),
      );
      this.currentStreakSeconds =
        purityScore > 80 ? this.currentStreakSeconds + 1 : 0;
    }
    const nextMood = this.calculateMood(
      progress,
      this.state.energyLevel,
      purityScore,
    );
    if (nextMood !== this.state.currentMood) {
      this.state.currentMood = nextMood;
      this.emitEvent({
        type: 'MOOD_SHIFT',
        timestamp: Date.now(),
        data: { mood: nextMood, message: this.getMoodMessage(nextMood) },
      });
    }
    const milestone = Math.floor(progress / 10) * 10;
    if (milestone > this.lastMilestone && milestone > 0) {
      this.lastMilestone = milestone;
      this.emitEvent({
        type: 'MILESTONE',
        timestamp: Date.now(),
        data: {
          progressDelta: milestone,
          message: `${milestone}% - Your companion grows stronger!`,
        },
      });
    }
  }

  completeSession(
    sessionMinutes: number,
    finalPurity: number,
  ): { leveledUp: boolean; evolved: boolean; newPhase?: CompanionPhase } {
    if (!this.state) {return { leveledUp: false, evolved: false };}
    this.state.totalFocusMinutes += sessionMinutes;
    this.state.sessionCount += 1;
    if (finalPurity > 90) {this.state.perfectSessions += 1;}
    const currentThreshold = EVOLUTION_THRESHOLDS[this.state.phase];
    const phases: CompanionPhase[] = [
      'EGG',
      'HATCHING',
      'YOUNG',
      'MATURE',
      'AWAKENED',
      'TRANSCENDENT',
    ];
    const minutesInPhase =
      this.state.totalFocusMinutes -
      phases
        .slice(0, phases.indexOf(this.state.phase))
        .reduce((sum, phase) => sum + EVOLUTION_THRESHOLDS[phase], 0);
    if (
      minutesInPhase >= currentThreshold &&
      this.state.phase !== 'TRANSCENDENT'
    ) {
      this.state.phase = phases[phases.indexOf(this.state.phase) + 1];
      this.state.level = 1;
      return { leveledUp: true, evolved: true, newPhase: this.state.phase };
    }
    this.state.level = Math.max(
      1,
      Math.floor((minutesInPhase / currentThreshold) * 100),
    );
    return { leveledUp: true, evolved: false };
  }

  getState(): CompanionState | null {
    return this.state ? { ...this.state } : null;
  }

  onEvent(callback: (event: CompanionSessionEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter(
        (listener) => listener !== callback,
      );
    };
  }

  private calculateMood(
    progress: number,
    energy: number,
    purity: number,
  ): CompanionMood {
    if (purity < 30 && energy < 20) {return 'DANGER';}
    if (energy < 30) {return 'STRUGGLING';}
    if (progress > 95 && energy > 80 && purity > 90) {return 'ECSTATIC';}
    if (progress > 70 && energy > 60) {return 'DETERMINED';}
    if (progress > 30 && energy > 50 && purity > 70) {return 'FOCUSED';}
    if (progress > 10 && energy > 30) {return 'CONTENT';}
    return 'SLEEPY';
  }

  private getMoodMessage(mood: CompanionMood): string {
    return {
      SLEEPY: 'Your companion stirs...',
      CONTENT: 'Your companion is at peace.',
      FOCUSED: 'Your companion focuses with you.',
      DETERMINED: 'Your companion pushes forward!',
      ECSTATIC: 'Your companion radiates pure energy!',
      STRUGGLING: 'Your companion needs your focus...',
      DANGER: 'Your companion is fading! Stay focused!',
    }[mood];
  }

  private emitEvent(event: CompanionSessionEvent): void {
    for (const callback of this.eventListeners) {callback(event);}
  }
}

let activeCompanionService: CompanionService | null = null;

export function getCompanionService(state?: CompanionState): CompanionService {
  if (!activeCompanionService || state)
    {activeCompanionService = new CompanionService(state);}
  return activeCompanionService;
}

export function clearCompanionService(): void {
  activeCompanionService = null;
}
