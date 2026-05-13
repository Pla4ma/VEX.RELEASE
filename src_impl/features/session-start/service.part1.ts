import { SessionSetupNavigationParamsSchema, SessionStartHeroSchema, SessionStartSummarySchema, SessionStakeSchema, type SessionSetupNavigationParams, type SessionStartHero, type SessionStartSummary, type SessionStake } from "./schemas";
import { fetchActiveEncounter, fetchBossTemplate } from "../boss/repository";
import { fetchStreak } from "../streaks/repository";
import { fetchActiveChallengeDetails } from "../challenges/repository";
import { fetchWallet } from "../economy/repository";


export function parseSessionSetupParams(input: DynamicValue): {
  params: SessionSetupNavigationParams;
  warningMessage: string | null;
} {
  const result = SessionSetupNavigationParamsSchema.safeParse(input ?? {});

  if (result.success) {
    return {
      params: result.data,
      warningMessage: null,
    };
  }

  return {
    params: {},
    warningMessage: 'We reset an invalid session setup request so you can start cleanly.',
  };
}

export function buildSessionStartSummary(input: { currentThemeName: string; durationMinutes: number; hasCustomizations: boolean }): SessionStartSummary {
  const { currentThemeName, durationMinutes, hasCustomizations } = input;

  return SessionStartSummarySchema.parse({
    ctaLabel: `Start ${durationMinutes} Min Session`,
    customizationLabel: hasCustomizations ? 'Hide options' : 'Tune session',
    subtitle: `${durationMinutes} min focus - ${currentThemeName} theme`,
  });
}

export function getOfflineSessionStartMessage(isOffline: boolean): string | null {
  if (!isOffline) {
    return null;
  }

  return 'You can still start a session offline. Sync-based rewards and coach data may catch up after reconnect.';
}

export function shouldOpenCustomizationByDefault(params: SessionSetupNavigationParams): boolean {
  return params.presetId === 'custom';
}

export function shouldAutoApplySmartSuggestion(input: { hasSavedDraft: boolean; params: SessionSetupNavigationParams; smartSuggestionPresetId: string | null }): boolean {
  const { hasSavedDraft, params, smartSuggestionPresetId } = input;

  if (!smartSuggestionPresetId || hasSavedDraft) {
    return false;
  }

  return !params.presetId && !params.suggestedDurationSeconds;
}

export function createStarterSessionConfig(input: { durationMinutes: number; category?: string | null }): {
  duration: number;
  mode: string;
  category?: string | null;
  metadata: Record<string, unknown>;
} {
  const { durationMinutes, category } = input;

  return {
    duration: durationMinutes * 60, // Convert to seconds
    mode: 'STARTER',
    category: category || null,
    metadata: {
      isStarterSession: true,
      isFromOnboarding: true,
    },
  };
}

export function buildSessionStartHero(input: { durationMinutes: number; params: SessionSetupNavigationParams; presetName: string; smartSuggestionDescription: string | null }): SessionStartHero {
  const { durationMinutes, params, presetName, smartSuggestionDescription } = input;

  if (params.source === 'onboarding_first_session') {
    return SessionStartHeroSchema.parse({
      eyebrow: 'First Session',
      title: `${durationMinutes} minutes to prove this habit can stick`,
      body: `Start with ${presetName} and get your first clean win on the board.`,
    });
  }

  if (params.source === 'content-study') {
    return SessionStartHeroSchema.parse({
      eyebrow: 'Study Sprint',
      title: 'Turn this plan into a focused block now',
      body: `We set up ${durationMinutes} minutes so you can act on the material before momentum fades.`,
    });
  }

  if (params.comebackMultiplier && params.comebackMultiplier > 1) {
    return SessionStartHeroSchema.parse({
      eyebrow: 'Comeback Session',
      title: params.comebackMessage ?? 'Restart with a session that counts',
      body: `This ${durationMinutes}-minute block is your fastest path back into rhythm.`,
    });
  }

  if (smartSuggestionDescription) {
    return SessionStartHeroSchema.parse({
      eyebrow: 'Recommended For Today',
      title: `${presetName} is the cleanest start right now`,
      body: smartSuggestionDescription,
    });
  }

  return SessionStartHeroSchema.parse({
    eyebrow: 'Fast Start',
    title: `${presetName} ready to launch`,
    body: `Start a ${durationMinutes}-minute session now, or open options if you need to tune it first.`,
  });
}

