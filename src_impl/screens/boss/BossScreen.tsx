/**
 * BossScreen — Progressive unlock & product intensity.
 *
 * Queries only run when FeatureAvailability allows.
 * Intensity adapts to user motivation style.
 * Squad content hidden unless squads are explicitly enabled.
 * Boss damage maps directly to focus/study sessions — no economy/shop dependency.
 */
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { LockedFeatureScreen } from '../../components/LockedFeatureScreen';
import { useFeatureAccess, getFeatureAvailability, isFeatureAvailableForNavigation } from '../../features/liveops-config';
import { useOnboardingStore } from '../../features/onboarding/store';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { BossScreenContent } from './BossScreenContent';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

type BossIntensity = 'subtle' | 'game-like' | 'intense';

const nextResetLabel = (): string => {
  const now = new Date();
  const day = now.getUTCDay();
  const days = (8 - day) % 7 || 7;
  const diff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days, 0, 0, 0) - Date.now();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  return `${d}d ${h}h`;
};

function resolveBossIntensity(motivationStyle: string | null): BossIntensity {
  switch (motivationStyle) {
    case 'game_like':
    case 'competitive':
      return 'game-like';
    case 'intense':
      return 'intense';
    default:
      return 'subtle';
  }
}

function getSubtleCopy(intensity: BossIntensity): { title: string; description: string } {
  if (intensity === 'subtle') {
    return {
      title: 'Focus Momentum',
      description: 'Each session you complete adds to your momentum. A quiet marker tracks the focus you have already earned.',
    };
  }
  if (intensity === 'game-like') {
    return {
      title: 'Boss Battle',
      description: 'Your focus sessions push the creature back, one block at a time. Every minute focused counts as damage.',
    };
  }
  return {
    title: 'Boss Battle — Full Assault',
    description: 'Every session hits harder. Longer sessions deal critical damage. Your streak multiplies everything. Press the attack.',
  };
}

const BossFallback: React.FC<{
  intensity: BossIntensity;
  onStartSession: () => void;
  unlockReason: string;
  stage: string;
  resetLabel: string;
}> = ({ intensity, onStartSession, unlockReason, stage, resetLabel }) => {
  const { theme } = useTheme();
  const copy = getSubtleCopy(intensity);
  return (
    <LockedFeatureScreen
      ctaLabel="Start a focus session"
      description={copy.description}
      feature="boss_tab"
      icon={intensity === 'subtle' ? '📊' : '🐉'}
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
  const explicitStyle = useOnboardingStore((state) => state.explicitMotivationStyle);

  const bossAvailability = getFeatureAvailability(disclosure.features.boss_tab);
  const squadsAvailability = getFeatureAvailability(disclosure.features.squads);
  const canQueryBoss = bossAvailability.canQuery && bossAvailability.canUseBackend;
  const canNavigateBoss = isFeatureAvailableForNavigation(bossAvailability);
  const canShowSquads = squadsAvailability.canRenderEntryPoint && squadsAvailability.canQuery;
  const bossIntensity = resolveBossIntensity(explicitStyle);

  const [resetLabel, setResetLabel] = useState(nextResetLabel());

  useEffect(() => {
    const id = setInterval(() => setResetLabel(nextResetLabel()), 60000);
    return () => clearInterval(id);
  }, []);

  // === GATE: Locked or degraded — show fallback before any queries ===
  if (!canNavigateBoss || disclosure.features.boss_tab.releaseState === 'disabled_beta') {
    return (
      <BossFallback
        intensity={bossIntensity}
        onStartSession={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })}
        unlockReason={disclosure.features.boss_tab.unlockReason}
        stage={disclosure.stage}
        resetLabel={resetLabel}
      />
    );
  }

  // === Only call queries when canQueryBoss is true ===
  return (
    <BossScreenContent
      canQueryBoss={canQueryBoss}
      canShowSquads={canShowSquads}
      bossIntensity={bossIntensity}
      userId={userId}
      navigation={navigation}
      resetLabel={resetLabel}
      theme={theme}
    />
  );
};

export default withScreenErrorBoundary(BossScreen, 'Boss');
