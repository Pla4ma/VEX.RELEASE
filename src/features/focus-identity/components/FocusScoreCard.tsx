import React, { useMemo } from "react";
import { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useTheme } from "../../../theme";
import {
  useFocusIdentity,
  useFocusScoreColor,
  useIdentityStatement,
} from "../hooks";
import {
  FocusScoreCardSkeleton,
  FocusScoreCardError,
  FocusScoreCardRetrying,
  FocusScoreCardNoUser,
} from "./FocusScoreCardStates";
import { FocusScoreCardContent } from "./FocusScoreCardContent";

interface FocusScoreCardProps {
  userId: string;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
  showTrend?: boolean;
  animate?: boolean;
}

export function FocusScoreCard({
  userId,
  onPress,
  size = "medium",
  showTrend = true,
  animate = true,
}: FocusScoreCardProps) {
  const { theme } = useTheme();
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
      progress.value = withTiming(scoreProgress, { duration: 1000 });
    }
  }, [profile, animate, scoreProgress, progress]);
  const handlePress = () => {
    if (onPress) {
      scale.value = withSpring(0.95, {}, () => {
        scale.value = withSpring(1);
      });
      onPress();
    }
  };
  if (loadingState === "pending") {
    return (
      <FocusScoreCardSkeleton
        size={size}
        borderColor={theme.colors.border.DEFAULT}
      />
    );
  }
  if (loadingState === "error" && !profile) {
    return (
      <FocusScoreCardError
        size={size}
        error={error}
        isRetrying={isRetrying}
        retry={retry}
        primaryColor={theme.colors.primary[500]}
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
      successColor={theme.colors.success.DEFAULT}
      errorColor={theme.colors.error.DEFAULT}
    />
  );
}
