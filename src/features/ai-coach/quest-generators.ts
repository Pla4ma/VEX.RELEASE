import type { PersonalQuest, QuestType, UserPatterns } from "./quest-types";

export function selectQuestType(patterns: UserPatterns): QuestType {
  const options: QuestType[] = [];
  if (patterns.peakFocusHour !== null) {
    options.push("PEAK_TIME_FOCUS");
  }
  if (patterns.daysSinceNoPauseSession > 3) {
    options.push("NO_PAUSE_CHALLENGE");
  }
  if (patterns.avgQualityScore < 80) {
    options.push("QUALITY_GRADE_TARGET");
  }
  if (patterns.avgSessionDuration > patterns.maxSessionDuration * 0.8) {
    options.push("BEAT_PERSONAL_BEST");
  }
  if (
    patterns.lastBossEncounter &&
    Date.now() - patterns.lastBossEncounter < 172800000
  ) {
    options.push("BOSS_DAMAGE_DEALT");
  }
  if (patterns.rivalStatus === "BEHIND") {
    options.push("RIVAL_OUTFOCUS");
  }
  return (
    options[Math.floor(Math.random() * options.length)] || "DURATION_MILESTONE"
  );
}

export function generatePeakTimeQuest(
  userId: string,
  patterns: UserPatterns,
  expiresAt: number,
): PersonalQuest {
  const hour = patterns.peakFocusHour || 20;
  const hourFormatted = hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  return {
    id: `quest-${Date.now()}-peak`,
    userId,
    type: "PEAK_TIME_FOCUS",
    title: "Peak Performance",
    description: `Focus at your peak time (${hourFormatted}) today. Your historical data shows this is when you do your best work.`,
    target: 30,
    current: 0,
    unit: "minutes",
    rewardXp: 150,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: `Based on your pattern: highest quality sessions occur around ${hourFormatted}`,
  };
}

export function generatePersonalBestQuest(
  userId: string,
  patterns: UserPatterns,
  expiresAt: number,
): PersonalQuest {
  const targetDuration = patterns.maxSessionDuration + 5;
  return {
    id: `quest-${Date.now()}-pb`,
    userId,
    type: "BEAT_PERSONAL_BEST",
    title: "Personal Best Challenge",
    description: `Beat your longest session record! Your current best is ${patterns.maxSessionDuration} minutes. Can you reach ${targetDuration}?`,
    target: targetDuration,
    current: 0,
    unit: "minutes",
    rewardXp: 200,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: `Your recent sessions average ${patterns.avgSessionDuration}min — you're close to your ${patterns.maxSessionDuration}min record`,
  };
}

export function generateNoPauseQuest(
  userId: string,
  patterns: UserPatterns,
  expiresAt: number,
): PersonalQuest {
  const duration = Math.max(15, patterns.avgSessionDuration - 10);
  return {
    id: `quest-${Date.now()}-nopause`,
    userId,
    type: "NO_PAUSE_CHALLENGE",
    title: "Uninterrupted Flow",
    description: `Complete a ${duration}-minute session without pausing. Your last pause-free session was ${patterns.daysSinceNoPauseSession} days ago.`,
    target: duration,
    current: 0,
    unit: "minutes (no pauses)",
    rewardXp: 180,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: `You haven't completed a pause-free session in ${patterns.daysSinceNoPauseSession} days — time to rebuild that habit`,
  };
}

export function generateQualityQuest(
  userId: string,
  patterns: UserPatterns,
  expiresAt: number,
): PersonalQuest {
  const targetGrade = patterns.avgQualityScore >= 70 ? "A" : "B";
  return {
    id: `quest-${Date.now()}-quality`,
    userId,
    type: "QUALITY_GRADE_TARGET",
    title: `${targetGrade}-Grade Focus`,
    description: `Achieve a ${targetGrade} grade or higher on your next session. Quality over quantity — minimize pauses and stay focused.`,
    target: targetGrade === "A" ? 85 : 70,
    current: 0,
    unit: "quality score",
    rewardXp: 150,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: `Your average quality score is ${patterns.avgQualityScore}% — targeting ${targetGrade === "A" ? "85" : "70"}% to push your limits`,
  };
}

export function generateBossQuest(
  userId: string,
  _patterns: UserPatterns,
  expiresAt: number,
): PersonalQuest {
  return {
    id: `quest-${Date.now()}-boss`,
    userId,
    type: "BOSS_DAMAGE_DEALT",
    title: "Boss Slayer",
    description:
      "Deal 50+ damage to the active boss in one session. Your streak multiplier is active — this is the time to strike!",
    target: 50,
    current: 0,
    unit: "damage",
    rewardXp: 175,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning:
      "Boss encounter detected — perfect time to challenge yourself with high-damage session",
  };
}

export function generateRivalQuest(
  userId: string,
  patterns: UserPatterns,
  expiresAt: number,
): PersonalQuest {
  const targetMinutes = patterns.avgSessionDuration + 15;
  return {
    id: `quest-${Date.now()}-rival`,
    userId,
    type: "RIVAL_OUTFOCUS",
    title: "Rival Showdown",
    description: `Focus for ${targetMinutes} minutes today to catch up with your rival. You're behind — time to fight back!`,
    target: targetMinutes,
    current: 0,
    unit: "minutes today",
    rewardXp: 160,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: `You're behind your rival — need ${targetMinutes}min focus today to close the gap`,
  };
}

export function generateDefaultQuest(
  userId: string,
  patterns: UserPatterns,
  expiresAt: number,
): PersonalQuest {
  return {
    id: `quest-${Date.now()}-default`,
    userId,
    type: "DURATION_MILESTONE",
    title: "Daily Focus Goal",
    description: `Complete ${patterns.avgSessionDuration} minutes of focused time today. You've got this!`,
    target: patterns.avgSessionDuration,
    current: 0,
    unit: "minutes",
    rewardXp: 100,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: "Daily quest based on your average session duration",
  };
}
