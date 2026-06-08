import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GlassScreen } from '../../components/glass/GlassScreen';
import { buildFocusModeCards } from '../../features/session-start/service';
import { useStreakSummary } from '../../features/streaks/hooks';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { useAuthStore } from '../../store';
import {
  FocusModeCardView,
  type ModeVisual,
} from './components/FocusModeCardView';
import { FocusScreenHeader } from './components/FocusScreenHeader';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

function visualForMode(id: string): ModeVisual {
  if (id === 'sprint-15') {return { color: 'mint', iconName: 'bolt', iconColor: '#0C765F' };}
  if (id === 'light-focus') {return { color: 'teal', iconName: 'leaf', iconColor: '#0C765F' };}
  if (id === 'study') {return { color: 'cyan', iconName: 'book', iconColor: '#0E7490' };}
  if (id === 'recovery') {return { color: 'coral', iconName: 'heart', iconColor: '#C2410C' };}
  return { color: 'mint', iconName: 'target', iconColor: '#0C765F' };
}

export function FocusScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
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
    <GlassScreen showAura>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 6 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
        >
          <FocusScreenHeader
            body={statusCopy}
            onSettingsPress={() => navigation.navigate('Settings', { screen: 'SettingsMain' })}
          />
          {modeCards.map((card) => {
            const visual = visualForMode(card.id);
            return (
              <FocusModeCardView
                key={card.id}
                card={card}
                onPress={() => openMode(card)}
                visual={visual}
              />
            );
          })}
        </ScrollView>
      </View>
    </GlassScreen>
  );
}

export default withScreenErrorBoundary(FocusScreen, 'Focus');