export async function buildSessionStake(userId: string, durationSeconds: number, mode: string, selectedLoadout?: string[]): Promise<SessionStake> {
  // Parallel data fetch
  const [bossEncounter, streak, challenges, wallet] = await Promise.all([fetchActiveEncounter(userId).catch(() => null), fetchStreak(userId).catch(() => null), fetchActiveChallengeDetails(userId).catch(() => []), fetchWallet(userId).catch(() => null)]);

  // Calculate boss damage estimate
  const bossDamage = bossEncounter ? calculateBossDamageEstimate(durationSeconds, mode, streak?.currentDays ?? 0) : null;

  // Fetch boss template for name if needed
  const bossTemplate = bossEncounter ? await fetchBossTemplate(bossEncounter.bossId).catch(() => null) : null;

  // Rival gap calculation - implemented when rivals repository is available
  const rivalGap = bossEncounter ? {
    gap: 0, // Placeholder - calculate actual rival performance gap
    trend: 'stable' as const,
  } : null;

  // Build stake
  const stake = {
    userId,
    selectedDurationSeconds: durationSeconds,
    selectedMode: mode as 'LIGHT_FOCUS' | 'DEEP_WORK' | 'SPRINT' | 'CREATIVE' | 'STUDY',
    selectedLoadout,

    boss:
      bossEncounter && bossDamage
        ? {
            encounterId: bossEncounter.id,
            name: bossTemplate?.name ?? 'The Procrastinator',
            healthRemaining: bossEncounter.healthRemaining,
            maxHealth: bossEncounter.maxHealth,
            estimatedDamageMin: bossDamage.min,
            estimatedDamageMax: bossDamage.max,
            isFinalStrike: bossDamage.max >= bossEncounter.healthRemaining,
            bountyAvailable: bossEncounter.status === 'ACTIVE',
            bountyCost: 50,
          }
        : undefined,

    streak: {
      currentDays: streak?.currentDays ?? 0,
      status: streak ? calculateStreakRisk(streak) : 'SAFE',
      hoursRemaining: streak ? calculateHoursRemaining(streak) : undefined,
      insuranceAvailable: (streak?.shieldsAvailable ?? 0) > 0,
      insuranceCost: 100,
    },

    challenges: challenges.map((c: DynamicValue) => ({
      id: c.challenge.id,
      title: c.challenge.title,
      progressBefore: c.userChallenge.currentValue ?? 0,
      progressAfter: Math.min(
        c.challenge.targetValue,
        (c.userChallenge.currentValue ?? 0) +
          estimateChallengeProgress(
            {
              targetValue: c.challenge.targetValue,
              currentValue: c.userChallenge.currentValue ?? 0,
            },
            durationSeconds,
          ),
      ),
      willComplete:
        (c.userChallenge.currentValue ?? 0) +
          estimateChallengeProgress(
            {
              targetValue: c.challenge.targetValue,
              currentValue: c.userChallenge.currentValue ?? 0,
            },
            durationSeconds,
          ) >=
        c.challenge.targetValue,
      reward: `${c.xpReward} XP`,
    })),

    rival: undefined, // Rival data will be populated when rivals repository is integrated

    wallet: wallet ?? { coins: 0, gems: 0 },
    wagers: calculateWagerOptions(wallet, streak, bossEncounter ? { bountyAvailable: bossEncounter.status === 'ACTIVE' } : null),
    offlineLimitations: calculateOfflineLimitations(),
  };

  return SessionStakeSchema.parse(stake);
}