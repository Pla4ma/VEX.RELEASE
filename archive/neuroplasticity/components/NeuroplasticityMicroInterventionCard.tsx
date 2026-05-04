/**
 * Neuroplasticity Micro Intervention Card
 *
 * Offers a 30-second cognitive micro-exercise during session completion.
 * Part of the Neuroplasticity Trainer system.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { useNeuroplasticity } from '../hooks';
import { haptics } from '../../../shared/feedback';

interface NeuroplasticityMicroInterventionCardProps {
  userId: string;
  sessionDurationSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
}

const INTERVENTION_DURATION = 30; // seconds

export const NeuroplasticityMicroInterventionCard: React.FC<NeuroplasticityMicroInterventionCardProps> = ({
  userId,
  sessionDurationSeconds,
  onComplete,
  onSkip,
}) => {
  const { theme } = useTheme();
  const npt = useNeuroplasticity(userId);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(INTERVENTION_DURATION);
  const [intervention, setIntervention] = useState<{
    domain: string;
    instruction: string;
    emoji: string;
  } | null>(null);

  const progress = useSharedValue(0);

  // Generate intervention on mount
  useEffect(() => {
    if (npt.profile?.recommendedDomain) {
      const domain = npt.profile.recommendedDomain;
      const interventions: Record<string, { instruction: string; emoji: string }> = {
        SUSTAINED_ATTENTION: {
          instruction: 'Focus on a single point for 30 seconds. If your mind wanders, gently bring it back.',
          emoji: '🎯',
        },
        WORKING_MEMORY: {
          instruction: 'Count backwards from 100 by 7s. 100, 93, 86... Keep going.',
          emoji: '🧮',
        },
        COGNITIVE_FLEXIBILITY: {
          instruction: 'Name 10 objects that are blue. Switch to red if you get stuck.',
          emoji: '🎨',
        },
        INHIBITORY_CONTROL: {
          instruction: 'Do NOT think of a white bear. Every time you do, gently refocus.',
          emoji: '🐻',
        },
        PROCESSING_SPEED: {
          instruction: 'Tap your left hand then right hand as fast as you can, alternating.',
          emoji: '👏',
        },
      };

      const interventionData = interventions[domain] || interventions.SUSTAINED_ATTENTION;
      setIntervention({
        domain: domain.replace(/_/g, ' '),
        ...interventionData,
      });
    }
  }, [npt.profile]);

  // Timer effect
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeRemaining]);

  // Progress animation
  useEffect(() => {
    if (isActive) {
      progress.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      progress.value = 0;
    }
  }, [isActive]);

  const handleStart = useCallback(() => {
    setIsActive(true);
    haptics.impact('medium');
  }, []);

  const handleComplete = useCallback(() => {
    setIsActive(false);
    haptics.success('light');
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    setIsActive(false);
    onSkip();
  }, [onSkip]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 360}deg` }],
  }));

  // Don't show if session was less than 10 minutes
  if (sessionDurationSeconds < 600) {
    return null;
  }

  if (!intervention) {
    return null;
  }

  return (
    <Box
      style={{
        backgroundColor: theme.colors.background.elevated,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing[4],
        marginHorizontal: theme.spacing[4],
        marginTop: theme.spacing[4],
        borderWidth: 2,
        borderColor: theme.colors.primary[200],
      }}
    >
      {/* Header */}
      <Box flexDirection="row" alignItems="center" mb={theme.spacing[3]}>
        <Text style={{ fontSize: 32, marginRight: theme.spacing[2] }}>
          {intervention.emoji}
        </Text>
        <Box flex={1}>
          <Text variant="h4" color="primary.600">
            🧠 {intervention.domain} Training
          </Text>
          <Text variant="caption" color="text.tertiary">
            30-second micro-exercise
          </Text>
        </Box>
      </Box>

      {/* Instruction */}
      <Text variant="body" color="text.primary" style={{ marginBottom: theme.spacing[4] }}>
        {intervention.instruction}
      </Text>

      {/* Timer / Action Area */}
      {!isActive ? (
        <Pressable
          onPress={handleStart}
          style={{
            backgroundColor: theme.colors.primary[500],
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing[3],
            alignItems: 'center',
          }}
        >
          <Text variant="h4" color="#FFFFFF">
            Start 30-Second Training
          </Text>
        </Pressable>
      ) : (
        <Box alignItems="center">
          {/* Circular Timer */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: theme.colors.primary[100],
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: theme.spacing[3],
            }}
          >
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 4,
                  borderColor: theme.colors.primary[500],
                  borderTopColor: 'transparent',
                },
                animatedCircleStyle,
              ]}
            />
            <Text variant="h2" color="primary.600">
              {timeRemaining}s
            </Text>
          </View>

          <Text variant="caption" color="text.secondary">
            Keep going...
          </Text>
        </Box>
      )}

      {/* Skip Link */}
      <Pressable
        onPress={handleSkip}
        style={{ alignSelf: 'center', marginTop: theme.spacing[3], padding: theme.spacing[2] }}
      >
        <Text variant="caption" color="text.tertiary" style={{ textDecorationLine: 'underline' }}>
          Skip training
        </Text>
      </Pressable>
    </Box>
  );
};

export default NeuroplasticityMicroInterventionCard;
