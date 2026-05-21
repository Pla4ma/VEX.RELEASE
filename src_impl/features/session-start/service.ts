import { FocusModeCardSchema, SessionSetupNavigationParamsSchema, SessionStartHeroSchema, SessionStartSummarySchema, SessionStakeSchema, type FocusModeCard, type SessionSetupNavigationParams, type SessionStartHero, type SessionStartSummary, type SessionStake } from "./schemas"; import { fetchActiveEncounter, fetchBossTemplate } from "../boss/repository"; import { fetchStreak } from "../streaks/repository"; import { fetchActiveChallengeDetails } from "../challenges/repository"; import { fetchWallet } from "../economy/repository"; export function parseSessionSetupParams(input: unknown): { params: SessionSetupNavigationParams; warningMessage: string | null; } { const result = SessionSetupNavigationParamsSchema.safeParse(input ?? {}); if (result.success) { return { params: result.data, warningMessage: null }; } return { params: {}, warningMessage: "We reset an invalid session setup request so you can start cleanly.", }; } export function buildSessionStartSummary(input: { currentThemeName: string; durationMinutes: number; hasCustomizations: boolean }): SessionStartSummary { const { currentThemeName, durationMinutes, hasCustomizations } = input; return SessionStartSummarySchema.parse({
    ctaLabel: `Start ${durationMinutes} Min Session`,
customizationLabel: hasCustomizations ? "Hide options" : "Tune session",
    subtitle: `${durationMinutes} min focus - ${currentThemeName} theme`,
}); } export function getOfflineSessionStartMessage(isOffline: boolean): string | null { if (!isOffline) { return null; } return "You can still start a session offline. Sync-based rewards and coach data may catch up after reconnect."; } export function shouldOpenCustomizationByDefault(params: SessionSetupNavigationParams): boolean { return params.presetId === "custom"; } export function shouldAutoApplySmartSuggestion(input: { hasSavedDraft: boolean; params: SessionSetupNavigationParams; smartSuggestionPresetId: string | null }): boolean { const { hasSavedDraft, params, smartSuggestionPresetId } = input; if (!smartSuggestionPresetId || hasSavedDraft) { return false; } return !params.presetId && !params.suggestedDurationSeconds; } export function createStarterSessionConfig(input: { durationMinutes: number; category?: string | null }): { duration: number; mode: string; category?: string | null; metadata: Record<string, unknown>; } { const { durationMinutes, category } = input; return { duration: durationMinutes * 60, mode: "STARTER", category: category || null, metadata: { isStarterSession: true, isFromOnboarding: true }, }; } export function buildSessionStartHero(input: { durationMinutes: number; params: SessionSetupNavigationParams; presetName: string; smartSuggestionDescription: string | null }): SessionStartHero { const { durationMinutes, params, presetName, smartSuggestionDescription } = input; if (params.source === "onboarding_first_session") { return SessionStartHeroSchema.parse({ eyebrow: "First Session",
      title: `${durationMinutes} minutes to prove this habit can stick`,
      body: `Start with ${presetName} and get your first clean win on the board.`,
}); } if (params.source === "content-study" || params.source === "learning-execution") { return SessionStartHeroSchema.parse({ eyebrow: params.learningExecutionLabel ?? "Study Sprint", title: "Turn this plan into a focused block now",
      body: `We set up ${durationMinutes} minutes so you can act on the material before momentum fades.`,
}); } if (params.comebackMultiplier && params.comebackMultiplier > 1) { return SessionStartHeroSchema.parse({ eyebrow: "Comeback Session", title: params.comebackMessage ?? "Restart with a session that counts",
      body: `This ${durationMinutes}-minute block is your fastest path back into rhythm.`,
}); } if (smartSuggestionDescription) { return SessionStartHeroSchema.parse({ eyebrow: "Recommended For Today",
      title: `${presetName} is the cleanest start right now`,
body: smartSuggestionDescription, }); } return SessionStartHeroSchema.parse({ eyebrow: "Fast Start",
    title: `${presetName} ready to launch`,
    body: `Start a ${durationMinutes}-minute session now, or open options if you need to tune it first.`,
}); } interface BossDamageEstimate { min: number; max: number; } function calculateBossDamageEstimate(durationSeconds: number, _mode: string, streakDays: number): BossDamageEstimate { const baseDamage = Math.floor(durationSeconds / 60); const streakMultiplier = streakDays >= 7 ? 1.5 : 1.0; const min = Math.floor(baseDamage * 0.8 * streakMultiplier); const max = Math.floor(baseDamage * 1.0 * streakMultiplier * (Math.random() < 0.1 ? 2 : 1)); return { min, max }; } function calculateStreakRisk(streak: { currentDays: number; shieldsAvailable: number; lastQualifyingSessionAt: number | null; timezone: string }): "SAFE" | "AT_RISK" | "CRITICAL" { if (streak.currentDays === 0) { return "SAFE"; } const lastSession = streak.lastQualifyingSessionAt; if (!lastSession) { return "SAFE"; } const now = Date.now(); const deadline = lastSession + 24 * 60 * 60 * 1000; const hoursRemaining = Math.floor((deadline - now) / (1000 * 60 * 60)); if (hoursRemaining <= 0) { return streak.shieldsAvailable > 0 ? "AT_RISK" : "CRITICAL"; } if (hoursRemaining <= 4) { return "CRITICAL"; } if (hoursRemaining <= 12) { return "AT_RISK"; } return "SAFE"; } function calculateHoursRemaining(streak: { lastQualifyingSessionAt: number | null }): number | undefined { if (!streak.lastQualifyingSessionAt) { return undefined; } const deadline = streak.lastQualifyingSessionAt + 24 * 60 * 60 * 1000; const hoursRemaining = Math.floor((deadline - Date.now()) / (1000 * 60 * 60)); return hoursRemaining > 0 ? hoursRemaining : undefined; } function estimateChallengeProgress(challenge: { targetValue: number; currentValue: number }, durationSeconds: number): number { return Math.floor(durationSeconds / 600); } function calculateOfflineLimitations(): string[] { return []; } function calculateWagerOptions( wallet: { coins: number; gems: number } | null, streak: { currentDays: number; shieldsAvailable: number } | null, bossEncounter: { bountyAvailable: boolean } | null, ): Array<{ id: string; cost: number; potentialReward: number; eligible: boolean; reasonIfIneligible?: string; }> { const wagers = []; if (streak && streak.currentDays >= 3) { const eligible = wallet !== null && wallet.coins >= 100; wagers.push({ id: "streak-insurance", cost: 100, potentialReward: streak.currentDays * 10, eligible, reasonIfIneligible: eligible ? undefined : "Not enough coins", }); } if (bossEncounter?.bountyAvailable) { const eligible = wallet !== null && wallet.coins >= 50; wagers.push({ id: "boss-bounty", cost: 50, potentialReward: 100, eligible, reasonIfIneligible: eligible ? undefined : "Not enough coins", }); } return wagers; } export async function buildSessionStake(userId: string, durationSeconds: number, mode: string, selectedLoadout?: string[]): Promise<SessionStake> { const [bossEncounter, streak, challenges, wallet] = await Promise.all([fetchActiveEncounter(userId).catch(() => null), fetchStreak(userId).catch(() => null), fetchActiveChallengeDetails(userId).catch(() => []), fetchWallet(userId).catch(() => null)]); const bossDamage = bossEncounter ? calculateBossDamageEstimate(durationSeconds, mode, streak?.currentDays ?? 0) : null; const bossTemplate = bossEncounter ? await fetchBossTemplate(bossEncounter.bossId).catch(() => null) : null; const rivalGap = bossEncounter ? { gap: 0, trend: "stable" as const } : null; const stake = { userId, selectedDurationSeconds: durationSeconds, selectedMode: mode as "LIGHT_FOCUS" | "DEEP_WORK" | "SPRINT" | "CREATIVE" | "STUDY", selectedLoadout, boss: bossEncounter && bossDamage ? { encounterId: bossEncounter.id, name: bossTemplate?.name ?? "The Procrastinator", healthRemaining: bossEncounter.healthRemaining, maxHealth: bossEncounter.maxHealth, estimatedDamageMin: bossDamage.min, estimatedDamageMax: bossDamage.max, isFinalStrike: bossDamage.max >= bossEncounter.healthRemaining, bountyAvailable: bossEncounter.status === "ACTIVE", bountyCost: 50, } : undefined, streak: { currentDays: streak?.currentDays ?? 0, status: streak ? calculateStreakRisk(streak) : "SAFE", hoursRemaining: streak ? calculateHoursRemaining(streak) : undefined, insuranceAvailable: (streak?.shieldsAvailable ?? 0) > 0, insuranceCost: 100, }, challenges: challenges.map((c) => ({ id: c.challenge.id, title: c.challenge.title, progressBefore: c.userChallenge.currentValue ?? 0, progressAfter: Math.min( c.challenge.targetValue, (c.userChallenge.currentValue ?? 0) + estimateChallengeProgress( { targetValue: c.challenge.targetValue, currentValue: c.userChallenge.currentValue ?? 0, }, durationSeconds, ), ), willComplete: (c.userChallenge.currentValue ?? 0) + estimateChallengeProgress( { targetValue: c.challenge.targetValue, currentValue: c.userChallenge.currentValue ?? 0, }, durationSeconds, ) >= c.challenge.targetValue,
      reward: `${c.xpReward} XP`,
})), rival: undefined, wallet: wallet ?? { coins: 0, gems: 0 }, wagers: calculateWagerOptions(wallet, streak, bossEncounter ? { bountyAvailable: bossEncounter.status === "ACTIVE" } : null), offlineLimitations: calculateOfflineLimitations(), }; return SessionStakeSchema.parse(stake); }

