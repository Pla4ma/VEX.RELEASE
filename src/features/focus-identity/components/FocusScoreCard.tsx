import React, { useMemo } from 'react';
import { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import {
  useFocusIdentity,
  useFocusScoreColor,
  useIdentityStatement,
} from '../hooks';
import {
  FocusScoreCardSkeleton,
  FocusScoreCardError,
  FocusScoreCardRetrying,
  FocusScoreCardNoUser,
} from './FocusScoreCardStates';
import { FocusScoreCardContent } from './FocusScoreCardContent';

interface FocusScoreCardProps {
  userId: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showTrend?: boolean;
  animate?: boolean;
}

export function FocusScoreCard({
  userId,
  onPress,
  size = 'medium',
  showTrend = true,
  animate = true,
}: FocusScoreCardProps) {
  const {
    profile,
    loadingState,
    error,
    isRetrying,
    retry,
    currentBand,
    scoreChange,
  } = useFocusIdentity(userId);
  const scoreColor = useFocusScoreColor(profile?.currentScore || null);
  const { isReducedMotion } = useReducedMotion();
  const identityStatement = useIdentityStatement(
    currentBand,
    profile?.streakInCurrentBand || 0,
  );
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const scoreProgress = useMemo(() => {
    if (!profile) {
      return 0;
    }
    return (profile.currentScore - 300) / (850 - 300);
  }, [profile]);
  React.useEffect(() => {
    if (animate && profile) {
      progress.value = isReducedMotion
        ? scoreProgress
        : withTiming(scoreProgress, { duration: 1000 });
    }
  }, [profile, animate, scoreProgress, progress, isReducedMotion]);
  const handlePress = () => {
    if (onPress) {
      if (!isReducedMotion) {
        scale.value = withSpring(0.95, {}, () => {
          scale.value = withSpring(1);
        });
      }
      onPress();
    }
  };
  if (loadingState === 'pending') {
    return (
      <FocusScoreCardSkeleton
        size={size}
        borderColor="rgba(16, 35, 31, 0.15)"
      />
    );
  }
  if (loadingState === 'error' && !profile) {
    return (
      <FocusScoreCardError
        size={size}
        error={error}
        isRetrying={isRetrying}
        retry={retry}
        primaryColor={vexLightGlass.mint[500]}
      />
    );
  }
  if (isRetrying) {
    return <FocusScoreCardRetrying size={size} />;
  }
  if (!userId) {
    return <FocusScoreCardNoUser size={size} />;
  }
  return (
    <FocusScoreCardContent
      size={size}
      handlePress={handlePress}
      onPress={onPress}
      animatedStyles={animatedStyles}
      scoreColor={scoreColor}
      currentScore={profile?.currentScore || 0}
      currentBand={currentBand}
      scoreChange={scoreChange}
      showTrend={showTrend}
      identityStatement={identityStatement}
      scoreProgress={scoreProgress}
      percentileRank={profile?.percentileRank ?? null}
      isInRecovery={Boolean(profile?.isInRecovery)}
      successColor={vexLightGlass.semantic.success}
      errorColor={vexLightGlass.semantic.danger}
    />
  );
}
