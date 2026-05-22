import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Text } from '../../components/primitives';
import { Skeleton } from '../../components/ui/Skeleton';
import { BossBattleHUD } from '../../features/boss/components/boss-battle-hud';
import { useActiveBoss, useBossTemplates } from '../../features/boss/hooks';
import { useProgressionSummary } from '../../features/progression/hooks';
import { useStreakMultiplier } from '../../features/streaks/hooks';
import { useUserSquads } from '../../features/squads/hooks';
import type { ExtendedRootStackParams } from '../../navigation/types';
import type { useTheme } from '../../theme';
import { BossScreenSections } from './BossScreenSections';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;
type BossIntensity = 'subtle' | 'game-like' | 'intense';
type Theme = ReturnType<typeof useTheme>['theme'];

interface BossScreenContentProps {
  bossIntensity: BossIntensity;
  canQueryBoss: boolean;
  canShowSquads: boolean;
  navigation: Nav;
  resetLabel: string;
  theme: Theme;
  userId: string | null;
}

type ActiveSquad = {
  avatarUrl: string | null;
  focusMultiplier: number;
  id: string;
  isMember: boolean;
  isPublic: boolean;
  maxMembers: number;
  memberCount: number;
  name: string;
  synergyLevel: number;
  userRole: 'FOUNDER' | 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST' | null;
};

export function BossScreenContent({
  bossIntensity,
  canQueryBoss,
  canShowSquads,
  navigation,
  resetLabel,
  theme,
  userId,
}: BossScreenContentProps): JSX.Element {
  const bossQuery = useActiveBoss(canQueryBoss ? userId : null);
  const templatesQuery = useBossTemplates();
  const progressionQuery = useProgressionSummary(userId);
  const streakQuery = useStreakMultiplier(userId);
  const squadsQuery = useUserSquads(
    canShowSquads ? (userId ?? undefined) : undefined,
    { enabled: canShowSquads, staleTime: 1000 * 60 * 5 },
  );

  if (bossQuery.isPending || templatesQuery.isPending) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing[5], gap: theme.spacing[4] }}>
          <Skeleton height={320} variant="rounded" />
          <Skeleton height={150} variant="rounded" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const encounter = bossQuery.data;
  const template = templatesQuery.data?.find((item: { id: string }) => item.id === encounter?.bossId);
  const level = (progressionQuery.data as { level?: number } | undefined)?.level ?? 1;
  const levelLocked = Boolean(template && progressionQuery.data && level < (template as { minLevel: number }).minLevel);
  const userDamage = encounter ? Math.max(0, encounter.maxHealth - encounter.healthRemaining) : 0;
  const streakMultiplier = (streakQuery.data as { multiplier?: number } | undefined)?.multiplier ?? 1;

  if (!encounter) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing[5] }}>
          <Text variant="h3" color={theme.colors.text.primary}>
            {`Next momentum marker opens in ${resetLabel}.`}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const activeSquad = canShowSquads
    ? (squadsQuery.data as unknown as ActiveSquad[] | undefined)?.[0]
    : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing[5], gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
        showsVerticalScrollIndicator={false}
      >
        <BossBattleHUD
          encounter={encounter}
          bossTemplate={template}
          tierLabel={template?.tier !== undefined ? `Tier ${template.tier}` : 'Weekly Boss'}
          isLocked={levelLocked}
          lockReason={template ? `Reach Level ${template.minLevel} to attack at full power.` : undefined}
        />
        <BossScreenSections
          activeSquad={activeSquad}
          bossIntensity={bossIntensity}
          encounter={encounter}
          onLaunchAttack={(minutes) => {
            if (levelLocked) return;
            navigation.navigate('SessionStack', {
              screen: 'SessionSetup',
              params: { presetId: minutes === 15 ? 'quick' : minutes === 25 ? 'pomodoro' : 'deep' },
            });
          }}
          onOpenSquad={() => {
            if (!canShowSquads) return;
            navigation.navigate('Guild', activeSquad ? { guildId: activeSquad.id } : {});
          }}
          progressionLevel={level}
          streakMultiplier={streakMultiplier}
          template={template}
          userDamage={userDamage}
          userId={userId ?? ''}
        />
        {canShowSquads ? (
          <View style={{ backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius['2xl'], padding: theme.spacing[5], gap: theme.spacing[3] }}>
            <Text variant="h4" color={theme.colors.text.primary}>{activeSquad ? 'Squad Momentum' : 'Make it bigger with a squad'}</Text>
            <Text variant="bodySmall" color={theme.colors.text.secondary}>
              {activeSquad ? `${activeSquad.name} has ${activeSquad.memberCount} members.` : 'Joining a squad turns every session into shared progress.'}
            </Text>
            <Button
              variant="outline"
              onPress={() => navigation.navigate('Guild', activeSquad ? { guildId: activeSquad.id } : {})}
              accessibilityLabel="Open squad"
              accessibilityRole="button"
              accessibilityHint="Opens squad progress when squads are available."
            >
              {activeSquad ? 'Open squad' : 'Find a squad'}
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
