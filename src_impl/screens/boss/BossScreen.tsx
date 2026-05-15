import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { LockedFeatureScreen } from '../../components/LockedFeatureScreen';
import { Button, Text } from '../../components/primitives';
import { Skeleton } from '../../components/ui/Skeleton';
import { BossBattleHUD } from '../../features/boss/components/boss-battle-hud';
import { useActiveBoss, useBossTemplates } from '../../features/boss/hooks';
import { useFeatureAccess } from '../../features/liveops-config';
import { useProgressionSummary } from '../../features/progression/hooks';
import { useStreakMultiplier } from '../../features/streaks/hooks';
import { useUserSquads } from '../../features/squads/hooks';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { BossScreenSections } from './BossScreenSections';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

const nextResetLabel = () => {
  const now = new Date();
  const day = now.getUTCDay();
  const days = (8 - day) % 7 || 7;
  const diff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days, 0, 0, 0) - Date.now();
  const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24;
  return `${d}d ${h}h`;
};

export const BossScreen = (): JSX.Element => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const disclosure = useFeatureAccess();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [resetLabel, setResetLabel] = useState(nextResetLabel());
  const bossQuery = useActiveBoss(userId);
  const templatesQuery = useBossTemplates();
  const squadsQuery = useUserSquads(userId ?? undefined);
  const progressionQuery = useProgressionSummary(userId);
  const streakQuery = useStreakMultiplier(userId);

  useEffect(() => {
    const id = setInterval(() => setResetLabel(nextResetLabel()), 60000);
    return () => clearInterval(id);
  }, []);

  if (!disclosure.features.boss_tab.isUnlocked) {
    return (
      <LockedFeatureScreen
        ctaLabel="Finish another session"
        description="Boss battles arrive once you have enough momentum for every session to feel like an attack, not a tutorial."
        feature="boss_tab"
        icon="🐉"
        onPress={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })}
        progressLabel={disclosure.features.boss_tab.recommendedUnlockMoment}
        stage={disclosure.stage}
        title="Boss Battles"
        unlockLabel={disclosure.features.boss_tab.unlockReason}
        whyItMatters="Boss battles turn your focus into a personal-plus-community challenge, so even low participation still feels meaningful."
      />
    );
  }

  if (bossQuery.isPending || templatesQuery.isPending) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}><ScrollView contentContainerStyle={{ padding: theme.spacing[5], gap: theme.spacing[4] }}><Skeleton height={320} variant="rounded" /><Skeleton height={150} variant="rounded" /></ScrollView></SafeAreaView>;
  }

  const encounter = bossQuery.data;
  const template = templatesQuery.data?.find((item) => item.id === encounter?.bossId);
  const activeSquad = squadsQuery.data?.[0];
  const levelLocked = Boolean(template && progressionQuery.data && progressionQuery.data.level < template.minLevel);
  const userDamage = encounter ? Math.max(0, encounter.maxHealth - encounter.healthRemaining) : 0;
  const streakMultiplier = streakQuery.data?.multiplier ?? 1;
  const progressionLevel = progressionQuery.data?.level ?? 1;

  if (!encounter) {
    return (
      <LockedFeatureScreen
        ctaLabel="Start a focus session"
        description="No active boss is live right now, but your next session can still prep your streak and squad for the next portal."
        feature="boss_tab"
        icon="🐉"
        onPress={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })}
        progressLabel={resetLabel}
        stage={disclosure.stage}
        title="Next Boss Window"
        unlockLabel={`Next portal opens in ${resetLabel}.`}
        whyItMatters="Bosses are framed as a hybrid challenge: your own sessions matter, and every bit of community participation makes the shared health bar move faster."
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing[5], gap: theme.spacing[4], paddingBottom: theme.spacing[10] }} showsVerticalScrollIndicator={false}>
        <BossBattleHUD encounter={encounter} bossTemplate={template} tierLabel={template?.tier ? `Tier ${template.tier}` : 'Weekly Boss'} isLocked={levelLocked} lockReason={template ? `Reach Level ${template.minLevel} to attack at full power.` : undefined} />
        <BossScreenSections
          encounter={encounter}
          template={template}
          activeSquad={activeSquad}
          progressionLevel={progressionLevel}
          streakMultiplier={streakMultiplier}
          userDamage={userDamage}
          userId={userId ?? ''}
          onLaunchAttack={(minutes) => {
            if (levelLocked) {return;}
            navigation.navigate('SessionStack', {
              screen: 'SessionSetup',
              params: {
                presetId: minutes === 15 ? 'quick' : minutes === 25 ? 'pomodoro' : 'deep',
                warContext: activeSquad ? { squadWarId: encounter.id, squadId: activeSquad.id } : null,
              },
            });
          }}
          onOpenSquad={() => navigation.navigate('Guild', activeSquad ? { guildId: activeSquad.id } : {})}
        />
        <View style={{ backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius['2xl'], padding: theme.spacing[5], gap: theme.spacing[3] }}>
          <Text variant="h4" color={theme.colors.text.primary}>{activeSquad ? 'Squad Momentum' : 'Make it bigger with a squad'}</Text>
          <Text variant="bodySmall" color={theme.colors.text.secondary}>{activeSquad ? `${activeSquad.name} has ${activeSquad.memberCount} members. Low contributor counts are still meaningful because each session can visibly move the boss bar.` : 'Joining a squad turns every session into shared pressure, shared progress, and a reason to come back before the weekly reset.'}</Text>
          <Button variant="outline" onPress={() => navigation.navigate('Guild', activeSquad ? { guildId: activeSquad.id } : {})}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">{activeSquad ? 'Open squad' : 'Find a squad'}</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default withScreenErrorBoundary(BossScreen, 'Boss');
