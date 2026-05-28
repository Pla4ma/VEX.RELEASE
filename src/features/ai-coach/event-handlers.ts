import * as service from "./service";
import { generateAndSendMessage } from "./message-helpers";

export async function handleLevelUp(payload: {
  userId: string;
  oldLevel: number;
  newLevel: number;
  xpGained: number;
}): Promise<void> {
  await generateAndSendMessage(payload.userId, "MILESTONE_HYPE", {
    milestoneLevel: payload.newLevel,
    oldLevel: payload.oldLevel,
  });
  if (payload.newLevel % 5 === 0) {
    await service.adjustDifficulty({
      userId: payload.userId,
      reason: `Level up to ${payload.newLevel} - periodic review`,
    });
  }
  await service.processBehaviorSignal({
    userId: payload.userId,
    signalType: "DIFFICULTY_PREFERENCE",
    value: payload.newLevel,
  });
}

export async function handleChallengeExpiring(payload: {
  userId: string;
  challengeId: string;
  challengeName: string;
  hoursRemaining: number;
  progress: number;
}): Promise<void> {
  await service.evaluateInterventions({
    userId: payload.userId,
    trigger: "CHALLENGE_EXPIRING",
    context: {
      challengeId: payload.challengeId,
      challengeName: payload.challengeName,
      hoursRemaining: payload.hoursRemaining,
      progress: payload.progress,
    },
  });
}

export async function handleChallengeCompleted(payload: {
  userId: string;
  challengeId: string;
  difficulty: string;
}): Promise<void> {
  await service.processBehaviorSignal({
    userId: payload.userId,
    signalType: "CHALLENGE_COMPLETION_RATE",
    value: 1.0,
    metadata: {
      challengeId: payload.challengeId,
      difficulty: payload.difficulty,
    },
  });
}

export async function handleBossTimeoutWarning(payload: {
  userId: string;
  bossId: string;
  bossName: string;
  hoursRemaining: number;
  healthRemaining: number;
}): Promise<void> {
  await service.evaluateInterventions({
    userId: payload.userId,
    trigger: "BOSS_TIMEOUT_WARNING",
    context: {
      bossId: payload.bossId,
      bossName: payload.bossName,
      hoursRemaining: payload.hoursRemaining,
      healthRemaining: payload.healthRemaining,
    },
  });
}

export async function handleUserReturned(payload: {
  userId: string;
  daysInactive: number;
  lastSessionAt: number;
}): Promise<void> {
  if (payload.daysInactive >= 3) {
    await service.processBehaviorSignal({
      userId: payload.userId,
      signalType: "COMEBACK_VELOCITY",
      value: 1,
      metadata: { daysInactive: payload.daysInactive },
    });
  }
}

export async function handleDailyCheck(payload: {
  userId: string;
  lastSessionAt: number | null;
  streakDays: number;
}): Promise<void> {
  const now = Date.now();
  const hoursSinceLastSession = payload.lastSessionAt
    ? (now - payload.lastSessionAt) / (1000 * 60 * 60)
    : Infinity;
  if (hoursSinceLastSession > 24) {
    await service.evaluateInterventions({
      userId: payload.userId,
      trigger: "NO_SESSION_24H",
      context: { hoursSinceLastSession, streakDays: payload.streakDays },
    });
  }
  await service.createRecommendation({
    userId: payload.userId,
    type: payload.streakDays > 0 ? "STREAK_PROTECTION" : "OPTIMAL_TIME",
    context: { hoursSinceLastSession, streakDays: payload.streakDays },
  });
}
