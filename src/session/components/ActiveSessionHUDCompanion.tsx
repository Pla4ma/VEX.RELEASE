import React, { useEffect, useState } from 'react';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';
import { LivingCompanion } from '@/features/companion/components/LivingCompanion';
import { getCompanionService } from '@/features/companion/service';
import type { CompanionState } from '@/features/companion/types';
import { createDebugger } from '@/utils/debug';
import { lightColors } from '@/theme/tokens/colors';

const debug = createDebugger('ActiveSessionHUDCompanion');

interface ActiveSessionHUDCompanionProps {
  userId: string;
  completionPercentage: number;
  purityScore: number;
  elapsedSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  isActive: boolean;
}

export const ActiveSessionHUDCompanion: React.FC<
  ActiveSessionHUDCompanionProps
> = ({
  userId,
  completionPercentage,
  purityScore,
  elapsedSeconds,
  totalSeconds,
  isPaused,
  isActive,
}) => {
  const [companionState, setCompanionState] = useState<CompanionState | null>(
    null,
  );
  const companionService = getCompanionService();

  useEffect(() => {
    if (!userId) {
      return;
    }
    const loadCompanionState = async () => {
      try {
        const state = companionService.getState();
        setCompanionState(state);
      } catch (companionError) {
        debug.error('Failed to load companion state:', companionError);
      }
    };
    loadCompanionState();
  }, [userId, companionService]);

  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    if (isActive && !isPaused) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      pulseAnim.value = withTiming(1, { duration: 120 });
    }
  }, [isActive, isPaused, pulseAnim]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  if (!companionState) {
    return null;
  }

  return (
    <Animated.View style={[styles.companionContainer, pulseStyle]}>
      <LivingCompanion
        companionState={companionState}
        sessionProgress={completionPercentage}
        purityScore={purityScore || 75}
        elapsedSeconds={elapsedSeconds}
        totalSeconds={totalSeconds}
        isPaused={isPaused}
      />
    </Animated.View>
  );
};

const styles = createSheet({
  companionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    minHeight: 200,
    backgroundColor: lightColors.semantic.background,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.3)',
    elevation: 8,
  },
});
