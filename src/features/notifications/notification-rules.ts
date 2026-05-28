import type {
  NotificationContext,
  NotificationRuleResult,
} from "./service-types";

export function shouldNotifyStreakAtRisk(
  context: NotificationContext,
): NotificationRuleResult {
  const { streakRisk } = context;
  if (!streakRisk || streakRisk.hoursRemaining > 12) {
    return { shouldSend: false, priority: 0, message: { title: "", body: "" } };
  }
  const urgency =
    streakRisk.riskLevel === "CRITICAL"
      ? "🚨 LAST CHANCE"
      : streakRisk.riskLevel === "HIGH"
        ? "⚠️ Streak at Risk"
        : "⏰ Streak Warning";
  return {
    shouldSend: true,
    priority: streakRisk.riskLevel === "CRITICAL" ? 10 : 8,
    message: {
      title: urgency,
      body: `Your 🔥 ${streakRisk.streakDays}-day streak ends in ${streakRisk.hoursRemaining} hours! Start a session now.`,
    },
  };
}

export function shouldNotifyBossEscape(
  context: NotificationContext,
): NotificationRuleResult {
  const { bossEscape } = context;
  if (!bossEscape || bossEscape.hoursRemaining > 4) {
    return { shouldSend: false, priority: 0, message: { title: "", body: "" } };
  }
  return {
    shouldSend: true,
    priority: 9,
    message: {
      title: "👹 Boss Escaping Soon!",
      body: `${bossEscape.bossName} has ${bossEscape.healthPercent.toFixed(0)}% health and escapes in ${bossEscape.hoursRemaining}h! Defeat them now!`,
    },
  };
}

export function shouldNotifySquadStreakAtRisk(
  context: NotificationContext,
): NotificationRuleResult {
  const { squadStreak } = context;
  if (!squadStreak) {
    return { shouldSend: false, priority: 0, message: { title: "", body: "" } };
  }
  return {
    shouldSend: true,
    priority: 7,
    message: {
      title: "🔥 Squad Streak at Risk!",
      body: `${squadStreak.atRiskMemberName} hasn't focused today — your ${squadStreak.streakDays}-day squad streak is at risk!`,
    },
  };
}

export function shouldNotifyRivalAhead(
  context: NotificationContext,
): NotificationRuleResult {
  const { rivalUpdate } = context;
  if (!rivalUpdate || rivalUpdate.myScore >= rivalUpdate.theirScore) {
    return { shouldSend: false, priority: 0, message: { title: "", body: "" } };
  }
  const diff = rivalUpdate.theirScore - rivalUpdate.myScore;
  return {
    shouldSend: true,
    priority: 6,
    message: {
      title: "⚔️ Rival Alert!",
      body: `${rivalUpdate.rivalName} just focused for ${rivalUpdate.theirNewSessionMinutes} min. You're ${diff} min behind this week!`,
    },
  };
}

export function shouldNotifyChestFull(
  context: NotificationContext,
): NotificationRuleResult {
  const { chestStatus } = context;
  if (!chestStatus || chestStatus.unopenedCount < chestStatus.maxCapacity) {
    return { shouldSend: false, priority: 0, message: { title: "", body: "" } };
  }
  return {
    shouldSend: true,
    priority: 5,
    message: {
      title: "🎁 Chests Full!",
      body: `Your chest inventory is full (${chestStatus.unopenedCount}/${chestStatus.maxCapacity}). Open one to make room for more!`,
    },
  };
}

export function shouldNotifyChallengeExpiring(
  context: NotificationContext,
): NotificationRuleResult {
  const { challengeExpiry } = context;
  if (
    !challengeExpiry ||
    challengeExpiry.hoursRemaining > 2 ||
    challengeExpiry.progressPercent >= 50
  ) {
    return { shouldSend: false, priority: 0, message: { title: "", body: "" } };
  }
  return {
    shouldSend: true,
    priority: 4,
    message: {
      title: "⏰ Challenge Ending!",
      body: `"${challengeExpiry.challengeName}" expires in ${challengeExpiry.hoursRemaining}h and you're only ${challengeExpiry.progressPercent}% complete!`,
    },
  };
}

export function shouldNotifySeasonEnding(
  context: NotificationContext,
): NotificationRuleResult {
  const { seasonEnding } = context;
  if (
    !seasonEnding ||
    seasonEnding.hoursRemaining > 24 ||
    seasonEnding.unclaimedTiers === 0
  ) {
    return { shouldSend: false, priority: 0, message: { title: "", body: "" } };
  }
  return {
    shouldSend: true,
    priority: 8,
    message: {
      title: "🌙 Season Ending!",
      body: `Season ends in ${Math.floor(seasonEnding.hoursRemaining)} hours! You have ${seasonEnding.unclaimedTiers} unclaimed reward tiers!`,
    },
  };
}

export function evaluateNotificationRules(context: NotificationContext): {
  shouldSend: boolean;
  notification?: { title: string; body: string; priority: number };
} {
  const rules = [
    shouldNotifyStreakAtRisk(context),
    shouldNotifyBossEscape(context),
    shouldNotifySquadStreakAtRisk(context),
    shouldNotifyRivalAhead(context),
    shouldNotifyChestFull(context),
    shouldNotifyChallengeExpiring(context),
    shouldNotifySeasonEnding(context),
  ];
  const sendable = rules.filter((r) => r.shouldSend);
  if (sendable.length === 0) {
    return { shouldSend: false };
  }
  sendable.sort((a, b) => b.priority - a.priority);
  const top = sendable[0]!;
  return {
    shouldSend: true,
    notification: { ...top.message, priority: top.priority },
  };
}
