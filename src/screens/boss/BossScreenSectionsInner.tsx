import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../components/primitives';
import { trackBossCTAClicked } from '../../features/boss/analytics';
import { useSessionHistory } from '../../session/hooks/useSession';
import { useTheme } from '../../theme';
import {
  ATTACK_PRESETS,
  estimateDamage,
  formatDuration,
  getBossScreenCopy,
  type BossScreenSectionsProps,
} from './boss-screen-utils';

function cardStyle(theme: ReturnType<typeof useTheme>['theme']) {
  return {
    backgroundColor: theme.colors.background.secondary,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius['2xl'],
    borderWidth: 1,
    gap: theme.spacing[3],
    padding: theme.spacing[5],
  };
}

export function BossScreenSections({
  bossIntensity = 'subtle',
  onLaunchAttack,
  streakMultiplier,
  userDamage,
  userId,
}: BossScreenSectionsProps): JSX.Element {
  const { theme } = useTheme();
  const historyQuery = useSessionHistory(userId, 5);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const copy = getBossScreenCopy(bossIntensity);

  const handleLaunchAttack = useCallback(
    (minutes: number) => {
      trackBossCTAClicked(userId, minutes, bossIntensity);
      onLaunchAttack(minutes);
    },
    [onLaunchAttack, userId, bossIntensity],
  );

  const recentSessions = useMemo(
    () =>
      historyQuery.history
        .filter((entry) => entry.endedAt && entry.startedAt)
        .slice(0, 3)
        .map((entry) => ({
          duration: Math.max(0, (entry.endedAt ?? 0) - entry.startedAt),
          endedAt: entry.endedAt ?? entry.startedAt,
          quality:
            entry.summary?.focusPurityScore ??
            entry.summary?.focusQuality ??
            75,
        })),
    [historyQuery.history],
  );

  return (
    <>
      <View style={cardStyle(theme)}>
        <Text variant="h4" color={theme.colors.text.primary}>
          {copy.title}
        </Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          {copy.intro}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text variant="caption" color={theme.colors.text.secondary}>
              {copy.metricLabel}
            </Text>
            <Text variant="h3" color={theme.colors.text.primary}>
              {userDamage.toLocaleString()}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="caption" color={theme.colors.text.secondary}>
              Focus multiplier
            </Text>
            <Text
              variant="h3"
              color={theme.colors.primary[500]}
            >{`x${streakMultiplier.toFixed(2)}`}</Text>
          </View>
        </View>
      </View>

      <View style={cardStyle(theme)}>
        <Text variant="h4" color={theme.colors.text.primary}>
          {copy.historyTitle}
        </Text>
        {historyQuery.isLoading ? (
          <Text variant="bodySmall" color={theme.colors.text.secondary}>
            Loading recent sessions...
          </Text>
        ) : null}
        {historyQuery.error ? (
          <Text variant="bodySmall" color={theme.colors.error.DEFAULT}>
            Recent session proof is unavailable right now.
          </Text>
        ) : null}
        {!historyQuery.isLoading &&
        !historyQuery.error &&
        recentSessions.length === 0 ? (
          <Text variant="bodySmall" color={theme.colors.text.secondary}>
            Complete a focus session to move this forward.
          </Text>
        ) : null}
        {recentSessions.map((entry) => (
          <View
            key={`${entry.endedAt}-${entry.duration}`}
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text variant="body" color={theme.colors.text.primary}>
              {formatDuration(entry.duration)}
            </Text>
            <Text
              variant="bodySmall"
              color={theme.colors.text.secondary}
            >{`Purity ${entry.quality}`}</Text>
          </View>
        ))}
      </View>

      <View style={cardStyle(theme)}>
        <Text variant="h4" color={theme.colors.text.primary}>
          {copy.actionLabel}
        </Text>
        {ATTACK_PRESETS.map((preset) => {
          const selected = preset.minutes === selectedMinutes;
          return (
            <Pressable
              key={preset.minutes}
              onPress={() =>
                selected
                  ? handleLaunchAttack(preset.minutes)
                  : setSelectedMinutes(preset.minutes)
              }
              accessibilityLabel={preset.label}
              accessibilityRole="button"
              accessibilityHint="Starts a focus session with this duration."
              style={{
                backgroundColor: selected
                  ? theme.colors.primary[500]
                  : theme.colors.background.primary,
                borderRadius: theme.borderRadius.xl,
                minHeight: 44,
                padding: theme.spacing[4],
              }}
            >
              <Text
                variant="body"
                color={
                  selected
                    ? theme.colors.text.inverse
                    : theme.colors.text.primary
                }
              >
                {preset.label}
              </Text>
              <Text
                variant="bodySmall"
                color={
                  selected
                    ? theme.colors.text.inverse
                    : theme.colors.text.secondary
                }
              >
                {`${estimateDamage(preset.minutes, streakMultiplier)} ${bossIntensity === 'subtle' ? 'momentum' : 'damage'}`}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}
