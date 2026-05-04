/**
 * Optimal Break Intervention Component
 *
 * Displays when AI detects optimal time for a break based on focus patterns.
 * Predicts fatigue before user realizes.
 *
 * @phase 1
 */

import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme';
import { Card, Text, Button, VStack, HStack } from '../../../components/primitives';
import { Icon } from '../../../components/Icon';
import { createDebugger } from '../../../utils/debug';
import type { OptimalBreakInput } from '../intervention-service';

const debug = createDebugger('ai-coach:optimal-break-ui');

// ============================================================================
// Types
// ============================================================================

export interface OptimalBreakInterventionProps {
  input: OptimalBreakInput;
  recommendedDuration: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  onTakeBreak: (duration: number) => Promise<void>;
  onExtend: (minutes: number) => void;
  onSkip: () => void;
  onEndSession: () => Promise<void>;
}

type ActionState = 'idle' | 'taking' | 'ending';

// ============================================================================
// Component
// ============================================================================

export const OptimalBreakIntervention: React.FC<OptimalBreakInterventionProps> = ({
  input,
  recommendedDuration,
  confidence,
  onTakeBreak,
  onExtend,
  onSkip,
  onEndSession,
}) => {
  const theme = useTheme();
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [error, setError] = useState<string | null>(null);

  const { sessionDuration, focusPattern } = input;

  const getConfidenceColor = (): string => {
    switch (confidence) {
      case 'HIGH':
        return theme.colors.success.DEFAULT;
      case 'MEDIUM':
        return theme.colors.info.DEFAULT;
      case 'LOW':
        return theme.colors.warning.DEFAULT;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getConfidenceIcon = (): string => {
    switch (confidence) {
      case 'HIGH':
        return 'check-circle';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'alert-triangle';
      default:
        return 'clock';
    }
  };

  const getFocusPatternText = (): string => {
    switch (focusPattern) {
      case 'DEEP':
        return "You've been in deep focus";
      case 'MODERATE':
        return "Your focus has been steady";
      case 'FRAGMENTED':
        return "Your focus has been fragmented";
      default:
        return "Your focus patterns suggest";
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleTakeBreak = useCallback(async () => {
    try {
      setActionState('taking');
      setError(null);
      await onTakeBreak(recommendedDuration);
      debug.info('Break taken', { duration: recommendedDuration });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start break';
      setError(message);
      debug.error('Take break failed:', err);
    } finally {
      setActionState('idle');
    }
  }, [onTakeBreak, recommendedDuration]);

  const handleEndSession = useCallback(async () => {
    try {
      setActionState('ending');
      setError(null);
      await onEndSession();
      debug.info('Session ended');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end session';
      setError(message);
      debug.error('End session failed:', err);
    } finally {
      setActionState('idle');
    }
  }, [onEndSession]);

  const isLoading = actionState !== 'idle';
  const confidenceColor = getConfidenceColor();
  const confidenceIcon = getConfidenceIcon();

  return (
    <Card
      variant="elevated"
      padding="lg"
      background="card"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: confidenceColor,
      }}
    >
      <VStack gap="md">
        {/* Header */}
        <HStack gap="sm" align="center">
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: theme.radius.full,
              backgroundColor: `${confidenceColor}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={confidenceIcon} size={24} color={confidenceColor} />
          </View>
          <VStack gap="xs" flex={1}>
            <Text variant="heading" size="sm">
              Time for a Break?
            </Text>
            <Text variant="caption" color="secondary">
              {confidence} confidence • {formatDuration(sessionDuration)} in session
            </Text>
          </VStack>
          <TouchableOpacity onPress={onSkip} disabled={isLoading}>
            <Icon
              name="x"
              size={20}
              color={isLoading ? theme.colors.text.disabled : theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </HStack>

        {/* Message */}
        <Text variant="body" color="primary">
          {getFocusPatternText()}, and you're approaching {formatDuration(
            recommendedDuration
          )} of continuous work. A {formatDuration(recommendedDuration)} break now could help you return stronger.
        </Text>

        {/* Stats */}
        <View
          style={{
            backgroundColor: theme.colors.background.secondary,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
          }}
        >
          <HStack justify="space-between">
            <VStack align="center">
              <Text variant="caption" color="secondary">
                Session Time
              </Text>
              <Text variant="body" weight="semibold">
                {formatDuration(sessionDuration)}
              </Text>
            </VStack>
            <VStack align="center">
              <Text variant="caption" color="secondary">
                Recommended
              </Text>
              <Text variant="body" weight="semibold" color="primary">
                {formatDuration(recommendedDuration)}
              </Text>
            </VStack>
            <VStack align="center">
              <Text variant="caption" color="secondary">
                Pattern
              </Text>
              <Text variant="body" weight="semibold">
                {focusPattern.toLowerCase().replace('_', ' ')}
              </Text>
            </VStack>
          </HStack>
        </View>

        {/* Error State */}
        {error && (
          <View
            style={{
              backgroundColor: theme.colors.error.light,
              padding: theme.spacing.sm,
              borderRadius: theme.radius.sm,
            }}
          >
            <Text variant="caption" color="error">
              {error}
            </Text>
          </View>
        )}

        {/* Actions */}
        <VStack gap="sm">
          <Button
            variant="primary"
            onPress={handleTakeBreak}
            disabled={isLoading}
            loading={actionState === 'taking'}
            size="sm"
            leftIcon={<Icon name="coffee" size={16} color={theme.colors.text.inverse} />}
          >
            Take {formatDuration(recommendedDuration)} Break
          </Button>

          <HStack gap="sm">
            <Button
              variant="secondary"
              onPress={() => onExtend(5)}
              disabled={isLoading}
              size="sm"
              flex={1}
            >
              5 More Minutes
            </Button>
            <Button
              variant="secondary"
              onPress={() => onExtend(10)}
              disabled={isLoading}
              size="sm"
              flex={1}
            >
              10 More Minutes
            </Button>
          </HStack>

          <Button
            variant="ghost"
            onPress={handleEndSession}
            disabled={isLoading}
            loading={actionState === 'ending'}
            size="sm"
          >
            End Session
          </Button>

          <Button
            variant="ghost"
            onPress={onSkip}
            disabled={isLoading}
            size="sm"
          >
            Skip Break
          </Button>
        </VStack>
      </VStack>
    </Card>
  );
};

// ============================================================================
// Loading State
// ============================================================================

export const OptimalBreakInterventionSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Card variant="elevated" padding="lg">
      <VStack gap="md">
        <HStack gap="sm" align="center">
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              backgroundColor: theme.colors.background.secondary,
            }}
          />
          <View
            style={{
              height: 20,
              width: 120,
              backgroundColor: theme.colors.background.secondary,
              borderRadius: 4,
            }}
          />
        </HStack>
        <View
          style={{
            height: 60,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: 4,
          }}
        />
        <View
          style={{
            height: 40,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: 4,
          }}
        />
      </VStack>
    </Card>
  );
};
