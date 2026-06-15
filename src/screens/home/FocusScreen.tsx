import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Text } from '../../components/primitives/Text';
import { GlassScreen } from '../../components/glass/GlassScreen';
import { FocusScoreHomeWidget } from '../../features/focus-identity/components/focus-score-home-widget';
import { useFocusScoreDashboardModel } from '../../features/focus-identity/hooks-focus-score';
import { buildFocusModeCards } from '../../features/session-start/service';
import { useStreakSummary } from '../../features/streaks/hooks';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { useAuthStore } from '../../store';
import { FocusModeCardView } from './components/FocusModeCardView';
import { ReferenceHeader } from '../reference-ui/ReferenceHeader';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

export function FocusScreen(): React.ReactNode {
  const navigation = useNavigation<NavigationProp>();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const streakQuery = useStreakSummary(userId || null);
  const streakDays = streakQuery.data?.currentDays ?? 0;
  const focusScoreModel = useFocusScoreDashboardModel(userId || null);
  const modeCards = useMemo(
    () => buildFocusModeCards({ streakDays }),
    [streakDays],
  );
  const statusCopy = streakQuery.isPending
    ? 'Loading the best focus entry points for today.'
    : streakDays > 0
      ? `Day ${streakDays} is active. Pick the mode that matches your actual energy.`
      : 'Start with one short mode. VEX will build the next layer from real progress.';

  const openMode = (card: { id: string; durationSeconds: number; mode: string }): void => {
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
    <GlassScreen showAura variant="focus">
      <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 2 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 184 }}
          showsVerticalScrollIndicator={false}
        >
          <ReferenceHeader
            eyebrow="FOCUS"
            title="Focus modes"
            body={statusCopy}
            onAction={() => navigation.navigate('Settings', { screen: 'SettingsMain' })}
          />
          <View style={{ marginBottom: 18 }}>
            <FocusScoreHomeWidget
              model={focusScoreModel}
              onPress={() => navigation.navigate('FocusScoreDashboard')}
              onRetry={() => focusScoreModel.refetch()}
            />
          </View>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
              fontWeight: '800',
              letterSpacing: 0.3,
              marginBottom: 10,
            }}
          >
            Choose your mode
          </Text>
          {modeCards.map((card) => (
            <FocusModeCardView
              key={card.id}
              card={card}
              onPress={() => openMode(card)}
            />
          ))}
        </ScrollView>
      </View>
    </GlassScreen>
  );
}

export default withScreenErrorBoundary(FocusScreen, 'Focus');