export function buildFocusModeCards(input: { streakDays: number }): FocusModeCard[] {
  const streakCopy = input.streakDays > 0
    ? `Protect day ${input.streakDays} without opening the whole dashboard.`
    : 'Create the first real proof point before the app asks for more.';
  return [
    {
      accessibilityHint: 'Opens setup with a short sprint preset',
      accessibilityLabel: 'Start 15 minute sprint session',
      body: 'Fastest path to a real completion and a tomorrow promise.',
      ctaLabel: 'Start sprint',
      durationSeconds: 15 * 60,
      id: 'sprint-15',
      mode: 'SPRINT',
      title: 'Sprint',
    },
    {
      accessibilityHint: 'Opens setup with a standard focus preset',
      accessibilityLabel: 'Start 25 minute light focus session',
      body: streakCopy,
      ctaLabel: 'Protect streak',
      durationSeconds: 25 * 60,
      id: 'light-focus-25',
      mode: 'LIGHT_FOCUS',
      title: 'Light Focus',
    },
    {
      accessibilityHint: 'Opens setup with a study preset',
      accessibilityLabel: 'Start 25 minute study session',
      body: 'Use when the work has material, notes, or review attached.',
      ctaLabel: 'Start study',
      durationSeconds: 25 * 60,
      id: 'study-25',
      mode: 'STUDY',
      title: 'Study',
    },
    {
      accessibilityHint: 'Opens setup with a recovery preset',
      accessibilityLabel: 'Start 10 minute recovery session',
      body: 'For messy days: count something truthful instead of disappearing.',
      ctaLabel: 'Recover today',
      durationSeconds: 10 * 60,
      id: 'recovery-10',
      mode: 'RECOVERY',
      title: 'Recovery',
    },
  ].map((card) => FocusModeCardSchema.parse(card));
}
