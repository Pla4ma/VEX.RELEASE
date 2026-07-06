import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Text } from '../../components/primitives/Text';
import { Skeleton } from '../../components/ui/Skeleton';
import { BossBattleHUD } from '../../features/boss/components/boss-battle-hud';
import { useActiveBoss, useBossTemplates } from '../../features/boss/hooks';
import { useProgressionSummary } from '../../features/progression/hooks';
import { useStreakMultiplier } from '../../features/streaks/hooks';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { navigateToRootScreen } from '../../navigation/navigation-helpers';
import type { useTheme } from '../../theme';
import { BossScreenSections } from './BossScreenSections';
import type { BossEncounterSummary, BossTemplate } from '../../features/boss/schemas';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;
type BossIntensity = 'subtle' | 'game-like' | 'intense';
type Theme = ReturnType<typeof useTheme>['theme'];

interface BossScreenContentProps {
  bossIntensity: BossIntensity;
  canQueryBoss: boolean;
  navigation: Nav;
  resetLabel: string;
  theme: Theme;
  userId: string | null;
}

export function BossScreenContent({
  bossIntensity,
  canQueryBoss,
  navigation,
  resetLabel,
  theme,
  userId,
}: BossScreenContentProps): React.ReactNode {
  const bossQuery = useActiveBoss(canQueryBoss ? userId : null);
  const templatesQuery = useBossTemplates(canQueryBoss ? userId : null);
  const progressionQuery = useProgressionSummary(userId);
  const streakQuery = useStreakMultiplier(userId);

  if (bossQuery.isPending || (canQueryBoss && templatesQuery.isPending)) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing[5],
            gap: theme.spacing[4],
          }}
        >
          <Skeleton height={320} variant="rounded" />
          <Skeleton height={150} variant="rounded" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const encounter = bossQuery.data;
  const templates = templatesQuery.data ?? [];
  const template = encounter
    ? templates.find((item) => item.id === encounter.bossId)
    : undefined;
  const level =
    (progressionQuery.data as { level?: number } | undefined)?.level ?? 1;
  const levelLocked = Boolean(template && level < template.minLevel);
  const userDamage = encounter
    ? Math.max(0, encounter.maxHealth - encounter.healthRemaining)
    : 0;
  const streakMultiplier =
    (streakQuery.data as { multiplier?: number } | undefined)?.multiplier ?? 1;

  if (!encounter) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      >
        <ScrollView contentContainerStyle={{ padding: theme.spacing[5] }}>
          <Text variant="h3" color={theme.colors.text.primary}>
            {`Next momentum marker opens in ${resetLabel}.`}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing[5],
          gap: theme.spacing[4],
          paddingBottom: theme.spacing[10],
        }}
        showsVerticalScrollIndicator={false}
      >
        <BossBattleHUD />
        <BossScreenSections
          bossIntensity={bossIntensity}
          encounter={encounter as unknown as BossEncounterSummary}
          onLaunchAttack={(minutes) => {
            if (levelLocked) {return;}
            navigateToRootScreen(navigation, 'SessionStack', {
              screen: 'SessionSetup',
              params: {
                presetId:
                  minutes === 15
                    ? 'quick'
                    : minutes === 25
                      ? 'pomodoro'
                      : 'deep',
              },
            })
          }}
          progressionLevel={level}
          streakMultiplier={streakMultiplier}
          template={
            template ?? ({
              id: encounter.bossId,
              name: encounter.bossName,
              tier: 1,
            } as BossTemplate)
          }
          userDamage={userDamage}
          userId={userId ?? ''}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
