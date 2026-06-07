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
  type ModeOrb,
  type ModeVisual,
} from './components/FocusModeCardView';
import { VexBrandPill } from './components/VexBrandPill';
import { GlassSettingsButton } from './components/GlassSettingsButton';
import { FocusScreenHeader } from './components/FocusScreenHeader';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

function visualForMode(id: string): ModeVisual {
  if (id === 'sprint-15') {return { orb: 'mint', icon: 'bolt', iconColor: '#0C765F' };}
  if (id === 'light-focus') {return { orb: 'mint', icon: 'plus', iconColor: '#0C765F' };}
  if (id === 'study') {return { orb: 'cyan', icon: 'book', iconColor: '#0E7490' };}
  if (id === 'recovery') {return { orb: 'fire', icon: 'heart', iconColor: '#C2410C' };}
  return { orb: 'mint' as ModeOrb, icon: 'target', iconColor: '#0C765F' };
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
    <GlassScreen showAura={false}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 24,
            width: '100%',
            zIndex: 2,
          }}
        >
          <VexBrandPill />
          <GlassSettingsButton
            onPress={() => navigation.navigate('Settings', { screen: 'SettingsMain' })}
          />
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        >
          <FocusScreenHeader statusCopy={statusCopy} />
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
