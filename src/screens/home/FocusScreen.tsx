import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppScreen, Button, Card, Text } from '../../components/primitives';
import { buildFocusModeCards } from '../../features/session-start/service';
import { useStreakSummary } from '../../features/streaks/hooks';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';
import type { FocusModeCard } from '../../features/session-start/schemas';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

export function FocusScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const streakQuery = useStreakSummary(userId || null);
  const streakDays = streakQuery.data?.currentDays ?? 0;
  const modeCards = useMemo(
    () => buildFocusModeCards({ streakDays }),
    [streakDays],
  );
  const statusCopy = streakQuery.isPending
    ? 'Loading the best focus entry points for today.'
    : streakDays > 0
      ? `Day ${streakDays} is active. Pick the mode that matches your actual energy.`
      : 'Start with one short mode. VEX will build the next layer from real progress.';

  const openMode = (card: FocusModeCard): void => {
    navigation.navigate({
      name: 'SessionStack',
      params: {
        screen: 'SessionSetup',
        params: {
          presetDuration: card.durationSeconds,
          presetMode: card.mode,
          sessionCategory: card.id,
        },
      },
    });
  };

  return (
    <AppScreen contentStyle={{ gap: theme.spacing[4] }}>
      <View style={{ gap: theme.spacing[1], marginBottom: theme.spacing[2] }}>
        <Text color="primary.300" variant="label">
          Focus modes
        </Text>
        <Text color="text.primary" variant="h1">
          Choose the shape of this block
        </Text>
        <Text color="text.secondary" variant="body">
          {statusCopy}
        </Text>
      </View>

      {modeCards.map((card) => (
        <Card
          key={card.id}
          size="lg"
          variant={card.id === 'sprint-15' ? 'premium' : 'default'}
        >
          <View
            style={{
              alignItems: 'flex-start',
              flexDirection: 'row',
              gap: theme.spacing[3],
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, gap: theme.spacing[1] }}>
              <Text color="text.primary" variant="h3">
                {card.title}
              </Text>
              <Text color="text.secondary" variant="bodySmall">
                {card.body}
              </Text>
            </View>
            <Text color="primary.300" variant="label">
              {formatMinutes(card.durationSeconds)}
            </Text>
          </View>
          <Button
            accessibilityHint={card.accessibilityHint}
            accessibilityLabel={card.accessibilityLabel}
            fullWidth
            mt="md"
            onPress={() => openMode(card)}
            size="md"
            variant={card.id === 'sprint-15' ? 'primary' : 'outline'}
          >
            {card.ctaLabel}
          </Button>
        </Card>
      ))}
    </AppScreen>
  );
}

export default withScreenErrorBoundary(FocusScreen, 'Focus');
