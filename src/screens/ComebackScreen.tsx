import { withScreenErrorBoundary } from '../shared/ui/components/ScreenErrorBoundary';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '../components/primitives/Box';
import type { ExtendedRootStackParams } from '../navigation/types';
import { useSessionUIStore } from '../store/session-state';
import { useTheme } from '../theme/ThemeContext';
import { Particle } from './ComebackParticles';
import { capture } from '../shared/analytics/analytics-service';
import { ComebackCard } from './ComebackCard';

type ComebackNavigationProp = NativeStackNavigationProp<
  ExtendedRootStackParams,
  'Comeback'
>;
type ComebackRoute = RouteProp<ExtendedRootStackParams, 'Comeback'>;

const PARTICLE_COUNT = 20;

export function ComebackScreen(): React.ReactNode {
  const navigation = useNavigation<ComebackNavigationProp>();
  const route = useRoute<ComebackRoute>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dismissComeback = useSessionUIStore((state) => state.dismissComeback);
  const comebackState = route.params.comebackState;

  useEffect(() => {
    capture('comeback_offer_viewed', {
      days_absent: comebackState.daysAbsent,
      reward_multiplier: comebackState.rewardMultiplier,
      streak_before: comebackState.streakBefore,
      streak_restore_eligible: comebackState.streakRestoreEligible,
    });
  }, [comebackState]);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
        index,
        left: 12 + ((index * 17) % 320),
        size: 4 + (index % 5),
        duration: 5500 + index * 220,
        delay: index * 0.45,
      })),
    [],
  );

  const closePrompt = () => {
    dismissComeback();
    navigation.goBack();
  };

  const startComeback = () => {
    capture('comeback_offer_accepted', {
      days_absent: comebackState.daysAbsent,
      reward_multiplier: comebackState.rewardMultiplier,
      streak_restore: comebackState.streakRestoreEligible,
    });
    dismissComeback();
    navigation.replace('SessionStack', {
      screen: 'SessionSetup',
      params: {
        comebackMultiplier: comebackState.rewardMultiplier,
        comebackMessage: comebackState.message,
        comebackQuest: comebackState.streakRestoreEligible
          ? { streakBefore: comebackState.streakBefore, requiredSessions: 3 }
          : null,
      },
    });
  };

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <Box
        style={{
          ...StyleSheet.absoluteFill,
          backgroundColor: theme.colors.background.primary,
        }}
      >
        {particles.map((particle) => (
          <Particle
            key={particle.index}
            color={theme.colors.primary[300]}
            {...particle}
          />
        ))}
      </Box>

      <Box
        flex={1}
        justifyContent="center"
        px="lg"
        py="xl"
        style={{
          paddingTop: insets.top + theme.spacing[6],
          paddingBottom: insets.bottom + theme.spacing[6],
        }}
      >
        <ComebackCard
          comebackState={comebackState}
          onStart={startComeback}
          onClose={closePrompt}
        />
      </Box>
    </Box>
  );
}

export default withScreenErrorBoundary(ComebackScreen, 'Comeback');
