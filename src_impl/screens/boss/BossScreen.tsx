/**
 * BossScreen — Progressive unlock & product intensity.
 *
 * Queries only run when FeatureAvailability allows.
 * Intensity comes from the canonical VexExperience — no duplicate resolution.
 * Squad content removed for public v1.
 * Boss damage maps directly to focus/study sessions — no economy/shop dependency.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { LockedFeatureScreen } from '../../components/LockedFeatureScreen';
import {
  useFeatureAccess, getFeatureAvailability, isFeatureAvailableForNavigation,
} from '../../features/liveops-config';
import { getDegradedFeatures } from '../../features/liveops-config/feature-access-store';
import { useResolvedVexExperienceRuntime } from '../../features/personalization';
import { useStreakSummary } from '../../features/streaks/hooks';
import { trackBossRouteOpened } from '../../features/boss/analytics';
import {
  useBossEngagementSignals,
  type BossEngagementInputs,
} from '../../features/boss/boss-engagement-signals';
import { useBossEngagementSummary } from '../../features/boss/hooks/useBossEngagementSummary';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { BossScreenContent } from './BossScreenContent';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

const nextResetLabel = (): string => {
  const now = new Date();
  const day = now.getUTCDay();
  const days = (8 - day) % 7 || 7;
  const diff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days, 0, 0, 0) - Date.now();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  return `${d}d ${h}h`;
};

const BOSS_COPY: Record<string, { title: string; description: string }> = {
  subtle: {
    title: 'Focus Momentum',
    description: 'Each session you complete adds to your momentum. A quiet marker tracks the focus you have already earned.',
  },
  'game-like': {
    title: 'Boss Battle',
    description: 'Your focus sessions push the creature back, one block at a time. Every minute focused counts as damage.',
  },
  intense: {
    title: 'Boss Battle — Full Assault',
    description: 'Every session hits harder. Longer sessions deal critical damage. Your streak multiplies everything. Press the attack.',
  },
};

function getBossCopy(bossIntensity: string): { title: string; description: string } {
  return BOSS_COPY[bossIntensity] ?? BOSS_COPY.subtle!;
}

type BossIntensity = 'subtle' | 'game-like' | 'intense';

function toScreenIntensity(intensity: string): BossIntensity {
  if (intensity === 'game-like' || intensity === 'intense' || intensity === 'subtle') return intensity;
  return 'subtle';
}

const BossFallback: React.FC<{
  intensity: string;
  onStartSession: () => void;
  unlockReason: string;
  stage: string;
  resetLabel: string;
}> = ({ intensity, onStartSession, unlockReason, stage, resetLabel }) => {
  const { theme } = useTheme();
  const copy = getBossCopy(intensity);
  const isSubtle = intensity === 'subtle';
  return (
    <LockedFeatureScreen
      ctaLabel="Start a focus session"
      description={copy.description}
      feature="boss_tab"
      icon={isSubtle ? '\u{1F4CA}' : '\u{1F409}'}
      onPress={onStartSession}
      progressLabel={resetLabel}
      stage={stage as 'NEW_USER' | 'ACTIVATING' | 'ENGAGED' | 'POWER_USER'}
      title={copy.title}
      unlockLabel={unlockReason}
      whyItMatters="Boss progress moves only when you complete focus sessions. No shop items, no premium boosts — just real focus time."
    />
  );
};

export const BossScreen = (): JSX.Element => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const disclosure = useFeatureAccess();
  const userId = useAuthStore((state) => state.user?.id ?? null);

  const streakQuery = useStreakSummary(userId);
  const completionStreak = (streakQuery.data as { currentStreak?: number } | undefined)?.currentStreak ?? 0;
  const degradedFeatures = getDegradedFeatures();
  const bossIgnored = degradedFeatures.has('boss_tab');

  const bossEngagementSummary = useBossEngagementSummary(userId);

  const bossEngagementInputs: BossEngagementInputs = {
    bossIgnored,
    bossUnlocked: disclosure.features.boss_tab.isUnlocked,
    canQueryBoss: false,
    bossRouteOpenedCount: bossEngagementSummary.bossRouteOpenedCount,
    bossCTAClickedCount: bossEngagementSummary.bossCTAClickedCount,
    bossDamageEventsCount: bossEngagementSummary.bossDamageEventsCount,
    recentSessionsWithBossProgress: bossEngagementSummary.recentSessionsWithBossProgress,
  };

  const bossEngagement = useBossEngagementSignals(bossEngagementInputs);

  const resolved = useResolvedVexExperienceRuntime({
    behaviorStats: {
      abandonedSessionDurations: [],
      bossChallengeEngagement: bossEngagement,
      coachInteractions: 0,
      comebackSessions: 0,
      completedSessionDurations: [],
      completionStreak,
      ignoredFeatures: bossIgnored ? ['boss_tab'] : [],
      mostSuccessfulTimeOfDay: null,
      preferredSessionMode: null,
      premiumFeatureAttempts: [],
      studyUsageRatio: 0,
      totalCompletedSessions: disclosure.inputs.totalCompletedSessions,
    },
    featureAvailability: {
      boss: disclosure.features.boss_tab.isUnlocked,
      challenges: disclosure.features.challenges.isUnlocked,
      premium: disclosure.features.premium_paywall.isUnlocked,
      study: disclosure.features.content_study.isUnlocked,
    },
  });

  const bossIntensity = resolved.bossIntensity;

  const bossAvailability = getFeatureAvailability(disclosure.features.boss_tab);
  const canQueryBoss = bossAvailability.canQuery && bossAvailability.canUseBackend;
  const canNavigateBoss = isFeatureAvailableForNavigation(bossAvailability);

  const [resetLabel, setResetLabel] = useState(nextResetLabel());

  useEffect(() => {
    const id = setInterval(() => setResetLabel(nextResetLabel()), 60000);
    return () => clearInterval(id);
  }, []);

  const trackedOpenRef = useRef(false);

  useEffect(() => {
    if (!userId) return;
    if (trackedOpenRef.current) return;
    trackedOpenRef.current = true;
    trackBossRouteOpened(userId, bossIntensity, canQueryBoss);
  }, [userId, bossIntensity, canQueryBoss]);

  if (!canNavigateBoss || disclosure.features.boss_tab.releaseState === 'disabled_beta') {
    return (
      <BossFallback
        intensity={toScreenIntensity(bossIntensity)}
        onStartSession={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })}
        unlockReason={disclosure.features.boss_tab.unlockReason}
        stage={disclosure.stage}
        resetLabel={resetLabel}
      />
    );
  }

  return (
    <BossScreenContent
      canQueryBoss={canQueryBoss}
      bossIntensity={toScreenIntensity(bossIntensity)}
      userId={userId}
      navigation={navigation}
      resetLabel={resetLabel}
      theme={theme}
    />
  );
};

export default withScreenErrorBoundary(BossScreen, 'Boss');
